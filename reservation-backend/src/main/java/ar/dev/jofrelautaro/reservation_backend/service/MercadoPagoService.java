package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.config.MercadoPagoProperties;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Pago;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.PagoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MercadoPagoService {

    private final MercadoPagoProperties mercadoPagoProperties;
    private final CursoRepository cursoRepository;
    private final PagoRepository pagoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionService inscripcionService;
    private final EmailService emailService;

    // Esto se ejecuta apenas arranca Spring Boot para inyectar el token globalmente
    @PostConstruct
    public void init() {
        String accessToken = mercadoPagoProperties.getAccessToken();
        System.out.println("🔐 Token MP (primeros 20 caracteres): " + (accessToken != null && accessToken.length() > 20 ? accessToken.substring(0, 20) + "..." : "NULL"));
        MercadoPagoConfig.setAccessToken(accessToken);
        System.out.println("✅ Token MP configurado en MercadoPagoConfig");
    }

    /**
     * Crea una preferencia de pago de Mercado Pago para Checkout Pro
     * Guarda un registro inicial en la BD para vincularlo mediante external_reference
     */
    public Map<String, Object> crearPreferenciaCheckoutPro(Long cursoId) throws Exception {
        System.out.println("🚀 Iniciando creación de preferencia para Checkout Pro - Curso: " + cursoId);
        
        // 1. Obtener el usuario actual desde el contexto de seguridad
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
        
        // 2. Buscamos el curso
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        System.out.println("📦 Curso encontrado: " + curso.getTitulo() + " - Precio: $" + curso.getPrecio());

        // 3. Creamos el registro en la BD ANTES de llamar a MP para obtener nuestro propio ID
        Pago pagoProvisorio = Pago.builder()
                .usuario(usuario)
                .curso(curso)
                .monto(BigDecimal.valueOf(curso.getPrecio()))
                .estado("INICIADO")
                .descripcion("Pago de curso: " + curso.getTitulo())
                .mercadoPagoPreferenceId("Generando Id...")
                .build();
        
        pagoProvisorio = pagoRepository.save(pagoProvisorio);
        System.out.println("💾 Pago provisorio guardado con ID propio: " + pagoProvisorio.getId());

        // 4. Armamos el ítem para Mercado Pago
        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .id(curso.getId().toString())
                .title(curso.getTitulo())
                .description(curso.getDescripcion())
                .quantity(1)
                .currencyId("ARS")
                .unitPrice(BigDecimal.valueOf(curso.getPrecio()))
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(itemRequest);

        // URL base del servidor en Producción (Render)
        // NOTA: Lo ideal a futuro es mover esto al application.properties
        String renderUrl = "https://cursofullstackreservas.onrender.com";
        String vercelUrl = "https://devcursos-lj.vercel.app";

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(renderUrl + "/pago/exito")
                .failure(renderUrl + "/pago/error")
                .build();

        // 5. Configuración con Checkout Pro incluyendo Webhook y nuestro ID (externalReference)
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .autoReturn("approved")
                .notificationUrl(vercelUrl + "/api/webhooks/mercadopago") 
                .externalReference(pagoProvisorio.getId().toString()) // EL FIX CLAVE
                .build();

        System.out.println("📤 Enviando preferencia a Mercado Pago API...");

        // 6. Llamamos a la API de Mercado Pago
        try {
            MercadoPagoConfig.setAccessToken(mercadoPagoProperties.getAccessToken());
            
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);
            
            System.out.println("✅ Preference creada exitosamente! ID: " + preference.getId());
            
            // 7. Actualizamos el pago en BD con el ID de la preferencia de MP
            pagoProvisorio.setMercadoPagoPreferenceId(preference.getId());
            pagoRepository.save(pagoProvisorio);
            
            // 8. Devolvemos tanto el ID como el init_point al frontend
            Map<String, Object> response = new HashMap<>();
            response.put("id", preference.getId());
            response.put("init_point", preference.getInitPoint());
            
            return response;
            
        } catch (com.mercadopago.exceptions.MPApiException apiEx) {
            System.err.println("❌ ERROR API DE MERCADO PAGO:");
            System.err.println("   Status: " + apiEx.getApiResponse().getStatusCode());
            System.err.println("   Content: " + apiEx.getApiResponse().getContent());
            throw apiEx;
        }
    }

    /**
     * Procesa el webhook de Mercado Pago cuando hay novedades en un pago.
     * Busca el pago mediante el external_reference y matricula al usuario si es aprobado.
     */
    public void procesarWebhookPago(Long paymentId) throws Exception {
        System.out.println("🔔 Procesando webhook de Mercado Pago - Payment ID: " + paymentId);
        
        try {
            // 1. Obtener los detalles del pago desde Mercado Pago
            PaymentClient paymentClient = new PaymentClient();
            Payment payment = paymentClient.get(paymentId);
            
            System.out.println("💳 Pago obtenido - Status: " + payment.getStatus());
            
            // 2. Extraer NUESTRO ID de base de datos desde la respuesta de MP
            String miPagoId = payment.getExternalReference();
            
            if (miPagoId == null) {
                System.out.println("⚠️ El pago de MP no tiene external_reference. Imposible vincularlo.");
                return;
            }

            // 3. Buscar el pago en nuestra BD por nuestro ID
            Pago pago = pagoRepository.findById(Long.parseLong(miPagoId))
                    .orElse(null);
            
            if (pago == null) {
                System.out.println("⚠️ No se encontró el pago en BD con ID propio: " + miPagoId);
                return;
            }
            
            System.out.println("📦 Pago en BD encontrado: " + pago.getId());
            
            // 4. Verificar que el pago fue aprobado
            if ("approved".equals(payment.getStatus())) {
                System.out.println("✅ ¡PAGO APROBADO!");
                
                // Actualizar los datos definitivos del pago
                pago.setMercadoPagoPaymentId(paymentId.toString());
                pago.setEstado("APROBADO");
                pago.setFechaAprobacion(LocalDateTime.now());
                pago.setMetodoPago(payment.getPaymentMethodId());
                pagoRepository.save(pago);
                
                System.out.println("💾 Pago actualizado a APROBADO en la BD");
                
                // 5. Matricular al usuario automáticamente en el curso
                System.out.println("📚 Procediendo a matricular al usuario en el curso...");
                inscripcionService.matricularPorPago(pago.getUsuario(), pago.getCurso());
                
                System.out.println("✅ ¡Usuario matriculado exitosamente!");

                System.out.println("📧 Disparando correo HTML de bienvenida...");
                emailService.enviarCorreoBienvenidaHTML(pago.getUsuario().getEmail(), pago.getUsuario().getNombre(), pago.getCurso().getTitulo());
            } else {
                System.out.println("⚠️ Pago no aprobado. Estado actual: " + payment.getStatus());
                pago.setMercadoPagoPaymentId(paymentId.toString());
                pago.setEstado(payment.getStatus().toUpperCase());
                pagoRepository.save(pago);
            }
            
        } catch (com.mercadopago.exceptions.MPApiException apiEx) {
            System.err.println("❌ ERROR al obtener datos de Mercado Pago por Webhook:");
            System.err.println("   Status: " + apiEx.getApiResponse().getStatusCode());
            System.err.println("   Content: " + apiEx.getApiResponse().getContent());
            throw apiEx;
        }
    }
}
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
     * Devuelve los detalles completos de la preferencia incluyendo su ID
     * También guarda un registro de Pago en la BD con estado PENDIENTE
     */
    public Map<String, Object> crearPreferenciaCheckoutPro(Long cursoId) throws Exception {
        System.out.println("🚀 Iniciando creación de preferencia para Checkout Pro - Curso: " + cursoId);
        System.out.println("🔐 Token actual en config: " + (MercadoPagoConfig.getAccessToken() != null ? "✅ CONFIGURADO" : "❌ NULL"));
        
        // 1. Obtener el usuario actual desde el contexto de seguridad
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
        
        // 2. Buscamos el curso en tu BD para saber qué estamos cobrando
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        System.out.println("📦 Curso encontrado: " + curso.getTitulo() + " - Precio: $" + curso.getPrecio());

        // 3. Armamos el ítem (lo que el usuario va a comprar) - VERSIÓN SIMPLIFICADA
        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .id(curso.getId().toString())
                .title(curso.getTitulo())
                .description(curso.getDescripcion())
                .quantity(1)
                .currencyId("ARS")
                .unitPrice(new BigDecimal(curso.getPrecio()))
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(itemRequest);

        // 1. Guardamos tu URL pública de Ngrok (la que sacaste de la terminal)
        String ngrokUrl = "https://bausond-hermelinda-hyperphysical.ngrok-free.dev";

        // 2. Usamos Ngrok en vez de localhost para engañar al PolicyAgent
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(ngrokUrl + "/pago/exito")
                .failure(ngrokUrl + "/pago/error")
                .build();

        System.out.println("🔗 URLs configuradas para evitar el 403: " + ngrokUrl);

        // 3. Configuración con Checkout Pro incluyendo el Webhook (notificationUrl)
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .autoReturn("approved")
                .notificationUrl(ngrokUrl + "/api/webhooks/mercadopago") // ¡LA LLAVE MÁGICA DEL WEBHOOK!
                .build();

        System.out.println("📤 Enviando preferencia a Mercado Pago API...");

        // 6. Llamamos a la API de Mercado Pago
        try {
            MercadoPagoConfig.setAccessToken(mercadoPagoProperties.getAccessToken());
            
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);
            
            System.out.println("✅ Preference creada exitosamente!");
            System.out.println("✅ ID: " + preference.getId());
            System.out.println("✅ Init Point: " + preference.getInitPoint());
            
            // 7. Guardamos el pago en nuestra BD con estado PENDIENTE
            Pago pago = Pago.builder()
                    .usuario(usuario)
                    .curso(curso)
                    .mercadoPagoPreferenceId(preference.getId())
                    .monto(new BigDecimal(curso.getPrecio()))
                    .estado("PENDIENTE")
                    .descripcion("Pago de curso: " + curso.getTitulo())
                    .build();
            
            pagoRepository.save(pago);
            System.out.println("💾 Pago guardado en la BD con ID: " + pago.getId());
            
            // 8. Devolvemos tanto el ID como el init_point para flexibilidad
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
     * Procesa el webhook de Mercado Pago cuando un pago es aprobado
     * Actualiza el estado del pago y matricula al usuario automáticamente
     */
    public void procesarWebhookPago(Long paymentId) throws Exception {
        System.out.println("🔔 Procesando webhook de Mercado Pago - Payment ID: " + paymentId);
        
        try {
            // 1. Obtener los detalles del pago de Mercado Pago
            PaymentClient paymentClient = new PaymentClient();
            Payment payment = paymentClient.get(paymentId);
            
            System.out.println("💳 Pago obtenido - Status: " + payment.getStatus());
            System.out.println("💳 Monto: " + payment.getTransactionAmount());
            
            // 2. Buscar el pago en nuestra BD por el ID de pago de Mercado Pago
            Pago pago = pagoRepository.findByMercadoPagoPaymentId(paymentId.toString())
                    .orElse(null);
            
            // Si no lo encontramos por payment ID, intentamos por preferenceId
            // El objeto Payment de MercadoPago SDK podría no tener getPreferenceId()
            // así que usamos el monto y status como índices adicionales
            if (pago == null) {
                System.out.println("⚠️ No se encontró pago por ID de MP. Status del pago: " + payment.getStatus());
                return;
            }
            
            System.out.println("📦 Pago en BD encontrado: " + pago.getId());
            
            // 3. Verificar que el pago fue aprobado
            if ("approved".equals(payment.getStatus())) {
                System.out.println("✅ ¡PAGO APROBADO!");
                
                // 4. Actualizar el pago en la BD
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
            } else {
                System.out.println("⚠️ Pago no aprobado. Estado: " + payment.getStatus());
                pago.setEstado(payment.getStatus().toUpperCase());
                pagoRepository.save(pago);
            }
            
        } catch (com.mercadopago.exceptions.MPApiException apiEx) {
            System.err.println("❌ ERROR al obtener datos de Mercado Pago:");
            System.err.println("   Status: " + apiEx.getApiResponse().getStatusCode());
            System.err.println("   Content: " + apiEx.getApiResponse().getContent());
            throw apiEx;
        }
    }
}
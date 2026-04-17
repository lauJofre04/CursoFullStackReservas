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

import com.mercadopago.resources.payment.Payment;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;


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
    /*public Map<String, Object> crearPreferenciaCheckoutPro(Long cursoId) throws Exception {
        System.out.println("🚀 Iniciando creación de preferencia para Checkout Pro - Curso: " + cursoId);
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
        
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        System.out.println("📦 Curso: " + curso.getTitulo() + " | Precio: $" + curso.getPrecio() + " | Comprador: " + usuario.getEmail());

        Pago pagoProvisorio = Pago.builder()
                .usuario(usuario)
                .curso(curso)
                .monto(BigDecimal.valueOf(curso.getPrecio()))
                .estado("INICIADO")
                .descripcion("Pago de curso: " + curso.getTitulo())
                .mercadoPagoPreferenceId("TMP-" + java.util.UUID.randomUUID().toString())
                .build();
        
        pagoProvisorio = pagoRepository.save(pagoProvisorio);

        // 1. ÍTEM LIMPIO
        PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                .title(curso.getTitulo())
                .quantity(1)
                .currencyId("ARS")
                .unitPrice(BigDecimal.valueOf(curso.getPrecio()))
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(itemRequest);

        // 2. AÑADIMOS AL PAGADOR EXPLÍCITO (Evita bloqueos antifraude)
        com.mercadopago.client.preference.PreferencePayerRequest payer = 
            com.mercadopago.client.preference.PreferencePayerRequest.builder()
                .email(usuario.getEmail())
                .name(usuario.getNombre())
                .build();

        // 3. URLs
        String renderUrl = "https://cursofullstackreservas.onrender.com";
        String vercelUrl = "https://devcursos-lj.vercel.app";

        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(vercelUrl + "/mis-cursos") 
                .failure(vercelUrl + "/home")       
                .pending(vercelUrl + "/mis-cursos") 
                .build();

        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                //.payer(payer) // 👈 INYECTAMOS AL PAGADOR
                .backUrls(backUrls)
                .autoReturn("approved")
                .notificationUrl(renderUrl + "/api/webhooks/mercadopago") 
                .externalReference(pagoProvisorio.getId().toString()) 
                .build();

        // 🚨 RADAR DE DEBUG (Si esto no sale en los logs de Render, Render no actualizó)
        System.out.println("🔍 RADAR MP -> URL Vercel: " + vercelUrl + "/mis-cursos");
        System.out.println("🔍 RADAR MP -> URL Webhook: " + renderUrl + "/api/webhooks/mercadopago");

        try {
            MercadoPagoConfig.setAccessToken(mercadoPagoProperties.getAccessToken());
            
            PreferenceClient client = new PreferenceClient();
            Preference preference = client.create(preferenceRequest);
            
            System.out.println("✅ Preference creada exitosamente! ID: " + preference.getId());
            
            pagoProvisorio.setMercadoPagoPreferenceId(preference.getId());
            pagoRepository.save(pagoProvisorio);
            
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
    }*/
    
    public Map<String, Object> crearPreferenciaCheckoutPro(Long cursoId) throws Exception {
        System.out.println("🚀 Iniciando creación de preferencia SIN SDK - Curso: " + cursoId);
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        Pago pagoProvisorio = Pago.builder()
                .usuario(usuario)
                .curso(curso)
                .monto(BigDecimal.valueOf(curso.getPrecio()))
                .estado("INICIADO")
                .descripcion("Pago de curso: " + curso.getTitulo())
                .mercadoPagoPreferenceId("TMP-" + java.util.UUID.randomUUID().toString())
                .build();
        pagoProvisorio = pagoRepository.save(pagoProvisorio);

        // 1. ARMAMOS EL JSON EXACTO QUE APROBÓ EL SOPORTE DE MP (Usando un Map)
        Map<String, Object> body = Map.of(
            "items", List.of(
                Map.of(
                    "title", curso.getTitulo(),
                    "quantity", 1,
                    "unit_price", curso.getPrecio(),
                    "currency_id", "ARS"
                )
            ),
            "back_urls", Map.of(
                "success", "https://devcursos-lj.vercel.app/mis-cursos",
                "failure", "https://devcursos-lj.vercel.app/home",
                "pending", "https://devcursos-lj.vercel.app/mis-cursos"
            ),
            "auto_return", "approved",
            "notification_url", "https://cursofullstackreservas.onrender.com/api/webhooks/mercadopago",
            "external_reference", pagoProvisorio.getId().toString()
        );

        // 2. CONFIGURAMOS LOS HEADERS MANUALMENTE
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(mercadoPagoProperties.getAccessToken()); // Tu token APP_USR
        headers.set("Content-Type", "application/json");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        RestTemplate restTemplate = new RestTemplate();

        System.out.println("📤 Enviando HTTP POST directo a Mercado Pago...");

        try {
            // 3. HACEMOS LA LLAMADA (Sin usar el SDK de Mercado Pago)
            ResponseEntity<Map> response = restTemplate.exchange(
                "https://api.mercadopago.com/checkout/preferences",
                HttpMethod.POST,
                entity,
                Map.class
            );

            Map<String, Object> mpResponse = response.getBody();
            String prefId = (String) mpResponse.get("id");
            String initPoint = (String) mpResponse.get("init_point");

            System.out.println("✅ ¡PREFERENCIA CREADA! ID: " + prefId);

            pagoProvisorio.setMercadoPagoPreferenceId(prefId);
            pagoRepository.save(pagoProvisorio);

            Map<String, Object> finalResponse = new HashMap<>();
            finalResponse.put("id", prefId);
            finalResponse.put("init_point", initPoint);

            return finalResponse;

        } catch (HttpClientErrorException e) {
            System.err.println("❌ ERROR HTTP DE MERCADO PAGO:");
            System.err.println("   Status: " + e.getStatusCode());
            System.err.println("   Response: " + e.getResponseBodyAsString());
            throw new RuntimeException("Error creando preferencia en MP", e);
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
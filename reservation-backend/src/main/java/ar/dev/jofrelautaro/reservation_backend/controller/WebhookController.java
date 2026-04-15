package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.MercadoPagoWebhookDTO;
import ar.dev.jofrelautaro.reservation_backend.service.MercadoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor

public class WebhookController {

    private final MercadoPagoService mercadoPagoService;

    /**
     * Endpoint para escuchar webhooks de Mercado Pago
     * POST /api/webhooks/mercadopago
     * 
     * Mercado Pago envía eventos aquí cuando ocurren cambios en pagos
     */
    @PostMapping("/mercadopago")
    public ResponseEntity<Map<String, String>> procesarWebhookMercadoPago(@RequestBody MercadoPagoWebhookDTO webhook) {
        try {
            System.out.println("🔔 Webhook recibido de Mercado Pago");
            System.out.println("📊 Tipo de evento: " + webhook.getType());
            System.out.println("📊 ID del evento: " + webhook.getId());
            System.out.println("📊 ID del pago: " + webhook.getData().getId());

            // Solo procesar webhooks de pagos
            if (webhook.getType() != null && webhook.getType().startsWith("payment")) {
                System.out.println("💳 Detectado evento de pago: " + webhook.getType());
                
                // Extraer el ID del pago
                Long paymentId = webhook.getData().getId();
                
                // Procesar el pago (el servicio se encargará de verificar si está aprobado)
                mercadoPagoService.procesarWebhookPago(paymentId);
            } else {
                System.out.println("⏭️ Evento ignorado (no es de pago): " + webhook.getType());
            }

            // Siempre devolver 200 OK para que Mercado Pago no reintente
            Map<String, String> response = new HashMap<>();
            response.put("status", "recibido");
            response.put("message", "Webhook procesado correctamente");
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error procesando webhook: " + e.getMessage());
            e.printStackTrace();
            
            // Devolver 200 OK igual para que MP no siga reintentando
            // (los errores se loguean para que el admin investigue)
            Map<String, String> response = new HashMap<>();
            response.put("status", "error");
            response.put("message", "Error procesando webhook");
            response.put("error", e.getMessage());
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    /**
     * Endpoint de prueba para verificar que el webhook está funcionando
     */
    @GetMapping("/mercadopago/test")
    public ResponseEntity<Map<String, String>> testWebhook() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "ok");
        response.put("message", "Webhook endpoint está funcionando");
        return ResponseEntity.ok(response);
    }
}

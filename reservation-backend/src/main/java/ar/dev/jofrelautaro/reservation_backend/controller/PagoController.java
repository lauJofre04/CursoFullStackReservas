package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.config.MercadoPagoProperties;
import ar.dev.jofrelautaro.reservation_backend.service.MercadoPagoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor

public class PagoController {

    private final MercadoPagoService mercadoPagoService;
    private final MercadoPagoProperties mercadoPagoProperties;

    /**
     * Endpoint para obtener la clave pública de Mercado Pago
     * Usada por el frontend para inicializar el SDK
     */
    @GetMapping("/public-key")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        Map<String, String> response = new HashMap<>();
        response.put("publicKey", mercadoPagoProperties.getPublicKey());
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para crear una preferencia de Checkout Pro
     * Devuelve {id, init_point} para que el frontend pueda usar con el SDK de MP
     */
    @PostMapping("/crear-preferencia")
    public ResponseEntity<Map<String, Object>> crearPreferencia(@RequestBody Map<String, Long> request) {
        try {
            Long cursoId = request.get("cursoId");
            System.out.println("📝 Solicitud recibida para crear preferencia - Curso ID: " + cursoId);
            
            // Llamamos al servicio que devuelve Map con id e init_point
            Map<String, Object> preferenceData = mercadoPagoService.crearPreferenciaCheckoutPro(cursoId);

            System.out.println("✅ Preferencia creada exitosamente: " + preferenceData.get("id"));
            
            return ResponseEntity.ok(preferenceData);
            
        } catch (com.mercadopago.exceptions.MPApiException apiEx) {
            // Este catch atrapa el error EXACTO de Mercado Pago
            System.err.println("❌ ERROR DE MERCADO PAGO (API): " + apiEx.getApiResponse().getContent());
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error de Mercado Pago");
            error.put("details", apiEx.getApiResponse().getContent());
            return ResponseEntity.badRequest().body(error);
            
        } catch (Exception e) {
            System.err.println("❌ ERROR GENERAL: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Error interno del servidor");
            error.put("message", e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
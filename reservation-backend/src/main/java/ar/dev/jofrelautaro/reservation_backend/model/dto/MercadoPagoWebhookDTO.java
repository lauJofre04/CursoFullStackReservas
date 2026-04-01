package ar.dev.jofrelautaro.reservation_backend.model.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para recibir webhooks de Mercado Pago
 * Mercado Pago envía eventos de diferentes tipos (payment, plan, etc)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class MercadoPagoWebhookDTO {

    // Tipo de evento: payment.created, payment.updated, payment.approved, etc.
    private String type;

    // ID del evento
    private String id;

    // Datos del evento
    private WebhookData data;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class WebhookData {
        // ID del pago en Mercado Pago
        private Long id;

        // Pode ser "payment.approved", "payment.failed", etc.
        private String status;
    }
}

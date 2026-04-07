package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.Data;

@Data
public class CorregirEntregaRequest {
    private Double nota;
    private String feedbackDocente;
}

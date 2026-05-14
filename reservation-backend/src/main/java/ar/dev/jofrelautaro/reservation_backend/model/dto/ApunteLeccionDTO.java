package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ApunteLeccionDTO {
    private Long id;
    private String contenido;
    private Integer tiempoReferenciaSegundos;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaModificacion;
}

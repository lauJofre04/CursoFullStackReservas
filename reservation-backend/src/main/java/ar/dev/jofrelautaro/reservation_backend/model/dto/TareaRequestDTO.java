package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TareaRequestDTO {
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaLimite;
    private Long cursoId;
    private Long moduloId;
}
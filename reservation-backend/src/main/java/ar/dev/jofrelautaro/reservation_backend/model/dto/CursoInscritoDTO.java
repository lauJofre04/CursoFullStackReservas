package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CursoInscritoDTO {
    private Long cursoId;
    private String titulo;
    private String imagen;
    private String estado; // ACTIVA o VENCIDA
    private LocalDateTime fechaInscripcion;
}
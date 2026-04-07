package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EntregaAlumnoDTO {
    private Long alumnoId;
    private String nombreAlumno;
    private String emailAlumno;
    private boolean entregado;
    private Long entregaId;
    private String archivoAlumnoUrl;
    private LocalDateTime fechaEntrega;
    private String comentarioAlumno;
    private Double nota;
    private String feedbackDocente;
}

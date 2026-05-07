package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ComentarioDTO {
    private Long id;
    private String contenido;
    private String autorNombre;
    private String autorRol; // Para ponerle un cartelito de "Profesor" si responde él
    private LocalDateTime fechaCreacion;
}
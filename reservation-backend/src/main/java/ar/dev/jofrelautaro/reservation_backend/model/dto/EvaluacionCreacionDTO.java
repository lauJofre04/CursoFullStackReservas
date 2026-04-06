package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionCreacionDTO {
    private String titulo;
    private String descripcion;
    private Long cursoId;
    private List<PreguntaCreacionDTO> preguntas;
}
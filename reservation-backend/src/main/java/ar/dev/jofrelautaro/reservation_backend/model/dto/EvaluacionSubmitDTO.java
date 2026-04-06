package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionSubmitDTO {
    // El ID de la evaluación que está rindiendo
    private Long evaluacionId; 
    
    // Un mapa que relaciona: { ID_PREGUNTA : ID_OPCION_ELEGIDA }
    // Ejemplo: { 1: 3, 2: 8, 3: 12 }
    private Map<Long, Long> respuestas; 
}
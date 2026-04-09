package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CursoInscripcionesDTO {

    private Long cursoId;
    private String titulo;
    private Long inscripciones;
}

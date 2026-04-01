package ar.dev.jofrelautaro.reservation_backend.model.dto;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Recurso;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRecursoRequest {

    private String titulo;
    private Recurso.TipoRecurso tipo;
    private String urlRecurso;
    private String descripcion;
    private Integer orden;
}

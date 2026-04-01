package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Recurso;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecursoDTO {

    private Long id;
    private String titulo;
    private Recurso.TipoRecurso tipo;
    private String urlRecurso;
    private String descripcion;
    private Integer orden;
    private LocalDateTime fechaCreacion;
}

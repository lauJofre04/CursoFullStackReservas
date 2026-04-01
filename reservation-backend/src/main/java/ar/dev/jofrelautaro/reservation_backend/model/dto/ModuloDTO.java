package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloDTO {

    private Long id;
    private String titulo;
    private String descripcion;
    private Integer orden;
    private LocalDateTime fechaCreacion;
    private List<LeccionDTO> lecciones;
}

package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TareaCalendarioDTO {
    private Long id;
    private String title;        // react-big-calendar usa 'title'
    private LocalDateTime start; // react-big-calendar usa 'start' (fecha de inicio)
    private LocalDateTime end;   // react-big-calendar usa 'end' (usaremos la misma fecha límite)
    private Long cursoId;
    private String cursoTitulo;
}
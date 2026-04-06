package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CursoResponseDTO {
    private Long id;
    private String titulo;
    private String descripcion;
    private Double precio;
    private String imagen;
    private boolean activo;
    
}
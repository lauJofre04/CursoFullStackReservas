package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificadoAlumnoDTO {
    private Long usuarioId;
    private String nombre;
    private String email;
    private boolean aprobado;
}

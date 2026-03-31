package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ActualizarPerfilRequest {
    private String biografia;
    private String telefono;
    private LocalDate fechaNacimiento;
}
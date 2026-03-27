package ar.dev.jofrelautaro.reservation_backend.model.dto;

import ar.dev.jofrelautaro.reservation_backend.model.entity.MetodoAcceso;
import lombok.Data;

@Data
public class InscripcionAdminRequest {
    private String emailUsuario; // Tu idea: buscar por mail
    private Long cursoId;        // A qué curso lo anotamos
    private MetodoAcceso metodoAcceso; // MANUAL_ADMIN
}
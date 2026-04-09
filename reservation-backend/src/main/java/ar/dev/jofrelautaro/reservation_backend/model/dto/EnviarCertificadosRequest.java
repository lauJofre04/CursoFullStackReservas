package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EnviarCertificadosRequest {
    private List<Long> usuarioIds;
}

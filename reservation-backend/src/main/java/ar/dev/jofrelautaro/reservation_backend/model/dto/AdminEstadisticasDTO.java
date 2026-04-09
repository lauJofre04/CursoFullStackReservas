package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminEstadisticasDTO {

    private Long totalUsuarios;
    private BigDecimal ingresosTotales;
    private List<CursoInscripcionesDTO> cursosMasInscritos;
}

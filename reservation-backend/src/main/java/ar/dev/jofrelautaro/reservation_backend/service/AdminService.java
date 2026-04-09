package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.AdminEstadisticasDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.CursoInscripcionesDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Pago;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.PagoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UsuarioRepository usuarioRepository;
    private final PagoRepository pagoRepository;
    private final InscripcionRepository inscripcionRepository;

    public AdminEstadisticasDTO obtenerEstadisticas() {
        long totalUsuarios = usuarioRepository.count();

        BigDecimal ingresosTotales = pagoRepository.findByEstado("APROBADO")
                .stream()
                .map(Pago::getMonto)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<CursoInscripcionesDTO> cursosMasInscritos = inscripcionRepository
                .findTopCursos(PageRequest.of(0, 6))
                .stream()
                .map(row -> CursoInscripcionesDTO.builder()
                        .cursoId(((Number) row[0]).longValue())
                        .titulo((String) row[1])
                        .inscripciones(((Number) row[2]).longValue())
                        .build())
                .collect(Collectors.toList());

        return AdminEstadisticasDTO.builder()
                .totalUsuarios(totalUsuarios)
                .ingresosTotales(ingresosTotales)
                .cursosMasInscritos(cursosMasInscritos)
                .build();
    }
}

package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.ResultadoEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResultadoEvaluacionRepository extends JpaRepository<ResultadoEvaluacion, Long> {
    // Para ver el historial de un alumno
    List<ResultadoEvaluacion> findByUsuarioId(Long usuarioId);
    
    // Para saber si un alumno ya rindió una evaluación específica
    Optional<ResultadoEvaluacion> findByUsuarioIdAndEvaluacionId(Long usuarioId, Long evaluacionId);
}
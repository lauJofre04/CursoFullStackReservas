package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Inscripcion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
    // Magia de Spring Data: Trae todas las inscripciones de un alumno
    List<Inscripcion> findByUsuario(Usuario usuario);
    // Magia de Spring Data: Revisa si ya existe esta combinación exacta
    boolean existsByUsuarioAndCurso(Usuario usuario, Curso curso);

    List<Inscripcion> findByEstadoAndFechaInscripcionBefore(String estado, LocalDateTime fechaLimite);
}
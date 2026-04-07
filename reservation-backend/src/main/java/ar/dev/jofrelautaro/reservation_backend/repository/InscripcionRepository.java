package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Inscripcion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InscripcionRepository extends JpaRepository<Inscripcion, Long> {
    // Magia de Spring Data: Trae todas las inscripciones de un alumno
    List<Inscripcion> findByUsuario(Usuario usuario);
    // Magia de Spring Data: Revisa si ya existe esta combinación exacta
    boolean existsByUsuarioAndCurso(Usuario usuario, Curso curso);
    
    // Buscar una inscripción específica de usuario y curso
    Optional<Inscripcion> findByUsuarioAndCurso(Usuario usuario, Curso curso);

    List<Inscripcion> findByEstadoAndFechaInscripcionBefore(String estado, LocalDateTime fechaLimite);
    List<Inscripcion> findByUsuarioId(Long usuarioId);

    @Query("SELECT i.usuario FROM Inscripcion i WHERE i.curso.id = :cursoId")
    List<Usuario> findUsuariosByCursoId(@Param("cursoId") Long cursoId);
}
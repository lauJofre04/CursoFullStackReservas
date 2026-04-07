package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.TareaProgramada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TareaProgramadaRepository extends JpaRepository<TareaProgramada, Long> {
    
    // Trae las tareas de TODOS los cursos a los que está inscripto el alumno
    List<TareaProgramada> findByCursoIdIn(List<Long> cursoIds);
    
    // Trae las tareas de un solo curso (ideal para el panel del admin)
    List<TareaProgramada> findByCursoId(Long cursoId);
    List<TareaProgramada> findByModuloId(Long moduloId);
}
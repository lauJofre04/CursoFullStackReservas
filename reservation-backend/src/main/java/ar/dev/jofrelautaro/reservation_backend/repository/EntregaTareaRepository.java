package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.EntregaTarea;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
import java.util.Optional;

public interface EntregaTareaRepository extends JpaRepository<EntregaTarea, Long> {
    List<EntregaTarea> findByTareaId(Long tareaId);
    List<EntregaTarea> findByAlumnoId(Long alumnoId);

    Optional<EntregaTarea> findByTareaIdAndAlumnoId(Long tareaId, Long alumnoId);
}
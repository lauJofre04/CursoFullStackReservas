package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.ProgresoLeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProgresoLeccionRepository extends JpaRepository<ProgresoLeccion, Long> {
    
    Optional<ProgresoLeccion> findByUsuarioIdAndLeccionId(Long usuarioId, Long leccionId);
}
package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.ApunteLeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApunteLeccionRepository extends JpaRepository<ApunteLeccion, Long> {

    List<ApunteLeccion> findByLeccionIdAndUsuarioIdOrderByFechaModificacionDesc(Long leccionId, Long usuarioId);
}

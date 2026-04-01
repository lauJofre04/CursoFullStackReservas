package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Leccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeccionRepository extends JpaRepository<Leccion, Long> {

    // Buscar todas las lecciones de un módulo
    List<Leccion> findByModuloIdOrderByOrden(Long moduloId);

    // Buscar una lección específica
    Optional<Leccion> findByIdAndModuloId(Long leccionId, Long moduloId);

    // Contar lecciones de un módulo
    Long countByModuloId(Long moduloId);
}

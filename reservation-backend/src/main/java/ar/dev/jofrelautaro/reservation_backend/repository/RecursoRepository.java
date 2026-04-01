package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Recurso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecursoRepository extends JpaRepository<Recurso, Long> {

    // Buscar todos los recursos de una lección
    List<Recurso> findByLeccionIdOrderByOrden(Long leccionId);

    // Buscar un recurso específico
    Optional<Recurso> findByIdAndLeccionId(Long recursoId, Long leccionId);

    // Contar recursos de una lección
    Long countByLeccionId(Long leccionId);
}

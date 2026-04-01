package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Modulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModuloRepository extends JpaRepository<Modulo, Long> {

    // Buscar todos los módulos de un curso, ordenados por "orden"
    List<Modulo> findByCursoIdOrderByOrden(Long cursoId);

    // Buscar un módulo específico de un curso
    Optional<Modulo> findByIdAndCursoId(Long moduloId, Long cursoId);

    // Contar módulos de un curso
    Long countByCursoId(Long cursoId);
}

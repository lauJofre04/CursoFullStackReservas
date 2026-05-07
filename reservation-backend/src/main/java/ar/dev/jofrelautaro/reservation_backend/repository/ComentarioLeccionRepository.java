package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.ComentarioLeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioLeccionRepository extends JpaRepository<ComentarioLeccion, Long> {
    
    // Spring Data JPA arma la consulta SQL automáticamente leyendo el nombre del método:
    // Trae los comentarios filtrados por el ID de la lección y ordenados del más viejo al más nuevo.
    List<ComentarioLeccion> findByLeccionIdOrderByFechaCreacionAsc(Long leccionId);
    
}
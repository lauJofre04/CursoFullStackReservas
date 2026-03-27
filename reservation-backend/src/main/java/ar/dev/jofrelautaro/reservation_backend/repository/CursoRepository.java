package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    

    Page<Curso> findAllByActivoTrue(Pageable pageable);
    

    Optional<Curso> findByIdAndActivoTrue(Long id);
}
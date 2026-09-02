package ar.dev.jofrelautaro.reservation_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    

    Page<Curso> findAllByActivoTrue(Pageable pageable);
    
    List<Curso> findByProfesoresId(Long profesorId);

    Optional<Curso> findByIdAndActivoTrue(Long id);

    List<Curso> findByProfesoresAndActivoTrue(Usuario profesor);

    List<Curso> findByActivoTrue();

    @Query("select distinct c from Curso c left join fetch c.profesores")
    List<Curso> findAllWithProfesores();
}
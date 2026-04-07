package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Conversacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConversacionRepository extends JpaRepository<Conversacion, Long> {
    List<Conversacion> findDistinctByParticipantes_Id(Long usuarioId);
}

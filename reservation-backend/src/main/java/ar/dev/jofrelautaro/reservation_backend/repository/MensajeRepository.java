package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByConversacionIdOrderByFechaEnvioAsc(Long conversacionId);
    int countByConversacionIdAndLeidoFalseAndRemitente_IdNot(Long conversacionId, Long remitenteId);
    List<Mensaje> findByConversacionIdAndRemitente_IdNotAndLeidoFalse(Long conversacionId, Long remitenteId);
}

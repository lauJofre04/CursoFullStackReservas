package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {

    // Buscar un pago por su ID de preferencia de Mercado Pago
    Optional<Pago> findByMercadoPagoPreferenceId(String preferenceId);

    // Buscar un pago por su ID de pago de Mercado Pago
    Optional<Pago> findByMercadoPagoPaymentId(String paymentId);

    // Buscar todos los pagos de un usuario
    java.util.List<Pago> findByUsuarioId(Long usuarioId);

    // Buscar todos los pagos de un curso
    java.util.List<Pago> findByCursoId(Long cursoId);
}

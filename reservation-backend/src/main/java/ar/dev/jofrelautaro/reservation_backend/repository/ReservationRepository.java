package ar.dev.jofrelautaro.reservation_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Reservation;
import ar.dev.jofrelautaro.reservation_backend.model.entity.ReservationStatus;

import java.time.LocalDate;
import java.time.LocalTime;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    boolean existsByReservationDateAndReservationTimeAndStatus(
            LocalDate reservationDate,
            LocalTime reservationTime,
            ReservationStatus status);
}

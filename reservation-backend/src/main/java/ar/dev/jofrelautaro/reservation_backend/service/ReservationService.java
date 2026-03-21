package ar.dev.jofrelautaro.reservation_backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import ar.dev.jofrelautaro.reservation_backend.exception.BusinessRuleViolationException;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Reservation;
import ar.dev.jofrelautaro.reservation_backend.model.entity.ReservationStatus;
import ar.dev.jofrelautaro.reservation_backend.repository.ReservationRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;

    public List<Reservation> findAllReservations() {
        return reservationRepository.findAll();
    }

    @Transactional
    public Reservation createReservation(Reservation reservation) {
        if (reservationRepository.existsByReservationDateAndReservationTimeAndStatus(
                reservation.getReservationDate(),
                reservation.getReservationTime(),
                ReservationStatus.ACTIVATE)) {
            throw new BusinessRuleViolationException(
                    "Another reservation already exists for the same date and time.",
                    HttpStatus.CONFLICT);
        }
        reservation.setStatus(ReservationStatus.ACTIVATE);
        return reservationRepository.save(reservation);
    }

    @Transactional
    public void cancelReservation(Long id) {
        Reservation reservation =
                reservationRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new BusinessRuleViolationException(
                                                "Reservation not found for the given id.",
                                                HttpStatus.NOT_FOUND));
        if (reservation.getStatus() == ReservationStatus.CANCELED) {
            throw new BusinessRuleViolationException(
                    "The reservation is already canceled.", HttpStatus.CONFLICT);
        }
        reservation.setStatus(ReservationStatus.CANCELED);
        reservationRepository.save(reservation);
    }
}

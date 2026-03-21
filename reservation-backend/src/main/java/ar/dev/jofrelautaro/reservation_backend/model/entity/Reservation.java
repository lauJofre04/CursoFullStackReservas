package ar.dev.jofrelautaro.reservation_backend.model.entity;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Column;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "customer_name", length = 100, nullable = false)
    private String customerName;
    @Column(name = "reservation_date", nullable = false)
    private LocalDate reservationDate;
    @Column(name = "reservation_time", nullable = false)
    private LocalTime reservationTime;
    @Column(name = "service", length = 100, nullable = false)
    private String service;
    @Column(name = "status", nullable = false)
    private ReservationStatus status;


}

package ar.dev.jofrelautaro.reservation_backend.model.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationCreateRequest {

    @NotBlank
    @Size(max = 100)
    private String customerName;

    @NotNull private LocalDate reservationDate;

    @NotNull private LocalTime reservationTime;

    @NotBlank
    @Size(max = 100)
    private String service;
}

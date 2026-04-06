package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OpcionDTO {
    private Long id;
    private String texto;
    // 🚨 CERO RASTRO de "esCorrecta". El alumno solo ve el texto.
}
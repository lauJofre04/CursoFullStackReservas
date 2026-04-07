package ar.dev.jofrelautaro.reservation_backend.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatConversationDTO {
    private Long id;
    private String nombre;
    private List<Long> participanteIds;
    private List<String> participanteNombres;
    private String ultimoMensaje;
    private LocalDateTime fechaActualizacion;
    private int mensajesNoLeidos;
}

package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.ChatMessageDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.ChatNotificationDTO;
import ar.dev.jofrelautaro.reservation_backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.List;

@Controller
@RequiredArgsConstructor
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.send")
    public void enviarMensaje(@Payload ChatMessageDTO chatMessage, Principal principal) {
        if (principal == null) {
            return;
        }

        Long remitenteId = chatMessage.getRemitenteId();
        if (remitenteId == null) {
            return;
        }

        ChatMessageDTO mensajeGuardado = chatService.guardarMensaje(chatMessage.getConversacionId(), remitenteId, chatMessage.getContenido());
        messagingTemplate.convertAndSend("/topic/conversation." + chatMessage.getConversacionId(), mensajeGuardado);

        List<Long> participanteIds = chatService.obtenerParticipantesIdsDeConversacion(chatMessage.getConversacionId());
        for (Long participanteId : participanteIds) {
            if (participanteId.equals(remitenteId)) {
                continue;
            }
            int mensajesNoLeidos = chatService.contarMensajesNoLeidos(chatMessage.getConversacionId(), participanteId);
            ChatNotificationDTO notification = ChatNotificationDTO.builder()
                    .conversacionId(chatMessage.getConversacionId())
                    .ultimoMensaje(mensajeGuardado.getContenido())
                    .mensajesNoLeidos(mensajesNoLeidos)
                    .fechaEnvio(mensajeGuardado.getFechaEnvio())
                    .remitenteNombre(mensajeGuardado.getRemitenteNombre())
                    .build();
            messagingTemplate.convertAndSend("/topic/user." + participanteId, notification);
        }
    }
}

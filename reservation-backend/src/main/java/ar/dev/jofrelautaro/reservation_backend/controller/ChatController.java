package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.ChatConversationDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.ChatConversationRequestDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.ChatMessageDTO;
import ar.dev.jofrelautaro.reservation_backend.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/conversaciones")
    public ResponseEntity<List<ChatConversationDTO>> obtenerConversaciones() {
        Long usuarioId = obtenerUsuarioIdAutenticado();
        return ResponseEntity.ok(chatService.obtenerConversacionesUsuario(usuarioId));
    }

    @GetMapping("/conversaciones/{id}/mensajes")
    public ResponseEntity<List<ChatMessageDTO>> obtenerMensajes(@PathVariable Long id) {
        Long usuarioId = obtenerUsuarioIdAutenticado();
        return ResponseEntity.ok(chatService.obtenerMensajesDeConversacion(id, usuarioId));
    }

    @PostMapping("/conversaciones")
    public ResponseEntity<ChatConversationDTO> crearConversacion(@RequestBody ChatConversationRequestDTO request) {
        return ResponseEntity.ok(chatService.crearConversacion(request.getParticipantEmails(), request.getNombre()));
    }

    private Long obtenerUsuarioIdAutenticado() {
        
        return chatService.obtenerUsuarioAutenticado().getId();
    }
}

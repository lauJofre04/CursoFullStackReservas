package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.ComentarioDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.ComentarioLeccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Leccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.ComentarioLeccionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.LeccionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequiredArgsConstructor
public class ForoController {

    private final ComentarioLeccionRepository comentarioRepository;
    private final LeccionRepository leccionRepository;
    private final UsuarioRepository usuarioRepository;
    private final SimpMessagingTemplate messagingTemplate; // La herramienta para disparar mensajes WebSocket

    // 📡 ENDPOINT HTTP: Para cargar el historial cuando el alumno entra al video
    @GetMapping("/api/foro/leccion/{leccionId}")
    public ResponseEntity<Page<ComentarioDTO>> obtenerHistorial(@PathVariable Long leccionId, Pageable pageable) {
        Page<ComentarioDTO> historial = comentarioRepository
                .findByLeccionIdOrderByFechaCreacionAsc(leccionId, pageable)
                .map(this::convertirADTO);
        return ResponseEntity.ok(historial);
    }

    // ⚡ ENDPOINT WEBSOCKET: Cuando alguien envía un mensaje nuevo
    // React lo envía a: /app/foro.leccion.{leccionId}
    @MessageMapping("/foro.leccion.{leccionId}")
    public void recibirComentarioEnVivo(
            @DestinationVariable Long leccionId,
            @Payload String contenido,
            Principal principal) { // El Principal viene gratis gracias a tu StompJwtChannelInterceptor

        // 1. Buscamos quién envía y dónde lo envía
        Usuario autor = usuarioRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Leccion leccion = leccionRepository.findById(leccionId)
                .orElseThrow(() -> new RuntimeException("Lección no encontrada"));

        // 2. Lo guardamos en la base de datos PostgreSQL
        ComentarioLeccion nuevoComentario = ComentarioLeccion.builder()
                .contenido(contenido)
                .usuario(autor)
                .leccion(leccion)
                .build();
        nuevoComentario = comentarioRepository.save(nuevoComentario);

        // 3. Lo convertimos al DTO liviano
        ComentarioDTO dto = convertirADTO(nuevoComentario);

        // 4. BROMACAST MÁGICO: Disparamos el mensaje a todos los que estén viendo este video
        // React debe estar suscrito a: /topic/foro.leccion.{leccionId}
        messagingTemplate.convertAndSend("/topic/foro.leccion." + leccionId, dto);
    }

    // Método utilitario para mapear (lo ideal es ponerlo en un Service o Mapper, pero acá para simplificar)
    // Método utilitario para mapear
    private ComentarioDTO convertirADTO(ComentarioLeccion comentario) {
        return ComentarioDTO.builder()
                .id(comentario.getId())
                .contenido(comentario.getContenido())
                // Eliminamos el getApellido() y dejamos solo el getNombre()
                .autorNombre(comentario.getUsuario().getNombre()) 
                // Usamos .name() asumiendo que Rol es un Enum (como suele ser ROLE_ALUMNO)
                .autorRol(comentario.getUsuario().getRol().name()) 
                .fechaCreacion(comentario.getFechaCreacion())
                .build();
    }
}
package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.NotificacionDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Notificacion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.NotificacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final SimpMessagingTemplate messagingTemplate;
    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public void notificarUsuario(String emailUsuario, String mensaje) {
        Notificacion notificacion = guardarNotificacion(emailUsuario, mensaje);
        if (notificacion == null) {
            return;
        }
        messagingTemplate.convertAndSendToUser(emailUsuario, "/queue/notificaciones", construirPayload(notificacion));
    }

    public void notificarUsuarios(List<String> emails, String mensaje) {
        if (emails == null || emails.isEmpty()) {
            return;
        }
        for (String email : emails) {
            if (email != null && !email.isBlank()) {
                notificarUsuario(email, mensaje);
            }
        }
    }

    public void notificarATodos(String mensaje) {
        List<Usuario> usuarios = usuarioRepository.findAll();
        for (Usuario usuario : usuarios) {
            guardarNotificacion(usuario.getEmail(), mensaje);
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("mensaje", mensaje);
        payload.put("fecha", LocalDateTime.now().toString());
        messagingTemplate.convertAndSend("/topic/alertas", (Object) payload);
    }

    public List<NotificacionDTO> obtenerNotificaciones(String emailUsuario) {
        return notificacionRepository.findAllByUsuarioEmailOrderByFechaDesc(emailUsuario).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public NotificacionDTO marcarComoLeida(String emailUsuario, Long notificacionId) {
        Optional<Notificacion> notificacionOpt = notificacionRepository.findByIdAndUsuarioEmail(notificacionId, emailUsuario);
        if (notificacionOpt.isEmpty()) {
            throw new IllegalArgumentException("Notificación no encontrada");
        }
        Notificacion notificacion = notificacionOpt.get();
        notificacion.setLeida(true);
        return toDTO(notificacionRepository.save(notificacion));
    }

    @Transactional
    public void marcarTodasComoLeidas(String emailUsuario) {
        List<Notificacion> notificaciones = notificacionRepository.findAllByUsuarioEmailOrderByFechaDesc(emailUsuario);
        notificaciones.forEach(notificacion -> notificacion.setLeida(true));
        notificacionRepository.saveAll(notificaciones);
    }

    private Notificacion guardarNotificacion(String emailUsuario, String mensaje) {
        if (emailUsuario == null || emailUsuario.isBlank()) {
            return null;
        }
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(emailUsuario);
        if (usuarioOpt.isEmpty()) {
            return null;
        }
        Notificacion notificacion = Notificacion.builder()
                .mensaje(mensaje)
                .fecha(LocalDateTime.now())
                .leida(false)
                .usuario(usuarioOpt.get())
                .build();
        return notificacionRepository.save(notificacion);
    }

    private Map<String, Object> construirPayload(Notificacion notificacion) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", notificacion.getId());
        payload.put("mensaje", notificacion.getMensaje());
        payload.put("fecha", notificacion.getFecha().toString());
        payload.put("leida", notificacion.isLeida());
        return payload;
    }

    private NotificacionDTO toDTO(Notificacion notificacion) {
        return NotificacionDTO.builder()
                .id(notificacion.getId())
                .mensaje(notificacion.getMensaje())
                .fecha(notificacion.getFecha())
                .leida(notificacion.isLeida())
                .build();
    }
}

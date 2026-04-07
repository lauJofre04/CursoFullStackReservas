package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.ChatConversationDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.ChatMessageDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Conversacion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Mensaje;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.ConversacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.MensajeRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private final ConversacionRepository conversacionRepository;
    private final MensajeRepository mensajeRepository;
    private final UsuarioRepository usuarioRepository;

    public List<ChatConversationDTO> obtenerConversacionesUsuario(Long usuarioId) {
        return conversacionRepository.findDistinctByParticipantes_Id(usuarioId)
                .stream()
                .map(conversacion -> mapConversacion(conversacion, usuarioId))
                .collect(Collectors.toList());
    }

    public List<ChatMessageDTO> obtenerMensajesDeConversacion(Long conversacionId, Long usuarioId) {
        Conversacion conversacion = conversacionRepository.findById(conversacionId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        boolean esParticipante = conversacion.getParticipantes().stream()
                .anyMatch(participante -> participante.getId().equals(usuarioId));

        if (!esParticipante) {
            throw new RuntimeException("No tienes permiso para ver esta conversación");
        }

        marcarMensajesComoLeidos(conversacionId, usuarioId);
        return mensajeRepository.findByConversacionIdOrderByFechaEnvioAsc(conversacionId)
                .stream()
                .map(this::mapMensaje)
                .collect(Collectors.toList());
    }

    public ChatConversationDTO crearConversacion(List<String> participantEmails, String nombre) {
        Usuario creador = obtenerUsuarioAutenticado();

        Set<Usuario> participantes = participantEmails.stream()
                .map(String::trim)
                .filter(email -> !email.isBlank())
                .distinct()
                .map(email -> usuarioRepository.findByEmail(email)
                        .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + email)))
                .collect(Collectors.toSet());

        participantes.add(creador);

        if (participantes.size() < 2) {
            throw new RuntimeException("Debes seleccionar al menos un participante adicional para iniciar la conversación");
        }

        Conversacion conversacion = Conversacion.builder()
                .nombre(nombre == null || nombre.isBlank() ? "Conversación" : nombre)
                .participantes(participantes)
                .build();

        conversacion = conversacionRepository.save(conversacion);
        return mapConversacion(conversacion, creador.getId());
    }

    public ChatMessageDTO guardarMensaje(Long conversacionId, Long remitenteId, String contenido) {
        Conversacion conversacion = conversacionRepository.findById(conversacionId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        Usuario remitente = usuarioRepository.findById(remitenteId)
                .orElseThrow(() -> new RuntimeException("Remitente no encontrado"));

        boolean esParticipante = conversacion.getParticipantes().stream()
                .anyMatch(participante -> participante.getId().equals(remitenteId));

        if (!esParticipante) {
            throw new RuntimeException("No tienes permiso para enviar mensajes en esta conversación");
        }

        Mensaje mensaje = Mensaje.builder()
                .contenido(contenido)
                .fechaEnvio(LocalDateTime.now())
                .conversacion(conversacion)
                .remitente(remitente)
                .build();

        Mensaje mensajeGuardado = mensajeRepository.save(mensaje);
        conversacion.setFechaActualizacion(LocalDateTime.now());
        conversacionRepository.save(conversacion);

        return mapMensaje(mensajeGuardado);
    }

    public List<Long> obtenerParticipantesIdsDeConversacion(Long conversacionId) {
        Conversacion conversacion = conversacionRepository.findById(conversacionId)
                .orElseThrow(() -> new RuntimeException("Conversación no encontrada"));

        return conversacion.getParticipantes().stream()
                .map(Usuario::getId)
                .collect(Collectors.toList());
    }

    public int contarMensajesNoLeidos(Long conversacionId, Long usuarioId) {
        return mensajeRepository.countByConversacionIdAndLeidoFalseAndRemitente_IdNot(conversacionId, usuarioId);
    }

    public Usuario obtenerUsuarioAutenticado() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
    }

    private ChatConversationDTO mapConversacion(Conversacion conversacion, Long usuarioId) {
        List<String> nombres = conversacion.getParticipantes().stream()
                .map(Usuario::getNombre)
                .collect(Collectors.toList());

        String ultimoMensaje = conversacion.getMensajes().stream()
                .sorted((a, b) -> b.getFechaEnvio().compareTo(a.getFechaEnvio()))
                .findFirst()
                .map(Mensaje::getContenido)
                .orElse("Sin mensajes aún");

        int mensajesNoLeidos = mensajeRepository.countByConversacionIdAndLeidoFalseAndRemitente_IdNot(
                conversacion.getId(), usuarioId);

        return ChatConversationDTO.builder()
                .id(conversacion.getId())
                .nombre(conversacion.getNombre())
                .participanteIds(conversacion.getParticipantes().stream()
                        .map(Usuario::getId)
                        .collect(Collectors.toList()))
                .participanteNombres(nombres)
                .ultimoMensaje(ultimoMensaje)
                .fechaActualizacion(conversacion.getFechaActualizacion())
                .mensajesNoLeidos(mensajesNoLeidos)
                .build();
    }

    private void marcarMensajesComoLeidos(Long conversacionId, Long usuarioId) {
        List<Mensaje> mensajesSinLeer = mensajeRepository.findByConversacionIdAndRemitente_IdNotAndLeidoFalse(
                conversacionId, usuarioId);
        if (!mensajesSinLeer.isEmpty()) {
            mensajesSinLeer.forEach(mensaje -> mensaje.setLeido(true));
            mensajeRepository.saveAll(mensajesSinLeer);
        }
    }

    private ChatMessageDTO mapMensaje(Mensaje mensaje) {
        return ChatMessageDTO.builder()
                .id(mensaje.getId())
                .conversacionId(mensaje.getConversacion().getId())
                .contenido(mensaje.getContenido())
                .fechaEnvio(mensaje.getFechaEnvio())
                .remitenteId(mensaje.getRemitente().getId())
                .remitenteNombre(mensaje.getRemitente().getNombre())
                .build();
    }
}

package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.ApunteLeccionDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.ApunteLeccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Leccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.ApunteLeccionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.LeccionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApunteLeccionService {

    private final ApunteLeccionRepository apunteRepository;
    private final UsuarioRepository usuarioRepository;
    private final LeccionRepository leccionRepository;

    public List<ApunteLeccionDTO> obtenerApuntesDeLeccionYUsuario(Long leccionId, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!leccionRepository.existsById(leccionId)) {
            throw new RuntimeException("Lección no encontrada");
        }

        return apunteRepository.findByLeccionIdAndUsuarioIdOrderByFechaModificacionDesc(leccionId, usuario.getId())
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    public ApunteLeccionDTO guardarApunte(Long leccionId, String emailUsuario, String contenido, Integer tiempoReferenciaSegundos) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Leccion leccion = leccionRepository.findById(leccionId)
                .orElseThrow(() -> new RuntimeException("Lección no encontrada"));

        ApunteLeccion apunte = ApunteLeccion.builder()
                .contenido(contenido)
                .tiempoReferenciaSegundos(tiempoReferenciaSegundos)
                .usuario(usuario)
                .leccion(leccion)
                .build();

        return convertirADTO(apunteRepository.save(apunte));
    }

    private ApunteLeccionDTO convertirADTO(ApunteLeccion apunte) {
        return ApunteLeccionDTO.builder()
                .id(apunte.getId())
                .contenido(apunte.getContenido())
                .tiempoReferenciaSegundos(apunte.getTiempoReferenciaSegundos())
                .fechaCreacion(apunte.getFechaCreacion())
                .fechaModificacion(apunte.getFechaModificacion())
                .build();
    }
}

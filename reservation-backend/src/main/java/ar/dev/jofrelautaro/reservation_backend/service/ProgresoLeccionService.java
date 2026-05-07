package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Leccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.ProgresoLeccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.LeccionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ProgresoLeccionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ProgresoLeccionService {

    private final ProgresoLeccionRepository progresoRepository;
    private final LeccionRepository leccionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public void actualizarProgreso(Long leccionId, Integer segundosVistos, Boolean forzarCompletado) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        Leccion leccion = leccionRepository.findById(leccionId)
                .orElseThrow(() -> new RuntimeException("Lección no encontrada"));

        // Buscamos si ya existe el progreso, si no, creamos uno nuevo
        ProgresoLeccion progreso = progresoRepository.findByUsuarioIdAndLeccionId(usuario.getId(), leccion.getId())
                .orElseGet(() -> ProgresoLeccion.builder()
                        .usuario(usuario)
                        .leccion(leccion)
                        .tiempoVistoSegundos(0)
                        .completado(false)
                        .build());

        // Actualizamos los datos
        progreso.setTiempoVistoSegundos(segundosVistos);
        progreso.setUltimaVezVisto(LocalDateTime.now());

        // Si desde React nos avisan que terminó, o si ya vio casi todo el video, lo marcamos completado
        if (forzarCompletado != null && forzarCompletado) {
            progreso.setCompletado(true);
        }

        progresoRepository.save(progreso);
    }

    // Método para cuando el alumno entra a la lección y necesitamos saber dónde se quedó
    public ProgresoLeccion obtenerProgreso(Long leccionId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));

        return progresoRepository.findByUsuarioIdAndLeccionId(usuario.getId(), leccionId)
                .orElse(null); // Si devuelve null, el video arranca de cero
    }
}
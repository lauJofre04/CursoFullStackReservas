package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CursoInscritoDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.InscripcionAdminRequest;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Inscripcion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class InscripcionService {

    private final InscripcionRepository inscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    public Inscripcion matricularManualmente(InscripcionAdminRequest request) {
        
        // 1. Buscamos al usuario por el mail que tipeaste en el panel
        Usuario usuario = usuarioRepository.findByEmail(request.getEmailUsuario())
                .orElseThrow(() -> new RuntimeException("No existe ningún usuario con el email: " + request.getEmailUsuario()));

        // 2. Buscamos el curso (y nos aseguramos de que esté activo)
        Curso curso = cursoRepository.findByIdAndActivoTrue(request.getCursoId())
                .orElseThrow(() -> new RuntimeException("El curso no existe o ha sido eliminado"));

        // 3. Validamos que no esté anotado ya
        if (inscripcionRepository.existsByUsuarioAndCurso(usuario, curso)) {
            throw new RuntimeException("El usuario ya se encuentra inscrito en este curso");
        }

        // 4. Armamos el "puente" (la inscripción)
        Inscripcion nuevaInscripcion = Inscripcion.builder()
                .usuario(usuario)
                .curso(curso)
                .metodoAcceso(request.getMetodoAcceso())
                // El estado "ACTIVA" y la fecha se ponen solos por tu entidad
                .build();

        return inscripcionRepository.save(nuevaInscripcion);
    }
    // NUEVO MÉTODO: Ver mis cursos
    public List<CursoInscritoDTO> obtenerMisCursos() {
        // 1. Sacamos el email del usuario que está haciendo la petición desde el Token JWT
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // 2. Buscamos a ese usuario en la base de datos
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 3. Buscamos todas sus inscripciones
        List<Inscripcion> inscripciones = inscripcionRepository.findByUsuario(usuario);

        // 4. Transformamos las inscripciones complejas en DTOs limpitos para el Frontend
        return inscripciones.stream().map(inscripcion -> CursoInscritoDTO.builder()
                .cursoId(inscripcion.getCurso().getId())
                .titulo(inscripcion.getCurso().getTitulo())
                .imagen(inscripcion.getCurso().getImagen())
                .estado(inscripcion.getEstado())
                .fechaInscripcion(inscripcion.getFechaInscripcion())
                .build()
        ).collect(Collectors.toList());
    }
}
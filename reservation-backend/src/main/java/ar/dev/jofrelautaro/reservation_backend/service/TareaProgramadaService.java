package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.EntregaTarea;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Modulo;
import ar.dev.jofrelautaro.reservation_backend.model.entity.TareaProgramada;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.model.dto.TareaCalendarioDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.TareaRequestDTO;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.TareaProgramadaRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.EntregaTareaRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ModuloRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import ar.dev.jofrelautaro.reservation_backend.model.dto.EntregaAlumnoDTO;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TareaProgramadaService {

    private final TareaProgramadaRepository tareaRepository;
    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EntregaTareaRepository entregaTareaRepository;   
    private final CloudinaryService cloudinaryService;        // 🔌 NUEVO
    private final InscripcionRepository inscripcionRepository;
    private final ModuloRepository moduloRepository; // 🔌 NUEVO, si usás módulos en tus tareas
    private final EmailService emailService;

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;
    // private final InscripcionRepository inscripcionRepository; <-- Descomentá si usás esto

    public List<TareaCalendarioDTO> obtenerCalendarioAlumno(String emailUsuario) {
        
        // 1. Buscamos al usuario real en la base de datos
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // 2. Buscamos las inscripciones de este usuario y sacamos solo los IDs de los cursos
        // (Nota: Ajustá el "getCurso()" según cómo hayas llamado a la propiedad en tu entidad Inscripcion)
        List<Long> idsCursosDelAlumno = inscripcionRepository.findByUsuarioId(usuario.getId())
                .stream()
                .map(inscripcion -> inscripcion.getCurso().getId())
                .collect(Collectors.toList());

        // Si el alumno es nuevo y no está anotado a ningún curso, devolvemos un calendario vacío
        if (idsCursosDelAlumno.isEmpty()) {
            return List.of();
        }

        // 3. Buscamos las tareas que correspondan a esos IDs
        List<TareaProgramada> tareas = tareaRepository.findByCursoIdIn(idsCursosDelAlumno);

        // 4. Mapeamos al DTO del calendario (esto queda igual que antes)
        return tareas.stream().map(tarea -> 
            TareaCalendarioDTO.builder()
                .id(tarea.getId())
                .title(tarea.getCurso().getTitulo() + " - " + tarea.getTitulo())
                .start(tarea.getFechaLimite())
                .end(tarea.getFechaLimite())
                .cursoId(tarea.getCurso().getId())
                .cursoTitulo(tarea.getCurso().getTitulo())
                .build()
        ).collect(Collectors.toList());
    }
    public TareaProgramada crearTarea(TareaRequestDTO request) {
        Curso curso = cursoRepository.findById(request.getCursoId())
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
        Modulo modulo = moduloRepository.findById(request.getModuloId())
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));
        TareaProgramada nuevaTarea = TareaProgramada.builder()
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .fechaLimite(request.getFechaLimite())
                .curso(curso)
                .modulo(modulo)
                .build();

        return tareaRepository.save(nuevaTarea);
    }

    public TareaProgramada editarTarea(Long id, TareaRequestDTO request) {
        TareaProgramada tareaExistente = tareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        tareaExistente.setTitulo(request.getTitulo());
        tareaExistente.setDescripcion(request.getDescripcion());
        tareaExistente.setFechaLimite(request.getFechaLimite());

        // Si cambió de curso, lo actualizamos
        if (!tareaExistente.getCurso().getId().equals(request.getCursoId())) {
            Curso nuevoCurso = cursoRepository.findById(request.getCursoId())
                    .orElseThrow(() -> new RuntimeException("Curso no encontrado"));
            tareaExistente.setCurso(nuevoCurso);
        }

        return tareaRepository.save(tareaExistente);
    }

    public void eliminarTarea(Long id) {
        tareaRepository.deleteById(id);
    }
    // Método para que el alumno entregue su tarea
// Método para que el alumno entregue su tarea (Actualizado con lógica Upsert)
    public EntregaTarea entregarTarea(Long tareaId, Long alumnoId, MultipartFile archivo, String comentario) {
        TareaProgramada tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        // 1. Validar que la tarea no esté vencida
        if (LocalDateTime.now().isAfter(tarea.getFechaLimite())) {
            throw new RuntimeException("El plazo de entrega ha finalizado.");
        }

        Usuario alumno = usuarioRepository.findById(alumnoId)
                .orElseThrow(() -> new RuntimeException("Alumno no encontrado"));

        // 2. Subir el nuevo archivo a Cloudinary
        String urlArchivo = cloudinaryService.subirArchivo(archivo);

        // 3. Buscar si ya existe una entrega previa
        java.util.Optional<EntregaTarea> entregaExistente = entregaTareaRepository.findByTareaIdAndAlumnoId(tareaId, alumnoId);

        EntregaTarea entrega;
        if (entregaExistente.isPresent()) {
            // Si ya existe, "pisamos" los datos con los nuevos
            entrega = entregaExistente.get();
            entrega.setArchivoAlumnoUrl(urlArchivo);
            entrega.setComentarioAlumno(comentario);
            entrega.setFechaEntrega(LocalDateTime.now());
        } else {
            // Si es la primera vez, creamos una nueva
            entrega = EntregaTarea.builder()
                    .archivoAlumnoUrl(urlArchivo)
                    .fechaEntrega(LocalDateTime.now())
                    .comentarioAlumno(comentario)
                    .tarea(tarea)
                    .alumno(alumno)
                    .build();
        }

        return entregaTareaRepository.save(entrega);
    }

    public java.util.Optional<EntregaTarea> obtenerEntregaDeAlumno(Long tareaId, Long alumnoId) {
        return entregaTareaRepository.findByTareaIdAndAlumnoId(tareaId, alumnoId);
    }

    public List<EntregaAlumnoDTO> obtenerBuzonCorrecciones(Long tareaId) {
        TareaProgramada tarea = tareaRepository.findById(tareaId)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        Long cursoId = null;
        if (tarea.getCurso() != null) {
            cursoId = tarea.getCurso().getId();
        } else if (tarea.getModulo() != null && tarea.getModulo().getCurso() != null) {
            cursoId = tarea.getModulo().getCurso().getId();
        }

        if (cursoId == null) {
            throw new RuntimeException("No se pudo determinar el curso de la tarea");
        }

        List<Usuario> alumnos = inscripcionRepository.findUsuariosByCursoId(cursoId);
        Map<Long, EntregaTarea> entregasPorAlumno = entregaTareaRepository.findByTareaId(tareaId)
                .stream()
                .filter(entrega -> entrega.getAlumno() != null)
                .collect(Collectors.toMap(entrega -> entrega.getAlumno().getId(), entrega -> entrega));

        return alumnos.stream().map(alumno -> {
            EntregaTarea entrega = entregasPorAlumno.get(alumno.getId());
            return EntregaAlumnoDTO.builder()
                    .alumnoId(alumno.getId())
                    .nombreAlumno(alumno.getNombre())
                    .emailAlumno(alumno.getEmail())
                    .entregado(entrega != null)
                    .entregaId(entrega != null ? entrega.getId() : null)
                    .archivoAlumnoUrl(entrega != null ? entrega.getArchivoAlumnoUrl() : null)
                    .fechaEntrega(entrega != null ? entrega.getFechaEntrega() : null)
                    .comentarioAlumno(entrega != null ? entrega.getComentarioAlumno() : null)
                    .nota(entrega != null ? entrega.getNota() : null)
                    .feedbackDocente(entrega != null ? entrega.getFeedbackDocente() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    public EntregaTarea corregirEntrega(Long entregaId, Double nota, String feedbackDocente) {
        EntregaTarea entrega = entregaTareaRepository.findById(entregaId)
                .orElseThrow(() -> new RuntimeException("Entrega no encontrada"));

        entrega.setNota(nota);
        entrega.setFeedbackDocente(feedbackDocente);
        EntregaTarea entregaGuardada = entregaTareaRepository.save(entrega);

        // Enviamos notificación por email al alumno
        String destinatario = entregaGuardada.getAlumno() != null ? entregaGuardada.getAlumno().getEmail() : null;
        if (destinatario != null && !destinatario.isBlank()) {
            String nombreAlumno = entregaGuardada.getAlumno().getNombre();
            String tituloTarea = entregaGuardada.getTarea() != null ? entregaGuardada.getTarea().getTitulo() : "tu tarea";
            String nombreProfesor = obtenerNombreProfesor();
            Long cursoId = obtenerCursoId(entregaGuardada.getTarea());
            String enlace = frontendBaseUrl + "/aula/" + (cursoId != null ? cursoId : "");
            String cuerpo = "Hola " + (nombreAlumno != null ? nombreAlumno : "Alumno") + ",\n\n" +
                    "Tu entrega de la tarea '" + tituloTarea + "' ha sido corregida.\n\n" +
                    "Nota: " + (nota != null ? nota : "No calificada") + "\n\n" +
                    "Comentarios del profesor:\n" + (feedbackDocente != null && !feedbackDocente.isBlank() ? feedbackDocente : "Sin comentarios adicionales") + "\n\n" +
                    "Ingresá a la plataforma para ver más detalles:\n" + enlace + "\n\n" +
                    "Saludos,\n" + nombreProfesor;

            try {
                emailService.enviarCorreoSimple(destinatario, "Tu entrega ha sido corregida", cuerpo);
            } catch (Exception e) {
                System.err.println("Error enviando notificación de corrección: " + e.getMessage());
            }
        }

        return entregaGuardada;
    }

    private String obtenerNombreProfesor() {
        try {
            String emailProfesor = SecurityContextHolder.getContext().getAuthentication().getName();
            if (emailProfesor == null || emailProfesor.isBlank()) {
                return "Tu profesor";
            }
            return usuarioRepository.findByEmail(emailProfesor)
                    .map(Usuario::getNombre)
                    .filter(nombre -> nombre != null && !nombre.isBlank())
                    .orElse("Tu profesor");
        } catch (Exception e) {
            return "Tu profesor";
        }
    }

    private Long obtenerCursoId(TareaProgramada tarea) {
        if (tarea == null) {
            return null;
        }
        if (tarea.getCurso() != null) {
            return tarea.getCurso().getId();
        }
        if (tarea.getModulo() != null && tarea.getModulo().getCurso() != null) {
            return tarea.getModulo().getCurso().getId();
        }
        return null;
    }

    // Método para crear tarea con archivo de consigna (Admin)
    public TareaProgramada crearTareaConArchivo(TareaRequestDTO request, MultipartFile archivoConsigna) {
        String urlConsigna = null;
        if (archivoConsigna != null && !archivoConsigna.isEmpty()) {
            urlConsigna = cloudinaryService.subirArchivo(archivoConsigna);
        }

        // 1. ACÁ DEFINIMOS LA VARIABLE 'modulo'
        Modulo modulo = moduloRepository.findById(request.getModuloId())
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        // 2. AHORA SÍ ARMAMOS LA TAREA
        TareaProgramada nuevaTarea = TareaProgramada.builder()
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .fechaLimite(request.getFechaLimite())
                .archivoConsignaUrl(urlConsigna)
                .modulo(modulo) 
                .build();

        return tareaRepository.save(nuevaTarea);

        
    }

public List<TareaProgramada> obtenerTareasPorModulo(Long moduloId) {
        return tareaRepository.findByModuloId(moduloId);
    }
}

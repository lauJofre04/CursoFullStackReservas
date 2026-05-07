package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CursoRequest;
import ar.dev.jofrelautaro.reservation_backend.model.dto.CursoResponseDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Rol;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import jakarta.transaction.Transactional;

import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CloudinaryService cloudinaryService;
    // Verificar si el usuario actual es profesor del curso
    private boolean esProfesorDelCurso(Curso curso) {
        String emailUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return curso.getProfesores().contains(usuario);
    }

    // Verificar si el usuario actual es admin o profesor del curso
    private boolean puedeModificarCurso(Curso curso) {
        String emailUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        return usuario.getRol() == Rol.ADMIN || curso.getProfesores().contains(usuario);
    }
    // C - Crear (método existente)
    @Transactional
    @CacheEvict(value = "lista_cursos", allEntries = true)
    public Curso crearCurso(CursoRequest request) {
        // Verificar que solo admin puede crear cursos
        String emailUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("Solo los administradores pueden crear cursos");
        }
        
        Curso nuevoCurso = Curso.builder()
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .precio(request.getPrecio())
                .imagen(request.getImagen())
                // El activo=true y las fechas se llenan solas gracias a tu entidad
                .build();
        
        return cursoRepository.save(nuevoCurso);
    }

    // C - Crear con imagen subida a Cloudinary
    @Transactional
    @CacheEvict(value = "lista_cursos", allEntries = true)
    public Curso crearCursoConImagen(String titulo, String descripcion, Double precio, MultipartFile file) throws IOException {
        // Verificar que solo admin puede crear cursos
        String emailUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("Solo los administradores pueden crear cursos");
        }
        
        // 1. Sube la imagen a Cloudinary
        Map<String, Object> result = (Map<String, Object>) cloudinaryService.upload(file, "cursos");
        String urlImagen = result.get("url").toString();

        // 2. Crea el curso con la URL de Cloudinary
        Curso nuevoCurso = Curso.builder()
                .titulo(titulo)
                .descripcion(descripcion)
                .precio(precio)
                .imagen(urlImagen) // Guarda la URL de Cloudinary
                .build();

        return cursoRepository.save(nuevoCurso);
    }

    // R - Leer (Todos los activos)
    public Page<Curso> obtenerCursosActivos(Pageable pageable) {
        return cursoRepository.findAllByActivoTrue(pageable);
    }

    // R - Leer (Uno solo)
    public Curso obtenerCursoPorId(Long id) {
        return cursoRepository.findByIdAndActivoTrue(id)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado o ha sido eliminado"));
    }
    // Asegurate de importar CursoResponseDTO y java.util.stream.Collectors

    public List<CursoResponseDTO> obtenerTodos() {
        return cursoRepository.findAll().stream().map(curso -> 
            CursoResponseDTO.builder()
                .id(curso.getId())
                .titulo(curso.getTitulo())
                .descripcion(curso.getDescripcion())
                .precio(curso.getPrecio())
                .imagen(curso.getImagen())
                // 👇 ACÁ ESTÁ EL CAMBIO
                .activo(curso.getActivo()) 
                .build()
        ).collect(Collectors.toList());
    }
    // Cuando alguien llame a este método, Spring buscará en Redis ("lista_cursos").
    // Si no está, va a PostgreSQL, trae los datos, se los devuelve al usuario 
    // y GUARDA una copia en Redis para el próximo que pregunte.
    @Cacheable(value = "lista_cursos")
    public List<CursoResponseDTO> obtenerCursosActivos() {
        // Tu lógica actual para buscar en BD...
        return cursoRepository.findByActivoTrue()
            .stream()
            .map(this::convertirADTO)
            .collect(Collectors.toList());
    }

    // U - Actualizar
    @CacheEvict(value = "lista_cursos", allEntries = true) // Limpia la caché de cursos activos al actualizar
    public Curso actualizarCurso(Long id, CursoRequest request) {
        Curso cursoExistente = obtenerCursoPorId(id);
        
        // Verificar permisos: solo admin o profesor del curso pueden modificar
        if (!puedeModificarCurso(cursoExistente)) {
            throw new RuntimeException("No tienes permisos para modificar este curso");
        }
        
        cursoExistente.setTitulo(request.getTitulo());
        cursoExistente.setDescripcion(request.getDescripcion());
        cursoExistente.setPrecio(request.getPrecio());
        cursoExistente.setImagen(request.getImagen());
        
        return cursoRepository.save(cursoExistente);
    }

    // U - Actualizar con nueva imagen
    @CacheEvict(value = "lista_cursos", allEntries = true) // Limpia la caché de cursos activos al actualizar
    public Curso actualizarCursoConImagen(Long id, String titulo, String descripcion, Double precio, MultipartFile file) throws IOException {
        Curso cursoExistente = obtenerCursoPorId(id);
        
        // Verificar permisos: solo admin o profesor del curso pueden modificar
        if (!puedeModificarCurso(cursoExistente)) {
            throw new RuntimeException("No tienes permisos para modificar este curso");
        }
        
        // Actualiza solo los campos que vienen con datos
        if (titulo != null && !titulo.isBlank()) {
            cursoExistente.setTitulo(titulo);
        }
        if (descripcion != null && !descripcion.isBlank()) {
            cursoExistente.setDescripcion(descripcion);
        }
        if (precio != null && precio > 0) {
            cursoExistente.setPrecio(precio);
        }
        
        // Si hay archivo nuevo, lo subimos a Cloudinary
        if (file != null && !file.isEmpty()) {
            Map<String, Object> result = (Map<String, Object>) cloudinaryService.upload(file, "cursos");
            String urlImagen = result.get("url").toString();
            cursoExistente.setImagen(urlImagen);
        }
        
        return cursoRepository.save(cursoExistente);
    }

    // Asignar profesor a un curso (solo admin)
    @CacheEvict(value = "lista_cursos", allEntries = true) // Limpia la caché de cursos activos al asignar profesor
    public Curso asignarProfesor(Long cursoId, Long profesorId) {
        // Verificar que solo admin puede asignar profesores
        String emailUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario admin = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (admin.getRol() != Rol.ADMIN) {
            throw new RuntimeException("Solo los administradores pueden asignar profesores");
        }
        
        Curso curso = obtenerCursoPorId(cursoId);
        Usuario profesor = usuarioRepository.findById(profesorId)
                .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));
        
        if (profesor.getRol() != Rol.PROFESOR) {
            throw new RuntimeException("El usuario seleccionado no es un profesor");
        }
        
        curso.getProfesores().add(profesor);
        return cursoRepository.save(curso);
    }

    // Obtener cursos donde el usuario actual es profesor (o todos si es ADMIN)
    public List<Curso> obtenerCursosDelProfesor() {
        String emailUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        // Si es ADMIN, retorna todos los cursos activos
        if (usuario.getRol() == Rol.ADMIN) {
            return cursoRepository.findAllByActivoTrue(
                    org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)
            ).getContent();
        }
        
        // Si es profesor, solo retorna sus cursos
        return cursoRepository.findByProfesoresAndActivoTrue(usuario);
    }

    // D - Borrar (Soft Delete)
    public void eliminarCurso(Long id) {
        Curso curso = obtenerCursoPorId(id);
        
        // Verificar permisos: solo admin puede eliminar cursos
        String emailUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        if (usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("Solo los administradores pueden eliminar cursos");
        }
        
        curso.setActivo(false); // ¡Acá está la magia del Soft Delete! Lo "apagamos".
        cursoRepository.save(curso);
    }

    // Este método va suelto adentro de CursoService
    private CursoResponseDTO convertirADTO(Curso curso) {
        return CursoResponseDTO.builder()
                .id(curso.getId())
                .titulo(curso.getTitulo())
                .descripcion(curso.getDescripcion())
                .precio(curso.getPrecio())
                .imagen(curso.getImagen())
                .activo(curso.getActivo()) // Agregamos el campo activo al DTO  

                // ... (mapeá los campos que tengas en tu DTO)
                .build();
    }

}
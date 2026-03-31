package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CursoRequest;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;


@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;
    private final CloudinaryService cloudinaryService;

    // C - Crear (método existente)
    public Curso crearCurso(CursoRequest request) {
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
    public Curso crearCursoConImagen(String titulo, String descripcion, Double precio, MultipartFile file) throws IOException {
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

    // U - Actualizar
    public Curso actualizarCurso(Long id, CursoRequest request) {
        Curso cursoExistente = obtenerCursoPorId(id);
        
        cursoExistente.setTitulo(request.getTitulo());
        cursoExistente.setDescripcion(request.getDescripcion());
        cursoExistente.setPrecio(request.getPrecio());
        cursoExistente.setImagen(request.getImagen());
        
        return cursoRepository.save(cursoExistente);
    }

    // U - Actualizar con nueva imagen
    public Curso actualizarCursoConImagen(Long id, String titulo, String descripcion, Double precio, MultipartFile file) throws IOException {
        Curso cursoExistente = obtenerCursoPorId(id);
        
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

    // D - Borrar (Soft Delete)
    public void eliminarCurso(Long id) {
        Curso curso = obtenerCursoPorId(id);
        curso.setActivo(false); // ¡Acá está la magia del Soft Delete! Lo "apagamos".
        cursoRepository.save(curso);
    }
}
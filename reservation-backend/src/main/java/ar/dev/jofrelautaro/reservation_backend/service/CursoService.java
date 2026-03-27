package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CursoRequest;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class CursoService {

    private final CursoRepository cursoRepository;

    // C - Crear
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

    // D - Borrar (Soft Delete)
    public void eliminarCurso(Long id) {
        Curso curso = obtenerCursoPorId(id);
        curso.setActivo(false); // ¡Acá está la magia del Soft Delete! Lo "apagamos".
        cursoRepository.save(curso);
    }
}
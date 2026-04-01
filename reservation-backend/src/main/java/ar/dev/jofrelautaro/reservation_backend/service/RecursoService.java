package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CreateRecursoRequest;
import ar.dev.jofrelautaro.reservation_backend.model.dto.RecursoDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Leccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Recurso;
import ar.dev.jofrelautaro.reservation_backend.repository.LeccionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.RecursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RecursoService {

    private final RecursoRepository recursoRepository;
    private final LeccionRepository leccionRepository;

    /**
     * Obtener todos los recursos de una lección
     */
    public List<RecursoDTO> obtenerRecursosPorLeccion(Long leccionId) {
        System.out.println("📄 Obteniendo recursos de lección: " + leccionId);
        
        List<Recurso> recursos = recursoRepository.findByLeccionIdOrderByOrden(leccionId);
        
        return recursos.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Crear un nuevo recurso en una lección
     * Los PDFs se suben a Cloudinary previamente
     */
    public RecursoDTO crearRecurso(Long leccionId, CreateRecursoRequest request) {
        System.out.println("➕ Creando recurso en lección: " + leccionId);
        System.out.println("📦 Tipo: " + request.getTipo() + " | URL: " + request.getUrlRecurso());
        
        Leccion leccion = leccionRepository.findById(leccionId)
                .orElseThrow(() -> new RuntimeException("Lección no encontrada"));

        Recurso recurso = Recurso.builder()
                .leccion(leccion)
                .titulo(request.getTitulo())
                .tipo(request.getTipo())
                .urlRecurso(request.getUrlRecurso())
                .descripcion(request.getDescripcion())
                .orden(request.getOrden())
                .build();

        Recurso recursoGuardado = recursoRepository.save(recurso);
        System.out.println("✅ Recurso creado: " + recursoGuardado.getId());
        
        return convertirADTO(recursoGuardado);
    }

    /**
     * Actualizar un recurso
     */
    public RecursoDTO actualizarRecurso(Long leccionId, Long recursoId, CreateRecursoRequest request) {
        System.out.println("✏️ Actualizando recurso: " + recursoId);
        
        Recurso recurso = recursoRepository.findByIdAndLeccionId(recursoId, leccionId)
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));

        recurso.setTitulo(request.getTitulo());
        recurso.setTipo(request.getTipo());
        recurso.setUrlRecurso(request.getUrlRecurso());
        recurso.setDescripcion(request.getDescripcion());
        recurso.setOrden(request.getOrden());

        Recurso recursoActualizado = recursoRepository.save(recurso);
        System.out.println("✅ Recurso actualizado");
        
        return convertirADTO(recursoActualizado);
    }

    /**
     * Eliminar un recurso
     */
    public void eliminarRecurso(Long leccionId, Long recursoId) {
        System.out.println("🗑️ Eliminando recurso: " + recursoId);
        
        Recurso recurso = recursoRepository.findByIdAndLeccionId(recursoId, leccionId)
                .orElseThrow(() -> new RuntimeException("Recurso no encontrado"));

        recursoRepository.delete(recurso);
        System.out.println("✅ Recurso eliminado");
    }

    /**
     * Convertir entidad Recurso a DTO
     */
    private RecursoDTO convertirADTO(Recurso recurso) {
        return RecursoDTO.builder()
                .id(recurso.getId())
                .titulo(recurso.getTitulo())
                .tipo(recurso.getTipo())
                .urlRecurso(recurso.getUrlRecurso())
                .descripcion(recurso.getDescripcion())
                .orden(recurso.getOrden())
                .fechaCreacion(recurso.getFechaCreacion())
                .build();
    }
}

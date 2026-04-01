package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CreateLeccionRequest;
import ar.dev.jofrelautaro.reservation_backend.model.dto.LeccionDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Leccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Modulo;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Recurso;
import ar.dev.jofrelautaro.reservation_backend.repository.LeccionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ModuloRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.RecursoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class LeccionService {

    private final LeccionRepository leccionRepository;
    private final ModuloRepository moduloRepository;
    private final RecursoRepository recursoRepository;

    /**
     * Obtener todas las lecciones de un módulo
     */
    public List<LeccionDTO> obtenerLeccionesPorModulo(Long moduloId) {
        System.out.println("📖 Obteniendo lecciones del módulo: " + moduloId);
        
        List<Leccion> lecciones = leccionRepository.findByModuloIdOrderByOrden(moduloId);
        
        return lecciones.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Crear una nueva lección en un módulo
     */
    public LeccionDTO crearLeccion(Long moduloId, CreateLeccionRequest request) {
        System.out.println("➕ Creando lección en módulo: " + moduloId);
        
        Modulo modulo = moduloRepository.findById(moduloId)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        Leccion leccion = Leccion.builder()
                .modulo(modulo)
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .duracionMinutos(request.getDuracionMinutos())
                .orden(request.getOrden())
                .build();

        Leccion leccionGuardada = leccionRepository.save(leccion);
        System.out.println("✅ Lección creada: " + leccionGuardada.getId());
        
        return convertirADTO(leccionGuardada);
    }

    /**
     * Actualizar una lección
     */
    public LeccionDTO actualizarLeccion(Long moduloId, Long leccionId, CreateLeccionRequest request) {
        System.out.println("✏️ Actualizando lección: " + leccionId);
        
        Leccion leccion = leccionRepository.findByIdAndModuloId(leccionId, moduloId)
                .orElseThrow(() -> new RuntimeException("Lección no encontrada"));

        leccion.setTitulo(request.getTitulo());
        leccion.setDescripcion(request.getDescripcion());
        leccion.setDuracionMinutos(request.getDuracionMinutos());
        leccion.setOrden(request.getOrden());

        Leccion leccionActualizada = leccionRepository.save(leccion);
        System.out.println("✅ Lección actualizada");
        
        return convertirADTO(leccionActualizada);
    }

    /**
     * Eliminar una lección
     */
    public void eliminarLeccion(Long moduloId, Long leccionId) {
        System.out.println("🗑️ Eliminando lección: " + leccionId);
        
        Leccion leccion = leccionRepository.findByIdAndModuloId(leccionId, moduloId)
                .orElseThrow(() -> new RuntimeException("Lección no encontrada"));

        leccionRepository.delete(leccion);
        System.out.println("✅ Lección eliminada");
    }

    /**
     * Obtener una lección con sus recursos
     */
    public LeccionDTO obtenerLeccionConRecursos(Long leccionId) {
        System.out.println("📖 Obteniendo lección con recursos: " + leccionId);
        
        Leccion leccion = leccionRepository.findById(leccionId)
                .orElseThrow(() -> new RuntimeException("Lección no encontrada"));
        
        return convertirADTO(leccion);
    }

    /**
     * Convertir entidad Leccion a DTO
     */
    private LeccionDTO convertirADTO(Leccion leccion) {
        List<Recurso> recursos = recursoRepository.findByLeccionIdOrderByOrden(leccion.getId());
        
        return LeccionDTO.builder()
                .id(leccion.getId())
                .titulo(leccion.getTitulo())
                .descripcion(leccion.getDescripcion())
                .duracionMinutos(leccion.getDuracionMinutos())
                .orden(leccion.getOrden())
                .fechaCreacion(leccion.getFechaCreacion())
                .recursos(recursos.stream()
                        .map(recurso -> new ar.dev.jofrelautaro.reservation_backend.model.dto.RecursoDTO(
                                recurso.getId(),
                                recurso.getTitulo(),
                                recurso.getTipo(),
                                recurso.getUrlRecurso(),
                                recurso.getDescripcion(),
                                recurso.getOrden(),
                                recurso.getFechaCreacion()
                        ))
                        .collect(Collectors.toList()))
                .completada(leccion.getCompletada())
                .build();
    }
}

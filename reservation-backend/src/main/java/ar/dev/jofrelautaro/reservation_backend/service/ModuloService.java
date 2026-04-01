package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CreateModuloRequest;
import ar.dev.jofrelautaro.reservation_backend.model.dto.ModuloDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Modulo;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Leccion;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ModuloRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.LeccionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ModuloService {

    private final ModuloRepository moduloRepository;
    private final CursoRepository cursoRepository;
    private final LeccionRepository leccionRepository;

    /**
     * Obtener todos los módulos de un curso con sus lecciones
     */
    public List<ModuloDTO> obtenerModulosPorCurso(Long cursoId) {
        System.out.println("📚 Obteniendo módulos del curso: " + cursoId);
        
        List<Modulo> modulos = moduloRepository.findByCursoIdOrderByOrden(cursoId);
        
        return modulos.stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    /**
     * Crear un nuevo módulo en un curso
     */
    public ModuloDTO crearModulo(Long cursoId, CreateModuloRequest request) {
        System.out.println("➕ Creando módulo para curso: " + cursoId);
        
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        Modulo modulo = Modulo.builder()
                .curso(curso)
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .orden(request.getOrden())
                .build();

        Modulo moduloGuardado = moduloRepository.save(modulo);
        System.out.println("✅ Módulo creado: " + moduloGuardado.getId());
        
        return convertirADTO(moduloGuardado);
    }

    /**
     * Actualizar un módulo
     */
    public ModuloDTO actualizarModulo(Long cursoId, Long moduloId, CreateModuloRequest request) {
        System.out.println("✏️ Actualizando módulo: " + moduloId);
        
        Modulo modulo = moduloRepository.findByIdAndCursoId(moduloId, cursoId)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        modulo.setTitulo(request.getTitulo());
        modulo.setDescripcion(request.getDescripcion());
        modulo.setOrden(request.getOrden());

        Modulo moduloActualizado = moduloRepository.save(modulo);
        System.out.println("✅ Módulo actualizado");
        
        return convertirADTO(moduloActualizado);
    }

    /**
     * Eliminar un módulo (también elimina sus lecciones)
     */
    public void eliminarModulo(Long cursoId, Long moduloId) {
        System.out.println("🗑️ Eliminando módulo: " + moduloId);
        
        Modulo modulo = moduloRepository.findByIdAndCursoId(moduloId, cursoId)
                .orElseThrow(() -> new RuntimeException("Módulo no encontrado"));

        moduloRepository.delete(modulo);
        System.out.println("✅ Módulo eliminado");
    }

    /**
     * Convertir entidad Modulo a DTO
     */
    private ModuloDTO convertirADTO(Modulo modulo) {
        List<Leccion> lecciones = leccionRepository.findByModuloIdOrderByOrden(modulo.getId());
        
        return ModuloDTO.builder()
                .id(modulo.getId())
                .titulo(modulo.getTitulo())
                .descripcion(modulo.getDescripcion())
                .orden(modulo.getOrden())
                .fechaCreacion(modulo.getFechaCreacion())
                .lecciones(lecciones.stream()
                        .map(leccion -> new ar.dev.jofrelautaro.reservation_backend.model.dto.LeccionDTO(
                                leccion.getId(),
                                leccion.getTitulo(),
                                leccion.getDescripcion(),
                                leccion.getDuracionMinutos(),
                                leccion.getOrden(),
                                leccion.getFechaCreacion(),
                                null, // Los recursos se cargan por separado
                                leccion.getCompletada()
                        ))
                        .collect(Collectors.toList()))
                .build();
    }
}

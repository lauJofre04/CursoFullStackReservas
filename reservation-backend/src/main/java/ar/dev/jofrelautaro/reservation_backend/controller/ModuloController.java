package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CreateModuloRequest;
import ar.dev.jofrelautaro.reservation_backend.model.dto.ModuloDTO;
import ar.dev.jofrelautaro.reservation_backend.service.ModuloService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/modulos")
@RequiredArgsConstructor

public class ModuloController {

    private final ModuloService moduloService;

    /**
     * GET /api/modulos/curso/{cursoId}
     * Obtener todos los módulos de un curso (con sus lecciones)
     */
    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<ModuloDTO>> obtenerModulosPorCurso(@PathVariable Long cursoId) {
        try {
            System.out.println("📚 GET /api/modulos/curso/" + cursoId);
            List<ModuloDTO> modulos = moduloService.obtenerModulosPorCurso(cursoId);
            return ResponseEntity.ok(modulos);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST /api/modulos/curso/{cursoId}
     * Crear un nuevo módulo en un curso
     */
    @PostMapping("/curso/{cursoId}")
    public ResponseEntity<?> crearModulo(@PathVariable Long cursoId, @RequestBody CreateModuloRequest request) {
        try {
            System.out.println("➕ POST /api/modulos/curso/" + cursoId);
            ModuloDTO modulo = moduloService.crearModulo(cursoId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Módulo creado exitosamente");
            response.put("modulo", modulo);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/modulos/{moduloId}/curso/{cursoId}
     * Actualizar un módulo
     */
    @PutMapping("/{moduloId}/curso/{cursoId}")
    public ResponseEntity<?> actualizarModulo(
            @PathVariable Long cursoId,
            @PathVariable Long moduloId,
            @RequestBody CreateModuloRequest request) {
        try {
            System.out.println("✏️ PUT /api/modulos/" + moduloId);
            ModuloDTO modulo = moduloService.actualizarModulo(cursoId, moduloId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Módulo actualizado exitosamente");
            response.put("modulo", modulo);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/modulos/{moduloId}/curso/{cursoId}
     * Eliminar un módulo
     */
    @DeleteMapping("/{moduloId}/curso/{cursoId}")
    public ResponseEntity<?> eliminarModulo(
            @PathVariable Long cursoId,
            @PathVariable Long moduloId) {
        try {
            System.out.println("🗑️ DELETE /api/modulos/" + moduloId);
            moduloService.eliminarModulo(cursoId, moduloId);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Módulo eliminado exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

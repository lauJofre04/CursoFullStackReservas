package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CreateLeccionRequest;
import ar.dev.jofrelautaro.reservation_backend.model.dto.LeccionDTO;
import ar.dev.jofrelautaro.reservation_backend.service.LeccionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lecciones")
@RequiredArgsConstructor

public class LeccionController {

    private final LeccionService leccionService;

    /**
     * GET /api/lecciones/modulo/{moduloId}
     * Obtener todas las lecciones de un módulo
     */
    @GetMapping("/modulo/{moduloId}")
    public ResponseEntity<List<LeccionDTO>> obtenerLeccionesPorModulo(@PathVariable Long moduloId) {
        try {
            System.out.println("📖 GET /api/lecciones/modulo/" + moduloId);
            List<LeccionDTO> lecciones = leccionService.obtenerLeccionesPorModulo(moduloId);
            return ResponseEntity.ok(lecciones);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/lecciones/{leccionId}
     * Obtener una lección con sus recursos
     */
    @GetMapping("/{leccionId}")
    public ResponseEntity<LeccionDTO> obtenerLeccionConRecursos(@PathVariable Long leccionId) {
        try {
            System.out.println("📖 GET /api/lecciones/" + leccionId);
            LeccionDTO leccion = leccionService.obtenerLeccionConRecursos(leccionId);
            return ResponseEntity.ok(leccion);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * POST /api/lecciones/modulo/{moduloId}
     * Crear una nueva lección en un módulo
     */
    @PostMapping("/modulo/{moduloId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PROFESOR')")
    public ResponseEntity<?> crearLeccion(@PathVariable Long moduloId, @RequestBody CreateLeccionRequest request) {
        try {
            System.out.println("➕ POST /api/lecciones/modulo/" + moduloId);
            LeccionDTO leccion = leccionService.crearLeccion(moduloId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Lección creada exitosamente");
            response.put("leccion", leccion);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/lecciones/{leccionId}/modulo/{moduloId}
     * Actualizar una lección
     */
    @PutMapping("/{leccionId}/modulo/{moduloId}")
    public ResponseEntity<?> actualizarLeccion(
            @PathVariable Long moduloId,
            @PathVariable Long leccionId,
            @RequestBody CreateLeccionRequest request) {
        try {
            System.out.println("✏️ PUT /api/lecciones/" + leccionId);
            LeccionDTO leccion = leccionService.actualizarLeccion(moduloId, leccionId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Lección actualizada exitosamente");
            response.put("leccion", leccion);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/lecciones/{leccionId}/modulo/{moduloId}
     * Eliminar una lección
     */
    @DeleteMapping("/{leccionId}/modulo/{moduloId}")
    public ResponseEntity<?> eliminarLeccion(
            @PathVariable Long moduloId,
            @PathVariable Long leccionId) {
        try {
            System.out.println("🗑️ DELETE /api/lecciones/" + leccionId);
            leccionService.eliminarLeccion(moduloId, leccionId);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Lección eliminada exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

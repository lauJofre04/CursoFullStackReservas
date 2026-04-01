package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CreateRecursoRequest;
import ar.dev.jofrelautaro.reservation_backend.model.dto.RecursoDTO;
import ar.dev.jofrelautaro.reservation_backend.service.RecursoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recursos")
@RequiredArgsConstructor
@CrossOrigin
public class RecursoController {

    private final RecursoService recursoService;

    /**
     * GET /api/recursos/leccion/{leccionId}
     * Obtener todos los recursos de una lección
     */
    @GetMapping("/leccion/{leccionId}")
    public ResponseEntity<List<RecursoDTO>> obtenerRecursosPorLeccion(@PathVariable Long leccionId) {
        try {
            System.out.println("📄 GET /api/recursos/leccion/" + leccionId);
            List<RecursoDTO> recursos = recursoService.obtenerRecursosPorLeccion(leccionId);
            return ResponseEntity.ok(recursos);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * POST /api/recursos/leccion/{leccionId}
     * Crear un nuevo recurso en una lección
     */
    @PostMapping("/leccion/{leccionId}")
    public ResponseEntity<?> crearRecurso(@PathVariable Long leccionId, @RequestBody CreateRecursoRequest request) {
        try {
            System.out.println("➕ POST /api/recursos/leccion/" + leccionId);
            RecursoDTO recurso = recursoService.crearRecurso(leccionId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Recurso creado exitosamente");
            response.put("recurso", recurso);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/recursos/{recursoId}/leccion/{leccionId}
     * Actualizar un recurso
     */
    @PutMapping("/{recursoId}/leccion/{leccionId}")
    public ResponseEntity<?> actualizarRecurso(
            @PathVariable Long leccionId,
            @PathVariable Long recursoId,
            @RequestBody CreateRecursoRequest request) {
        try {
            System.out.println("✏️ PUT /api/recursos/" + recursoId);
            RecursoDTO recurso = recursoService.actualizarRecurso(leccionId, recursoId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mensaje", "Recurso actualizado exitosamente");
            response.put("recurso", recurso);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * DELETE /api/recursos/{recursoId}/leccion/{leccionId}
     * Eliminar un recurso
     */
    @DeleteMapping("/{recursoId}/leccion/{leccionId}")
    public ResponseEntity<?> eliminarRecurso(
            @PathVariable Long leccionId,
            @PathVariable Long recursoId) {
        try {
            System.out.println("🗑️ DELETE /api/recursos/" + recursoId);
            recursoService.eliminarRecurso(leccionId, recursoId);
            
            Map<String, String> response = new HashMap<>();
            response.put("mensaje", "Recurso eliminado exitosamente");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.entity.EntregaTarea;
import ar.dev.jofrelautaro.reservation_backend.model.entity.TareaProgramada;
import ar.dev.jofrelautaro.reservation_backend.model.dto.CorregirEntregaRequest;
import ar.dev.jofrelautaro.reservation_backend.model.dto.EntregaAlumnoDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.TareaCalendarioDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.TareaRequestDTO;
import ar.dev.jofrelautaro.reservation_backend.service.TareaProgramadaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
// import org.springframework.security.core.Authentication; <-- Descomentar cuando uses JWT real
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@RequiredArgsConstructor
public class TareaProgramadaController {

    private final TareaProgramadaService tareaService;

    // --- ACCIÓN DEL DOCENTE: Crear tarea con archivo ---
    @PostMapping(value = "/crear", consumes = {"multipart/form-data"})
    public ResponseEntity<TareaProgramada> crearTarea(
            @RequestPart("datos") TareaRequestDTO request,
            @RequestPart(value = "archivo", required = false) MultipartFile archivo) {
        return ResponseEntity.ok(tareaService.crearTareaConArchivo(request, archivo));
    }

    // --- ACCIÓN DEL ALUMNO: Entregar TP ---
    @PostMapping(value = "/{id}/entregar", consumes = {"multipart/form-data"})
    public ResponseEntity<EntregaTarea> realizarEntrega(
            @PathVariable Long id,
            @RequestParam("alumnoId") Long alumnoId,
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam(value = "comentario", required = false) String comentario) {
        
        return ResponseEntity.ok(tareaService.entregarTarea(id, alumnoId, archivo, comentario));
    }

    // --- ENDPOINT PARA EL ALUMNO: Consultar si ya entregó ---
    @GetMapping("/{tareaId}/mi-entrega")
    public ResponseEntity<EntregaTarea> obtenerMiEntrega(
            @PathVariable Long tareaId,
            @RequestParam Long alumnoId) {

        return tareaService.obtenerEntregaDeAlumno(tareaId, alumnoId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{tareaId}/buzon")
    public ResponseEntity<List<EntregaAlumnoDTO>> obtenerBuzonCorrecciones(@PathVariable Long tareaId) {
        return ResponseEntity.ok(tareaService.obtenerBuzonCorrecciones(tareaId));
    }

    @PutMapping("/entregas/{entregaId}/corregir")
    public ResponseEntity<EntregaTarea> corregirEntrega(
            @PathVariable Long entregaId,
            @RequestBody CorregirEntregaRequest request) {
        return ResponseEntity.ok(tareaService.corregirEntrega(entregaId, request.getNota(), request.getFeedbackDocente()));
    }

    // --- ENDPOINT PARA EL ALUMNO (FRONTEND CALENDARIO) ---
    @GetMapping("/calendario")
    public ResponseEntity<List<TareaCalendarioDTO>> obtenerMiCalendario(Authentication authentication) {
        
        // ¡El enchufe real! Spring Security extrae el email del token JWT
        String emailUsuario = authentication.getName(); 

        List<TareaCalendarioDTO> tareas = tareaService.obtenerCalendarioAlumno(emailUsuario);
        return ResponseEntity.ok(tareas);
    }
    

    // --- ENDPOINTS PARA EL ADMIN (CRUD) ---

    @PostMapping("/crear")
    public ResponseEntity<TareaProgramada> crearTarea(@RequestBody TareaRequestDTO request) {
        return ResponseEntity.ok(tareaService.crearTarea(request));
    }

    @PutMapping("/editar/{id}")
    public ResponseEntity<TareaProgramada> editarTarea(@PathVariable Long id, @RequestBody TareaRequestDTO request) {
        return ResponseEntity.ok(tareaService.editarTarea(id, request));
    }

    @DeleteMapping("/eliminar/{id}")
    public ResponseEntity<String> eliminarTarea(@PathVariable Long id) {
        tareaService.eliminarTarea(id);
        return ResponseEntity.ok("Tarea eliminada correctamente");
    }
    @GetMapping("/modulo/{moduloId}")
    public ResponseEntity<List<TareaProgramada>> obtenerTareasPorModulo(@PathVariable Long moduloId) {
        return ResponseEntity.ok(tareaService.obtenerTareasPorModulo(moduloId));
    }

}
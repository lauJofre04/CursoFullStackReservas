package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.EvaluacionCreacionDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.EvaluacionDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.EvaluacionSubmitDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.ResultadoEvaluacion;
import ar.dev.jofrelautaro.reservation_backend.service.EvaluacionService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/evaluaciones")
@RequiredArgsConstructor
@CrossOrigin
public class EvaluacionController {

    private final EvaluacionService evaluacionService;

    /**
     * GET /api/evaluaciones/{id}
     * Devuelve el examen limpio para que el alumno lo rinda.
     */
    @GetMapping("/{id}")
    public ResponseEntity<EvaluacionDTO> obtenerEvaluacionParaRendir(@PathVariable Long id) {
        EvaluacionDTO evaluacion = evaluacionService.obtenerEvaluacionParaAlumno(id);
        return ResponseEntity.ok(evaluacion);
    }

    /**
     * POST /api/evaluaciones/enviar
     * Recibe las respuestas del alumno, las corrige y devuelve la nota.
     */
    @PostMapping("/enviar")
    public ResponseEntity<Map<String, Object>> enviarRespuestas(@RequestBody EvaluacionSubmitDTO submitDTO) {
        // Sacamos el email del JWT que manda React en el header
        String emailUsuario = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Mandamos a corregir
        ResultadoEvaluacion resultado = evaluacionService.corregirExamen(submitDTO, emailUsuario);

        // Armamos una respuesta amigable para el Frontend
        Map<String, Object> response = new HashMap<>();
        response.put("puntaje", resultado.getPuntaje());
        response.put("aprobado", resultado.isAprobado());
        response.put("mensaje", resultado.isAprobado() ? "¡Felicitaciones, aprobaste!" : "No alcanzaste el mínimo para aprobar. ¡Sigue intentando!");

        return ResponseEntity.ok(response);
    }
    @GetMapping("/curso/{cursoId}")
    public ResponseEntity<List<EvaluacionDTO>> obtenerPorCurso(@PathVariable Long cursoId) {
        return ResponseEntity.ok(evaluacionService.obtenerEvaluacionesDeCurso(cursoId));
    }
    /**
     * POST /api/evaluaciones/crear
     * Uso exclusivo del Administrador para crear cuestionarios.
     */
    @PostMapping("/crear")
    public ResponseEntity<Map<String, String>> crearEvaluacion(@RequestBody EvaluacionCreacionDTO dto) {
        evaluacionService.crearEvaluacion(dto);
        
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Evaluación creada y guardada con éxito");
        response.put("status", "ok");
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
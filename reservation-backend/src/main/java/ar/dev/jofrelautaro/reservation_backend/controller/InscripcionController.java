package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CursoInscritoDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.InscripcionAdminRequest;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Inscripcion;
import ar.dev.jofrelautaro.reservation_backend.service.InscripcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inscripciones")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InscripcionController {

    private final InscripcionService inscripcionService;

    // POST /api/inscripciones/admin/matricular
    @PostMapping("/admin/matricular")
    public ResponseEntity<Map<String, String>> matricularManualmente(@RequestBody InscripcionAdminRequest request) {
        
        Inscripcion nuevaInscripcion = inscripcionService.matricularManualmente(request);

        // Armamos una respuesta limpia en formato JSON
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "¡Inscripción creada con éxito!");
        response.put("inscripcion_id", nuevaInscripcion.getId().toString());
        response.put("alumno", nuevaInscripcion.getUsuario().getEmail());
        response.put("curso", nuevaInscripcion.getCurso().getTitulo());
        response.put("estado", nuevaInscripcion.getEstado());

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    // GET /api/inscripciones/mis-cursos
    @GetMapping("/mis-cursos")
    public ResponseEntity<List<CursoInscritoDTO>> obtenerMisCursos() {
        return ResponseEntity.ok(inscripcionService.obtenerMisCursos());
    }
}
package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Inscripcion;
import ar.dev.jofrelautaro.reservation_backend.service.CursoService;
import ar.dev.jofrelautaro.reservation_backend.service.InscripcionService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/profesor")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfesorController {

    private final CursoService cursoService;
    private final InscripcionService inscripcionService;

    // Obtener cursos donde el profesor autenticado es dueño
    @GetMapping("/cursos")
    public ResponseEntity<List<Curso>> obtenerMisCursos() {
        return ResponseEntity.ok(cursoService.obtenerCursosDelProfesor());
    }

    // Obtener alumnos inscritos en un curso específico
    @GetMapping("/cursos/{cursoId}/alumnos")
    public ResponseEntity<List<Inscripcion>> obtenerAlumnosDelCurso(@PathVariable Long cursoId) {
        return ResponseEntity.ok(inscripcionService.obtenerAlumnosDelCurso(cursoId));
    }


}
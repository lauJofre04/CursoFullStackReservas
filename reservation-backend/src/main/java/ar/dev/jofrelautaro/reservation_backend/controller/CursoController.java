package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CursoRequest;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.service.CursoService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;


@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor

public class CursoController {

    private final CursoService cursoService;

    // 📖 Leer todos (Cursos activos)
    @GetMapping
    public ResponseEntity<Page<Curso>> obtenerTodos(Pageable pageable) {
        return ResponseEntity.ok(cursoService.obtenerCursosActivos(pageable));
    }

    // 📖 Leer uno solo por ID
    @GetMapping("/{id}")
    public ResponseEntity<Curso> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(cursoService.obtenerCursoPorId(id));
    }

    // ➕ Crear un curso nuevo (con imagen subida a Cloudinary)
    @PostMapping
    public ResponseEntity<Curso> crear(
            @RequestParam String titulo,
            @RequestParam String descripcion,
            @RequestParam Double precio,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        return new ResponseEntity<>(
                cursoService.crearCursoConImagen(titulo, descripcion, precio, file),
                HttpStatus.CREATED
        );
    }

    // ✏️ Actualizar un curso existente (con JSON)
    @PutMapping("/{id}")
    public ResponseEntity<Curso> actualizar(@PathVariable Long id, @RequestBody CursoRequest request) {
        return ResponseEntity.ok(cursoService.actualizarCurso(id, request));
    }

    // ✏️ Actualizar un curso con nueva imagen (FormData)
    @PutMapping("/{id}/imagen")
    public ResponseEntity<Curso> actualizarConImagen(
            @PathVariable Long id,
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) Double precio,
            @RequestParam(value = "file", required = false) MultipartFile file
    ) throws IOException {
        return ResponseEntity.ok(cursoService.actualizarCursoConImagen(id, titulo, descripcion, precio, file));
    }

    // 🗑️ Borrar un curso (Soft Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cursoService.eliminarCurso(id);
        return ResponseEntity.noContent().build(); // Devuelve un 204 No Content, ideal para borrados
    }

    // 👨‍🏫 Asignar profesor a un curso (solo admin)
    @PostMapping("/{cursoId}/profesores/{profesorId}")
    public ResponseEntity<Curso> asignarProfesor(@PathVariable Long cursoId, @PathVariable Long profesorId) {
        return ResponseEntity.ok(cursoService.asignarProfesor(cursoId, profesorId));
    }
}
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



@RestController
@RequestMapping("/api/cursos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Clave para que React no tenga problemas de CORS
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

    // ➕ Crear un curso nuevo
    @PostMapping
    public ResponseEntity<Curso> crear(@RequestBody CursoRequest request) {
        return new ResponseEntity<>(cursoService.crearCurso(request), HttpStatus.CREATED);
    }

    // ✏️ Actualizar un curso existente
    @PutMapping("/{id}")
    public ResponseEntity<Curso> actualizar(@PathVariable Long id, @RequestBody CursoRequest request) {
        return ResponseEntity.ok(cursoService.actualizarCurso(id, request));
    }

    // 🗑️ Borrar un curso (Soft Delete)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cursoService.eliminarCurso(id);
        return ResponseEntity.noContent().build(); // Devuelve un 204 No Content, ideal para borrados
    }
}
package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.entity.ProgresoLeccion;
import ar.dev.jofrelautaro.reservation_backend.service.ProgresoLeccionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/progreso")
@RequiredArgsConstructor
public class ProgresoLeccionController {

    private final ProgresoLeccionService progresoService;

    // React hace un "Ping" a este endpoint cada 5 o 10 segundos
    @PostMapping("/leccion/{leccionId}")
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<?> actualizarProgreso(
            @PathVariable Long leccionId,
            @RequestBody Map<String, Object> payload) {
        
        Integer segundos = (Integer) payload.get("segundos");
        Boolean completado = (Boolean) payload.get("completado");
        
        progresoService.actualizarProgreso(leccionId, segundos, completado);
        return ResponseEntity.ok().build();
    }

    // React llama a este endpoint apenas carga la página del video
    @GetMapping("/leccion/{leccionId}")
    @PreAuthorize("hasRole('ALUMNO')")
    public ResponseEntity<?> obtenerProgresoActual(@PathVariable Long leccionId) {
        ProgresoLeccion progreso = progresoService.obtenerProgreso(leccionId);
        
        if (progreso == null) {
            // Si nunca vio el video, devolvemos 0
            return ResponseEntity.ok(Map.of("segundos", 0, "completado", false));
        }
        
        return ResponseEntity.ok(Map.of(
                "segundos", progreso.getTiempoVistoSegundos(),
                "completado", progreso.getCompletado()
        ));
    }
}
package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.ApunteLeccionDTO;
import ar.dev.jofrelautaro.reservation_backend.service.ApunteLeccionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/apuntes")
@RequiredArgsConstructor
public class ApunteLeccionController {

    private final ApunteLeccionService apunteLeccionService;

    @GetMapping("/leccion/{leccionId}")
    public ResponseEntity<List<ApunteLeccionDTO>> obtenerApuntesPorLeccion(
            @PathVariable Long leccionId,
            Authentication authentication
    ) {
        String email = authentication.getName();
        List<ApunteLeccionDTO> apuntes = apunteLeccionService.obtenerApuntesDeLeccionYUsuario(leccionId, email);
        return ResponseEntity.ok(apuntes);
    }

    @PostMapping("/leccion/{leccionId}")
    public ResponseEntity<ApunteLeccionDTO> crearApunte(
            @PathVariable Long leccionId,
            @RequestBody CrearApunteRequest request,
            Authentication authentication
    ) {
        String email = authentication.getName();
        ApunteLeccionDTO apunte = apunteLeccionService.guardarApunte(leccionId, email, request.getContenido(), request.getTiempoReferenciaSegundos());
        return ResponseEntity.ok(apunte);
    }

    @Data
    private static class CrearApunteRequest {
        private String contenido;
        private Integer tiempoReferenciaSegundos;
    }
}

package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.NotificacionDTO;
import ar.dev.jofrelautaro.reservation_backend.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<List<NotificacionDTO>> obtenerNotificaciones(Principal principal) {
        return ResponseEntity.ok(notificacionService.obtenerNotificaciones(principal.getName()));
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<NotificacionDTO> marcarNotificacionComoLeida(
            @PathVariable Long id,
            Principal principal
    ) {
        return ResponseEntity.ok(notificacionService.marcarComoLeida(principal.getName(), id));
    }

    @PutMapping("/leer-todas")
    public ResponseEntity<Void> marcarTodasComoLeidas(Principal principal) {
        notificacionService.marcarTodasComoLeidas(principal.getName());
        return ResponseEntity.noContent().build();
    }
}

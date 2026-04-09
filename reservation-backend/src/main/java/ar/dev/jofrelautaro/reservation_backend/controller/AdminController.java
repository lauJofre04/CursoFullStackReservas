package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.AdminEstadisticasDTO;
import ar.dev.jofrelautaro.reservation_backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/estadisticas")
    public ResponseEntity<AdminEstadisticasDTO> obtenerEstadisticas() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(grantedAuthority -> "ROLE_ADMIN".equals(grantedAuthority.getAuthority()));

        if (!esAdmin) {
            throw new AccessDeniedException("Acceso denegado: se requiere rol ADMIN");
        }

        return ResponseEntity.ok(adminService.obtenerEstadisticas());
    }
}

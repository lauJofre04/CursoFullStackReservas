package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CertificadoAlumnoDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.EnviarCertificadosRequest;
import ar.dev.jofrelautaro.reservation_backend.service.CertificadoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/admin/cursos/{cursoId}/certificados")
@RequiredArgsConstructor
public class CertificadoController {

    private final CertificadoService certificadoService;

    @GetMapping("/candidatos")
    public ResponseEntity<List<CertificadoAlumnoDTO>> obtenerCandidatos(@PathVariable Long cursoId) {
        validarAdmin();
        return ResponseEntity.ok(certificadoService.obtenerCandidatosCertificado(cursoId));
    }

    @PostMapping("/enviar")
    public ResponseEntity<Void> enviarCertificados(@PathVariable Long cursoId,
                                                   @RequestBody EnviarCertificadosRequest request) {
        validarAdmin();
        certificadoService.enviarCertificados(cursoId, request.getUsuarioIds());
        return ResponseEntity.ok().build();
    }

    private void validarAdmin() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acceso denegado. Solo administradores pueden acceder.");
        }
    }
}
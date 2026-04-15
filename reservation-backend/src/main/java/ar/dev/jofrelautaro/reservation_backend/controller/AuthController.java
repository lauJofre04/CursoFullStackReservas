package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.auth.AuthResponse;
import ar.dev.jofrelautaro.reservation_backend.auth.LoginRequest;
import ar.dev.jofrelautaro.reservation_backend.auth.RegisterRequest;
import ar.dev.jofrelautaro.reservation_backend.service.AuthService;
import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    // POST /api/auth/solicitar-recuperacion
    @PostMapping("/solicitar-recuperacion")
    public ResponseEntity<Map<String, String>> solicitarRecuperacion(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        authService.solicitarRecuperacionPassword(email);
        
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "Si el correo está registrado, te enviamos un link de recuperación.");
        return ResponseEntity.ok(response);
    }

    // POST /api/auth/cambiar-password
    @PostMapping("/cambiar-password")
    public ResponseEntity<Map<String, String>> cambiarPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String nuevaPassword = request.get("nuevaPassword");
        
        authService.cambiarPassword(token, nuevaPassword);
        
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "¡Contraseña actualizada con éxito! Ya podés iniciar sesión.");
        return ResponseEntity.ok(response);
    }
    @PostMapping("/verificar")
    public ResponseEntity<Map<String, String>> verificarCuenta(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        authService.verificarCuenta(token);
        
        Map<String, String> response = new HashMap<>();
        response.put("mensaje", "¡Tu cuenta ha sido verificada con éxito! Ya podés iniciar sesión.");
        return ResponseEntity.ok(response);
    }
    @PostMapping("/reenviar-verificacion")
    public ResponseEntity<Map<String, String>> reenviarVerificacion(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        authService.reenviarCorreoVerificacion(email);
        
        Map<String, String> response = new HashMap<>();
        // Mensaje genérico por seguridad (para no revelar qué mails existen)
        response.put("mensaje", "Si el correo existe y no está verificado, te enviamos un nuevo enlace.");
        return ResponseEntity.ok(response);
    }
    @PostMapping("/google")
    public ResponseEntity<?> loginConGoogle(@RequestBody Map<String, String> request) {
        String googleToken = request.get("token");
        
        try {
            // Acá llamaremos a tu servicio para validar y generar tu JWT
            String tuJwt = authService.loguearConGoogle(googleToken);
            return ResponseEntity.ok(Map.of("token", tuJwt));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token de Google inválido: " + e.getMessage()));
        }
    }
}
package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor // 1. Esto le dice a Lombok que cree el constructor para inyectar dependencias
public class TestController {

    // 2. Declaramos el servicio como una variable inyectada (con minúscula)
    private final EmailService emailService;

    @GetMapping("/email")
    public String probarEmail() {
        
        // 3. Usamos la variable "emailService" (con minúscula), NO la clase "EmailService"
        emailService.enviarCorreoSimple(
            "lautaro.jofre2004@gmail.com", // Cambiá esto por tu mail real
            "¡Alarma de Backend! 🚀",
            "Si te llegó este mail, Lautaro, significa que tu Spring Boot acaba de atravesar la matrix y se conectó con éxito a los servidores de Google. El SMTP está vivo."
        );
        
        return "Petición enviada. Mirá la consola de Spring Boot y tu bandeja de entrada.";
    }
}
package ar.dev.jofrelautaro.reservation_backend.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    // Inyectamos la herramienta nativa de Spring para mandar correos
    private final JavaMailSender mailSender;

    public void enviarCorreoSimple(String destinatario, String asunto, String cuerpo) {
        log.info("⏳ Intentando enviar correo a: {}", destinatario);
        
        try {
            SimpleMailMessage mensaje = new SimpleMailMessage();
            
            // Quién lo recibe, el título y el contenido
            mensaje.setTo(destinatario);
            mensaje.setSubject(asunto);
            mensaje.setText(cuerpo);
            
            // ¡Fuego!
            mailSender.send(mensaje);
            
            log.info("✅ Correo enviado con éxito a: {}", destinatario);
        } catch (Exception e) {
            log.error("❌ Error al enviar el correo. Revisar credenciales: {}", e.getMessage());
            throw new RuntimeException("No se pudo enviar el correo electrónico.");
        }
    }
}
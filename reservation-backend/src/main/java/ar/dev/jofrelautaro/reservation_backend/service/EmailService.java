package ar.dev.jofrelautaro.reservation_backend.service;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import jakarta.mail.internet.MimeMessage;

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

    public void enviarCorreoConAdjunto(String destinatario, String asunto, String cuerpo, byte[] archivo, String nombreArchivo) {
        log.info("⏳ Intentando enviar correo con adjunto a: {}", destinatario);

        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setTo(destinatario);
            helper.setSubject(asunto);
            helper.setText(cuerpo);
            helper.addAttachment(nombreArchivo, new ByteArrayResource(archivo));

            mailSender.send(mensaje);
            log.info("✅ Correo con adjunto enviado con éxito a: {}", destinatario);
        } catch (Exception e) {
            log.error("❌ Error al enviar correo con adjunto: {}", e.getMessage());
            throw new RuntimeException("No se pudo enviar el correo con el certificado adjunto.");
        }
    }

    public void enviarEmailRecordatorio(String destinatario, String curso, String tarea) {
        SimpleMailMessage mensaje = new SimpleMailMessage();
        mensaje.setTo(destinatario);
        mensaje.setSubject("⏰ Recordatorio de Entrega: " + curso);
        mensaje.setText("Hola!\n\nTe recordamos que hoy es el último día para entregar la tarea: '" 
                + tarea + "' del curso '" + curso + "'.\n\n¡No te olvides de subirla a la plataforma!\n\nSaludos,\nEl equipo de DevCursos.");

        mailSender.send(mensaje);
    }
}
package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.CertificadoAlumnoDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Inscripcion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ResultadoEvaluacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CertificadoService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final InscripcionRepository inscripcionRepository;
    private final ResultadoEvaluacionRepository resultadoEvaluacionRepository;
    private final CloudinaryService cloudinaryService;
    private final EmailService emailService;
    private final TemplateEngine pdfTemplateEngine;

    public List<CertificadoAlumnoDTO> obtenerCandidatosCertificado(Long cursoId) {
        List<Inscripcion> inscripciones = inscripcionRepository.findByCursoId(cursoId);
        Set<Long> aprobados = resultadoEvaluacionRepository
                .findByAprobadoTrueAndEvaluacionCursoId(cursoId)
                .stream()
                .map(resultado -> resultado.getUsuario().getId())
                .collect(Collectors.toSet());

        return inscripciones.stream()
                .map(inscripcion -> CertificadoAlumnoDTO.builder()
                        .usuarioId(inscripcion.getUsuario().getId())
                        .nombre(inscripcion.getUsuario().getNombre())
                        .email(inscripcion.getUsuario().getEmail())
                        .aprobado(aprobados.contains(inscripcion.getUsuario().getId()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void enviarCertificados(Long cursoId, List<Long> usuarioIds) {
        Curso curso = cursoRepository.findById(cursoId)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado."));

        Set<Long> usuariosAprobados = resultadoEvaluacionRepository
                .findByAprobadoTrueAndEvaluacionCursoId(cursoId)
                .stream()
                .map(resultado -> resultado.getUsuario().getId())
                .collect(Collectors.toSet());

        List<Usuario> usuarios = usuarioRepository.findAllById(usuarioIds).stream()
                .filter(usuario -> usuariosAprobados.contains(usuario.getId()))
                .collect(Collectors.toList());

        for (Usuario usuario : usuarios) {
            byte[] pdf = generarPdfCertificado(usuario.getNombre(), curso.getTitulo());
            String publicId = String.format("certificados/%s-%d", sanitizeFileName(curso.getTitulo()), usuario.getId());
            String url = cloudinaryService.subirArchivoBytes(pdf, "certificados_lms", publicId);

            String asunto = "Tu certificado del curso " + curso.getTitulo();
            String cuerpo = String.format("Hola %s!\n\nFelicitaciones por completar el curso '%s'.\n\nPuedes descargar tu certificado desde: %s\n\nAdjuntamos el archivo PDF con tu diploma.\n\nSaludos,\nEl equipo de la plataforma.",
                    usuario.getNombre(), curso.getTitulo(), url);

            emailService.enviarCorreoConAdjunto(usuario.getEmail(), asunto, cuerpo, pdf, String.format("certificado-%s.pdf", sanitizeFileName(curso.getTitulo())));
        }
    }

    private byte[] generarPdfCertificado(String nombreCompleto, String cursoTitulo) {
        // A. Preparar los datos dinámicos (Contexto de Thymeleaf)
        Context context = new Context();
        context.setVariable("alumnoNombre", nombreCompleto);
        context.setVariable("cursoTitulo", cursoTitulo);
        context.setVariable("fechaEmision", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));

        // B. Renderizar el HTML completo en un string
        String htmlCompleto = pdfTemplateEngine.process("certificado_template", context);

        // C. Convertir el HTML/CSS a PDF usando Flying Saucer
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            ITextRenderer renderer = new ITextRenderer();
            
            // Para que maneje bien las tildes y eñes
            renderer.setDocumentFromString(htmlCompleto, "UTF-8");
            renderer.layout();
            
            // Usamos tu motor OpenPDF que ya tenés inyectado
            renderer.createPDF(out);
            renderer.finishPDF();
            
        } catch (Exception e) {
            System.err.println("❌ ERROR GENERANDO PDF DESDE HTML: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error crítico generando certificado profesional", e);
        }
        
        return out.toByteArray();
    }

    private String sanitizeFileName(String value) {
        return value.replaceAll("[^a-zA-Z0-9-_\\.]+", "_").toLowerCase();
    }
}

package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Rol;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.TokenRecuperacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.TokenVerificacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import ar.dev.jofrelautaro.reservation_backend.service.EmailService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.http.MediaType;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = "spring.cache.type=none")
class AuthControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private TokenVerificacionRepository tokenVerificacionRepository;

    @Autowired
    private TokenRecuperacionRepository tokenRecuperacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @TestConfiguration
    static class TestConfig {

        @Bean
        public EmailService emailService() {
            return new EmailService(new NoOpJavaMailSender(), new org.thymeleaf.TemplateEngine());
        }

        private static class NoOpJavaMailSender implements JavaMailSender {
            @Override
            public MimeMessage createMimeMessage() {
                return new MimeMessage((Session) null);
            }

            @Override
            public MimeMessage createMimeMessage(java.io.InputStream contentStream) {
                return new MimeMessage((Session) null);
            }

            @Override
            public void send(SimpleMailMessage simpleMessage) {
                // no-op for tests
            }

            @Override
            public void send(SimpleMailMessage... simpleMessages) {
                // no-op for tests
            }

            @Override
            public void send(MimeMessage mimeMessage) {
                // no-op for tests
            }

            @Override
            public void send(MimeMessage... mimeMessages) {
                // no-op for tests
            }

            @Override
            public void send(org.springframework.mail.javamail.MimeMessagePreparator mimeMessagePreparator) {
                // no-op for tests
            }

            @Override
            public void send(org.springframework.mail.javamail.MimeMessagePreparator... mimeMessagePreparators) {
                // no-op for tests
            }
        }
    }

    @BeforeEach
    void setUp() {
        // Inicializamos MockMvc a mano, esquivando el error de AutoConfigure
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        tokenRecuperacionRepository.deleteAll();
        tokenVerificacionRepository.deleteAll();
        cursoRepository.deleteAll();
        usuarioRepository.deleteAll();
    }

    @Test
    void testRegistroExitoso() throws Exception {
        Map<String, Object> registroRequest = new HashMap<>();
        registroRequest.put("nombre", "Juan Pérez");
        registroRequest.put("email", "juan@test.com");
        registroRequest.put("password", "password123");
        registroRequest.put("rol", "ESTUDIANTE"); 

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registroRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());

        assert usuarioRepository.findByEmail("juan@test.com").isPresent();
    }

    @Test
    void testRegistroConEmailDuplicado() throws Exception {
        Usuario usuarioExistente = Usuario.builder()
                .nombre("Existente")
                .email("existente@test.com")
                .password(passwordEncoder.encode("pass123"))
                .rol(Rol.ESTUDIANTE) 
                .activo(true)
                .build();
        usuarioRepository.save(usuarioExistente);

        Map<String, Object> registroRequest = new HashMap<>();
        registroRequest.put("nombre", "Otro Usuario");
        registroRequest.put("email", "existente@test.com");
        registroRequest.put("password", "password123");
        registroRequest.put("rol", "ESTUDIANTE");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registroRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    void testLoginExitoso() throws Exception {
        Usuario usuario = Usuario.builder()
                .nombre("Test User")
                .email("test@test.com")
                .password(passwordEncoder.encode("password123"))
                .rol(Rol.ESTUDIANTE)
                .activo(true)
                .emailVerificado(true)
                .build();
        usuarioRepository.save(usuario);

        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "test@test.com");
        loginRequest.put("password", "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void testLoginConCredencialesIncorrectas() throws Exception {
        Map<String, String> loginRequest = new HashMap<>();
        loginRequest.put("email", "inexistente@test.com");
        loginRequest.put("password", "wrongpass");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
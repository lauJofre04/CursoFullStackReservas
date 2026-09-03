package ar.dev.jofrelautaro.reservation_backend.controller;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Rol;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ModuloRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.TokenRecuperacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.TokenVerificacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = "spring.cache.type=none")
class CursoControllerIntegrationTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    private MockMvc mockMvc;

    @Autowired
    private CursoRepository cursoRepository;

    @Autowired
    private InscripcionRepository inscripcionRepository;

    @Autowired
    private ModuloRepository moduloRepository;

    @Autowired
    private TokenVerificacionRepository tokenVerificacionRepository;

    @Autowired
    private TokenRecuperacionRepository tokenRecuperacionRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private Usuario profesorTest;

    @BeforeEach
    void setUp() throws Exception {
        // Inicializamos MockMvc a mano
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        
        tokenRecuperacionRepository.deleteAll();
        tokenVerificacionRepository.deleteAll();
        inscripcionRepository.deleteAll();
        moduloRepository.deleteAll();
        cursoRepository.deleteAll();
        usuarioRepository.deleteAll();

        profesorTest = Usuario.builder()
                .nombre("Profesor Test")
                .email("profesor@test.com")
                .password(passwordEncoder.encode("pass123"))
                .rol(Rol.PROFESOR)
                .activo(true)
                .build();
        usuarioRepository.save(profesorTest);
    }

    @Test
    void testObtenerCursosConPaginacion() throws Exception {
        for (int i = 1; i <= 5; i++) {
            Curso curso = Curso.builder()
                    .titulo("Curso " + i)
                    .descripcion("Descripción del curso " + i)
                    .precio((double) i * 100)
                    .imagen("https://example.com/imagen" + i + ".jpg")
                    .profesores(Set.of(profesorTest))
                    .activo(true)
                    .fechaCreacion(LocalDateTime.now())
                    .build();
            cursoRepository.save(curso);
        }

        mockMvc.perform(get("/api/cursos?page=0&size=3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(3))
                .andExpect(jsonPath("$.totalElements").value(5))
                .andExpect(jsonPath("$.last").value(false));
    }

    @Test
    void testObtenerCursoPorId() throws Exception {
        Curso curso = Curso.builder()
                .titulo("Curso JavaScript")
                .descripcion("Aprende JavaScript desde cero")
                .precio(99.99)
                .imagen("https://example.com/js.jpg")
                .profesores(Set.of(profesorTest))
                .activo(true)
                .fechaCreacion(LocalDateTime.now())
                .build();
        cursoRepository.save(curso);

        mockMvc.perform(get("/api/cursos/" + curso.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titulo").value("Curso JavaScript"))
                .andExpect(jsonPath("$.precio").value(99.99));
    }

    @Test
    void testObtenerCursoPorIdNoExistente() throws Exception {
        mockMvc.perform(get("/api/cursos/9999"))
                .andExpect(status().isNotFound());
    }
}
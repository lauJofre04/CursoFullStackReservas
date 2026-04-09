package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.entity.*;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ResultadoEvaluacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InscripcionServiceTest {

    @Mock
    private InscripcionRepository inscripcionRepository;

    @Mock
    private ResultadoEvaluacionRepository resultadoEvaluacionRepository;

    @InjectMocks
    private InscripcionService inscripcionService;

    private Usuario usuario;
    private Curso curso;
    private Inscripcion inscripcion;

    @BeforeEach
    void setUp() {
        usuario = Usuario.builder()
                .id(1L)
                .nombre("Juan")
                .email("juan@test.com")
                .build();

        curso = Curso.builder()
                .id(1L)
                .titulo("Spring Boot")
                .precio(100.00)
                .capacidadMaxima(10)
                .build();

        inscripcion = Inscripcion.builder()
                .id(1L)
                .usuario(usuario)
                .curso(curso)
                .build();
    }

    @Test
    void testInscribirUsuarioCupoLleno() {
        // Given
        when(inscripcionRepository.countByCurso(curso)).thenReturn(10L);

        // When & Then
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () ->
            inscripcionService.inscribirUsuario(curso, usuario));

        assertEquals("No hay cupos disponibles", exception.getMessage());
        verify(inscripcionRepository, never()).save(any(Inscripcion.class));
    }

    @Test
    void testCalcularProgresoCompletado() {
        // Given
        Evaluacion evaluacion1 = Evaluacion.builder().id(1L).build();
        Evaluacion evaluacion2 = Evaluacion.builder().id(2L).build();
        Evaluacion evaluacion3 = Evaluacion.builder().id(3L).build();
        Evaluacion evaluacion4 = Evaluacion.builder().id(4L).build();
        Evaluacion evaluacion5 = Evaluacion.builder().id(5L).build();

        List<Evaluacion> evaluaciones = Arrays.asList(evaluacion1, evaluacion2, evaluacion3, evaluacion4, evaluacion5);

        when(resultadoEvaluacionRepository.countByUsuarioAndEvaluacionCursoAndAprobadoTrue(inscripcion.getUsuario(), inscripcion.getCurso())).thenReturn(5L);
        when(resultadoEvaluacionRepository.countByUsuarioAndEvaluacionCurso(inscripcion.getUsuario(), inscripcion.getCurso())).thenReturn(5L);

        // When
        double progreso = inscripcionService.calcularProgreso(inscripcion, evaluaciones);

        // Then
        assertEquals(100.0, progreso);
    }

    @Test
    void testCalcularProgresoParcial() {
        // Given
        Evaluacion evaluacion1 = Evaluacion.builder().id(1L).build();
        Evaluacion evaluacion2 = Evaluacion.builder().id(2L).build();
        Evaluacion evaluacion3 = Evaluacion.builder().id(3L).build();

        List<Evaluacion> evaluaciones = Arrays.asList(evaluacion1, evaluacion2, evaluacion3);

        when(resultadoEvaluacionRepository.countByUsuarioAndEvaluacionCursoAndAprobadoTrue(inscripcion.getUsuario(), inscripcion.getCurso())).thenReturn(2L);
        when(resultadoEvaluacionRepository.countByUsuarioAndEvaluacionCurso(inscripcion.getUsuario(), inscripcion.getCurso())).thenReturn(3L);

        // When
        double progreso = inscripcionService.calcularProgreso(inscripcion, evaluaciones);

        // Then
        assertEquals(66.67, progreso, 0.01);
    }
}
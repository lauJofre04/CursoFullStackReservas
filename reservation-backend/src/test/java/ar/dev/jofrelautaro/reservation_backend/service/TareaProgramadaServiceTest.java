package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.entity.*;
import ar.dev.jofrelautaro.reservation_backend.repository.EntregaTareaRepository;
import ar.dev.jofrelautaro.reservation_backend.service.NotificacionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TareaProgramadaServiceTest {

    @Mock
    private EntregaTareaRepository entregaTareaRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private NotificacionService notificacionService;

    @InjectMocks
    private TareaProgramadaService tareaProgramadaService;

    private EntregaTarea entregaTarea;
    private Usuario alumno;

    @BeforeEach
    void setUp() {
        alumno = Usuario.builder()
                .id(2L)
                .nombre("Alumno")
                .email("alumno@test.com")
                .build();

        entregaTarea = EntregaTarea.builder()
                .id(1L)
                .alumno(alumno)
                .nota(null)
                .feedbackDocente(null)
                .fechaEntrega(LocalDateTime.now().minusDays(1))
                .build();
    }

    @Test
    void testCorregirEntregaExitosa() {
        // Given
        when(entregaTareaRepository.findById(1L)).thenReturn(Optional.of(entregaTarea));
        when(entregaTareaRepository.save(any(EntregaTarea.class))).thenReturn(entregaTarea);

        // When
        EntregaTarea result = tareaProgramadaService.corregirEntrega(1L, 8.5, "Excelente trabajo");

        // Then
        assertEquals(8.5, result.getNota());
        assertEquals("Excelente trabajo", result.getFeedbackDocente());
        verify(entregaTareaRepository).save(entregaTarea);
    }

    @Test
    void testCorregirEntregaNoEncontrada() {
        // Given
        when(entregaTareaRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () ->
            tareaProgramadaService.corregirEntrega(1L, 8.0, "Feedback"));

        assertEquals("Entrega no encontrada", exception.getMessage());
    }
}
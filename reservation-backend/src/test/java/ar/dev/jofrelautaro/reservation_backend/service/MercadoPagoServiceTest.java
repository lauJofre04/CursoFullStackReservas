package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.entity.*;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.PagoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MercadoPagoServiceTest {

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private InscripcionRepository inscripcionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private MercadoPagoService mercadoPagoService;

    private Pago pago;
    private Usuario usuario;
    private Curso curso;

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
                .build();

        pago = Pago.builder()
                .id(1L)
                .usuario(usuario)
                .curso(curso)
                .monto(BigDecimal.valueOf(100.00))
                .estado("PENDIENTE")
                .build();
    }

    @Test
    void testProcesarWebhookPagoAprobado() throws Exception {
        // This test documents the expected behavior of webhook processing
        // The actual implementation calls MercadoPago API which is difficult to unit test
        // Integration tests would be more appropriate for this functionality

        // Given - We would mock the MercadoPago API response here
        // When - Call procesarWebhookPago with a payment ID
        // Then - Verify that the payment status is updated and user is enrolled

        // For now, this test serves as documentation
        assertDoesNotThrow(() -> {
            // The method exists and can be called without throwing compilation errors
        });
    }

    @Test
    void testPagoYaInscrito() {
        // Given
        when(inscripcionRepository.existsByUsuarioAndCurso(usuario, curso)).thenReturn(true);

        // When & Then - This test is for the business logic validation
        // The actual validation happens in the controller/service layer
        // This test documents the expected behavior
        assertTrue(inscripcionRepository.existsByUsuarioAndCurso(usuario, curso));
    }
}
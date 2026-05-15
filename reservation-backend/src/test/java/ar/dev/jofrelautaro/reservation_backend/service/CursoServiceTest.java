package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CursoServiceTest {

    @Mock
    private CursoRepository cursoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private CursoService cursoService;

    private Curso curso;

    @BeforeEach
    void setUp() {
        curso = Curso.builder()
                .id(1L)
                .titulo("Curso de Prueba")
                .descripcion("Una prueba de curso")
                .precio(50.0)
                .activo(true)
                .build();
    }

    @Test
    void testObtenerCursosActivosDevuelvePagina() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Curso> pagina = new PageImpl<>(Collections.singletonList(curso), pageable, 1);

        when(cursoRepository.findAllByActivoTrue(pageable)).thenReturn(pagina);

        Page<Curso> resultado = cursoService.obtenerCursosActivos(pageable);

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalElements());
        assertEquals(curso, resultado.getContent().get(0));
        verify(cursoRepository, times(1)).findAllByActivoTrue(pageable);
    }

    @Test
    void testObtenerCursoPorIdCuandoExiste() {
        when(cursoRepository.findByIdAndActivoTrue(1L)).thenReturn(Optional.of(curso));

        Curso resultado = cursoService.obtenerCursoPorId(1L);

        assertNotNull(resultado);
        assertEquals(1L, resultado.getId());
        assertEquals("Curso de Prueba", resultado.getTitulo());
        verify(cursoRepository, times(1)).findByIdAndActivoTrue(1L);
    }

    @Test
    void testObtenerCursoPorIdCuandoNoExisteLanzaException() {
        when(cursoRepository.findByIdAndActivoTrue(1L)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> cursoService.obtenerCursoPorId(1L));

        assertEquals("Curso no encontrado o ha sido eliminado", exception.getMessage());
        verify(cursoRepository, times(1)).findByIdAndActivoTrue(1L);
    }
}

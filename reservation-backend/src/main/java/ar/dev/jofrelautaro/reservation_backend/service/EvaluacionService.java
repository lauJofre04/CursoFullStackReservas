package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.dto.EvaluacionCreacionDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.EvaluacionDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.EvaluacionSubmitDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.OpcionDTO;
import ar.dev.jofrelautaro.reservation_backend.model.dto.PreguntaDTO;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Evaluacion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Opcion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Pregunta;
import ar.dev.jofrelautaro.reservation_backend.model.entity.ResultadoEvaluacion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.EvaluacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.OpcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ResultadoEvaluacionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;
    private final OpcionRepository opcionRepository;
    private final ResultadoEvaluacionRepository resultadoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    /**
     * Devuelve el cuestionario limpio al frontend (SIN las respuestas correctas)
     */
    public EvaluacionDTO obtenerEvaluacionParaAlumno(Long id) {
        Evaluacion evaluacion = evaluacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));

        // Mapeo manual para asegurar que no se filtre el campo "esCorrecta"
        List<PreguntaDTO> preguntasDTO = evaluacion.getPreguntas().stream().map(pregunta -> {
            List<OpcionDTO> opcionesDTO = pregunta.getOpciones().stream().map(opcion -> 
                    new OpcionDTO(opcion.getId(), opcion.getTexto())
            ).collect(Collectors.toList());

            return new PreguntaDTO(pregunta.getId(), pregunta.getTexto(), opcionesDTO);
        }).collect(Collectors.toList());

        return EvaluacionDTO.builder()
                .id(evaluacion.getId())
                .titulo(evaluacion.getTitulo())
                .descripcion(evaluacion.getDescripcion())
                .cursoId(evaluacion.getCurso().getId())
                .preguntas(preguntasDTO)
                .build();
    }
    /**
     * Devuelve la lista de evaluaciones básicas de un curso para el índice
     */
    public List<EvaluacionDTO> obtenerEvaluacionesDeCurso(Long cursoId) {
        return evaluacionRepository.findByCursoId(cursoId).stream().map(e -> 
            EvaluacionDTO.builder()
                .id(e.getId())
                .titulo(e.getTitulo())
                .descripcion(e.getDescripcion())
                .cursoId(e.getCurso().getId())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public Evaluacion crearEvaluacion(EvaluacionCreacionDTO dto) {
        // 1. Buscamos el curso al que pertenece
        Curso curso = cursoRepository.findById(dto.getCursoId())
                .orElseThrow(() -> new RuntimeException("Curso no encontrado"));

        // 2. Creamos la cabecera de la Evaluación
        Evaluacion evaluacion = Evaluacion.builder()
                .titulo(dto.getTitulo())
                .descripcion(dto.getDescripcion())
                .curso(curso)
                .preguntas(new ArrayList<>())
                .build();

        // 3. Iteramos las preguntas del DTO
        dto.getPreguntas().forEach(pDto -> {
            Pregunta pregunta = Pregunta.builder()
                    .texto(pDto.getTexto())
                    .evaluacion(evaluacion) // Enlazamos bidireccionalmente
                    .opciones(new ArrayList<>())
                    .build();

            // 4. Iteramos las opciones de cada pregunta
            pDto.getOpciones().forEach(oDto -> {
                Opcion opcion = Opcion.builder()
                        .texto(oDto.getTexto())
                        .esCorrecta(oDto.isEsCorrecta())
                        .pregunta(pregunta) // Enlazamos bidireccionalmente
                        .build();
                pregunta.getOpciones().add(opcion);
            });

            evaluacion.getPreguntas().add(pregunta);
        });

        // 5. Guardamos la evaluación. Gracias al CascadeType.ALL en las entidades, 
        // Hibernate automáticamente guarda las preguntas y las opciones por nosotros.
        return evaluacionRepository.save(evaluacion);
    }
    /**
     * Recibe las respuestas del alumno, calcula la nota y guarda el resultado
     */
    public ResultadoEvaluacion corregirExamen(EvaluacionSubmitDTO submitDTO, String emailUsuario) {
        // 1. Buscamos al usuario y la evaluación
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        Evaluacion evaluacion = evaluacionRepository.findById(submitDTO.getEvaluacionId())
                .orElseThrow(() -> new RuntimeException("Evaluación no encontrada"));

        // 2. Variables para calcular el puntaje
        int totalPreguntas = evaluacion.getPreguntas().size();
        int respuestasCorrectas = 0;

        // 3. Iteramos sobre las respuestas enviadas por el frontend
        // El Map tiene la forma { preguntaId : opcionId }
        for (Map.Entry<Long, Long> entry : submitDTO.getRespuestas().entrySet()) {
            Long opcionIdElegida = entry.getValue();

            if (opcionIdElegida != null) {
                // Buscamos la opción en la BD
                Opcion opcionDB = opcionRepository.findById(opcionIdElegida)
                        .orElseThrow(() -> new RuntimeException("Opción inválida"));

                // Si es correcta, sumamos un punto
                if (opcionDB.isEsCorrecta()) {
                    respuestasCorrectas++;
                }
            }
        }

        // 4. Calculamos la nota final (escala de 0 a 100)
        int puntajeFinal = (int) (((double) respuestasCorrectas / totalPreguntas) * 100);
        
        // Criterio de aprobación: sacar más de 60
        boolean aprobado = puntajeFinal >= 60; 

        // 5. Guardamos el resultado en la BD
        ResultadoEvaluacion resultado = ResultadoEvaluacion.builder()
                .usuario(usuario)
                .evaluacion(evaluacion)
                .puntaje(puntajeFinal)
                .aprobado(aprobado)
                .build();

        return resultadoRepository.save(resultado);
    }
}
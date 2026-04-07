package ar.dev.jofrelautaro.reservation_backend.service;

import ar.dev.jofrelautaro.reservation_backend.model.entity.TareaProgramada;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.TareaProgramadaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecordatorioService {

    private final TareaProgramadaRepository tareaRepository;
    private final InscripcionRepository inscripcionRepository;
    private final EmailService emailService;

    // Se ejecuta todos los días a las 08:00 AM
    // El formato cron es: Segundos Minutos Horas Día Mes DíaDeLaSemana
    @Scheduled(cron = "0 0 8 * * ?")
    public void revisarEntregasDeHoy() {
        System.out.println("Buscando tareas que vencen hoy para enviar recordatorios...");

        // 1. Buscamos todas las tareas (luego lo podés optimizar con una Query en el Repository que busque solo por fecha)
        List<TareaProgramada> todasLasTareas = tareaRepository.findAll();

        for (TareaProgramada tarea : todasLasTareas) {
            
            // Verificamos si la fecha límite cae en el día de hoy
            LocalDate fechaLimite = tarea.getFechaLimite().toLocalDate();
            LocalDate hoy = LocalDate.now();

            if (fechaLimite.isEqual(hoy)) {
                
                // 2. Buscamos a los alumnos anotados en el curso de esta tarea
                // (Asumo que tenés un método así, ajustalo a tu código)
                List<Usuario> alumnosAnotados = inscripcionRepository.findUsuariosByCursoId(tarea.getCurso().getId());

                // 3. Le mandamos el email a cada alumno
                for (Usuario alumno : alumnosAnotados) {
                    try {
                        emailService.enviarEmailRecordatorio(
                                alumno.getEmail(), 
                                tarea.getCurso().getTitulo(), 
                                tarea.getTitulo()
                        );
                        System.out.println("Email enviado a " + alumno.getEmail() + " por la tarea: " + tarea.getTitulo());
                    } catch (Exception e) {
                        System.err.println("Error al enviar email a " + alumno.getEmail() + ": " + e.getMessage());
                    }
                }
            }
        }
    }
}
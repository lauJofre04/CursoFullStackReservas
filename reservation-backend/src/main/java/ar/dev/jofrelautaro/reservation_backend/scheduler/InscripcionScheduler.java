package ar.dev.jofrelautaro.reservation_backend.scheduler; // o .service si lo pusiste ahí

import ar.dev.jofrelautaro.reservation_backend.model.entity.Inscripcion;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j // Esto nos permite usar log.info() para imprimir mensajes lindos en la consola
public class InscripcionScheduler {

    private final InscripcionRepository inscripcionRepository;

    // Magia pura: El Cron le dice CUÁNDO ejecutarse. 
    // "0 0 0 * * ?" significa: Todos los días a la medianoche (00:00:00).
    // Para probarlo AHORA MISMO, podés comentar el cron y usar fixedRate = 60000 (cada 1 minuto)
    @Scheduled(cron = "0 0 0 * * ?" )    
    public void revisarSuscripcionesVencidas() {
        log.info("🤖 [ROBOT] Iniciando revisión de suscripciones vencidas...");

        // Calculamos la fecha límite: Hoy menos 30 días
        LocalDateTime hace30Dias = LocalDateTime.now().minusDays(30);

        // Buscamos a los que se les venció el tiempo
        List<Inscripcion> vencidas = inscripcionRepository.findByEstadoAndFechaInscripcionBefore("ACTIVA", hace30Dias);

        if (vencidas.isEmpty()) {
            log.info("✅ [ROBOT] No hay suscripciones para vencer hoy.");
            return;
        }

        // Si hay vencidas, las recorremos y les cambiamos el estado
        for (Inscripcion inscripcion : vencidas) {
            inscripcion.setEstado("VENCIDA");
            inscripcionRepository.save(inscripcion);
            log.info("❌ [ROBOT] Suscripción ID {} del alumno {} marcada como VENCIDA.", 
                    inscripcion.getId(), 
                    inscripcion.getUsuario().getEmail());
        }

        log.info("🏁 [ROBOT] Revisión terminada. Se vencieron {} suscripciones.", vencidas.size());
    }
}
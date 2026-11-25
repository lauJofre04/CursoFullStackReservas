package ar.dev.jofrelautaro.reservation_backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // Memoria caché para guardar el balde de cada dirección IP
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private static final int MAX_ENTRADAS = 10_000;
    private static final Logger log = LoggerFactory.getLogger(RateLimitInterceptor.class);
    private final AtomicBoolean diagnosticoRegistrado = new AtomicBoolean(false);

    // Creamos las reglas: 5 intentos por minuto como máximo
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    // Buscamos si la IP ya tiene un balde, si no, le creamos uno nuevo
    public Bucket resolveBucket(String ip) {
        // Tope de seguridad: sin esto el mapa crece sin límite (una IP nueva = una entrada nueva)
        // y un atacante que varíe la IP podría agotar la memoria del servidor.
        if (cache.size() >= MAX_ENTRADAS) {
            cache.clear();
        }
        return cache.computeIfAbsent(ip, k -> createNewBucket());
    }

    // Para verificar en producción: si "ip" aparece como una dirección interna (10.x, 172.x) en TODAS las
    // peticiones, el proxy no está siendo resuelto y todos los usuarios comparten el mismo límite.
    private void registrarDiagnosticoUnaVez(String ip, String forwardedFor) {
        if (diagnosticoRegistrado.compareAndSet(false, true)) {
            log.info("RateLimit: IP resuelta={} | X-Forwarded-For={}", ip, forwardedFor);
        }
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        
        // Se usa SIEMPRE getRemoteAddr(), nunca el header X-Forwarded-For directo: el cliente puede
        // falsificarlo y saltarse el límite. Detrás de un proxy (Render), Tomcat reemplaza remoteAddr por
        // la IP real del cliente solo si el proxy es de confianza (server.forward-headers-strategy=native).
        String ip = request.getRemoteAddr();
        registrarDiagnosticoUnaVez(ip, request.getHeader("X-Forwarded-For"));

        Bucket bucket = resolveBucket(ip);

        // Si el balde todavía tiene fichas, consume 1 y lo deja pasar al Controlador
        if (bucket.tryConsume(1)) {
            return true;
        } else {
            // Si no tiene fichas, lo bloqueamos con un 429 Too Many Requests
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"mensaje\": \"Demasiados intentos de inicio de sesión. Por favor, espere un minuto.\"}");
            
            System.out.println("🛡️ Rate Limit activado. Bloqueando ataque desde IP: " + ip);
            return false;
        }
    }
}
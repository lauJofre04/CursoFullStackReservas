package ar.dev.jofrelautaro.reservation_backend.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // Memoria caché para guardar el balde de cada dirección IP
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    // Creamos las reglas: 5 intentos por minuto como máximo
    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(5, Refill.greedy(5, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    // Buscamos si la IP ya tiene un balde, si no, le creamos uno nuevo
    public Bucket resolveBucket(String ip) {
        return cache.computeIfAbsent(ip, k -> createNewBucket());
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }

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
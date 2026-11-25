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
import java.util.regex.Pattern;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    // Memoria caché para guardar el balde de cada dirección IP
    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();
    private static final int MAX_ENTRADAS = 10_000;
    // Solo caracteres válidos en IPv4/IPv6 y largo acotado: evita claves basura en el mapa
    private static final Pattern FORMA_DE_IP = Pattern.compile("^[0-9a-fA-F:.]{3,45}$");
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

    // Render recibe el tráfico a través de Cloudflare: getRemoteAddr() devuelve una IP de Cloudflare
    // (172.64.x.x, 104.x.x.x...) compartida por muchísimos usuarios, y Tomcat no la considera un proxy
    // de confianza. Cloudflare AGREGA la IP real del cliente al final de X-Forwarded-For, así que se usa
    // la ÚLTIMA entrada: lo que un atacante escriba en el header queda a la izquierda y se ignora.
    // Si el header falta o no tiene forma de IP, se cae a getRemoteAddr().
    static String resolverIpCliente(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            String[] partes = forwardedFor.split(",");
            String ultima = partes[partes.length - 1].trim();
            if (FORMA_DE_IP.matcher(ultima).matches()) {
                return ultima;
            }
        }
        return request.getRemoteAddr();
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        
        
        String ip = resolverIpCliente(request);
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
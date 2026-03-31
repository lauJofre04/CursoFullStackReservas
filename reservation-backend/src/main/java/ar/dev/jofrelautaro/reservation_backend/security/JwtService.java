package ar.dev.jofrelautaro.reservation_backend.security;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    // Asegurate de que esta clave coincida con la que tenías, o dejá la tuya si la tenías en application.properties
    @Value("${application.security.jwt.secret-key:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKey;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    // 1. EL MÉTODO PARA NUESTRO LOGIN (Inyecta id, nombre y rol)
    public String generateToken(Usuario usuario) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("id", usuario.getId());
        extraClaims.put("nombre", usuario.getNombre());
        
        // Si tu rol es un Enum (ej. Role.ADMIN), usamos .name(). Si es un String común, borrale el .name()
        extraClaims.put("rol", usuario.getRol().name()); 

        return buildToken(extraClaims, usuario);
    }

    // 2. EL MÉTODO POR DEFECTO (Por si Spring Security lo necesita internamente)
    public String generateToken(UserDetails userDetails) {
        return buildToken(new HashMap<>(), userDetails);
    }

    // 3. EL BUILDER MODERNO (Sintaxis versión 0.12.x, sin advertencias amarillas)
    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .claims(extraClaims) // Antes era setClaims
                .subject(userDetails.getUsername()) // Antes era setSubject
                .issuedAt(new Date(System.currentTimeMillis())) // Antes era setIssuedAt
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24)) // 24 horas
                .signWith(getSignInKey()) // Ahora deduce el algoritmo HS256 automáticamente
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // SINTAXIS MODERNA PARA EXTRAER DATOS
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey()) // Antes era setSigningKey
                .build()
                .parseSignedClaims(token)
                .getPayload(); // Antes era getBody
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
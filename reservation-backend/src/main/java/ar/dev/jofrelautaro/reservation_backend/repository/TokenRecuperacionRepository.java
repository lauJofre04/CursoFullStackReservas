package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.TokenRecuperacion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenRecuperacionRepository extends JpaRepository<TokenRecuperacion, Long> {
    
    // Método clave para buscar el token cuando el usuario haga clic en el link
    Optional<TokenRecuperacion> findByToken(String token);
    
    Optional<TokenRecuperacion> findByUsuario(Usuario usuario);
}
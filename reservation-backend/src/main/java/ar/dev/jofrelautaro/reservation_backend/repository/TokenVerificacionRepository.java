package ar.dev.jofrelautaro.reservation_backend.repository;


import ar.dev.jofrelautaro.reservation_backend.model.entity.TokenVerificacion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TokenVerificacionRepository extends JpaRepository<TokenVerificacion, Long> {
    Optional<TokenVerificacion> findByToken(String token);
    Optional<TokenVerificacion> findByUsuario(Usuario usuario);
}

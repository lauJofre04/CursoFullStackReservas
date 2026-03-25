package ar.dev.jofrelautaro.reservation_backend.repository;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Spring Security va a necesitar este método para el Login
    Optional<Usuario> findByEmail(String email);
    
    // Este te va a servir más adelante para validar si un correo ya está registrado
    boolean existsByEmail(String email);
}
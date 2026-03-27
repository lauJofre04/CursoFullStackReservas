package ar.dev.jofrelautaro.reservation_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

// Esta anotación convierte a la clase en un "espía" que escucha todos los errores de todos los controladores
@RestControllerAdvice 
public class GlobalExceptionHandler {

    // Le decimos que atrape cualquier RuntimeException que salte en el código
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        
        // Armamos un JSON limpio y profesional para devolver
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Error de Validación u Operación");
        response.put("mensaje", ex.getMessage()); // Acá viaja el texto que pusimos en el Service
        response.put("status", HttpStatus.BAD_REQUEST.value()); // Devolvemos un 400 en vez de un 500
        response.put("fecha", LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
    
    // El día de mañana, podés agregar más métodos acá abajo para atrapar otros errores
    // como MethodArgumentNotValidException (cuando fallan las validaciones @NotBlank, etc).
}
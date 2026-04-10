package ar.dev.jofrelautaro.reservation_backend.config;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Rol;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class DataSeedConfig {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final PasswordEncoder passwordEncoder; // Crítico para que el login funcione

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            // Solo inyectamos datos si la tabla de usuarios está vacía
            if (usuarioRepository.count() == 0) {
                System.out.println("🌱 Base de datos vacía detectada. Iniciando Data Seeding...");

                // 1. Crear a Lautaro como Profesor/Admin
                Usuario admin = new Usuario();
                admin.setNombre("Lautaro");
                admin.setEmail("admin@plataforma.com"); // Usá este para entrar
                admin.setPassword(passwordEncoder.encode("admin123")); // Contraseña fácil para pruebas
                admin.setRol( Rol.ADMIN);
                admin.setActivo(true);
                admin.setEmailVerificado(true);
                usuarioRepository.save(admin);

                // 2. Crear un Alumno de prueba
                Usuario alumno = new Usuario();
                alumno.setNombre("Juan Estudiante");
                alumno.setEmail("alumno@prueba.com");
                alumno.setPassword(passwordEncoder.encode("alumno123"));
                alumno.setRol( Rol.ESTUDIANTE);
                alumno.setActivo(true);
                alumno.setEmailVerificado(true);
                usuarioRepository.save(alumno);

                // 3. Crear tus Cursos estrella
                Curso curso1 = new Curso();
                curso1.setTitulo("Curso Spring Boot Máster");
                curso1.setDescripcion("Aprende a crear APIs robustas y dockerizar tus aplicaciones.");
                curso1.setPrecio(50000.0);
                curso1.setActivo(true);
                cursoRepository.save(curso1);

                Curso curso2 = new Curso();
                curso2.setTitulo("Desarrollo Web Full Stack con React");
                curso2.setDescripcion("De cero a experto creando interfaces dinámicas.");
                curso2.setPrecio(45000.0);
                curso2.setActivo(true);
                cursoRepository.save(curso2);

                System.out.println("✅ ¡Data Seeding completado! Tenés 2 usuarios y 2 cursos listos.");
            } else {
                System.out.println("👍 La base de datos ya tiene información. Se omite el Data Seeding.");
            }
        };
    }
}
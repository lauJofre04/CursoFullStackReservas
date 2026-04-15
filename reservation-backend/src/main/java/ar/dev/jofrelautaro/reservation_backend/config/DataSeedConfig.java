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

import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataSeedConfig {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder; // Crítico para que el login funcione

    @Bean
    public CommandLineRunner loadData() {
        return args -> {
            // SIEMPRE asegurar que existe el usuario "profesor" - es crítico para el sistema
            if (!usuarioRepository.existsByEmail("profesor@plataforma.com")) {
                Usuario profesor = new Usuario();
                profesor.setNombre("Profesor Demo");
                profesor.setEmail("profesor@plataforma.com");
                profesor.setPassword(passwordEncoder.encode("profesor123"));
                profesor.setRol(Rol.PROFESOR);
                profesor.setActivo(true);
                profesor.setEmailVerificado(true);
                usuarioRepository.save(profesor);
                System.out.println("✅ Usuario profesor creado correctamente");
            } else {
                System.out.println("👍 Usuario profesor ya existe en la base de datos");
            }

            // Solo inyectamos el resto de datos si la tabla de usuarios está vacía
            if (usuarioRepository.count() == 0) {
                System.out.println("🌱 Base de datos vacía detectada. Iniciando Data Seeding...");

                // 1. Crear a Lautaro como Admin
                Usuario admin = new Usuario();
                admin.setNombre("Lautaro");
                admin.setEmail("admin@plataforma.com"); // Usá este para entrar
                admin.setPassword(passwordEncoder.encode("admin123")); // Contraseña fácil para pruebas
                admin.setRol( Rol.ADMIN);
                admin.setActivo(true);
                admin.setEmailVerificado(true);
                usuarioRepository.save(admin);

                // 2. Obtener el profesor que ya creamos
                Usuario profesor = usuarioRepository.findByEmail("profesor@plataforma.com")
                        .orElseThrow(() -> new RuntimeException("Profesor no encontrado"));

                // 3. Crear un Alumno de prueba
                Usuario alumno = new Usuario();
                alumno.setNombre("Juan Estudiante");
                alumno.setEmail("alumno@prueba.com");
                alumno.setPassword(passwordEncoder.encode("alumno123"));
                alumno.setRol( Rol.ESTUDIANTE);
                alumno.setActivo(true);
                alumno.setEmailVerificado(true);
                usuarioRepository.save(alumno);

                // 4. Crear tus Cursos estrella
                Curso curso1 = new Curso();
                curso1.setTitulo("Curso Spring Boot Máster");
                curso1.setDescripcion("Aprende a crear APIs robustas y dockerizar tus aplicaciones.");
                curso1.setPrecio(50000.0);
                curso1.setActivo(true);
                curso1.setProfesores(Set.of(profesor)); // Asignar profesor
                cursoRepository.save(curso1);

                Curso curso2 = new Curso();
                curso2.setTitulo("Desarrollo Web Full Stack con React");
                curso2.setDescripcion("De cero a experto creando interfaces dinámicas.");
                curso2.setPrecio(45000.0);
                curso2.setActivo(true);
                curso2.setProfesores(Set.of(profesor)); // Asignar profesor
                cursoRepository.save(curso2);

                System.out.println("✅ ¡Data Seeding completado! Tenés 2 usuarios y 2 cursos listos.");
            } else {
                System.out.println("👍 La base de datos ya tiene información. Se omite el resto del seeding.");
            }
        };
    }
}
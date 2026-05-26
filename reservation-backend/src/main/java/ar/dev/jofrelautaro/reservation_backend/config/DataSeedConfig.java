package ar.dev.jofrelautaro.reservation_backend.config;

import ar.dev.jofrelautaro.reservation_backend.model.entity.*;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class DataSeedConfig {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository; // 👈 Agregado
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Bean
    @Transactional
    public CommandLineRunner loadData() {
        return args -> {
            
            // 1. Crear al profesor de prueba
            if (!usuarioRepository.existsByEmail("profesor@plataforma.com")) {
                Usuario profesor = new Usuario();
                profesor.setNombre("Profesor Demo");
                profesor.setEmail("profesor@plataforma.com");
                profesor.setPassword(passwordEncoder.encode("profesor123"));
                profesor.setRol(Rol.PROFESOR);
                profesor.setActivo(true);
                profesor.setEmailVerificado(true);
                profesor.setFechaCreacion(LocalDateTime.now().minusMonths(3));
                usuarioRepository.save(profesor);
                System.out.println("✅ Usuario profesor creado correctamente");
            }

            // Variable para guardar a los alumnos que crearemos
            List<Usuario> listaAlumnos = new ArrayList<>();

            // 2. Crear al Admin y datos principales si no existen
            if (!usuarioRepository.existsByEmail("admin@plataforma.com")) {
                System.out.println("🌱 Iniciando carga masiva de datos y estadísticas...");

                Usuario admin = new Usuario();
                admin.setNombre("Lautaro");
                admin.setEmail("admin@plataforma.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRol(Rol.ADMIN);
                admin.setActivo(true);
                admin.setEmailVerificado(true);
                usuarioRepository.save(admin);

                Usuario profesor = usuarioRepository.findByEmail("profesor@plataforma.com").get();

                // 3. Crear MÚLTIPLES Alumnos de prueba
                String[] nombres = {"Juan Estudiante", "María López", "Carlos Dev", "Ana React", "Pedro Backend", "Sofía UX", "Lucas DevOps"};
                for (int i = 0; i < nombres.length; i++) {
                    Usuario alumno = new Usuario();
                    alumno.setNombre(nombres[i]);
                    alumno.setEmail("alumno" + i + "@prueba.com");
                    alumno.setPassword(passwordEncoder.encode("alumno123"));
                    alumno.setRol(Rol.ESTUDIANTE);
                    alumno.setActivo(true);
                    alumno.setEmailVerificado(true);
                    alumno.setFechaCreacion(LocalDateTime.now().minusMonths(2).minusDays(i * 3L));
                    listaAlumnos.add(usuarioRepository.save(alumno));
                }

                // 4. Crear Cursos base
                Curso curso1 = new Curso();
                curso1.setTitulo("Curso Spring Boot Máster");
                curso1.setDescripcion("Aprende a crear APIs robustas y dockerizar tus aplicaciones.");
                curso1.setPrecio(50000.0);
                curso1.setActivo(true);
                curso1.setProfesores(new HashSet<>(Set.of(profesor)));
                curso1.setFechaCreacion(LocalDateTime.now().minusMonths(3));
                cursoRepository.save(curso1);

                Curso curso2 = new Curso();
                curso2.setTitulo("Desarrollo Web Full Stack con React");
                curso2.setDescripcion("De cero a experto creando interfaces dinámicas.");
                curso2.setPrecio(45000.0);
                curso2.setActivo(true);
                curso2.setProfesores(new HashSet<>(Set.of(profesor)));
                curso2.setFechaCreacion(LocalDateTime.now().minusMonths(2));
                cursoRepository.save(curso2);
                
                System.out.println("✅ ¡Cursos y alumnos creados!");
            } else {
                // Si ya existía el admin, recuperamos a los alumnos de la BD para hacer las inscripciones igual
                listaAlumnos = usuarioRepository.findAll().stream()
                        .filter(u -> u.getRol() == Rol.ESTUDIANTE)
                        .toList();
            }

            // 5. Asegurarnos de que el Profesor Test esté en TODOS los cursos
            Usuario profesorTest = usuarioRepository.findByEmail("profesor@plataforma.com").get();
            List<Curso> todosLosCursos = cursoRepository.findAll();
            for (Curso curso : todosLosCursos) {
                if (curso.getProfesores() == null) {
                    curso.setProfesores(new HashSet<>());
                }
                if (!curso.getProfesores().contains(profesorTest)) {
                    curso.getProfesores().add(profesorTest);
                    cursoRepository.save(curso);
                }
            }
            System.out.println("🎓 Profesor Demo asignado exitosamente a " + todosLosCursos.size() + " cursos.");

            // 6. 📈 LA MAGIA DE LAS ESTADÍSTICAS: Simular inscripciones históricas
            if (inscripcionRepository.count() == 0 && !listaAlumnos.isEmpty() && !todosLosCursos.isEmpty()) {
                System.out.println("📈 Generando historial de inscripciones para los gráficos...");
                Random random = new Random();
                
                for (Usuario alumno : listaAlumnos) {
                    for (Curso curso : todosLosCursos) {
                        // Random: Que no todos los alumnos compren todos los cursos (ej: 70% de chance)
                        if (random.nextInt(100) < 70) { 
                            Inscripcion inscripcion = new Inscripcion();
                            inscripcion.setUsuario(alumno);
                            inscripcion.setCurso(curso);
                            
                            // 👇 OJO ACÁ: Cambiá "COMPRA" por el valor real que tengas en tu enum MetodoAcceso
                            inscripcion.setMetodoAcceso(MetodoAcceso.PAGO_ONLINE); 
                            
                            inscripcion.setEstado("ACTIVA");
                            
                            // Dispersar las fechas de compra entre hoy y hace 90 días atrás
                            int diasAtras = random.nextInt(90);
                            inscripcion.setFechaInscripcion(LocalDateTime.now().minusDays(diasAtras));
                            
                            inscripcionRepository.save(inscripcion);
                        }
                    }
                }
                System.out.println("✅ Historial de ventas simulado exitosamente.");
            }
        };
    }
}
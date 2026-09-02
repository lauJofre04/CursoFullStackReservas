package ar.dev.jofrelautaro.reservation_backend.config;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

import ar.dev.jofrelautaro.reservation_backend.model.entity.Curso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Inscripcion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Leccion;
import ar.dev.jofrelautaro.reservation_backend.model.entity.MetodoAcceso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Modulo;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Recurso;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Rol;
import ar.dev.jofrelautaro.reservation_backend.model.entity.Usuario;
import ar.dev.jofrelautaro.reservation_backend.repository.CursoRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.InscripcionRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.ModuloRepository;
import ar.dev.jofrelautaro.reservation_backend.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;


@Configuration
@RequiredArgsConstructor
public class DataSeedConfig {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final InscripcionRepository inscripcionRepository; // 👈 Agregado
    private final ModuloRepository moduloRepository;
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

            // 2. Crear al Admin si no existe
            if (!usuarioRepository.existsByEmail("admin@plataforma.com")) {
                Usuario admin = new Usuario();
                admin.setNombre("Lautaro");
                admin.setEmail("admin@plataforma.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRol(Rol.ADMIN);
                admin.setActivo(true);
                admin.setEmailVerificado(true);
                usuarioRepository.save(admin);

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

            } else {
                // Si ya existía el admin, recuperamos a los alumnos de la BD para hacer las inscripciones igual
                listaAlumnos = usuarioRepository.findAll().stream()
                        .filter(u -> u.getRol() == Rol.ESTUDIANTE)
                        .toList();
            }

            // 4. Catálogo inicial: se puede ejecutar varias veces sin duplicar cursos.
            Usuario profesor = usuarioRepository.findByEmail("profesor@plataforma.com").get();
            for (CursoSeed cursoSeed : cursosIniciales()) {
                Curso curso = cursoRepository.findAll().stream()
                        .filter(c -> c.getTitulo().equals(cursoSeed.titulo()))
                        .findFirst()
                        .orElseGet(() -> crearCurso(cursoSeed, profesor));
                sembrarContenido(curso, cursoSeed);
            }

            // 5. Asegurarnos de que el Profesor Test esté en TODOS los cursos
            Usuario profesorTest = usuarioRepository.findByEmail("profesor@plataforma.com").get();
            List<Curso> todosLosCursos = cursoRepository.findAllWithProfesores();
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

    private Curso crearCurso(CursoSeed cursoSeed, Usuario profesor) {
        Curso curso = new Curso();
        curso.setTitulo(cursoSeed.titulo());
        curso.setDescripcion(cursoSeed.descripcion());
        curso.setPrecio(cursoSeed.precio());
        curso.setImagen(cursoSeed.imagen());
        curso.setActivo(true);
        curso.setProfesores(new HashSet<>(Set.of(profesor)));
        return cursoRepository.save(curso);
    }

    private void sembrarContenido(Curso curso, CursoSeed cursoSeed) {
        if (moduloRepository.countByCursoId(curso.getId()) > 0) {
            return;
        }

        for (int moduloIndex = 0; moduloIndex < cursoSeed.modulos().size(); moduloIndex++) {
            ModuloSeed moduloSeed = cursoSeed.modulos().get(moduloIndex);
            Modulo modulo = new Modulo();
            modulo.setCurso(curso);
            modulo.setTitulo(moduloSeed.titulo());
            modulo.setDescripcion(moduloSeed.descripcion());
            modulo.setOrden(moduloIndex + 1);

            List<Leccion> lecciones = new ArrayList<>();
            for (int leccionIndex = 0; leccionIndex < moduloSeed.lecciones().size(); leccionIndex++) {
                LeccionSeed leccionSeed = moduloSeed.lecciones().get(leccionIndex);
                Recurso video = Recurso.builder()
                        .tipo(Recurso.TipoRecurso.VIDEO)
                        .titulo("Video: " + leccionSeed.titulo())
                        .urlRecurso(leccionSeed.video())
                        .orden(1)
                        .build();
                Leccion leccion = Leccion.builder()
                        .modulo(modulo)
                        .titulo(leccionSeed.titulo())
                        .descripcion(leccionSeed.descripcion())
                        .duracionMinutos(leccionSeed.duracionMinutos())
                        .orden(leccionIndex + 1)
                        .recursos(new ArrayList<>(List.of(video)))
                        .build();
                video.setLeccion(leccion);
                lecciones.add(leccion);
            }
            modulo.setLecciones(lecciones);
            moduloRepository.save(modulo);
        }
    }

    private List<CursoSeed> cursosIniciales() {
        return List.of(
                curso("Curso Spring Boot Máster", "Aprende a crear APIs robustas y dockerizar tus aplicaciones.", 50000.0, "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900", "Spring Boot", "https://www.youtube.com/watch?v=9SGDpanrc8U"),
                curso("Desarrollo Web Full Stack con React", "De cero a experto creando interfaces dinámicas.", 45000.0, "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=900", "React", "https://www.youtube.com/watch?v=Tn6-PIqc4UM"),
                curso("Python para Análisis de Datos", "Trabaja con Python, NumPy y pandas para convertir datos en decisiones.", 42000.0, "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=900", "Python", "https://www.youtube.com/watch?v=rfscVS0vtbw"),
                curso("JavaScript Moderno desde Cero", "Domina ES6+, asincronía, APIs y las herramientas del navegador.", 38000.0, "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=900", "JavaScript", "https://www.youtube.com/watch?v=PkZNo7MFNFg"),
                curso("Bases de Datos y SQL", "Diseña modelos relacionales y consulta datos con SQL de forma profesional.", 35000.0, "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=900", "SQL", "https://www.youtube.com/watch?v=qw--VYLpxG4"),
                curso("Git y GitHub para Equipos", "Versiona proyectos, trabaja con ramas y colabora con pull requests.", 28000.0, "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=900", "Git", "https://www.youtube.com/watch?v=RGOj5yH7evk"),
                curso("Docker y Despliegue Web", "Conteneriza aplicaciones y prepara entornos reproducibles para producción.", 46000.0, "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=900", "Docker", "https://www.youtube.com/watch?v=3c-iBn73dDE"),
                curso("UX/UI: Diseño de Interfaces", "Aprende fundamentos de experiencia de usuario, prototipado y diseño visual.", 32000.0, "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=900", "UX/UI", "https://www.youtube.com/watch?v=c9Wg6Cb_YlU"),
                curso("Angular Profesional", "Construye aplicaciones escalables con componentes, servicios y formularios.", 44000.0, "https://images.unsplash.com/photo-1558655146-d09347e92766?w=900", "Angular", "https://www.youtube.com/watch?v=3qBXWUpoPHo")
        );
    }

    private CursoSeed curso(String titulo, String descripcion, double precio, String imagen, String tema, String video) {
        List<ModuloSeed> modulos = List.of(
                modulo("Fundamentos de " + tema, "Conceptos esenciales y herramientas del ecosistema.", tema + ": primeros pasos", tema + ": conceptos clave", tema + ": entorno de trabajo", video),
                modulo("Construcción de proyectos", "Aplicación práctica mediante ejercicios progresivos.", tema + ": estructura del proyecto", tema + ": buenas prácticas", tema + ": integración", video),
                modulo("Proyecto final", "Integra lo aprendido en un proyecto listo para mostrar.", tema + ": planificación", tema + ": implementación", tema + ": publicación y próximos pasos", video)
        );
        return new CursoSeed(titulo, descripcion, precio, imagen, modulos);
    }

    private ModuloSeed modulo(String titulo, String descripcion, String leccionInicial, String leccionIntermedia, String leccionFinal, String video) {
        return new ModuloSeed(titulo, descripcion, List.of(
                new LeccionSeed(leccionInicial, "Introducción práctica al tema.", 18, video),
                new LeccionSeed(leccionIntermedia, "Ejemplos y técnicas para avanzar.", 24, video),
                new LeccionSeed(leccionFinal, "Actividad guiada para consolidar lo aprendido.", 22, video)
        ));
    }

    private record CursoSeed(String titulo, String descripcion, double precio, String imagen, List<ModuloSeed> modulos) {}

    private record ModuloSeed(String titulo, String descripcion, List<LeccionSeed> lecciones) {}

    private record LeccionSeed(String titulo, String descripcion, int duracionMinutos, String video) {}
}
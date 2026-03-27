package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inscripciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inscripcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Usuario (Alumno)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Relación con el Curso
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    // Acá usamos el Enum que acabamos de crear
    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_acceso", nullable = false)
    private MetodoAcceso metodoAcceso;

    // Estado de la inscripción (preparando el terreno para tu tarea programada)
    @Builder.Default
    @Column(nullable = false)
    private String estado = "ACTIVA"; 

    // Fecha exacta en la que se anotó
    @CreationTimestamp
    @Column(name = "fecha_inscripcion", updatable = false)
    private LocalDateTime fechaInscripcion;
}
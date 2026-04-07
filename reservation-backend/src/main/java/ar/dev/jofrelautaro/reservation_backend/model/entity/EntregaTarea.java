package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "entregas_tareas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntregaTarea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String archivoAlumnoUrl; // Link al TP subido por el estudiante
    private LocalDateTime fechaEntrega;
    private String comentarioAlumno;
    
    // Calificación que pondrá el docente después
    private Double nota;
    private String feedbackDocente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarea_id")
    private TareaProgramada tarea;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario alumno; // El usuario con rol 'USER' que entrega
}
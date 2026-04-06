package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "resultados_evaluaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResultadoEvaluacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluacion_id", nullable = false)
    private Evaluacion evaluacion;

    @Column(nullable = false)
    private Integer puntaje; // Ejemplo: 80 (sobre 100) o la cantidad de respuestas correctas

    @Column(name = "aprobado", nullable = false)
    private boolean aprobado;

    @CreationTimestamp
    @Column(name = "fecha_realizacion", updatable = false)
    private LocalDateTime fechaRealizacion;
}
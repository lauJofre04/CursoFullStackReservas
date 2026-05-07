package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "progresos_leccion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgresoLeccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leccion_id", nullable = false)
    private Leccion leccion;

    @Column(name = "tiempo_visto_segundos", nullable = false)
    @Builder.Default
    private Integer tiempoVistoSegundos = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean completado = false;

    @Column(name = "ultima_vez_visto")
    private LocalDateTime ultimaVezVisto;
}
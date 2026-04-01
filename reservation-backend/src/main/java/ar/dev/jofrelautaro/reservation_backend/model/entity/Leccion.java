package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "lecciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Leccion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Módulo
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_id", nullable = false)
    private Modulo modulo;

    // Título de la lección
    @Column(nullable = false)
    private String titulo;

    // Descripción o contenido textual de la lección
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // Duración en minutos (para videos)
    private Integer duracionMinutos;

    // Orden dentro del módulo
    @Column(nullable = false)
    private Integer orden;

    // Si la lección está completada por el usuario (no se guarda en BD, solo en estado de sesión)
    @Transient
    @Builder.Default
    private Boolean completada = false;

    // Fecha de creación
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;

    // One-to-Many: Una lección puede tener múltiples recursos (videos, PDFs, etc)
    @OneToMany(mappedBy = "leccion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Recurso> recursos;
}

package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "modulos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Modulo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Curso
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    // Nombre del módulo (ej: "Introducción", "Fundamentos", "Proyecto Final")
    @Column(nullable = false)
    private String titulo;

    // Descripción del módulo
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // Orden dentro del curso (1, 2, 3, etc)
    @Column(nullable = false)
    private Integer orden;

    // Fecha de creación
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;

    // One-to-Many: Un módulo tiene muchas lecciones
    @OneToMany(mappedBy = "modulo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Leccion> lecciones;

    @OneToMany(mappedBy = "modulo", cascade = CascadeType.ALL,fetch = FetchType.LAZY ,orphanRemoval = true)
    @Builder.Default
    private List<TareaProgramada> tareas= new ArrayList<>();
}

package ar.dev.jofrelautaro.reservation_backend.model.entity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "cursos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(columnDefinition = "TEXT") // TEXT permite guardar descripciones largas
    private String descripcion;

    @Column(nullable = false)
    private Double precio;

    // Capacidad máxima de alumnos (opcional)
    private Integer capacidadMaxima;

    // Acá guardaremos la URL de la imagen 
    private String imagen; 

    // Soft Delete: En vez de borrar el curso de la base de datos, lo "apagamos"
    @Builder.Default
    @Column(nullable = false)
    private Boolean activo = true; 

    // Campos de Auditoría: Spring/Hibernate los llenan solos automáticamente
    @CreationTimestamp
    @Column(updatable = false, name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    // Profesores dueños del curso
    @ManyToMany
    @JoinTable(
        name = "curso_profesores",
        joinColumns = @JoinColumn(name = "curso_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private Set<Usuario> profesores;

    // Adentro de Curso.java
    @OneToMany(mappedBy = "curso", cascade = CascadeType.ALL)
    
    @JsonIgnore // Evitamos que se serialice la lista de evaluaciones para no crear un ciclo infinito
    private List<Evaluacion> evaluaciones;
}
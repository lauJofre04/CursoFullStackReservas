package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

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
}
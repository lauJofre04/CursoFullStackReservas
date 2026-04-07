package ar.dev.jofrelautaro.reservation_backend.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "tareas_programadas")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TareaProgramada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    private LocalDateTime fechaLimite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id")
    @JsonIgnore
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modulo_id")
    @JsonIgnore
    private Modulo modulo;
    private String archivoConsignaUrl; // URL de Cloudinary con el material del profe
}
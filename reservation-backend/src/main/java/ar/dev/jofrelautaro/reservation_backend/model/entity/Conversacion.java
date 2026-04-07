package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "conversaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre")
    private String nombre;

    @ManyToMany
    @JoinTable(
            name = "conversacion_participantes",
            joinColumns = @JoinColumn(name = "conversacion_id"),
            inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    @Builder.Default
    private Set<Usuario> participantes = new HashSet<>();

    @OneToMany(mappedBy = "conversacion", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("fechaEnvio asc")
    @Builder.Default
    private Set<Mensaje> mensajes = new LinkedHashSet<>();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;

    @PrePersist
    @PreUpdate
    public void actualizarFechaActualizacion() {
        this.fechaActualizacion = LocalDateTime.now();
    }
}

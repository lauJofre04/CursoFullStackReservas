package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Table(name = "recursos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recurso {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con la Lección
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leccion_id", nullable = false)
    @JsonIgnore
    private Leccion leccion;

    // Tipo de recurso: VIDEO, PDF, LINK, DOCUMENTO
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoRecurso tipo;

    // Título del recurso
    @Column(nullable = false)
    private String titulo;

    // URL del recurso (puede ser URL de YouTube, Google Drive, Cloudinary, etc)
    @Column(nullable = false, columnDefinition = "TEXT")
    private String urlRecurso;

    // Descripción adicional del recurso
    @Column(columnDefinition = "TEXT")
    private String descripcion;

    // Para PDFs: URL de descarga en Cloudinary
    // Para Videos: embed URL o URL de YouTube
    // Para Links: URL directa

    // Orden dentro de la lección (por si tiene múltiples recursos)
    @Column(nullable = false)
    private Integer orden;

    // Fecha de creación
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime fechaCreacion;

    public enum TipoRecurso {
        VIDEO,      // Video de YouTube o embebido
        PDF,        // Documento PDF
        LINK,       // Link externo
        DOCUMENTO   // Documento en Google Docs, etc
    }
}

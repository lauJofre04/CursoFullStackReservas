package ar.dev.jofrelautaro.reservation_backend.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relación con el Usuario (quien realiza el pago)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    // Relación con el Curso (qué se está pagando)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    private Curso curso;

    // ID de la preferencia de Mercado Pago
    @Column(name = "mercadopago_preference_id", nullable = false, unique = true)
    private String mercadoPagoPreferenceId;

    // ID del pago en Mercado Pago (llega con el webhook)
    @Column(name = "mercadopago_payment_id")
    private String mercadoPagoPaymentId;

    // Monto del pago
    @Column(nullable = false)
    private BigDecimal monto;

    // Estado del pago: PENDIENTE, APROBADO, RECHAZADO, CANCELADO, PENDIENTE_PAGO
    @Column(nullable = false)
    @Builder.Default
    private String estado = "PENDIENTE";

    // Fecha de creación
    @CreationTimestamp
    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    // Fecha de aprobación (cuando MP confirma el pago)
    @Column(name = "fecha_aprobacion")
    private LocalDateTime fechaAprobacion;

    // Método de pago utilizado (tarjeta, transferencia, etc)
    @Column(name = "metodo_pago")
    private String metodoPago;

    // Descripción o referencia adicional
    @Column(length = 500)
    private String descripcion;
}

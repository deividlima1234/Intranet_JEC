package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "reservas_aula_aip")
public class ReservaAulaAip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_reserva")
    private UUID idReserva;

    @NotNull(message = "El aula AIP es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aula", nullable = false)
    private AulaAip aulaAip;

    @NotNull(message = "El docente o usuario responsable es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario docente;

    @NotNull(message = "La fecha es obligatoria")
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @NotNull(message = "La hora de inicio es obligatoria")
    @Column(name = "hora_inicio", nullable = false)
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    @Column(name = "hora_fin", nullable = false)
    private LocalTime horaFin;

    @NotNull(message = "El grado es obligatorio")
    @Column(name = "grado", nullable = false)
    private Short grado;

    @NotBlank(message = "La sección es obligatoria")
    @Size(max = 50, message = "La sección no puede exceder los 50 caracteres")
    @Column(name = "seccion", nullable = false, length = 50)
    private String seccion;

    @Size(max = 255, message = "El motivo no puede exceder los 255 caracteres")
    @Column(name = "motivo", length = 255)
    private String motivo;

    @NotNull
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    // Constructores
    public ReservaAulaAip() {}

    public ReservaAulaAip(AulaAip aulaAip, Usuario docente, LocalDate fecha, LocalTime horaInicio, LocalTime horaFin, Short grado, String seccion, String motivo) {
        this.aulaAip = aulaAip;
        this.docente = docente;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.grado = grado;
        this.seccion = seccion;
        this.motivo = motivo;
        this.fechaRegistro = LocalDateTime.now();
    }

    // Getters y Setters
    public UUID getIdReserva() {
        return idReserva;
    }

    public void setIdReserva(UUID idReserva) {
        this.idReserva = idReserva;
    }

    public AulaAip getAulaAip() {
        return aulaAip;
    }

    public void setAulaAip(AulaAip aulaAip) {
        this.aulaAip = aulaAip;
    }

    public Usuario getDocente() {
        return docente;
    }

    public void setDocente(Usuario docente) {
        this.docente = docente;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
    }

    public Short getGrado() {
        return grado;
    }

    public void setGrado(Short grado) {
        this.grado = grado;
    }

    public String getSeccion() {
        return seccion;
    }

    public void setSeccion(String seccion) {
        this.seccion = seccion;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}

package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "asistencias", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"id_estudiante", "fecha"})
})
public class Asistencia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_asistencia")
    private UUID idAsistencia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = false)
    @NotNull(message = "El estudiante es obligatorio")
    private Estudiante estudiante;

    @NotNull(message = "La fecha es obligatoria")
    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_ingreso")
    private LocalTime horaIngreso;

    @NotNull(message = "El estado es obligatorio")
    @Column(name = "estado", nullable = false, length = 20)
    private String estado; // PUNTUAL, TARDANZA, FALTA, JUSTIFICADO

    @Size(max = 500, message = "La observación no puede exceder los 500 caracteres")
    @Column(name = "observacion", length = 500)
    private String observacion;

    @NotNull(message = "El grado es obligatorio")
    @Column(name = "grado", nullable = false)
    private Short grado;

    @NotNull(message = "La sección es obligatoria")
    @Column(name = "seccion", nullable = false, length = 50)
    private String seccion;

    public Asistencia() {}

    public Asistencia(Estudiante estudiante, LocalDate fecha, LocalTime horaIngreso, String estado, String observacion, Short grado, String seccion) {
        this.estudiante = estudiante;
        this.fecha = fecha;
        this.horaIngreso = horaIngreso;
        this.estado = estado;
        this.observacion = observacion;
        this.grado = grado;
        this.seccion = seccion;
    }

    public UUID getIdAsistencia() {
        return idAsistencia;
    }

    public void setIdAsistencia(UUID idAsistencia) {
        this.idAsistencia = idAsistencia;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraIngreso() {
        return horaIngreso;
    }

    public void setHoraIngreso(LocalTime horaIngreso) {
        this.horaIngreso = horaIngreso;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getObservacion() {
        return observacion;
    }

    public void setObservacion(String observacion) {
        this.observacion = observacion;
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
}

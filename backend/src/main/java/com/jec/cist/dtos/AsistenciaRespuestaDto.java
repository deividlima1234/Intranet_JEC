package com.jec.cist.dtos;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class AsistenciaRespuestaDto {
    private UUID idAsistencia;
    private UUID idEstudiante;
    private String dni;
    private String nombres;
    private String apellidos;
    private LocalDate fecha;
    private LocalTime horaIngreso;
    private String estado;
    private String observacion;
    private Short grado;
    private String seccion;
    private String mensajeAlerta; // Para indicar si es un duplicado o grado incorrecto

    public AsistenciaRespuestaDto() {}

    public AsistenciaRespuestaDto(UUID idAsistencia, UUID idEstudiante, String dni, String nombres, String apellidos, LocalDate fecha, LocalTime horaIngreso, String estado, String observacion, Short grado, String seccion) {
        this.idAsistencia = idAsistencia;
        this.idEstudiante = idEstudiante;
        this.dni = dni;
        this.nombres = nombres;
        this.apellidos = apellidos;
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

    public UUID getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(UUID idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
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

    public String getMensajeAlerta() {
        return mensajeAlerta;
    }

    public void setMensajeAlerta(String mensajeAlerta) {
        this.mensajeAlerta = mensajeAlerta;
    }
}

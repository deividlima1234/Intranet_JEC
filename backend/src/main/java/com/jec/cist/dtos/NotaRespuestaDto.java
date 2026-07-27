package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class NotaRespuestaDto {
    private UUID idNota;
    private UUID idEstudiante;
    private String nombreEstudiante;
    private UUID idCurso;
    private String nombreCurso;
    private String criterio;
    private String calificacion;
    private LocalDateTime fechaRegistro;

    public NotaRespuestaDto() {}

    public NotaRespuestaDto(UUID idNota, UUID idEstudiante, String nombreEstudiante, UUID idCurso, String nombreCurso, String criterio, String calificacion, LocalDateTime fechaRegistro) {
        this.idNota = idNota;
        this.idEstudiante = idEstudiante;
        this.nombreEstudiante = nombreEstudiante;
        this.idCurso = idCurso;
        this.nombreCurso = nombreCurso;
        this.criterio = criterio;
        this.calificacion = calificacion;
        this.fechaRegistro = fechaRegistro;
    }

    public UUID getIdNota() {
        return idNota;
    }

    public void setIdNota(UUID idNota) {
        this.idNota = idNota;
    }

    public UUID getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(UUID idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public String getNombreEstudiante() {
        return nombreEstudiante;
    }

    public void setNombreEstudiante(String nombreEstudiante) {
        this.nombreEstudiante = nombreEstudiante;
    }

    public UUID getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(UUID idCurso) {
        this.idCurso = idCurso;
    }

    public String getNombreCurso() {
        return nombreCurso;
    }

    public void setNombreCurso(String nombreCurso) {
        this.nombreCurso = nombreCurso;
    }

    public String getCriterio() {
        return criterio;
    }

    public void setCriterio(String criterio) {
        this.criterio = criterio;
    }

    public String getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(String calificacion) {
        this.calificacion = calificacion;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}

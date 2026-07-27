package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CursoEvaluacionRespuestaDto {

    private UUID idEvaluacion;
    private UUID idCurso;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaLimite;
    private Boolean permitirEntregasTardias;
    private LocalDateTime fechaCreacion;
    private List<EvaluacionCriterioRespuestaDto> criterios;

    public CursoEvaluacionRespuestaDto() {}

    public CursoEvaluacionRespuestaDto(UUID idEvaluacion, UUID idCurso, String titulo, String descripcion, LocalDateTime fechaLimite, Boolean permitirEntregasTardias, LocalDateTime fechaCreacion, List<EvaluacionCriterioRespuestaDto> criterios) {
        this.idEvaluacion = idEvaluacion;
        this.idCurso = idCurso;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaLimite = fechaLimite;
        this.permitirEntregasTardias = permitirEntregasTardias;
        this.fechaCreacion = fechaCreacion;
        this.criterios = criterios;
    }

    public UUID getIdEvaluacion() {
        return idEvaluacion;
    }

    public void setIdEvaluacion(UUID idEvaluacion) {
        this.idEvaluacion = idEvaluacion;
    }

    public UUID getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(UUID idCurso) {
        this.idCurso = idCurso;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaLimite() {
        return fechaLimite;
    }

    public void setFechaLimite(LocalDateTime fechaLimite) {
        this.fechaLimite = fechaLimite;
    }

    public Boolean getPermitirEntregasTardias() {
        return permitirEntregasTardias;
    }

    public void setPermitirEntregasTardias(Boolean permitirEntregasTardias) {
        this.permitirEntregasTardias = permitirEntregasTardias;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<EvaluacionCriterioRespuestaDto> getCriterios() {
        return criterios;
    }

    public void setCriterios(List<EvaluacionCriterioRespuestaDto> criterios) {
        this.criterios = criterios;
    }
}

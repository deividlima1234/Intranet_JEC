package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class CursoEvaluacionRequestDto {

    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    private String descripcion;

    @NotNull(message = "La fecha límite es obligatoria")
    private LocalDateTime fechaLimite;

    private Boolean permitirEntregasTardias = false;

    private List<EvaluacionCriterioRequestDto> criterios;

    public CursoEvaluacionRequestDto() {}

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

    public List<EvaluacionCriterioRequestDto> getCriterios() {
        return criterios;
    }

    public void setCriterios(List<EvaluacionCriterioRequestDto> criterios) {
        this.criterios = criterios;
    }
}

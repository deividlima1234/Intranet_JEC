package com.jec.cist.dtos;

import java.util.UUID;

public class EvaluacionCriterioRespuestaDto {

    private UUID idCriterio;
    private String nombre;
    private Integer puntajeMaximo;

    public EvaluacionCriterioRespuestaDto() {}

    public EvaluacionCriterioRespuestaDto(UUID idCriterio, String nombre, Integer puntajeMaximo) {
        this.idCriterio = idCriterio;
        this.nombre = nombre;
        this.puntajeMaximo = puntajeMaximo;
    }

    public UUID getIdCriterio() {
        return idCriterio;
    }

    public void setIdCriterio(UUID idCriterio) {
        this.idCriterio = idCriterio;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getPuntajeMaximo() {
        return puntajeMaximo;
    }

    public void setPuntajeMaximo(Integer puntajeMaximo) {
        this.puntajeMaximo = puntajeMaximo;
    }
}

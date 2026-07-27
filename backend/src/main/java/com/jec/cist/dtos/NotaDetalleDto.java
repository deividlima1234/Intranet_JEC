package com.jec.cist.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class NotaDetalleDto {

    @NotNull(message = "El ID del criterio es obligatorio")
    private UUID idCriterio;

    @NotNull(message = "El puntaje asignado es obligatorio")
    @Min(value = 0, message = "El puntaje no puede ser negativo")
    private Integer puntajeAsignado;

    public NotaDetalleDto() {}

    public NotaDetalleDto(UUID idCriterio, Integer puntajeAsignado) {
        this.idCriterio = idCriterio;
        this.puntajeAsignado = puntajeAsignado;
    }

    public UUID getIdCriterio() {
        return idCriterio;
    }

    public void setIdCriterio(UUID idCriterio) {
        this.idCriterio = idCriterio;
    }

    public Integer getPuntajeAsignado() {
        return puntajeAsignado;
    }

    public void setPuntajeAsignado(Integer puntajeAsignado) {
        this.puntajeAsignado = puntajeAsignado;
    }
}

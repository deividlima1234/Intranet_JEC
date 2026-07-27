package com.jec.cist.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EvaluacionCriterioRequestDto {

    @NotBlank(message = "El nombre del criterio es obligatorio")
    private String nombre;

    @NotNull(message = "El puntaje máximo es obligatorio")
    @Min(value = 1, message = "El puntaje debe ser mayor a 0")
    private Integer puntajeMaximo;

    public EvaluacionCriterioRequestDto() {}

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

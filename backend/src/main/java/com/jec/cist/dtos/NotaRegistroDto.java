package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class NotaRegistroDto {

    @NotNull(message = "El ID del estudiante es obligatorio")
    private UUID idEstudiante;

    @NotBlank(message = "El criterio es obligatorio")
    private String criterio;

    @NotBlank(message = "La calificación es obligatoria")
    private String calificacion;

    public NotaRegistroDto() {}

    public NotaRegistroDto(UUID idEstudiante, String criterio, String calificacion) {
        this.idEstudiante = idEstudiante;
        this.criterio = criterio;
        this.calificacion = calificacion;
    }

    public UUID getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(UUID idEstudiante) {
        this.idEstudiante = idEstudiante;
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
}

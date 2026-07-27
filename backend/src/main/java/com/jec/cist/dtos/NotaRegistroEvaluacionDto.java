package com.jec.cist.dtos;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

public class NotaRegistroEvaluacionDto {

    @NotNull(message = "El ID del estudiante es obligatorio")
    private UUID idEstudiante;

    @NotNull(message = "El ID de la evaluación es obligatorio")
    private UUID idEvaluacion;

    private List<NotaDetalleDto> detalles;

    public NotaRegistroEvaluacionDto() {}

    public NotaRegistroEvaluacionDto(UUID idEstudiante, UUID idEvaluacion, List<NotaDetalleDto> detalles) {
        this.idEstudiante = idEstudiante;
        this.idEvaluacion = idEvaluacion;
        this.detalles = detalles;
    }

    public UUID getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(UUID idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public UUID getIdEvaluacion() {
        return idEvaluacion;
    }

    public void setIdEvaluacion(UUID idEvaluacion) {
        this.idEvaluacion = idEvaluacion;
    }

    public List<NotaDetalleDto> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<NotaDetalleDto> detalles) {
        this.detalles = detalles;
    }
}

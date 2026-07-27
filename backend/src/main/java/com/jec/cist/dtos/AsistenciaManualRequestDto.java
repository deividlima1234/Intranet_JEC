package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public class AsistenciaManualRequestDto {

    @NotNull(message = "El ID del estudiante es obligatorio")
    private UUID idEstudiante;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotBlank(message = "El estado es obligatorio")
    private String estado; // PUNTUAL, TARDANZA, FALTA, JUSTIFICADO

    private String observacion;

    public AsistenciaManualRequestDto() {}

    public AsistenciaManualRequestDto(UUID idEstudiante, LocalDate fecha, String estado, String observacion) {
        this.idEstudiante = idEstudiante;
        this.fecha = fecha;
        this.estado = estado;
        this.observacion = observacion;
    }

    public UUID getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(UUID idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
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
}

package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class AsistenciaConfiguracionDto {

    @NotBlank(message = "La hora de entrada es obligatoria")
    @Pattern(regexp = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$", message = "El formato de hora debe ser HH:mm:ss")
    private String horaEntrada;

    @NotBlank(message = "La hora de tolerancia es obligatoria")
    @Pattern(regexp = "^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$", message = "El formato de hora debe ser HH:mm:ss")
    private String horaTolerancia;

    public AsistenciaConfiguracionDto() {}

    public AsistenciaConfiguracionDto(String horaEntrada, String horaTolerancia) {
        this.horaEntrada = horaEntrada;
        this.horaTolerancia = horaTolerancia;
    }

    public String getHoraEntrada() {
        return horaEntrada;
    }

    public void setHoraEntrada(String horaEntrada) {
        this.horaEntrada = horaEntrada;
    }

    public String getHoraTolerancia() {
        return horaTolerancia;
    }

    public void setHoraTolerancia(String horaTolerancia) {
        this.horaTolerancia = horaTolerancia;
    }
}

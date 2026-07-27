package com.jec.cist.dtos;

public class FalloRegistroDto {
    private String dni;
    private String nombreCompleto;
    private String motivo;

    public FalloRegistroDto() {}

    public FalloRegistroDto(String dni, String nombreCompleto, String motivo) {
        this.dni = dni;
        this.nombreCompleto = nombreCompleto;
        this.motivo = motivo;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public void setNombreCompleto(String nombreCompleto) {
        this.nombreCompleto = nombreCompleto;
    }

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}

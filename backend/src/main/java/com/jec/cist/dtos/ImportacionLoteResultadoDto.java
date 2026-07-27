package com.jec.cist.dtos;

import java.util.List;

public class ImportacionLoteResultadoDto {
    private int exitosos;
    private int fallidos;
    private List<FalloRegistroDto> detallesFallos;

    public ImportacionLoteResultadoDto() {}

    public ImportacionLoteResultadoDto(int exitosos, int fallidos, List<FalloRegistroDto> detallesFallos) {
        this.exitosos = exitosos;
        this.fallidos = fallidos;
        this.detallesFallos = detallesFallos;
    }

    public int getExitosos() {
        return exitosos;
    }

    public void setExitosos(int exitosos) {
        this.exitosos = exitosos;
    }

    public int getFallidos() {
        return fallidos;
    }

    public void setFallidos(int fallidos) {
        this.fallidos = fallidos;
    }

    public List<FalloRegistroDto> getDetallesFallos() {
        return detallesFallos;
    }

    public void setDetallesFallos(List<FalloRegistroDto> detallesFallos) {
        this.detallesFallos = detallesFallos;
    }
}

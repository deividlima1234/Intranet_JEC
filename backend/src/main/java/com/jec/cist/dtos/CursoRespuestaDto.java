package com.jec.cist.dtos;

import java.util.UUID;

public class CursoRespuestaDto {
    private UUID idCurso;
    private String nrc;
    private String nombre;
    private Short grado;
    private String seccion;
    private UUID idDocente;
    private String nombreDocente;
    private boolean esPrueba;
    private boolean pruebaHabilitada;

    public CursoRespuestaDto() {}

    public CursoRespuestaDto(UUID idCurso, String nrc, String nombre, Short grado, String seccion, UUID idDocente, String nombreDocente, boolean esPrueba, boolean pruebaHabilitada) {
        this.idCurso = idCurso;
        this.nrc = nrc;
        this.nombre = nombre;
        this.grado = grado;
        this.seccion = seccion;
        this.idDocente = idDocente;
        this.nombreDocente = nombreDocente;
        this.esPrueba = esPrueba;
        this.pruebaHabilitada = pruebaHabilitada;
    }

    public UUID getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(UUID idCurso) {
        this.idCurso = idCurso;
    }

    public String getNrc() {
        return nrc;
    }

    public void setNrc(String nrc) {
        this.nrc = nrc;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Short getGrado() {
        return grado;
    }

    public void setGrado(Short grado) {
        this.grado = grado;
    }

    public String getSeccion() {
        return seccion;
    }

    public void setSeccion(String seccion) {
        this.seccion = seccion;
    }

    public UUID getIdDocente() {
        return idDocente;
    }

    public void setIdDocente(UUID idDocente) {
        this.idDocente = idDocente;
    }

    public String getNombreDocente() {
        return nombreDocente;
    }

    public void setNombreDocente(String nombreDocente) {
        this.nombreDocente = nombreDocente;
    }

    public boolean isEsPrueba() {
        return esPrueba;
    }

    public void setEsPrueba(boolean esPrueba) {
        this.esPrueba = esPrueba;
    }

    public boolean isPruebaHabilitada() {
        return pruebaHabilitada;
    }

    public void setPruebaHabilitada(boolean pruebaHabilitada) {
        this.pruebaHabilitada = pruebaHabilitada;
    }
}

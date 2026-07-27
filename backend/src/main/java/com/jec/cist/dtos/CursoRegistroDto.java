package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class CursoRegistroDto {

    @NotBlank(message = "El NRC es obligatorio")
    private String nrc;

    @NotBlank(message = "El nombre del curso es obligatorio")
    private String nombre;

    @NotNull(message = "El grado es obligatorio")
    private Short grado;

    @NotBlank(message = "La sección es obligatoria")
    private String seccion;

    @NotNull(message = "El ID del docente es obligatorio")
    private UUID idDocente;

    public CursoRegistroDto() {}

    public CursoRegistroDto(String nrc, String nombre, Short grado, String seccion, UUID idDocente) {
        this.nrc = nrc;
        this.nombre = nombre;
        this.grado = grado;
        this.seccion = seccion;
        this.idDocente = idDocente;
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
}

package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class IniciarClaseDto {

    @NotBlank(message = "El QR del docente es obligatorio")
    private String qrDocente;

    @NotNull(message = "El aula AIP es obligatoria")
    private Integer idAulaAip;

    @NotBlank(message = "El grado y sección es obligatorio")
    @Size(max = 50, message = "El grado y sección no puede exceder los 50 caracteres")
    private String gradoSeccion; // Ej. "3A"

    @Size(max = 255, message = "La descripción no puede exceder los 255 caracteres")
    private String descripcion;

    // Getters y Setters
    public String getQrDocente() {
        return qrDocente;
    }

    public void setQrDocente(String qrDocente) {
        this.qrDocente = qrDocente;
    }

    public Integer getIdAulaAip() {
        return idAulaAip;
    }

    public void setIdAulaAip(Integer idAulaAip) {
        this.idAulaAip = idAulaAip;
    }

    public String getGradoSeccion() {
        return gradoSeccion;
    }

    public void setGradoSeccion(String gradoSeccion) {
        this.gradoSeccion = gradoSeccion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}

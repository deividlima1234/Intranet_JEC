package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class IniciarColegiadoDto {

    @NotBlank(message = "El QR del docente/coordinador es obligatorio")
    private String qrDocente;

    @NotNull(message = "El aula AIP es obligatoria")
    private Integer idAulaAip;

    @NotBlank(message = "La agenda o tema del trabajo colegiado es obligatorio")
    @Size(max = 255, message = "La agenda no puede exceder los 255 caracteres")
    private String descripcion;

    @NotBlank(message = "El área o categoría de trabajo es obligatorio")
    @Size(max = 50, message = "El área o categoría no puede exceder los 50 caracteres")
    private String area;

    // Getters y Setters
    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
}

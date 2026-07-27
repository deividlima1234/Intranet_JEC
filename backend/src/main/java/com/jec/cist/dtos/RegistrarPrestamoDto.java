package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class RegistrarPrestamoDto {

    @NotBlank(message = "El QR del docente es obligatorio")
    private String qrDocente;

    @NotNull(message = "El aula AIP de origen es obligatoria")
    private Integer idAulaAip;

    @NotEmpty(message = "Debe escanear al menos un equipo para el préstamo")
    private List<String> qrEquipos;

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

    public List<String> getQrEquipos() {
        return qrEquipos;
    }

    public void setQrEquipos(List<String> qrEquipos) {
        this.qrEquipos = qrEquipos;
    }
}

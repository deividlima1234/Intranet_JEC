package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AsistenciaScanRequestDto {

    @NotBlank(message = "El token QR es obligatorio")
    private String qrToken;

    @NotNull(message = "El grado de la tableta es obligatorio")
    private Short gradoTablet;

    public AsistenciaScanRequestDto() {}

    public AsistenciaScanRequestDto(String qrToken, Short gradoTablet) {
        this.qrToken = qrToken;
        this.gradoTablet = gradoTablet;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public Short getGradoTablet() {
        return gradoTablet;
    }

    public void setGradoTablet(Short gradoTablet) {
        this.gradoTablet = gradoTablet;
    }
}

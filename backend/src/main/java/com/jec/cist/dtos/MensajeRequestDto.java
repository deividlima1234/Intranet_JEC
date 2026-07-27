package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class MensajeRequestDto {
    @NotBlank(message = "El contenido no puede estar vacío")
    private String contenido;

    private UUID idEmisor;

    public MensajeRequestDto() {}

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public UUID getIdEmisor() { return idEmisor; }
    public void setIdEmisor(UUID idEmisor) { this.idEmisor = idEmisor; }
}

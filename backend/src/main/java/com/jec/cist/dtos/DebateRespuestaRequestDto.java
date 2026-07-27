package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class DebateRespuestaRequestDto {
    @NotBlank(message = "El contenido es obligatorio")
    private String contenido;

    private UUID idAutor;

    public DebateRespuestaRequestDto() {}

    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }

    public UUID getIdAutor() { return idAutor; }
    public void setIdAutor(UUID idAutor) { this.idAutor = idAutor; }
}

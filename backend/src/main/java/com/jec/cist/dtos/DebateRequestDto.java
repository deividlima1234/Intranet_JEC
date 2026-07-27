package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import java.util.UUID;

public class DebateRequestDto {
    @NotBlank(message = "El título es obligatorio")
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    private UUID idAutor;

    public DebateRequestDto() {}

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public UUID getIdAutor() { return idAutor; }
    public void setIdAutor(UUID idAutor) { this.idAutor = idAutor; }
}

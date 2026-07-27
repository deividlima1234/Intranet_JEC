package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class DebateComentarioRespuestaDto {
    private UUID idRespuesta;
    private UUID idDebate;
    private String contenido;
    private LocalDateTime fechaCreacion;
    private UUID idAutor;
    private String nombreAutor;

    public DebateComentarioRespuestaDto() {}

    public DebateComentarioRespuestaDto(UUID idRespuesta, UUID idDebate, String contenido, LocalDateTime fechaCreacion, UUID idAutor, String nombreAutor) {
        this.idRespuesta = idRespuesta;
        this.idDebate = idDebate;
        this.contenido = contenido;
        this.fechaCreacion = fechaCreacion;
        this.idAutor = idAutor;
        this.nombreAutor = nombreAutor;
    }

    public UUID getIdRespuesta() { return idRespuesta; }
    public void setIdRespuesta(UUID idRespuesta) { this.idRespuesta = idRespuesta; }
    public UUID getIdDebate() { return idDebate; }
    public void setIdDebate(UUID idDebate) { this.idDebate = idDebate; }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public UUID getIdAutor() { return idAutor; }
    public void setIdAutor(UUID idAutor) { this.idAutor = idAutor; }
    public String getNombreAutor() { return nombreAutor; }
    public void setNombreAutor(String nombreAutor) { this.nombreAutor = nombreAutor; }
}

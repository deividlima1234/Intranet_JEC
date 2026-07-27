package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class DebateRespuestaDto {
    private UUID idDebate;
    private UUID idCurso;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaCreacion;
    private UUID idAutor;
    private String nombreAutor;

    public DebateRespuestaDto() {}

    public DebateRespuestaDto(UUID idDebate, UUID idCurso, String titulo, String descripcion, LocalDateTime fechaCreacion, UUID idAutor, String nombreAutor) {
        this.idDebate = idDebate;
        this.idCurso = idCurso;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaCreacion = fechaCreacion;
        this.idAutor = idAutor;
        this.nombreAutor = nombreAutor;
    }

    public UUID getIdDebate() { return idDebate; }
    public void setIdDebate(UUID idDebate) { this.idDebate = idDebate; }
    public UUID getIdCurso() { return idCurso; }
    public void setIdCurso(UUID idCurso) { this.idCurso = idCurso; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    public UUID getIdAutor() { return idAutor; }
    public void setIdAutor(UUID idAutor) { this.idAutor = idAutor; }
    public String getNombreAutor() { return nombreAutor; }
    public void setNombreAutor(String nombreAutor) { this.nombreAutor = nombreAutor; }
}

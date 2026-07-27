package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class AnuncioRespuestaDto {
    private UUID idAnuncio;
    private UUID idCurso;
    private String titulo;
    private String contenido;
    private LocalDateTime fechaPublicacion;
    private UUID idAutor;
    private String nombreAutor;

    public AnuncioRespuestaDto() {}

    public AnuncioRespuestaDto(UUID idAnuncio, UUID idCurso, String titulo, String contenido, LocalDateTime fechaPublicacion, UUID idAutor, String nombreAutor) {
        this.idAnuncio = idAnuncio;
        this.idCurso = idCurso;
        this.titulo = titulo;
        this.contenido = contenido;
        this.fechaPublicacion = fechaPublicacion;
        this.idAutor = idAutor;
        this.nombreAutor = nombreAutor;
    }

    public UUID getIdAnuncio() { return idAnuncio; }
    public void setIdAnuncio(UUID idAnuncio) { this.idAnuncio = idAnuncio; }
    public UUID getIdCurso() { return idCurso; }
    public void setIdCurso(UUID idCurso) { this.idCurso = idCurso; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public LocalDateTime getFechaPublicacion() { return fechaPublicacion; }
    public void setFechaPublicacion(LocalDateTime fechaPublicacion) { this.fechaPublicacion = fechaPublicacion; }
    public UUID getIdAutor() { return idAutor; }
    public void setIdAutor(UUID idAutor) { this.idAutor = idAutor; }
    public String getNombreAutor() { return nombreAutor; }
    public void setNombreAutor(String nombreAutor) { this.nombreAutor = nombreAutor; }
}

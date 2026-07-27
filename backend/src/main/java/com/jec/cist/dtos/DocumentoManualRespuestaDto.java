package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class DocumentoManualRespuestaDto {
    private UUID idDocumento;
    private String titulo;
    private String descripcion;
    private String nombreArchivo;
    private Long tamanoArchivo;
    private String tipoContenido;
    private LocalDateTime fechaSubida;
    private UUID idAutor;
    private String nombreAutor;
    private String rolesVisibles;

    public DocumentoManualRespuestaDto() {}

    public DocumentoManualRespuestaDto(UUID idDocumento, String titulo, String descripcion, String nombreArchivo, Long tamanoArchivo, String tipoContenido, LocalDateTime fechaSubida, UUID idAutor, String nombreAutor, String rolesVisibles) {
        this.idDocumento = idDocumento;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.nombreArchivo = nombreArchivo;
        this.tamanoArchivo = tamanoArchivo;
        this.tipoContenido = tipoContenido;
        this.fechaSubida = fechaSubida;
        this.idAutor = idAutor;
        this.nombreAutor = nombreAutor;
        this.rolesVisibles = rolesVisibles;
    }

    public UUID getIdDocumento() {
        return idDocumento;
    }

    public void setIdDocumento(UUID idDocumento) {
        this.idDocumento = idDocumento;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getNombreArchivo() {
        return nombreArchivo;
    }

    public void setNombreArchivo(String nombreArchivo) {
        this.nombreArchivo = nombreArchivo;
    }

    public Long getTamanoArchivo() {
        return tamanoArchivo;
    }

    public void setTamanoArchivo(Long tamanoArchivo) {
        this.tamanoArchivo = tamanoArchivo;
    }

    public String getTipoContenido() {
        return tipoContenido;
    }

    public void setTipoContenido(String tipoContenido) {
        this.tipoContenido = tipoContenido;
    }

    public LocalDateTime getFechaSubida() {
        return fechaSubida;
    }

    public void setFechaSubida(LocalDateTime fechaSubida) {
        this.fechaSubida = fechaSubida;
    }

    public UUID getIdAutor() {
        return idAutor;
    }

    public void setIdAutor(UUID idAutor) {
        this.idAutor = idAutor;
    }

    public String getNombreAutor() {
        return nombreAutor;
    }

    public void setNombreAutor(String nombreAutor) {
        this.nombreAutor = nombreAutor;
    }

    public String getRolesVisibles() {
        return rolesVisibles;
    }

    public void setRolesVisibles(String rolesVisibles) {
        this.rolesVisibles = rolesVisibles;
    }
}

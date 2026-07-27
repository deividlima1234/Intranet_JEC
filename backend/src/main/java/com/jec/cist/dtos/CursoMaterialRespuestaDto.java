package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class CursoMaterialRespuestaDto {
    private UUID idMaterial;
    private UUID idCurso;
    private String titulo;
    private String descripcion;
    private String nombreArchivo;
    private Long tamanoArchivo;
    private String tipoContenido;
    private LocalDateTime fechaSubida;
    private String visibilidad;
    private List<UUID> destinatariosIds;

    public CursoMaterialRespuestaDto() {}

    public CursoMaterialRespuestaDto(UUID idMaterial, UUID idCurso, String titulo, String descripcion, String nombreArchivo, Long tamanoArchivo, String tipoContenido, LocalDateTime fechaSubida, String visibilidad, List<UUID> destinatariosIds) {
        this.idMaterial = idMaterial;
        this.idCurso = idCurso;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.nombreArchivo = nombreArchivo;
        this.tamanoArchivo = tamanoArchivo;
        this.tipoContenido = tipoContenido;
        this.fechaSubida = fechaSubida;
        this.visibilidad = visibilidad;
        this.destinatariosIds = destinatariosIds;
    }

    public UUID getIdMaterial() {
        return idMaterial;
    }

    public void setIdMaterial(UUID idMaterial) {
        this.idMaterial = idMaterial;
    }

    public UUID getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(UUID idCurso) {
        this.idCurso = idCurso;
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

    public String getVisibilidad() {
        return visibilidad;
    }

    public void setVisibilidad(String visibilidad) {
        this.visibilidad = visibilidad;
    }

    public List<UUID> getDestinatariosIds() {
        return destinatariosIds;
    }

    public void setDestinatariosIds(List<UUID> destinatariosIds) {
        this.destinatariosIds = destinatariosIds;
    }
}

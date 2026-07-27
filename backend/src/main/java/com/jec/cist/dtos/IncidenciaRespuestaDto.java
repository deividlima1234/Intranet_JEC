package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class IncidenciaRespuestaDto {
    private UUID idIncidencia;
    private String titulo;
    private String descripcion;
    private String tipo;
    private String estado;
    private LocalDateTime fechaCreacion;
    private UUID idAutor;
    private String nombreAutor;
    private String rolAutor;
    private String respuestaSoporte;
    private LocalDateTime fechaRespuesta;
    private UUID idAtendidoPor;
    private String nombreAtendidoPor;

    public IncidenciaRespuestaDto() {}

    public IncidenciaRespuestaDto(UUID idIncidencia, String titulo, String descripcion, String tipo, String estado,
                                 LocalDateTime fechaCreacion, UUID idAutor, String nombreAutor, String rolAutor,
                                 String respuestaSoporte, LocalDateTime fechaRespuesta, UUID idAtendidoPor,
                                 String nombreAtendidoPor) {
        this.idIncidencia = idIncidencia;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.estado = estado;
        this.fechaCreacion = fechaCreacion;
        this.idAutor = idAutor;
        this.nombreAutor = nombreAutor;
        this.rolAutor = rolAutor;
        this.respuestaSoporte = respuestaSoporte;
        this.fechaRespuesta = fechaRespuesta;
        this.idAtendidoPor = idAtendidoPor;
        this.nombreAtendidoPor = nombreAtendidoPor;
    }

    public UUID getIdIncidencia() {
        return idIncidencia;
    }

    public void setIdIncidencia(UUID idIncidencia) {
        this.idIncidencia = idIncidencia;
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
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

    public String getRolAutor() {
        return rolAutor;
    }

    public void setRolAutor(String rolAutor) {
        this.rolAutor = rolAutor;
    }

    public String getRespuestaSoporte() {
        return respuestaSoporte;
    }

    public void setRespuestaSoporte(String respuestaSoporte) {
        this.respuestaSoporte = respuestaSoporte;
    }

    public LocalDateTime getFechaRespuesta() {
        return fechaRespuesta;
    }

    public void setFechaRespuesta(LocalDateTime fechaRespuesta) {
        this.fechaRespuesta = fechaRespuesta;
    }

    public UUID getIdAtendidoPor() {
        return idAtendidoPor;
    }

    public void setIdAtendidoPor(UUID idAtendidoPor) {
        this.idAtendidoPor = idAtendidoPor;
    }

    public String getNombreAtendidoPor() {
        return nombreAtendidoPor;
    }

    public void setNombreAtendidoPor(String nombreAtendidoPor) {
        this.nombreAtendidoPor = nombreAtendidoPor;
    }
}

package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class EstudianteAvanceRespuestaDto {
    private UUID idAvance;
    private UUID idCurso;
    private UUID idEvaluacion;
    private String nombreCurso;
    private UUID idEstudiante;
    private String nombreEstudiante;
    private String titulo;
    private String descripcion;
    private String nombreArchivo;
    private Long tamanoArchivo;
    private String tipoContenido;
    private LocalDateTime fechaSubida;
    private String estado;
    private String comentarioDocente;

    public EstudianteAvanceRespuestaDto() {}

    public EstudianteAvanceRespuestaDto(UUID idAvance, UUID idCurso, UUID idEvaluacion, String nombreCurso, UUID idEstudiante, 
                                        String nombreEstudiante, String titulo, String descripcion, 
                                        String nombreArchivo, Long tamanoArchivo, String tipoContenido, 
                                        LocalDateTime fechaSubida, String estado, String comentarioDocente) {
        this.idAvance = idAvance;
        this.idCurso = idCurso;
        this.idEvaluacion = idEvaluacion;
        this.nombreCurso = nombreCurso;
        this.idEstudiante = idEstudiante;
        this.nombreEstudiante = nombreEstudiante;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.nombreArchivo = nombreArchivo;
        this.tamanoArchivo = tamanoArchivo;
        this.tipoContenido = tipoContenido;
        this.fechaSubida = fechaSubida;
        this.estado = estado;
        this.comentarioDocente = comentarioDocente;
    }

    public UUID getIdAvance() {
        return idAvance;
    }

    public void setIdAvance(UUID idAvance) {
        this.idAvance = idAvance;
    }

    public UUID getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(UUID idCurso) {
        this.idCurso = idCurso;
    }

    public UUID getIdEvaluacion() {
        return idEvaluacion;
    }

    public void setIdEvaluacion(UUID idEvaluacion) {
        this.idEvaluacion = idEvaluacion;
    }

    public String getNombreCurso() {
        return nombreCurso;
    }

    public void setNombreCurso(String nombreCurso) {
        this.nombreCurso = nombreCurso;
    }

    public UUID getIdEstudiante() {
        return idEstudiante;
    }

    public void setIdEstudiante(UUID idEstudiante) {
        this.idEstudiante = idEstudiante;
    }

    public String getNombreEstudiante() {
        return nombreEstudiante;
    }

    public void setNombreEstudiante(String nombreEstudiante) {
        this.nombreEstudiante = nombreEstudiante;
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

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getComentarioDocente() {
        return comentarioDocente;
    }

    public void setComentarioDocente(String comentarioDocente) {
        this.comentarioDocente = comentarioDocente;
    }
}

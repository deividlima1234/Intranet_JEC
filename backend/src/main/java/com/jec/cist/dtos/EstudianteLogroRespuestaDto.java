package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class EstudianteLogroRespuestaDto {
    private UUID idLogro;
    private UUID idCurso;
    private UUID idEstudiante;
    private String nombreEstudiante;
    private String insignia;
    private String comentario;
    private LocalDateTime fechaOtorgado;

    public EstudianteLogroRespuestaDto() {}

    public EstudianteLogroRespuestaDto(UUID idLogro, UUID idCurso, UUID idEstudiante, String nombreEstudiante, String insignia, String comentario, LocalDateTime fechaOtorgado) {
        this.idLogro = idLogro;
        this.idCurso = idCurso;
        this.idEstudiante = idEstudiante;
        this.nombreEstudiante = nombreEstudiante;
        this.insignia = insignia;
        this.comentario = comentario;
        this.fechaOtorgado = fechaOtorgado;
    }

    public UUID getIdLogro() { return idLogro; }
    public void setIdLogro(UUID idLogro) { this.idLogro = idLogro; }
    public UUID getIdCurso() { return idCurso; }
    public void setIdCurso(UUID idCurso) { this.idCurso = idCurso; }
    public UUID getIdEstudiante() { return idEstudiante; }
    public void setIdEstudiante(UUID idEstudiante) { this.idEstudiante = idEstudiante; }
    public String getNombreEstudiante() { return nombreEstudiante; }
    public void setNombreEstudiante(String nombreEstudiante) { this.nombreEstudiante = nombreEstudiante; }
    public String getInsignia() { return insignia; }
    public void setInsignia(String insignia) { this.insignia = insignia; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public LocalDateTime getFechaOtorgado() { return fechaOtorgado; }
    public void setFechaOtorgado(LocalDateTime fechaOtorgado) { this.fechaOtorgado = fechaOtorgado; }
}

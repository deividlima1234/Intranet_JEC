package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class CalendarioEventoRespuestaDto {
    private UUID idEvento;
    private UUID idCurso;
    private String titulo;
    private String descripcion;
    private LocalDateTime fechaHora;

    public CalendarioEventoRespuestaDto() {}

    public CalendarioEventoRespuestaDto(UUID idEvento, UUID idCurso, String titulo, String descripcion, LocalDateTime fechaHora) {
        this.idEvento = idEvento;
        this.idCurso = idCurso;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaHora = fechaHora;
    }

    public UUID getIdEvento() { return idEvento; }
    public void setIdEvento(UUID idEvento) { this.idEvento = idEvento; }
    public UUID getIdCurso() { return idCurso; }
    public void setIdCurso(UUID idCurso) { this.idCurso = idCurso; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public LocalDateTime getFechaHora() { return fechaHora; }
    public void setFechaHora(LocalDateTime fechaHora) { this.fechaHora = fechaHora; }
}

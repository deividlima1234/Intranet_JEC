package com.jec.cist.dtos;

import java.time.LocalDateTime;
import java.util.UUID;

public class MensajeRespuestaDto {
    private UUID idMensaje;
    private UUID idCurso;
    private UUID idEmisor;
    private String nombreEmisor;
    private UUID idReceptor;
    private String nombreReceptor;
    private String contenido;
    private LocalDateTime fechaEnvio;
    private boolean leido;

    public MensajeRespuestaDto() {}

    public MensajeRespuestaDto(UUID idMensaje, UUID idCurso, UUID idEmisor, String nombreEmisor, UUID idReceptor, String nombreReceptor, String contenido, LocalDateTime fechaEnvio, boolean leido) {
        this.idMensaje = idMensaje;
        this.idCurso = idCurso;
        this.idEmisor = idEmisor;
        this.nombreEmisor = nombreEmisor;
        this.idReceptor = idReceptor;
        this.nombreReceptor = nombreReceptor;
        this.contenido = contenido;
        this.fechaEnvio = fechaEnvio;
        this.leido = leido;
    }

    public UUID getIdMensaje() { return idMensaje; }
    public void setIdMensaje(UUID idMensaje) { this.idMensaje = idMensaje; }
    public UUID getIdCurso() { return idCurso; }
    public void setIdCurso(UUID idCurso) { this.idCurso = idCurso; }
    public UUID getIdEmisor() { return idEmisor; }
    public void setIdEmisor(UUID idEmisor) { this.idEmisor = idEmisor; }
    public String getNombreEmisor() { return nombreEmisor; }
    public void setNombreEmisor(String nombreEmisor) { this.nombreEmisor = nombreEmisor; }
    public UUID getIdReceptor() { return idReceptor; }
    public void setIdReceptor(UUID idReceptor) { this.idReceptor = idReceptor; }
    public String getNombreReceptor() { return nombreReceptor; }
    public void setNombreReceptor(String nombreReceptor) { this.nombreReceptor = nombreReceptor; }
    public String getContenido() { return contenido; }
    public void setContenido(String contenido) { this.contenido = contenido; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    public boolean isLeido() { return leido; }
    public void setLeido(boolean leido) { this.leido = leido; }
}

package com.jec.cist.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "respuestas_encuesta",
    uniqueConstraints = @UniqueConstraint(columnNames = {"id_encuesta", "id_usuario"})
)
public class RespuestaEncuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_respuesta")
    private UUID idRespuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_encuesta", nullable = false)
    private EncuestaCIST encuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "fecha_respuesta", nullable = false)
    private LocalDateTime fechaRespuesta = LocalDateTime.now();

    /**
     * JSON con todas las respuestas de la encuesta estructuradas por sección.
     * Ej: {"seccion1":{"q1":"MATEMATICA","q2":"2_5_HORAS"},"seccion2":{...},...}
     */
    @Column(name = "respuestas_json", nullable = false, columnDefinition = "TEXT")
    private String respuestasJson;

    /**
     * Área curricular del respondente al momento de responder.
     * Almacenado aquí para facilitar consultas de agrupamiento sin parsear JSON.
     */
    @Column(name = "area_curricular", nullable = true, length = 100)
    private String areaCurricular;

    /**
     * Rol del usuario al momento de responder.
     */
    @Column(name = "rol_respondente", nullable = true, length = 50)
    private String rolRespondente;

    // Constructores
    public RespuestaEncuesta() {}

    public RespuestaEncuesta(EncuestaCIST encuesta, Usuario usuario, String respuestasJson, String areaCurricular, String rolRespondente) {
        this.encuesta = encuesta;
        this.usuario = usuario;
        this.respuestasJson = respuestasJson;
        this.areaCurricular = areaCurricular;
        this.rolRespondente = rolRespondente;
        this.fechaRespuesta = LocalDateTime.now();
    }

    // Getters y Setters
    public UUID getIdRespuesta() { return idRespuesta; }
    public void setIdRespuesta(UUID idRespuesta) { this.idRespuesta = idRespuesta; }

    public EncuestaCIST getEncuesta() { return encuesta; }
    public void setEncuesta(EncuestaCIST encuesta) { this.encuesta = encuesta; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public LocalDateTime getFechaRespuesta() { return fechaRespuesta; }
    public void setFechaRespuesta(LocalDateTime fechaRespuesta) { this.fechaRespuesta = fechaRespuesta; }

    public String getRespuestasJson() { return respuestasJson; }
    public void setRespuestasJson(String respuestasJson) { this.respuestasJson = respuestasJson; }

    public String getAreaCurricular() { return areaCurricular; }
    public void setAreaCurricular(String areaCurricular) { this.areaCurricular = areaCurricular; }

    public String getRolRespondente() { return rolRespondente; }
    public void setRolRespondente(String rolRespondente) { this.rolRespondente = rolRespondente; }
}

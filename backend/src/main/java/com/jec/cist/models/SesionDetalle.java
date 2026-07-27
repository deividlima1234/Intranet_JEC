package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(name = "sesiones_detalle")
public class SesionDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_detalle")
    private UUID idDetalle;

    @NotNull(message = "La sesión grupal cabecera es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sesion", nullable = false)
    private SesionGrupal sesionGrupal;

    @NotNull(message = "El equipo asignado es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_equipo", nullable = false)
    private EquipoAip equipoAip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", nullable = true)
    private Usuario estudiante;

    @Column(name = "incidencias", columnDefinition = "TEXT")
    private String incidencias;

    // Constructores, Getters y Setters
    public SesionDetalle() {}

    public SesionDetalle(SesionGrupal sesionGrupal, EquipoAip equipoAip, Usuario estudiante) {
        this.sesionGrupal = sesionGrupal;
        this.equipoAip = equipoAip;
        this.estudiante = estudiante;
    }

    public UUID getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(UUID idDetalle) {
        this.idDetalle = idDetalle;
    }

    public SesionGrupal getSesionGrupal() {
        return sesionGrupal;
    }

    public void setSesionGrupal(SesionGrupal sesionGrupal) {
        this.sesionGrupal = sesionGrupal;
    }

    public EquipoAip getEquipoAip() {
        return equipoAip;
    }

    public void setEquipoAip(EquipoAip equipoAip) {
        this.equipoAip = equipoAip;
    }

    public Usuario getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Usuario estudiante) {
        this.estudiante = estudiante;
    }

    public String getIncidencias() {
        return incidencias;
    }

    public void setIncidencias(String incidencias) {
        this.incidencias = incidencias;
    }
}

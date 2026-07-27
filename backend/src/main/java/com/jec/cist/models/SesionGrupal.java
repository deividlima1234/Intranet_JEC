package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sesiones_grupales")
public class SesionGrupal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_sesion")
    private UUID idSesion;

    @NotNull(message = "El docente responsable es obligatorio")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_docente", nullable = false)
    private Usuario docente;

    @NotNull(message = "El aula AIP es obligatoria")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aula_aip", nullable = false)
    private AulaAip aulaAip;

    @NotNull(message = "El tipo de operación es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_operacion", nullable = false)
    private TipoOperacion tipoOperacion;

    @Size(max = 50, message = "El grado y sección no puede exceder los 50 caracteres")
    @Column(name = "grado_seccion", length = 50)
    private String gradoSeccion;

    @Size(max = 255, message = "La descripción no puede exceder los 255 caracteres")
    @Column(name = "descripcion")
    private String descripcion;

    @Column(name = "firma_inicio", columnDefinition = "TEXT")
    private String firmaInicio;

    @Column(name = "firma_fin", columnDefinition = "TEXT")
    private String firmaFin;

    @NotNull
    @Column(name = "hora_inicio", nullable = false)
    private LocalDateTime horaInicio = LocalDateTime.now();

    @Column(name = "hora_fin")
    private LocalDateTime horaFin;

    // Constructores, Getters y Setters
    public SesionGrupal() {}

    public SesionGrupal(Usuario docente, AulaAip aulaAip, TipoOperacion tipoOperacion, String gradoSeccion) {
        this.docente = docente;
        this.aulaAip = aulaAip;
        this.tipoOperacion = tipoOperacion;
        this.gradoSeccion = gradoSeccion;
        this.horaInicio = LocalDateTime.now();
    }

    public UUID getIdSesion() {
        return idSesion;
    }

    public void setIdSesion(UUID idSesion) {
        this.idSesion = idSesion;
    }

    public Usuario getDocente() {
        return docente;
    }

    public void setDocente(Usuario docente) {
        this.docente = docente;
    }

    public AulaAip getAulaAip() {
        return aulaAip;
    }

    public void setAulaAip(AulaAip aulaAip) {
        this.aulaAip = aulaAip;
    }

    public TipoOperacion getTipoOperacion() {
        return tipoOperacion;
    }

    public void setTipoOperacion(TipoOperacion tipoOperacion) {
        this.tipoOperacion = tipoOperacion;
    }

    public String getGradoSeccion() {
        return gradoSeccion;
    }

    public void setGradoSeccion(String gradoSeccion) {
        this.gradoSeccion = gradoSeccion;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFirmaInicio() {
        return firmaInicio;
    }

    public void setFirmaInicio(String firmaInicio) {
        this.firmaInicio = firmaInicio;
    }

    public String getFirmaFin() {
        return firmaFin;
    }

    public void setFirmaFin(String firmaFin) {
        this.firmaFin = firmaFin;
    }

    public LocalDateTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalDateTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalDateTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalDateTime horaFin) {
        this.horaFin = horaFin;
    }
}

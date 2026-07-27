package com.jec.cist.models;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "encuestas_cist")
public class EncuestaCIST {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_encuesta")
    private UUID idEncuesta;

    @Column(name = "titulo", nullable = false, length = 200)
    private String titulo;

    @Column(name = "descripcion", nullable = true, length = 1000)
    private String descripcion;

    @Column(name = "activa", nullable = false)
    private boolean activa = false;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_creador", nullable = true)
    private Usuario creadaPor;

    /**
     * Roles que pueden responder esta encuesta.
     * Formato: CSV de roles del enum Rol, ej: "DOCENTE,AUXILIAR,ADMINISTRATIVO"
     * El valor especial "TODOS" significa que todos los roles (excepto ESTUDIANTE) pueden responder.
     */
    @Column(name = "roles_habilitados", nullable = false, length = 200)
    private String rolesHabilitados = "DOCENTE";

    // Constructores
    public EncuestaCIST() {}

    public EncuestaCIST(String titulo, String descripcion, Usuario creadaPor, String rolesHabilitados) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.creadaPor = creadaPor;
        this.rolesHabilitados = rolesHabilitados;
        this.fechaCreacion = LocalDateTime.now();
        this.activa = false;
    }

    // Getters y Setters
    public UUID getIdEncuesta() { return idEncuesta; }
    public void setIdEncuesta(UUID idEncuesta) { this.idEncuesta = idEncuesta; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public boolean isActiva() { return activa; }
    public void setActiva(boolean activa) { this.activa = activa; }

    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }

    public Usuario getCreadaPor() { return creadaPor; }
    public void setCreadaPor(Usuario creadaPor) { this.creadaPor = creadaPor; }

    public String getRolesHabilitados() { return rolesHabilitados; }
    public void setRolesHabilitados(String rolesHabilitados) { this.rolesHabilitados = rolesHabilitados; }
}

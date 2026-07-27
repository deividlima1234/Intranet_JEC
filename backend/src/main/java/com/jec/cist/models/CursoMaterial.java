package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "curso_materiales")
public class CursoMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_material")
    private UUID idMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    @NotBlank(message = "El título es obligatorio")
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @NotBlank(message = "El nombre del archivo es obligatorio")
    @Column(name = "nombre_archivo", nullable = false, length = 255)
    private String nombreArchivo;

    @NotBlank(message = "La ruta del archivo es obligatoria")
    @Column(name = "ruta_archivo", nullable = false, length = 512)
    private String rutaArchivo;

    @Column(name = "tamano_archivo")
    private Long tamanoArchivo;

    @Column(name = "tipo_contenido", length = 100)
    private String tipoContenido;

    @Column(name = "fecha_subida", nullable = false)
    private LocalDateTime fechaSubida = LocalDateTime.now();

    @Column(name = "visibilidad", length = 20)
    private String visibilidad = "TODOS"; // "TODOS" o "SELECCIONADOS"

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "curso_materiales_destinatarios", joinColumns = @JoinColumn(name = "id_material"))
    @Column(name = "id_usuario_estudiante")
    private List<UUID> destinatariosIds = new ArrayList<>();

    public CursoMaterial() {}

    public CursoMaterial(Curso curso, String titulo, String descripcion, String nombreArchivo, String rutaArchivo, Long tamanoArchivo, String tipoContenido, String visibilidad, List<UUID> destinatariosIds) {
        this.curso = curso;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.nombreArchivo = nombreArchivo;
        this.rutaArchivo = rutaArchivo;
        this.tamanoArchivo = tamanoArchivo;
        this.tipoContenido = tipoContenido;
        this.fechaSubida = LocalDateTime.now();
        this.visibilidad = (visibilidad != null) ? visibilidad : "TODOS";
        if (destinatariosIds != null) {
            this.destinatariosIds = destinatariosIds;
        }
    }

    public UUID getIdMaterial() {
        return idMaterial;
    }

    public void setIdMaterial(UUID idMaterial) {
        this.idMaterial = idMaterial;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
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

    public String getRutaArchivo() {
        return rutaArchivo;
    }

    public void setRutaArchivo(String rutaArchivo) {
        this.rutaArchivo = rutaArchivo;
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

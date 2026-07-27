package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documentos_manuales")
public class DocumentoManual {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_documento")
    private UUID idDocumento;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_autor", referencedColumnName = "id_usuario", nullable = false)
    private Usuario autor;

    // Roles que pueden ver el documento. Comma-separated (ej. "DOCENTE,ESTUDIANTE" o "TODOS")
    @NotBlank(message = "La visibilidad de roles es obligatoria")
    @Column(name = "roles_visibles", nullable = false, length = 255)
    private String rolesVisibles = "TODOS";

    public DocumentoManual() {}

    public DocumentoManual(String titulo, String descripcion, String nombreArchivo, String rutaArchivo, Long tamanoArchivo, String tipoContenido, Usuario autor, String rolesVisibles) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.nombreArchivo = nombreArchivo;
        this.rutaArchivo = rutaArchivo;
        this.tamanoArchivo = tamanoArchivo;
        this.tipoContenido = tipoContenido;
        this.autor = autor;
        this.rolesVisibles = rolesVisibles != null && !rolesVisibles.trim().isEmpty() ? rolesVisibles : "TODOS";
        this.fechaSubida = LocalDateTime.now();
    }

    public UUID getIdDocumento() {
        return idDocumento;
    }

    public void setIdDocumento(UUID idDocumento) {
        this.idDocumento = idDocumento;
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

    public Usuario getAutor() {
        return autor;
    }

    public void setAutor(Usuario autor) {
        this.autor = autor;
    }

    public String getRolesVisibles() {
        return rolesVisibles;
    }

    public void setRolesVisibles(String rolesVisibles) {
        this.rolesVisibles = rolesVisibles;
    }
}

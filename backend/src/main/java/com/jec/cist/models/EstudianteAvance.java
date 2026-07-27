package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "estudiante_avances")
public class EstudianteAvance {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_avance")
    private UUID idAvance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evaluacion")
    private CursoEvaluacion evaluacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", referencedColumnName = "id_usuario", nullable = false)
    private Estudiante estudiante;

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

    @NotBlank(message = "El estado es obligatorio")
    @Column(name = "estado", nullable = false, length = 50)
    private String estado = "PENDIENTE"; // PENDIENTE, REVISADO, CORREGIR

    @Column(name = "comentario_docente", length = 500)
    private String comentarioDocente;

    public EstudianteAvance() {}

    public EstudianteAvance(Curso curso, CursoEvaluacion evaluacion, Estudiante estudiante, String titulo, String descripcion, String nombreArchivo, String rutaArchivo, Long tamanoArchivo, String tipoContenido) {
        this.curso = curso;
        this.evaluacion = evaluacion;
        this.estudiante = estudiante;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.nombreArchivo = nombreArchivo;
        this.rutaArchivo = rutaArchivo;
        this.tamanoArchivo = tamanoArchivo;
        this.tipoContenido = tipoContenido;
        this.fechaSubida = LocalDateTime.now();
        this.estado = "PENDIENTE";
    }

    public UUID getIdAvance() {
        return idAvance;
    }

    public void setIdAvance(UUID idAvance) {
        this.idAvance = idAvance;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public CursoEvaluacion getEvaluacion() {
        return evaluacion;
    }

    public void setEvaluacion(CursoEvaluacion evaluacion) {
        this.evaluacion = evaluacion;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
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

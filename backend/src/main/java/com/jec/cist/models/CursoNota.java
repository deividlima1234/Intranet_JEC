package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "curso_notas")
public class CursoNota {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_nota")
    private UUID idNota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", referencedColumnName = "id_usuario", nullable = false)
    private Estudiante estudiante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evaluacion")
    private CursoEvaluacion evaluacion;

    @Column(name = "criterio", length = 100) // Puede ser nulo si viene de una Evaluación
    private String criterio;

    @NotBlank(message = "La calificación es obligatoria")
    @Column(name = "calificacion", nullable = false, length = 10)
    private String calificacion;

    @Column(name = "puntaje_total")
    private Integer puntajeTotal;

    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();

    public CursoNota() {}

    public CursoNota(Estudiante estudiante, Curso curso, String criterio, String calificacion) {
        this.estudiante = estudiante;
        this.curso = curso;
        this.criterio = criterio;
        this.calificacion = calificacion;
        this.fechaRegistro = LocalDateTime.now();
    }

    public CursoNota(Estudiante estudiante, Curso curso, CursoEvaluacion evaluacion, String calificacion, Integer puntajeTotal) {
        this.estudiante = estudiante;
        this.curso = curso;
        this.evaluacion = evaluacion;
        this.calificacion = calificacion;
        this.puntajeTotal = puntajeTotal;
        this.fechaRegistro = LocalDateTime.now();
    }

    public UUID getIdNota() {
        return idNota;
    }

    public void setIdNota(UUID idNota) {
        this.idNota = idNota;
    }

    public Estudiante getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Estudiante estudiante) {
        this.estudiante = estudiante;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public String getCriterio() {
        return criterio;
    }

    public void setCriterio(String criterio) {
        this.criterio = criterio;
    }

    public String getCalificacion() {
        return calificacion;
    }

    public void setCalificacion(String calificacion) {
        this.calificacion = calificacion;
    }

    public Integer getPuntajeTotal() {
        return puntajeTotal;
    }

    public void setPuntajeTotal(Integer puntajeTotal) {
        this.puntajeTotal = puntajeTotal;
    }

    public CursoEvaluacion getEvaluacion() {
        return evaluacion;
    }

    public void setEvaluacion(CursoEvaluacion evaluacion) {
        this.evaluacion = evaluacion;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}

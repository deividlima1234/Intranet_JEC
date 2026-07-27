package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "estudiante_logros")
public class EstudianteLogro {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_logro")
    private UUID idLogro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", referencedColumnName = "id_usuario", nullable = false)
    private Usuario estudiante;

    @NotBlank(message = "La insignia es obligatoria")
    @Column(name = "insignia", nullable = false, length = 100)
    private String insignia; // e.g. EXCELENCIA_ACADEMICA, ESFUERZO_DEDICACION, PARTICIPACION_ACTIVA, PUNTUALIDAD

    @Column(name = "comentario", columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "fecha_otorgado", nullable = false)
    private LocalDateTime fechaOtorgado = LocalDateTime.now();

    public EstudianteLogro() {}

    public EstudianteLogro(Curso curso, Usuario estudiante, String insignia, String comentario) {
        this.curso = curso;
        this.estudiante = estudiante;
        this.insignia = insignia;
        this.comentario = comentario;
        this.fechaOtorgado = LocalDateTime.now();
    }

    public UUID getIdLogro() {
        return idLogro;
    }

    public void setIdLogro(UUID idLogro) {
        this.idLogro = idLogro;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public Usuario getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Usuario estudiante) {
        this.estudiante = estudiante;
    }

    public String getInsignia() {
        return insignia;
    }

    public void setInsignia(String insignia) {
        this.insignia = insignia;
    }

    public String getComentario() {
        return comentario;
    }

    public void setComentario(String comentario) {
        this.comentario = comentario;
    }

    public LocalDateTime getFechaOtorgado() {
        return fechaOtorgado;
    }

    public void setFechaOtorgado(LocalDateTime fechaOtorgado) {
        this.fechaOtorgado = fechaOtorgado;
    }
}

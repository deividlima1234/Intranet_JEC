package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "curso_evaluaciones")
public class CursoEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_evaluacion")
    private UUID idEvaluacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_curso", nullable = false)
    private Curso curso;

    @NotBlank(message = "El título es obligatorio")
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @NotNull(message = "La fecha límite es obligatoria")
    @Column(name = "fecha_limite", nullable = false)
    private LocalDateTime fechaLimite;

    @Column(name = "permitir_entregas_tardias", nullable = false)
    private Boolean permitirEntregasTardias = false;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @OneToMany(mappedBy = "evaluacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EvaluacionCriterio> criterios = new ArrayList<>();

    public CursoEvaluacion() {}

    public CursoEvaluacion(Curso curso, String titulo, String descripcion, LocalDateTime fechaLimite, Boolean permitirEntregasTardias) {
        this.curso = curso;
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.fechaLimite = fechaLimite;
        this.permitirEntregasTardias = permitirEntregasTardias != null ? permitirEntregasTardias : false;
        this.fechaCreacion = LocalDateTime.now();
    }

    public UUID getIdEvaluacion() {
        return idEvaluacion;
    }

    public void setIdEvaluacion(UUID idEvaluacion) {
        this.idEvaluacion = idEvaluacion;
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

    public LocalDateTime getFechaLimite() {
        return fechaLimite;
    }

    public void setFechaLimite(LocalDateTime fechaLimite) {
        this.fechaLimite = fechaLimite;
    }

    public Boolean getPermitirEntregasTardias() {
        return permitirEntregasTardias;
    }

    public void setPermitirEntregasTardias(Boolean permitirEntregasTardias) {
        this.permitirEntregasTardias = permitirEntregasTardias;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public List<EvaluacionCriterio> getCriterios() {
        return criterios;
    }

    public void setCriterios(List<EvaluacionCriterio> criterios) {
        this.criterios = criterios;
    }

    public void addCriterio(EvaluacionCriterio criterio) {
        criterios.add(criterio);
        criterio.setEvaluacion(this);
    }

    public void removeCriterio(EvaluacionCriterio criterio) {
        criterios.remove(criterio);
        criterio.setEvaluacion(null);
    }
}

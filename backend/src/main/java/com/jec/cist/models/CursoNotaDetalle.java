package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(name = "curso_nota_detalles")
public class CursoNotaDetalle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_detalle")
    private UUID idDetalle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_nota", nullable = false)
    private CursoNota nota;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_criterio", nullable = false)
    private EvaluacionCriterio criterio;

    @NotNull(message = "El puntaje asignado es obligatorio")
    @Min(value = 0, message = "El puntaje no puede ser negativo")
    @Column(name = "puntaje_asignado", nullable = false)
    private Integer puntajeAsignado;

    public CursoNotaDetalle() {}

    public CursoNotaDetalle(CursoNota nota, EvaluacionCriterio criterio, Integer puntajeAsignado) {
        this.nota = nota;
        this.criterio = criterio;
        this.puntajeAsignado = puntajeAsignado;
    }

    public UUID getIdDetalle() {
        return idDetalle;
    }

    public void setIdDetalle(UUID idDetalle) {
        this.idDetalle = idDetalle;
    }

    public CursoNota getNota() {
        return nota;
    }

    public void setNota(CursoNota nota) {
        this.nota = nota;
    }

    public EvaluacionCriterio getCriterio() {
        return criterio;
    }

    public void setCriterio(EvaluacionCriterio criterio) {
        this.criterio = criterio;
    }

    public Integer getPuntajeAsignado() {
        return puntajeAsignado;
    }

    public void setPuntajeAsignado(Integer puntajeAsignado) {
        this.puntajeAsignado = puntajeAsignado;
    }
}

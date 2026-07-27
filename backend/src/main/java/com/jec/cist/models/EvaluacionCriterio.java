package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(name = "evaluacion_criterios")
public class EvaluacionCriterio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_criterio")
    private UUID idCriterio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_evaluacion", nullable = false)
    private CursoEvaluacion evaluacion;

    @NotBlank(message = "El nombre del criterio es obligatorio")
    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @NotNull(message = "El puntaje máximo es obligatorio")
    @Min(value = 1, message = "El puntaje debe ser mayor a 0")
    @Column(name = "puntaje_maximo", nullable = false)
    private Integer puntajeMaximo;

    public EvaluacionCriterio() {}

    public EvaluacionCriterio(CursoEvaluacion evaluacion, String nombre, Integer puntajeMaximo) {
        this.evaluacion = evaluacion;
        this.nombre = nombre;
        this.puntajeMaximo = puntajeMaximo;
    }

    public UUID getIdCriterio() {
        return idCriterio;
    }

    public void setIdCriterio(UUID idCriterio) {
        this.idCriterio = idCriterio;
    }

    public CursoEvaluacion getEvaluacion() {
        return evaluacion;
    }

    public void setEvaluacion(CursoEvaluacion evaluacion) {
        this.evaluacion = evaluacion;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Integer getPuntajeMaximo() {
        return puntajeMaximo;
    }

    public void setPuntajeMaximo(Integer puntajeMaximo) {
        this.puntajeMaximo = puntajeMaximo;
    }
}

package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "aulas_aip")
public class AulaAip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_aula")
    private Integer idAula;

    @NotBlank(message = "El nombre del aula es obligatorio")
    @Size(max = 50, message = "El nombre del aula no puede exceder los 50 caracteres")
    @Column(name = "nombre_aula", unique = true, nullable = false, length = 50)
    private String nombreAula;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_red", nullable = false)
    private EstadoRed estadoRed = EstadoRed.ONLINE;

    // Constructores, Getters y Setters
    public AulaAip() {}

    public AulaAip(String nombreAula, EstadoRed estadoRed) {
        this.nombreAula = nombreAula;
        this.estadoRed = estadoRed;
    }

    public Integer getIdAula() {
        return idAula;
    }

    public void setIdAula(Integer idAula) {
        this.idAula = idAula;
    }

    public String getNombreAula() {
        return nombreAula;
    }

    public void setNombreAula(String nombreAula) {
        this.nombreAula = nombreAula;
    }

    public EstadoRed getEstadoRed() {
        return estadoRed;
    }

    public void setEstadoRed(EstadoRed estadoRed) {
        this.estadoRed = estadoRed;
    }
}

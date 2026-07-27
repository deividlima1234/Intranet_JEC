package com.jec.cist.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.UUID;

@Entity
@Table(name = "estudiante_progreso_juego")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class EstudianteProgresoJuego {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_progreso")
    private UUID idProgreso;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_estudiante", referencedColumnName = "id_usuario", nullable = false, unique = true)
    @JsonIgnore
    private Usuario estudiante;

    @Column(name = "nivel_unijugador", nullable = false)
    private Integer nivelUnijugador = 1;

    @Column(name = "xp_unijugador", nullable = false)
    private Integer xpUnijugador = 0;

    @Column(name = "nivel_multijugador", nullable = false)
    private Integer nivelMultijugador = 1;

    @Column(name = "xp_multijugador", nullable = false)
    private Integer xpMultijugador = 0;

    @Column(name = "juegos_jugados", nullable = false)
    private Integer juegosJugados = 0;

    @Column(name = "juegos_ganados", nullable = false)
    private Integer juegosGanados = 0;

    @Column(name = "preguntas_respondidas", nullable = false)
    private Integer preguntasRespondidas = 0;

    @Column(name = "preguntas_correctas", nullable = false)
    private Integer preguntasCorrectas = 0;

    public EstudianteProgresoJuego() {}

    public EstudianteProgresoJuego(Usuario estudiante) {
        this.estudiante = estudiante;
        this.nivelUnijugador = 1;
        this.xpUnijugador = 0;
        this.nivelMultijugador = 1;
        this.xpMultijugador = 0;
        this.juegosJugados = 0;
        this.juegosGanados = 0;
        this.preguntasRespondidas = 0;
        this.preguntasCorrectas = 0;
    }

    public UUID getIdProgreso() {
        return idProgreso;
    }

    public void setIdProgreso(UUID idProgreso) {
        this.idProgreso = idProgreso;
    }

    public Usuario getEstudiante() {
        return estudiante;
    }

    public void setEstudiante(Usuario estudiante) {
        this.estudiante = estudiante;
    }

    public Integer getNivelUnijugador() {
        return nivelUnijugador;
    }

    public void setNivelUnijugador(Integer nivelUnijugador) {
        this.nivelUnijugador = nivelUnijugador;
    }

    public Integer getXpUnijugador() {
        return xpUnijugador;
    }

    public void setXpUnijugador(Integer xpUnijugador) {
        this.xpUnijugador = xpUnijugador;
    }

    public Integer getNivelMultijugador() {
        return nivelMultijugador;
    }

    public void setNivelMultijugador(Integer nivelMultijugador) {
        this.nivelMultijugador = nivelMultijugador;
    }

    public Integer getXpMultijugador() {
        return xpMultijugador;
    }

    public void setXpMultijugador(Integer xpMultijugador) {
        this.xpMultijugador = xpMultijugador;
    }

    public Integer getJuegosJugados() {
        return juegosJugados;
    }

    public void setJuegosJugados(Integer juegosJugados) {
        this.juegosJugados = juegosJugados;
    }

    public Integer getJuegosGanados() {
        return juegosGanados;
    }

    public void setJuegosGanados(Integer juegosGanados) {
        this.juegosGanados = juegosGanados;
    }

    public Integer getPreguntasRespondidas() {
        return preguntasRespondidas;
    }

    public void setPreguntasRespondidas(Integer preguntasRespondidas) {
        this.preguntasRespondidas = preguntasRespondidas;
    }

    public Integer getPreguntasCorrectas() {
        return preguntasCorrectas;
    }

    public void setPreguntasCorrectas(Integer preguntasCorrectas) {
        this.preguntasCorrectas = preguntasCorrectas;
    }
}

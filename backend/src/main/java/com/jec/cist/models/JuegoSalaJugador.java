package com.jec.cist.models;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "juego_sala_jugadores")
public class JuegoSalaJugador {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_sala_jugador")
    private UUID idSalaJugador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_sala", nullable = false)
    private JuegoSala sala;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_jugador", referencedColumnName = "id_usuario", nullable = false)
    private Usuario jugador;

    @Column(name = "color", length = 20)
    private String color; // ROJO, VERDE, AMARILLO, AZUL

    @Column(name = "posiciones_tokens", columnDefinition = "TEXT")
    private String posicionesTokens = "[0,0,0,0]"; // JSON format for the 4 tokens

    @Column(name = "es_listo", nullable = false)
    private Boolean esListo = false;

    @Column(name = "orden_turno", nullable = false)
    private Integer ordenTurno = 0;

    public JuegoSalaJugador() {}

    public JuegoSalaJugador(JuegoSala sala, Usuario jugador, String color, Integer ordenTurno) {
        this.sala = sala;
        this.jugador = jugador;
        this.color = color;
        this.ordenTurno = ordenTurno;
        this.posicionesTokens = "[0,0,0,0]";
        this.esListo = false;
    }

    public UUID getIdSalaJugador() {
        return idSalaJugador;
    }

    public void setIdSalaJugador(UUID idSalaJugador) {
        this.idSalaJugador = idSalaJugador;
    }

    public JuegoSala getSala() {
        return sala;
    }

    public void setSala(JuegoSala sala) {
        this.sala = sala;
    }

    public Usuario getJugador() {
        return jugador;
    }

    public void setJugador(Usuario jugador) {
        this.jugador = jugador;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getPosicionesTokens() {
        return posicionesTokens;
    }

    public void setPosicionesTokens(String posicionesTokens) {
        this.posicionesTokens = posicionesTokens;
    }

    public Boolean getEsListo() {
        return esListo;
    }

    public void setEsListo(Boolean esListo) {
        this.esListo = esListo;
    }

    public Integer getOrdenTurno() {
        return ordenTurno;
    }

    public void setOrdenTurno(Integer ordenTurno) {
        this.ordenTurno = ordenTurno;
    }
}

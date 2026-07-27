package com.jec.cist.models;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "juego_salas")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class JuegoSala {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_sala")
    private UUID idSala;

    @Column(name = "codigo_sala", nullable = false, unique = true, length = 50)
    private String codigoSala;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_creador", referencedColumnName = "id_usuario", nullable = false)
    @JsonIgnore
    private Usuario creador;

    @Column(name = "tipo_juego", nullable = false, length = 50)
    private String tipoJuego = "LUDO"; // default Ludo

    @Column(name = "area", length = 100)
    private String area; // e.g. MATEMATICA

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cuestionario", referencedColumnName = "id_cuestionario", nullable = true)
    @JsonIgnore
    private CuestionarioPersonalizado cuestionario;

    @Column(name = "grado")
    private Integer grado;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "ESPERANDO"; // ESPERANDO, EN_PROGRESO, FINALIZADO

    @Column(name = "max_jugadores", nullable = false)
    private Integer maxJugadores = 4;

    @Column(name = "dado_ultimo_valor")
    private Integer dadoUltimoValor;

    @Column(name = "turno_jugador_id")
    private UUID turnoJugadorId; // ID del jugador actual

    @Column(name = "pregunta_activa_id")
    private UUID preguntaActivaId; // Si hay un reto en curso

    @Column(name = "pregunta_respondida")
    private Boolean preguntaRespondida = false;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public JuegoSala() {}

    public JuegoSala(String codigoSala, Usuario creador, String tipoJuego, String area, CuestionarioPersonalizado cuestionario, Integer grado, Integer maxJugadores) {
        this.codigoSala = codigoSala;
        this.creador = creador;
        this.tipoJuego = tipoJuego;
        this.area = area;
        this.cuestionario = cuestionario;
        this.grado = grado;
        this.maxJugadores = maxJugadores;
        this.estado = "ESPERANDO";
        this.fechaCreacion = LocalDateTime.now();
    }

    public UUID getIdSala() {
        return idSala;
    }

    public void setIdSala(UUID idSala) {
        this.idSala = idSala;
    }

    public String getCodigoSala() {
        return codigoSala;
    }

    public void setCodigoSala(String codigoSala) {
        this.codigoSala = codigoSala;
    }

    public Usuario getCreador() {
        return creador;
    }

    public void setCreador(Usuario creador) {
        this.creador = creador;
    }

    public String getTipoJuego() {
        return tipoJuego;
    }

    public void setTipoJuego(String tipoJuego) {
        this.tipoJuego = tipoJuego;
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public CuestionarioPersonalizado getCuestionario() {
        return cuestionario;
    }

    public void setCuestionario(CuestionarioPersonalizado cuestionario) {
        this.cuestionario = cuestionario;
    }

    public Integer getGrado() {
        return grado;
    }

    public void setGrado(Integer grado) {
        this.grado = grado;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public Integer getMaxJugadores() {
        return maxJugadores;
    }

    public void setMaxJugadores(Integer maxJugadores) {
        this.maxJugadores = maxJugadores;
    }

    public Integer getDadoUltimoValor() {
        return dadoUltimoValor;
    }

    public void setDadoUltimoValor(Integer dadoUltimoValor) {
        this.dadoUltimoValor = dadoUltimoValor;
    }

    public UUID getTurnoJugadorId() {
        return turnoJugadorId;
    }

    public void setTurnoJugadorId(UUID turnoJugadorId) {
        this.turnoJugadorId = turnoJugadorId;
    }

    public UUID getPreguntaActivaId() {
        return preguntaActivaId;
    }

    public void setPreguntaActivaId(UUID preguntaActivaId) {
        this.preguntaActivaId = preguntaActivaId;
    }

    public Boolean getPreguntaRespondida() {
        return preguntaRespondida;
    }

    public void setPreguntaRespondida(Boolean preguntaRespondida) {
        this.preguntaRespondida = preguntaRespondida;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}

package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(name = "juego_preguntas")
public class PreguntaJuego {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_pregunta")
    private UUID idPregunta;

    @NotBlank(message = "El enunciado es obligatorio")
    @Column(name = "enunciado", columnDefinition = "TEXT", nullable = false)
    private String enunciado;

    @NotBlank(message = "La opción A es obligatoria")
    @Column(name = "opcion_a", nullable = false, length = 255)
    private String opcionA;

    @NotBlank(message = "La opción B es obligatoria")
    @Column(name = "opcion_b", nullable = false, length = 255)
    private String opcionB;

    @NotBlank(message = "La opción C es obligatoria")
    @Column(name = "opcion_c", nullable = false, length = 255)
    private String opcionC;

    @NotBlank(message = "La opción D es obligatoria")
    @Column(name = "opcion_d", nullable = false, length = 255)
    private String opcionD;

    @NotNull(message = "La respuesta correcta es obligatoria")
    @Column(name = "respuesta_correcta", nullable = false)
    private Character respuestaCorrecta; // 'A', 'B', 'C', 'D'

    @Column(name = "area", length = 100)
    private String area; // e.g. MATEMATICA, COMUNICACION

    @Column(name = "grado")
    private Integer grado; // 1-5

    @Column(name = "dificultad", length = 20)
    private String dificultad = "MEDIO"; // FACIL, MEDIO, DIFICIL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cuestionario", referencedColumnName = "id_cuestionario", nullable = true)
    private CuestionarioPersonalizado cuestionario;

    public PreguntaJuego() {}

    public PreguntaJuego(String enunciado, String opcionA, String opcionB, String opcionC, String opcionD, Character respuestaCorrecta, String area, Integer grado, String dificultad, CuestionarioPersonalizado cuestionario) {
        this.enunciado = enunciado;
        this.opcionA = opcionA;
        this.opcionB = opcionB;
        this.opcionC = opcionC;
        this.opcionD = opcionD;
        this.respuestaCorrecta = Character.toUpperCase(respuestaCorrecta);
        this.area = area;
        this.grado = grado;
        this.dificultad = dificultad;
        this.cuestionario = cuestionario;
    }

    public UUID getIdPregunta() {
        return idPregunta;
    }

    public void setIdPregunta(UUID idPregunta) {
        this.idPregunta = idPregunta;
    }

    public String getEnunciado() {
        return enunciado;
    }

    public void setEnunciado(String enunciado) {
        this.enunciado = enunciado;
    }

    public String getOpcionA() {
        return opcionA;
    }

    public void setOpcionA(String opcionA) {
        this.opcionA = opcionA;
    }

    public String getOpcionB() {
        return opcionB;
    }

    public void setOpcionB(String opcionB) {
        this.opcionB = opcionB;
    }

    public String getOpcionC() {
        return opcionC;
    }

    public void setOpcionC(String opcionC) {
        this.opcionC = opcionC;
    }

    public String getOpcionD() {
        return opcionD;
    }

    public void setOpcionD(String opcionD) {
        this.opcionD = opcionD;
    }

    public Character getRespuestaCorrecta() {
        return respuestaCorrecta;
    }

    public void setRespuestaCorrecta(Character respuestaCorrecta) {
        this.respuestaCorrecta = Character.toUpperCase(respuestaCorrecta);
    }

    public String getArea() {
        return area;
    }

    public void setArea(String area) {
        this.area = area;
    }

    public Integer getGrado() {
        return grado;
    }

    public void setGrado(Integer grado) {
        this.grado = grado;
    }

    public String getDificultad() {
        return dificultad;
    }

    public void setDificultad(String dificultad) {
        this.dificultad = dificultad;
    }

    public CuestionarioPersonalizado getCuestionario() {
        return cuestionario;
    }

    public void setCuestionario(CuestionarioPersonalizado cuestionario) {
        this.cuestionario = cuestionario;
    }
}

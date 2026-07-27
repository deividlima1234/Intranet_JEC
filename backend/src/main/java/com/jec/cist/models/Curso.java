package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Entity
@Table(name = "cursos")
public class Curso {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_curso")
    private UUID idCurso;

    @NotBlank(message = "El NRC es obligatorio")
    @Column(name = "nrc", unique = true, nullable = false, length = 50)
    private String nrc;

    @NotBlank(message = "El nombre del curso es obligatorio")
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotNull(message = "El grado es obligatorio")
    @Column(name = "grado", nullable = false)
    private Short grado;

    @NotBlank(message = "La sección es obligatoria")
    @Column(name = "seccion", nullable = false, length = 50)
    private String seccion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_docente", referencedColumnName = "id_usuario", nullable = false)
    private PersonalInstitucional docente;

    public Curso() {}

    public Curso(String nrc, String nombre, Short grado, String seccion, PersonalInstitucional docente) {
        this.nrc = nrc;
        this.nombre = nombre;
        this.grado = grado;
        this.seccion = seccion;
        this.docente = docente;
    }

    public UUID getIdCurso() {
        return idCurso;
    }

    public void setIdCurso(UUID idCurso) {
        this.idCurso = idCurso;
    }

    public String getNrc() {
        return nrc;
    }

    public void setNrc(String nrc) {
        this.nrc = nrc;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Short getGrado() {
        return grado;
    }

    public void setGrado(Short grado) {
        this.grado = grado;
    }

    public String getSeccion() {
        return seccion;
    }

    public void setSeccion(String seccion) {
        this.seccion = seccion;
    }

    public PersonalInstitucional getDocente() {
        return docente;
    }

    public void setDocente(PersonalInstitucional docente) {
        this.docente = docente;
    }
}

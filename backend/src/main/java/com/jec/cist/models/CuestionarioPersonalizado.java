package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "juego_cuestionarios")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CuestionarioPersonalizado {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_cuestionario")
    private UUID idCuestionario;

    @NotBlank(message = "El título es obligatorio")
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_creador", referencedColumnName = "id_usuario", nullable = false)
    @JsonIgnore
    private Usuario creador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_curso", referencedColumnName = "id_curso", nullable = true)
    @JsonIgnore
    private Curso curso;

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    public CuestionarioPersonalizado() {}

    public CuestionarioPersonalizado(String titulo, String descripcion, Usuario creador, Curso curso) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.creador = creador;
        this.curso = curso;
        this.fechaCreacion = LocalDateTime.now();
    }

    public UUID getIdCuestionario() {
        return idCuestionario;
    }

    public void setIdCuestionario(UUID idCuestionario) {
        this.idCuestionario = idCuestionario;
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

    public Usuario getCreador() {
        return creador;
    }

    public void setCreador(Usuario creador) {
        this.creador = creador;
    }

    public Curso getCurso() {
        return curso;
    }

    public void setCurso(Curso curso) {
        this.curso = curso;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
}

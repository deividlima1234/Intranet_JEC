package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "incidencias")
public class Incidencia {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_incidencia")
    private UUID idIncidencia;

    @NotBlank(message = "El título es obligatorio")
    @Column(name = "titulo", nullable = false, length = 150)
    private String titulo;

    @NotBlank(message = "La descripción es obligatoria")
    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @NotBlank(message = "El tipo de reporte es obligatorio")
    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo; // e.g. "INCIDENCIA", "SUGERENCIA"

    @NotBlank(message = "El estado es obligatorio")
    @Column(name = "estado", nullable = false, length = 50)
    private String estado = "PENDIENTE"; // "PENDIENTE", "EN_PROCESO", "RESUELTO"

    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_autor", referencedColumnName = "id_usuario", nullable = false)
    private Usuario autor;

    @Column(name = "respuesta_soporte", columnDefinition = "TEXT")
    private String respuestaSoporte;

    @Column(name = "fecha_respuesta")
    private LocalDateTime fechaRespuesta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_atendido_por", referencedColumnName = "id_usuario")
    private Usuario atendidoPor;

    public Incidencia() {}

    public Incidencia(String titulo, String descripcion, String tipo, Usuario autor) {
        this.titulo = titulo;
        this.descripcion = descripcion;
        this.tipo = tipo;
        this.autor = autor;
        this.estado = "PENDIENTE";
        this.fechaCreacion = LocalDateTime.now();
    }

    public UUID getIdIncidencia() {
        return idIncidencia;
    }

    public void setIdIncidencia(UUID idIncidencia) {
        this.idIncidencia = idIncidencia;
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

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public Usuario getAutor() {
        return autor;
    }

    public void setAutor(Usuario autor) {
        this.autor = autor;
    }

    public String getRespuestaSoporte() {
        return respuestaSoporte;
    }

    public void setRespuestaSoporte(String respuestaSoporte) {
        this.respuestaSoporte = respuestaSoporte;
    }

    public LocalDateTime getFechaRespuesta() {
        return fechaRespuesta;
    }

    public void setFechaRespuesta(LocalDateTime fechaRespuesta) {
        this.fechaRespuesta = fechaRespuesta;
    }

    public Usuario getAtendidoPor() {
        return atendidoPor;
    }

    public void setAtendidoPor(Usuario atendidoPor) {
        this.atendidoPor = atendidoPor;
    }
}

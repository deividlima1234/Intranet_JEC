package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.UUID;

@Entity
@Table(name = "estudiantes")
public class Estudiante {

    @Id
    @Column(name = "id_usuario")
    private UUID idUsuario;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @NotNull(message = "El grado es obligatorio")
    @Min(value = 1, message = "El grado debe ser entre 1 y 5")
    @Max(value = 5, message = "El grado debe ser entre 1 y 5")
    @Column(name = "grado", nullable = false)
    private Short grado;

    @NotBlank(message = "La sección es obligatoria")
    @Size(min = 1, max = 50, message = "La sección no puede exceder los 50 caracteres")
    @Column(name = "seccion", nullable = false, length = 50)
    private String seccion;

    @NotNull(message = "El número de orden es obligatorio")
    @Min(value = 1, message = "El número de orden debe ser mayor a 0")
    @Column(name = "numero_orden", nullable = false)
    private Short numeroOrden;

    // Constructores, Getters y Setters
    public Estudiante() {}

    public Estudiante(Usuario usuario, Short grado, String seccion, Short numeroOrden) {
        this.usuario = usuario;
        this.grado = grado;
        this.seccion = seccion;
        this.numeroOrden = numeroOrden;
    }

    public UUID getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(UUID idUsuario) {
        this.idUsuario = idUsuario;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
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

    public Short getNumeroOrden() {
        return numeroOrden;
    }

    public void setNumeroOrden(Short numeroOrden) {
        this.numeroOrden = numeroOrden;
    }
}

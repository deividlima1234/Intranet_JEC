package com.jec.cist.dtos;

import com.jec.cist.models.Rol;
import java.util.UUID;

public class UsuarioRespuestaDto {
    private UUID idUsuario;
    private String dni;
    private String nombres;
    private String apellidos;
    private Rol rol;
    private String qrToken;
    private String estado;

    // Campos de estudiante
    private Short grado;
    private String seccion;
    private Short numeroOrden;

    // Campos de personal
    private String cargo;
    private String areaCurricular;

    // Getters y Setters
    public UUID getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(UUID idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getDni() {
        return dni;
    }

    public void setDni(String dni) {
        this.dni = dni;
    }

    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }

    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }

    public String getQrToken() {
        return qrToken;
    }

    public void setQrToken(String qrToken) {
        this.qrToken = qrToken;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
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

    public String getCargo() {
        return cargo;
    }

    public void setCargo(String cargo) {
        this.cargo = cargo;
    }

    public String getAreaCurricular() {
        return areaCurricular;
    }

    public void setAreaCurricular(String areaCurricular) {
        this.areaCurricular = areaCurricular;
    }
}

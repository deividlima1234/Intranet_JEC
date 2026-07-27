package com.jec.cist.dtos;

import com.jec.cist.models.Rol;
import jakarta.validation.constraints.*;

public class UsuarioRegistroDto {

    @NotBlank(message = "El DNI es obligatorio")
    @Size(min = 8, max = 8, message = "El DNI debe tener exactamente 8 caracteres")
    private String dni;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String nombres;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Size(max = 100, message = "Los apellidos no pueden exceder los 100 caracteres")
    private String apellidos;

    @NotNull(message = "El rol es obligatorio")
    private Rol rol;

    // Perfil Estudiante (opcional, solo si rol es ESTUDIANTE)
    private Short grado;
    private String seccion;
    private Short numeroOrden;

    // Perfil Personal (opcional, si rol es DOCENTE, ADMINISTRATIVO, CIST)
    private String cargo;
    private String areaCurricular;

    // Getters y Setters
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

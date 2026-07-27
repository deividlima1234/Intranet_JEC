package com.jec.cist.dtos;

import java.util.UUID;

public class ContactoDto {
    private UUID idUsuario;
    private String nombres;
    private String apellidos;
    private String rol;
    private int mensajesNoLeidos;

    public ContactoDto() {}

    public ContactoDto(UUID idUsuario, String nombres, String apellidos, String rol, int mensajesNoLeidos) {
        this.idUsuario = idUsuario;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.rol = rol;
        this.mensajesNoLeidos = mensajesNoLeidos;
    }

    public UUID getIdUsuario() { return idUsuario; }
    public void setIdUsuario(UUID idUsuario) { this.idUsuario = idUsuario; }
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    public String getRol() { return rol; }
    public void setRol(String rol) { this.rol = rol; }
    public int getMensajesNoLeidos() { return mensajesNoLeidos; }
    public void setMensajesNoLeidos(int mensajesNoLeidos) { this.mensajesNoLeidos = mensajesNoLeidos; }
}

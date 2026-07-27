package com.jec.cist.dtos;

public class CredencialRespuestaDto {
    private UsuarioRespuestaDto usuario;
    private String qrBase64;

    public CredencialRespuestaDto() {}

    public CredencialRespuestaDto(UsuarioRespuestaDto usuario, String qrBase64) {
        this.usuario = usuario;
        this.qrBase64 = qrBase64;
    }

    public UsuarioRespuestaDto getUsuario() {
        return usuario;
    }

    public void setUsuario(UsuarioRespuestaDto usuario) {
        this.usuario = usuario;
    }

    public String getQrBase64() {
        return qrBase64;
    }

    public void setQrBase64(String qrBase64) {
        this.qrBase64 = qrBase64;
    }
}

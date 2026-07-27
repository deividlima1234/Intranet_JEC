package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;

public class EstudianteAvanceRevisionDto {
    
    @NotBlank(message = "El estado es obligatorio")
    private String estado;
    
    private String comentarioDocente;

    public EstudianteAvanceRevisionDto() {}

    public EstudianteAvanceRevisionDto(String estado, String comentarioDocente) {
        this.estado = estado;
        this.comentarioDocente = comentarioDocente;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getComentarioDocente() {
        return comentarioDocente;
    }

    public void setComentarioDocente(String comentarioDocente) {
        this.comentarioDocente = comentarioDocente;
    }
}

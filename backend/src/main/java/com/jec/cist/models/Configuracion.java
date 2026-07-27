package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "configuraciones")
public class Configuracion {

    @Id
    @NotBlank(message = "La clave es obligatoria")
    @Size(max = 100, message = "La clave no puede exceder los 100 caracteres")
    @Column(name = "clave", length = 100, nullable = false)
    private String clave;

    @NotBlank(message = "El valor es obligatorio")
    @Size(max = 500, message = "El valor no puede exceder los 500 caracteres")
    @Column(name = "valor", length = 500, nullable = false)
    private String valor;

    public Configuracion() {}

    public Configuracion(String clave, String valor) {
        this.clave = clave;
        this.valor = valor;
    }

    public String getClave() {
        return clave;
    }

    public void setClave(String clave) {
        this.clave = clave;
    }

    public String getValor() {
        return valor;
    }

    public void setValor(String valor) {
        this.valor = valor;
    }
}

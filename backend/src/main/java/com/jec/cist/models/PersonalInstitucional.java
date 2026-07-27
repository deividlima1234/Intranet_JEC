package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Entity
@Table(name = "personal_institucional")
public class PersonalInstitucional {

    @Id
    @Column(name = "id_usuario")
    private UUID idUsuario;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @NotBlank(message = "El cargo es obligatorio")
    @Size(max = 50, message = "El cargo no puede exceder los 50 caracteres")
    @Column(name = "cargo", nullable = false, length = 50)
    private String cargo;

    @Size(max = 100, message = "El área curricular no puede exceder los 100 caracteres")
    @Column(name = "area_curricular", length = 100)
    private String areaCurricular;

    // Constructores, Getters y Setters
    public PersonalInstitucional() {}

    public PersonalInstitucional(Usuario usuario, String cargo, String areaCurricular) {
        this.usuario = usuario;
        this.cargo = cargo;
        this.areaCurricular = areaCurricular;
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

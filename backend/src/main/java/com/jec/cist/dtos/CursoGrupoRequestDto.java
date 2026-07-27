package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import java.util.List;
import java.util.UUID;

public class CursoGrupoRequestDto {
    @NotBlank(message = "El nombre del grupo es obligatorio")
    private String nombre;

    private List<UUID> integrantesIds;

    public CursoGrupoRequestDto() {}

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public List<UUID> getIntegrantesIds() { return integrantesIds; }
    public void setIntegrantesIds(List<UUID> integrantesIds) { this.integrantesIds = integrantesIds; }
}

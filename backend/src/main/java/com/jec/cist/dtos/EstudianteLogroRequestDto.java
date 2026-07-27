package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class EstudianteLogroRequestDto {
    @NotNull(message = "El ID del estudiante es obligatorio")
    private UUID idEstudiante;

    @NotBlank(message = "La insignia es obligatoria")
    private String insignia;

    private String comentario;

    public EstudianteLogroRequestDto() {}

    public UUID getIdEstudiante() { return idEstudiante; }
    public void setIdEstudiante(UUID idEstudiante) { this.idEstudiante = idEstudiante; }

    public String getInsignia() { return insignia; }
    public void setInsignia(String insignia) { this.insignia = insignia; }

    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
}

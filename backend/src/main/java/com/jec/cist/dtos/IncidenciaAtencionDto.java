package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public class IncidenciaAtencionDto {

    @NotBlank(message = "El estado es obligatorio")
    private String estado;

    @NotBlank(message = "La respuesta de soporte es obligatoria")
    private String respuestaSoporte;

    @NotNull(message = "El ID del personal de atención es obligatorio")
    private UUID idAtendidoPor;

    public IncidenciaAtencionDto() {}

    public IncidenciaAtencionDto(String estado, String respuestaSoporte, UUID idAtendidoPor) {
        this.estado = estado;
        this.respuestaSoporte = respuestaSoporte;
        this.idAtendidoPor = idAtendidoPor;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getRespuestaSoporte() {
        return respuestaSoporte;
    }

    public void setRespuestaSoporte(String respuestaSoporte) {
        this.respuestaSoporte = respuestaSoporte;
    }

    public UUID getIdAtendidoPor() {
        return idAtendidoPor;
    }

    public void setIdAtendidoPor(UUID idAtendidoPor) {
        this.idAtendidoPor = idAtendidoPor;
    }
}

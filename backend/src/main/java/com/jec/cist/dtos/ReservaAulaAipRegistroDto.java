package com.jec.cist.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public class ReservaAulaAipRegistroDto {

    @NotNull(message = "El ID del aula es obligatorio")
    private Integer idAula;

    @NotNull(message = "El ID del docente/usuario es obligatorio")
    private UUID idDocente;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    @NotNull(message = "La hora de inicio es obligatoria")
    private LocalTime horaInicio;

    @NotNull(message = "La hora de fin es obligatoria")
    private LocalTime horaFin;

    @NotNull(message = "El grado es obligatorio")
    private Short grado;

    @NotBlank(message = "La sección es obligatoria")
    @Size(max = 50, message = "La sección no puede exceder los 50 caracteres")
    private String seccion;

    @Size(max = 255, message = "El motivo no puede exceder los 255 caracteres")
    private String motivo;

    public ReservaAulaAipRegistroDto() {}

    public ReservaAulaAipRegistroDto(Integer idAula, UUID idDocente, LocalDate fecha, LocalTime horaInicio, LocalTime horaFin, Short grado, String seccion, String motivo) {
        this.idAula = idAula;
        this.idDocente = idDocente;
        this.fecha = fecha;
        this.horaInicio = horaInicio;
        this.horaFin = horaFin;
        this.grado = grado;
        this.seccion = seccion;
        this.motivo = motivo;
    }

    public Integer getIdAula() {
        return idAula;
    }

    public void setIdAula(Integer idAula) {
        this.idAula = idAula;
    }

    public UUID getIdDocente() {
        return idDocente;
    }

    public void setIdDocente(UUID idDocente) {
        this.idDocente = idDocente;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public LocalTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalTime horaFin) {
        this.horaFin = horaFin;
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

    public String getMotivo() {
        return motivo;
    }

    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
}

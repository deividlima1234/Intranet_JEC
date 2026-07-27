package com.jec.cist.dtos;

import com.jec.cist.models.EstadoFisico;
import com.jec.cist.models.TipoEquipo;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class EquipoAltaDto {

    @NotNull(message = "El aula base es obligatoria")
    private Integer idAulaBase;

    @NotBlank(message = "El código patrimonial es obligatorio")
    @Size(max = 50, message = "El código patrimonial no puede exceder los 50 caracteres")
    private String codPatrimonial;

    @NotNull(message = "El tipo de equipo es obligatorio")
    private TipoEquipo tipoEquipo;

    @NotBlank(message = "El QR del equipo es obligatorio")
    @Size(max = 255, message = "El QR del equipo no puede exceder los 255 caracteres")
    private String qrEquipo;

    @Size(max = 100, message = "El número de serie no puede exceder los 100 caracteres")
    private String numSerie;

    @Size(max = 255, message = "El QR del cargador no puede exceder los 255 caracteres")
    private String qrCargador;

    @Size(max = 100, message = "El número de serie del cargador no puede exceder los 100 caracteres")
    private String numSerieCargador;

    @Size(max = 100, message = "La marca no puede exceder los 100 caracteres")
    private String marca;

    @Size(max = 255, message = "La descripción no puede exceder los 255 caracteres")
    private String descripcion;

    private EstadoFisico estadoFisico = EstadoFisico.OPERATIVO;

    // Getters y Setters
    public Integer getIdAulaBase() {
        return idAulaBase;
    }

    public void setIdAulaBase(Integer idAulaBase) {
        this.idAulaBase = idAulaBase;
    }

    public String getCodPatrimonial() {
        return codPatrimonial;
    }

    public void setCodPatrimonial(String codPatrimonial) {
        this.codPatrimonial = codPatrimonial;
    }

    public TipoEquipo getTipoEquipo() {
        return tipoEquipo;
    }

    public void setTipoEquipo(TipoEquipo tipoEquipo) {
        this.tipoEquipo = tipoEquipo;
    }

    public String getQrEquipo() {
        return qrEquipo;
    }

    public void setQrEquipo(String qrEquipo) {
        this.qrEquipo = qrEquipo;
    }

    public String getNumSerie() {
        return numSerie;
    }

    public void setNumSerie(String numSerie) {
        this.numSerie = numSerie;
    }

    public String getQrCargador() {
        return qrCargador;
    }

    public void setQrCargador(String qrCargador) {
        this.qrCargador = qrCargador;
    }

    public String getNumSerieCargador() {
        return numSerieCargador;
    }

    public void setNumSerieCargador(String numSerieCargador) {
        this.numSerieCargador = numSerieCargador;
    }

    public String getMarca() {
        return marca;
    }

    public void setMarca(String marca) {
        this.marca = marca;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public EstadoFisico getEstadoFisico() {
        return estadoFisico;
    }

    public void setEstadoFisico(EstadoFisico estadoFisico) {
        this.estadoFisico = estadoFisico;
    }
}

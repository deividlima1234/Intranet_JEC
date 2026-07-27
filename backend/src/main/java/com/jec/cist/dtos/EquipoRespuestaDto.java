package com.jec.cist.dtos;

import com.jec.cist.models.EstadoFisico;
import com.jec.cist.models.TipoEquipo;
import com.jec.cist.models.UbicacionEquipo;
import java.util.UUID;

public class EquipoRespuestaDto {
    private UUID idEquipo;
    private Integer idAulaBase;
    private String aulaNombre;
    private String codPatrimonial;
    private TipoEquipo tipoEquipo;
    private String qrEquipo;
    private String numSerie;
    private String qrCargador;
    private String numSerieCargador;
    private String marca;
    private String descripcion;
    private EstadoFisico estadoFisico;
    private UbicacionEquipo ubicacionActual;

    // Getters y Setters
    public UUID getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(UUID idEquipo) {
        this.idEquipo = idEquipo;
    }

    public Integer getIdAulaBase() {
        return idAulaBase;
    }

    public void setIdAulaBase(Integer idAulaBase) {
        this.idAulaBase = idAulaBase;
    }

    public String getAulaNombre() {
        return aulaNombre;
    }

    public void setAulaNombre(String aulaNombre) {
        this.aulaNombre = aulaNombre;
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

    public EstadoFisico getEstadoFisico() {
        return estadoFisico;
    }

    public void setEstadoFisico(EstadoFisico estadoFisico) {
        this.estadoFisico = estadoFisico;
    }

    public UbicacionEquipo getUbicacionActual() {
        return ubicacionActual;
    }

    public void setUbicacionActual(UbicacionEquipo ubicacionActual) {
        this.ubicacionActual = ubicacionActual;
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
}

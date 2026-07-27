package com.jec.cist.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

@Entity
@Table(name = "equipos_aip")
public class EquipoAip {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id_equipo")
    private UUID idEquipo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_aula_base", nullable = false)
    private AulaAip aulaBase;

    @NotBlank(message = "El código patrimonial es obligatorio")
    @Size(max = 50, message = "El código patrimonial no puede exceder los 50 caracteres")
    @Column(name = "cod_patrimonial", unique = true, nullable = false, length = 50)
    private String codPatrimonial;

    @NotNull(message = "El tipo de equipo es obligatorio")
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_equipo", nullable = false)
    private TipoEquipo tipoEquipo;

    @NotBlank(message = "El QR del equipo es obligatorio")
    @Size(max = 255, message = "El QR del equipo no puede exceder los 255 caracteres")
    @Column(name = "qr_equipo", unique = true, nullable = false, length = 255)
    private String qrEquipo;

    @Size(max = 100, message = "El número de serie no puede exceder los 100 caracteres")
    @Column(name = "num_serie", unique = true, length = 100)
    private String numSerie;

    @Size(max = 255, message = "El QR del cargador no puede exceder los 255 caracteres")
    @Column(name = "qr_cargador", unique = true, length = 255)
    private String qrCargador;

    @Size(max = 100, message = "El número de serie del cargador no puede exceder los 100 caracteres")
    @Column(name = "num_serie_cargador", unique = true, length = 100)
    private String numSerieCargador;

    @Size(max = 100, message = "La marca no puede exceder los 100 caracteres")
    @Column(name = "marca", length = 100)
    private String marca;

    @Size(max = 255, message = "La descripción no puede exceder los 255 caracteres")
    @Column(name = "descripcion", length = 255)
    private String descripcion;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "estado_fisico", nullable = false)
    private EstadoFisico estadoFisico = EstadoFisico.OPERATIVO;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "ubicacion_actual", nullable = false)
    private UbicacionEquipo ubicacionActual = UbicacionEquipo.EN_AIP;

    // Constructores, Getters y Setters
    public EquipoAip() {}

    public EquipoAip(AulaAip aulaBase, String codPatrimonial, TipoEquipo tipoEquipo, String qrEquipo) {
        this.aulaBase = aulaBase;
        this.codPatrimonial = codPatrimonial;
        this.tipoEquipo = tipoEquipo;
        this.qrEquipo = qrEquipo;
        this.estadoFisico = EstadoFisico.OPERATIVO;
        this.ubicacionActual = UbicacionEquipo.EN_AIP;
    }

    public EquipoAip(AulaAip aulaBase, String codPatrimonial, TipoEquipo tipoEquipo, String qrEquipo, String numSerie) {
        this(aulaBase, codPatrimonial, tipoEquipo, qrEquipo);
        this.numSerie = numSerie;
    }

    public EquipoAip(AulaAip aulaBase, String codPatrimonial, TipoEquipo tipoEquipo, String qrEquipo, String numSerie, String qrCargador, String numSerieCargador) {
        this(aulaBase, codPatrimonial, tipoEquipo, qrEquipo, numSerie);
        this.qrCargador = qrCargador;
        this.numSerieCargador = numSerieCargador;
    }

    public UUID getIdEquipo() {
        return idEquipo;
    }

    public void setIdEquipo(UUID idEquipo) {
        this.idEquipo = idEquipo;
    }

    public AulaAip getAulaBase() {
        return aulaBase;
    }

    public void setAulaBase(AulaAip aulaBase) {
        this.aulaBase = aulaBase;
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

    public UbicacionEquipo getUbicacionActual() {
        return ubicacionActual;
    }

    public void setUbicacionActual(UbicacionEquipo ubicacionActual) {
        this.ubicacionActual = ubicacionActual;
    }
}

package com.jec.cist.dtos;

import com.jec.cist.models.TipoOperacion;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class SesionRespuestaDto {
    private UUID idSesion;
    private String docenteNombre;
    private String aulaNombre;
    private TipoOperacion tipoOperacion;
    private String gradoSeccion;
    private String descripcion;
    private String firmaInicio;
    private String firmaFin;
    private LocalDateTime horaInicio;
    private LocalDateTime horaFin;
    private List<SesionDetalleRespuestaDto> detalles;

    // Getters y Setters
    public UUID getIdSesion() {
        return idSesion;
    }

    public void setIdSesion(UUID idSesion) {
        this.idSesion = idSesion;
    }

    public String getDocenteNombre() {
        return docenteNombre;
    }

    public void setDocenteNombre(String docenteNombre) {
        this.docenteNombre = docenteNombre;
    }

    public String getAulaNombre() {
        return aulaNombre;
    }

    public void setAulaNombre(String aulaNombre) {
        this.aulaNombre = aulaNombre;
    }

    public TipoOperacion getTipoOperacion() {
        return tipoOperacion;
    }

    public void setTipoOperacion(TipoOperacion tipoOperacion) {
        this.tipoOperacion = tipoOperacion;
    }

    public String getGradoSeccion() {
        return gradoSeccion;
    }

    public void setGradoSeccion(String gradoSeccion) {
        this.gradoSeccion = gradoSeccion;
    }

    public LocalDateTime getHoraInicio() {
        return horaInicio;
    }

    public void setHoraInicio(LocalDateTime horaInicio) {
        this.horaInicio = horaInicio;
    }

    public LocalDateTime getHoraFin() {
        return horaFin;
    }

    public void setHoraFin(LocalDateTime horaFin) {
        this.horaFin = horaFin;
    }

    public List<SesionDetalleRespuestaDto> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<SesionDetalleRespuestaDto> detalles) {
        this.detalles = detalles;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getFirmaInicio() {
        return firmaInicio;
    }

    public void setFirmaInicio(String firmaInicio) {
        this.firmaInicio = firmaInicio;
    }

    public String getFirmaFin() {
        return firmaFin;
    }

    public void setFirmaFin(String firmaFin) {
        this.firmaFin = firmaFin;
    }

    // Sub-DTO para el detalle
    public static class SesionDetalleRespuestaDto {
        private UUID idDetalle;
        private String codPatrimonial;
        private String tipoEquipo;
        private String estudianteNombre;
        private Integer numeroOrden;
        private String incidencias;
        private String numSerie;
        private String qrEquipo;

        // Getters y Setters
        public UUID getIdDetalle() {
            return idDetalle;
        }

        public void setIdDetalle(UUID idDetalle) {
            this.idDetalle = idDetalle;
        }

        public String getCodPatrimonial() {
            return codPatrimonial;
        }

        public void setCodPatrimonial(String codPatrimonial) {
            this.codPatrimonial = codPatrimonial;
        }

        public String getTipoEquipo() {
            return tipoEquipo;
        }

        public void setTipoEquipo(String tipoEquipo) {
            this.tipoEquipo = tipoEquipo;
        }

        public String getEstudianteNombre() {
            return estudianteNombre;
        }

        public void setEstudianteNombre(String estudianteNombre) {
            this.estudianteNombre = estudianteNombre;
        }

        public Integer getNumeroOrden() {
            return numeroOrden;
        }

        public void setNumeroOrden(Integer numeroOrden) {
            this.numeroOrden = numeroOrden;
        }

        public String getIncidencias() {
            return incidencias;
        }

        public void setIncidencias(String incidencias) {
            this.incidencias = incidencias;
        }

        public String getNumSerie() {
            return numSerie;
        }

        public void setNumSerie(String numSerie) {
            this.numSerie = numSerie;
        }

        public String getQrEquipo() {
            return qrEquipo;
        }

        public void setQrEquipo(String qrEquipo) {
            this.qrEquipo = qrEquipo;
        }
    }
}

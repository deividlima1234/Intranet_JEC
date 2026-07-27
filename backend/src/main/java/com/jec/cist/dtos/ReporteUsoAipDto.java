package com.jec.cist.dtos;

import java.util.List;
import java.util.UUID;

public class ReporteUsoAipDto {

    private ResumenDto resumen;
    private List<DocenteReporteDto> docentesStats;

    public ReporteUsoAipDto() {}

    public ReporteUsoAipDto(ResumenDto resumen, List<DocenteReporteDto> docentesStats) {
        this.resumen = resumen;
        this.docentesStats = docentesStats;
    }

    public ResumenDto getResumen() {
        return resumen;
    }

    public void setResumen(ResumenDto resumen) {
        this.resumen = resumen;
    }

    public List<DocenteReporteDto> getDocentesStats() {
        return docentesStats;
    }

    public void setDocentesStats(List<DocenteReporteDto> docentesStats) {
        this.docentesStats = docentesStats;
    }

    public static class ResumenDto {
        private int totalClasesAip;
        private int totalHorasColegiadas;
        private int totalReservasRealizadas;
        private int usoAipPrincipal; // Aula con ID 1 (habitualmente Principal)
        private int usoAipSecundaria; // Otras aulas (AIP 02, etc.)

        public ResumenDto() {}

        public ResumenDto(int totalClasesAip, int totalHorasColegiadas, int totalReservasRealizadas, int usoAipPrincipal, int usoAipSecundaria) {
            this.totalClasesAip = totalClasesAip;
            this.totalHorasColegiadas = totalHorasColegiadas;
            this.totalReservasRealizadas = totalReservasRealizadas;
            this.usoAipPrincipal = usoAipPrincipal;
            this.usoAipSecundaria = usoAipSecundaria;
        }

        public int getTotalClasesAip() {
            return totalClasesAip;
        }

        public void setTotalClasesAip(int totalClasesAip) {
            this.totalClasesAip = totalClasesAip;
        }

        public int getTotalHorasColegiadas() {
            return totalHorasColegiadas;
        }

        public void setTotalHorasColegiadas(int totalHorasColegiadas) {
            this.totalHorasColegiadas = totalHorasColegiadas;
        }

        public int getTotalReservasRealizadas() {
            return totalReservasRealizadas;
        }

        public void setTotalReservasRealizadas(int totalReservasRealizadas) {
            this.totalReservasRealizadas = totalReservasRealizadas;
        }

        public int getUsoAipPrincipal() {
            return usoAipPrincipal;
        }

        public void setUsoAipPrincipal(int usoAipPrincipal) {
            this.usoAipPrincipal = usoAipPrincipal;
        }

        public int getUsoAipSecundaria() {
            return usoAipSecundaria;
        }

        public void setUsoAipSecundaria(int usoAipSecundaria) {
            this.usoAipSecundaria = usoAipSecundaria;
        }
    }

    public static class DocenteReporteDto {
        private UUID idDocente;
        private String nombres;
        private String apellidos;
        private int totalSesiones;
        private int totalColegiados;
        private int totalReservas;
        private List<CursoReporteDto> cursos;

        public DocenteReporteDto() {}

        public DocenteReporteDto(UUID idDocente, String nombres, String apellidos, int totalSesiones, int totalColegiados, int totalReservas, List<CursoReporteDto> cursos) {
            this.idDocente = idDocente;
            this.nombres = nombres;
            this.apellidos = apellidos;
            this.totalSesiones = totalSesiones;
            this.totalColegiados = totalColegiados;
            this.totalReservas = totalReservas;
            this.cursos = cursos;
        }

        public UUID getIdDocente() {
            return idDocente;
        }

        public void setIdDocente(UUID idDocente) {
            this.idDocente = idDocente;
        }

        public String getNombres() {
            return nombres;
        }

        public void setNombres(String nombres) {
            this.nombres = nombres;
        }

        public String getApellidos() {
            return apellidos;
        }

        public void setApellidos(String apellidos) {
            this.apellidos = apellidos;
        }

        public int getTotalSesiones() {
            return totalSesiones;
        }

        public void setTotalSesiones(int totalSesiones) {
            this.totalSesiones = totalSesiones;
        }

        public int getTotalColegiados() {
            return totalColegiados;
        }

        public void setTotalColegiados(int totalColegiados) {
            this.totalColegiados = totalColegiados;
        }

        public int getTotalReservas() {
            return totalReservas;
        }

        public void setTotalReservas(int totalReservas) {
            this.totalReservas = totalReservas;
        }

        public List<CursoReporteDto> getCursos() {
            return cursos;
        }

        public void setCursos(List<CursoReporteDto> cursos) {
            this.cursos = cursos;
        }
    }

    public static class CursoReporteDto {
        private UUID idCurso;
        private String nombre;
        private Short grado;
        private String seccion;
        private String nrc;
        private int sesionesRealizadas;
        private int reservasRealizadas;
        private String estadoCumplimiento; // "OPTIMO", "BAJO", "SIN_USO"

        public CursoReporteDto() {}

        public CursoReporteDto(UUID idCurso, String nombre, Short grado, String seccion, String nrc, int sesionesRealizadas, int reservasRealizadas, String estadoCumplimiento) {
            this.idCurso = idCurso;
            this.nombre = nombre;
            this.grado = grado;
            this.seccion = seccion;
            this.nrc = nrc;
            this.sesionesRealizadas = sesionesRealizadas;
            this.reservasRealizadas = reservasRealizadas;
            this.estadoCumplimiento = estadoCumplimiento;
        }

        public UUID getIdCurso() {
            return idCurso;
        }

        public void setIdCurso(UUID idCurso) {
            this.idCurso = idCurso;
        }

        public String getNombre() {
            return nombre;
        }

        public void setNombre(String nombre) {
            this.nombre = nombre;
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

        public String getNrc() {
            return nrc;
        }

        public void setNrc(String nrc) {
            this.nrc = nrc;
        }

        public int getSesionesRealizadas() {
            return sesionesRealizadas;
        }

        public void setSesionesRealizadas(int sesionesRealizadas) {
            this.sesionesRealizadas = sesionesRealizadas;
        }

        public int getReservasRealizadas() {
            return reservasRealizadas;
        }

        public void setReservasRealizadas(int reservasRealizadas) {
            this.reservasRealizadas = reservasRealizadas;
        }

        public String getEstadoCumplimiento() {
            return estadoCumplimiento;
        }

        public void setEstadoCumplimiento(String estadoCumplimiento) {
            this.estadoCumplimiento = estadoCumplimiento;
        }
    }
}

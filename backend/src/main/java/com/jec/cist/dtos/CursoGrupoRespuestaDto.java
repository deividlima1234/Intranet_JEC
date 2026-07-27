package com.jec.cist.dtos;

import java.util.List;
import java.util.UUID;

public class CursoGrupoRespuestaDto {
    private UUID idGrupo;
    private UUID idCurso;
    private String nombre;
    private List<UsuarioRespuestaDto> integrantes;

    public CursoGrupoRespuestaDto() {}

    public CursoGrupoRespuestaDto(UUID idGrupo, UUID idCurso, String nombre, List<UsuarioRespuestaDto> integrantes) {
        this.idGrupo = idGrupo;
        this.idCurso = idCurso;
        this.nombre = nombre;
        this.integrantes = integrantes;
    }

    public UUID getIdGrupo() { return idGrupo; }
    public void setIdGrupo(UUID idGrupo) { this.idGrupo = idGrupo; }
    public UUID getIdCurso() { return idCurso; }
    public void setIdCurso(UUID idCurso) { this.idCurso = idCurso; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public List<UsuarioRespuestaDto> getIntegrantes() { return integrantes; }
    public void setIntegrantes(List<UsuarioRespuestaDto> integrantes) { this.integrantes = integrantes; }
}

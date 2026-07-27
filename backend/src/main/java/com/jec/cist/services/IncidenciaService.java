package com.jec.cist.services;

import com.jec.cist.dtos.IncidenciaAtencionDto;
import com.jec.cist.dtos.IncidenciaRegistroDto;
import com.jec.cist.dtos.IncidenciaRespuestaDto;
import com.jec.cist.models.Incidencia;
import com.jec.cist.models.Usuario;
import com.jec.cist.repositories.IncidenciaRepository;
import com.jec.cist.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;
    private final UsuarioRepository usuarioRepository;

    public IncidenciaService(IncidenciaRepository incidenciaRepository, UsuarioRepository usuarioRepository) {
        this.incidenciaRepository = incidenciaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public IncidenciaRespuestaDto registrarIncidencia(IncidenciaRegistroDto dto) {
        Usuario autor = usuarioRepository.findById(dto.getIdAutor())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autor no encontrado con ID: " + dto.getIdAutor()));

        Incidencia incidencia = new Incidencia(
                dto.getTitulo(),
                dto.getDescripcion(),
                dto.getTipo(),
                autor
        );

        incidencia = incidenciaRepository.save(incidencia);
        return mapearARespuesta(incidencia);
    }

    @Transactional(readOnly = true)
    public List<IncidenciaRespuestaDto> listarVisiblesParaUsuario(UUID idUsuario, String rol) {
        List<Incidencia> lista;
        if ("CIST".equalsIgnoreCase(rol) || "PIP".equalsIgnoreCase(rol)) {
            lista = incidenciaRepository.findAllByOrderByFechaCreacionDesc();
        } else {
            lista = incidenciaRepository.findByAutorIdUsuarioOrderByFechaCreacionDesc(idUsuario);
        }

        return lista.stream()
                .map(this::mapearARespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public IncidenciaRespuestaDto atenderIncidencia(UUID idIncidencia, IncidenciaAtencionDto dto) {
        Incidencia incidencia = incidenciaRepository.findById(idIncidencia)
                .orElseThrow(() -> new IllegalArgumentException("Incidencia no encontrada con ID: " + idIncidencia));

        Usuario atendidoPor = usuarioRepository.findById(dto.getIdAtendidoPor())
                .orElseThrow(() -> new IllegalArgumentException("Usuario de atención no encontrado con ID: " + dto.getIdAtendidoPor()));

        incidencia.setEstado(dto.getEstado());
        incidencia.setRespuestaSoporte(dto.getRespuestaSoporte());
        incidencia.setAtendidoPor(atendidoPor);
        incidencia.setFechaRespuesta(LocalDateTime.now());

        incidencia = incidenciaRepository.save(incidencia);
        return mapearARespuesta(incidencia);
    }

    @Transactional
    public void eliminarIncidencia(UUID idIncidencia) {
        Incidencia incidencia = incidenciaRepository.findById(idIncidencia)
                .orElseThrow(() -> new IllegalArgumentException("Incidencia no encontrada con ID: " + idIncidencia));
        incidenciaRepository.delete(incidencia);
    }

    private IncidenciaRespuestaDto mapearARespuesta(Incidencia i) {
        UUID idAutor = null;
        String nombreAutor = "Desconocido";
        String rolAutor = "ESTUDIANTE";
        if (i.getAutor() != null) {
            idAutor = i.getAutor().getIdUsuario();
            nombreAutor = i.getAutor().getNombres() + " " + i.getAutor().getApellidos();
            rolAutor = i.getAutor().getRol() != null ? i.getAutor().getRol().name() : "ESTUDIANTE";
        }

        UUID idAtendidoPor = null;
        String nombreAtendidoPor = "";
        if (i.getAtendidoPor() != null) {
            idAtendidoPor = i.getAtendidoPor().getIdUsuario();
            nombreAtendidoPor = i.getAtendidoPor().getNombres() + " " + i.getAtendidoPor().getApellidos();
        }

        return new IncidenciaRespuestaDto(
                i.getIdIncidencia(),
                i.getTitulo(),
                i.getDescripcion(),
                i.getTipo(),
                i.getEstado(),
                i.getFechaCreacion(),
                idAutor,
                nombreAutor,
                rolAutor,
                i.getRespuestaSoporte(),
                i.getFechaRespuesta(),
                idAtendidoPor,
                nombreAtendidoPor
        );
    }
}

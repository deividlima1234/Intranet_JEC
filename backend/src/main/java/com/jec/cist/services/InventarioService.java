package com.jec.cist.services;

import com.jec.cist.dtos.EquipoAltaDto;
import com.jec.cist.dtos.EquipoRespuestaDto;
import com.jec.cist.models.AulaAip;
import com.jec.cist.models.EquipoAip;
import com.jec.cist.repositories.AulaAipRepository;
import com.jec.cist.repositories.EquipoAipRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventarioService {

    private final EquipoAipRepository equipoAipRepository;
    private final AulaAipRepository aulaAipRepository;

    public InventarioService(EquipoAipRepository equipoAipRepository, AulaAipRepository aulaAipRepository) {
        this.equipoAipRepository = equipoAipRepository;
        this.aulaAipRepository = aulaAipRepository;
    }

    @Transactional
    public EquipoRespuestaDto darAltaEquipo(EquipoAltaDto dto) {
        if (equipoAipRepository.existsByCodPatrimonial(dto.getCodPatrimonial())) {
            throw new IllegalArgumentException("Ya existe un equipo registrado con el código patrimonial: " + dto.getCodPatrimonial());
        }
        if (equipoAipRepository.existsByQrEquipo(dto.getQrEquipo())) {
            throw new IllegalArgumentException("Ya existe un equipo registrado con el código QR: " + dto.getQrEquipo());
        }

        AulaAip aula = aulaAipRepository.findById(dto.getIdAulaBase())
                .orElseThrow(() -> new IllegalArgumentException("Aula AIP no encontrada con ID: " + dto.getIdAulaBase()));

        EquipoAip equipo = new EquipoAip();
        equipo.setAulaBase(aula);
        equipo.setCodPatrimonial(dto.getCodPatrimonial());
        equipo.setTipoEquipo(dto.getTipoEquipo());
        equipo.setQrEquipo(dto.getQrEquipo());
        equipo.setNumSerie(dto.getNumSerie() != null && !dto.getNumSerie().trim().isEmpty() ? dto.getNumSerie().trim() : null);
        equipo.setQrCargador(dto.getQrCargador() != null && !dto.getQrCargador().trim().isEmpty() ? dto.getQrCargador().trim() : null);
        equipo.setNumSerieCargador(dto.getNumSerieCargador() != null && !dto.getNumSerieCargador().trim().isEmpty() ? dto.getNumSerieCargador().trim() : null);
        equipo.setMarca(dto.getMarca() != null && !dto.getMarca().trim().isEmpty() ? dto.getMarca().trim() : null);
        equipo.setDescripcion(dto.getDescripcion() != null && !dto.getDescripcion().trim().isEmpty() ? dto.getDescripcion().trim() : null);
        if (dto.getEstadoFisico() != null) {
            equipo.setEstadoFisico(dto.getEstadoFisico());
        }

        equipo = equipoAipRepository.save(equipo);
        return mapearAEquipoRespuesta(equipo);
    }

    @Transactional(readOnly = true)
    public List<EquipoRespuestaDto> obtenerInventarioAula(Integer idAula) {
        if (!aulaAipRepository.existsById(idAula)) {
            throw new IllegalArgumentException("Aula AIP no encontrada con ID: " + idAula);
        }

        List<EquipoAip> equipos = equipoAipRepository.findByAulaBase_IdAula(idAula);
        return equipos.stream()
                .map(this::mapearAEquipoRespuesta)
                .collect(Collectors.toList());
    }

    private EquipoRespuestaDto mapearAEquipoRespuesta(EquipoAip equipo) {
        EquipoRespuestaDto res = new EquipoRespuestaDto();
        res.setIdEquipo(equipo.getIdEquipo());
        res.setIdAulaBase(equipo.getAulaBase().getIdAula());
        res.setAulaNombre(equipo.getAulaBase().getNombreAula());
        res.setCodPatrimonial(equipo.getCodPatrimonial());
        res.setTipoEquipo(equipo.getTipoEquipo());
        res.setQrEquipo(equipo.getQrEquipo());
        res.setNumSerie(equipo.getNumSerie());
        res.setQrCargador(equipo.getQrCargador());
        res.setNumSerieCargador(equipo.getNumSerieCargador());
        res.setMarca(equipo.getMarca());
        res.setDescripcion(equipo.getDescripcion());
        res.setEstadoFisico(equipo.getEstadoFisico());
        res.setUbicacionActual(equipo.getUbicacionActual());
        return res;
    }
}

package com.jec.cist.services;

import com.jec.cist.dtos.CursoEvaluacionRequestDto;
import com.jec.cist.dtos.CursoEvaluacionRespuestaDto;
import com.jec.cist.dtos.EvaluacionCriterioRequestDto;
import com.jec.cist.dtos.EvaluacionCriterioRespuestaDto;
import com.jec.cist.models.Curso;
import com.jec.cist.models.CursoEvaluacion;
import com.jec.cist.models.EvaluacionCriterio;
import com.jec.cist.repositories.CursoEvaluacionRepository;
import com.jec.cist.repositories.CursoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CursoEvaluacionService {

    private final CursoEvaluacionRepository cursoEvaluacionRepository;
    private final CursoRepository cursoRepository;
    private final com.jec.cist.repositories.CursoNotaRepository cursoNotaRepository;
    private final com.jec.cist.repositories.CursoNotaDetalleRepository cursoNotaDetalleRepository;
    private final com.jec.cist.repositories.EstudianteAvanceRepository estudianteAvanceRepository;

    public CursoEvaluacionService(CursoEvaluacionRepository cursoEvaluacionRepository, CursoRepository cursoRepository, com.jec.cist.repositories.CursoNotaRepository cursoNotaRepository, com.jec.cist.repositories.CursoNotaDetalleRepository cursoNotaDetalleRepository, com.jec.cist.repositories.EstudianteAvanceRepository estudianteAvanceRepository) {
        this.cursoEvaluacionRepository = cursoEvaluacionRepository;
        this.cursoRepository = cursoRepository;
        this.cursoNotaRepository = cursoNotaRepository;
        this.cursoNotaDetalleRepository = cursoNotaDetalleRepository;
        this.estudianteAvanceRepository = estudianteAvanceRepository;
    }

    @Transactional
    public CursoEvaluacionRespuestaDto crearEvaluacion(UUID idCurso, CursoEvaluacionRequestDto dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        // Validar que los criterios sumen 20
        int sumaPuntos = 0;
        if (dto.getCriterios() != null) {
            for (EvaluacionCriterioRequestDto critDto : dto.getCriterios()) {
                sumaPuntos += critDto.getPuntajeMaximo();
            }
        }
        if (sumaPuntos != 20) {
            throw new IllegalArgumentException("La suma de los puntajes de los criterios debe ser exactamente 20. Actual: " + sumaPuntos);
        }

        CursoEvaluacion evaluacion = new CursoEvaluacion(
                curso,
                dto.getTitulo(),
                dto.getDescripcion(),
                dto.getFechaLimite(),
                dto.getPermitirEntregasTardias()
        );

        if (dto.getCriterios() != null) {
            for (EvaluacionCriterioRequestDto critDto : dto.getCriterios()) {
                EvaluacionCriterio criterio = new EvaluacionCriterio(evaluacion, critDto.getNombre(), critDto.getPuntajeMaximo());
                evaluacion.addCriterio(criterio);
            }
        }

        evaluacion = cursoEvaluacionRepository.save(evaluacion);
        return mapearADto(evaluacion);
    }

    @Transactional(readOnly = true)
    public List<CursoEvaluacionRespuestaDto> listarEvaluacionesPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return cursoEvaluacionRepository.findByCursoIdCursoOrderByFechaCreacionDesc(idCurso).stream()
                .map(this::mapearADto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CursoEvaluacionRespuestaDto obtenerEvaluacion(UUID idEvaluacion) {
        CursoEvaluacion evaluacion = cursoEvaluacionRepository.findById(idEvaluacion)
                .orElseThrow(() -> new IllegalArgumentException("Evaluación no encontrada con ID: " + idEvaluacion));
        return mapearADto(evaluacion);
    }

    @Transactional
    public void eliminarEvaluacion(UUID idEvaluacion) {
        if (!cursoEvaluacionRepository.existsById(idEvaluacion)) {
            throw new IllegalArgumentException("Evaluación no encontrada con ID: " + idEvaluacion);
        }
        cursoNotaDetalleRepository.deleteByCriterioEvaluacionIdEvaluacion(idEvaluacion);
        cursoNotaRepository.deleteByEvaluacionIdEvaluacion(idEvaluacion);
        estudianteAvanceRepository.setEvaluacionNullByIdEvaluacion(idEvaluacion);
        cursoEvaluacionRepository.deleteById(idEvaluacion);
    }

    private CursoEvaluacionRespuestaDto mapearADto(CursoEvaluacion ev) {
        List<EvaluacionCriterioRespuestaDto> criteriosDto = ev.getCriterios().stream()
                .map(c -> new EvaluacionCriterioRespuestaDto(c.getIdCriterio(), c.getNombre(), c.getPuntajeMaximo()))
                .collect(Collectors.toList());

        return new CursoEvaluacionRespuestaDto(
                ev.getIdEvaluacion(),
                ev.getCurso().getIdCurso(),
                ev.getTitulo(),
                ev.getDescripcion(),
                ev.getFechaLimite(),
                ev.getPermitirEntregasTardias(),
                ev.getFechaCreacion(),
                criteriosDto
        );
    }
}

package com.jec.cist.services;

import com.jec.cist.models.*;
import com.jec.cist.repositories.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@Service
public class MigracionService {

    @Autowired
    private CursoNotaRepository notaRepository;

    @Autowired
    private EstudianteAvanceRepository avanceRepository;

    @Autowired
    private CursoEvaluacionRepository evaluacionRepository;

    @Autowired
    private EvaluacionCriterioRepository criterioRepository;

    @Autowired
    private CursoNotaDetalleRepository notaDetalleRepository;

    @Autowired
    private CursoRepository cursoRepository;

    @Transactional
    public Map<String, Object> ejecutarMigracion() {
        int notasMigradas = 0;
        int avancesMigrados = 0;

        // 1. Migrar Notas Antiguas
        List<CursoNota> notas = notaRepository.findAll();
        for (CursoNota nota : notas) {
            if (nota.getEvaluacion() == null && nota.getCriterio() != null && !nota.getCriterio().isEmpty()) {
                // Buscar o crear la evaluación
                CursoEvaluacion evaluacion = buscarOCrearEvaluacion(nota.getCurso(), nota.getCriterio());
                
                // Buscar o crear el criterio general (20 pts)
                EvaluacionCriterio criterioGeneral = buscarOCrearCriterioGeneral(evaluacion);

                // Asignar la evaluación a la nota
                nota.setEvaluacion(evaluacion);
                
                // Mapeo de Letra a número (opcional para mantener consistencia, aunque el Frontend lo vuelve a calcular)
                int puntaje = 0;
                if (nota.getCalificacion() != null) {
                    switch (nota.getCalificacion().toUpperCase()) {
                        case "AD": puntaje = 20; break;
                        case "A": puntaje = 16; break;
                        case "B": puntaje = 12; break;
                        case "C": puntaje = 10; break;
                        default:
                            try {
                                puntaje = Integer.parseInt(nota.getCalificacion());
                            } catch (NumberFormatException e) {
                                puntaje = 0;
                            }
                    }
                }
                nota.setPuntajeTotal(puntaje);
                
                // Crear el detalle de la nota
                CursoNotaDetalle detalle = new CursoNotaDetalle();
                detalle.setNota(nota);
                detalle.setCriterio(criterioGeneral);
                detalle.setPuntajeAsignado(puntaje);
                notaDetalleRepository.save(detalle);

                notaRepository.save(nota);
                notasMigradas++;
            }
        }

        // 2. Migrar Avances Antiguos
        List<EstudianteAvance> avances = avanceRepository.findAll();
        for (EstudianteAvance avance : avances) {
            if (avance.getEvaluacion() == null && avance.getTitulo() != null && !avance.getTitulo().isEmpty()) {
                // Buscar o crear la evaluación para este avance
                CursoEvaluacion evaluacion = buscarOCrearEvaluacion(avance.getCurso(), avance.getTitulo());
                
                // Asignar
                avance.setEvaluacion(evaluacion);
                avanceRepository.save(avance);
                avancesMigrados++;
            }
        }

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("mensaje", "Migración completada exitosamente.");
        resultado.put("notas_migradas", notasMigradas);
        resultado.put("avances_migrados", avancesMigrados);
        return resultado;
    }

    private CursoEvaluacion buscarOCrearEvaluacion(Curso curso, String titulo) {
        Optional<CursoEvaluacion> opt = evaluacionRepository.findByCursoIdCursoOrderByFechaCreacionDesc(curso.getIdCurso())
                .stream()
                .filter(e -> e.getTitulo().equalsIgnoreCase(titulo))
                .findFirst();

        if (opt.isPresent()) {
            return opt.get();
        }

        CursoEvaluacion nueva = new CursoEvaluacion();
        nueva.setCurso(curso);
        nueva.setTitulo(titulo);
        nueva.setDescripcion("Generado automáticamente por migración");
        nueva.setFechaLimite(LocalDateTime.now());
        nueva.setPermitirEntregasTardias(true); // Para no bloquear entregas anteriores
        nueva.setFechaCreacion(LocalDateTime.now());
        
        return evaluacionRepository.save(nueva);
    }

    private EvaluacionCriterio buscarOCrearCriterioGeneral(CursoEvaluacion evaluacion) {
        Optional<EvaluacionCriterio> opt = criterioRepository.findByEvaluacionIdEvaluacion(evaluacion.getIdEvaluacion())
                .stream()
                .filter(c -> c.getNombre().equals("Criterio General"))
                .findFirst();

        if (opt.isPresent()) {
            return opt.get();
        }

        EvaluacionCriterio nuevo = new EvaluacionCriterio();
        nuevo.setEvaluacion(evaluacion);
        nuevo.setNombre("Criterio General");
        nuevo.setPuntajeMaximo(20);
        return criterioRepository.save(nuevo);
    }
}

package com.jec.cist.repositories;

import com.jec.cist.models.CursoNota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CursoNotaRepository extends JpaRepository<CursoNota, UUID> {
    List<CursoNota> findByCursoIdCurso(UUID idCurso);
    List<CursoNota> findByEstudianteIdUsuario(UUID idUsuario);
    Optional<CursoNota> findByCursoIdCursoAndEstudianteIdUsuarioAndCriterio(UUID idCurso, UUID idUsuario, String criterio);
    Optional<CursoNota> findByCursoIdCursoAndEstudianteIdUsuarioAndEvaluacionIdEvaluacion(UUID idCurso, UUID idUsuario, UUID idEvaluacion);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM CursoNota c WHERE c.evaluacion.idEvaluacion = ?1")
    void deleteByEvaluacionIdEvaluacion(UUID idEvaluacion);
}

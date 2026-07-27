package com.jec.cist.repositories;

import com.jec.cist.models.EvaluacionCriterio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface EvaluacionCriterioRepository extends JpaRepository<EvaluacionCriterio, UUID> {
    List<EvaluacionCriterio> findByEvaluacionIdEvaluacion(UUID idEvaluacion);
}

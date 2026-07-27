package com.jec.cist.repositories;

import com.jec.cist.models.CursoEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CursoEvaluacionRepository extends JpaRepository<CursoEvaluacion, UUID> {
    List<CursoEvaluacion> findByCursoIdCursoOrderByFechaCreacionDesc(UUID idCurso);
}

package com.jec.cist.repositories;

import com.jec.cist.models.CursoNotaDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CursoNotaDetalleRepository extends JpaRepository<CursoNotaDetalle, UUID> {
    List<CursoNotaDetalle> findByNotaIdNota(UUID idNota);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM CursoNotaDetalle d WHERE d.criterio.evaluacion.idEvaluacion = ?1")
    void deleteByCriterioEvaluacionIdEvaluacion(UUID idEvaluacion);
}

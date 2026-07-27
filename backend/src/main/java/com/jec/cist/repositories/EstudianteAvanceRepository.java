package com.jec.cist.repositories;

import com.jec.cist.models.EstudianteAvance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EstudianteAvanceRepository extends JpaRepository<EstudianteAvance, UUID> {
    List<EstudianteAvance> findByCursoIdCursoOrderByFechaSubidaDesc(UUID idCurso);
    List<EstudianteAvance> findByCursoIdCursoAndEstudianteIdUsuarioOrderByFechaSubidaDesc(UUID idCurso, UUID idEstudiante);
    long countByCursoIdCursoAndEstado(UUID idCurso, String estado);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("UPDATE EstudianteAvance e SET e.evaluacion = null WHERE e.evaluacion.idEvaluacion = ?1")
    void setEvaluacionNullByIdEvaluacion(UUID idEvaluacion);
}

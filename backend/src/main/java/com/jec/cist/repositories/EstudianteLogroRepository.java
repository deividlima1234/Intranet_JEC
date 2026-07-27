package com.jec.cist.repositories;

import com.jec.cist.models.EstudianteLogro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EstudianteLogroRepository extends JpaRepository<EstudianteLogro, UUID> {
    List<EstudianteLogro> findByCursoIdCurso(UUID idCurso);
    List<EstudianteLogro> findByCursoIdCursoAndEstudianteIdUsuario(UUID idCurso, UUID idEstudiante);
    List<EstudianteLogro> findByEstudianteIdUsuario(UUID idEstudiante);
}

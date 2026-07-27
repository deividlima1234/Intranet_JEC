package com.jec.cist.repositories;

import com.jec.cist.models.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CursoRepository extends JpaRepository<Curso, UUID> {
    List<Curso> findByDocenteIdUsuario(UUID idDocente);
    List<Curso> findByGradoAndSeccion(Short grado, String seccion);
    boolean existsByNrc(String nrc);
    Optional<Curso> findByNrc(String nrc);
}

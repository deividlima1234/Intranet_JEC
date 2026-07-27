package com.jec.cist.repositories;

import com.jec.cist.models.CursoGrupo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CursoGrupoRepository extends JpaRepository<CursoGrupo, UUID> {
    List<CursoGrupo> findByCursoIdCurso(UUID idCurso);
}

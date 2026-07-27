package com.jec.cist.repositories;

import com.jec.cist.models.CursoMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CursoMaterialRepository extends JpaRepository<CursoMaterial, UUID> {
    List<CursoMaterial> findByCursoIdCursoOrderByFechaSubidaDesc(UUID idCurso);
}

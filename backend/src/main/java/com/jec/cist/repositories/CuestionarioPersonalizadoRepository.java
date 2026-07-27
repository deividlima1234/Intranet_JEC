package com.jec.cist.repositories;

import com.jec.cist.models.CuestionarioPersonalizado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CuestionarioPersonalizadoRepository extends JpaRepository<CuestionarioPersonalizado, UUID> {
    List<CuestionarioPersonalizado> findByCreadorIdUsuarioOrderByFechaCreacionDesc(UUID idCreador);
    List<CuestionarioPersonalizado> findByCursoIdCursoOrderByFechaCreacionDesc(UUID idCurso);
}

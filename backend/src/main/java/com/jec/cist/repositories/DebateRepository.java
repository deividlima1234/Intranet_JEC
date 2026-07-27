package com.jec.cist.repositories;

import com.jec.cist.models.Debate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DebateRepository extends JpaRepository<Debate, UUID> {
    List<Debate> findByCursoIdCursoOrderByFechaCreacionDesc(UUID idCurso);
    List<Debate> findByAutorIdUsuario(UUID idUsuario);
}

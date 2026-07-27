package com.jec.cist.repositories;

import com.jec.cist.models.DebateRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DebateRespuestaRepository extends JpaRepository<DebateRespuesta, UUID> {
    List<DebateRespuesta> findByDebateIdDebateOrderByFechaCreacionAsc(UUID idDebate);
    List<DebateRespuesta> findByAutorIdUsuario(UUID idUsuario);
}

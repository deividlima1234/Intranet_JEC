package com.jec.cist.repositories;

import com.jec.cist.models.MensajeDirecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface MensajeDirectoRepository extends JpaRepository<MensajeDirecto, UUID> {
    
    @Query("SELECT m FROM MensajeDirecto m WHERE m.curso.idCurso = :idCurso AND " +
           "((m.emisor.idUsuario = :user1 AND m.receptor.idUsuario = :user2) OR " +
           "(m.emisor.idUsuario = :user2 AND m.receptor.idUsuario = :user1)) " +
           "ORDER BY m.fechaEnvio ASC")
    List<MensajeDirecto> findChatHistory(@Param("idCurso") UUID idCurso, 
                                         @Param("user1") UUID user1, 
                                         @Param("user2") UUID user2);
                                         
    List<MensajeDirecto> findByCursoIdCursoAndReceptorIdUsuarioAndLeidoFalse(UUID idCurso, UUID receptorId);

    List<MensajeDirecto> findByCursoIdCurso(UUID idCurso);

    List<MensajeDirecto> findByEmisorIdUsuarioOrReceptorIdUsuario(UUID emisorId, UUID receptorId);
}

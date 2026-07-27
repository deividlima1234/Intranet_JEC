package com.jec.cist.repositories;

import com.jec.cist.models.EncuestaCIST;
import com.jec.cist.models.RespuestaEncuesta;
import com.jec.cist.models.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RespuestaEncuestaRepository extends JpaRepository<RespuestaEncuesta, UUID> {

    /** Verifica si un usuario ya respondió una encuesta */
    boolean existsByEncuestaAndUsuario(EncuestaCIST encuesta, Usuario usuario);

    /** Obtiene la respuesta de un usuario en una encuesta */
    Optional<RespuestaEncuesta> findByEncuestaAndUsuario(EncuestaCIST encuesta, Usuario usuario);

    /** Lista todas las respuestas de una encuesta, ordenadas por fecha */
    List<RespuestaEncuesta> findByEncuestaOrderByFechaRespuestaDesc(EncuestaCIST encuesta);

    /** Cuenta total de respuestas de una encuesta */
    long countByEncuesta(EncuestaCIST encuesta);

    /** Respuestas por área curricular (para agrupamiento estadístico) */
    List<RespuestaEncuesta> findByEncuestaAndAreaCurricularIgnoreCase(EncuestaCIST encuesta, String areaCurricular);

    List<RespuestaEncuesta> findByUsuarioIdUsuario(UUID idUsuario);
}

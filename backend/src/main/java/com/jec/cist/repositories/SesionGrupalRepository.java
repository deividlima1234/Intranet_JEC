package com.jec.cist.repositories;

import com.jec.cist.models.SesionGrupal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SesionGrupalRepository extends JpaRepository<SesionGrupal, UUID> {
    List<SesionGrupal> findByDocente_IdUsuarioAndHoraFinIsNull(UUID idDocente);
    List<SesionGrupal> findByAulaAip_IdAulaAndHoraFinIsNull(Integer idAula);
    List<SesionGrupal> findByHoraFinIsNull();
    List<SesionGrupal> findAllByOrderByHoraInicioDesc();
    List<SesionGrupal> findByDocenteIdUsuario(UUID idDocente);
    List<SesionGrupal> findByHoraInicioBetweenOrderByHoraInicioAsc(java.time.LocalDateTime start, java.time.LocalDateTime end);
}

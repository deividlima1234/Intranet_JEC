package com.jec.cist.repositories;

import com.jec.cist.models.EquipoAip;
import com.jec.cist.models.EstadoFisico;
import com.jec.cist.models.TipoEquipo;
import com.jec.cist.models.UbicacionEquipo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EquipoAipRepository extends JpaRepository<EquipoAip, UUID> {
    Optional<EquipoAip> findByCodPatrimonial(String codPatrimonial);
    Optional<EquipoAip> findByQrEquipo(String qrEquipo);
    List<EquipoAip> findByAulaBase_IdAula(Integer idAula);
    
    List<EquipoAip> findByAulaBase_IdAulaAndTipoEquipoAndEstadoFisicoAndUbicacionActualOrderByCodPatrimonialAsc(
            Integer idAula, TipoEquipo tipoEquipo, EstadoFisico estadoFisico, UbicacionEquipo ubicacionActual);
            
    boolean existsByCodPatrimonial(String codPatrimonial);
    boolean existsByQrEquipo(String qrEquipo);
}

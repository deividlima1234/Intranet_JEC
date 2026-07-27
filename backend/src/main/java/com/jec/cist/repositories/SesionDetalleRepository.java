package com.jec.cist.repositories;

import com.jec.cist.models.SesionDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SesionDetalleRepository extends JpaRepository<SesionDetalle, UUID> {
    List<SesionDetalle> findBySesionGrupal_IdSesion(UUID idSesion);
    List<SesionDetalle> findByEquipoAip_QrEquipoAndSesionGrupal_HoraFinIsNull(String qrEquipo);
    List<SesionDetalle> findByEstudianteIdUsuario(UUID idEstudiante);
}

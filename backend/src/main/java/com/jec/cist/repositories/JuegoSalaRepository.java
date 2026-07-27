package com.jec.cist.repositories;

import com.jec.cist.models.JuegoSala;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JuegoSalaRepository extends JpaRepository<JuegoSala, UUID> {
    Optional<JuegoSala> findByCodigoSala(String codigoSala);
    List<JuegoSala> findByEstadoOrderByFechaCreacionDesc(String estado);
    List<JuegoSala> findByCreadorIdUsuario(UUID idUsuario);
}

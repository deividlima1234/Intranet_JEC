package com.jec.cist.repositories;

import com.jec.cist.models.EncuestaCIST;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EncuestaRepository extends JpaRepository<EncuestaCIST, UUID> {

    /** Busca todas las encuestas activas (debería haber máximo 1 activa a la vez) */
    List<EncuestaCIST> findByActivaTrue();

    /** Busca la primera encuesta activa */
    Optional<EncuestaCIST> findFirstByActivaTrue();

    /** Lista todas las encuestas ordenadas por fecha de creación descendente */
    List<EncuestaCIST> findAllByOrderByFechaCreacionDesc();
}

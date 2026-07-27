package com.jec.cist.repositories;

import com.jec.cist.models.AulaAip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface AulaAipRepository extends JpaRepository<AulaAip, Integer> {
    Optional<AulaAip> findByNombreAula(String nombreAula);
}

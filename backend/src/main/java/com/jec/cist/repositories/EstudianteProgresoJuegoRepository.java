package com.jec.cist.repositories;

import com.jec.cist.models.EstudianteProgresoJuego;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EstudianteProgresoJuegoRepository extends JpaRepository<EstudianteProgresoJuego, UUID> {
    Optional<EstudianteProgresoJuego> findByEstudianteIdUsuario(UUID idEstudiante);
}

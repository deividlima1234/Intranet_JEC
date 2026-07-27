package com.jec.cist.repositories;

import com.jec.cist.models.Incidencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, UUID> {
    List<Incidencia> findAllByOrderByFechaCreacionDesc();
    List<Incidencia> findByAutorIdUsuarioOrderByFechaCreacionDesc(UUID idUsuario);
    List<Incidencia> findByAtendidoPorIdUsuario(UUID idUsuario);
}

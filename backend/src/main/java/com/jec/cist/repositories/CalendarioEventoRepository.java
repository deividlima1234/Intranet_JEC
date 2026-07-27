package com.jec.cist.repositories;

import com.jec.cist.models.CalendarioEvento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarioEventoRepository extends JpaRepository<CalendarioEvento, UUID> {
    List<CalendarioEvento> findByCursoIdCursoOrderByFechaHoraAsc(UUID idCurso);
}

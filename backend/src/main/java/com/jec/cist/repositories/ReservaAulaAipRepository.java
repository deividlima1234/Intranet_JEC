package com.jec.cist.repositories;

import com.jec.cist.models.ReservaAulaAip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReservaAulaAipRepository extends JpaRepository<ReservaAulaAip, UUID> {

    @Query("SELECT r FROM ReservaAulaAip r WHERE r.aulaAip.idAula = :idAula AND r.fecha = :fecha AND r.horaInicio < :horaFin AND r.horaFin > :horaInicio")
    List<ReservaAulaAip> findOverlappingReservations(
            @Param("idAula") Integer idAula,
            @Param("fecha") LocalDate fecha,
            @Param("horaInicio") LocalTime horaInicio,
            @Param("horaFin") LocalTime horaFin
    );

    List<ReservaAulaAip> findByAulaAipIdAulaAndFechaBetweenOrderByFechaAscHoraInicioAsc(Integer idAula, LocalDate start, LocalDate end);

    List<ReservaAulaAip> findByGradoAndSeccionAndFechaBetweenOrderByFechaAscHoraInicioAsc(Short grado, String seccion, LocalDate start, LocalDate end);

    List<ReservaAulaAip> findByDocenteIdUsuarioAndFechaBetweenOrderByFechaAscHoraInicioAsc(UUID idDocente, LocalDate start, LocalDate end);

    List<ReservaAulaAip> findByFechaBetweenOrderByFechaAscHoraInicioAsc(LocalDate start, LocalDate end);

    List<ReservaAulaAip> findByDocenteIdUsuario(UUID idUsuario);
}

package com.jec.cist.repositories;

import com.jec.cist.models.JuegoSalaJugador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface JuegoSalaJugadorRepository extends JpaRepository<JuegoSalaJugador, UUID> {
    List<JuegoSalaJugador> findBySalaIdSalaOrderByOrdenTurnoAsc(UUID idSala);
    Optional<JuegoSalaJugador> findBySalaIdSalaAndJugadorIdUsuario(UUID idSala, UUID idJugador);
    long countBySalaIdSala(UUID idSala);
    Optional<JuegoSalaJugador> findByJugadorIdUsuarioAndSalaEstadoNot(UUID idJugador, String estadoFinished);
    List<JuegoSalaJugador> findByJugadorIdUsuario(UUID idJugador);
}

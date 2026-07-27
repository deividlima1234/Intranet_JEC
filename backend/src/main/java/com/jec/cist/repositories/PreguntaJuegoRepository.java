package com.jec.cist.repositories;

import com.jec.cist.models.PreguntaJuego;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface PreguntaJuegoRepository extends JpaRepository<PreguntaJuego, UUID> {
    List<PreguntaJuego> findByCuestionarioIdCuestionario(UUID idCuestionario);
    List<PreguntaJuego> findByAreaAndGradoAndCuestionarioIsNull(String area, Integer grado);

    @Query(value = "SELECT * FROM juego_preguntas WHERE area = :area AND grado = :grado AND id_cuestionario IS NULL ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    PreguntaJuego findRandomQuestion(String area, Integer grado);

    @Query(value = "SELECT * FROM juego_preguntas WHERE id_cuestionario = :idCuestionario ORDER BY RANDOM() LIMIT 1", nativeQuery = true)
    PreguntaJuego findRandomQuestionFromCuestionario(UUID idCuestionario);
}

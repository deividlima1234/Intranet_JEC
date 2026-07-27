package com.jec.cist.repositories;

import com.jec.cist.models.Anuncio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface AnuncioRepository extends JpaRepository<Anuncio, UUID> {
    List<Anuncio> findByCursoIdCursoOrderByFechaPublicacionDesc(UUID idCurso);
    List<Anuncio> findByAutorIdUsuario(UUID idUsuario);
}

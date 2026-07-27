package com.jec.cist.repositories;

import com.jec.cist.models.DocumentoManual;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentoManualRepository extends JpaRepository<DocumentoManual, UUID> {
    List<DocumentoManual> findAllByOrderByFechaSubidaDesc();
    List<DocumentoManual> findByAutorIdUsuario(UUID idUsuario);
}

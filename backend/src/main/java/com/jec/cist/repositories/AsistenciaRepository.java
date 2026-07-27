package com.jec.cist.repositories;

import com.jec.cist.models.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, UUID> {
    
    Optional<Asistencia> findByEstudianteIdUsuarioAndFecha(UUID idUsuario, LocalDate fecha);
    
    List<Asistencia> findByFecha(LocalDate fecha);
    
    List<Asistencia> findByFechaAndGrado(LocalDate fecha, Short grado);
    
    List<Asistencia> findByFechaAndGradoAndSeccion(LocalDate fecha, Short grado, String seccion);
    
    List<Asistencia> findByEstudianteIdUsuarioOrderByFechaDesc(UUID idUsuario);
    
    List<Asistencia> findByFechaBetweenOrderByFechaDesc(LocalDate inicio, LocalDate fin);
    
    List<Asistencia> findByFechaBetweenAndGradoOrderByFechaDesc(LocalDate inicio, LocalDate fin, Short grado);
    
    List<Asistencia> findByFechaBetweenAndGradoAndSeccionOrderByFechaDesc(LocalDate inicio, LocalDate fin, Short grado, String seccion);
}

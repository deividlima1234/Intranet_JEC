package com.jec.cist.repositories;

import com.jec.cist.models.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, UUID> {
    List<Estudiante> findByGradoAndSeccionOrderByNumeroOrdenAsc(Short grado, String seccion);

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT e.grado, e.seccion FROM Estudiante e ORDER BY e.grado ASC, e.seccion ASC")
    List<Object[]> findDistinctGradosSecciones();

    @org.springframework.data.jpa.repository.Query("SELECT e FROM Estudiante e JOIN e.usuario u WHERE e.grado = ?1 AND e.seccion = ?2 ORDER BY u.apellidos ASC, u.nombres ASC")
    List<Estudiante> findByGradoAndSeccionOrderByApellidosAndNombres(Short grado, String seccion);
}

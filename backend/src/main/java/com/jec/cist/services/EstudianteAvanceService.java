package com.jec.cist.services;

import com.jec.cist.dtos.EstudianteAvanceRespuestaDto;
import com.jec.cist.dtos.EstudianteAvanceRevisionDto;
import com.jec.cist.models.Curso;
import com.jec.cist.models.Estudiante;
import com.jec.cist.models.EstudianteAvance;
import com.jec.cist.models.Usuario;
import com.jec.cist.repositories.CursoRepository;
import com.jec.cist.repositories.EstudianteAvanceRepository;
import com.jec.cist.repositories.EstudianteRepository;
import com.jec.cist.repositories.CursoEvaluacionRepository;
import com.jec.cist.models.CursoEvaluacion;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class EstudianteAvanceService {

    private final EstudianteAvanceRepository estudianteAvanceRepository;
    private final CursoRepository cursoRepository;
    private final EstudianteRepository estudianteRepository;
    private final CursoEvaluacionRepository cursoEvaluacionRepository;

    @Value("${app.upload.avances.dir}")
    private String uploadDir;

    public EstudianteAvanceService(
            EstudianteAvanceRepository estudianteAvanceRepository,
            CursoRepository cursoRepository,
            EstudianteRepository estudianteRepository,
            CursoEvaluacionRepository cursoEvaluacionRepository) {
        this.estudianteAvanceRepository = estudianteAvanceRepository;
        this.cursoRepository = cursoRepository;
        this.estudianteRepository = estudianteRepository;
        this.cursoEvaluacionRepository = cursoEvaluacionRepository;
    }

    @Transactional
    public EstudianteAvanceRespuestaDto subirAvance(UUID idCurso, UUID idEstudiante, MultipartFile file, String titulo, String descripcion, UUID idEvaluacion) throws IOException {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        Estudiante estudiante = estudianteRepository.findById(idEstudiante)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado con ID: " + idEstudiante));

        CursoEvaluacion evaluacion = null;
        if (idEvaluacion != null) {
            evaluacion = cursoEvaluacionRepository.findById(idEvaluacion)
                    .orElseThrow(() -> new IllegalArgumentException("Evaluación no encontrada con ID: " + idEvaluacion));
            
            // Validar fecha límite
            if (!Boolean.TRUE.equals(evaluacion.getPermitirEntregasTardias()) && 
                LocalDateTime.now().isAfter(evaluacion.getFechaLimite())) {
                throw new IllegalStateException("La fecha límite para esta evaluación ha expirado y no se permiten entregas tardías.");
            }
        }

        // Asegurar que el directorio destino existe
        File uploadDirFile = new File(uploadDir);
        if (!uploadDirFile.exists()) {
            uploadDirFile.mkdirs();
        }

        // Generar un nombre único para evitar colisiones
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String storedFilename = UUID.randomUUID().toString() + extension;
        Path targetPath = Paths.get(uploadDir).resolve(storedFilename);

        // Copiar el archivo al disco del servidor
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Crear la entidad
        EstudianteAvance avance = new EstudianteAvance(
                curso,
                evaluacion,
                estudiante,
                titulo,
                descripcion,
                originalFilename,
                targetPath.toString(),
                file.getSize(),
                file.getContentType()
        );

        avance = estudianteAvanceRepository.save(avance);
        return mapearAAvanceRespuesta(avance);
    }

    @Transactional(readOnly = true)
    public List<EstudianteAvanceRespuestaDto> listarAvancesPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return estudianteAvanceRepository.findByCursoIdCursoOrderByFechaSubidaDesc(idCurso).stream()
                .map(this::mapearAAvanceRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EstudianteAvanceRespuestaDto> listarAvancesPorCursoYEstudiante(UUID idCurso, UUID idEstudiante) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        if (!estudianteRepository.existsById(idEstudiante)) {
            throw new IllegalArgumentException("Estudiante no encontrado con ID: " + idEstudiante);
        }
        return estudianteAvanceRepository.findByCursoIdCursoAndEstudianteIdUsuarioOrderByFechaSubidaDesc(idCurso, idEstudiante).stream()
                .map(this::mapearAAvanceRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Resource descargarAvance(UUID idAvance) throws MalformedURLException {
        EstudianteAvance avance = estudianteAvanceRepository.findById(idAvance)
                .orElseThrow(() -> new IllegalArgumentException("Avance no encontrado con ID: " + idAvance));

        Path filePath = Paths.get(avance.getRutaArchivo());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("No se pudo leer el archivo físico de avances en la ruta: " + avance.getRutaArchivo());
        }
    }

    @Transactional(readOnly = true)
    public EstudianteAvance obtenerAvancePorId(UUID idAvance) {
        return estudianteAvanceRepository.findById(idAvance)
                .orElseThrow(() -> new IllegalArgumentException("Avance no encontrado con ID: " + idAvance));
    }

    @Transactional
    public EstudianteAvanceRespuestaDto revisarAvance(UUID idAvance, EstudianteAvanceRevisionDto dto) {
        EstudianteAvance avance = estudianteAvanceRepository.findById(idAvance)
                .orElseThrow(() -> new IllegalArgumentException("Avance no encontrado con ID: " + idAvance));

        String estadoNormalizado = dto.getEstado().trim().toUpperCase();
        if (!estadoNormalizado.equals("PENDIENTE") && !estadoNormalizado.equals("REVISADO") && !estadoNormalizado.equals("CORREGIR")) {
            throw new IllegalArgumentException("Estado de revisión no válido. Debe ser PENDIENTE, REVISADO o CORREGIR.");
        }

        avance.setEstado(estadoNormalizado);
        avance.setComentarioDocente(dto.getComentarioDocente() != null ? dto.getComentarioDocente().trim() : null);

        avance = estudianteAvanceRepository.save(avance);
        return mapearAAvanceRespuesta(avance);
    }

    @Transactional
    public void eliminarAvance(UUID idAvance) {
        EstudianteAvance avance = estudianteAvanceRepository.findById(idAvance)
                .orElseThrow(() -> new IllegalArgumentException("Avance no encontrado con ID: " + idAvance));

        // Eliminar archivo físico
        try {
            File physicalFile = new File(avance.getRutaArchivo());
            if (physicalFile.exists()) {
                physicalFile.delete();
            }
        } catch (Exception e) {
            // Ignorar fallos de borrado físico
        }

        estudianteAvanceRepository.delete(avance);
    }

    private EstudianteAvanceRespuestaDto mapearAAvanceRespuesta(EstudianteAvance m) {
        String nombreEstudiante = "";
        if (m.getEstudiante() != null && m.getEstudiante().getUsuario() != null) {
            Usuario u = m.getEstudiante().getUsuario();
            nombreEstudiante = u.getNombres() + " " + u.getApellidos();
        }

        String nombreCurso = "";
        if (m.getCurso() != null) {
            nombreCurso = m.getCurso().getNombre();
        }

        UUID idEvaluacion = null;
        if (m.getEvaluacion() != null) {
            idEvaluacion = m.getEvaluacion().getIdEvaluacion();
        }

        return new EstudianteAvanceRespuestaDto(
                m.getIdAvance(),
                m.getCurso().getIdCurso(),
                idEvaluacion,
                nombreCurso,
                m.getEstudiante().getIdUsuario(),
                nombreEstudiante,
                m.getTitulo(),
                m.getDescripcion(),
                m.getNombreArchivo(),
                m.getTamanoArchivo(),
                m.getTipoContenido(),
                m.getFechaSubida(),
                m.getEstado(),
                m.getComentarioDocente()
        );
    }
}

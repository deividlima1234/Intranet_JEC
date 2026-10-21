package com.jec.cist.services;

import com.jec.cist.dtos.*;
import com.jec.cist.models.*;
import com.jec.cist.repositories.*;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CursoService {

    private final CursoRepository cursoRepository;
    private final CursoMaterialRepository cursoMaterialRepository;
    private final CursoNotaRepository cursoNotaRepository;
    private final PersonalInstitucionalRepository personalInstitucionalRepository;
    private final EstudianteRepository estudianteRepository;
    
    private final AnuncioRepository anuncioRepository;
    private final DebateRepository debateRepository;
    private final DebateRespuestaRepository debateRespuestaRepository;
    private final MensajeDirectoRepository mensajeDirectoRepository;
    private final CursoGrupoRepository cursoGrupoRepository;
    private final CalendarioEventoRepository calendarioEventoRepository;
    private final EstudianteLogroRepository estudianteLogroRepository;
    private final EstudianteAvanceRepository estudianteAvanceRepository;
    private final CuestionarioPersonalizadoRepository cuestionarioPersonalizadoRepository;
    private final CursoEvaluacionRepository cursoEvaluacionRepository;
    private final CursoNotaDetalleRepository cursoNotaDetalleRepository;
    private final EvaluacionCriterioRepository evaluacionCriterioRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    public CursoService(
            CursoRepository cursoRepository,
            CursoMaterialRepository cursoMaterialRepository,
            CursoNotaRepository cursoNotaRepository,
            PersonalInstitucionalRepository personalInstitucionalRepository,
            EstudianteRepository estudianteRepository,
            AnuncioRepository anuncioRepository,
            DebateRepository debateRepository,
            DebateRespuestaRepository debateRespuestaRepository,
            MensajeDirectoRepository mensajeDirectoRepository,
            CursoGrupoRepository cursoGrupoRepository,
            CalendarioEventoRepository calendarioEventoRepository,
            EstudianteLogroRepository estudianteLogroRepository,
            EstudianteAvanceRepository estudianteAvanceRepository,
            CuestionarioPersonalizadoRepository cuestionarioPersonalizadoRepository,
            CursoEvaluacionRepository cursoEvaluacionRepository,
            CursoNotaDetalleRepository cursoNotaDetalleRepository,
            EvaluacionCriterioRepository evaluacionCriterioRepository) {
        this.cursoRepository = cursoRepository;
        this.cursoMaterialRepository = cursoMaterialRepository;
        this.cursoNotaRepository = cursoNotaRepository;
        this.personalInstitucionalRepository = personalInstitucionalRepository;
        this.estudianteRepository = estudianteRepository;
        this.anuncioRepository = anuncioRepository;
        this.debateRepository = debateRepository;
        this.debateRespuestaRepository = debateRespuestaRepository;
        this.mensajeDirectoRepository = mensajeDirectoRepository;
        this.cursoGrupoRepository = cursoGrupoRepository;
        this.calendarioEventoRepository = calendarioEventoRepository;
        this.estudianteLogroRepository = estudianteLogroRepository;
        this.estudianteAvanceRepository = estudianteAvanceRepository;
        this.cuestionarioPersonalizadoRepository = cuestionarioPersonalizadoRepository;
        this.cursoEvaluacionRepository = cursoEvaluacionRepository;
        this.cursoNotaDetalleRepository = cursoNotaDetalleRepository;
        this.evaluacionCriterioRepository = evaluacionCriterioRepository;
    }

    @Transactional
    public CursoRespuestaDto crearCurso(CursoRegistroDto dto) {
        if (cursoRepository.existsByNrc(dto.getNrc())) {
            throw new IllegalArgumentException("Ya existe un curso registrado con el NRC " + dto.getNrc());
        }

        PersonalInstitucional docente = personalInstitucionalRepository.findById(dto.getIdDocente())
                .orElseThrow(() -> new IllegalArgumentException("Docente no encontrado con el ID proporcionado"));

        Curso curso = new Curso(
                dto.getNrc(),
                dto.getNombre(),
                dto.getGrado(),
                dto.getSeccion().trim().toUpperCase(),
                docente
        );

        curso = cursoRepository.save(curso);
        return mapearACursoRespuesta(curso);
    }

    @Transactional(readOnly = true)
    public List<CursoRespuestaDto> listarCursos() {
        return cursoRepository.findAll().stream()
                .map(this::mapearACursoRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CursoRespuestaDto> listarCursosPorDocente(UUID idDocente) {
        return cursoRepository.findByDocenteIdUsuario(idDocente).stream()
                .map(this::mapearACursoRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CursoRespuestaDto> listarCursosPorEstudiante(UUID idEstudiante) {
        Estudiante estudiante = estudianteRepository.findById(idEstudiante)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado con ID: " + idEstudiante));

        return cursoRepository.findByGradoAndSeccion(estudiante.getGrado(), estudiante.getSeccion()).stream()
                .map(this::mapearACursoRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UsuarioRespuestaDto> listarEstudiantesPorCurso(UUID idCurso) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        return estudianteRepository.findByGradoAndSeccionOrderByNumeroOrdenAsc(curso.getGrado(), curso.getSeccion()).stream()
                .map(e -> {
                    UsuarioRespuestaDto res = new UsuarioRespuestaDto();
                    Usuario u = e.getUsuario();
                    res.setIdUsuario(u.getIdUsuario());
                    res.setDni(u.getDni());
                    res.setNombres(u.getNombres());
                    res.setApellidos(u.getApellidos());
                    res.setRol(u.getRol());
                    res.setQrToken(u.getQrToken());
                    res.setEstado(u.getEstado().name());
                    res.setGrado(e.getGrado());
                    res.setSeccion(e.getSeccion());
                    res.setNumeroOrden(e.getNumeroOrden());
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void eliminarCurso(UUID idCurso) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));
        
        // 1. Eliminar materiales físicos y lógicos asociados
        List<CursoMaterial> materiales = cursoMaterialRepository.findByCursoIdCursoOrderByFechaSubidaDesc(idCurso);
        for (CursoMaterial m : materiales) {
            try {
                File physicalFile = new File(m.getRutaArchivo());
                if (physicalFile.exists()) {
                    physicalFile.delete();
                }
            } catch (Exception e) {
                // Silently log or ignore physical delete errors to complete DB cleanup
            }
        }
        cursoMaterialRepository.deleteAll(materiales);
        
        // 2. Eliminar notas asociadas
        List<CursoNota> notas = cursoNotaRepository.findByCursoIdCurso(idCurso);
        cursoNotaRepository.deleteAll(notas);

        // 3. Eliminar anuncios
        List<Anuncio> anuncios = anuncioRepository.findByCursoIdCursoOrderByFechaPublicacionDesc(idCurso);
        anuncioRepository.deleteAll(anuncios);

        // 4. Eliminar debates y sus respuestas asociadas
        List<Debate> debates = debateRepository.findByCursoIdCursoOrderByFechaCreacionDesc(idCurso);
        for (Debate d : debates) {
            List<DebateRespuesta> respuestas = debateRespuestaRepository.findByDebateIdDebateOrderByFechaCreacionAsc(d.getIdDebate());
            debateRespuestaRepository.deleteAll(respuestas);
        }
        debateRepository.deleteAll(debates);

        // 5. Eliminar mensajes directos asociados al curso
        List<MensajeDirecto> mensajes = mensajeDirectoRepository.findByCursoIdCurso(idCurso);
        mensajeDirectoRepository.deleteAll(mensajes);

        // 6. Eliminar grupos del curso
        List<CursoGrupo> grupos = cursoGrupoRepository.findByCursoIdCurso(idCurso);
        cursoGrupoRepository.deleteAll(grupos);

        // 7. Eliminar eventos de calendario
        List<CalendarioEvento> eventos = calendarioEventoRepository.findByCursoIdCursoOrderByFechaHoraAsc(idCurso);
        calendarioEventoRepository.deleteAll(eventos);

        // 8. Eliminar logros de estudiantes del curso
        List<EstudianteLogro> logros = estudianteLogroRepository.findByCursoIdCurso(idCurso);
        estudianteLogroRepository.deleteAll(logros);

        // 8b. Eliminar avances de clase de estudiantes (físicos y lógicos)
        List<EstudianteAvance> avances = estudianteAvanceRepository.findByCursoIdCursoOrderByFechaSubidaDesc(idCurso);
        for (EstudianteAvance av : avances) {
            try {
                File physicalFile = new File(av.getRutaArchivo());
                if (physicalFile.exists()) {
                    physicalFile.delete();
                }
            } catch (Exception e) {
                // Ignore physical delete errors
            }
        }
        estudianteAvanceRepository.deleteAll(avances);

        // 8c. Desvincular cuestionarios personalizados asociados al curso
        List<CuestionarioPersonalizado> cuestionarios = cuestionarioPersonalizadoRepository.findByCursoIdCursoOrderByFechaCreacionDesc(idCurso);
        for (CuestionarioPersonalizado cp : cuestionarios) {
            cp.setCurso(null);
        }
        cuestionarioPersonalizadoRepository.saveAll(cuestionarios);

        // 9. Finalmente, eliminar el curso
        cursoRepository.delete(curso);
    }

    @Transactional
    public void generarCursosDePrueba() {
        List<PersonalInstitucional> docentes = personalInstitucionalRepository.findAll().stream()
                .filter(p -> p.getUsuario() != null && com.jec.cist.models.Rol.DOCENTE == p.getUsuario().getRol())
                .collect(Collectors.toList());

        for (PersonalInstitucional docente : docentes) {
            String nrc = "PRUEBA-" + docente.getIdUsuario().toString().substring(0, 5).toUpperCase();
            if (!cursoRepository.existsByNrc(nrc)) {
                Curso curso = new Curso(
                        nrc,
                        "CURSO DE PRUEBA TALLER",
                        (short) 1,
                        "PRUEBA",
                        docente
                );
                curso.setEsPrueba(true);
                curso.setPruebaHabilitada(false); // Deshabilitado por defecto
                cursoRepository.save(curso);
            }
        }
    }

    @Transactional
    public CursoRespuestaDto togglePruebaHabilitada(UUID idCurso) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));
        
        if (!curso.isEsPrueba()) {
            throw new IllegalArgumentException("Solo se puede habilitar o deshabilitar cursos que son de prueba.");
        }
        
        curso.setPruebaHabilitada(!curso.isPruebaHabilitada());
        curso = cursoRepository.save(curso);
        return mapearACursoRespuesta(curso);
    }

    // --- LOGICA DE MATERIALES ---

    @Transactional
    public CursoMaterialRespuestaDto subirMaterial(UUID idCurso, MultipartFile file, String titulo, String descripcion, String visibilidad, List<UUID> destinatariosIds) throws IOException {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

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
        CursoMaterial material = new CursoMaterial(
                curso,
                titulo,
                descripcion,
                originalFilename,
                targetPath.toString(),
                file.getSize(),
                file.getContentType(),
                visibilidad,
                destinatariosIds
        );

        material = cursoMaterialRepository.save(material);
        return mapearAMaterialRespuesta(material);
    }

    @Transactional(readOnly = true)
    public List<CursoMaterialRespuestaDto> listarMaterialesPorCurso(UUID idCurso, UUID idEstudiante) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return cursoMaterialRepository.findByCursoIdCursoOrderByFechaSubidaDesc(idCurso).stream()
                .filter(m -> {
                    if (idEstudiante == null) return true; // Si no hay idEstudiante, mostrar todos
                    if ("TODOS".equalsIgnoreCase(m.getVisibilidad())) return true;
                    if ("SELECCIONADOS".equalsIgnoreCase(m.getVisibilidad())) {
                        return m.getDestinatariosIds() != null && m.getDestinatariosIds().contains(idEstudiante);
                    }
                    return true;
                })
                .map(this::mapearAMaterialRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Resource descargarMaterial(UUID idMaterial) throws MalformedURLException {
        CursoMaterial material = cursoMaterialRepository.findById(idMaterial)
                .orElseThrow(() -> new IllegalArgumentException("Material no encontrado con ID: " + idMaterial));

        Path filePath = Paths.get(material.getRutaArchivo());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("No se pudo leer el archivo físico de materiales en la ruta: " + material.getRutaArchivo());
        }
    }

    @Transactional(readOnly = true)
    public CursoMaterial obtenerMaterialPorId(UUID idMaterial) {
        return cursoMaterialRepository.findById(idMaterial)
                .orElseThrow(() -> new IllegalArgumentException("Material no encontrado con ID: " + idMaterial));
    }

    @Transactional
    public void eliminarMaterial(UUID idMaterial) {
        CursoMaterial material = cursoMaterialRepository.findById(idMaterial)
                .orElseThrow(() -> new IllegalArgumentException("Material no encontrado con ID: " + idMaterial));

        // Eliminar archivo físico
        try {
            File physicalFile = new File(material.getRutaArchivo());
            if (physicalFile.exists()) {
                physicalFile.delete();
            }
        } catch (Exception e) {
            // Ignorar fallos de borrado físico
        }

        cursoMaterialRepository.delete(material);
    }

    // --- LOGICA DE NOTAS ---

    @Transactional(readOnly = true)
    public List<NotaRespuestaDto> listarNotasPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return cursoNotaRepository.findByCursoIdCurso(idCurso).stream()
                .map(this::mapearANotaRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotaRespuestaDto> listarNotasPorEstudiante(UUID idEstudiante) {
        if (!estudianteRepository.existsById(idEstudiante)) {
            throw new IllegalArgumentException("Estudiante no encontrado con ID: " + idEstudiante);
        }
        return cursoNotaRepository.findByEstudianteIdUsuario(idEstudiante).stream()
                .map(this::mapearANotaRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<NotaRespuestaDto> guardarNotasEnLote(UUID idCurso, List<NotaRegistroDto> dtos) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        List<NotaRespuestaDto> respuestas = new ArrayList<>();

        for (NotaRegistroDto dto : dtos) {
            Estudiante estudiante = estudianteRepository.findById(dto.getIdEstudiante())
                    .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado con ID: " + dto.getIdEstudiante()));

            // Buscar si ya existe una nota para este estudiante, curso y criterio
            Optional<CursoNota> notaExistente = cursoNotaRepository
                    .findByCursoIdCursoAndEstudianteIdUsuarioAndCriterio(idCurso, dto.getIdEstudiante(), dto.getCriterio().trim());

            CursoNota nota;
            if (notaExistente.isPresent()) {
                nota = notaExistente.get();
                nota.setCalificacion(dto.getCalificacion().trim().toUpperCase());
                nota.setFechaRegistro(LocalDateTime.now());
            } else {
                nota = new CursoNota(
                        estudiante,
                        curso,
                        dto.getCriterio().trim(),
                        dto.getCalificacion().trim().toUpperCase()
                );
            }

            nota = cursoNotaRepository.save(nota);
            respuestas.add(mapearANotaRespuesta(nota));
        }

        return respuestas;
    }

    @Transactional
    public NotaRespuestaDto guardarNotaEvaluacion(UUID idCurso, NotaRegistroEvaluacionDto dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        Estudiante estudiante = estudianteRepository.findById(dto.getIdEstudiante())
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado con ID: " + dto.getIdEstudiante()));

        CursoEvaluacion evaluacion = cursoEvaluacionRepository.findById(dto.getIdEvaluacion())
                .orElseThrow(() -> new IllegalArgumentException("Evaluación no encontrada con ID: " + dto.getIdEvaluacion()));

        // Buscar nota existente para esta evaluación y estudiante
        Optional<CursoNota> notaExistente = cursoNotaRepository.findByCursoIdCursoAndEstudianteIdUsuarioAndEvaluacionIdEvaluacion(
                idCurso, dto.getIdEstudiante(), dto.getIdEvaluacion());

        CursoNota nota;
        if (notaExistente.isPresent()) {
            nota = notaExistente.get();
            // Eliminar los detalles anteriores
            List<CursoNotaDetalle> detallesAntiguos = cursoNotaDetalleRepository.findByNotaIdNota(nota.getIdNota());
            cursoNotaDetalleRepository.deleteAll(detallesAntiguos);
        } else {
            nota = new CursoNota();
            nota.setCurso(curso);
            nota.setEstudiante(estudiante);
            nota.setEvaluacion(evaluacion);
            nota.setFechaRegistro(LocalDateTime.now());
        }

        int puntajeTotal = 0;
        List<CursoNotaDetalle> nuevosDetalles = new ArrayList<>();

        for (NotaDetalleDto detDto : dto.getDetalles()) {
            EvaluacionCriterio criterio = evaluacionCriterioRepository.findById(detDto.getIdCriterio())
                    .orElseThrow(() -> new IllegalArgumentException("Criterio no encontrado con ID: " + detDto.getIdCriterio()));
            
            CursoNotaDetalle detalle = new CursoNotaDetalle(nota, criterio, detDto.getPuntajeAsignado());
            nuevosDetalles.add(detalle);
            puntajeTotal += detDto.getPuntajeAsignado();
        }

        // Convertir puntajeTotal a AD, A, B, C
        String calificacionLetra = calcularLetra(puntajeTotal);
        nota.setPuntajeTotal(puntajeTotal);
        nota.setCalificacion(calificacionLetra);
        nota.setCriterio(evaluacion.getTitulo()); // Para compatibilidad
        
        nota = cursoNotaRepository.save(nota);
        cursoNotaDetalleRepository.saveAll(nuevosDetalles);

        return mapearANotaRespuesta(nota);
    }

    private String calcularLetra(int puntajeTotal) {
        if (puntajeTotal >= 18) return "AD";
        if (puntajeTotal >= 14) return "A";
        if (puntajeTotal >= 11) return "B";
        return "C";
    }

    // --- MAPPERS ---

    private CursoRespuestaDto mapearACursoRespuesta(Curso curso) {
        String nombreDocente = "";
        UUID idDocente = null;
        if (curso.getDocente() != null) {
            idDocente = curso.getDocente().getIdUsuario();
            Usuario userDocente = curso.getDocente().getUsuario();
            if (userDocente != null) {
                nombreDocente = userDocente.getNombres() + " " + userDocente.getApellidos();
            }
        }

        return new CursoRespuestaDto(
                curso.getIdCurso(),
                curso.getNrc(),
                curso.getNombre(),
                curso.getGrado(),
                curso.getSeccion(),
                idDocente,
                nombreDocente,
                curso.isEsPrueba(),
                curso.isPruebaHabilitada()
        );
    }

    private CursoMaterialRespuestaDto mapearAMaterialRespuesta(CursoMaterial m) {
        return new CursoMaterialRespuestaDto(
                m.getIdMaterial(),
                m.getCurso().getIdCurso(),
                m.getTitulo(),
                m.getDescripcion(),
                m.getNombreArchivo(),
                m.getTamanoArchivo(),
                m.getTipoContenido(),
                m.getFechaSubida(),
                m.getVisibilidad(),
                m.getDestinatariosIds()
        );
    }

    private NotaRespuestaDto mapearANotaRespuesta(CursoNota n) {
        String nombreEstudiante = "";
        if (n.getEstudiante() != null && n.getEstudiante().getUsuario() != null) {
            nombreEstudiante = n.getEstudiante().getUsuario().getNombres() + " " + n.getEstudiante().getUsuario().getApellidos();
        }

        String nombreCurso = "";
        if (n.getCurso() != null) {
            nombreCurso = n.getCurso().getNombre();
        }

        return new NotaRespuestaDto(
                n.getIdNota(),
                n.getEstudiante().getIdUsuario(),
                nombreEstudiante,
                n.getCurso().getIdCurso(),
                nombreCurso,
                n.getCriterio(),
                n.getCalificacion(),
                n.getFechaRegistro()
        );
    }
}

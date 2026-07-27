package com.jec.cist.services;

import com.jec.cist.dtos.*;
import com.jec.cist.models.*;
import com.jec.cist.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AulaVirtualService {

    private final CursoRepository cursoRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final AnuncioRepository anuncioRepository;
    private final CalendarioEventoRepository calendarioEventoRepository;
    private final DebateRepository debateRepository;
    private final DebateRespuestaRepository debateRespuestaRepository;
    private final MensajeDirectoRepository mensajeDirectoRepository;
    private final CursoGrupoRepository cursoGrupoRepository;
    private final EstudianteLogroRepository estudianteLogroRepository;

    public AulaVirtualService(
            CursoRepository cursoRepository,
            UsuarioRepository usuarioRepository,
            EstudianteRepository estudianteRepository,
            AnuncioRepository anuncioRepository,
            CalendarioEventoRepository calendarioEventoRepository,
            DebateRepository debateRepository,
            DebateRespuestaRepository debateRespuestaRepository,
            MensajeDirectoRepository mensajeDirectoRepository,
            CursoGrupoRepository cursoGrupoRepository,
            EstudianteLogroRepository estudianteLogroRepository) {
        this.cursoRepository = cursoRepository;
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
        this.anuncioRepository = anuncioRepository;
        this.calendarioEventoRepository = calendarioEventoRepository;
        this.debateRepository = debateRepository;
        this.debateRespuestaRepository = debateRespuestaRepository;
        this.mensajeDirectoRepository = mensajeDirectoRepository;
        this.cursoGrupoRepository = cursoGrupoRepository;
        this.estudianteLogroRepository = estudianteLogroRepository;
    }

    // --- ANUNCIOS ---

    @Transactional(readOnly = true)
    public List<AnuncioRespuestaDto> listarAnunciosPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return anuncioRepository.findByCursoIdCursoOrderByFechaPublicacionDesc(idCurso).stream()
                .map(this::mapearAAnuncioRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnuncioRespuestaDto crearAnuncio(UUID idCurso, AnuncioRequestDto dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        Usuario autor = usuarioRepository.findById(dto.getIdAutor())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autor no encontrado con ID: " + dto.getIdAutor()));

        Anuncio anuncio = new Anuncio(curso, dto.getTitulo(), dto.getContenido(), autor);
        anuncio = anuncioRepository.save(anuncio);
        return mapearAAnuncioRespuesta(anuncio);
    }

    // --- CALENDARIO EVENTOS ---

    @Transactional(readOnly = true)
    public List<CalendarioEventoRespuestaDto> listarEventosPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return calendarioEventoRepository.findByCursoIdCursoOrderByFechaHoraAsc(idCurso).stream()
                .map(this::mapearAEventoRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public CalendarioEventoRespuestaDto crearEvento(UUID idCurso, CalendarioEventoRequestDto dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        CalendarioEvento evento = new CalendarioEvento(curso, dto.getTitulo(), dto.getDescripcion(), dto.getFechaHora());
        evento = calendarioEventoRepository.save(evento);
        return mapearAEventoRespuesta(evento);
    }

    // --- DEBATES / FOROS ---

    @Transactional(readOnly = true)
    public List<DebateRespuestaDto> listarDebatesPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return debateRepository.findByCursoIdCursoOrderByFechaCreacionDesc(idCurso).stream()
                .map(this::mapearADebateRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public DebateRespuestaDto crearDebate(UUID idCurso, DebateRequestDto dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        Usuario autor = usuarioRepository.findById(dto.getIdAutor())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autor no encontrado con ID: " + dto.getIdAutor()));

        if (autor.getRol() == Rol.ESTUDIANTE) {
            throw new IllegalArgumentException("Solo los docentes pueden iniciar nuevos debates.");
        }

        Debate debate = new Debate(curso, dto.getTitulo(), dto.getDescripcion(), autor);
        debate = debateRepository.save(debate);
        return mapearADebateRespuesta(debate);
    }

    @Transactional(readOnly = true)
    public List<DebateComentarioRespuestaDto> listarRespuestasPorDebate(UUID idDebate) {
        if (!debateRepository.existsById(idDebate)) {
            throw new IllegalArgumentException("Debate no encontrado con ID: " + idDebate);
        }
        return debateRespuestaRepository.findByDebateIdDebateOrderByFechaCreacionAsc(idDebate).stream()
                .map(this::mapearAComentarioRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public DebateComentarioRespuestaDto crearRespuesta(UUID idDebate, DebateRespuestaRequestDto dto) {
        Debate debate = debateRepository.findById(idDebate)
                .orElseThrow(() -> new IllegalArgumentException("Debate no encontrado con ID: " + idDebate));

        Usuario autor = usuarioRepository.findById(dto.getIdAutor())
                .orElseThrow(() -> new IllegalArgumentException("Usuario autor no encontrado con ID: " + dto.getIdAutor()));

        DebateRespuesta respuesta = new DebateRespuesta(debate, dto.getContenido(), autor);
        respuesta = debateRespuestaRepository.save(respuesta);
        return mapearAComentarioRespuesta(respuesta);
    }

    // --- MENSAJES DIRECTOS ---

    @Transactional(readOnly = true)
    public List<ContactoDto> listarContactosMensajeria(UUID idCurso, UUID idUsuarioActual) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        List<ContactoDto> contactos = new ArrayList<>();

        // 1. Agregar Docente si no es el usuario actual
        if (curso.getDocente() != null && curso.getDocente().getUsuario() != null) {
            Usuario docente = curso.getDocente().getUsuario();
            if (!docente.getIdUsuario().equals(idUsuarioActual)) {
                List<MensajeDirecto> unread = mensajeDirectoRepository
                        .findByCursoIdCursoAndReceptorIdUsuarioAndLeidoFalse(idCurso, idUsuarioActual);
                int unreadCount = (int) unread.stream()
                        .filter(m -> m.getEmisor().getIdUsuario().equals(docente.getIdUsuario()))
                        .count();
                contactos.add(new ContactoDto(docente.getIdUsuario(), docente.getNombres(), docente.getApellidos(), docente.getRol().name(), unreadCount));
            }
        }

        // 2. Agregar Estudiantes
        List<Estudiante> estudiantes = estudianteRepository.findByGradoAndSeccionOrderByNumeroOrdenAsc(curso.getGrado(), curso.getSeccion());
        for (Estudiante est : estudiantes) {
            Usuario u = est.getUsuario();
            if (u != null && !u.getIdUsuario().equals(idUsuarioActual)) {
                List<MensajeDirecto> unread = mensajeDirectoRepository
                        .findByCursoIdCursoAndReceptorIdUsuarioAndLeidoFalse(idCurso, idUsuarioActual);
                int unreadCount = (int) unread.stream()
                        .filter(m -> m.getEmisor().getIdUsuario().equals(u.getIdUsuario()))
                        .count();
                contactos.add(new ContactoDto(u.getIdUsuario(), u.getNombres(), u.getApellidos(), u.getRol().name(), unreadCount));
            }
        }

        return contactos;
    }

    @Transactional
    public List<MensajeRespuestaDto> obtenerConversacion(UUID idCurso, UUID idUsuarioActual, UUID idContacto) {
        List<MensajeDirecto> chat = mensajeDirectoRepository.findChatHistory(idCurso, idUsuarioActual, idContacto);

        // Marcar como leídos los mensajes recibidos por el usuario actual
        List<MensajeDirecto> updatedMessages = new ArrayList<>();
        for (MensajeDirecto m : chat) {
            if (m.getReceptor().getIdUsuario().equals(idUsuarioActual) && !m.isLeido()) {
                m.setLeido(true);
                updatedMessages.add(m);
            }
        }
        if (!updatedMessages.isEmpty()) {
            mensajeDirectoRepository.saveAll(updatedMessages);
        }

        return chat.stream()
                .map(this::mapearAMensajeRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public MensajeRespuestaDto enviarMensaje(UUID idCurso, UUID idEmisor, UUID idReceptor, MensajeRequestDto dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        Usuario emisor = usuarioRepository.findById(idEmisor)
                .orElseThrow(() -> new IllegalArgumentException("Emisor no encontrado con ID: " + idEmisor));

        Usuario receptor = usuarioRepository.findById(idReceptor)
                .orElseThrow(() -> new IllegalArgumentException("Receptor no encontrado con ID: " + idReceptor));

        MensajeDirecto msg = new MensajeDirecto(curso, emisor, receptor, dto.getContenido());
        msg = mensajeDirectoRepository.save(msg);
        return mapearAMensajeRespuesta(msg);
    }

    // --- GRUPOS ---

    @Transactional(readOnly = true)
    public List<CursoGrupoRespuestaDto> listarGruposPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return cursoGrupoRepository.findByCursoIdCurso(idCurso).stream()
                .map(this::mapearAGrupoRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public CursoGrupoRespuestaDto crearGrupo(UUID idCurso, CursoGrupoRequestDto dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        CursoGrupo grupo = new CursoGrupo(curso, dto.getNombre().trim());

        if (dto.getIntegrantesIds() != null && !dto.getIntegrantesIds().isEmpty()) {
            List<Usuario> integrantes = usuarioRepository.findAllById(dto.getIntegrantesIds());
            grupo.setIntegrantes(integrantes);
        }

        grupo = cursoGrupoRepository.save(grupo);
        return mapearAGrupoRespuesta(grupo);
    }

    @Transactional
    public List<CursoGrupoRespuestaDto> crearGruposBulk(UUID idCurso, List<CursoGrupoRequestDto> dtos) {
        List<CursoGrupoRespuestaDto> respuestas = new ArrayList<>();
        for (CursoGrupoRequestDto dto : dtos) {
            respuestas.add(crearGrupo(idCurso, dto));
        }
        return respuestas;
    }

    @Transactional
    public void eliminarGrupo(UUID idGrupo) {
        CursoGrupo grupo = cursoGrupoRepository.findById(idGrupo)
                .orElseThrow(() -> new IllegalArgumentException("Grupo no encontrado con ID: " + idGrupo));
        cursoGrupoRepository.delete(grupo);
    }

    @Transactional
    public void eliminarTodosLosGruposPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        List<CursoGrupo> grupos = cursoGrupoRepository.findByCursoIdCurso(idCurso);
        cursoGrupoRepository.deleteAll(grupos);
    }

    // --- LOGROS / INSIGNIAS ---

    @Transactional(readOnly = true)
    public List<EstudianteLogroRespuestaDto> listarLogrosPorCurso(UUID idCurso) {
        if (!cursoRepository.existsById(idCurso)) {
            throw new IllegalArgumentException("Curso no encontrado con ID: " + idCurso);
        }
        return estudianteLogroRepository.findByCursoIdCurso(idCurso).stream()
                .map(this::mapearALogroRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EstudianteLogroRespuestaDto> listarLogrosPorEstudianteYCurso(UUID idCurso, UUID idEstudiante) {
        return estudianteLogroRepository.findByCursoIdCursoAndEstudianteIdUsuario(idCurso, idEstudiante).stream()
                .map(this::mapearALogroRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional
    public EstudianteLogroRespuestaDto otorgarLogro(UUID idCurso, EstudianteLogroRequestDto dto) {
        Curso curso = cursoRepository.findById(idCurso)
                .orElseThrow(() -> new IllegalArgumentException("Curso no encontrado con ID: " + idCurso));

        Usuario estudiante = usuarioRepository.findById(dto.getIdEstudiante())
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado con ID: " + dto.getIdEstudiante()));

        EstudianteLogro logro = new EstudianteLogro(curso, estudiante, dto.getInsignia(), dto.getComentario());
        logro = estudianteLogroRepository.save(logro);
        return mapearALogroRespuesta(logro);
    }

    // --- MAPPERS INTERNOS ---

    private AnuncioRespuestaDto mapearAAnuncioRespuesta(Anuncio a) {
        String nombreAutor = a.getAutor().getNombres() + " " + a.getAutor().getApellidos();
        return new AnuncioRespuestaDto(
                a.getIdAnuncio(),
                a.getCurso().getIdCurso(),
                a.getTitulo(),
                a.getContenido(),
                a.getFechaPublicacion(),
                a.getAutor().getIdUsuario(),
                nombreAutor
        );
    }

    private CalendarioEventoRespuestaDto mapearAEventoRespuesta(CalendarioEvento e) {
        return new CalendarioEventoRespuestaDto(
                e.getIdEvento(),
                e.getCurso().getIdCurso(),
                e.getTitulo(),
                e.getDescripcion(),
                e.getFechaHora()
        );
    }

    private DebateRespuestaDto mapearADebateRespuesta(Debate d) {
        String nombreAutor = d.getAutor().getNombres() + " " + d.getAutor().getApellidos();
        return new DebateRespuestaDto(
                d.getIdDebate(),
                d.getCurso().getIdCurso(),
                d.getTitulo(),
                d.getDescripcion(),
                d.getFechaCreacion(),
                d.getAutor().getIdUsuario(),
                nombreAutor
        );
    }

    private DebateComentarioRespuestaDto mapearAComentarioRespuesta(DebateRespuesta r) {
        String nombreAutor = r.getAutor().getNombres() + " " + r.getAutor().getApellidos();
        return new DebateComentarioRespuestaDto(
                r.getIdRespuesta(),
                r.getDebate().getIdDebate(),
                r.getContenido(),
                r.getFechaCreacion(),
                r.getAutor().getIdUsuario(),
                nombreAutor
        );
    }

    private MensajeRespuestaDto mapearAMensajeRespuesta(MensajeDirecto m) {
        String nombreEmisor = m.getEmisor().getNombres() + " " + m.getEmisor().getApellidos();
        String nombreReceptor = m.getReceptor().getNombres() + " " + m.getReceptor().getApellidos();
        return new MensajeRespuestaDto(
                m.getIdMensaje(),
                m.getCurso().getIdCurso(),
                m.getEmisor().getIdUsuario(),
                nombreEmisor,
                m.getReceptor().getIdUsuario(),
                nombreReceptor,
                m.getContenido(),
                m.getFechaEnvio(),
                m.isLeido()
        );
    }

    private CursoGrupoRespuestaDto mapearAGrupoRespuesta(CursoGrupo g) {
        List<UsuarioRespuestaDto> mappedIntegrantes = g.getIntegrantes().stream()
                .map(u -> {
                    UsuarioRespuestaDto res = new UsuarioRespuestaDto();
                    res.setIdUsuario(u.getIdUsuario());
                    res.setDni(u.getDni());
                    res.setNombres(u.getNombres());
                    res.setApellidos(u.getApellidos());
                    res.setRol(u.getRol());
                    res.setQrToken(u.getQrToken());
                    res.setEstado(u.getEstado().name());
                    
                    // Buscar detalles si es estudiante
                    if (u.getEstudiante() != null) {
                        res.setGrado(u.getEstudiante().getGrado());
                        res.setSeccion(u.getEstudiante().getSeccion());
                        res.setNumeroOrden(u.getEstudiante().getNumeroOrden());
                    }
                    return res;
                })
                .collect(Collectors.toList());

        return new CursoGrupoRespuestaDto(
                g.getIdGrupo(),
                g.getCurso().getIdCurso(),
                g.getNombre(),
                mappedIntegrantes
        );
    }

    private EstudianteLogroRespuestaDto mapearALogroRespuesta(EstudianteLogro l) {
        String nombreEst = l.getEstudiante().getNombres() + " " + l.getEstudiante().getApellidos();
        return new EstudianteLogroRespuestaDto(
                l.getIdLogro(),
                l.getCurso().getIdCurso(),
                l.getEstudiante().getIdUsuario(),
                nombreEst,
                l.getInsignia(),
                l.getComentario(),
                l.getFechaOtorgado()
        );
    }
}

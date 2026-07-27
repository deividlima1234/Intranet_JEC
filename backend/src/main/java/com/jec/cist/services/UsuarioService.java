package com.jec.cist.services;

import com.jec.cist.dtos.CredencialRespuestaDto;
import com.jec.cist.dtos.FalloRegistroDto;
import com.jec.cist.dtos.ImportacionLoteResultadoDto;
import com.jec.cist.dtos.UsuarioRegistroDto;
import com.jec.cist.dtos.UsuarioRespuestaDto;
import com.jec.cist.dtos.CambioContrasenaDto;
import java.util.ArrayList;
import java.util.List;
import com.jec.cist.models.*;
import com.jec.cist.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import java.util.UUID;
import java.io.File;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final PersonalInstitucionalRepository personalInstitucionalRepository;
    private final JwtService jwtService;
    private final QrService qrService;
    private final TransactionTemplate transactionTemplate;

    private final CursoService cursoService;
    private final CursoRepository cursoRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final SesionGrupalRepository sesionGrupalRepository;
    private final SesionDetalleRepository sesionDetalleRepository;
    private final RespuestaEncuestaRepository respuestaEncuestaRepository;
    private final DebateRespuestaRepository debateRespuestaRepository;
    private final DebateRepository debateRepository;
    private final AnuncioRepository anuncioRepository;
    private final MensajeDirectoRepository mensajeDirectoRepository;
    private final CursoGrupoRepository cursoGrupoRepository;
    private final DocumentoManualRepository documentoManualRepository;
    private final CursoNotaRepository cursoNotaRepository;
    private final EstudianteLogroRepository estudianteLogroRepository;
    private final ReservaAulaAipRepository reservaAulaAipRepository;
    private final IncidenciaRepository incidenciaRepository;
    private final CuestionarioPersonalizadoRepository cuestionarioPersonalizadoRepository;
    private final PreguntaJuegoRepository preguntaJuegoRepository;
    private final JuegoSalaRepository juegoSalaRepository;
    private final JuegoSalaJugadorRepository juegoSalaJugadorRepository;
    private final EstudianteProgresoJuegoRepository estudianteProgresoJuegoRepository;

    public UsuarioService(
            UsuarioRepository usuarioRepository,
            EstudianteRepository estudianteRepository,
            PersonalInstitucionalRepository personalInstitucionalRepository,
            JwtService jwtService,
            QrService qrService,
            PlatformTransactionManager transactionManager,
            CursoService cursoService,
            CursoRepository cursoRepository,
            AsistenciaRepository asistenciaRepository,
            SesionGrupalRepository sesionGrupalRepository,
            SesionDetalleRepository sesionDetalleRepository,
            RespuestaEncuestaRepository respuestaEncuestaRepository,
            DebateRespuestaRepository debateRespuestaRepository,
            DebateRepository debateRepository,
            AnuncioRepository anuncioRepository,
            MensajeDirectoRepository mensajeDirectoRepository,
            CursoGrupoRepository cursoGrupoRepository,
            DocumentoManualRepository documentoManualRepository,
            CursoNotaRepository cursoNotaRepository,
            EstudianteLogroRepository estudianteLogroRepository,
            ReservaAulaAipRepository reservaAulaAipRepository,
            IncidenciaRepository incidenciaRepository,
            CuestionarioPersonalizadoRepository cuestionarioPersonalizadoRepository,
            PreguntaJuegoRepository preguntaJuegoRepository,
            JuegoSalaRepository juegoSalaRepository,
            JuegoSalaJugadorRepository juegoSalaJugadorRepository,
            EstudianteProgresoJuegoRepository estudianteProgresoJuegoRepository) {
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
        this.personalInstitucionalRepository = personalInstitucionalRepository;
        this.jwtService = jwtService;
        this.qrService = qrService;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.cursoService = cursoService;
        this.cursoRepository = cursoRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.sesionGrupalRepository = sesionGrupalRepository;
        this.sesionDetalleRepository = sesionDetalleRepository;
        this.respuestaEncuestaRepository = respuestaEncuestaRepository;
        this.debateRespuestaRepository = debateRespuestaRepository;
        this.debateRepository = debateRepository;
        this.anuncioRepository = anuncioRepository;
        this.mensajeDirectoRepository = mensajeDirectoRepository;
        this.cursoGrupoRepository = cursoGrupoRepository;
        this.documentoManualRepository = documentoManualRepository;
        this.cursoNotaRepository = cursoNotaRepository;
        this.estudianteLogroRepository = estudianteLogroRepository;
        this.reservaAulaAipRepository = reservaAulaAipRepository;
        this.incidenciaRepository = incidenciaRepository;
        this.cuestionarioPersonalizadoRepository = cuestionarioPersonalizadoRepository;
        this.preguntaJuegoRepository = preguntaJuegoRepository;
        this.juegoSalaRepository = juegoSalaRepository;
        this.juegoSalaJugadorRepository = juegoSalaJugadorRepository;
        this.estudianteProgresoJuegoRepository = estudianteProgresoJuegoRepository;
    }

    @Transactional
    public UsuarioRespuestaDto registrarUsuario(UsuarioRegistroDto dto) {
        if (usuarioRepository.existsByDni(dto.getDni())) {
            throw new IllegalArgumentException("Ya existe un usuario con el DNI " + dto.getDni());
        }

        // 1. Crear el usuario con un token provisional para dejar que JPA autogenere el UUID
        Usuario usuario = new Usuario();
        usuario.setDni(dto.getDni());
        usuario.setNombres(dto.getNombres());
        usuario.setApellidos(dto.getApellidos());
        usuario.setRol(dto.getRol());
        usuario.setQrToken("TEMP-" + dto.getDni());

        usuario = usuarioRepository.saveAndFlush(usuario);

        // 2. Generar el token corto real basado en DNI y firma HMAC
        String qrTokenReal = jwtService.generateUserShortToken(usuario.getDni());
        usuario.setQrToken(qrTokenReal);
        usuario = usuarioRepository.save(usuario);

        // 2. Crear perfiles específicos
        if (dto.getRol() == Rol.ESTUDIANTE) {
            if (dto.getGrado() == null || dto.getSeccion() == null) {
                throw new IllegalArgumentException("Para rol ESTUDIANTE, grado y seccion son requeridos");
            }
            String seccionLimpia = dto.getSeccion().trim();
            if (seccionLimpia.isEmpty()) {
                seccionLimpia = "A";
            } else {
                seccionLimpia = seccionLimpia.toUpperCase();
            }
            Estudiante estudiante = new Estudiante(usuario, dto.getGrado(), seccionLimpia, (short) 1);
            estudianteRepository.save(estudiante);
            usuario.setEstudiante(estudiante);
            
            // Recalcular orden para la sección
            reasignarNumerosOrden(dto.getGrado(), seccionLimpia);
        } else {
            if (dto.getCargo() == null) {
                throw new IllegalArgumentException("Para personal institucional, el cargo es requerido");
            }
            PersonalInstitucional personal = new PersonalInstitucional(usuario, dto.getCargo(), dto.getAreaCurricular());
            personalInstitucionalRepository.save(personal);
            usuario.setPersonalInstitucional(personal);
        }

        return mapearAUsuarioRespuesta(usuario);
    }

    public String getUsuarioPasswordEsperada(Usuario usuario) {
        if (usuario.getContrasena() == null) {
            if (usuario.getRol() == Rol.CIST) {
                return "EddamCIST";
            } else {
                return usuario.getDni();
            }
        }
        return usuario.getContrasena();
    }

    @Transactional(readOnly = true)
    public UsuarioRespuestaDto login(String dni, String contrasena) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con el DNI proporcionado"));

        String passwordEsperada = getUsuarioPasswordEsperada(usuario);
        if (!passwordEsperada.equals(contrasena)) {
            throw new IllegalArgumentException("Contraseña incorrecta");
        }

        return mapearAUsuarioRespuesta(usuario);
    }

    @Transactional(readOnly = true)
    public UsuarioRespuestaDto obtenerPerfil(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con el DNI proporcionado"));
        return mapearAUsuarioRespuesta(usuario);
    }

    @Transactional
    public void cambiarContrasena(CambioContrasenaDto dto) {
        Usuario usuario = usuarioRepository.findByDni(dto.getDni())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con el DNI proporcionado"));

        String passwordEsperada = getUsuarioPasswordEsperada(usuario);
        if (!passwordEsperada.equals(dto.getContrasenaActual())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        if (dto.getNuevaContrasena().length() < 4) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 4 caracteres");
        }

        usuario.setContrasena(dto.getNuevaContrasena());
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void restablecerContrasena(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        usuario.setContrasena(null);
        usuarioRepository.save(usuario);
    }

    public ImportacionLoteResultadoDto registrarUsuariosLote(List<UsuarioRegistroDto> dtos) {
        int exitosos = 0;
        int fallidos = 0;
        List<FalloRegistroDto> detallesFallos = new ArrayList<>();
        final java.util.Set<String> seccionesAfectadas = new java.util.HashSet<>();

        for (UsuarioRegistroDto dto : dtos) {
            try {
                // Registrar cada usuario en su propia transacción aislada
                transactionTemplate.executeWithoutResult(status -> {
                    // 1. Validación manual de DNI
                    if (usuarioRepository.existsByDni(dto.getDni())) {
                        throw new IllegalArgumentException("El DNI ya se encuentra registrado.");
                    }

                    // 2. Validación de campos requeridos
                    if (dto.getRol() == Rol.ESTUDIANTE) {
                        if (dto.getGrado() == null || dto.getSeccion() == null) {
                            throw new IllegalArgumentException("Datos del estudiante incompletos (grado o sección).");
                        }
                    } else {
                        if (dto.getCargo() == null) {
                            throw new IllegalArgumentException("El cargo del personal es requerido.");
                        }
                    }

                    // 3. Crear el usuario
                    Usuario usuario = new Usuario();
                    usuario.setDni(dto.getDni());
                    usuario.setNombres(dto.getNombres());
                    usuario.setApellidos(dto.getApellidos());
                    usuario.setRol(dto.getRol());
                    usuario.setQrToken("TEMP-" + dto.getDni());
                    usuario = usuarioRepository.saveAndFlush(usuario);

                    // 4. Generar el token corto real basado en DNI y firma HMAC
                    String qrTokenReal = jwtService.generateUserShortToken(usuario.getDni());
                    usuario.setQrToken(qrTokenReal);
                    usuario = usuarioRepository.save(usuario);

                    // 5. Crear perfiles específicos
                    if (dto.getRol() == Rol.ESTUDIANTE) {
                        String seccionLimpia = dto.getSeccion() != null ? dto.getSeccion().trim() : "A";
                        if (seccionLimpia.isEmpty()) {
                            seccionLimpia = "A";
                        } else {
                            seccionLimpia = seccionLimpia.toUpperCase();
                        }
                        Estudiante estudiante = new Estudiante(usuario, dto.getGrado(), seccionLimpia, (short) 1);
                        estudianteRepository.save(estudiante);
                        
                        seccionesAfectadas.add(dto.getGrado() + ":" + seccionLimpia);
                    } else {
                        PersonalInstitucional personal = new PersonalInstitucional(usuario, dto.getCargo(), dto.getAreaCurricular());
                        personalInstitucionalRepository.save(personal);
                    }
                });

                exitosos++;
            } catch (Exception e) {
                fallidos++;
                String msg = e.getMessage();
                if (e.getCause() != null) {
                    msg = e.getCause().getMessage();
                }
                detallesFallos.add(new FalloRegistroDto(dto.getDni(), dto.getNombres() + " " + dto.getApellidos(), msg));
            }
        }

        // Recalcular el orden correlativo para todas las secciones afectadas
        for (String secStr : seccionesAfectadas) {
            String[] parts = secStr.split(":");
            Short grado = Short.parseShort(parts[0]);
            String seccion = parts[1];
            reasignarNumerosOrden(grado, seccion);
        }

        return new ImportacionLoteResultadoDto(exitosos, fallidos, detallesFallos);
    }

    @Transactional(readOnly = true)
    public UsuarioRespuestaDto obtenerUsuario(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        return mapearAUsuarioRespuesta(usuario);
    }

    @Transactional(readOnly = true)
    public CredencialRespuestaDto obtenerCredencial(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));
        
        UsuarioRespuestaDto userDto = mapearAUsuarioRespuesta(usuario);
        try {
            // Generamos la imagen QR con el token JWT
            String qrBase64 = qrService.generateQrCodeBase64(usuario.getQrToken());
            return new CredencialRespuestaDto(userDto, qrBase64);
        } catch (Exception e) {
            throw new RuntimeException("Error al generar el código QR de la credencial", e);
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<UsuarioRespuestaDto> listarUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::mapearAUsuarioRespuesta)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional(readOnly = true)
    public java.util.List<String> obtenerGradosSecciones() {
        return estudianteRepository.findDistinctGradosSecciones().stream()
                .map(row -> row[0].toString() + row[1].toString())
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void eliminarUsuario(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        Short gradoEstudiante = null;
        String seccionEstudiante = null;
        if (usuario.getEstudiante() != null) {
            gradoEstudiante = usuario.getEstudiante().getGrado();
            seccionEstudiante = usuario.getEstudiante().getSeccion();
        }

        // A. Limpiar Reservas de Aula AIP asociadas al usuario/docente
        List<ReservaAulaAip> reservas = reservaAulaAipRepository.findByDocenteIdUsuario(id);
        reservaAulaAipRepository.deleteAll(reservas);

        // B. Limpiar Incidencias del usuario
        List<Incidencia> incidenciasAutor = incidenciaRepository.findByAutorIdUsuarioOrderByFechaCreacionDesc(id);
        incidenciaRepository.deleteAll(incidenciasAutor);

        List<Incidencia> incidenciasAtendido = incidenciaRepository.findByAtendidoPorIdUsuario(id);
        for (Incidencia inc : incidenciasAtendido) {
            inc.setAtendidoPor(null);
        }
        incidenciaRepository.saveAll(incidenciasAtendido);

        // C. Limpiar Juego y Cuestionarios
        // C1. Jugadores en salas
        List<JuegoSalaJugador> inscripciones = juegoSalaJugadorRepository.findByJugadorIdUsuario(id);
        juegoSalaJugadorRepository.deleteAll(inscripciones);

        // C2. Salas creadas por el usuario
        List<JuegoSala> salasCreador = juegoSalaRepository.findByCreadorIdUsuario(id);
        for (JuegoSala js : salasCreador) {
            List<JuegoSalaJugador> jsJugadores = juegoSalaJugadorRepository.findBySalaIdSalaOrderByOrdenTurnoAsc(js.getIdSala());
            juegoSalaJugadorRepository.deleteAll(jsJugadores);
        }
        juegoSalaRepository.deleteAll(salasCreador);

        // C3. Cuestionarios creados por el usuario y sus preguntas asociadas
        List<CuestionarioPersonalizado> cuestionariosPropios = cuestionarioPersonalizadoRepository.findByCreadorIdUsuarioOrderByFechaCreacionDesc(id);
        for (CuestionarioPersonalizado cp : cuestionariosPropios) {
            List<PreguntaJuego> preguntas = preguntaJuegoRepository.findByCuestionarioIdCuestionario(cp.getIdCuestionario());
            preguntaJuegoRepository.deleteAll(preguntas);
        }
        cuestionarioPersonalizadoRepository.deleteAll(cuestionariosPropios);

        // C4. Progreso de juego de estudiantes
        estudianteProgresoJuegoRepository.findByEstudianteIdUsuario(id).ifPresent(estudianteProgresoJuegoRepository::delete);

        // 1. Si es DOCENTE/Personal: eliminar sus cursos
        if (usuario.getPersonalInstitucional() != null) {
            List<Curso> cursosDocente = cursoRepository.findByDocenteIdUsuario(id);
            for (Curso c : cursosDocente) {
                cursoService.eliminarCurso(c.getIdCurso());
            }
        }

        // 2. Si es ESTUDIANTE: eliminar asistencia, notas y logros
        if (usuario.getEstudiante() != null) {
            List<Asistencia> asistencias = asistenciaRepository.findByEstudianteIdUsuarioOrderByFechaDesc(id);
            asistenciaRepository.deleteAll(asistencias);

            List<CursoNota> notas = cursoNotaRepository.findByEstudianteIdUsuario(id);
            cursoNotaRepository.deleteAll(notas);

            List<EstudianteLogro> logros = estudianteLogroRepository.findByEstudianteIdUsuario(id);
            estudianteLogroRepository.deleteAll(logros);
            
            // Eliminar detalles de sesiones AIP del estudiante
            List<SesionDetalle> detalles = sesionDetalleRepository.findByEstudianteIdUsuario(id);
            sesionDetalleRepository.deleteAll(detalles);
        }

        // 3. Eliminar sesiones AIP dictadas por el docente (SesionGrupal) y sus detalles asociados
        List<SesionGrupal> sesionesDocente = sesionGrupalRepository.findByDocenteIdUsuario(id);
        for (SesionGrupal sg : sesionesDocente) {
            List<SesionDetalle> detallesSesion = sesionDetalleRepository.findBySesionGrupal_IdSesion(sg.getIdSesion());
            sesionDetalleRepository.deleteAll(detallesSesion);
        }
        sesionGrupalRepository.deleteAll(sesionesDocente);

        // 4. Remover de grupos de cursos (join table)
        List<CursoGrupo> grupos = cursoGrupoRepository.findAll();
        for (CursoGrupo g : grupos) {
            if (g.getIntegrantes().removeIf(u -> u.getIdUsuario().equals(id))) {
                cursoGrupoRepository.save(g);
            }
        }

        // 5. Eliminar mensajes directos donde emisor o receptor es el usuario
        List<MensajeDirecto> mensajes = mensajeDirectoRepository.findByEmisorIdUsuarioOrReceptorIdUsuario(id, id);
        mensajeDirectoRepository.deleteAll(mensajes);

        // 6. Eliminar respuestas de debates del usuario
        List<DebateRespuesta> respuestasDebates = debateRespuestaRepository.findByAutorIdUsuario(id);
        debateRespuestaRepository.deleteAll(respuestasDebates);

        // 7. Eliminar debates creados por el usuario (y sus respuestas antes)
        List<Debate> debatesPropios = debateRepository.findByAutorIdUsuario(id);
        for (Debate d : debatesPropios) {
            List<DebateRespuesta> respuestas = debateRespuestaRepository.findByDebateIdDebateOrderByFechaCreacionAsc(d.getIdDebate());
            debateRespuestaRepository.deleteAll(respuestas);
        }
        debateRepository.deleteAll(debatesPropios);

        // 8. Eliminar anuncios creados por el usuario
        List<Anuncio> anunciosPropios = anuncioRepository.findByAutorIdUsuario(id);
        anuncioRepository.deleteAll(anunciosPropios);

        // 9. Eliminar documentos subidos por el usuario (y sus archivos físicos)
        List<DocumentoManual> documentos = documentoManualRepository.findByAutorIdUsuario(id);
        for (DocumentoManual dm : documentos) {
            try {
                File physicalFile = new File(dm.getRutaArchivo());
                if (physicalFile.exists()) {
                    physicalFile.delete();
                }
            } catch (Exception e) {
                // Ignore physical file delete error
            }
        }
        documentoManualRepository.deleteAll(documentos);

        // 10. Eliminar respuestas de encuestas del usuario
        List<RespuestaEncuesta> respuestasEncuestas = respuestaEncuestaRepository.findByUsuarioIdUsuario(id);
        respuestaEncuestaRepository.deleteAll(respuestasEncuestas);

        // 11. Eliminar el usuario (se eliminarán en cascada Estudiante y PersonalInstitucional por JPA cascade = ALL)
        usuarioRepository.delete(usuario);
        usuarioRepository.flush();

        // Recalcular orden para la sección si el estudiante fue eliminado
        if (gradoEstudiante != null && seccionEstudiante != null) {
            reasignarNumerosOrden(gradoEstudiante, seccionEstudiante);
        }
    }

    @Transactional
    public UsuarioRespuestaDto actualizarUsuario(UUID id, UsuarioRegistroDto dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + id));

        // Guardar estado inicial por si cambia de grado, sección o rol
        Short antiguoGrado = null;
        String antiguaSeccion = null;
        Rol antiguoRol = usuario.getRol();
        if (antiguoRol == Rol.ESTUDIANTE && usuario.getEstudiante() != null) {
            antiguoGrado = usuario.getEstudiante().getGrado();
            antiguaSeccion = usuario.getEstudiante().getSeccion();
        }

        // Validar si el DNI cambió y si ya existe en otro usuario
        if (!usuario.getDni().equals(dto.getDni())) {
            if (usuarioRepository.existsByDni(dto.getDni())) {
                throw new IllegalArgumentException("Ya existe otro usuario con el DNI " + dto.getDni());
            }
            usuario.setDni(dto.getDni());
            // Generar nuevo token QR basado en el nuevo DNI
            String qrTokenReal = jwtService.generateUserShortToken(usuario.getDni());
            usuario.setQrToken(qrTokenReal);
        }

        usuario.setNombres(dto.getNombres());
        usuario.setApellidos(dto.getApellidos());

        Rol nuevoRol = dto.getRol();
        usuario.setRol(nuevoRol);

        if (nuevoRol == Rol.ESTUDIANTE) {
            if (dto.getGrado() == null || dto.getSeccion() == null) {
                throw new IllegalArgumentException("Para rol ESTUDIANTE, grado y seccion son requeridos");
            }
            String seccionLimpia = dto.getSeccion().trim();
            if (seccionLimpia.isEmpty()) {
                seccionLimpia = "A";
            } else {
                seccionLimpia = seccionLimpia.toUpperCase();
            }

            // Si antes no era estudiante, borrar perfil de personal (si existía) y crear perfil estudiante
            if (antiguoRol != Rol.ESTUDIANTE) {
                if (usuario.getPersonalInstitucional() != null) {
                    PersonalInstitucional personal = usuario.getPersonalInstitucional();
                    usuario.setPersonalInstitucional(null);
                    personalInstitucionalRepository.delete(personal);
                }
                Estudiante estudiante = new Estudiante(usuario, dto.getGrado(), seccionLimpia, (short) 1);
                estudianteRepository.save(estudiante);
                usuario.setEstudiante(estudiante);
            } else {
                // Si ya era estudiante, actualizar
                Estudiante estudiante = usuario.getEstudiante();
                if (estudiante == null) {
                    estudiante = new Estudiante(usuario, dto.getGrado(), seccionLimpia, (short) 1);
                    estudianteRepository.save(estudiante);
                    usuario.setEstudiante(estudiante);
                } else {
                    estudiante.setGrado(dto.getGrado());
                    estudiante.setSeccion(seccionLimpia);
                    estudianteRepository.save(estudiante);
                }
            }
        } else {
            // Es personal (DOCENTE, ADMINISTRATIVO, CIST, PIP, AUXILIAR)
            if (dto.getCargo() == null) {
                throw new IllegalArgumentException("Para personal institucional, el cargo es requerido");
            }

            // Si antes era estudiante, borrar perfil estudiante y crear perfil de personal
            if (antiguoRol == Rol.ESTUDIANTE) {
                if (usuario.getEstudiante() != null) {
                    Estudiante est = usuario.getEstudiante();
                    usuario.setEstudiante(null);
                    estudianteRepository.delete(est);
                }
                PersonalInstitucional personal = new PersonalInstitucional(usuario, dto.getCargo(), dto.getAreaCurricular());
                personalInstitucionalRepository.save(personal);
                usuario.setPersonalInstitucional(personal);
            } else {
                // Si ya era personal, actualizar
                PersonalInstitucional personal = usuario.getPersonalInstitucional();
                if (personal == null) {
                    personal = new PersonalInstitucional(usuario, dto.getCargo(), dto.getAreaCurricular());
                    personalInstitucionalRepository.save(personal);
                    usuario.setPersonalInstitucional(personal);
                } else {
                    personal.setCargo(dto.getCargo());
                    personal.setAreaCurricular(dto.getAreaCurricular());
                    personalInstitucionalRepository.save(personal);
                }
            }
        }

        usuario = usuarioRepository.saveAndFlush(usuario);

        // Recalcular el orden correlativo alfabético en las secciones afectadas
        if (antiguoRol == Rol.ESTUDIANTE && antiguoGrado != null && antiguaSeccion != null) {
            reasignarNumerosOrden(antiguoGrado, antiguaSeccion);
        }
        if (nuevoRol == Rol.ESTUDIANTE) {
            String seccionLimpia = dto.getSeccion().trim().toUpperCase();
            if (antiguoRol != Rol.ESTUDIANTE || !antiguoGrado.equals(dto.getGrado()) || !antiguaSeccion.equalsIgnoreCase(seccionLimpia)) {
                reasignarNumerosOrden(dto.getGrado(), seccionLimpia);
            }
        }

        return mapearAUsuarioRespuesta(usuario);
    }

    @Transactional
    public void reasignarNumerosOrden(Short grado, String seccion) {
        if (grado == null || seccion == null) return;
        String seccionLimpia = seccion.trim().toUpperCase();
        List<Estudiante> estudiantes = estudianteRepository.findByGradoAndSeccionOrderByApellidosAndNombres(grado, seccionLimpia);
        short orden = 1;
        for (Estudiante e : estudiantes) {
            e.setNumeroOrden(orden++);
        }
        estudianteRepository.saveAll(estudiantes);
    }

    private UsuarioRespuestaDto mapearAUsuarioRespuesta(Usuario usuario) {
        UsuarioRespuestaDto res = new UsuarioRespuestaDto();
        res.setIdUsuario(usuario.getIdUsuario());
        res.setDni(usuario.getDni());
        res.setNombres(usuario.getNombres());
        res.setApellidos(usuario.getApellidos());
        res.setRol(usuario.getRol());
        res.setQrToken(usuario.getQrToken());
        res.setEstado(usuario.getEstado().name());

        if (usuario.getRol() == Rol.ESTUDIANTE && usuario.getEstudiante() != null) {
            res.setGrado(usuario.getEstudiante().getGrado());
            res.setSeccion(usuario.getEstudiante().getSeccion());
            res.setNumeroOrden(usuario.getEstudiante().getNumeroOrden());
        } else if (usuario.getPersonalInstitucional() != null) {
            res.setCargo(usuario.getPersonalInstitucional().getCargo());
            res.setAreaCurricular(usuario.getPersonalInstitucional().getAreaCurricular());
        }
        return res;
    }
}

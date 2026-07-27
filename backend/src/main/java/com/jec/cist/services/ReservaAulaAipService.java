package com.jec.cist.services;

import com.jec.cist.dtos.ReservaAulaAipRegistroDto;
import com.jec.cist.dtos.ReservaAulaAipRespuestaDto;
import com.jec.cist.models.AulaAip;
import com.jec.cist.models.Curso;
import com.jec.cist.models.Rol;
import com.jec.cist.models.ReservaAulaAip;
import com.jec.cist.models.Usuario;
import com.jec.cist.repositories.AulaAipRepository;
import com.jec.cist.repositories.CursoRepository;
import com.jec.cist.repositories.ReservaAulaAipRepository;
import com.jec.cist.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReservaAulaAipService {

    private final ReservaAulaAipRepository reservaRepository;
    private final AulaAipRepository aulaAipRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    public ReservaAulaAipService(
            ReservaAulaAipRepository reservaRepository,
            AulaAipRepository aulaAipRepository,
            UsuarioRepository usuarioRepository,
            CursoRepository cursoRepository) {
        this.reservaRepository = reservaRepository;
        this.aulaAipRepository = aulaAipRepository;
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
    }

    @Transactional
    public ReservaAulaAipRespuestaDto crearReserva(ReservaAulaAipRegistroDto dto) {
        AulaAip aula = aulaAipRepository.findById(dto.getIdAula())
                .orElseThrow(() -> new IllegalArgumentException("Aula AIP no encontrada con ID: " + dto.getIdAula()));

        Usuario docente = usuarioRepository.findById(dto.getIdDocente())
                .orElseThrow(() -> new IllegalArgumentException("Docente/usuario no encontrado con ID: " + dto.getIdDocente()));

        // Validar rol
        if (docente.getRol() == Rol.ESTUDIANTE) {
            throw new IllegalArgumentException("Los estudiantes no tienen autorización para realizar reservas de aulas");
        }

        // Si es docente, validar que el grado y sección corresponda a los cursos que dicta
        if (docente.getRol() == Rol.DOCENTE) {
            List<Curso> cursos = cursoRepository.findByDocenteIdUsuario(docente.getIdUsuario());
            boolean dictaCurso = cursos.stream().anyMatch(c -> 
                    c.getGrado().equals(dto.getGrado()) && 
                    c.getSeccion().equalsIgnoreCase(dto.getSeccion().trim())
            );
            if (!dictaCurso) {
                throw new IllegalArgumentException("Los docentes solo pueden reservar aulas para sus propios grados y secciones asignados");
            }
        }

        // Validar tiempos coherentes
        if (dto.getHoraInicio().isAfter(dto.getHoraFin()) || dto.getHoraInicio().equals(dto.getHoraFin())) {
            throw new IllegalArgumentException("La hora de inicio debe ser anterior a la hora de fin");
        }

        // Validar traslapes de horario
        List<ReservaAulaAip> traslapes = reservaRepository.findOverlappingReservations(
                dto.getIdAula(), dto.getFecha(), dto.getHoraInicio(), dto.getHoraFin()
        );
        if (!traslapes.isEmpty()) {
            throw new IllegalArgumentException("El horario seleccionado tiene conflicto con otra reserva existente en esta aula");
        }

        ReservaAulaAip reserva = new ReservaAulaAip(
                aula,
                docente,
                dto.getFecha(),
                dto.getHoraInicio(),
                dto.getHoraFin(),
                dto.getGrado(),
                dto.getSeccion().trim().toUpperCase(),
                dto.getMotivo()
        );

        reserva = reservaRepository.save(reserva);
        return mapearAResupuesta(reserva);
    }

    @Transactional(readOnly = true)
    public List<ReservaAulaAipRespuestaDto> listarReservas(UUID idUsuario, Integer idAula, LocalDate start, LocalDate end) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + idUsuario));

        if (usuario.getRol() == Rol.ESTUDIANTE) {
            if (usuario.getEstudiante() == null) {
                throw new IllegalArgumentException("El usuario con rol ESTUDIANTE no posee perfil de estudiante registrado");
            }
            // Los estudiantes solo ven reservas de su propio grado y sección
            Short grado = usuario.getEstudiante().getGrado();
            String seccion = usuario.getEstudiante().getSeccion();
            
            List<ReservaAulaAip> reservas = reservaRepository.findByGradoAndSeccionAndFechaBetweenOrderByFechaAscHoraInicioAsc(
                    grado, seccion, start, end
            );
            
            // Filtrar para el aula específica si se pasa como parámetro
            return reservas.stream()
                    .filter(r -> idAula == null || r.getAulaAip().getIdAula().equals(idAula))
                    .map(this::mapearAResupuesta)
                    .collect(Collectors.toList());
        }

        // Para docentes o CIST
        List<ReservaAulaAip> todas = reservaRepository.findByAulaAipIdAulaAndFechaBetweenOrderByFechaAscHoraInicioAsc(idAula, start, end);

        if (usuario.getRol() == Rol.CIST || usuario.getRol() == Rol.PIP) {
            // CIST y PIP ven todo sin filtros de privacidad
            return todas.stream().map(this::mapearAResupuesta).collect(Collectors.toList());
        }

        if (usuario.getRol() == Rol.DOCENTE) {
            // Obtener los cursos que dicta el docente
            List<Curso> cursosDocente = cursoRepository.findByDocenteIdUsuario(idUsuario);
            
            return todas.stream().map(reserva -> {
                // Si la reserva pertenece al docente o a un grado/sección que el docente dicta, mostrar completo
                boolean esCreador = reserva.getDocente().getIdUsuario().equals(idUsuario);
                boolean dictaSeccion = cursosDocente.stream().anyMatch(c ->
                        c.getGrado().equals(reserva.getGrado()) &&
                        c.getSeccion().equalsIgnoreCase(reserva.getSeccion())
                );

                if (esCreador || dictaSeccion) {
                    return mapearAResupuesta(reserva);
                } else {
                    // Si no, enmascarar los datos sensibles pero mostrar el bloque ocupado
                    ReservaAulaAipRespuestaDto enmascarado = new ReservaAulaAipRespuestaDto();
                    enmascarado.setIdReserva(reserva.getIdReserva());
                    enmascarado.setIdAula(reserva.getAulaAip().getIdAula());
                    enmascarado.setAulaNombre(reserva.getAulaAip().getNombreAula());
                    enmascarado.setIdDocente(null);
                    enmascarado.setDocenteNombre("Docente");
                    enmascarado.setDocenteApellidos("Institucional");
                    enmascarado.setFecha(reserva.getFecha());
                    enmascarado.setHoraInicio(reserva.getHoraInicio());
                    enmascarado.setHoraFin(reserva.getHoraFin());
                    enmascarado.setGrado(null);
                    enmascarado.setSeccion(null);
                    enmascarado.setMotivo("Ocupado (Aula Reservada)");
                    enmascarado.setFechaRegistro(reserva.getFechaRegistro());
                    return enmascarado;
                }
            }).collect(Collectors.toList());
        }

        // Otros roles (auxiliares, administrativos) ven todo para saber la disponibilidad de aulas
        return todas.stream().map(this::mapearAResupuesta).collect(Collectors.toList());
    }

    @Transactional
    public void eliminarReserva(UUID idReserva, UUID idUsuario) {
        ReservaAulaAip reserva = reservaRepository.findById(idReserva)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada con ID: " + idReserva));

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + idUsuario));

        // Solo el CIST, PIP o el mismo creador de la reserva pueden eliminarla
        if (usuario.getRol() == Rol.CIST || usuario.getRol() == Rol.PIP || reserva.getDocente().getIdUsuario().equals(idUsuario)) {
            reservaRepository.delete(reserva);
        } else {
            throw new IllegalArgumentException("No tiene permisos para anular esta reserva del Aula AIP");
        }
    }

    private ReservaAulaAipRespuestaDto mapearAResupuesta(ReservaAulaAip reserva) {
        ReservaAulaAipRespuestaDto res = new ReservaAulaAipRespuestaDto();
        res.setIdReserva(reserva.getIdReserva());
        res.setIdAula(reserva.getAulaAip().getIdAula());
        res.setAulaNombre(reserva.getAulaAip().getNombreAula());
        res.setIdDocente(reserva.getDocente().getIdUsuario());
        res.setDocenteNombre(reserva.getDocente().getNombres());
        res.setDocenteApellidos(reserva.getDocente().getApellidos());
        res.setFecha(reserva.getFecha());
        res.setHoraInicio(reserva.getHoraInicio());
        res.setHoraFin(reserva.getHoraFin());
        res.setGrado(reserva.getGrado());
        res.setSeccion(reserva.getSeccion());
        res.setMotivo(reserva.getMotivo());
        res.setFechaRegistro(reserva.getFechaRegistro());
        return res;
    }
}

package com.jec.cist.services;

import com.jec.cist.dtos.AsistenciaConfiguracionDto;
import com.jec.cist.dtos.AsistenciaManualRequestDto;
import com.jec.cist.dtos.AsistenciaRespuestaDto;
import com.jec.cist.models.Asistencia;
import com.jec.cist.models.Configuracion;
import com.jec.cist.models.Estudiante;
import com.jec.cist.models.Usuario;
import com.jec.cist.repositories.AsistenciaRepository;
import com.jec.cist.repositories.ConfiguracionRepository;
import com.jec.cist.repositories.EstudianteRepository;
import com.jec.cist.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AsistenciaService {

    private final AsistenciaRepository asistenciaRepository;
    private final EstudianteRepository estudianteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ConfiguracionRepository configuracionRepository;
    private final JwtService jwtService;

    private static final String KEY_START_TIME = "ATTENDANCE_START_TIME";
    private static final String KEY_LATE_TIME = "ATTENDANCE_LATE_TIME";
    private static final String DEFAULT_START_TIME = "07:30:00";
    private static final String DEFAULT_LATE_TIME = "07:45:00";

    public AsistenciaService(
            AsistenciaRepository asistenciaRepository,
            EstudianteRepository estudianteRepository,
            UsuarioRepository usuarioRepository,
            ConfiguracionRepository configuracionRepository,
            JwtService jwtService) {
        this.asistenciaRepository = asistenciaRepository;
        this.estudianteRepository = estudianteRepository;
        this.usuarioRepository = usuarioRepository;
        this.configuracionRepository = configuracionRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public AsistenciaConfiguracionDto obtenerConfiguracion() {
        String startTime = configuracionRepository.findById(KEY_START_TIME)
                .map(Configuracion::getValor)
                .orElse(DEFAULT_START_TIME);
        String lateTime = configuracionRepository.findById(KEY_LATE_TIME)
                .map(Configuracion::getValor)
                .orElse(DEFAULT_LATE_TIME);
        return new AsistenciaConfiguracionDto(startTime, lateTime);
    }

    @Transactional
    public void guardarConfiguracion(AsistenciaConfiguracionDto dto) {
        configuracionRepository.save(new Configuracion(KEY_START_TIME, dto.getHoraEntrada()));
        configuracionRepository.save(new Configuracion(KEY_LATE_TIME, dto.getHoraTolerancia()));
    }

    @Transactional
    public AsistenciaRespuestaDto registrarAsistenciaQr(String qrToken, Short gradoTablet) {
        // 1. Validar el token QR
        if (!jwtService.validateQrToken(qrToken)) {
            throw new IllegalArgumentException("El código QR no es válido o ha expirado.");
        }

        // 2. Extraer el DNI
        String dni = jwtService.extractDni(qrToken);
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new IllegalArgumentException("El DNI " + dni + " no corresponde a ningún usuario."));

        // 3. Validar que sea un estudiante
        if (usuario.getRol() != com.jec.cist.models.Rol.ESTUDIANTE || usuario.getEstudiante() == null) {
            throw new IllegalArgumentException("Este código no pertenece a un estudiante. Es de rol: " + usuario.getRol());
        }

        Estudiante estudiante = usuario.getEstudiante();
        LocalDate hoy = LocalDate.now();
        LocalTime horaActual = LocalTime.now();

        // 4. Verificar duplicados
        Optional<Asistencia> registroPrevio = asistenciaRepository.findByEstudianteIdUsuarioAndFecha(estudiante.getIdUsuario(), hoy);
        if (registroPrevio.isPresent()) {
            Asistencia prev = registroPrevio.get();
            String timeStr = prev.getHoraIngreso() != null ? prev.getHoraIngreso().format(DateTimeFormatter.ofPattern("hh:mm:ss a")) : "hora no registrada";
            throw new IllegalArgumentException("El estudiante ya registró su asistencia el día de hoy a las " + timeStr + " (" + prev.getEstado() + ").");
        }

        // 5. Cargar configuraciones horarias
        AsistenciaConfiguracionDto config = obtenerConfiguracion();
        LocalTime horaEntrada = LocalTime.parse(config.getHoraEntrada());
        LocalTime horaTolerancia = LocalTime.parse(config.getHoraTolerancia());

        // Determinación del estado
        String estado;
        if (horaActual.isBefore(horaEntrada) || horaActual.equals(horaEntrada)) {
            estado = "PUNTUAL";
        } else if (horaActual.isBefore(horaTolerancia) || horaActual.equals(horaTolerancia)) {
            estado = "TARDANZA";
        } else {
            estado = "FALTA";
        }

        // 6. Crear el registro de asistencia
        Asistencia asistencia = new Asistencia();
        asistencia.setEstudiante(estudiante);
        asistencia.setFecha(hoy);
        asistencia.setHoraIngreso(horaActual);
        asistencia.setEstado(estado);
        asistencia.setGrado(estudiante.getGrado());
        asistencia.setSeccion(estudiante.getSeccion());

        // Alerta de grado incorrecto si hay mismatch
        String mensajeAlerta = null;
        if (!estudiante.getGrado().equals(gradoTablet)) {
            mensajeAlerta = "¡Registrado! Pero perteneces a " + estudiante.getGrado() + "° Grado. Por favor, usa la tableta de tu grado.";
        }

        asistencia = asistenciaRepository.save(asistencia);

        AsistenciaRespuestaDto res = mapearAAsistenciaRespuesta(asistencia);
        res.setMensajeAlerta(mensajeAlerta);
        return res;
    }

    @Transactional
    public AsistenciaRespuestaDto registrarAsistenciaManual(AsistenciaManualRequestDto dto) {
        Estudiante estudiante = estudianteRepository.findById(dto.getIdEstudiante())
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no encontrado."));

        Optional<Asistencia> asistenciaOpt = asistenciaRepository.findByEstudianteIdUsuarioAndFecha(dto.getIdEstudiante(), dto.getFecha());
        Asistencia asistencia;
        
        if (asistenciaOpt.isPresent()) {
            asistencia = asistenciaOpt.get();
            asistencia.setEstado(dto.getEstado());
            asistencia.setObservacion(dto.getObservacion());
            if ("FALTA".equals(dto.getEstado())) {
                asistencia.setHoraIngreso(null);
            } else if (asistencia.getHoraIngreso() == null) {
                asistencia.setHoraIngreso(LocalTime.now());
            }
        } else {
            asistencia = new Asistencia();
            asistencia.setEstudiante(estudiante);
            asistencia.setFecha(dto.getFecha());
            asistencia.setEstado(dto.getEstado());
            asistencia.setObservacion(dto.getObservacion());
            asistencia.setGrado(estudiante.getGrado());
            asistencia.setSeccion(estudiante.getSeccion());
            if (!"FALTA".equals(dto.getEstado())) {
                asistencia.setHoraIngreso(LocalTime.now());
            }
        }

        asistencia = asistenciaRepository.save(asistencia);
        return mapearAAsistenciaRespuesta(asistencia);
    }

    @Transactional
    public int registrarFaltasDelDia(Short grado, String seccion) {
        LocalDate hoy = LocalDate.now();
        List<Estudiante> estudiantes;
        
        if (grado != null && seccion != null) {
            estudiantes = estudianteRepository.findByGradoAndSeccionOrderByNumeroOrdenAsc(grado, seccion);
        } else {
            estudiantes = estudianteRepository.findAll();
        }

        int creados = 0;
        for (Estudiante est : estudiantes) {
            Optional<Asistencia> asisOpt = asistenciaRepository.findByEstudianteIdUsuarioAndFecha(est.getIdUsuario(), hoy);
            if (asisOpt.isEmpty()) {
                Asistencia falta = new Asistencia();
                falta.setEstudiante(est);
                falta.setFecha(hoy);
                falta.setHoraIngreso(null);
                falta.setEstado("FALTA");
                falta.setGrado(est.getGrado());
                falta.setSeccion(est.getSeccion());
                asistenciaRepository.save(falta);
                creados++;
            }
        }
        return creados;
    }

    @Transactional(readOnly = true)
    public List<AsistenciaRespuestaDto> obtenerHistorialEstudiante(UUID idEstudiante) {
        return asistenciaRepository.findByEstudianteIdUsuarioOrderByFechaDesc(idEstudiante)
                .stream()
                .map(this::mapearAAsistenciaRespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AsistenciaRespuestaDto> obtenerControlAsistenciaDia(LocalDate fecha, Short grado, String seccion) {
        // 1. Obtener todos los estudiantes que pertenecen a ese grado y sección
        List<Estudiante> estudiantes = estudianteRepository.findByGradoAndSeccionOrderByNumeroOrdenAsc(grado, seccion);

        // 2. Obtener los registros de asistencia de esa fecha, grado y sección
        List<Asistencia> asistencias = asistenciaRepository.findByFechaAndGradoAndSeccion(fecha, grado, seccion);

        // 3. Combinar ambos listados para mostrar a todos los estudiantes con su estado respectivo
        List<AsistenciaRespuestaDto> resultado = new ArrayList<>();
        for (Estudiante est : estudiantes) {
            Optional<Asistencia> asisOpt = asistencias.stream()
                    .filter(a -> a.getEstudiante().getIdUsuario().equals(est.getIdUsuario()))
                    .findFirst();

            if (asisOpt.isPresent()) {
                resultado.add(mapearAAsistenciaRespuesta(asisOpt.get()));
            } else {
                // Generar un DTO de "SIN_REGISTRO" provisional para la tabla interactiva
                AsistenciaRespuestaDto sinReg = new AsistenciaRespuestaDto();
                sinReg.setIdEstudiante(est.getIdUsuario());
                sinReg.setDni(est.getUsuario().getDni());
                sinReg.setNombres(est.getUsuario().getNombres());
                sinReg.setApellidos(est.getUsuario().getApellidos());
                sinReg.setFecha(fecha);
                sinReg.setEstado("SIN_REGISTRO");
                sinReg.setGrado(est.getGrado());
                sinReg.setSeccion(est.getSeccion());
                resultado.add(sinReg);
            }
        }
        return resultado;
    }

    @Transactional(readOnly = true)
    public List<AsistenciaRespuestaDto> obtenerReporteAsistencias(LocalDate inicio, LocalDate fin, Short grado, String seccion) {
        List<Asistencia> asistencias;
        if (grado != null && seccion != null) {
            asistencias = asistenciaRepository.findByFechaBetweenAndGradoAndSeccionOrderByFechaDesc(inicio, fin, grado, seccion);
        } else if (grado != null) {
            asistencias = asistenciaRepository.findByFechaBetweenAndGradoOrderByFechaDesc(inicio, fin, grado);
        } else {
            asistencias = asistenciaRepository.findByFechaBetweenOrderByFechaDesc(inicio, fin);
        }

        return asistencias.stream()
                .map(this::mapearAAsistenciaRespuesta)
                .collect(Collectors.toList());
    }

    private AsistenciaRespuestaDto mapearAAsistenciaRespuesta(Asistencia asistencia) {
        AsistenciaRespuestaDto dto = new AsistenciaRespuestaDto();
        dto.setIdAsistencia(asistencia.getIdAsistencia());
        dto.setIdEstudiante(asistencia.getEstudiante().getIdUsuario());
        dto.setDni(asistencia.getEstudiante().getUsuario().getDni());
        dto.setNombres(asistencia.getEstudiante().getUsuario().getNombres());
        dto.setApellidos(asistencia.getEstudiante().getUsuario().getApellidos());
        dto.setFecha(asistencia.getFecha());
        dto.setHoraIngreso(asistencia.getHoraIngreso());
        dto.setEstado(asistencia.getEstado());
        dto.setObservacion(asistencia.getObservacion());
        dto.setGrado(asistencia.getGrado());
        dto.setSeccion(asistencia.getSeccion());
        return dto;
    }
}

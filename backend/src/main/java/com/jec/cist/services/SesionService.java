package com.jec.cist.services;

import com.jec.cist.dtos.IniciarClaseDto;
import com.jec.cist.dtos.IniciarColegiadoDto;
import com.jec.cist.dtos.RegistrarPrestamoDto;
import com.jec.cist.dtos.SesionRespuestaDto;
import com.jec.cist.models.*;
import com.jec.cist.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class SesionService {

    private final SesionGrupalRepository sesionGrupalRepository;
    private final SesionDetalleRepository sesionDetalleRepository;
    private final UsuarioRepository usuarioRepository;
    private final EstudianteRepository estudianteRepository;
    private final EquipoAipRepository equipoAipRepository;
    private final AulaAipRepository aulaAipRepository;
    private final JwtService jwtService;

    public SesionService(
            SesionGrupalRepository sesionGrupalRepository,
            SesionDetalleRepository sesionDetalleRepository,
            UsuarioRepository usuarioRepository,
            EstudianteRepository estudianteRepository,
            EquipoAipRepository equipoAipRepository,
            AulaAipRepository aulaAipRepository,
            JwtService jwtService) {
        this.sesionGrupalRepository = sesionGrupalRepository;
        this.sesionDetalleRepository = sesionDetalleRepository;
        this.usuarioRepository = usuarioRepository;
        this.estudianteRepository = estudianteRepository;
        this.equipoAipRepository = equipoAipRepository;
        this.aulaAipRepository = aulaAipRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public SesionRespuestaDto iniciarClaseAip(IniciarClaseDto dto) {
        // 1. Validar y decodificar el token del docente (soporta formato corto y JWT)
        if (!jwtService.validateQrToken(dto.getQrDocente())) {
            throw new IllegalArgumentException("Código QR del docente inválido, alterado o expirado.");
        }
        Usuario docente;
        String qrToken = dto.getQrDocente();
        if (qrToken.contains(":")) {
            String dni = qrToken.split(":")[0];
            docente = usuarioRepository.findByDni(dni)
                    .orElseThrow(() -> new IllegalArgumentException("El docente con DNI " + dni + " no está registrado en el sistema."));
        } else {
            UUID docenteId = jwtService.extractUsuarioId(qrToken);
            docente = usuarioRepository.findById(docenteId)
                    .orElseThrow(() -> new IllegalArgumentException("El docente especificado en el QR no está registrado en el sistema."));
        }

        if (docente.getRol() == Rol.ESTUDIANTE) {
            throw new IllegalArgumentException("Un estudiante no puede registrarse como responsable de una sesión.");
        }

        // 2. Buscar Aula
        AulaAip aula = aulaAipRepository.findById(dto.getIdAulaAip())
                .orElseThrow(() -> new IllegalArgumentException("Aula AIP no encontrada con ID: " + dto.getIdAulaAip()));

        // 3. Parsear grado y sección desde string (ej. "3A", "3ro A", "5-B", "5° RESPONSABILIDAD")
        Short grado = null;
        String seccion = null;
        Pattern p = Pattern.compile("(\\d)\\s*(?:ro|do|er|to|grade|año|°)?\\s*([A-Za-z]+)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(dto.getGradoSeccion());
        if (m.find()) {
            grado = Short.parseShort(m.group(1));
            seccion = m.group(2).toUpperCase();
        } else {
            // Intentar parser simplificado: buscar el primer número y la primera palabra de letras
            Pattern pSimpleNum = Pattern.compile("(\\d)");
            Pattern pSimpleChar = Pattern.compile("([A-Za-z]+)");
            Matcher mNum = pSimpleNum.matcher(dto.getGradoSeccion());
            Matcher mChar = pSimpleChar.matcher(dto.getGradoSeccion());
            if (mNum.find() && mChar.find()) {
                grado = Short.parseShort(mNum.group(1));
                seccion = mChar.group(1).toUpperCase();
            }
        }

        if (grado == null || seccion == null) {
            throw new IllegalArgumentException("Formato de grado/sección inválido. Use formatos como '3A', '3ro A', etc.");
        }

        // 4. Buscar estudiantes matriculados en esa sección
        List<Estudiante> estudiantes = estudianteRepository.findByGradoAndSeccionOrderByNumeroOrdenAsc(grado, seccion);
        if (estudiantes.isEmpty()) {
            throw new IllegalArgumentException("No se encontraron estudiantes matriculados en la sección " + grado + "° " + seccion);
        }

        // 5. Buscar laptops disponibles en el aula
        List<EquipoAip> laptopsDisponibles = equipoAipRepository
                .findByAulaBase_IdAulaAndTipoEquipoAndEstadoFisicoAndUbicacionActualOrderByCodPatrimonialAsc(
                        aula.getIdAula(), TipoEquipo.LAPTOP, EstadoFisico.OPERATIVO, UbicacionEquipo.EN_AIP);

        if (laptopsDisponibles.isEmpty()) {
            throw new IllegalArgumentException("No hay laptops operativas y disponibles en el " + aula.getNombreAula());
        }

        // 6. Crear cabecera de sesión grupal
        SesionGrupal sesion = new SesionGrupal(docente, aula, TipoOperacion.CLASE_INTERNA, grado + "° " + seccion);
        sesion.setDescripcion(dto.getDescripcion());
        sesion.setFirmaInicio(dto.getQrDocente());
        sesion = sesionGrupalRepository.save(sesion);

        // 7. Emparejamiento uno a uno por orden
        List<SesionDetalle> detallesCreados = new ArrayList<>();
        int limiteAsignacion = Math.min(estudiantes.size(), laptopsDisponibles.size());

        for (int i = 0; i < limiteAsignacion; i++) {
            Estudiante estudiante = estudiantes.get(i);
            EquipoAip laptop = laptopsDisponibles.get(i);

            // Cambiar ubicación de la laptop a prestado
            laptop.setUbicacionActual(UbicacionEquipo.PRESTADO_AULA);
            equipoAipRepository.save(laptop);

            // Crear el detalle
            SesionDetalle detalle = new SesionDetalle(sesion, laptop, estudiante.getUsuario());
            detalle = sesionDetalleRepository.save(detalle);
            detallesCreados.add(detalle);
        }

        // Guardar detalles y retornar
        return mapearASesionRespuesta(sesion, detallesCreados);
    }

    @Transactional
    public SesionRespuestaDto registrarPrestamoExterno(RegistrarPrestamoDto dto) {
        // 1. Validar y decodificar el token del docente (soporta formato corto y JWT)
        if (!jwtService.validateQrToken(dto.getQrDocente())) {
            throw new IllegalArgumentException("Código QR del docente inválido, alterado o expirado.");
        }
        Usuario docente;
        String qrToken = dto.getQrDocente();
        if (qrToken.contains(":")) {
            String dni = qrToken.split(":")[0];
            docente = usuarioRepository.findByDni(dni)
                    .orElseThrow(() -> new IllegalArgumentException("El docente con DNI " + dni + " no está registrado en el sistema."));
        } else {
            UUID docenteId = jwtService.extractUsuarioId(qrToken);
            docente = usuarioRepository.findById(docenteId)
                    .orElseThrow(() -> new IllegalArgumentException("El docente especificado en el QR no está registrado en el sistema."));
        }

        if (docente.getRol() == Rol.ESTUDIANTE) {
            throw new IllegalArgumentException("Un estudiante no puede registrarse como responsable de un préstamo.");
        }

        // 2. Buscar Aula AIP de origen
        AulaAip aula = aulaAipRepository.findById(dto.getIdAulaAip())
                .orElseThrow(() -> new IllegalArgumentException("Aula AIP de origen no encontrada con ID: " + dto.getIdAulaAip()));

        // 3. Crear cabecera de sesión grupal
        SesionGrupal sesion = new SesionGrupal(docente, aula, TipoOperacion.PRESTAMO_EXTERNO, null);
        sesion.setFirmaInicio(dto.getQrDocente());
        sesion = sesionGrupalRepository.save(sesion);

        // 4. Registrar cada equipo en el detalle
        List<SesionDetalle> detallesCreados = new ArrayList<>();
        for (String qrEquipo : dto.getQrEquipos()) {
            EquipoAip equipo = equipoAipRepository.findByQrEquipo(qrEquipo)
                    .orElseThrow(() -> new IllegalArgumentException("Equipo con código QR '" + qrEquipo + "' no registrado."));

            if (equipo.getEstadoFisico() == EstadoFisico.BAJA) {
                throw new IllegalArgumentException("El equipo " + equipo.getCodPatrimonial() + " está de BAJA y no puede ser prestado.");
            }
            if (equipo.getUbicacionActual() == UbicacionEquipo.PRESTADO_AULA) {
                throw new IllegalArgumentException("El equipo " + equipo.getCodPatrimonial() + " ya figura como PRESTADO en otra sesión.");
            }

            // Cambiar ubicación a prestado
            equipo.setUbicacionActual(UbicacionEquipo.PRESTADO_AULA);
            equipoAipRepository.save(equipo);

            // Crear el detalle con estudiante en NULL (responsabilidad recae en el docente)
            SesionDetalle detalle = new SesionDetalle(sesion, equipo, null);
            detalle = sesionDetalleRepository.save(detalle);
            detallesCreados.add(detalle);
        }

        return mapearASesionRespuesta(sesion, detallesCreados);
    }

    @Transactional
    public SesionRespuestaDto iniciarTrabajoColegiado(IniciarColegiadoDto dto) {
        // 1. Validar y decodificar el token del docente (soporta formato corto y JWT)
        if (!jwtService.validateQrToken(dto.getQrDocente())) {
            throw new IllegalArgumentException("Código QR del docente/coordinador responsable inválido, alterado o expirado.");
        }
        Usuario docente;
        String qrToken = dto.getQrDocente();
        if (qrToken.contains(":")) {
            String dni = qrToken.split(":")[0];
            docente = usuarioRepository.findByDni(dni)
                    .orElseThrow(() -> new IllegalArgumentException("El personal con DNI " + dni + " no está registrado en el sistema."));
        } else {
            UUID docenteId = jwtService.extractUsuarioId(qrToken);
            docente = usuarioRepository.findById(docenteId)
                    .orElseThrow(() -> new IllegalArgumentException("El personal especificado en el QR no está registrado en el sistema."));
        }

        if (docente.getRol() == Rol.ESTUDIANTE) {
            throw new IllegalArgumentException("Un estudiante no puede registrarse como responsable de un trabajo colegiado.");
        }

        // 2. Buscar Aula
        AulaAip aula = aulaAipRepository.findById(dto.getIdAulaAip())
                .orElseThrow(() -> new IllegalArgumentException("Aula AIP no encontrada con ID: " + dto.getIdAulaAip()));

        // 3. Crear cabecera de sesión grupal de tipo TRABAJO_COLEGIADO
        SesionGrupal sesion = new SesionGrupal(docente, aula, TipoOperacion.TRABAJO_COLEGIADO, dto.getArea());
        sesion.setDescripcion(dto.getDescripcion());
        sesion.setFirmaInicio(dto.getQrDocente());
        sesion = sesionGrupalRepository.save(sesion);

        // Retornar la respuesta (sin detalles de equipos asociados)
        return mapearASesionRespuesta(sesion, new ArrayList<>());
    }

    @Transactional
    public SesionRespuestaDto finalizarSesion(UUID idSesion) {
        return finalizarSesion(idSesion, null);
    }

    @Transactional
    public SesionRespuestaDto finalizarSesion(UUID idSesion, String qrDocente) {
        SesionGrupal sesion = sesionGrupalRepository.findById(idSesion)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no encontrada con ID: " + idSesion));

        if (sesion.getHoraFin() != null) {
            throw new IllegalArgumentException("La sesión ya ha sido finalizada previamente.");
        }

        // Validar que en Trabajo Colegiado la firma de salida sea obligatoria
        if (sesion.getTipoOperacion() == TipoOperacion.TRABAJO_COLEGIADO) {
            if (qrDocente == null || qrDocente.trim().isEmpty()) {
                throw new IllegalArgumentException("Firma de salida obligatoria: Debe escanear el QR del Coordinador responsable para finalizar.");
            }
        }

        // Validar y guardar firma de cierre si se provee
        if (qrDocente != null && !qrDocente.trim().isEmpty()) {
            if (!jwtService.validateQrToken(qrDocente)) {
                throw new IllegalArgumentException("Código QR de autorización de cierre inválido, alterado o expirado.");
            }
            String dniScanned = jwtService.extractDni(qrDocente);
            if (!sesion.getDocente().getDni().equals(dniScanned)) {
                throw new IllegalArgumentException("Autorización denegada: El QR escaneado no corresponde al docente responsable registrado.");
            }
            sesion.setFirmaFin(qrDocente);
        }

        // 1. Obtener detalles de la sesión
        List<SesionDetalle> detalles = sesionDetalleRepository.findBySesionGrupal_IdSesion(idSesion);

        // 2. Liberar los equipos involucrados devolviendo su ubicación a EN_AIP
        for (SesionDetalle detalle : detalles) {
            EquipoAip equipo = detalle.getEquipoAip();
            equipo.setUbicacionActual(UbicacionEquipo.EN_AIP);
            equipoAipRepository.save(equipo);
        }

        // 3. Establecer hora de fin
        sesion.setHoraFin(LocalDateTime.now());
        sesion = sesionGrupalRepository.save(sesion);
 
        return mapearASesionRespuesta(sesion, detalles);
    }

    @Transactional
    public SesionRespuestaDto devolverEquipoIndividual(String qrEquipo) {
        return devolverEquipoIndividual(qrEquipo, null);
    }

    @Transactional
    public SesionRespuestaDto devolverEquipoIndividual(String qrEquipo, String qrDocente) {
        EquipoAip equipo = equipoAipRepository.findByQrEquipo(qrEquipo)
                .orElseThrow(() -> new IllegalArgumentException("Equipo no registrado con código QR: " + qrEquipo));

        List<SesionDetalle> detallesActivos = sesionDetalleRepository
                .findByEquipoAip_QrEquipoAndSesionGrupal_HoraFinIsNull(qrEquipo);

        if (detallesActivos.isEmpty()) {
            if (equipo.getUbicacionActual() == UbicacionEquipo.PRESTADO_AULA) {
                equipo.setUbicacionActual(UbicacionEquipo.EN_AIP);
                equipoAipRepository.save(equipo);
            }
            throw new IllegalArgumentException("El equipo " + equipo.getCodPatrimonial() + " no está asociado a ninguna sesión activa.");
        }

        SesionDetalle detalle = detallesActivos.get(0);
        SesionGrupal sesion = detalle.getSesionGrupal();

        equipo.setUbicacionActual(UbicacionEquipo.EN_AIP);
        equipoAipRepository.save(equipo);

        List<SesionDetalle> todosDetalles = sesionDetalleRepository.findBySesionGrupal_IdSesion(sesion.getIdSesion());
        boolean quedanPrestados = todosDetalles.stream()
                .anyMatch(d -> d.getEquipoAip().getUbicacionActual() == UbicacionEquipo.PRESTADO_AULA);

        if (!quedanPrestados) {
            sesion.setHoraFin(LocalDateTime.now());
            if (qrDocente != null && !qrDocente.trim().isEmpty()) {
                if (!jwtService.validateQrToken(qrDocente)) {
                    throw new IllegalArgumentException("Código QR de autorización de cierre inválido, alterado o expirado.");
                }
                String dniScanned = jwtService.extractDni(qrDocente);
                if (!sesion.getDocente().getDni().equals(dniScanned)) {
                    throw new IllegalArgumentException("Autorización denegada: El QR escaneado no corresponde al docente responsable registrado.");
                }
                sesion.setFirmaFin(qrDocente);
            }
            sesionGrupalRepository.save(sesion);
        }

        return mapearASesionRespuesta(sesion, todosDetalles);
    }

    @Transactional(readOnly = true)
    public List<SesionRespuestaDto> obtenerSesionesActivas() {
        List<SesionGrupal> activas = sesionGrupalRepository.findByHoraFinIsNull();
        List<SesionRespuestaDto> resList = new ArrayList<>();
        for (SesionGrupal sg : activas) {
            List<SesionDetalle> detalles = sesionDetalleRepository.findBySesionGrupal_IdSesion(sg.getIdSesion());
            resList.add(mapearASesionRespuesta(sg, detalles));
        }
        return resList;
    }

    @Transactional(readOnly = true)
    public List<SesionRespuestaDto> obtenerHistorialSesiones() {
        List<SesionGrupal> historial = sesionGrupalRepository.findAllByOrderByHoraInicioDesc();
        List<SesionRespuestaDto> resList = new ArrayList<>();
        for (SesionGrupal sg : historial) {
            List<SesionDetalle> detalles = sesionDetalleRepository.findBySesionGrupal_IdSesion(sg.getIdSesion());
            resList.add(mapearASesionRespuesta(sg, detalles));
        }
        return resList;
    }

    @Transactional
    public void eliminarSesion(UUID idSesion) {
        SesionGrupal sesion = sesionGrupalRepository.findById(idSesion)
                .orElseThrow(() -> new IllegalArgumentException("Sesión no encontrada con ID: " + idSesion));

        // 1. Obtener detalles de la sesión
        List<SesionDetalle> detalles = sesionDetalleRepository.findBySesionGrupal_IdSesion(idSesion);

        // 2. Liberar los equipos involucrados devolviendo su ubicación a EN_AIP
        for (SesionDetalle detalle : detalles) {
            EquipoAip equipo = detalle.getEquipoAip();
            if (equipo.getUbicacionActual() == UbicacionEquipo.PRESTADO_AULA) {
                equipo.setUbicacionActual(UbicacionEquipo.EN_AIP);
                equipoAipRepository.save(equipo);
            }
        }

        // 3. Eliminar los detalles de la sesión
        sesionDetalleRepository.deleteAll(detalles);

        // 4. Eliminar la sesión grupal
        sesionGrupalRepository.delete(sesion);
    }

    private SesionRespuestaDto mapearASesionRespuesta(SesionGrupal sesion, List<SesionDetalle> detalles) {
        SesionRespuestaDto res = new SesionRespuestaDto();
        res.setIdSesion(sesion.getIdSesion());
        res.setDocenteNombre(sesion.getDocente().getNombres() + " " + sesion.getDocente().getApellidos());
        res.setAulaNombre(sesion.getAulaAip().getNombreAula());
        res.setTipoOperacion(sesion.getTipoOperacion());
        res.setGradoSeccion(sesion.getGradoSeccion());
        res.setDescripcion(sesion.getDescripcion());
        res.setFirmaInicio(sesion.getFirmaInicio());
        res.setFirmaFin(sesion.getFirmaFin());
        res.setHoraInicio(sesion.getHoraInicio());
        res.setHoraFin(sesion.getHoraFin());

        List<SesionRespuestaDto.SesionDetalleRespuestaDto> detalleDtos = detalles.stream().map(d -> {
            SesionRespuestaDto.SesionDetalleRespuestaDto detDto = new SesionRespuestaDto.SesionDetalleRespuestaDto();
            detDto.setIdDetalle(d.getIdDetalle());
            detDto.setCodPatrimonial(d.getEquipoAip().getCodPatrimonial());
            detDto.setTipoEquipo(d.getEquipoAip().getTipoEquipo().name());
            detDto.setIncidencias(d.getIncidencias());
            detDto.setNumSerie(d.getEquipoAip().getNumSerie());
            detDto.setQrEquipo(d.getEquipoAip().getQrEquipo());

            if (d.getEstudiante() != null) {
                detDto.setEstudianteNombre(d.getEstudiante().getNombres() + " " + d.getEstudiante().getApellidos());
                if (d.getEstudiante().getEstudiante() != null) {
                    detDto.setNumeroOrden(Integer.valueOf(d.getEstudiante().getEstudiante().getNumeroOrden()));
                }
            }
            return detDto;
        }).collect(Collectors.toList());

        res.setDetalles(detalleDtos);
        return res;
    }
}

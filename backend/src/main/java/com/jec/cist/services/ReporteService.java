package com.jec.cist.services;

import com.jec.cist.dtos.ReporteUsoAipDto;
import com.jec.cist.dtos.ReporteUsoAipDto.CursoReporteDto;
import com.jec.cist.dtos.ReporteUsoAipDto.DocenteReporteDto;
import com.jec.cist.dtos.ReporteUsoAipDto.ResumenDto;
import com.jec.cist.models.Curso;
import com.jec.cist.models.ReservaAulaAip;
import com.jec.cist.models.Rol;
import com.jec.cist.models.SesionGrupal;
import com.jec.cist.models.TipoOperacion;
import com.jec.cist.models.Usuario;
import com.jec.cist.repositories.CursoRepository;
import com.jec.cist.repositories.ReservaAulaAipRepository;
import com.jec.cist.repositories.SesionGrupalRepository;
import com.jec.cist.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;
    private final ReservaAulaAipRepository reservaRepository;
    private final SesionGrupalRepository sesionGrupalRepository;

    public ReporteService(
            UsuarioRepository usuarioRepository,
            CursoRepository cursoRepository,
            ReservaAulaAipRepository reservaRepository,
            SesionGrupalRepository sesionGrupalRepository) {
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
        this.reservaRepository = reservaRepository;
        this.sesionGrupalRepository = sesionGrupalRepository;
    }

    @Transactional(readOnly = true)
    public ReporteUsoAipDto obtenerReporteUsoAip(LocalDate start, LocalDate end) {
        // En caso de que las fechas sean nulas, tomamos valores por defecto
        if (start == null) {
            start = LocalDate.now().minusDays(30);
        }
        if (end == null) {
            end = LocalDate.now();
        }

        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.atTime(LocalTime.MAX);

        // 1. Obtener datos de la BD en el rango de fechas
        List<ReservaAulaAip> reservas = reservaRepository.findByFechaBetweenOrderByFechaAscHoraInicioAsc(start, end);
        List<SesionGrupal> sesiones = sesionGrupalRepository.findByHoraInicioBetweenOrderByHoraInicioAsc(startDateTime, endDateTime);

        // 2. Calcular Resumen Global
        int totalClases = 0;
        int totalColegiados = 0;
        int usoPrincipal = 0;
        int usoSecundaria = 0;

        for (SesionGrupal s : sesiones) {
            if (s.getTipoOperacion() == TipoOperacion.CLASE_INTERNA) {
                totalClases++;
            } else if (s.getTipoOperacion() == TipoOperacion.TRABAJO_COLEGIADO) {
                totalColegiados++;
            }

            if (s.getAulaAip().getIdAula().equals(1)) {
                usoPrincipal++;
            } else {
                usoSecundaria++;
            }
        }

        ResumenDto resumen = new ResumenDto(
                totalClases,
                totalColegiados,
                reservas.size(),
                usoPrincipal,
                usoSecundaria
        );

        // 3. Generar estadísticas por Docente
        List<Usuario> docentes = usuarioRepository.findByRol(Rol.DOCENTE);
        List<DocenteReporteDto> docentesStats = new ArrayList<>();

        for (Usuario doc : docentes) {
            UUID idDocente = doc.getIdUsuario();
            List<Curso> cursosDocente = cursoRepository.findByDocenteIdUsuario(idDocente);

            // Filtrar reservas y sesiones del docente actual
            List<ReservaAulaAip> reservasDoc = reservas.stream()
                    .filter(r -> r.getDocente().getIdUsuario().equals(idDocente))
                    .collect(Collectors.toList());

            List<SesionGrupal> sesionesDoc = sesiones.stream()
                    .filter(s -> s.getDocente().getIdUsuario().equals(idDocente))
                    .collect(Collectors.toList());

            int totalSesionesDoc = (int) sesionesDoc.stream()
                    .filter(s -> s.getTipoOperacion() == TipoOperacion.CLASE_INTERNA)
                    .count();

            int totalColegiadosDoc = (int) sesionesDoc.stream()
                    .filter(s -> s.getTipoOperacion() == TipoOperacion.TRABAJO_COLEGIADO)
                    .count();

            List<CursoReporteDto> cursosReporte = new ArrayList<>();

            for (Curso c : cursosDocente) {
                int reservasCurso = 0;
                int sesionesCurso = 0;

                // Contar reservas para este curso
                for (ReservaAulaAip r : reservasDoc) {
                    if (r.getGrado().equals(c.getGrado()) && r.getSeccion().equalsIgnoreCase(c.getSeccion())) {
                        // Si hay varios cursos del mismo docente en esta sección, cruzamos por el motivo
                        if (cursosDocente.stream().filter(cur -> cur.getGrado().equals(c.getGrado()) && cur.getSeccion().equalsIgnoreCase(c.getSeccion())).count() > 1) {
                            if (r.getMotivo() != null && r.getMotivo().toLowerCase().contains(c.getNombre().toLowerCase())) {
                                reservasCurso++;
                            }
                        } else {
                            reservasCurso++;
                        }
                    }
                }

                // Contar sesiones para este curso
                for (SesionGrupal s : sesionesDoc) {
                    if (s.getTipoOperacion() == TipoOperacion.CLASE_INTERNA && s.getGradoSeccion() != null) {
                        ParsedGradoSeccion p = parseGradoSeccion(s.getGradoSeccion());
                        if (p != null && p.grado.equals(c.getGrado()) && p.seccion.equalsIgnoreCase(c.getSeccion())) {
                            if (cursosDocente.stream().filter(cur -> cur.getGrado().equals(c.getGrado()) && cur.getSeccion().equalsIgnoreCase(c.getSeccion())).count() > 1) {
                                if (s.getDescripcion() != null && s.getDescripcion().toLowerCase().contains(c.getNombre().toLowerCase())) {
                                    sesionesCurso++;
                                }
                            } else {
                                sesionesCurso++;
                            }
                        }
                    }
                }

                // Clasificar el estado de cumplimiento:
                // - OPTIMO: 6 o más visitas en el periodo
                // - BAJO: de 1 a 5 visitas
                // - SIN_USO: 0 visitas
                String estado = "SIN_USO";
                if (sesionesCurso >= 6) {
                    estado = "OPTIMO";
                } else if (sesionesCurso >= 1) {
                    estado = "BAJO";
                }

                cursosReporte.add(new CursoReporteDto(
                        c.getIdCurso(),
                        c.getNombre(),
                        c.getGrado(),
                        c.getSeccion(),
                        c.getNrc(),
                        sesionesCurso,
                        reservasCurso,
                        estado
                ));
            }

            docentesStats.add(new DocenteReporteDto(
                    idDocente,
                    doc.getNombres(),
                    doc.getApellidos(),
                    totalSesionesDoc,
                    totalColegiadosDoc,
                    reservasDoc.size(),
                    cursosReporte
            ));
        }

        return new ReporteUsoAipDto(resumen, docentesStats);
    }

    // Helper class for parsing grado and seccion from gradoSeccion string
    private static class ParsedGradoSeccion {
        Short grado;
        String seccion;

        ParsedGradoSeccion(Short grado, String seccion) {
            this.grado = grado;
            this.seccion = seccion;
        }
    }

    private ParsedGradoSeccion parseGradoSeccion(String gradoSeccionStr) {
        if (gradoSeccionStr == null) return null;
        Pattern p = Pattern.compile("(\\d)\\s*(?:ro|do|er|to|grade|año|°)?\\s*([A-Za-z]+)", Pattern.CASE_INSENSITIVE);
        Matcher m = p.matcher(gradoSeccionStr);
        if (m.find()) {
            try {
                Short grado = Short.parseShort(m.group(1));
                String seccion = m.group(2).toUpperCase();
                return new ParsedGradoSeccion(grado, seccion);
            } catch (Exception e) {
                // ignore
            }
        } else {
            // Intentar parser simplificado
            Pattern pSimpleNum = Pattern.compile("(\\d)");
            Pattern pSimpleChar = Pattern.compile("([A-Za-z]+)");
            Matcher mNum = pSimpleNum.matcher(gradoSeccionStr);
            Matcher mChar = pSimpleChar.matcher(gradoSeccionStr);
            if (mNum.find() && mChar.find()) {
                try {
                    Short grado = Short.parseShort(mNum.group(1));
                    String seccion = mChar.group(1).toUpperCase();
                    return new ParsedGradoSeccion(grado, seccion);
                } catch (Exception e) {
                    // ignore
                }
            }
        }
        return null;
    }
}

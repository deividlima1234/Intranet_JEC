package com.jec.cist.services;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jec.cist.models.EncuestaCIST;
import com.jec.cist.models.RespuestaEncuesta;
import com.jec.cist.models.Usuario;
import com.jec.cist.repositories.EncuestaRepository;
import com.jec.cist.repositories.RespuestaEncuestaRepository;
import com.jec.cist.repositories.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.StringWriter;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class EncuestaService {

    private final EncuestaRepository encuestaRepository;
    private final RespuestaEncuestaRepository respuestaRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    public EncuestaService(EncuestaRepository encuestaRepository,
                           RespuestaEncuestaRepository respuestaRepository,
                           UsuarioRepository usuarioRepository) {
        this.encuestaRepository = encuestaRepository;
        this.respuestaRepository = respuestaRepository;
        this.usuarioRepository = usuarioRepository;
        this.objectMapper = new ObjectMapper();
    }

    // ============================
    // CRUD de Encuestas (CIST)
    // ============================

    @Transactional
    public Map<String, Object> crearEncuesta(String titulo, String descripcion, String rolesHabilitados, String dniCreador) {
        Usuario creador = usuarioRepository.findByDni(dniCreador).orElse(null);
        EncuestaCIST encuesta = new EncuestaCIST(titulo, descripcion, creador, rolesHabilitados);
        encuestaRepository.save(encuesta);
        return mapEncuesta(encuesta, 0L);
    }

    @Transactional
    public Map<String, Object> toggleEstado(UUID idEncuesta, boolean activa) {
        EncuestaCIST encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new IllegalArgumentException("Encuesta no encontrada"));

        // Si se va a activar, desactivar las demás primero
        if (activa) {
            List<EncuestaCIST> activas = encuestaRepository.findByActivaTrue();
            for (EncuestaCIST e : activas) {
                e.setActiva(false);
                encuestaRepository.save(e);
            }
        }

        encuesta.setActiva(activa);
        encuestaRepository.save(encuesta);
        long total = respuestaRepository.countByEncuesta(encuesta);
        return mapEncuesta(encuesta, total);
    }

    @Transactional
    public void eliminarEncuesta(UUID idEncuesta) {
        EncuestaCIST encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new IllegalArgumentException("Encuesta no encontrada"));
        respuestaRepository.deleteAll(respuestaRepository.findByEncuestaOrderByFechaRespuestaDesc(encuesta));
        encuestaRepository.delete(encuesta);
    }

    // ============================
    // Consultas de Encuesta
    // ============================

    public List<Map<String, Object>> listarTodasEncuestas() {
        List<EncuestaCIST> encuestas = encuestaRepository.findAllByOrderByFechaCreacionDesc();
        List<Map<String, Object>> resultado = new ArrayList<>();
        for (EncuestaCIST e : encuestas) {
            long total = respuestaRepository.countByEncuesta(e);
            resultado.add(mapEncuesta(e, total));
        }
        return resultado;
    }

    public Map<String, Object> obtenerEncuestaActiva(String rol) {
        Optional<EncuestaCIST> activaOpt = encuestaRepository.findFirstByActivaTrue();
        if (activaOpt.isEmpty()) {
            return null;
        }
        EncuestaCIST encuesta = activaOpt.get();

        // Verificar si el rol puede participar
        if (!rolPuedeResponder(encuesta, rol)) {
            return null;
        }

        long total = respuestaRepository.countByEncuesta(encuesta);
        return mapEncuesta(encuesta, total);
    }

    // ============================
    // Respuestas
    // ============================

    @Transactional
    public Map<String, Object> registrarRespuesta(UUID idEncuesta, String dniUsuario, String respuestasJson) {
        EncuestaCIST encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new IllegalArgumentException("Encuesta no encontrada"));

        if (!encuesta.isActiva()) {
            throw new IllegalArgumentException("La encuesta no está activa actualmente.");
        }

        Usuario usuario = usuarioRepository.findByDni(dniUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con DNI: " + dniUsuario));

        if (respuestaRepository.existsByEncuestaAndUsuario(encuesta, usuario)) {
            throw new IllegalArgumentException("El usuario ya respondió esta encuesta.");
        }

        // Verificar que el rol puede responder
        String rol = usuario.getRol().name();
        if (!rolPuedeResponder(encuesta, rol)) {
            throw new IllegalArgumentException("Su rol no está habilitado para responder esta encuesta.");
        }

        // Extraer área curricular del JSON de respuestas
        String areaCurricular = null;
        try {
            JsonNode node = objectMapper.readTree(respuestasJson);
            JsonNode sec1 = node.path("seccion1");
            if (!sec1.isMissingNode()) {
                JsonNode q1 = sec1.path("q1");
                if (!q1.isMissingNode()) {
                    areaCurricular = q1.asText();
                }
            }
        } catch (Exception ignored) {}

        RespuestaEncuesta respuesta = new RespuestaEncuesta(encuesta, usuario, respuestasJson, areaCurricular, rol);
        respuestaRepository.save(respuesta);
        return mapRespuesta(respuesta);
    }

    public Map<String, Object> obtenerMiRespuesta(UUID idEncuesta, String dniUsuario) {
        EncuestaCIST encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new IllegalArgumentException("Encuesta no encontrada"));
        Usuario usuario = usuarioRepository.findByDni(dniUsuario)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));

        Optional<RespuestaEncuesta> respuestaOpt = respuestaRepository.findByEncuestaAndUsuario(encuesta, usuario);
        return respuestaOpt.map(this::mapRespuesta).orElse(null);
    }

    // ============================
    // Resultados para CIST/PIP
    // ============================

    public Map<String, Object> obtenerResultados(UUID idEncuesta) {
        EncuestaCIST encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new IllegalArgumentException("Encuesta no encontrada"));

        List<RespuestaEncuesta> respuestas = respuestaRepository.findByEncuestaOrderByFechaRespuestaDesc(encuesta);

        // Agregar estadísticas por pregunta
        Map<String, Map<String, Long>> estadisticasPorPregunta = new LinkedHashMap<>();
        List<String> respuestasLibres = new ArrayList<>();
        List<Map<String, Object>> detalleRespondentes = new ArrayList<>();

        for (RespuestaEncuesta r : respuestas) {
            try {
                JsonNode root = objectMapper.readTree(r.getRespuestasJson());

                // Iterar todas las secciones y preguntas
                root.properties().forEach(sectionEntry -> {
                    String seccionKey = sectionEntry.getKey();
                    JsonNode seccion = sectionEntry.getValue();

                    seccion.properties().forEach(preguntaEntry -> {
                        String preguntaKey = seccionKey + "_" + preguntaEntry.getKey();
                        JsonNode valor = preguntaEntry.getValue();

                        // Texto libre (seccion4_q9) - acumular por separado
                        if (preguntaKey.equals("seccion4_q9")) {
                            if (!valor.asText().isBlank()) {
                                respuestasLibres.add(valor.asText());
                            }
                            return;
                        }

                        estadisticasPorPregunta.putIfAbsent(preguntaKey, new LinkedHashMap<>());
                        Map<String, Long> conteo = estadisticasPorPregunta.get(preguntaKey);

                        if (valor.isArray()) {
                            valor.forEach(v -> {
                                String k = v.asText();
                                conteo.merge(k, 1L, Long::sum);
                            });
                        } else {
                            String k = valor.asText();
                            if (!k.isBlank() && !k.equals("null")) {
                                conteo.merge(k, 1L, Long::sum);
                            }
                        }
                    });
                });

                // Detalle del respondente
                Map<String, Object> detalle = new LinkedHashMap<>();
                detalle.put("idRespuesta", r.getIdRespuesta().toString());
                detalle.put("nombres", r.getUsuario().getNombres());
                detalle.put("apellidos", r.getUsuario().getApellidos());
                detalle.put("dni", r.getUsuario().getDni());
                detalle.put("rol", r.getRolRespondente());
                detalle.put("areaCurricular", r.getAreaCurricular());
                detalle.put("fechaRespuesta", r.getFechaRespuesta().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
                detalleRespondentes.add(detalle);

            } catch (Exception ignored) {}
        }

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("encuesta", mapEncuesta(encuesta, respuestas.size()));
        resultado.put("totalRespuestas", respuestas.size());
        resultado.put("estadisticas", estadisticasPorPregunta);
        resultado.put("respuestasLibres", respuestasLibres);
        resultado.put("respondentes", detalleRespondentes);
        return resultado;
    }

    // ============================
    // Exportación CSV
    // ============================

    public String exportarCsv(UUID idEncuesta) {
        EncuestaCIST encuesta = encuestaRepository.findById(idEncuesta)
                .orElseThrow(() -> new IllegalArgumentException("Encuesta no encontrada"));

        List<RespuestaEncuesta> respuestas = respuestaRepository.findByEncuestaOrderByFechaRespuestaDesc(encuesta);

        StringWriter sw = new StringWriter();
        // Encabezado
        sw.append("DNI,Nombres,Apellidos,Rol,AreaCurricular,FechaRespuesta,Sec1_Q1_Area,Sec1_Q2_HorasAdmin,")
          .append("Sec2_Q3_SimuladoresCyT,Sec2_Q4_DinamicaLetras,Sec2_Q5_RecursoIngles,Sec2_Q6_AlmacenamientoEPT,")
          .append("Sec3_Q7_FormatoEvaluacion,Sec3_Q8_TiposInsignias,")
          .append("Sec4_Q9_PuntoDolor,")
          .append("Sec5_Q10_ConectividadProblemas,Sec5_Q11_DispositivosEstudiantes,Sec5_Q12_ComodoIntranet,")
          .append("Sec6_Q13_ModulosPrioritarios\n");

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        for (RespuestaEncuesta r : respuestas) {
            try {
                JsonNode root = objectMapper.readTree(r.getRespuestasJson());

                sw.append(escapeCsv(r.getUsuario().getDni())).append(",");
                sw.append(escapeCsv(r.getUsuario().getNombres())).append(",");
                sw.append(escapeCsv(r.getUsuario().getApellidos())).append(",");
                sw.append(escapeCsv(r.getRolRespondente())).append(",");
                sw.append(escapeCsv(r.getAreaCurricular())).append(",");
                sw.append(escapeCsv(r.getFechaRespuesta().format(fmt))).append(",");

                // Sección 1
                sw.append(escapeCsv(getJsonVal(root, "seccion1", "q1"))).append(",");
                sw.append(escapeCsv(getJsonVal(root, "seccion1", "q2"))).append(",");

                // Sección 2
                sw.append(escapeCsv(getJsonArrayVal(root, "seccion2", "q3"))).append(",");
                sw.append(escapeCsv(getJsonVal(root, "seccion2", "q4"))).append(",");
                sw.append(escapeCsv(getJsonVal(root, "seccion2", "q5"))).append(",");
                sw.append(escapeCsv(getJsonVal(root, "seccion2", "q6"))).append(",");

                // Sección 3
                sw.append(escapeCsv(getJsonVal(root, "seccion3", "q7"))).append(",");
                sw.append(escapeCsv(getJsonArrayVal(root, "seccion3", "q8"))).append(",");

                // Sección 4
                sw.append(escapeCsv(getJsonVal(root, "seccion4", "q9"))).append(",");

                // Sección 5
                sw.append(escapeCsv(getJsonVal(root, "seccion5", "q10"))).append(",");
                sw.append(escapeCsv(getJsonVal(root, "seccion5", "q11"))).append(",");
                sw.append(escapeCsv(getJsonVal(root, "seccion5", "q12"))).append(",");

                // Sección 6
                sw.append(escapeCsv(getJsonArrayVal(root, "seccion6", "q13"))).append("\n");

            } catch (Exception e) {
                sw.append("ERROR al procesar respuesta\n");
            }
        }

        return sw.toString();
    }

    // ============================
    // Helpers Privados
    // ============================

    private boolean rolPuedeResponder(EncuestaCIST encuesta, String rol) {
        String roles = encuesta.getRolesHabilitados();
        if (roles == null || roles.equalsIgnoreCase("TODOS")) return true;
        return Arrays.asList(roles.split(",")).stream()
                .map(String::trim)
                .anyMatch(r -> r.equalsIgnoreCase(rol));
    }

    private Map<String, Object> mapEncuesta(EncuestaCIST e, long totalRespuestas) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("idEncuesta", e.getIdEncuesta().toString());
        map.put("titulo", e.getTitulo());
        map.put("descripcion", e.getDescripcion());
        map.put("activa", e.isActiva());
        map.put("rolesHabilitados", e.getRolesHabilitados());
        map.put("fechaCreacion", e.getFechaCreacion().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        map.put("totalRespuestas", totalRespuestas);
        if (e.getCreadaPor() != null) {
            map.put("creadaPorNombre", e.getCreadaPor().getNombres() + " " + e.getCreadaPor().getApellidos());
        }
        return map;
    }

    private Map<String, Object> mapRespuesta(RespuestaEncuesta r) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("idRespuesta", r.getIdRespuesta().toString());
        map.put("idEncuesta", r.getEncuesta().getIdEncuesta().toString());
        map.put("tituloEncuesta", r.getEncuesta().getTitulo());
        map.put("dni", r.getUsuario().getDni());
        map.put("nombres", r.getUsuario().getNombres());
        map.put("apellidos", r.getUsuario().getApellidos());
        map.put("rol", r.getRolRespondente());
        map.put("areaCurricular", r.getAreaCurricular());
        map.put("fechaRespuesta", r.getFechaRespuesta().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        map.put("respuestasJson", r.getRespuestasJson());
        return map;
    }

    private String getJsonVal(JsonNode root, String section, String key) {
        try {
            JsonNode val = root.path(section).path(key);
            if (val.isMissingNode() || val.isNull()) return "";
            return val.asText();
        } catch (Exception e) {
            return "";
        }
    }

    private String getJsonArrayVal(JsonNode root, String section, String key) {
        try {
            JsonNode val = root.path(section).path(key);
            if (val.isMissingNode() || val.isNull()) return "";
            if (val.isArray()) {
                List<String> items = new ArrayList<>();
                val.forEach(v -> items.add(v.asText()));
                return String.join("|", items);
            }
            return val.asText();
        } catch (Exception e) {
            return "";
        }
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}

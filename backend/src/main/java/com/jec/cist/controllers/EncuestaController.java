package com.jec.cist.controllers;

import com.jec.cist.services.EncuestaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/encuestas")
@Tag(name = "Encuestas CIST", description = "Módulo de Levantamiento de Requerimientos - Encuestas para todos los roles")
public class EncuestaController {

    private final EncuestaService encuestaService;

    public EncuestaController(EncuestaService encuestaService) {
        this.encuestaService = encuestaService;
    }

    // ============================
    // Endpoints Públicos (todos los roles autenticados)
    // ============================

    @GetMapping("/activa")
    @Operation(summary = "Obtener encuesta activa", description = "Retorna la encuesta activa si el rol del usuario está habilitado para responderla.")
    public ResponseEntity<?> obtenerEncuestaActiva(@RequestParam String rol) {
        Map<String, Object> encuesta = encuestaService.obtenerEncuestaActiva(rol);
        if (encuesta == null) {
            return ResponseEntity.ok(Map.of("mensaje", "No hay encuesta activa disponible para su rol."));
        }
        return ResponseEntity.ok(encuesta);
    }

    @PostMapping("/{id}/responder")
    @Operation(summary = "Enviar respuesta a encuesta", description = "Permite a un usuario responder la encuesta. Solo se permite una respuesta por usuario.")
    public ResponseEntity<?> responder(
            @PathVariable UUID id,
            @RequestParam String dniUsuario,
            @RequestBody String respuestasJson) {
        try {
            Map<String, Object> respuesta = encuestaService.registrarRespuesta(id, dniUsuario, respuestasJson);
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/mi-respuesta")
    @Operation(summary = "Obtener mi respuesta", description = "Retorna la respuesta del usuario autenticado en una encuesta específica.")
    public ResponseEntity<?> obtenerMiRespuesta(
            @PathVariable UUID id,
            @RequestParam String dniUsuario) {
        try {
            Map<String, Object> respuesta = encuestaService.obtenerMiRespuesta(id, dniUsuario);
            if (respuesta == null) {
                return ResponseEntity.ok(Map.of("respondido", false));
            }
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ============================
    // Endpoints de Gestión (CIST/PIP)
    // ============================

    @GetMapping
    @Operation(summary = "Listar todas las encuestas", description = "Retorna todas las encuestas creadas. Acceso: CIST y PIP.")
    public ResponseEntity<List<Map<String, Object>>> listarEncuestas() {
        return ResponseEntity.ok(encuestaService.listarTodasEncuestas());
    }

    @PostMapping
    @Operation(summary = "Crear nueva encuesta", description = "Crea una nueva encuesta. Acceso: CIST.")
    public ResponseEntity<?> crearEncuesta(@RequestBody Map<String, String> body) {
        try {
            String titulo = body.get("titulo");
            String descripcion = body.get("descripcion");
            String rolesHabilitados = body.getOrDefault("rolesHabilitados", "DOCENTE");
            String dniCreador = body.get("dniCreador");
            Map<String, Object> encuesta = encuestaService.crearEncuesta(titulo, descripcion, rolesHabilitados, dniCreador);
            return ResponseEntity.status(201).body(encuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Activar/Desactivar encuesta", description = "Cambia el estado activo de la encuesta. Solo puede haber una activa a la vez. Acceso: CIST.")
    public ResponseEntity<?> toggleEstado(
            @PathVariable UUID id,
            @RequestParam boolean activa) {
        try {
            Map<String, Object> encuesta = encuestaService.toggleEstado(id, activa);
            return ResponseEntity.ok(encuesta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar encuesta", description = "Elimina una encuesta y todas sus respuestas. Acceso: CIST.")
    public ResponseEntity<?> eliminarEncuesta(@PathVariable UUID id) {
        try {
            encuestaService.eliminarEncuesta(id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/resultados")
    @Operation(summary = "Ver resultados de la encuesta", description = "Retorna estadísticas agregadas y lista de respondentes. Acceso: CIST y PIP.")
    public ResponseEntity<?> obtenerResultados(@PathVariable UUID id) {
        try {
            return ResponseEntity.ok(encuestaService.obtenerResultados(id));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}/exportar-csv")
    @Operation(summary = "Exportar respuestas a CSV", description = "Genera y descarga un archivo CSV con todas las respuestas de la encuesta. Acceso: CIST.")
    public ResponseEntity<byte[]> exportarCsv(@PathVariable UUID id) {
        try {
            String csv = encuestaService.exportarCsv(id);
            byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"encuesta_resultados.csv\"")
                    .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                    .body(bytes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

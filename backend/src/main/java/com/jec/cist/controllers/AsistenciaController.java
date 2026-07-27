package com.jec.cist.controllers;

import com.jec.cist.dtos.AsistenciaConfiguracionDto;
import com.jec.cist.dtos.AsistenciaManualRequestDto;
import com.jec.cist.dtos.AsistenciaScanRequestDto;
import com.jec.cist.dtos.AsistenciaRespuestaDto;
import com.jec.cist.services.AsistenciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/asistencias")
@Tag(name = "Control de Asistencia", description = "Endpoints para registro de asistencia por QR, manual, configuraciones y reportes")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping("/configuracion")
    @Operation(summary = "Obtener configuración de horarios de asistencia")
    public ResponseEntity<AsistenciaConfiguracionDto> obtenerConfiguracion() {
        return ResponseEntity.ok(asistenciaService.obtenerConfiguracion());
    }

    @PostMapping("/configuracion")
    @Operation(summary = "Guardar configuración de horarios de asistencia")
    public ResponseEntity<?> guardarConfiguracion(@Valid @RequestBody AsistenciaConfiguracionDto dto) {
        asistenciaService.guardarConfiguracion(dto);
        Map<String, String> res = new HashMap<>();
        res.put("message", "Configuración de horarios guardada exitosamente.");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/escanear")
    @Operation(summary = "Registrar asistencia mediante escaneo de código QR")
    public ResponseEntity<?> registrarAsistenciaQr(@Valid @RequestBody AsistenciaScanRequestDto dto) {
        try {
            AsistenciaRespuestaDto respuesta = asistenciaService.registrarAsistenciaQr(dto.getQrToken(), dto.getGradoTablet());
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            Map<String, String> res = new HashMap<>();
            res.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }
    }

    @PostMapping("/manual")
    @Operation(summary = "Registrar o modificar asistencia manualmente")
    public ResponseEntity<?> registrarAsistenciaManual(@Valid @RequestBody AsistenciaManualRequestDto dto) {
        try {
            AsistenciaRespuestaDto respuesta = asistenciaService.registrarAsistenciaManual(dto);
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            Map<String, String> res = new HashMap<>();
            res.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
        }
    }

    @PostMapping("/lote-faltas")
    @Operation(summary = "Registrar inasistencias en lote para estudiantes sin registro")
    public ResponseEntity<?> registrarFaltasDelDia(
            @RequestParam(required = false) Short grado,
            @RequestParam(required = false) String seccion) {
        int registrados = asistenciaService.registrarFaltasDelDia(grado, seccion);
        Map<String, Object> res = new HashMap<>();
        res.put("message", "Faltas registradas exitosamente.");
        res.put("cantidad", registrados);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/dia")
    @Operation(summary = "Obtener control de asistencia de un día específico por grado y sección")
    public ResponseEntity<List<AsistenciaRespuestaDto>> obtenerControlAsistenciaDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam Short grado,
            @RequestParam String seccion) {
        return ResponseEntity.ok(asistenciaService.obtenerControlAsistenciaDia(fecha, grado, seccion));
    }

    @GetMapping("/estudiante/{idEstudiante}")
    @Operation(summary = "Obtener historial de asistencia de un estudiante")
    public ResponseEntity<List<AsistenciaRespuestaDto>> obtenerHistorialEstudiante(@PathVariable UUID idEstudiante) {
        return ResponseEntity.ok(asistenciaService.obtenerHistorialEstudiante(idEstudiante));
    }

    @GetMapping("/reporte")
    @Operation(summary = "Obtener reporte de asistencias por rango de fechas")
    public ResponseEntity<List<AsistenciaRespuestaDto>> obtenerReporteAsistencias(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false) Short grado,
            @RequestParam(required = false) String seccion) {
        return ResponseEntity.ok(asistenciaService.obtenerReporteAsistencias(inicio, fin, grado, seccion));
    }
}

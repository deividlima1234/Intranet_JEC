package com.jec.cist.controllers;

import com.jec.cist.dtos.ReporteUsoAipDto;
import com.jec.cist.models.Rol;
import com.jec.cist.models.Usuario;
import com.jec.cist.repositories.UsuarioRepository;
import com.jec.cist.services.ReporteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reportes")
@Tag(name = "Reportes y Estadísticas AIP", description = "Endpoints para la gestión y visualización de informes de uso de aulas AIP, exclusivo para el CIST")
public class ReporteController {

    private final ReporteService reporteService;
    private final UsuarioRepository usuarioRepository;

    public ReporteController(ReporteService reporteService, UsuarioRepository usuarioRepository) {
        this.reporteService = reporteService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/uso-aip")
    @Operation(summary = "Obtener informe estadístico de uso de aulas AIP", description = "Retorna un reporte detallado del uso por profesores, cursos y horas colegiadas. Acceso restringido al rol CIST.")
    @ApiResponse(responseCode = "200", description = "Informe generado con éxito")
    @ApiResponse(responseCode = "403", description = "Acceso denegado, rol insuficiente")
    @ApiResponse(responseCode = "400", description = "Usuario no registrado o parámetros inválidos")
    public ResponseEntity<?> obtenerReporteUsoAip(
            @RequestParam UUID idUsuario,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        try {
            // 1. Validar existencia del usuario
            Usuario solicitante = usuarioRepository.findById(idUsuario)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario solicitante no registrado en el sistema."));

            // 2. Restringir el acceso: Solo CIST puede acceder a los reportes
            if (solicitante.getRol() != Rol.CIST) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Acceso denegado: Solo el Coordinador CIST tiene autorización para visualizar los informes y estadísticas del Aula AIP."));
            }

            // 3. Generar y retornar el reporte
            ReporteUsoAipDto reporte = reporteService.obtenerReporteUsoAip(fechaInicio, fechaFin);
            return ResponseEntity.ok(reporte);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error al procesar el reporte en el servidor: " + e.getMessage()));
        }
    }
}

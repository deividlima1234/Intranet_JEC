package com.jec.cist.controllers;

import com.jec.cist.dtos.ReservaAulaAipRegistroDto;
import com.jec.cist.dtos.ReservaAulaAipRespuestaDto;
import com.jec.cist.models.AulaAip;
import com.jec.cist.repositories.AulaAipRepository;
import com.jec.cist.services.ReservaAulaAipService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reservas")
@Tag(name = "Reservas de Aula AIP", description = "Endpoints para el agendamiento y reserva interactiva del Aula de Innovación Pedagógica")
public class ReservaAulaAipController {

    private final ReservaAulaAipService reservaService;
    private final AulaAipRepository aulaAipRepository;

    public ReservaAulaAipController(ReservaAulaAipService reservaService, AulaAipRepository aulaAipRepository) {
        this.reservaService = reservaService;
        this.aulaAipRepository = aulaAipRepository;
    }

    @PostMapping
    @Operation(summary = "Crear una nueva reserva de Aula AIP", description = "Registra una reserva para un aula AIP. Valida traslapes y permisos de docente.")
    @ApiResponse(responseCode = "201", description = "Reserva creada exitosamente")
    @ApiResponse(responseCode = "400", description = "Error de traslape, datos inválidos o rol insuficiente")
    public ResponseEntity<?> crearReserva(@Valid @RequestBody ReservaAulaAipRegistroDto dto) {
        try {
            ReservaAulaAipRespuestaDto respuesta = reservaService.crearReserva(dto);
            return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping
    @Operation(summary = "Listar reservas filtradas por usuario y fecha", description = "Retorna las reservas de una semana. Aplica reglas de privacidad según el rol del usuario.")
    public ResponseEntity<?> listarReservas(
            @RequestParam UUID idUsuario,
            @RequestParam(required = false) Integer idAula,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin) {
        try {
            List<ReservaAulaAipRespuestaDto> respuesta = reservaService.listarReservas(idUsuario, idAula, fechaInicio, fechaFin);
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar/anular una reserva de Aula AIP", description = "Cancela una reserva. Solo el CIST o el docente creador pueden eliminarla.")
    @ApiResponse(responseCode = "200", description = "Reserva eliminada con éxito")
    @ApiResponse(responseCode = "400", description = "Reserva no encontrada o falta de permisos")
    public ResponseEntity<?> eliminarReserva(
            @PathVariable UUID id,
            @RequestParam UUID idUsuario) {
        try {
            reservaService.eliminarReserva(id, idUsuario);
            return ResponseEntity.ok(java.util.Map.of("message", "Reserva cancelada con éxito"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/aulas")
    @Operation(summary = "Listar todas las Aulas AIP", description = "Retorna la lista de aulas AIP registradas en el sistema para mostrarlas en el planificador.")
    public ResponseEntity<List<AulaAip>> obtenerAulasAip() {
        return ResponseEntity.ok(aulaAipRepository.findAll());
    }
}

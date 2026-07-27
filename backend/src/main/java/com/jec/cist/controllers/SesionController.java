package com.jec.cist.controllers;

import com.jec.cist.dtos.IniciarClaseDto;
import com.jec.cist.dtos.IniciarColegiadoDto;
import com.jec.cist.dtos.RegistrarPrestamoDto;
import com.jec.cist.dtos.SesionRespuestaDto;
import com.jec.cist.services.SesionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;
import java.util.List;

@RestController
@RequestMapping("/api/v1/sesiones")
@Tag(name = "Sesiones y Transacciones", description = "Endpoints para el control transaccional del emparejamiento de equipos (Modo Clase) y préstamos de tabletas")
public class SesionController {

    private final SesionService sesionService;

    public SesionController(SesionService sesionService) {
        this.sesionService = sesionService;
    }

    @GetMapping("/activas")
    @Operation(summary = "Listar sesiones grupales activas", description = "Recupera todas las sesiones de clase o préstamos externos activos (que no se han cerrado) con el detalle de equipos asignados.")
    @ApiResponse(responseCode = "200", description = "Lista de sesiones activas recuperada exitosamente")
    public ResponseEntity<List<SesionRespuestaDto>> obtenerSesionesActivas() {
        List<SesionRespuestaDto> respuesta = sesionService.obtenerSesionesActivas();
        return ResponseEntity.ok(respuesta);
    }

    @PostMapping("/iniciar-clase")
    @Operation(summary = "Iniciar sesión grupal Modo Clase", description = "Abre una sesión de clase AIP asignando automáticamente laptops a los estudiantes de la sección por número de orden.")
    @ApiResponse(responseCode = "201", description = "Clase iniciada y equipos emparejados exitosamente")
    @ApiResponse(responseCode = "400", description = "Error de validación, docentes/aulas no encontrados o recursos insuficientes")
    public ResponseEntity<SesionRespuestaDto> iniciarClaseAip(@Valid @RequestBody IniciarClaseDto dto) {
        SesionRespuestaDto respuesta = sesionService.iniciarClaseAip(dto);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @PostMapping("/iniciar-colegiado")
    @Operation(summary = "Iniciar sesión de Trabajo Colegiado / Reforzamiento", description = "Registra el ingreso de docentes o personal al Aula AIP para realizar horas colegiadas o reforzamiento pedagógico.")
    @ApiResponse(responseCode = "201", description = "Sesión de trabajo colegiado iniciada con éxito")
    @ApiResponse(responseCode = "400", description = "Error de validación o personal no encontrado")
    public ResponseEntity<SesionRespuestaDto> iniciarTrabajoColegiado(@Valid @RequestBody IniciarColegiadoDto dto) {
        SesionRespuestaDto respuesta = sesionService.iniciarTrabajoColegiado(dto);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @PostMapping("/registrar-prestamo")
    @Operation(summary = "Registrar salida masiva Modo Préstamo", description = "Registra la salida física de equipos (tabletas/laptops) a cargo directo del docente responsable.")
    @ApiResponse(responseCode = "201", description = "Préstamo registrado exitosamente")
    @ApiResponse(responseCode = "400", description = "Error de validación o equipos no disponibles")
    public ResponseEntity<SesionRespuestaDto> registrarPrestamoExterno(@Valid @RequestBody RegistrarPrestamoDto dto) {
        SesionRespuestaDto respuesta = sesionService.registrarPrestamoExterno(dto);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @PutMapping("/{idSesion}/finalizar")
    @Operation(summary = "Finalizar sesión y retorno de equipos", description = "Cierra la sesión grupal, registra la hora de término y libera automáticamente todos los equipos asociados devolviéndolos al estado disponible.")
    @ApiResponse(responseCode = "200", description = "Sesión finalizada y equipos liberados con éxito")
    @ApiResponse(responseCode = "400", description = "Sesión no encontrada o ya finalizada")
    public ResponseEntity<SesionRespuestaDto> finalizarSesion(
            @PathVariable UUID idSesion,
            @RequestParam(required = false) String qrDocente) {
        SesionRespuestaDto respuesta = sesionService.finalizarSesion(idSesion, qrDocente);
        return ResponseEntity.ok(respuesta);
    }

    @PutMapping("/retorno-equipo")
    @Operation(summary = "Registrar retorno/devolución física de un equipo individual", description = "Libera un equipo prestado por su código QR y finaliza automáticamente su sesión grupal si no quedan más equipos pendientes.")
    @ApiResponse(responseCode = "200", description = "Equipo devuelto y estado actualizado")
    @ApiResponse(responseCode = "400", description = "Equipo no registrado o no asociado a una sesión activa")
    public ResponseEntity<SesionRespuestaDto> devolverEquipoIndividual(
            @RequestParam String qrEquipo,
            @RequestParam(required = false) String qrDocente) {
        SesionRespuestaDto respuesta = sesionService.devolverEquipoIndividual(qrEquipo, qrDocente);
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/historial")
    @Operation(summary = "Obtener historial completo de transacciones", description = "Recupera todas las sesiones registradas (tanto activas como finalizadas) para el historial del panel de control.")
    public ResponseEntity<List<SesionRespuestaDto>> obtenerHistorialSesiones() {
        List<SesionRespuestaDto> respuesta = sesionService.obtenerHistorialSesiones();
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/{idSesion}")
    @Operation(summary = "Eliminar una sesión / registro de transacción", description = "Elimina permanentemente una sesión grupal y sus detalles asociados. Si tiene equipos prestados, los libera automáticamente.")
    @ApiResponse(responseCode = "200", description = "Sesión eliminada con éxito")
    @ApiResponse(responseCode = "400", description = "Sesión no encontrada")
    public ResponseEntity<?> eliminarSesion(@PathVariable UUID idSesion) {
        sesionService.eliminarSesion(idSesion);
        return ResponseEntity.ok(java.util.Map.of("message", "Transacción eliminada con éxito"));
    }
}

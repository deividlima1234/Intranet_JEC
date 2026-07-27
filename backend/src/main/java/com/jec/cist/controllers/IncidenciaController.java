package com.jec.cist.controllers;

import com.jec.cist.dtos.IncidenciaAtencionDto;
import com.jec.cist.dtos.IncidenciaRegistroDto;
import com.jec.cist.dtos.IncidenciaRespuestaDto;
import com.jec.cist.services.IncidenciaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incidencias")
@Tag(name = "Incidencias y Reportes", description = "Endpoints para la gestión de reportes de fallas y recomendaciones de soporte")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    public IncidenciaController(IncidenciaService incidenciaService) {
        this.incidenciaService = incidenciaService;
    }

    @PostMapping
    @Operation(summary = "Registrar una nueva incidencia o recomendación", description = "Permite a cualquier usuario reportar una falla o registrar una sugerencia.")
    @ApiResponse(responseCode = "201", description = "Reporte registrado exitosamente")
    public ResponseEntity<IncidenciaRespuestaDto> registrarIncidencia(@RequestBody @Valid IncidenciaRegistroDto dto) {
        IncidenciaRespuestaDto respuesta = incidenciaService.registrarIncidencia(dto);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Listar incidencias visibles para el usuario", description = "Si el usuario es CIST/PIP, retorna todo el listado. De lo contrario, retorna solo sus reportes creados.")
    public ResponseEntity<List<IncidenciaRespuestaDto>> listarIncidencias(
            @RequestParam("idUsuario") UUID idUsuario,
            @RequestParam("rol") String rol) {
        return ResponseEntity.ok(incidenciaService.listarVisiblesParaUsuario(idUsuario, rol));
    }

    @PutMapping("/{idIncidencia}/atender")
    @Operation(summary = "Atender / Responder una incidencia", description = "Permite a los administradores registrar la respuesta del soporte técnico y cambiar el estado del reporte.")
    public ResponseEntity<IncidenciaRespuestaDto> atenderIncidencia(
            @PathVariable UUID idIncidencia,
            @RequestBody @Valid IncidenciaAtencionDto dto) {
        return ResponseEntity.ok(incidenciaService.atenderIncidencia(idIncidencia, dto));
    }

    @DeleteMapping("/{idIncidencia}")
    @Operation(summary = "Eliminar una incidencia", description = "Borra físicamente el registro de la incidencia. Acceso exclusivo para administradores.")
    @ApiResponse(responseCode = "204", description = "Incidencia eliminada exitosamente")
    public ResponseEntity<Void> eliminarIncidencia(@PathVariable UUID idIncidencia) {
        incidenciaService.eliminarIncidencia(idIncidencia);
        return ResponseEntity.noContent().build();
    }
}

package com.jec.cist.controllers;

import com.jec.cist.dtos.EquipoAltaDto;
import com.jec.cist.dtos.EquipoRespuestaDto;
import com.jec.cist.services.InventarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Equipos e Inventario", description = "Endpoints para el registro de hardware y monitoreo de estado en las Aulas AIP")
public class EquipoController {

    private final InventarioService inventarioService;

    public EquipoController(InventarioService inventarioService) {
        this.inventarioService = inventarioService;
    }

    @PostMapping("/equipos/alta")
    @Operation(summary = "Dar de alta un equipo", description = "Registra un nuevo activo patrimonial (PC, Laptop, Tableta) en el sistema asociándolo a un aula base.")
    @ApiResponse(responseCode = "201", description = "Equipo registrado exitosamente")
    @ApiResponse(responseCode = "400", description = "Error en los datos de entrada, código patrimonial o QR duplicado")
    public ResponseEntity<EquipoRespuestaDto> darAltaEquipo(@Valid @RequestBody EquipoAltaDto dto) {
        EquipoRespuestaDto respuesta = inventarioService.darAltaEquipo(dto);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @GetMapping("/aulas/{idAula}/inventario")
    @Operation(summary = "Obtener inventario de un aula", description = "Recupera la lista de todos los equipos registrados en un Aula AIP específica y su estado de disponibilidad actual.")
    @ApiResponse(responseCode = "200", description = "Inventario recuperado exitosamente")
    @ApiResponse(responseCode = "400", description = "Aula no encontrada")
    public ResponseEntity<List<EquipoRespuestaDto>> obtenerInventarioAula(@PathVariable Integer idAula) {
        List<EquipoRespuestaDto> respuesta = inventarioService.obtenerInventarioAula(idAula);
        return ResponseEntity.ok(respuesta);
    }
}

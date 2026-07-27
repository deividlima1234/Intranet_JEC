package com.jec.cist.controllers;

import com.jec.cist.dtos.CursoEvaluacionRequestDto;
import com.jec.cist.dtos.CursoEvaluacionRespuestaDto;
import com.jec.cist.services.CursoEvaluacionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cursos/{idCurso}/evaluaciones")
public class CursoEvaluacionController {

    private final CursoEvaluacionService cursoEvaluacionService;

    public CursoEvaluacionController(CursoEvaluacionService cursoEvaluacionService) {
        this.cursoEvaluacionService = cursoEvaluacionService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DOCENTE', 'ADMIN')")
    public ResponseEntity<CursoEvaluacionRespuestaDto> crearEvaluacion(
            @PathVariable UUID idCurso,
            @Valid @RequestBody CursoEvaluacionRequestDto dto) {
        CursoEvaluacionRespuestaDto respuesta = cursoEvaluacionService.crearEvaluacion(idCurso, dto);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<CursoEvaluacionRespuestaDto>> listarEvaluaciones(
            @PathVariable UUID idCurso) {
        return ResponseEntity.ok(cursoEvaluacionService.listarEvaluacionesPorCurso(idCurso));
    }

    @GetMapping("/{idEvaluacion}")
    public ResponseEntity<CursoEvaluacionRespuestaDto> obtenerEvaluacion(
            @PathVariable UUID idCurso,
            @PathVariable UUID idEvaluacion) {
        // Podríamos validar que idCurso coincida, pero para simplificar usamos el idEvaluacion
        return ResponseEntity.ok(cursoEvaluacionService.obtenerEvaluacion(idEvaluacion));
    }

    @DeleteMapping("/{idEvaluacion}")
    @PreAuthorize("hasAnyRole('DOCENTE', 'ADMIN')")
    public ResponseEntity<Void> eliminarEvaluacion(
            @PathVariable UUID idCurso,
            @PathVariable UUID idEvaluacion) {
        cursoEvaluacionService.eliminarEvaluacion(idEvaluacion);
        return ResponseEntity.noContent().build();
    }
}

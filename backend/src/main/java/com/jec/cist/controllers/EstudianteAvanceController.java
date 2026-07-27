package com.jec.cist.controllers;

import com.jec.cist.dtos.EstudianteAvanceRespuestaDto;
import com.jec.cist.dtos.EstudianteAvanceRevisionDto;
import com.jec.cist.models.EstudianteAvance;
import com.jec.cist.services.EstudianteAvanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cursos/avances")
@Tag(name = "Avances de Clase", description = "Endpoints para la gestión, subida y evaluación de evidencias de clase por parte de estudiantes y docentes")
public class EstudianteAvanceController {

    private final EstudianteAvanceService estudianteAvanceService;

    public EstudianteAvanceController(EstudianteAvanceService estudianteAvanceService) {
        this.estudianteAvanceService = estudianteAvanceService;
    }

    @PostMapping(value = "/{idCurso}/estudiante/{idEstudiante}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir un avance de clase", description = "Permite a un estudiante cargar un archivo con el trabajo desarrollado en clase como evidencia.")
    @ApiResponse(responseCode = "201", description = "Avance subido exitosamente")
    public ResponseEntity<EstudianteAvanceRespuestaDto> subirAvance(
            @PathVariable UUID idCurso,
            @PathVariable UUID idEstudiante,
            @RequestParam("file") MultipartFile file,
            @RequestParam("titulo") String titulo,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "idEvaluacion", required = false) UUID idEvaluacion) {
        try {
            EstudianteAvanceRespuestaDto respuesta = estudianteAvanceService.subirAvance(idCurso, idEstudiante, file, titulo, descripcion, idEvaluacion);
            return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException("Error al cargar el avance en el servidor: " + e.getMessage(), e);
        }
    }

    @GetMapping("/curso/{idCurso}")
    @Operation(summary = "Listar todos los avances de un curso", description = "Retorna una lista con todos los avances entregados para el curso, ideal para uso del docente.")
    public ResponseEntity<List<EstudianteAvanceRespuestaDto>> listarAvancesPorCurso(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(estudianteAvanceService.listarAvancesPorCurso(idCurso));
    }

    @GetMapping("/curso/{idCurso}/estudiante/{idEstudiante}")
    @Operation(summary = "Listar avances propios de un estudiante", description = "Retorna la lista de avances que el estudiante actual ha entregado para esta asignatura.")
    public ResponseEntity<List<EstudianteAvanceRespuestaDto>> listarAvancesPorCursoYEstudiante(
            @PathVariable UUID idCurso,
            @PathVariable UUID idEstudiante) {
        return ResponseEntity.ok(estudianteAvanceService.listarAvancesPorCursoYEstudiante(idCurso, idEstudiante));
    }

    @GetMapping("/{idAvance}/descargar")
    @Operation(summary = "Descargar o visualizar un avance", description = "Permite la descarga o visualización en línea de la evidencia escolar usando su ID.")
    public ResponseEntity<Resource> descargarAvance(
            @PathVariable UUID idAvance,
            @RequestParam(value = "inline", required = false, defaultValue = "false") boolean inline) {
        try {
            Resource resource = estudianteAvanceService.descargarAvance(idAvance);
            EstudianteAvance avance = estudianteAvanceService.obtenerAvancePorId(idAvance);

            String contentType = avance.getTipoContenido();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            String contentDisposition = inline ? "inline" : "attachment; filename=\"" + avance.getNombreArchivo() + "\"";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{idAvance}/revisar")
    @Operation(summary = "Revisar/Calificar un avance de clase", description = "Permite a un docente retroalimentar y cambiar el estado de la evidencia entregada.")
    public ResponseEntity<EstudianteAvanceRespuestaDto> revisarAvance(
            @PathVariable UUID idAvance,
            @Valid @RequestBody EstudianteAvanceRevisionDto dto) {
        EstudianteAvanceRespuestaDto respuesta = estudianteAvanceService.revisarAvance(idAvance, dto);
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/{idAvance}")
    @Operation(summary = "Eliminar un avance", description = "Borra físicamente el archivo del servidor y su registro en BD.")
    @ApiResponse(responseCode = "204", description = "Avance eliminado exitosamente")
    public ResponseEntity<Void> eliminarAvance(@PathVariable UUID idAvance) {
        estudianteAvanceService.eliminarAvance(idAvance);
        return ResponseEntity.noContent().build();
    }
}

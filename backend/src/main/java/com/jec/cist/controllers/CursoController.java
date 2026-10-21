package com.jec.cist.controllers;

import com.jec.cist.dtos.*;
import com.jec.cist.models.CursoMaterial;
import com.jec.cist.services.CursoService;
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
@RequestMapping("/api/v1/cursos")
@Tag(name = "Cursos, Materiales y Notas", description = "Endpoints para la gestión de asignaturas, carga de archivos y control de calificaciones")
public class CursoController {

    private final CursoService cursoService;

    public CursoController(CursoService cursoService) {
        this.cursoService = cursoService;
    }

    // --- CURSOS ---

    @PostMapping
    @Operation(summary = "Crear un nuevo curso", description = "Permite al CIST registrar una nueva asignatura asociándola a un docente y a un aula (grado/sección).")
    @ApiResponse(responseCode = "201", description = "Curso creado exitosamente")
    @ApiResponse(responseCode = "400", description = "Error de validación o NRC duplicado")
    public ResponseEntity<CursoRespuestaDto> crearCurso(@Valid @RequestBody CursoRegistroDto dto) {
        CursoRespuestaDto respuesta = cursoService.crearCurso(dto);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Listar todos los cursos", description = "Retorna una lista completa de los cursos disponibles en el sistema.")
    public ResponseEntity<List<CursoRespuestaDto>> listarCursos() {
        return ResponseEntity.ok(cursoService.listarCursos());
    }

    @PostMapping("/generar-pruebas")
    @Operation(summary = "Generar cursos de prueba", description = "Crea automáticamente un curso de prueba para cada docente en el sistema. Los cursos inician deshabilitados.")
    @ApiResponse(responseCode = "200", description = "Cursos generados exitosamente")
    public ResponseEntity<Void> generarCursosDePrueba() {
        cursoService.generarCursosDePrueba();
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{idCurso}/toggle-prueba")
    @Operation(summary = "Habilitar/Deshabilitar curso de prueba", description = "Permite al CIST cambiar el estado de acceso de un curso de prueba.")
    @ApiResponse(responseCode = "200", description = "Estado cambiado exitosamente")
    public ResponseEntity<CursoRespuestaDto> togglePruebaHabilitada(@PathVariable UUID idCurso) {
        CursoRespuestaDto respuesta = cursoService.togglePruebaHabilitada(idCurso);
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/docente/{idDocente}")
    @Operation(summary = "Obtener cursos de un docente", description = "Retorna los cursos asignados a un docente específico por su ID.")
    public ResponseEntity<List<CursoRespuestaDto>> listarCursosPorDocente(@PathVariable UUID idDocente) {
        return ResponseEntity.ok(cursoService.listarCursosPorDocente(idDocente));
    }

    @GetMapping("/estudiante/{idEstudiante}")
    @Operation(summary = "Obtener cursos de un estudiante", description = "Retorna los cursos que corresponden al grado y sección del estudiante.")
    public ResponseEntity<List<CursoRespuestaDto>> listarCursosPorEstudiante(@PathVariable UUID idEstudiante) {
        return ResponseEntity.ok(cursoService.listarCursosPorEstudiante(idEstudiante));
    }

    @GetMapping("/{idCurso}/estudiantes")
    @Operation(summary = "Listar estudiantes en un curso", description = "Retorna los alumnos inscritos automáticamente en el curso según su grado y sección.")
    public ResponseEntity<List<UsuarioRespuestaDto>> listarEstudiantesPorCurso(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(cursoService.listarEstudiantesPorCurso(idCurso));
    }

    @DeleteMapping("/{idCurso}")
    @Operation(summary = "Eliminar un curso", description = "Elimina un curso, sus notas y archivos de materiales del servidor.")
    @ApiResponse(responseCode = "204", description = "Curso eliminado exitosamente")
    public ResponseEntity<Void> eliminarCurso(@PathVariable UUID idCurso) {
        cursoService.eliminarCurso(idCurso);
        return ResponseEntity.noContent().build();
    }

    // --- MATERIALES DE ESTUDIO ---

    @PostMapping(value = "/{idCurso}/materiales", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir un material de clase", description = "Permite a un docente subir un archivo de material (PDF, Documento, etc.) para un curso específico.")
    @ApiResponse(responseCode = "201", description = "Material subido exitosamente")
    public ResponseEntity<CursoMaterialRespuestaDto> subirMaterial(
            @PathVariable UUID idCurso,
            @RequestParam("file") MultipartFile file,
            @RequestParam("titulo") String titulo,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "visibilidad", required = false, defaultValue = "TODOS") String visibilidad,
            @RequestParam(value = "destinatariosIds", required = false) List<UUID> destinatariosIds) {
        try {
            CursoMaterialRespuestaDto respuesta = cursoService.subirMaterial(idCurso, file, titulo, descripcion, visibilidad, destinatariosIds);
            return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException("Error al cargar el archivo en el servidor: " + e.getMessage(), e);
        }
    }

    @GetMapping("/{idCurso}/materiales")
    @Operation(summary = "Listar materiales de un curso", description = "Retorna todos los materiales subidos para la asignatura. Si se especifica el idEstudiante, retorna solo los que son visibles para él.")
    public ResponseEntity<List<CursoMaterialRespuestaDto>> listarMaterialesPorCurso(
            @PathVariable UUID idCurso,
            @RequestParam(value = "idEstudiante", required = false) UUID idEstudiante) {
        return ResponseEntity.ok(cursoService.listarMaterialesPorCurso(idCurso, idEstudiante));
    }

    @GetMapping("/materiales/{idMaterial}/descargar")
    @Operation(summary = "Descargar o visualizar un material", description = "Permite la descarga o visualización en línea del material escolar usando su ID.")
    public ResponseEntity<Resource> descargarMaterial(
            @PathVariable UUID idMaterial,
            @RequestParam(value = "inline", required = false, defaultValue = "false") boolean inline) {
        try {
            Resource resource = cursoService.descargarMaterial(idMaterial);
            CursoMaterial material = cursoService.obtenerMaterialPorId(idMaterial);

            String contentType = material.getTipoContenido();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            String contentDisposition = inline ? "inline" : "attachment; filename=\"" + material.getNombreArchivo() + "\"";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/materiales/{idMaterial}")
    @Operation(summary = "Eliminar un material", description = "Borra físicamente el archivo del servidor y su registro en BD.")
    @ApiResponse(responseCode = "204", description = "Material eliminado exitosamente")
    public ResponseEntity<Void> eliminarMaterial(@PathVariable UUID idMaterial) {
        cursoService.eliminarMaterial(idMaterial);
        return ResponseEntity.noContent().build();
    }

    // --- CALIFICACIONES (NOTAS) ---

    @GetMapping("/{idCurso}/notas")
    @Operation(summary = "Listar calificaciones de un curso", description = "Retorna todas las notas registradas para el curso seleccionado.")
    public ResponseEntity<List<NotaRespuestaDto>> listarNotasPorCurso(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(cursoService.listarNotasPorCurso(idCurso));
    }

    @GetMapping("/estudiante/{idEstudiante}/notas")
    @Operation(summary = "Listar calificaciones de un estudiante", description = "Retorna el historial completo de notas de un alumno en todos sus cursos.")
    public ResponseEntity<List<NotaRespuestaDto>> listarNotasPorEstudiante(@PathVariable UUID idEstudiante) {
        return ResponseEntity.ok(cursoService.listarNotasPorEstudiante(idEstudiante));
    }

    @PostMapping("/{idCurso}/notas")
    @Operation(summary = "Guardar calificaciones en lote", description = "Registra o actualiza notas de múltiples estudiantes en el curso para un criterio dado.")
    public ResponseEntity<List<NotaRespuestaDto>> guardarNotasEnLote(
            @PathVariable UUID idCurso,
            @Valid @RequestBody List<NotaRegistroDto> dtos) {
        List<NotaRespuestaDto> respuestas = cursoService.guardarNotasEnLote(idCurso, dtos);
        return ResponseEntity.ok(respuestas);
    }

    @PostMapping("/{idCurso}/evaluaciones/notas")
    @Operation(summary = "Calificar una evaluación de clase", description = "Registra o actualiza la calificación de un estudiante basada en los criterios de una evaluación.")
    public ResponseEntity<NotaRespuestaDto> guardarNotaEvaluacion(
            @PathVariable UUID idCurso,
            @Valid @RequestBody NotaRegistroEvaluacionDto dto) {
        NotaRespuestaDto respuesta = cursoService.guardarNotaEvaluacion(idCurso, dto);
        return ResponseEntity.ok(respuesta);
    }
}

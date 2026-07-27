package com.jec.cist.controllers;

import com.jec.cist.dtos.DocumentoManualRespuestaDto;
import com.jec.cist.models.DocumentoManual;
import com.jec.cist.services.DocumentoManualService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/v1/documentos")
@Tag(name = "Documentos y Manuales", description = "Endpoints para la gestión de documentos, manuales y recursos del sistema con control de visibilidad por rol")
public class DocumentoManualController {

    private final DocumentoManualService documentoService;

    public DocumentoManualController(DocumentoManualService documentoService) {
        this.documentoService = documentoService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir un documento/manual", description = "Permite a CIST o PIP subir un documento y definir los roles que pueden verlo. Use 'TODOS' para acceso universal.")
    @ApiResponse(responseCode = "201", description = "Documento subido exitosamente")
    public ResponseEntity<DocumentoManualRespuestaDto> subirDocumento(
            @RequestParam("file") MultipartFile file,
            @RequestParam("titulo") String titulo,
            @RequestParam(value = "descripcion", required = false) String descripcion,
            @RequestParam(value = "rolesVisibles", defaultValue = "TODOS") String rolesVisibles,
            @RequestParam("idAutor") UUID idAutor) {
        try {
            DocumentoManualRespuestaDto respuesta = documentoService.subirDocumento(file, titulo, descripcion, rolesVisibles, idAutor);
            return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
        } catch (Exception e) {
            throw new RuntimeException("Error al subir el documento: " + e.getMessage(), e);
        }
    }

    @GetMapping
    @Operation(summary = "Listar documentos visibles para un rol", description = "Retorna los documentos/manuales que están autorizados para un rol específico (incluyendo los marcados como 'TODOS').")
    public ResponseEntity<List<DocumentoManualRespuestaDto>> listarPorRol(@RequestParam("rol") String rol) {
        return ResponseEntity.ok(documentoService.listarVisiblesParaRol(rol));
    }

    @GetMapping("/todos")
    @Operation(summary = "Listar todos los documentos (Administración)", description = "Retorna todos los documentos registrados en el sistema. Acceso exclusivo para CIST/PIP.")
    public ResponseEntity<List<DocumentoManualRespuestaDto>> listarTodos() {
        return ResponseEntity.ok(documentoService.listarTodos());
    }

    @GetMapping("/{idDocumento}/descargar")
    @Operation(summary = "Descargar o visualizar un documento", description = "Descarga o visualiza en línea el archivo del documento/manual por su ID.")
    public ResponseEntity<Resource> descargarDocumento(
            @PathVariable UUID idDocumento,
            @RequestParam(value = "inline", required = false, defaultValue = "false") boolean inline) {
        try {
            Resource resource = documentoService.descargarDocumento(idDocumento);
            DocumentoManual documento = documentoService.obtenerPorId(idDocumento);

            String contentType = documento.getTipoContenido();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            String contentDisposition = inline ? "inline" : "attachment; filename=\"" + documento.getNombreArchivo() + "\"";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, contentDisposition)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{idDocumento}")
    @Operation(summary = "Eliminar un documento", description = "Borra físicamente el archivo del servidor y su registro en base de datos. Acceso exclusivo para CIST/PIP.")
    @ApiResponse(responseCode = "204", description = "Documento eliminado exitosamente")
    public ResponseEntity<Void> eliminarDocumento(@PathVariable UUID idDocumento) {
        documentoService.eliminarDocumento(idDocumento);
        return ResponseEntity.noContent().build();
    }
}

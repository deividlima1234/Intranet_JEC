package com.jec.cist.services;

import com.jec.cist.dtos.DocumentoManualRespuestaDto;
import com.jec.cist.models.DocumentoManual;
import com.jec.cist.models.Usuario;
import com.jec.cist.repositories.DocumentoManualRepository;
import com.jec.cist.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DocumentoManualService {

    private final DocumentoManualRepository documentoRepository;
    private final UsuarioRepository usuarioRepository;

    @Value("${app.upload.documentos.dir:./uploads/documentos}")
    private String uploadDocumentosDir;

    public DocumentoManualService(DocumentoManualRepository documentoRepository, UsuarioRepository usuarioRepository) {
        this.documentoRepository = documentoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public DocumentoManualRespuestaDto subirDocumento(MultipartFile file, String titulo, String descripcion, String rolesVisibles, UUID idAutor) throws IOException {
        Usuario autor = usuarioRepository.findById(idAutor)
                .orElseThrow(() -> new IllegalArgumentException("Usuario autor no encontrado con ID: " + idAutor));

        // Asegurar que el directorio destino existe
        File dirFile = new File(uploadDocumentosDir);
        if (!dirFile.exists()) {
            dirFile.mkdirs();
        }

        // Generar nombre único para el archivo
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String storedFilename = UUID.randomUUID().toString() + extension;
        Path targetPath = Paths.get(uploadDocumentosDir).resolve(storedFilename);

        // Guardar el archivo físicamente en el servidor
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Normalizar rolesVisibles
        String rolesNormalizados = (rolesVisibles == null || rolesVisibles.trim().isEmpty()) ? "TODOS" : rolesVisibles.trim().toUpperCase();

        DocumentoManual documento = new DocumentoManual(
                titulo,
                descripcion,
                originalFilename,
                targetPath.toString(),
                file.getSize(),
                file.getContentType(),
                autor,
                rolesNormalizados
        );

        documento = documentoRepository.save(documento);
        return mapearARespuesta(documento);
    }

    @Transactional(readOnly = true)
    public List<DocumentoManualRespuestaDto> listarTodos() {
        return documentoRepository.findAllByOrderByFechaSubidaDesc().stream()
                .map(this::mapearARespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<DocumentoManualRespuestaDto> listarVisiblesParaRol(String rol) {
        return documentoRepository.findAllByOrderByFechaSubidaDesc().stream()
                .filter(doc -> {
                    String visibles = doc.getRolesVisibles();
                    if (visibles == null) return false;
                    if (visibles.equalsIgnoreCase("TODOS")) return true;
                    List<String> rolesList = Arrays.stream(visibles.split(","))
                            .map(String::trim)
                            .collect(Collectors.toList());
                    return rolesList.contains(rol.toUpperCase());
                })
                .map(this::mapearARespuesta)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Resource descargarDocumento(UUID idDocumento) throws MalformedURLException {
        DocumentoManual documento = documentoRepository.findById(idDocumento)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado con ID: " + idDocumento));

        Path filePath = Paths.get(documento.getRutaArchivo());
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("No se pudo leer el archivo en la ruta: " + documento.getRutaArchivo());
        }
    }

    @Transactional(readOnly = true)
    public DocumentoManual obtenerPorId(UUID idDocumento) {
        return documentoRepository.findById(idDocumento)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado con ID: " + idDocumento));
    }

    @Transactional
    public void eliminarDocumento(UUID idDocumento) {
        DocumentoManual documento = documentoRepository.findById(idDocumento)
                .orElseThrow(() -> new IllegalArgumentException("Documento no encontrado con ID: " + idDocumento));

        // Eliminar archivo físico del servidor
        try {
            File physicalFile = new File(documento.getRutaArchivo());
            if (physicalFile.exists()) {
                physicalFile.delete();
            }
        } catch (Exception e) {
            // Log silencioso, continuar con eliminación en BD
        }

        documentoRepository.delete(documento);
    }

    private DocumentoManualRespuestaDto mapearARespuesta(DocumentoManual d) {
        String nombreAutor = "";
        UUID idAutor = null;
        if (d.getAutor() != null) {
            idAutor = d.getAutor().getIdUsuario();
            nombreAutor = d.getAutor().getNombres() + " " + d.getAutor().getApellidos();
        }
        return new DocumentoManualRespuestaDto(
                d.getIdDocumento(),
                d.getTitulo(),
                d.getDescripcion(),
                d.getNombreArchivo(),
                d.getTamanoArchivo(),
                d.getTipoContenido(),
                d.getFechaSubida(),
                idAutor,
                nombreAutor,
                d.getRolesVisibles()
        );
    }
}

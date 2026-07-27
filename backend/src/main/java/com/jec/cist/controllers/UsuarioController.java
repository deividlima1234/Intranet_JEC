package com.jec.cist.controllers;

import com.jec.cist.dtos.CredencialRespuestaDto;
import com.jec.cist.dtos.ImportacionLoteResultadoDto;
import com.jec.cist.dtos.LoginRequestDto;
import com.jec.cist.dtos.UsuarioRegistroDto;
import com.jec.cist.dtos.UsuarioRespuestaDto;
import com.jec.cist.dtos.CambioContrasenaDto;
import java.util.List;
import com.jec.cist.services.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/usuarios")
@Tag(name = "Usuarios e Identidad", description = "Endpoints para la gestión de usuarios y generación de fotochecks QR criptográficos")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/registro")
    @Operation(summary = "Registrar un usuario", description = "Crea un nuevo usuario (estudiante o personal) y genera su token JWT criptográfico para el QR.")
    @ApiResponse(responseCode = "201", description = "Usuario registrado exitosamente")
    @ApiResponse(responseCode = "400", description = "Error en los datos de entrada o DNI duplicado")
    public ResponseEntity<UsuarioRespuestaDto> registrarUsuario(@Valid @RequestBody UsuarioRegistroDto dto) {
        UsuarioRespuestaDto respuesta = usuarioService.registrarUsuario(dto);
        return new ResponseEntity<>(respuesta, HttpStatus.CREATED);
    }

    @PostMapping("/registro/lote")
    @Operation(summary = "Registrar usuarios en lote", description = "Crea múltiples usuarios y devuelve el resumen del resultado.")
    @ApiResponse(responseCode = "200", description = "Importación completada con éxito (incluye reporte de fallos si los hay)")
    public ResponseEntity<ImportacionLoteResultadoDto> registrarUsuariosLote(@RequestBody List<UsuarioRegistroDto> dtos) {
        ImportacionLoteResultadoDto resultado = usuarioService.registrarUsuariosLote(dtos);
        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión para el personal CIST", description = "Valida el DNI y la contraseña del CIST para otorgar acceso al sistema.")
    @ApiResponse(responseCode = "200", description = "Inicio de sesión exitoso")
    @ApiResponse(responseCode = "400", description = "Error de validación, DNI no encontrado, o contraseña incorrecta")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDto dto) {
        try {
            UsuarioRespuestaDto respuesta = usuarioService.login(dto.getDni(), dto.getContrasena());
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new java.util.HashMap<String, String>() {{
                put("message", e.getMessage());
            }});
        }
    }

    @GetMapping("/me")
    @Operation(summary = "Obtener perfil del usuario autenticado", description = "Retorna el perfil del usuario a partir de su DNI.")
    public ResponseEntity<?> obtenerPerfil(@RequestParam String dni) {
        try {
            UsuarioRespuestaDto respuesta = usuarioService.obtenerPerfil(dni);
            return ResponseEntity.ok(respuesta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new java.util.HashMap<String, String>() {{
                put("message", e.getMessage());
            }});
        }
    }

    @PostMapping("/cambiar-contrasena")
    @Operation(summary = "Cambiar contraseña de usuario", description = "Permite a un usuario autenticado cambiar su contraseña actual.")
    public ResponseEntity<?> cambiarContrasena(@Valid @RequestBody CambioContrasenaDto dto) {
        try {
            usuarioService.cambiarContrasena(dto);
            return ResponseEntity.ok().body(new java.util.HashMap<String, String>() {{
                put("message", "Contraseña cambiada exitosamente");
            }});
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new java.util.HashMap<String, String>() {{
                put("message", e.getMessage());
            }});
        }
    }

    @PostMapping("/{id}/restablecer-contrasena")
    @Operation(summary = "Restablecer contraseña a valores por defecto", description = "Limpia la contraseña personalizada del usuario por su UUID, restableciéndola a su DNI.")
    public ResponseEntity<?> restablecerContrasena(@PathVariable UUID id) {
        try {
            usuarioService.restablecerContrasena(id);
            return ResponseEntity.ok().body(new java.util.HashMap<String, String>() {{
                put("message", "Contraseña restablecida al DNI por defecto");
            }});
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new java.util.HashMap<String, String>() {{
                put("message", e.getMessage());
            }});
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener detalles de un usuario", description = "Recupera la información básica y de perfil de un usuario registrado por su UUID.")
    @ApiResponse(responseCode = "200", description = "Usuario encontrado")
    @ApiResponse(responseCode = "400", description = "Usuario no encontrado")
    public ResponseEntity<UsuarioRespuestaDto> obtenerUsuario(@PathVariable UUID id) {
        UsuarioRespuestaDto respuesta = usuarioService.obtenerUsuario(id);
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping("/{id}/credencial")
    @Operation(summary = "Obtener credencial QR del usuario", description = "Retorna los datos del usuario y la representación de su código QR en formato de imagen codificada en Base64.")
    @ApiResponse(responseCode = "200", description = "Credencial generada exitosamente")
    @ApiResponse(responseCode = "400", description = "Usuario no encontrado")
    public ResponseEntity<CredencialRespuestaDto> obtenerCredencial(@PathVariable UUID id) {
        CredencialRespuestaDto respuesta = usuarioService.obtenerCredencial(id);
        return ResponseEntity.ok(respuesta);
    }

    @GetMapping
    @Operation(summary = "Listar todos los usuarios", description = "Retorna una lista con todos los usuarios registrados en el sistema.")
    @ApiResponse(responseCode = "200", description = "Lista de usuarios recuperada exitosamente")
    public ResponseEntity<java.util.List<UsuarioRespuestaDto>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.listarUsuarios());
    }

    @GetMapping("/grados-secciones")
    @Operation(summary = "Obtener lista de grados y secciones únicos de estudiantes", description = "Retorna una lista de strings con las combinaciones únicas de grado y sección registradas.")
    public ResponseEntity<java.util.List<String>> obtenerGradosSecciones() {
        return ResponseEntity.ok(usuarioService.obtenerGradosSecciones());
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un usuario", description = "Modifica los datos personales y de perfil de un usuario existente.")
    @ApiResponse(responseCode = "200", description = "Usuario actualizado exitosamente")
    @ApiResponse(responseCode = "400", description = "Error en los datos de entrada o DNI duplicado o usuario no encontrado")
    public ResponseEntity<UsuarioRespuestaDto> actualizarUsuario(@PathVariable UUID id, @Valid @RequestBody UsuarioRegistroDto dto) {
        UsuarioRespuestaDto respuesta = usuarioService.actualizarUsuario(id, dto);
        return ResponseEntity.ok(respuesta);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un usuario", description = "Elimina físicamente a un usuario y sus perfiles asociados de la base de datos.")
    @ApiResponse(responseCode = "204", description = "Usuario eliminado exitosamente")
    @ApiResponse(responseCode = "400", description = "Usuario no encontrado")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable UUID id) {
        usuarioService.eliminarUsuario(id);
        return ResponseEntity.noContent().build();
    }
}

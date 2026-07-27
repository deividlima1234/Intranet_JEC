package com.jec.cist.controllers;

import com.jec.cist.dtos.*;
import com.jec.cist.services.AulaVirtualService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cursos/{idCurso}")
@Tag(name = "Aula Virtual (LMS)", description = "Endpoints para el Aula Virtual (Anuncios, Calendario, Debates, Mensajería, Grupos y Logros)")
public class AulaVirtualController {

    private final AulaVirtualService aulaVirtualService;

    public AulaVirtualController(AulaVirtualService aulaVirtualService) {
        this.aulaVirtualService = aulaVirtualService;
    }

    // --- ANUNCIOS ---

    @GetMapping("/anuncios")
    @Operation(summary = "Listar anuncios de un curso", description = "Retorna todos los comunicados oficiales del curso.")
    public ResponseEntity<List<AnuncioRespuestaDto>> listarAnuncios(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(aulaVirtualService.listarAnunciosPorCurso(idCurso));
    }

    @PostMapping("/anuncios")
    @Operation(summary = "Crear un anuncio", description = "Permite a un docente publicar un nuevo anuncio en el curso.")
    public ResponseEntity<AnuncioRespuestaDto> crearAnuncio(
            @PathVariable UUID idCurso,
            @Valid @RequestBody AnuncioRequestDto dto) {
        return new ResponseEntity<>(aulaVirtualService.crearAnuncio(idCurso, dto), HttpStatus.CREATED);
    }

    // --- CALENDARIO EVENTOS ---

    @GetMapping("/eventos")
    @Operation(summary = "Listar eventos del calendario", description = "Retorna todos los eventos programados en el curso.")
    public ResponseEntity<List<CalendarioEventoRespuestaDto>> listarEventos(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(aulaVirtualService.listarEventosPorCurso(idCurso));
    }

    @PostMapping("/eventos")
    @Operation(summary = "Crear un evento de calendario", description = "Permite a un docente agendar un nuevo evento para la clase.")
    public ResponseEntity<CalendarioEventoRespuestaDto> crearEvento(
            @PathVariable UUID idCurso,
            @Valid @RequestBody CalendarioEventoRequestDto dto) {
        return new ResponseEntity<>(aulaVirtualService.crearEvento(idCurso, dto), HttpStatus.CREATED);
    }

    // --- DEBATES ---

    @GetMapping("/debates")
    @Operation(summary = "Listar debates de un curso", description = "Retorna todos los temas de debate/foros iniciados.")
    public ResponseEntity<List<DebateRespuestaDto>> listarDebates(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(aulaVirtualService.listarDebatesPorCurso(idCurso));
    }

    @PostMapping("/debates")
    @Operation(summary = "Iniciar un debate", description = "Permite al docente iniciar una nueva discusión. Los estudiantes no pueden iniciar debates.")
    public ResponseEntity<DebateRespuestaDto> crearDebate(
            @PathVariable UUID idCurso,
            @Valid @RequestBody DebateRequestDto dto) {
        return new ResponseEntity<>(aulaVirtualService.crearDebate(idCurso, dto), HttpStatus.CREATED);
    }

    @GetMapping("/debates/{idDebate}/respuestas")
    @Operation(summary = "Listar respuestas a un debate", description = "Retorna los comentarios de un foro de discusión.")
    public ResponseEntity<List<DebateComentarioRespuestaDto>> listarRespuestas(
            @PathVariable UUID idCurso,
            @PathVariable UUID idDebate) {
        return ResponseEntity.ok(aulaVirtualService.listarRespuestasPorDebate(idDebate));
    }

    @PostMapping("/debates/{idDebate}/respuestas")
    @Operation(summary = "Responder a un debate", description = "Permite a docentes y alumnos publicar comentarios dentro de un foro.")
    public ResponseEntity<DebateComentarioRespuestaDto> crearRespuesta(
            @PathVariable UUID idCurso,
            @PathVariable UUID idDebate,
            @Valid @RequestBody DebateRespuestaRequestDto dto) {
        return new ResponseEntity<>(aulaVirtualService.crearRespuesta(idDebate, dto), HttpStatus.CREATED);
    }

    // --- MENSAJES DIRECTOS ---

    @GetMapping("/mensajes/contactos/{idUsuarioActual}")
    @Operation(summary = "Listar contactos del chat", description = "Retorna los alumnos y el docente del curso para chatear, incluyendo contadores de no leídos.")
    public ResponseEntity<List<ContactoDto>> listarContactos(
            @PathVariable UUID idCurso,
            @PathVariable UUID idUsuarioActual) {
        return ResponseEntity.ok(aulaVirtualService.listarContactosMensajeria(idCurso, idUsuarioActual));
    }

    @GetMapping("/mensajes/historial/{idUsuarioActual}/{idContacto}")
    @Operation(summary = "Obtener chat entre dos usuarios", description = "Retorna el historial de mensajes y marca los mensajes entrantes como leídos.")
    public ResponseEntity<List<MensajeRespuestaDto>> obtenerConversacion(
            @PathVariable UUID idCurso,
            @PathVariable UUID idUsuarioActual,
            @PathVariable UUID idContacto) {
        return ResponseEntity.ok(aulaVirtualService.obtenerConversacion(idCurso, idUsuarioActual, idContacto));
    }

    @PostMapping("/mensajes/enviar/{idUsuarioActual}/{idContacto}")
    @Operation(summary = "Enviar un mensaje directo", description = "Envía un mensaje privado local entre dos miembros del curso.")
    public ResponseEntity<MensajeRespuestaDto> enviarMensaje(
            @PathVariable UUID idCurso,
            @PathVariable UUID idUsuarioActual,
            @PathVariable UUID idContacto,
            @Valid @RequestBody MensajeRequestDto dto) {
        return new ResponseEntity<>(aulaVirtualService.enviarMensaje(idCurso, idUsuarioActual, idContacto, dto), HttpStatus.CREATED);
    }

    // --- GRUPOS ---

    @GetMapping("/grupos")
    @Operation(summary = "Listar grupos de trabajo", description = "Retorna los grupos creados en el curso.")
    public ResponseEntity<List<CursoGrupoRespuestaDto>> listarGrupos(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(aulaVirtualService.listarGruposPorCurso(idCurso));
    }

    @PostMapping("/grupos")
    @Operation(summary = "Crear un grupo", description = "Permite al docente crear un equipo de trabajo y asignar estudiantes.")
    public ResponseEntity<CursoGrupoRespuestaDto> crearGrupo(
            @PathVariable UUID idCurso,
            @Valid @RequestBody CursoGrupoRequestDto dto) {
        return new ResponseEntity<>(aulaVirtualService.crearGrupo(idCurso, dto), HttpStatus.CREATED);
    }

    @PostMapping("/grupos/bulk")
    @Operation(summary = "Crear múltiples grupos de trabajo", description = "Permite al docente crear varios equipos de trabajo a la vez.")
    public ResponseEntity<List<CursoGrupoRespuestaDto>> crearGruposBulk(
            @PathVariable UUID idCurso,
            @Valid @RequestBody List<CursoGrupoRequestDto> dtos) {
        return new ResponseEntity<>(aulaVirtualService.crearGruposBulk(idCurso, dtos), HttpStatus.CREATED);
    }

    @DeleteMapping("/grupos/{idGrupo}")
    @Operation(summary = "Eliminar un grupo", description = "Borra el grupo de trabajo del sistema.")
    public ResponseEntity<Void> eliminarGrupo(
            @PathVariable UUID idCurso,
            @PathVariable UUID idGrupo) {
        aulaVirtualService.eliminarGrupo(idGrupo);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/grupos")
    @Operation(summary = "Eliminar todos los grupos del curso", description = "Borra todos los grupos de trabajo del curso del sistema.")
    public ResponseEntity<Void> eliminarTodosLosGrupos(@PathVariable UUID idCurso) {
        aulaVirtualService.eliminarTodosLosGruposPorCurso(idCurso);
        return ResponseEntity.noContent().build();
    }

    // --- LOGROS / INSIGNIAS ---

    @GetMapping("/logros")
    @Operation(summary = "Listar todos los logros del curso", description = "Retorna el listado completo de insignias otorgadas en este curso.")
    public ResponseEntity<List<EstudianteLogroRespuestaDto>> listarLogros(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(aulaVirtualService.listarLogrosPorCurso(idCurso));
    }

    @GetMapping("/logros/estudiante/{idEstudiante}")
    @Operation(summary = "Listar logros de un estudiante", description = "Retorna las medallas obtenidas por un estudiante en el curso.")
    public ResponseEntity<List<EstudianteLogroRespuestaDto>> listarLogrosEstudiante(
            @PathVariable UUID idCurso,
            @PathVariable UUID idEstudiante) {
        return ResponseEntity.ok(aulaVirtualService.listarLogrosPorEstudianteYCurso(idCurso, idEstudiante));
    }

    @PostMapping("/logros")
    @Operation(summary = "Otorgar un logro / insignia", description = "Permite al docente premiar a un alumno con una medalla/insignia y una dedicatoria.")
    public ResponseEntity<EstudianteLogroRespuestaDto> otorgarLogro(
            @PathVariable UUID idCurso,
            @Valid @RequestBody EstudianteLogroRequestDto dto) {
        return new ResponseEntity<>(aulaVirtualService.otorgarLogro(idCurso, dto), HttpStatus.CREATED);
    }
}

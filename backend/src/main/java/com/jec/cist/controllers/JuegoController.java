package com.jec.cist.controllers;

import com.jec.cist.models.CuestionarioPersonalizado;
import com.jec.cist.models.EstudianteProgresoJuego;
import com.jec.cist.models.JuegoSala;
import com.jec.cist.models.PreguntaJuego;
import com.jec.cist.repositories.CuestionarioPersonalizadoRepository;
import com.jec.cist.repositories.JuegoSalaRepository;
import com.jec.cist.services.JuegoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/juegos")
@Tag(name = "Juegos Académicos e Interactivos", description = "Endpoints para el manejo de gamificación, salas de espera y cuestionarios de docentes")
public class JuegoController {

    private final JuegoService juegoService;
    private final JuegoSalaRepository salaRepository;
    private final CuestionarioPersonalizadoRepository cuestionarioRepository;

    public JuegoController(
            JuegoService juegoService,
            JuegoSalaRepository salaRepository,
            CuestionarioPersonalizadoRepository cuestionarioRepository) {
        this.juegoService = juegoService;
        this.salaRepository = salaRepository;
        this.cuestionarioRepository = cuestionarioRepository;
    }

    // --- GAMIFICATION PROGRESS ---

    @GetMapping("/progreso/{idEstudiante}")
    @Operation(summary = "Obtener perfil del estudiante", description = "Retorna el nivel actual, XP y estadísticas de juego del alumno.")
    public ResponseEntity<EstudianteProgresoJuego> obtenerProgreso(@PathVariable UUID idEstudiante) {
        return ResponseEntity.ok(juegoService.obtenerProgresoEstudiante(idEstudiante));
    }

    // --- ACTIVE ROOMS / LOBBY ---

    @GetMapping("/salas/espera")
    @Operation(summary = "Listar salas en espera", description = "Retorna las salas multijugador activas que esperan jugadores.")
    public ResponseEntity<List<Map<String, Object>>> listarSalasEspera() {
        List<JuegoSala> salas = salaRepository.findByEstadoOrderByFechaCreacionDesc("ESPERANDO");
        List<Map<String, Object>> result = new ArrayList<>();
        
        for (JuegoSala s : salas) {
            Map<String, Object> map = new HashMap<>();
            map.put("idSala", s.getIdSala().toString());
            map.put("codigoSala", s.getCodigoSala());
            map.put("creadorNombre", s.getCreador().getNombres() + " " + s.getCreador().getApellidos());
            map.put("tipoJuego", s.getTipoJuego());
            map.put("area", s.getArea());
            map.put("cuestionarioTitulo", s.getCuestionario() != null ? s.getCuestionario().getTitulo() : "Banco General");
            map.put("grado", s.getGrado());
            map.put("maxJugadores", s.getMaxJugadores());
            result.add(map);
        }
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/salas/crear")
    @Operation(summary = "Crear sala de juego", description = "El estudiante o docente puede crear una sala asignándole un área o cuestionario personalizado.")
    public ResponseEntity<JuegoSala> crearSala(@RequestBody CreacionSalaDto dto) {
        JuegoSala sala = juegoService.crearSala(
                dto.getIdCreador(),
                dto.getArea(),
                dto.getIdCuestionario(),
                dto.getGrado(),
                dto.getMaxJugadores()
        );
        return new ResponseEntity<>(sala, HttpStatus.CREATED);
    }

    @PostMapping("/salas/unirse")
    @Operation(summary = "Unirse a una sala", description = "Permite a un alumno ingresar a una sala de juego mediante su código de 4 dígitos.")
    public ResponseEntity<JuegoSala> unirseASala(@RequestBody UnirseSalaDto dto) {
        try {
            JuegoSala sala = juegoService.unirseASala(dto.getCodigoSala(), dto.getIdJugador());
            return ResponseEntity.ok(sala);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // --- TEACHER CUSTOM QUESTIONNAIRES ---

    @GetMapping("/docente/{idDocente}/cuestionarios")
    @Operation(summary = "Listar cuestionarios del docente", description = "Retorna todos los cuestionarios creados por el docente.")
    public ResponseEntity<List<CuestionarioPersonalizado>> listarCuestionariosDocente(@PathVariable UUID idDocente) {
        return ResponseEntity.ok(juegoService.listarCuestionariosDocente(idDocente));
    }

    @GetMapping("/curso/{idCurso}/cuestionarios")
    @Operation(summary = "Listar cuestionarios de un curso", description = "Retorna los cuestionarios de repaso asignados a un curso.")
    public ResponseEntity<List<CuestionarioPersonalizado>> listarCuestionariosCurso(@PathVariable UUID idCurso) {
        return ResponseEntity.ok(cuestionarioRepository.findByCursoIdCursoOrderByFechaCreacionDesc(idCurso));
    }

    @PostMapping("/docente/{idDocente}/cuestionarios")
    @Operation(summary = "Crear un nuevo cuestionario", description = "Permite a un docente guardar un nuevo mazo de preguntas.")
    public ResponseEntity<CuestionarioPersonalizado> crearCuestionario(
            @PathVariable UUID idDocente,
            @RequestBody CreacionCuestionarioDto dto) {
        CuestionarioPersonalizado cp = juegoService.crearCuestionario(
                idDocente,
                dto.getTitulo(),
                dto.getDescripcion(),
                dto.getIdCurso()
        );
        return new ResponseEntity<>(cp, HttpStatus.CREATED);
    }

    @GetMapping("/cuestionarios/{idCuestionario}/preguntas")
    @Operation(summary = "Obtener preguntas de un cuestionario", description = "Lista las preguntas asociadas a un cuestionario personalizado.")
    public ResponseEntity<List<PreguntaJuego>> listarPreguntasCuestionario(@PathVariable UUID idCuestionario) {
        return ResponseEntity.ok(juegoService.listarPreguntasDeCuestionario(idCuestionario));
    }

    @PostMapping("/cuestionarios/{idCuestionario}/preguntas")
    @Operation(summary = "Agregar pregunta a cuestionario", description = "El docente añade un nuevo ejercicio de opción múltiple al cuestionario.")
    public ResponseEntity<PreguntaJuego> agregarPregunta(
            @PathVariable UUID idCuestionario,
            @RequestBody PreguntaJuego pregunta) {
        PreguntaJuego nueva = juegoService.agregarPreguntaACuestionario(idCuestionario, pregunta);
        return new ResponseEntity<>(nueva, HttpStatus.CREATED);
    }

    // --- DTOs ---

    public static class CreacionSalaDto {
        private UUID idCreador;
        private String area;
        private UUID idCuestionario;
        private Integer grado;
        private Integer maxJugadores = 4;

        public UUID getIdCreador() { return idCreador; }
        public void setIdCreador(UUID idCreador) { this.idCreador = idCreador; }
        public String getArea() { return area; }
        public void setArea(String area) { this.area = area; }
        public UUID getIdCuestionario() { return idCuestionario; }
        public void setIdCuestionario(UUID idCuestionario) { this.idCuestionario = idCuestionario; }
        public Integer getGrado() { return grado; }
        public void setGrado(Integer grado) { this.grado = grado; }
        public Integer getMaxJugadores() { return maxJugadores; }
        public void setMaxJugadores(Integer maxJugadores) { this.maxJugadores = maxJugadores; }
    }

    public static class UnirseSalaDto {
        private String codigoSala;
        private UUID idJugador;

        public String getCodigoSala() { return codigoSala; }
        public void setCodigoSala(String codigoSala) { this.codigoSala = codigoSala; }
        public UUID getIdJugador() { return idJugador; }
        public void setIdJugador(UUID idJugador) { this.idJugador = idJugador; }
    }

    public static class CreacionCuestionarioDto {
        private String titulo;
        private String descripcion;
        private UUID idCurso;

        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public UUID getIdCurso() { return idCurso; }
        public void setIdCurso(UUID idCurso) { this.idCurso = idCurso; }
    }
}

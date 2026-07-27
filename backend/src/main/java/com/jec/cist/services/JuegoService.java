package com.jec.cist.services;

import com.jec.cist.models.*;
import com.jec.cist.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class JuegoService {

    private final CuestionarioPersonalizadoRepository cuestionarioRepository;
    private final PreguntaJuegoRepository preguntaRepository;
    private final EstudianteProgresoJuegoRepository progresoRepository;
    private final JuegoSalaRepository salaRepository;
    private final JuegoSalaJugadorRepository jugadorRepository;
    private final UsuarioRepository usuarioRepository;
    private final CursoRepository cursoRepository;

    public JuegoService(
            CuestionarioPersonalizadoRepository cuestionarioRepository,
            PreguntaJuegoRepository preguntaRepository,
            EstudianteProgresoJuegoRepository progresoRepository,
            JuegoSalaRepository salaRepository,
            JuegoSalaJugadorRepository jugadorRepository,
            UsuarioRepository usuarioRepository,
            CursoRepository cursoRepository) {
        this.cuestionarioRepository = cuestionarioRepository;
        this.preguntaRepository = preguntaRepository;
        this.progresoRepository = progresoRepository;
        this.salaRepository = salaRepository;
        this.jugadorRepository = jugadorRepository;
        this.usuarioRepository = usuarioRepository;
        this.cursoRepository = cursoRepository;
    }

    // --- PROGRESS / GAMIFICATION ---

    @Transactional
    public EstudianteProgresoJuego obtenerProgresoEstudiante(UUID idEstudiante) {
        return progresoRepository.findByEstudianteIdUsuario(idEstudiante)
                .orElseGet(() -> {
                    Usuario u = usuarioRepository.findById(idEstudiante)
                            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                    EstudianteProgresoJuego nuevo = new EstudianteProgresoJuego(u);
                    return progresoRepository.save(nuevo);
                });
    }

    @Transactional
    public void agregarXp(UUID idEstudiante, int cantidad, boolean esMultijugador) {
        EstudianteProgresoJuego progreso = obtenerProgresoEstudiante(idEstudiante);
        if (esMultijugador) {
            progreso.setXpMultijugador(progreso.getXpMultijugador() + cantidad);
            // Cada nivel requiere Nivel * 100 de XP
            int xpNecesaria = progreso.getNivelMultijugador() * 100;
            while (progreso.getXpMultijugador() >= xpNecesaria) {
                progreso.setXpMultijugador(progreso.getXpMultijugador() - xpNecesaria);
                progreso.setNivelMultijugador(progreso.getNivelMultijugador() + 1);
                xpNecesaria = progreso.getNivelMultijugador() * 100;
            }
        } else {
            progreso.setXpUnijugador(progreso.getXpUnijugador() + cantidad);
            int xpNecesaria = progreso.getNivelUnijugador() * 100;
            while (progreso.getXpUnijugador() >= xpNecesaria) {
                progreso.setXpUnijugador(progreso.getXpUnijugador() - xpNecesaria);
                progreso.setNivelUnijugador(progreso.getNivelUnijugador() + 1);
                xpNecesaria = progreso.getNivelUnijugador() * 100;
            }
        }
        progresoRepository.save(progreso);
    }

    // --- GAME ROOMS ---

    @Transactional
    public JuegoSala crearSala(UUID creadorId, String area, UUID idCuestionario, Integer grado, Integer maxJugadores) {
        Usuario creador = usuarioRepository.findById(creadorId)
                .orElseThrow(() -> new RuntimeException("Usuario creador no encontrado"));

        CuestionarioPersonalizado cuestionario = null;
        if (idCuestionario != null) {
            cuestionario = cuestionarioRepository.findById(idCuestionario).orElse(null);
        }

        // Generar un código de sala único
        String codigo;
        do {
            codigo = String.format("%04d", new Random().nextInt(10000));
        } while (salaRepository.findByCodigoSala(codigo).isPresent());

        JuegoSala sala = new JuegoSala(codigo, creador, "LUDO", area, cuestionario, grado, maxJugadores);
        sala = salaRepository.save(sala);

        // Añadir creador como primer jugador únicamente si es ESTUDIANTE
        if (creador.getRol() == Rol.ESTUDIANTE) {
            JuegoSalaJugador jugador = new JuegoSalaJugador(sala, creador, "ROJO", 0);
            jugador.setEsListo(true); // El creador suele estar listo
            jugadorRepository.save(jugador);
        }

        return sala;
    }

    @Transactional
    public JuegoSala unirseASala(String codigoSala, UUID jugadorId) {
        JuegoSala sala = salaRepository.findByCodigoSala(codigoSala)
                .orElseThrow(() -> new RuntimeException("Código de sala inválido"));

        if (!"ESPERANDO".equals(sala.getEstado())) {
            throw new RuntimeException("La partida ya ha iniciado o finalizado");
        }

        Usuario jugador = usuarioRepository.findById(jugadorId)
                .orElseThrow(() -> new RuntimeException("Usuario jugador no encontrado"));

        Optional<JuegoSalaJugador> existente = jugadorRepository.findBySalaIdSalaAndJugadorIdUsuario(sala.getIdSala(), jugadorId);
        if (existente.isPresent()) {
            return sala; // Ya está unido
        }

        long count = jugadorRepository.countBySalaIdSala(sala.getIdSala());
        if (count >= sala.getMaxJugadores()) {
            throw new RuntimeException("La sala está llena");
        }

        String[] colores = {"ROJO", "VERDE", "AMARILLO", "AZUL"};
        String colorAsignado = colores[(int) count];

        JuegoSalaJugador nuevoJugador = new JuegoSalaJugador(sala, jugador, colorAsignado, (int) count);
        jugadorRepository.save(nuevoJugador);

        return sala;
    }

    // --- GAME ACTIONS ---

    @Transactional
    public JuegoSala iniciarPartida(UUID idSala) {
        JuegoSala sala = salaRepository.findById(idSala)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

        List<JuegoSalaJugador> jugadores = jugadorRepository.findBySalaIdSalaOrderByOrdenTurnoAsc(idSala);
        if (jugadores.isEmpty()) {
            throw new RuntimeException("No hay jugadores en la sala");
        }

        sala.setEstado("EN_PROGRESO");
        sala.setTurnoJugadorId(jugadores.get(0).getJugador().getIdUsuario());
        sala.setPreguntaActivaId(null);
        sala.setPreguntaRespondida(false);
        sala.setDadoUltimoValor(null);

        return salaRepository.save(sala);
    }

    @Transactional
    public JuegoSala lanzarDado(UUID idSala, UUID idJugador) {
        JuegoSala sala = salaRepository.findById(idSala)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));

        if (!"EN_PROGRESO".equals(sala.getEstado())) {
            throw new RuntimeException("La partida no está en curso");
        }

        if (!sala.getTurnoJugadorId().equals(idJugador)) {
            throw new RuntimeException("No es tu turno");
        }

        if (sala.getDadoUltimoValor() != null && sala.getPreguntaActivaId() == null) {
            throw new RuntimeException("Ya lanzaste el dado, debes mover una ficha");
        }

        int dado = new Random().nextInt(6) + 1;
        sala.setDadoUltimoValor(dado);
        sala.setPreguntaActivaId(null);
        sala.setPreguntaRespondida(false);

        return salaRepository.save(sala);
    }

    @Transactional
    public Map<String, Object> moverFicha(UUID idSala, UUID idJugador, int tokenIndex) {
        JuegoSala sala = salaRepository.findById(idSala)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));
        JuegoSalaJugador jugador = jugadorRepository.findBySalaIdSalaAndJugadorIdUsuario(idSala, idJugador)
                .orElseThrow(() -> new RuntimeException("Jugador no registrado en la sala"));

        if (sala.getDadoUltimoValor() == null) {
            throw new RuntimeException("Primero debes lanzar el dado");
        }

        // Leer posiciones de tokens [t0, t1, t2, t3]
        String posString = jugador.getPosicionesTokens();
        int[] posiciones = parsePosiciones(posString);

        int posAnterior = posiciones[tokenIndex];
        int dado = sala.getDadoUltimoValor();
        
        // En un tablero de Ludo simplificado de 40 casilleros:
        // Las fichas en base están en posición 0.
        // Se sale a la pista en posición 1.
        // La meta final es la casilla 40.
        int nuevaPos = posAnterior;
        if (posAnterior == 0) {
            if (dado == 6 || dado == 1) { // Requiere 1 o 6 para salir (más flexible en entorno escolar)
                nuevaPos = 1;
            } else {
                // No puede salir con este dado, el turno pasa al siguiente automáticamente
                posiciones[tokenIndex] = 0;
            }
        } else {
            nuevaPos = posAnterior + dado;
            if (nuevaPos > 40) {
                // Rebota o debe caer exacto. Hagamos que requiera caer exacto
                nuevaPos = posAnterior; 
            }
        }

        posiciones[tokenIndex] = nuevaPos;
        jugador.setPosicionesTokens(Arrays.toString(posiciones));
        jugadorRepository.save(jugador);

        boolean esReto = false;
        PreguntaJuego pregunta = null;

        // Comprobar si cayó en casilla de reto.
        // Casillas de reto en tablero de 40: posiciones impares que no son base o meta final.
        // Hagamos que caiga en reto en casillas: 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36 (casillas múltiplos de 3)
        if (nuevaPos > 0 && nuevaPos < 40 && nuevaPos % 3 == 0) {
            esReto = true;
            if (sala.getCuestionario() != null) {
                pregunta = preguntaRepository.findRandomQuestionFromCuestionario(sala.getCuestionario().getIdCuestionario());
            } else {
                pregunta = preguntaRepository.findRandomQuestion(sala.getArea(), sala.getGrado());
            }

            if (pregunta != null) {
                sala.setPreguntaActivaId(pregunta.getIdPregunta());
                sala.setPreguntaRespondida(false);
                salaRepository.save(sala);
            } else {
                esReto = false; // No hay preguntas cargadas en BD
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("sala", sala);
        result.put("jugador", jugador);
        result.put("esReto", esReto);
        result.put("pregunta", pregunta);
        result.put("posAnterior", posAnterior);
        result.put("posNueva", nuevaPos);
        result.put("tokenIndex", tokenIndex);

        if (!esReto) {
            // Si no hay reto, cambia de turno directamente
            cambiarTurno(sala);
        }

        return result;
    }

    @Transactional
    public Map<String, Object> responderReto(UUID idSala, UUID idJugador, UUID idPregunta, Character opcion) {
        JuegoSala sala = salaRepository.findById(idSala)
                .orElseThrow(() -> new RuntimeException("Sala no encontrada"));
        JuegoSalaJugador jugador = jugadorRepository.findBySalaIdSalaAndJugadorIdUsuario(idSala, idJugador)
                .orElseThrow(() -> new RuntimeException("Jugador no registrado en la sala"));
        PreguntaJuego pregunta = preguntaRepository.findById(idPregunta)
                .orElseThrow(() -> new RuntimeException("Pregunta no encontrada"));

        boolean esCorrecta = pregunta.getRespuestaCorrecta().equals(Character.toUpperCase(opcion));
        
        // Actualizar estadísticas del alumno en base de datos
        EstudianteProgresoJuego progreso = obtenerProgresoEstudiante(idJugador);
        progreso.setPreguntasRespondidas(progreso.getPreguntasRespondidas() + 1);

        if (esCorrecta) {
            progreso.setPreguntasCorrectas(progreso.getPreguntasCorrectas() + 1);
            // Otorgar 15 XP
            agregarXp(idJugador, 15, true);
        } else {
            // Penalización: retroceder 3 casillas
            String posString = jugador.getPosicionesTokens();
            int[] posiciones = parsePosiciones(posString);
            
            // Buscar cuál ficha acaba de moverse (difícil en BD, pasaremos el token index o lo inferimos)
            // Para simplificar, retroceder la ficha que está en la casilla de reto (múltiplo de 3)
            for (int i = 0; i < posiciones.length; i++) {
                if (posiciones[i] > 0 && posiciones[i] < 40 && posiciones[i] % 3 == 0) {
                    posiciones[i] = Math.max(0, posiciones[i] - 3);
                    break;
                }
            }
            jugador.setPosicionesTokens(Arrays.toString(posiciones));
            jugadorRepository.save(jugador);
        }

        progresoRepository.save(progreso);

        sala.setPreguntaRespondida(true);
        sala.setPreguntaActivaId(null);
        sala.setDadoUltimoValor(null); // Limpiar para el siguiente turno
        
        // Verificar si este jugador ya ganó (si todas sus fichas llegaron a 40)
        // Para acortar el Ludo Académico en duelos, ganar requiere que AL MENOS 1 ficha llegue a 40 (o 2 fichas).
        // Cambiemos a: 1 ficha en 40 es victoria académica.
        boolean haGanado = false;
        int[] posicionesFinales = parsePosiciones(jugador.getPosicionesTokens());
        for (int pos : posicionesFinales) {
            if (pos >= 40) {
                haGanado = true;
                break;
            }
        }

        if (haGanado) {
            sala.setEstado("FINALIZADO");
            // Otorgar 100 XP por victoria
            agregarXp(idJugador, 100, true);
            progreso.setJuegosJugados(progreso.getJuegosJugados() + 1);
            progreso.setJuegosGanados(progreso.getJuegosGanados() + 1);
            progresoRepository.save(progreso);
        } else {
            // Pasar turno al siguiente
            cambiarTurno(sala);
        }

        salaRepository.save(sala);

        Map<String, Object> result = new HashMap<>();
        result.put("sala", sala);
        result.put("jugador", jugador);
        result.put("correcto", esCorrecta);
        result.put("respuestaCorrecta", pregunta.getRespuestaCorrecta());
        result.put("haGanado", haGanado);

        return result;
    }

    private void cambiarTurno(JuegoSala sala) {
        List<JuegoSalaJugador> jugadores = jugadorRepository.findBySalaIdSalaOrderByOrdenTurnoAsc(sala.getIdSala());
        int indexActual = -1;
        for (int i = 0; i < jugadores.size(); i++) {
            if (jugadores.get(i).getJugador().getIdUsuario().equals(sala.getTurnoJugadorId())) {
                indexActual = i;
                break;
            }
        }

        if (indexActual != -1) {
            int siguienteIndex = (indexActual + 1) % jugadores.size();
            sala.setTurnoJugadorId(jugadores.get(siguienteIndex).getJugador().getIdUsuario());
        }
        
        sala.setDadoUltimoValor(null); // Limpiar dado para el siguiente jugador
        sala.setPreguntaActivaId(null);
        sala.setPreguntaRespondida(false);
    }

    private int[] parsePosiciones(String str) {
        if (str == null || str.trim().isEmpty()) {
            return new int[]{0, 0, 0, 0};
        }
        // parse "[0, 0, 0, 0]"
        str = str.replace("[", "").replace("]", "").replace(" ", "");
        String[] parts = str.split(",");
        int[] res = new int[4];
        for (int i = 0; i < 4; i++) {
            if (i < parts.length) {
                try {
                    res[i] = Integer.parseInt(parts[i]);
                } catch (Exception e) {
                    res[i] = 0;
                }
            } else {
                res[i] = 0;
            }
        }
        return res;
    }

    // --- CUSTOM CHALLENGES (TEACHER) ---

    @Transactional
    public CuestionarioPersonalizado crearCuestionario(UUID creadorId, String titulo, String descripcion, UUID idCurso) {
        Usuario docente = usuarioRepository.findById(creadorId)
                .orElseThrow(() -> new RuntimeException("Docente no encontrado"));
        
        Curso curso = null;
        if (idCurso != null) {
            curso = cursoRepository.findById(idCurso).orElse(null);
        }

        CuestionarioPersonalizado cuestionario = new CuestionarioPersonalizado(titulo, descripcion, docente, curso);
        return cuestionarioRepository.save(cuestionario);
    }

    @Transactional
    public PreguntaJuego agregarPreguntaACuestionario(UUID idCuestionario, PreguntaJuego pregunta) {
        CuestionarioPersonalizado cuestionario = cuestionarioRepository.findById(idCuestionario)
                .orElseThrow(() -> new RuntimeException("Cuestionario no encontrado"));
        
        pregunta.setCuestionario(cuestionario);
        return preguntaRepository.save(pregunta);
    }

    public List<CuestionarioPersonalizado> listarCuestionariosDocente(UUID idDocente) {
        return cuestionarioRepository.findByCreadorIdUsuarioOrderByFechaCreacionDesc(idDocente);
    }

    public List<PreguntaJuego> listarPreguntasDeCuestionario(UUID idCuestionario) {
        return preguntaRepository.findByCuestionarioIdCuestionario(idCuestionario);
    }
}

package com.jec.cist.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jec.cist.models.JuegoSala;
import com.jec.cist.models.JuegoSalaJugador;
import com.jec.cist.models.PreguntaJuego;
import com.jec.cist.repositories.JuegoSalaJugadorRepository;
import com.jec.cist.repositories.JuegoSalaRepository;
import com.jec.cist.services.JuegoService;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class JuegoWebSocketHandler extends TextWebSocketHandler {

    private final JuegoService juegoService;
    private final JuegoSalaRepository salaRepository;
    private final JuegoSalaJugadorRepository jugadorRepository;
    private final ObjectMapper objectMapper;

    // Estructuras para manejar sesiones activas
    // salaId -> Set de sesiones activas
    private final Map<UUID, Set<WebSocketSession>> salaSessions = new ConcurrentHashMap<>();
    // sessionId -> salaId
    private final Map<String, UUID> sessionRooms = new ConcurrentHashMap<>();

    public JuegoWebSocketHandler(
            JuegoService juegoService,
            JuegoSalaRepository salaRepository,
            JuegoSalaJugadorRepository jugadorRepository) {
        this.juegoService = juegoService;
        this.salaRepository = salaRepository;
        this.jugadorRepository = jugadorRepository;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // La sesión se establece, pero aún no se asocia a ninguna sala
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Map<String, Object> payload = objectMapper.readValue(message.getPayload(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
        String type = (String) payload.get("type");
        if (type == null) return;

        try {
            switch (type) {
                case "JOIN_ROOM":
                    handleJoinRoom(session, payload);
                    break;
                case "START_GAME":
                    handleStartGame(payload);
                    break;
                case "ROLL_DICE":
                    handleRollDice(payload);
                    break;
                case "MOVE_TOKEN":
                    handleMoveToken(payload);
                    break;
                case "ANSWER_CHALLENGE":
                    handleAnswerChallenge(payload);
                    break;
                case "CHAT_MESSAGE":
                    handleChatMessage(payload);
                    break;
                case "LEAVE_ROOM":
                    handleLeaveRoom(session);
                    break;
            }
        } catch (Exception e) {
            sendError(session, e.getMessage());
        }
    }

    private void handleJoinRoom(WebSocketSession session, Map<String, Object> payload) throws IOException {
        String idSalaStr = (String) payload.get("idSala");
        String idUsuarioStr = (String) payload.get("idUsuario");
        if (idSalaStr == null || idUsuarioStr == null) return;

        UUID idSala = UUID.fromString(idSalaStr);

        // Registrar sesión en la sala
        salaSessions.computeIfAbsent(idSala, k -> ConcurrentHashMap.newKeySet()).add(session);
        sessionRooms.put(session.getId(), idSala);

        // Enviar estado actual de la sala a todos
        broadcastSalaState(idSala, "JUGADOR_UNIDO", idUsuarioStr + " se ha conectado");
    }

    private void handleStartGame(Map<String, Object> payload) throws IOException {
        String idSalaStr = (String) payload.get("idSala");
        if (idSalaStr == null) return;

        UUID idSala = UUID.fromString(idSalaStr);
        juegoService.iniciarPartida(idSala);

        broadcastSalaState(idSala, "PARTIDA_INICIADA", "La partida ha comenzado");
    }

    private void handleRollDice(Map<String, Object> payload) throws IOException {
        String idSalaStr = (String) payload.get("idSala");
        String idUsuarioStr = (String) payload.get("idUsuario");
        if (idSalaStr == null || idUsuarioStr == null) return;

        UUID idSala = UUID.fromString(idSalaStr);
        UUID idUsuario = UUID.fromString(idUsuarioStr);

        JuegoSala sala = juegoService.lanzarDado(idSala, idUsuario);

        broadcastSalaState(idSala, "DADO_LANZADO", "Dado lanzado: " + sala.getDadoUltimoValor());
    }

    private void handleMoveToken(Map<String, Object> payload) throws IOException {
        String idSalaStr = (String) payload.get("idSala");
        String idUsuarioStr = (String) payload.get("idUsuario");
        Number tokenIndexNum = (Number) payload.get("tokenIndex");
        if (idSalaStr == null || idUsuarioStr == null || tokenIndexNum == null) return;

        UUID idSala = UUID.fromString(idSalaStr);
        UUID idUsuario = UUID.fromString(idUsuarioStr);
        int tokenIndex = tokenIndexNum.intValue();

        Map<String, Object> result = juegoService.moverFicha(idSala, idUsuario, tokenIndex);
        boolean esReto = (boolean) result.get("esReto");

        if (esReto) {
            PreguntaJuego preg = (PreguntaJuego) result.get("pregunta");
            broadcastChallengeActive(idSala, preg, idUsuarioStr);
        } else {
            broadcastSalaState(idSala, "FICHA_MOVIDA", "Ficha movida a casilla " + result.get("posNueva"));
        }
    }

    private void handleAnswerChallenge(Map<String, Object> payload) throws IOException {
        String idSalaStr = (String) payload.get("idSala");
        String idUsuarioStr = (String) payload.get("idUsuario");
        String idPreguntaStr = (String) payload.get("idPregunta");
        String opcionStr = (String) payload.get("opcion");
        if (idSalaStr == null || idUsuarioStr == null || idPreguntaStr == null || opcionStr == null) return;

        UUID idSala = UUID.fromString(idSalaStr);
        UUID idUsuario = UUID.fromString(idUsuarioStr);
        UUID idPregunta = UUID.fromString(idPreguntaStr);
        Character opcion = opcionStr.charAt(0);

        Map<String, Object> result = juegoService.responderReto(idSala, idUsuario, idPregunta, opcion);
        boolean correcto = (boolean) result.get("correcto");
        boolean haGanado = (boolean) result.get("haGanado");

        broadcastChallengeResult(idSala, correcto, (Character) result.get("respuestaCorrecta"), idUsuarioStr, haGanado);
    }

    private void handleChatMessage(Map<String, Object> payload) throws IOException {
        String idSalaStr = (String) payload.get("idSala");
        String idUsuarioStr = (String) payload.get("idUsuario");
        String text = (String) payload.get("text");
        if (idSalaStr == null || idUsuarioStr == null || text == null) return;

        UUID idSala = UUID.fromString(idSalaStr);
        
        Map<String, Object> response = new HashMap<>();
        response.put("type", "CHAT_MESSAGE");
        response.put("senderId", idUsuarioStr);
        response.put("text", text);
        response.put("timestamp", LocalDateTime.now().toString());

        broadcastToSala(idSala, response);
    }

    private void handleLeaveRoom(WebSocketSession session) throws IOException {
        UUID idSala = sessionRooms.remove(session.getId());
        if (idSala != null) {
            Set<WebSocketSession> sessions = salaSessions.get(idSala);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    salaSessions.remove(idSala);
                } else {
                    broadcastSalaState(idSala, "JUGADOR_SALIDO", "Un jugador se ha desconectado");
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        handleLeaveRoom(session);
    }

    // --- HELPER BROADCAST METHODS ---

    private void broadcastSalaState(UUID idSala, String evento, String mensaje) throws IOException {
        JuegoSala sala = salaRepository.findById(idSala).orElse(null);
        if (sala == null) return;

        List<JuegoSalaJugador> jugadores = jugadorRepository.findBySalaIdSalaOrderByOrdenTurnoAsc(idSala);
        
        // Mapear DTO simplificado para evitar ciclos de JPA
        List<Map<String, Object>> jugadoresList = new ArrayList<>();
        for (JuegoSalaJugador j : jugadores) {
            Map<String, Object> jMap = new HashMap<>();
            jMap.put("idUsuario", j.getJugador().getIdUsuario().toString());
            jMap.put("nombres", j.getJugador().getNombres());
            jMap.put("apellidos", j.getJugador().getApellidos());
            jMap.put("color", j.getColor());
            jMap.put("posicionesTokens", j.getPosicionesTokens());
            jMap.put("esListo", j.getEsListo());
            jMap.put("ordenTurno", j.getOrdenTurno());
            jugadoresList.add(jMap);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("type", "STATE_UPDATE");
        response.put("idSala", idSala.toString());
        response.put("codigoSala", sala.getCodigoSala());
        response.put("estado", sala.getEstado());
        response.put("tipoJuego", sala.getTipoJuego());
        response.put("area", sala.getArea());
        response.put("cuestionarioTitulo", sala.getCuestionario() != null ? sala.getCuestionario().getTitulo() : null);
        response.put("grado", sala.getGrado());
        response.put("dadoUltimoValor", sala.getDadoUltimoValor());
        response.put("turnoJugadorId", sala.getTurnoJugadorId() != null ? sala.getTurnoJugadorId().toString() : null);
        response.put("preguntaActivaId", sala.getPreguntaActivaId() != null ? sala.getPreguntaActivaId().toString() : null);
        response.put("preguntaRespondida", sala.getPreguntaRespondida());
        response.put("creadorId", sala.getCreador().getIdUsuario().toString());
        response.put("jugadores", jugadoresList);
        response.put("ultimoEvento", evento);
        response.put("mensaje", mensaje);

        broadcastToSala(idSala, response);
    }

    private void broadcastChallengeActive(UUID idSala, PreguntaJuego preg, String jugadorId) throws IOException {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "CHALLENGE_ACTIVE");
        response.put("jugadorId", jugadorId);
        
        Map<String, Object> qMap = new HashMap<>();
        qMap.put("idPregunta", preg.getIdPregunta().toString());
        qMap.put("enunciado", preg.getEnunciado());
        qMap.put("opcionA", preg.getOpcionA());
        qMap.put("opcionB", preg.getOpcionB());
        qMap.put("opcionC", preg.getOpcionC());
        qMap.put("opcionD", preg.getOpcionD());
        qMap.put("area", preg.getArea());
        qMap.put("dificultad", preg.getDificultad());
        
        response.put("pregunta", qMap);

        broadcastToSala(idSala, response);
    }

    private void broadcastChallengeResult(UUID idSala, boolean correcto, Character respuestaCorrecta, String jugadorId, boolean haGanado) throws IOException {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "CHALLENGE_RESULT");
        response.put("jugadorId", jugadorId);
        response.put("correcto", correcto);
        response.put("respuestaCorrecta", String.valueOf(respuestaCorrecta));
        response.put("haGanado", haGanado);

        broadcastToSala(idSala, response);
        
        // Seguido de un state update para sincronizar las nuevas posiciones
        broadcastSalaState(idSala, haGanado ? "PARTIDA_FINALIZADA" : "RETO_COMPLETADO", 
                "El jugador ha " + (correcto ? "acertado" : "fallado") + " el reto");
    }

    private void broadcastToSala(UUID idSala, Map<String, Object> msgMap) throws IOException {
        Set<WebSocketSession> sessions = salaSessions.get(idSala);
        if (sessions == null) return;

        String msgJson = objectMapper.writeValueAsString(msgMap);
        TextMessage textMessage = new TextMessage(msgJson);

        List<WebSocketSession> closedSessions = new ArrayList<>();
        for (WebSocketSession session : sessions) {
            if (session.isOpen()) {
                synchronized (session) {
                    session.sendMessage(textMessage);
                }
            } else {
                closedSessions.add(session);
            }
        }
        
        // Limpieza de sesiones cerradas
        for (WebSocketSession s : closedSessions) {
            sessions.remove(s);
            sessionRooms.remove(s.getId());
        }
    }

    private void sendError(WebSocketSession session, String message) throws IOException {
        if (session.isOpen()) {
            Map<String, Object> errMap = new HashMap<>();
            errMap.put("type", "ERROR");
            errMap.put("message", message);
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(errMap)));
        }
    }
}

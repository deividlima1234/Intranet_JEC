import React, { useState, useEffect, useRef } from 'react';
import {
  Gamepad2,
  Trophy,
  Users,
  User,
  Plus,
  Play,
  CheckCircle,
  HelpCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  Clock,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Award,
  LogOut,
  X,
  Loader2
} from 'lucide-react';

export default function JuegosView({ currentUser, preselectedArea, onClearPreselected, isTestingMode = false }) {
  const [activeTab, setActiveTab] = useState('progreso'); // 'progreso', 'lobby', 'juego'
  
  // Estados de Gamificación
  const [progreso, setProgreso] = useState(null);
  const [loadingProgreso, setLoadingProgreso] = useState(true);

  // Estados de Salas/Lobby
  const [salasEspera, setSalasEspera] = useState([]);
  const [loadingSalas, setLoadingSalas] = useState(false);
  const [cuestionariosCurso, setCuestionariosCurso] = useState([]);
  
  // Configuración de nueva sala
  const [nuevoGrado, setNuevoGrado] = useState(currentUser.grado || '1');
  const [nuevoArea, setNuevoArea] = useState('MATEMÁTICA');
  const [idCuestionarioSeleccionado, setIdCuestionarioSeleccionado] = useState('');
  const [codigoSalaJoin, setCodigoSalaJoin] = useState('');
  const [creandoSala, setCreandoSala] = useState(false);
  const [uniJugador, setUniJugador] = useState(false);

  // Estado del juego activo
  const [salaActiva, setSalaActiva] = useState(null);
  const [jugadoresSala, setJugadoresSala] = useState([]);
  const [miColor, setMiColor] = useState('ROJO');
  const [dadoValor, setDadoValor] = useState(null);
  const [dadoLanzando, setDadoLanzando] = useState(false);
  const [preguntaActiva, setPreguntaActiva] = useState(null);
  const [respondidoOp, setRespondidoOp] = useState(null);
  const [resultadoReto, setResultadoReto] = useState(null); // { correcto: boolean, respuestaCorrecta: string }
  const [cronometro, setCronometro] = useState(30);
  const [audioHabilitado, setAudioHabilitado] = useState(true);
  const [cargandoJuego, setCargandoJuego] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Chat de sala
  const [chatTexto, setChatTexto] = useState('');
  const [chatMensajes, setChatMensajes] = useState([]);

  // Referencias para WebSocket y Temporizadores
  const socketRef = useRef(null);
  const cronometroIntervalRef = useRef(null);

  // Lista de las 12+ áreas principales
  const areasCurriculares = [
    'MATEMÁTICA',
    'COMUNICACIÓN',
    'CIENCIA Y TECNOLOGIA',
    'CIENCIAS SOCIALES',
    'INGLES',
    'DPCC',
    'ARTE',
    'ED. FISICA',
    'ED. RELIGIOSA',
    'ED. PARA EL TRABAJO',
    'QUECHUA',
    'TUTORÍA'
  ];

  // Coordenadas SVG para dibujar el recorrido de Ludo de 40 casillas.
  // Es una pista cuadrada que rodea el centro (meta).
  // La pista se dibuja en una cuadrícula de 15x15. Cada celda es de 30x30px.
  // Coordenadas para casillas de 1 a 40 (índices 0 a 39 en el array)
  const coordenadasPista = [
    // Lado Izquierdo subiendo (casillas 1-10)
    { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
    { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 },
    // Lado Superior cruzando (casillas 11-20)
    { x: 7, y: 1 }, { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 },
    { x: 8, y: 5 }, { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 },
    // Lado Derecho bajando (casillas 21-30)
    { x: 13, y: 6 }, { x: 13, y: 7 }, { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 },
    { x: 10, y: 8 }, { x: 9, y: 8 }, { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 },
    // Lado Inferior retornando (casillas 31-40)
    { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 7, y: 13 }, { x: 6, y: 13 }, { x: 6, y: 12 },
    { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 }, { x: 5, y: 8 }, { x: 4, y: 8 }
  ];

  // Coordenadas para las bases (casilla 0) para cada color
  const coordenadasBases = {
    ROJO: [
      { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 3 }
    ],
    VERDE: [
      { x: 11, y: 2 }, { x: 12, y: 2 }, { x: 11, y: 3 }, { x: 12, y: 3 }
    ],
    AMARILLO: [
      { x: 11, y: 11 }, { x: 12, y: 11 }, { x: 11, y: 12 }, { x: 12, y: 12 }
    ],
    AZUL: [
      { x: 2, y: 11 }, { x: 3, y: 11 }, { x: 2, y: 12 }, { x: 3, y: 12 }
    ]
  };

  // Coordenadas para la meta final (casilla 40) en el centro (7, 7)
  const coordenadasMeta = {
    ROJO: { x: 6, y: 7 },
    VERDE: { x: 7, y: 6 },
    AMARILLO: { x: 8, y: 7 },
    AZUL: { x: 7, y: 8 }
  };

  // Sonidos básicos sintetizados usando Web Audio API para no depender de archivos externos (offline robusto!)
  const reproducirSonido = (tipo) => {
    if (!audioHabilitado) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (tipo === 'click') {
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (tipo === 'dado') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (tipo === 'acierto') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (tipo === 'error') {
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (tipo === 'victoria') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.02, audioCtx.currentTime + 0.8);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.8);
      }
    } catch (e) {
      console.warn("Audio context no soportado aún o bloqueado por navegador", e);
    }
  };

  // Cargar perfil gamificado
  const fetchProgreso = async () => {
    setLoadingProgreso(true);
    try {
      const res = await fetch(`/api/v1/juegos/progreso/${currentUser.idUsuario}`);
      if (res.ok) {
        const data = await res.json();
        setProgreso(data);
      }
    } catch (e) {
      console.error("Error al cargar progreso gamer:", e);
    } finally {
      setLoadingProgreso(false);
    }
  };

  // Cargar salas de espera
  const fetchSalasEspera = async () => {
    setLoadingSalas(true);
    try {
      const res = await fetch('/api/v1/juegos/salas/espera');
      if (res.ok) {
        const data = await res.json();
        setSalasEspera(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSalas(false);
    }
  };

  // Cargar cuestionarios del curso del estudiante para crear sala
  const fetchCuestionariosCurso = async () => {
    try {
      // Intentamos traer cuestionarios de todos los cursos asignados del estudiante o docente
      let url = `/api/v1/cursos/estudiante/${currentUser.idUsuario}`;
      if (currentUser.rol === 'DOCENTE') {
        url = `/api/v1/cursos/docente/${currentUser.idUsuario}`;
      }
      const resCursos = await fetch(url);
      if (resCursos.ok) {
        const cursosList = await resCursos.json();
        let allCuestionarios = [];
        for (const curso of cursosList) {
          const resQuest = await fetch(`/api/v1/juegos/curso/${curso.idCurso}/cuestionarios`);
          if (resQuest.ok) {
            const list = await resQuest.json();
            allCuestionarios = [...allCuestionarios, ...list.map(l => ({ ...l, cursoNombre: curso.nombre }))];
          }
        }
        setCuestionariosCurso(allCuestionarios);
      }
    } catch (e) {
      console.error("Error al cargar cuestionarios para lobby:", e);
    }
  };

  useEffect(() => {
    fetchProgreso();
    fetchSalasEspera();
    fetchCuestionariosCurso();
  }, [currentUser]);

  // Manejo de redirección rápida desde "Mis Cursos" (Duels / Class Challenges)
  useEffect(() => {
    if (preselectedArea) {
      reproducirSonido('click');
      
      if (preselectedArea.idSala) {
        // Conectar como espectador / jugador a sala específica
        conectarWebSocket(preselectedArea.idSala);
        setActiveTab('juego');
      } else {
        setActiveTab('lobby');
        // Si nos pasaron un área o cuestionario
        if (preselectedArea.area) {
          setNuevoArea(preselectedArea.area);
        }
        if (preselectedArea.idCuestionario) {
          setIdCuestionarioSeleccionado(preselectedArea.idCuestionario);
          // Si el docente pre-configuró el modo a single o multi
          if (preselectedArea.mode === 'single') {
            // Iniciar unijugador directamente con este cuestionario
            iniciarPartidaUnijugadorDirecta(preselectedArea.area, preselectedArea.idCuestionario);
          }
        }
      }
      onClearPreselected();
    }
  }, [preselectedArea]);

  // Limpieza del temporizador al desmontar
  useEffect(() => {
    return () => {
      detenerCronometro();
      desconectarWebSocket();
    };
  }, []);

  // --- WEBSOCKET CONNECTION & MESSAGING ---

  const conectarWebSocket = (idSala, isUniJugador = false) => {
    desconectarWebSocket();

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws-juegos`;

    console.log("Conectando a WebSocket del Juego:", wsUrl);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("Conexión WebSocket establecida con éxito.");
      // Unirse a la sala
      ws.send(JSON.stringify({
        type: 'JOIN_ROOM',
        idSala: idSala,
        idUsuario: currentUser.idUsuario
      }));

      // Si es unijugador, iniciar automáticamente al conectar
      if (isUniJugador) {
        ws.send(JSON.stringify({
          type: 'START_GAME',
          idSala: idSala,
          idUsuario: currentUser.idUsuario
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        handleMensajeWS(msg);
      } catch (e) {
        console.error("Error al parsear mensaje WebSocket:", e);
      }
    };

    ws.onclose = (e) => {
      console.log("Conexión WebSocket cerrada:", e);
    };

    ws.onerror = (err) => {
      console.error("Error en WebSocket:", err);
      setErrorMsg("Error de conexión en tiempo real con la partida.");
    };
  };

  const desconectarWebSocket = () => {
    if (socketRef.current) {
      if (socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      socketRef.current = null;
    }
  };

  const enviarWS = (msgObj) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msgObj));
    } else {
      console.warn("WebSocket no conectado, no se pudo enviar:", msgObj);
    }
  };

  const handleMensajeWS = (msg) => {
    switch (msg.type) {
      case 'STATE_UPDATE':
        setSalaActiva(msg);
        setJugadoresSala(msg.jugadores);
        
        // Identificar mi color asignado
        const yo = msg.jugadores.find(j => j.idUsuario === currentUser.idUsuario);
        if (yo) {
          setMiColor(yo.color);
        } else {
          setMiColor('ESPECTADOR');
        }

        // Si la partida ha terminado, limpiar estados
        if (msg.estado === 'FINALIZADO') {
          reproducirSonido('victoria');
          detenerCronometro();
          setPreguntaActiva(null);
          setDadoValor(null);
        } else if (msg.estado === 'EN_PROGRESO') {
          // Si cambió el turno y es mi turno, reproducir un click
          if (msg.turnoJugadorId === currentUser.idUsuario && msg.dadoUltimoValor === null) {
            reproducirSonido('click');
          }
          if (msg.dadoUltimoValor !== null) {
            setDadoValor(msg.dadoUltimoValor);
          }
        }
        break;

      case 'CHALLENGE_ACTIVE':
        setPreguntaActiva(msg.pregunta);
        setRespondidoOp(null);
        setResultadoReto(null);
        reproducirSonido('click');
        iniciarCronometro(msg.pregunta.idPregunta);
        break;

      case 'CHALLENGE_RESULT':
        detenerCronometro();
        setResultadoReto({
          correcto: msg.correcto,
          respuestaCorrecta: msg.respuestaCorrecta
        });
        reproducirSonido(msg.correcto ? 'acierto' : 'error');
        // Quitar la tarjeta de reto después de 3.5 segundos
        setTimeout(() => {
          setPreguntaActiva(null);
          setResultadoReto(null);
          setRespondidoOp(null);
        }, 3500);
        break;

      case 'CHAT_MESSAGE':
        setChatMensajes(prev => [...prev, msg]);
        break;

      case 'ERROR':
        setErrorMsg(msg.message);
        setTimeout(() => setErrorMsg(null), 4000);
        break;
    }
  };

  // --- TEMPORIZADOR DEL RETO ---

  const iniciarCronometro = (idPregunta) => {
    detenerCronometro();
    setCronometro(30);
    cronometroIntervalRef.current = setInterval(() => {
      setCronometro(prev => {
        if (prev <= 1) {
          detenerCronometro();
          // Responder automáticamente incorrecto por falta de tiempo si es mi turno
          if (salaActiva && salaActiva.turnoJugadorId === currentUser.idUsuario) {
            enviarRespuesta('X', idPregunta); // Opción incorrecta
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const detenerCronometro = () => {
    if (cronometroIntervalRef.current) {
      clearInterval(cronometroIntervalRef.current);
      cronometroIntervalRef.current = null;
    }
  };

  // --- ACCIONES DEL LUDO ---

  const iniciarPartidaUnijugadorDirecta = async (area, idCuestionario) => {
    setCargandoJuego(true);
    setUniJugador(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/juegos/salas/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCreador: currentUser.idUsuario,
          area: area,
          idCuestionario: idCuestionario || null,
          grado: currentUser.grado || 3,
          maxJugadores: 2 // Tú vs CPU
        })
      });
      if (res.ok) {
        const sala = await res.json();
        // Iniciar unijugador
        conectarWebSocket(sala.idSala, true);
        setActiveTab('juego');
        setCargandoJuego(false);
      }
    } catch (e) {
      setErrorMsg("Error al iniciar juego unijugador.");
      setCargandoJuego(false);
    }
  };

  const handleCrearSala = async (e) => {
    e.preventDefault();
    setCreandoSala(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/juegos/salas/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCreador: currentUser.idUsuario,
          area: nuevoArea,
          idCuestionario: idCuestionarioSeleccionado || null,
          grado: parseInt(nuevoGrado),
          maxJugadores: 4
        })
      });
      if (res.ok) {
        const sala = await res.json();
        setUniJugador(false);
        conectarWebSocket(sala.idSala);
        setActiveTab('juego');
        setChatMensajes([]);
      } else {
        setErrorMsg("No se pudo crear la sala.");
      }
    } catch (err) {
      setErrorMsg("Error de conexión al crear sala.");
    } finally {
      setCreandoSala(false);
    }
  };

  const handleUnirseSala = async (codigo) => {
    if (!codigo || codigo.trim().length !== 4) return;
    setCargandoJuego(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/v1/juegos/salas/unirse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigoSala: codigo.trim(),
          idJugador: currentUser.idUsuario
        })
      });
      if (res.ok) {
        const sala = await res.json();
        setUniJugador(false);
        conectarWebSocket(sala.idSala);
        setActiveTab('juego');
        setChatMensajes([]);
        setCodigoSalaJoin('');
      } else {
        setErrorMsg("Código de sala incorrecto o sala llena.");
      }
    } catch (e) {
      setErrorMsg("Error de red al intentar unirse.");
    } finally {
      setCargandoJuego(false);
    }
  };

  const lanzarDadoJuego = () => {
    if (dadoLanzando || !salaActiva) return;
    
    // Verificar si es mi turno
    if (salaActiva.turnoJugadorId !== currentUser.idUsuario) {
      setErrorMsg("¡No es tu turno!");
      setTimeout(() => setErrorMsg(null), 2000);
      return;
    }

    reproducirSonido('dado');
    setDadoLanzando(true);
    setDadoValor(null);

    // Animación de dado local en React
    let count = 0;
    const interval = setInterval(() => {
      setDadoValor(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 8) {
        clearInterval(interval);
        setDadoLanzando(false);
        
        // Enviar la tirada real al servidor
        enviarWS({
          type: 'ROLL_DICE',
          idSala: salaActiva.idSala,
          idUsuario: currentUser.idUsuario
        });
      }
    }, 80);
  };

  const moverFichaJuego = (tokenIndex) => {
    if (!salaActiva || dadoLanzando) return;
    if (salaActiva.turnoJugadorId !== currentUser.idUsuario) return;
    if (salaActiva.dadoUltimoValor === null) return;
    if (salaActiva.preguntaActivaId !== null) return; // Primero debe responder el reto si hay uno

    reproducirSonido('click');
    enviarWS({
      type: 'MOVE_TOKEN',
      idSala: salaActiva.idSala,
      idUsuario: currentUser.idUsuario,
      tokenIndex: tokenIndex
    });
  };

  const enviarRespuesta = (opcion, idPregunta) => {
    if (respondidoOp) return;
    setRespondidoOp(opcion);
    enviarWS({
      type: 'ANSWER_CHALLENGE',
      idSala: salaActiva.idSala,
      idUsuario: currentUser.idUsuario,
      idPregunta: idPregunta,
      opcion: opcion
    });
  };

  const iniciarPartidaLobby = () => {
    if (!salaActiva) return;
    enviarWS({
      type: 'START_GAME',
      idSala: salaActiva.idSala,
      idUsuario: currentUser.idUsuario
    });
  };

  const abandonarPartida = () => {
    if (window.confirm("¿Estás seguro de que deseas abandonar la partida? Se te considerará como derrota.")) {
      reproducirSonido('click');
      enviarWS({
        type: 'LEAVE_ROOM'
      });
      desconectarWebSocket();
      setSalaActiva(null);
      setJugadoresSala([]);
      setPreguntaActiva(null);
      setDadoValor(null);
      fetchProgreso();
      fetchSalasEspera();
      setActiveTab('progreso');
    }
  };

  const handleSendChatMessage = (e) => {
    e.preventDefault();
    if (!chatTexto.trim() || !salaActiva) return;
    
    enviarWS({
      type: 'CHAT_MESSAGE',
      idSala: salaActiva.idSala,
      idUsuario: currentUser.idUsuario,
      text: chatTexto.trim()
    });
    setChatTexto('');
  };

  // Helper para parsear posiciones del JSON a int[]
  const parsePosiciones = (str) => {
    if (!str) return [0, 0, 0, 0];
    try {
      return JSON.parse(str);
    } catch (e) {
      // Si viene como "[0, 0, 0, 0]"
      const clean = str.replace("[", "").replace("]", "").replace(/ /g, "");
      return clean.split(",").map(Number);
    }
  };

  // Determinar color de ficha de Ludo
  const getFichaColorClass = (color) => {
    switch (color) {
      case 'ROJO': return 'fill-rose-500 stroke-rose-950 shadow-rose-500/50';
      case 'VERDE': return 'fill-emerald-500 stroke-emerald-950 shadow-emerald-500/50';
      case 'AMARILLO': return 'fill-amber-500 stroke-amber-950 shadow-amber-500/50';
      case 'AZUL': return 'fill-indigo-500 stroke-indigo-950 shadow-indigo-500/50';
      default: return 'fill-slate-500';
    }
  };

  // Retorna true si es mi turno en el juego
  const esMiTurno = salaActiva && salaActiva.turnoJugadorId === currentUser.idUsuario;

  return (
    <div className="space-y-6">
      
      {/* HEADER DE LA SECCIÓN */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-emerald-400" />
            Juegos Interactivos
            {isTestingMode && (
              <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold animate-pulse">
                Modo Pruebas (Solo CIST)
              </span>
            )}
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Demuestra tus conocimientos académicos y sube de nivel jugando en red local.
          </p>
        </div>
        
        {/* Pestañas superiores */}
        <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-2xl gap-1 w-fit">
          <button
            onClick={() => {
              reproducirSonido('click');
              fetchProgreso();
              setActiveTab('progreso');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'progreso' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mi Progreso
          </button>
          <button
            onClick={() => {
              reproducirSonido('click');
              fetchSalasEspera();
              fetchCuestionariosCurso();
              setActiveTab('lobby');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'lobby' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Lobby de Salas
          </button>
          {salaActiva && (
            <button
              onClick={() => setActiveTab('juego')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'juego' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-500" />
              Partida Activa
            </button>
          )}
        </div>
      </div>

      {/* MODO PRUEBAS BANNER */}
      {isTestingMode && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/20 p-4 rounded-2xl flex items-center gap-3.5 shadow-lg shadow-amber-500/2">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <AlertTriangle className="w-5 h-5 shrink-0" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-200">Módulo en Desarrollo / Fase de Pruebas</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Esta sección está configurada en **Modo Pruebas** y actualmente está oculta para Estudiantes y Docentes. Solo los usuarios con rol **CIST** pueden ver y testear su funcionamiento.
            </p>
          </div>
        </div>
      )}

      {/* MODO JUEGO: ALERTA DE ERROR */}
      {errorMsg && (
        <div className="p-4 bg-rose-950/30 text-rose-450 border border-rose-900/50 rounded-2xl text-xs flex items-center gap-2 animate-bounce">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1. SECCIÓN: MI PROGRESO / ESTADÍSTICAS */}
      {activeTab === 'progreso' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Tarjeta Perfil Unijugador */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl"></div>
            <h3 className="font-extrabold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-3">
              <User className="w-4.5 h-4.5 text-emerald-400" />
              Práctica Unijugador
            </h3>
            
            {loadingProgreso ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
            ) : progreso ? (
              <div className="space-y-5 pt-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Nivel Actual</span>
                    <span className="text-3xl font-black text-slate-100">Nivel {progreso.nivelUnijugador}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{progreso.xpUnijugador} / {progreso.nivelUnijugador * 100} XP</span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-900">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(progreso.xpUnijugador / (progreso.nivelUnijugador * 100)) * 100}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Acumula XP respondiendo correctamente las casillas de reto contra la computadora.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6">No se pudo cargar el progreso.</p>
            )}
          </div>

          {/* Tarjeta Perfil Multijugador */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl"></div>
            <h3 className="font-extrabold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-3">
              <Users className="w-4.5 h-4.5 text-indigo-400" />
              Duelos Multijugador
            </h3>
            
            {loadingProgreso ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-500" /></div>
            ) : progreso ? (
              <div className="space-y-5 pt-3">
                <div className="flex justify-between items-end">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Rango en Duelos</span>
                    <span className="text-3xl font-black text-slate-100">Nivel {progreso.nivelMultijugador}</span>
                  </div>
                  <span className="text-xs text-slate-400 font-semibold">{progreso.xpMultijugador} / {progreso.nivelMultijugador * 100} XP</span>
                </div>

                {/* Barra de progreso */}
                <div className="w-full bg-slate-950 rounded-full h-3.5 p-0.5 border border-slate-900">
                  <div 
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${(progreso.xpMultijugador / (progreso.nivelMultijugador * 100)) * 100}%` }}
                  ></div>
                </div>

                <p className="text-[11px] text-slate-500 italic">
                  Enfréntate a tus compañeros de clase en Ludo Académico y sube en la clasificación local.
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6">No se pudo cargar el progreso.</p>
            )}
          </div>

          {/* Estadísticas de Respuestas */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
            <h3 className="font-extrabold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-3">
              <Trophy className="w-4.5 h-4.5 text-amber-400" />
              Estadísticas y Medallas
            </h3>
            
            {loadingProgreso ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-amber-500" /></div>
            ) : progreso ? (
              <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900/60">
                  <span className="text-[10px] text-slate-500 block uppercase">Partidas Jugadas</span>
                  <span className="text-xl font-bold text-slate-200">{progreso.juegosJugados}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900/60">
                  <span className="text-[10px] text-slate-500 block uppercase">Partidas Ganadas</span>
                  <span className="text-xl font-bold text-emerald-400">{progreso.juegosGanados}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900/60 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Acierto en Retos</span>
                    <span className="text-lg font-bold text-slate-200">
                      {progreso.preguntasRespondidas > 0 
                        ? `${Math.round((progreso.preguntasCorrectas / progreso.preguntasRespondidas) * 100)}%` 
                        : '0%'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {progreso.preguntasCorrectas} de {progreso.preguntasRespondidas} correctas
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-6">No se pudo cargar estadísticas.</p>
            )}
          </div>

          {/* Explicación de Juegos Académicos */}
          <div className="md:col-span-3 bg-slate-900/20 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0">
              <Gamepad2 className="w-10 h-10" />
            </div>
            <div className="space-y-1.5 text-center md:text-left">
              <h4 className="font-extrabold text-slate-200 text-sm">¿Cómo funciona el Ludo Académico?</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                El tablero posee **casillas de reto** (celdas múltiplos de 3 marcadas con un "?"). Al caer en una de ellas, el juego mostrará una pregunta de opción múltiple correspondiente al área elegida. Si respondes correctamente, aseguras tu posición y ganas XP; de lo contrario, tu ficha **retrocederá 3 casillas**. ¡El primer jugador que lleve al menos una de sus fichas a la casilla central 40 ganará la partida!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. SECCIÓN: LOBBY Y CREACIÓN DE SALAS */}
      {activeTab === 'lobby' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Tarjeta de Ludo Académico con opción de ingresar código */}
          <div className="lg:col-span-3 bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-start gap-4">
                <div className="p-3.5 bg-emerald-500/10 text-emerald-400 rounded-2xl shrink-0">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-950 px-2 py-0.5 rounded-full uppercase">
                    Juego Destacado
                  </span>
                  <h4 className="font-black text-lg text-slate-100 pt-1">Ludo Académico</h4>
                  <p className="text-xs text-slate-400 max-w-xl">
                    Responde retos de tus áreas favoritas y avanza en el tablero en tiempo real. 
                    ¡Puedes jugar solo contra la computadora o unirte a duelos creados por tus docentes!
                  </p>
                </div>
              </div>

              {/* Sección de Ingreso de Código */}
              <div className="bg-slate-950/80 border border-slate-850 p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shrink-0 w-full md:w-auto">
                <div className="text-center sm:text-left">
                  <h5 className="font-extrabold text-xs text-slate-200">¿Tienes un código de sala?</h5>
                  <p className="text-[10px] text-slate-500">Ingresa el código generado por tu docente.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    maxLength={4}
                    value={codigoSalaJoin}
                    onChange={(e) => setCodigoSalaJoin(e.target.value.replace(/\D/g, ''))}
                    placeholder="CÓDIGO"
                    className="bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 w-24 text-center font-mono font-black text-sm text-emerald-400 focus:outline-none focus:border-emerald-500 placeholder-slate-700"
                  />
                  <button
                    onClick={() => handleUnirseSala(codigoSalaJoin)}
                    disabled={cargandoJuego || codigoSalaJoin.length !== 4}
                    className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-800 disabled:text-slate-500 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1 shrink-0 font-black"
                  >
                    <span>Ingresar</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Panel de creación de sala */}
          <div className="lg:col-span-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4 h-fit">
            <h3 className="font-extrabold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-3">
              <Plus className="w-5 h-5 text-emerald-400" />
              Lanzar una Nueva Partida
            </h3>
            
            <form onSubmit={handleCrearSala} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Grado del Reto</label>
                <select
                  value={nuevoGrado}
                  onChange={(e) => setNuevoGrado(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="1">1° de Secundaria</option>
                  <option value="2">2° de Secundaria</option>
                  <option value="3">3° de Secundaria</option>
                  <option value="4">4° de Secundaria</option>
                  <option value="5">5° de Secundaria</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Área Curricular</label>
                <select
                  value={nuevoArea}
                  onChange={(e) => setNuevoArea(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {areasCurriculares.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                  <span>Cuestionario Especial (Retos Docente)</span>
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-bold">Opcional</span>
                </label>
                <select
                  value={idCuestionarioSeleccionado}
                  onChange={(e) => setIdCuestionarioSeleccionado(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  <option value="">-- Usar Banco General (Predeterminado) --</option>
                  {cuestionariosCurso.map(c => (
                    <option key={c.idCuestionario} value={c.idCuestionario}>
                      [{c.cursoNombre}] {c.titulo}
                    </option>
                  ))}
                </select>
              </div>

              {/* Botón Multijugador */}
              <button
                type="submit"
                disabled={creandoSala}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Users className="w-4 h-4" />
                <span>Crear Sala Multijugador</span>
              </button>

              {/* Botón Unijugador */}
              <button
                type="button"
                onClick={() => {
                  reproducirSonido('click');
                  iniciarPartidaUnijugadorDirecta(nuevoArea, idCuestionarioSeleccionado);
                }}
                disabled={cargandoJuego}
                className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-200 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Entrenar Solo (vs Computadora)</span>
              </button>
            </form>
          </div>

          {/* Listado de salas activas */}
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
            {/* Listado de salas de espera */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                <Users className="w-4.5 h-4.5 text-indigo-400" />
                Salas Multijugador Esperando Jugadores
              </h3>

              {loadingSalas ? (
                <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
              ) : salasEspera.length === 0 ? (
                <div className="bg-slate-950/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-550">
                  <Gamepad2 className="w-10 h-10 mb-3 text-slate-700" />
                  <p className="text-xs font-semibold">No hay salas multijugador abiertas en este momento.</p>
                  <p className="text-[10px] text-slate-650 mt-1">¡Crea tu propia sala y diles a tus amigos en el aula que ingresen!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {salasEspera.map(s => (
                    <div 
                      key={s.idSala}
                      className="bg-slate-950/40 border border-slate-800 rounded-3xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-950 px-2 py-0.5 rounded-full uppercase">
                            Código: {s.codigoSala}
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">{s.grado}° Sec</span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-200 pt-1">{s.area}</h4>
                        <p className="text-[11px] text-slate-500">
                          Creador: {s.creadorNombre} • Cuestionario: {s.cuestionarioTitulo}
                        </p>
                      </div>

                      <button
                        onClick={() => handleUnirseSala(s.codigoSala)}
                        className="w-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1 active:scale-95"
                      >
                        <span>Unirse a la partida</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. SECCIÓN: AREA DE JUEGO ACTIVA */}
      {activeTab === 'juego' && salaActiva && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
          
          {/* LADO IZQUIERDO: DETALLES DE SALA, CHAT Y BOTONES (4 COLUMNAS) */}
          <div className="lg:col-span-4 space-y-6 flex flex-col">
            
            {/* Info de Sala */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-3.5">
              <div className="flex justify-between items-start border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-black text-slate-200 text-sm uppercase">{salaActiva.area}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Modo: Ludo Académico • {salaActiva.grado}° Sec
                  </p>
                </div>
                <button
                  onClick={abandonarPartida}
                  className="p-2 bg-rose-500/10 hover:bg-rose-500 text-rose-455 hover:text-slate-950 rounded-xl cursor-pointer transition-all active:scale-95"
                  title="Abandonar partida"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900/60">
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Código Sala</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{salaActiva.codigoSala}</span>
                </div>
                <div className="bg-slate-950/50 p-3 rounded-2xl border border-slate-900/60">
                  <span className="text-[9px] text-slate-500 uppercase block font-semibold">Tu Ficha</span>
                  <span className={`text-xs font-black block mt-1 ${
                    miColor === 'ROJO' ? 'text-rose-400' :
                    miColor === 'VERDE' ? 'text-emerald-400' :
                    miColor === 'AMARILLO' ? 'text-amber-400' : 'text-indigo-400'
                  }`}>
                    ⬤ {miColor}
                  </span>
                </div>
              </div>

              {/* Botón de iniciar (Lobby de espera) */}
              {salaActiva.estado === 'ESPERANDO' && (
                <div className="pt-2">
                  {(salaActiva.creadorId || salaActiva.creador?.idUsuario) === currentUser.idUsuario ? (
                    <button
                      onClick={iniciarPartidaLobby}
                      disabled={jugadoresSala.length < (uniJugador ? 1 : 2)}
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/10"
                    >
                      <Play className="w-4 h-4" />
                      <span>Iniciar Partida de Reto</span>
                    </button>
                  ) : (
                    <div className="bg-slate-950 border border-slate-900 p-3 rounded-2xl text-center text-xs text-slate-500 font-semibold animate-pulse">
                      Esperando que el creador inicie la partida...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Listado de Jugadores / Marcador de Turnos */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h4 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider">
                Marcador y Turnos
              </h4>
              
              <div className="space-y-2.5">
                {jugadoresSala.map((jg) => {
                  const esSuTurno = salaActiva.estado === 'EN_PROGRESO' && salaActiva.turnoJugadorId === jg.idUsuario;
                  const tokenPos = parsePosiciones(jg.posicionesTokens);
                  return (
                    <div 
                      key={jg.idUsuario}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        esSuTurno 
                          ? 'border-emerald-500 bg-emerald-500/5 shadow-md shadow-emerald-500/5' 
                          : 'border-slate-850 bg-slate-950/20'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`text-base leading-none ${
                          jg.color === 'ROJO' ? 'text-rose-500' :
                          jg.color === 'VERDE' ? 'text-emerald-500' :
                          jg.color === 'AMARILLO' ? 'text-amber-500' : 'text-indigo-500'
                        }`}>
                          ⬤
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-200 truncate">{jg.nombres} {jg.apellidos}</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">Fichas: [{tokenPos.join(', ')}]</p>
                        </div>
                      </div>

                      {esSuTurno && (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">
                          Su Turno
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chat de Sala (Tiempo Real) */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 flex-1 flex flex-col justify-between min-h-[200px]">
              <h4 className="font-extrabold text-slate-200 text-xs uppercase tracking-wider border-b border-slate-850 pb-2.5 mb-2.5">
                Chat en el Aula
              </h4>
              
              {/* Contenedor de mensajes */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[180px] no-scrollbar text-xs text-slate-350">
                {chatMensajes.length === 0 ? (
                  <p className="text-[10px] text-slate-650 italic text-center py-8">No hay mensajes. Saluda a tus oponentes.</p>
                ) : (
                  chatMensajes.map((msg, index) => {
                    const sender = jugadoresSala.find(j => j.idUsuario === msg.senderId);
                    const name = sender ? sender.nombres : "Oponente";
                    return (
                      <div key={index} className="space-y-0.5">
                        <span className="font-black text-[10px] text-slate-400 block">{name}:</span>
                        <p className="bg-slate-950/40 border border-slate-900 p-2 rounded-xl text-slate-200 leading-snug">{msg.text}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input de chat */}
              <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-3 border-t border-slate-850 mt-3">
                <input
                  type="text"
                  value={chatTexto}
                  onChange={(e) => setChatTexto(e.target.value)}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="p-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl cursor-pointer active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>

          {/* LADO DERECHO: SVG BOARD Y PANEL OPERATIVO (8 COLUMNAS) */}
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-6">
            
            {/* TABLERO SVG DE LUDO (6 COLUMNAS EQUIVALENTES) */}
            <div className="flex-1 bg-slate-900/30 border border-slate-850 p-4 rounded-3xl flex items-center justify-center relative overflow-hidden">
              <svg 
                viewBox="0 0 450 450" 
                className="w-full max-w-[400px] aspect-square rounded-2xl shadow-2xl relative"
                style={{ backgroundColor: '#020617' }} // bg-slate-950
              >
                {/* 1. Dibujar bases de colores de fondo */}
                {/* Base Roja (Top-Left) */}
                <rect x="0" y="0" width="180" height="180" fill="#f43f5e" fillOpacity="0.15" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3" />
                <rect x="30" y="30" width="120" height="120" fill="#f43f5e" fillOpacity="0.25" rx="15" />
                
                {/* Base Verde (Top-Right) */}
                <rect x="270" y="0" width="180" height="180" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeWidth="2" strokeDasharray="3" />
                <rect x="300" y="30" width="120" height="120" fill="#10b981" fillOpacity="0.25" rx="15" />
                
                {/* Base Amarilla (Bottom-Right) */}
                <rect x="270" y="270" width="180" height="180" fill="#f59e0b" fillOpacity="0.15" stroke="#f59e0b" strokeWidth="2" strokeDasharray="3" />
                <rect x="300" y="300" width="120" height="120" fill="#f59e0b" fillOpacity="0.25" rx="15" />
                
                {/* Base Azul (Bottom-Left) */}
                <rect x="0" y="270" width="180" height="180" fill="#6366f1" fillOpacity="0.15" stroke="#6366f1" strokeWidth="2" strokeDasharray="3" />
                <rect x="30" y="300" width="120" height="120" fill="#6366f1" fillOpacity="0.25" rx="15" />

                {/* 2. Dibujar las casillas de la pista */}
                {coordenadasPista.map((c, index) => {
                  const numeroCasilla = index + 1;
                  // Casillas de reto son múltiplos de 3 (3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36)
                  const esCasillaReto = numeroCasilla % 3 === 0;
                  
                  return (
                    <g key={index}>
                      <rect 
                        x={c.x * 30} 
                        y={c.y * 30} 
                        width="30" 
                        height="30" 
                        fill={esCasillaReto ? '#312e81' : '#0f172a'} // Violeta oscuro para reto, pizarra para normal
                        stroke="#1e293b" 
                        strokeWidth="1.5"
                      />
                      {esCasillaReto ? (
                        <text 
                          x={c.x * 30 + 15} 
                          y={c.y * 30 + 20} 
                          fill="#a5b4fc" 
                          fontSize="14" 
                          fontWeight="black" 
                          textAnchor="middle"
                        >
                          ?
                        </text>
                      ) : (
                        <text 
                          x={c.x * 30 + 15} 
                          y={c.y * 30 + 18} 
                          fill="#334155" 
                          fontSize="8" 
                          fontWeight="bold" 
                          textAnchor="middle"
                        >
                          {numeroCasilla}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* 3. Dibujar centro / Meta final */}
                <rect x="180" y="180" width="90" height="90" fill="#1e293b" stroke="#334155" strokeWidth="2" />
                {/* Triángulos de meta */}
                <polygon points="180,180 225,225 180,270" fill="#f43f5e" fillOpacity="0.4" />
                <polygon points="180,180 225,225 270,180" fill="#10b981" fillOpacity="0.4" />
                <polygon points="270,180 225,225 270,270" fill="#f59e0b" fillOpacity="0.4" />
                <polygon points="180,270 225,225 270,270" fill="#6366f1" fillOpacity="0.4" />
                <circle cx="225" cy="225" r="15" fill="#020617" stroke="#334155" strokeWidth="1.5" />

                {/* 4. Dibujar fichas de los jugadores en sus posiciones correspondientes */}
                {jugadoresSala.map((jg) => {
                  const posiciones = parsePosiciones(jg.posicionesTokens);
                  return posiciones.map((pos, tIdx) => {
                    let coord = { x: 0, y: 0 };
                    
                    if (pos === 0) {
                      // Ficha en base
                      coord = coordenadasBases[jg.color][tIdx];
                    } else if (pos >= 40) {
                      // Ficha en meta
                      coord = coordenadasMeta[jg.color];
                    } else {
                      // Ficha en pista
                      coord = coordenadasPista[pos - 1];
                    }

                    // Calcular pixel exacto en base a coordenadas de celda (celda = 30px)
                    // Para evitar que las fichas se superpongan si están en la misma casilla:
                    // agregamos un pequeño desplazamiento (offset) basado en el color / índice del jugador
                    let offset = { x: 0, y: 0 };
                    if (pos > 0 && pos < 40) {
                      if (jg.color === 'ROJO') offset = { x: -4, y: -4 };
                      if (jg.color === 'VERDE') offset = { x: 4, y: -4 };
                      if (jg.color === 'AMARILLO') offset = { x: 4, y: 4 };
                      if (jg.color === 'AZUL') offset = { x: -4, y: 4 };
                    } else if (pos === 0) {
                      // En base no hay conflicto, cada ficha tiene su lugar
                      offset = { x: 0, y: 0 };
                    } else {
                      // En meta, dispersión pequeña
                      if (jg.color === 'ROJO') offset = { x: -6, y: 0 };
                      if (jg.color === 'VERDE') offset = { x: 0, y: -6 };
                      if (jg.color === 'AMARILLO') offset = { x: 6, y: 0 };
                      if (jg.color === 'AZUL') offset = { x: 0, y: 6 };
                    }

                    const cx = coord.x * 30 + 15 + offset.x;
                    const cy = coord.y * 30 + 15 + offset.y;
                    
                    const esMiFicha = jg.idUsuario === currentUser.idUsuario;
                    const suTurno = salaActiva.estado === 'EN_PROGRESO' && salaActiva.turnoJugadorId === jg.idUsuario;

                    return (
                      <g 
                        key={`${jg.idUsuario}-${tIdx}`} 
                        className={`cursor-pointer transition-all duration-300 ${
                          esMiFicha && suTurno ? 'animate-bounce' : ''
                        }`}
                        onClick={() => esMiFicha && suTurno && moverFichaJuego(tIdx)}
                      >
                        <circle 
                          cx={cx} 
                          cy={cy} 
                          r="9" 
                          className={getFichaColorClass(jg.color)}
                          strokeWidth="2.5"
                        />
                        {/* Pequeño punto interior */}
                        <circle cx={cx} cy={cy} r="3" fill="#ffffff" opacity="0.8" />
                      </g>
                    );
                  });
                })}
              </svg>
            </div>

            {/* PANEL DERECHO: DADO O PREGUNTA DE RETO (4 COLUMNAS) */}
            <div className="w-full md:w-64 space-y-4 shrink-0 flex flex-col justify-center">
              {/* Dado Animado */}
              {salaActiva.estado === 'EN_PROGRESO' && !preguntaActiva && (
                <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 text-center space-y-4">
                  <h4 className="font-extrabold text-slate-350 text-[10px] uppercase tracking-wider">
                    {miColor === 'ESPECTADOR'
                      ? "Espectando Partida"
                      : esMiTurno
                        ? "¡Tu Turno de Lanzar!"
                        : "Turno del Oponente"
                    }
                  </h4>

                  {/* Renderizar Dado Visual */}
                  <div className="flex justify-center py-4">
                    <button
                      onClick={lanzarDadoJuego}
                      disabled={miColor === 'ESPECTADOR' || !esMiTurno || dadoLanzando}
                      className={`w-20 h-20 bg-slate-950 border-2 rounded-2xl flex items-center justify-center text-4xl font-black transition-all ${
                        miColor !== 'ESPECTADOR' && esMiTurno 
                          ? 'border-emerald-500 text-emerald-400 hover:bg-slate-900 shadow-lg shadow-emerald-500/5 animate-pulse cursor-pointer' 
                          : 'border-slate-800 text-slate-600'
                      }`}
                    >
                      {dadoValor !== null ? dadoValor : "?"}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {miColor === 'ESPECTADOR'
                      ? `Observando el duelo de aula. Turno del jugador: ${jugadoresSala.find(j => j.idUsuario === salaActiva.turnoJugadorId)?.nombres || 'Cargando...'}`
                      : esMiTurno 
                        ? "Presiona el dado para girarlo. Necesitas 1 o 6 para sacar una ficha de tu base."
                        : "Espera que el jugador activo lance el dado y mueva."
                    }
                  </p>
                </div>
              )}

              {/* Panel de Reto Activo (Modal o Bloque lateral) */}
              {preguntaActiva && (
                <div className="bg-slate-900 border-2 border-indigo-500/80 rounded-3xl p-5 space-y-4 animate-fadeIn shadow-xl shadow-indigo-500/5 relative">
                  
                  {/* Cronómetro superior */}
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
                    <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-900/60 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{cronometro}s</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">{preguntaActiva.area}</span>
                  </div>

                  {/* Enunciado */}
                  <p className="text-xs font-bold text-slate-100 leading-relaxed pt-1">
                    {preguntaActiva.enunciado}
                  </p>

                  {/* Opciones */}
                  <div className="space-y-2">
                    {[
                      { id: 'A', text: preguntaActiva.opcionA },
                      { id: 'B', text: preguntaActiva.opcionB },
                      { id: 'C', text: preguntaActiva.opcionC },
                      { id: 'D', text: preguntaActiva.opcionD }
                    ].map((op) => {
                      const esSeleccionado = respondidoOp === op.id;
                      const esCorrecto = resultadoReto && resultadoReto.respuestaCorrecta === op.id;
                      const esFallo = resultadoReto && !resultadoReto.correcto && esSeleccionado;

                      let btnStyle = 'border-slate-800 bg-slate-950/50 hover:bg-slate-900 text-slate-300';
                      if (esSeleccionado) btnStyle = 'border-indigo-500 bg-indigo-500/10 text-indigo-400';
                      if (resultadoReto) {
                        if (esCorrecto) btnStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold';
                        else if (esFallo) btnStyle = 'border-rose-500 bg-rose-500/10 text-rose-400 line-through';
                        else btnStyle = 'border-slate-900 bg-slate-950/20 text-slate-600 opacity-60';
                      }

                      return (
                        <button
                          key={op.id}
                          disabled={miColor === 'ESPECTADOR' || !esMiTurno || resultadoReto !== null}
                          onClick={() => enviarRespuesta(op.id, preguntaActiva.idPregunta)}
                          className={`w-full text-left border px-3.5 py-2.5 rounded-xl text-[11px] transition-all leading-snug flex gap-2 ${
                            miColor !== 'ESPECTADOR' && esMiTurno && resultadoReto === null ? 'cursor-pointer' : ''
                          } ${btnStyle}`}
                        >
                          <span className="font-extrabold uppercase shrink-0">{op.id}.</span>
                          <span>{op.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Mensaje de Resultado del Reto */}
                  {resultadoReto && (
                    <div className={`p-2.5 rounded-xl text-[11px] font-bold text-center border animate-pulse ${
                      resultadoReto.correcto 
                        ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' 
                        : 'bg-rose-950/30 text-rose-400 border-rose-900/50'
                    }`}>
                      {resultadoReto.correcto 
                        ? "¡Respuesta Correcta! +15 XP" 
                        : `Incorrecto. La respuesta era ${resultadoReto.respuestaCorrecta}. Retrocediendo 3 casillas.`
                      }
                    </div>
                  )}

                  {miColor === 'ESPECTADOR' && (
                    <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-xl text-[10px] text-slate-500 text-center font-semibold italic animate-pulse">
                      Espectador: Esperando que el alumno responda a la pregunta...
                    </div>
                  )}
                  {miColor !== 'ESPECTADOR' && !esMiTurno && (
                    <div className="bg-slate-950/60 border border-slate-900 p-2.5 rounded-xl text-[10px] text-slate-550 text-center font-semibold italic animate-pulse">
                      Esperando que el oponente responda...
                    </div>
                  )}
                </div>
              )}

              {/* Botón de Sonido */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-550 pt-2">
                <button
                  onClick={() => setAudioHabilitado(!audioHabilitado)}
                  className="flex items-center gap-1.5 hover:text-slate-400 cursor-pointer"
                >
                  {audioHabilitado ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Efectos Habilitados</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                      <span>Efectos Silenciados</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

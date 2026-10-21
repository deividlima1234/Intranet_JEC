import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Download, 
  Eye,
  UploadCloud, 
  FileText, 
  Award, 
  FileSpreadsheet, 
  ChevronRight, 
  ArrowLeft, 
  Check, 
  Loader2, 
  AlertTriangle,
  FolderOpen,
  Calendar,
  Layers,
  GraduationCap,
  MessageSquare,
  Users,
  Bell,
  Send,
  Clock,
  User,
  PlusCircle,
  Trophy,
  Star,
  X,
  Gamepad2,
  Play,
  Copy,
  Shuffle,
  Mail,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Search
} from 'lucide-react';

import * as XLSX from 'xlsx';
import DocumentViewerModal from './DocumentViewerModal';
import ModalNuevaEvaluacion from './ModalNuevaEvaluacion';

export default function CursosView({ currentUser, onNavigateToJuegos, juegosHabilitados = true }) {
  const [cursos, setCursos] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Estados de vista activa
  const [selectedCurso, setSelectedCurso] = useState(null);
  const [cursoEstudiantes, setCursoEstudiantes] = useState([]);
  const [cursoMateriales, setCursoMateriales] = useState([]);
  const [cursoNotas, setCursoNotas] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('materiales'); // 'materiales' o 'notas'

  // Estados para creación de Cursos (Vista CIST/Admin)
  const [nrc, setNrc] = useState('');
  const [nombreCurso, setNombreCurso] = useState('');
  const [grado, setGrado] = useState('1');
  const [seccion, setSeccion] = useState('A');
  const [selectedDocenteId, setSelectedDocenteId] = useState('');
  const [creandoCurso, setCreandoCurso] = useState(false);
  const [filtroCatalogo, setFiltroCatalogo] = useState('');
  const [expandedDocentes, setExpandedDocentes] = useState({});

  // Estados para Subida de Materiales (Vista Docente)
  const [tituloMaterial, setTituloMaterial] = useState('');
  const [descMaterial, setDescMaterial] = useState('');
  const [archivoMaterial, setArchivoMaterial] = useState(null);
  const [visibilidadMaterial, setVisibilidadMaterial] = useState('TODOS');
  const [destinatariosMaterial, setDestinatariosMaterial] = useState([]);
  const [subiendoMaterial, setSubiendoMaterial] = useState(false);

  // Estados para Registro de Notas (Vista Docente)
  const [criterioNota, setCriterioNota] = useState('');
  const [criteriosList, setCriteriosList] = useState([]);
  const [calificacionesGrid, setCalificacionesGrid] = useState({}); // { [estudianteId]: { [criterio]: nota } }
  const [guardandoNotas, setGuardandoNotas] = useState(false);
  const [modalEvaluacionAbierto, setModalEvaluacionAbierto] = useState(false);
  const [evaluacionesList, setEvaluacionesList] = useState([]);
  const [creandoEvaluacion, setCreandoEvaluacion] = useState(false);
  const [revisandoNuevaEvaluacionId, setRevisandoNuevaEvaluacionId] = useState('');

  // Estados para Previsualizador de Documentos
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerName, setViewerName] = useState('');

  // Estados de Aula Virtual (LMS)
  const [anuncios, setAnuncios] = useState([]);
  const [nuevoAnuncioTitulo, setNuevoAnuncioTitulo] = useState('');
  const [nuevoAnuncioContenido, setNuevoAnuncioContenido] = useState('');
  const [creandoAnuncio, setCreandoAnuncio] = useState(false);
  const [anunciosLeidos, setAnunciosLeidos] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('anuncios_leidos') || '{}');
    } catch {
      return {};
    }
  });

  const [eventos, setEventos] = useState([]);
  const [nuevoEventoTitulo, setNuevoEventoTitulo] = useState('');
  const [nuevoEventoDesc, setNuevoEventoDesc] = useState('');
  const [nuevoEventoFecha, setNuevoEventoFecha] = useState('');
  const [creandoEvento, setCreandoEvento] = useState(false);

  const [debates, setDebates] = useState([]);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [debateRespuestas, setDebateRespuestas] = useState([]);
  const [nuevoDebateTitulo, setNuevoDebateTitulo] = useState('');
  const [nuevoDebateDesc, setNuevoDebateDesc] = useState('');
  const [creandoDebate, setCreandoDebate] = useState(false);
  const [nuevaRespuestaContenido, setNuevaRespuestaContenido] = useState('');
  const [creandoRespuesta, setCreandoRespuesta] = useState(false);

  const [chatContactos, setChatContactos] = useState([]);
  const [selectedContacto, setSelectedContacto] = useState(null);
  const [chatMensajes, setChatMensajes] = useState([]);
  const [nuevoMensajeContenido, setNuevoMensajeContenido] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);

  const [grupos, setGrupos] = useState([]);
  const [nuevoGrupoNombre, setNuevoGrupoNombre] = useState('');
  const [grupoIntegrantesSeleccionados, setGrupoIntegrantesSeleccionados] = useState([]);
  const [creandoGrupo, setCreandoGrupo] = useState(false);

  // Estados para Generador Inteligente de Grupos
  const [modoCreador, setModoCreador] = useState('manual'); // 'manual' | 'inteligente'
  const [smartPrefijo, setSmartPrefijo] = useState('Grupo');
  const [smartTipoDivision, setSmartTipoDivision] = useState('numGrupos'); // 'numGrupos' | 'tamGrupo'
  const [smartValorDivision, setSmartValorDivision] = useState(3);
  const [smartAlumnosSeleccionados, setSmartAlumnosSeleccionados] = useState([]);
  const [smartReglas, setSmartReglas] = useState([]);
  const [smartReglaEstudianteA, setSmartReglaEstudianteA] = useState('');
  const [smartReglaEstudianteB, setSmartReglaEstudianteB] = useState('');
  const [smartReglaTipo, setSmartReglaTipo] = useState('evitar'); // 'evitar' | 'juntos'
  const [vistaPreviaGrupos, setVistaPreviaGrupos] = useState(null);
  const [cargandoGuardadoSmart, setCargandoGuardadoSmart] = useState(false);
  const [smartMsgConflicto, setSmartMsgConflicto] = useState('');

  // Estados para Mensajería Masiva a Grupos
  const [grupoMensajeSeleccionado, setGrupoMensajeSeleccionado] = useState(null);
  const [mensajeMasivoContenido, setMensajeMasivoContenido] = useState('');
  const [enviandoMensajeMasivo, setEnviandoMensajeMasivo] = useState(false);

  const [logros, setLogros] = useState([]);
  const [selectedEstudianteLogro, setSelectedEstudianteLogro] = useState('');
  const [selectedInsignia, setSelectedInsignia] = useState('EXCELENCIA_ACADEMICA');
  const [comentarioLogro, setComentarioLogro] = useState('');
  const [creandoLogro, setCreandoLogro] = useState(false);

  // Estados de Avances de Clase
  const [avances, setAvances] = useState([]);
  const [cargandoAvances, setCargandoAvances] = useState(true);
  const [tituloAvance, setTituloAvance] = useState('');
  const [descAvance, setDescAvance] = useState('');
  const [archivoAvance, setArchivoAvance] = useState(null);
  const [idEvaluacionAvance, setIdEvaluacionAvance] = useState('');
  const [subiendoAvance, setSubiendoAvance] = useState(false);
  const [revisandoAvanceObj, setRevisandoAvanceObj] = useState(null);
  const [nuevoEstadoAvance, setNuevoEstadoAvance] = useState('REVISADO');
  const [nuevoComentarioDocente, setNuevoComentarioDocente] = useState('');
  const [guardandoRevision, setGuardandoRevision] = useState(false);
  const [revisandoNotasCriterios, setRevisandoNotasCriterios] = useState({});
  const [filtroEstudiante, setFiltroEstudiante] = useState('TODOS');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroTituloTema, setFiltroTituloTema] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [expandedAvancesGroups, setExpandedAvancesGroups] = useState({});


  // Estados para Cuestionarios y Retos
  const [cuestionarios, setCuestionarios] = useState([]);
  const [loadingCuestionarios, setLoadingCuestionarios] = useState(false);
  const [cuestionarioSeleccionado, setCuestionarioSeleccionado] = useState(null);
  const [preguntasCuestionario, setPreguntasCuestionario] = useState([]);
  const [nuevoCuestionarioTitulo, setNuevoCuestionarioTitulo] = useState('');
  const [nuevoCuestionarioDesc, setNuevoCuestionarioDesc] = useState('');
  const [guardandoCuestionario, setGuardandoCuestionario] = useState(false);

  const [nuevaPreguntaEnunciado, setNuevaPreguntaEnunciado] = useState('');
  const [nuevaPreguntaOpA, setNuevaPreguntaOpA] = useState('');
  const [nuevaPreguntaOpB, setNuevaPreguntaOpB] = useState('');
  const [nuevaPreguntaOpC, setNuevaPreguntaOpC] = useState('');
  const [nuevaPreguntaOpD, setNuevaPreguntaOpD] = useState('');
  const [nuevaPreguntaCorrecta, setNuevaPreguntaCorrecta] = useState('A');
  const [guardandoPregunta, setGuardandoPregunta] = useState(false);

  // Nuevos estados para lanzamiento de retos desde docente
  const [salaCreadaDocente, setSalaCreadaDocente] = useState(null);
  const [lanzandoSala, setLanzandoSala] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    fetchCursos();
    if (currentUser.rol === 'CIST' || currentUser.rol === 'PIP') {
      fetchDocentes();
    }
  }, [currentUser]);

  // Si cambia el curso seleccionado, cargar sus estudiantes, materiales y notas
  useEffect(() => {
    if (selectedCurso) {
      setRevisandoAvanceObj(null);
      setRevisandoNuevaEvaluacionId('');
      fetchCursoDetalles(selectedCurso.idCurso);
    }
  }, [selectedCurso]);

  const fetchCursos = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = '/api/v1/cursos';
      if (currentUser.rol === 'DOCENTE') {
        url = `/api/v1/cursos/docente/${currentUser.idUsuario}`;
      } else if (currentUser.rol === 'ESTUDIANTE') {
        url = `/api/v1/cursos/estudiante/${currentUser.idUsuario}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCursos(data);
      } else {
        setError('Error al obtener la lista de cursos del servidor.');
      }
    } catch (err) {
      setError('Error de red al conectar con el servidor local.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocentes = async () => {
    try {
      const res = await fetch('/api/v1/usuarios');
      if (res.ok) {
        const data = await res.json();
        // Filtrar usuarios con rol DOCENTE
        const docentesList = data.filter(u => u.rol === 'DOCENTE');
        setDocentes(docentesList);
        if (docentesList.length > 0) {
          setSelectedDocenteId(docentesList[0].idUsuario);
        }
      }
    } catch (err) {
      console.error('Error al cargar docentes:', err);
    }
  };

  const fetchCursoDetalles = async (idCurso) => {
    try {
      // 1. Cargar materiales
      let urlMateriales = `/api/v1/cursos/${idCurso}/materiales`;
      if (currentUser.rol === 'ESTUDIANTE') {
        urlMateriales += `?idEstudiante=${currentUser.idUsuario}`;
      }
      const resMat = await fetch(urlMateriales);
      if (resMat.ok) {
        const dataMat = await resMat.json();
        setCursoMateriales(dataMat);
      }

      // 2. Cargar notas
      const resNot = await fetch(`/api/v1/cursos/${idCurso}/notas`);
      let dataNot = [];
      if (resNot.ok) {
        dataNot = await resNot.json();
        setCursoNotas(dataNot);
      }

      // 3. Cargar estudiantes y evaluaciones
      const resEval = await fetch(`/api/v1/cursos/${idCurso}/evaluaciones`);
      let evalTitulos = [];
      if (resEval.ok) {
        const evalData = await resEval.json();
        setEvaluacionesList(evalData || []);
        evalTitulos = (evalData || []).map(ev => ev.titulo);
      } else {
        setEvaluacionesList([]);
      }

      if (currentUser.rol !== 'ESTUDIANTE') {
        const resEst = await fetch(`/api/v1/cursos/${idCurso}/estudiantes`);
        if (resEst.ok) {
          const dataEst = await resEst.json();
          setCursoEstudiantes(dataEst);

          // Construir cuadrícula de notas inicial
          const grid = {};
          const columnasExistentes = new Set(evalTitulos);
          
          dataEst.forEach(est => {
            grid[est.idUsuario] = {};
          });

          // Poblar con notas existentes
          dataNot.forEach(nota => {
            columnasExistentes.add(nota.criterio);
            if (grid[nota.idEstudiante]) {
              grid[nota.idEstudiante][nota.criterio] = nota.calificacion;
            }
          });

          setCriteriosList(Array.from(columnasExistentes));
          setCalificacionesGrid(grid);
        }
      }
    } catch (err) {
      console.error('Error al cargar detalles del curso:', err);
    }
  };

  const fetchAnuncios = async (idCurso) => {
    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}/anuncios`);
      if (res.ok) {
        const data = await res.json();
        setAnuncios(data);
        if (data.length > 0) {
          const readIds = data.map(a => a.idAnuncio);
          const currentRead = JSON.parse(localStorage.getItem('anuncios_leidos') || '{}');
          currentRead[idCurso] = readIds;
          localStorage.setItem('anuncios_leidos', JSON.stringify(currentRead));
          setAnunciosLeidos(currentRead);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchEventos = async (idCurso) => {
    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}/eventos`);
      if (res.ok) {
        const data = await res.json();
        setEventos(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDebates = async (idCurso) => {
    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}/debates`);
      if (res.ok) {
        const data = await res.json();
        setDebates(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDebateRespuestas = async (idCurso, idDebate) => {
    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}/debates/${idDebate}/respuestas`);
      if (res.ok) {
        const data = await res.json();
        setDebateRespuestas(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChatContactos = async (idCurso) => {
    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}/mensajes/contactos/${currentUser.idUsuario}`);
      if (res.ok) {
        const data = await res.json();
        setChatContactos(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchChatHistory = async (idCurso, idContacto) => {
    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}/mensajes/historial/${currentUser.idUsuario}/${idContacto}`);
      if (res.ok) {
        const data = await res.json();
        setChatMensajes(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGrupos = async (idCurso) => {
    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}/grupos`);
      if (res.ok) {
        const data = await res.json();
        setGrupos(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogros = async (idCurso) => {
    try {
      let url = `/api/v1/cursos/${idCurso}/logros`;
      if (currentUser.rol === 'ESTUDIANTE') {
        url = `/api/v1/cursos/${idCurso}/logros/estudiante/${currentUser.idUsuario}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLogros(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Cargar datos según la pestaña activa
  useEffect(() => {
    if (selectedCurso) {
      if (activeSubTab === 'anuncios') {
        fetchAnuncios(selectedCurso.idCurso);
      } else if (activeSubTab === 'calendario') {
        fetchEventos(selectedCurso.idCurso);
      } else if (activeSubTab === 'debates') {
        fetchDebates(selectedCurso.idCurso);
        setSelectedDebate(null);
      } else if (activeSubTab === 'mensajes') {
        fetchChatContactos(selectedCurso.idCurso);
        setSelectedContacto(null);
        setChatMensajes([]);
      } else if (activeSubTab === 'grupos') {
        fetchGrupos(selectedCurso.idCurso);
        setGrupoIntegrantesSeleccionados([]);
        if (cursoEstudiantes && cursoEstudiantes.length > 0) {
          setSmartAlumnosSeleccionados(cursoEstudiantes.map(est => est.idUsuario));
        } else {
          setSmartAlumnosSeleccionados([]);
        }
        setVistaPreviaGrupos(null);
        setSmartMsgConflicto('');
      } else if (activeSubTab === 'logros') {
        fetchLogros(selectedCurso.idCurso);
        if (cursoEstudiantes.length > 0 && !selectedEstudianteLogro) {
          setSelectedEstudianteLogro(cursoEstudiantes[0].idUsuario);
        }
      } else if (activeSubTab === 'avances') {
        fetchAvances(selectedCurso.idCurso);
      } else if (activeSubTab === 'retos') {
        fetchCuestionarios(selectedCurso.idCurso);
        setCuestionarioSeleccionado(null);
        setPreguntasCuestionario([]);
      }
    }
  }, [activeSubTab, selectedCurso, cursoEstudiantes]);


  // Polling para mensajes directos
  useEffect(() => {
    let interval;
    if (selectedCurso && activeSubTab === 'mensajes' && selectedContacto) {
      interval = setInterval(() => {
        fetchChatHistory(selectedCurso.idCurso, selectedContacto.idUsuario);
        fetchChatContactos(selectedCurso.idCurso);
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [selectedCurso, activeSubTab, selectedContacto]);

  // --- ADMINISTRADOR: CREAR CURSO ---
  const handleCrearCurso = async (e) => {
    e.preventDefault();
    setCreandoCurso(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const res = await fetch('/api/v1/cursos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nrc: nrc.trim(),
          nombre: nombreCurso.trim(),
          grado: parseInt(grado),
          seccion: seccion.trim(),
          idDocente: selectedDocenteId
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Curso "${data.nombre}" creado exitosamente con NRC ${data.nrc}`);
        setNrc('');
        setNombreCurso('');
        fetchCursos();
      } else {
        setError(data.message || 'Error al crear el curso.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setCreandoCurso(false);
    }
  };

  // --- CIST: GENERAR CURSOS DE PRUEBA ---
  const handleGenerarPruebas = async () => {
    if (!window.confirm("¿Seguro que deseas generar un curso de prueba para cada docente?")) return;
    try {
      const res = await fetch('/api/v1/cursos/generar-pruebas', { method: 'POST' });
      if (res.ok) {
        setSuccessMsg("Cursos de prueba generados exitosamente.");
        fetchCursos();
      } else {
        setError("Error al generar cursos de prueba.");
      }
    } catch (e) {
      setError("Error de conexión al generar pruebas.");
    }
  };

  // --- CIST: TOGGLE CURSO DE PRUEBA ---
  const handleTogglePrueba = async (idCurso) => {
    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}/toggle-prueba`, { method: 'PATCH' });
      if (res.ok) {
        fetchCursos();
      } else {
        setError("Error al cambiar el estado del curso de prueba.");
      }
    } catch (e) {
      setError("Error de conexión al togglear prueba.");
    }
  };

  // --- ADMINISTRADOR: ELIMINAR CURSO ---
  const handleEliminarCurso = async (idCurso, nombre) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el curso "${nombre}"? Se borrarán permanentemente todos sus materiales y notas del sistema.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/cursos/${idCurso}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccessMsg('Curso eliminado correctamente.');
        fetchCursos();
      } else {
        setError('No se pudo eliminar el curso.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    }
  };

  // --- DOCENTE: SUBIR MATERIAL ---
  const handleSubirMaterial = async (e) => {
    e.preventDefault();
    if (!archivoMaterial) {
      alert('Por favor seleccione un archivo.');
      return;
    }

    setSubiendoMaterial(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', archivoMaterial);
    formData.append('titulo', tituloMaterial.trim());
    formData.append('descripcion', descMaterial.trim());
    formData.append('visibilidad', visibilidadMaterial);
    destinatariosMaterial.forEach(id => formData.append('destinatariosIds', id));

    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/materiales`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setSuccessMsg('Material de clase subido exitosamente.');
        setTituloMaterial('');
        setDescMaterial('');
        setArchivoMaterial(null);
        setVisibilidadMaterial('TODOS');
        setDestinatariosMaterial([]);
        // Reset file input element visually
        e.target.reset();
        fetchCursoDetalles(selectedCurso.idCurso);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al cargar el archivo.');
      }
    } catch (err) {
      setError('Error de red al subir archivo.');
    } finally {
      setSubiendoMaterial(false);
    }
  };

  // --- DOCENTE: ELIMINAR MATERIAL ---
  const handleEliminarMaterial = async (idMaterial, titulo) => {
    if (!window.confirm(`¿Eliminar el material de clase "${titulo}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/cursos/materiales/${idMaterial}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccessMsg('Archivo eliminado.');
        fetchCursoDetalles(selectedCurso.idCurso);
      } else {
        setError('Error al eliminar archivo en el servidor.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  // --- DOCENTE: AÑADIR CRITERIO EN REJILLA ---
  const handleCrearEvaluacion = async (datos) => {
    try {
      setCreandoEvaluacion(true);
      setError(null);
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/evaluaciones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos)
      });
      
      if (!res.ok) throw new Error('Error en el servidor');
      const evalCreada = await res.json();
      setEvaluacionesList([...evaluacionesList, evalCreada]);
      
      // Actualizamos criteriosList con los títulos de las evaluaciones (para retrocompatibilidad en la vista)
      const nuevasColumnas = [...criteriosList, evalCreada.titulo];
      setCriteriosList(nuevasColumnas);
      
      // Inicializar rejilla
      const updatedGrid = { ...calificacionesGrid };
      cursoEstudiantes.forEach(est => {
        if (!updatedGrid[est.idUsuario]) updatedGrid[est.idUsuario] = {};
        updatedGrid[est.idUsuario][evalCreada.titulo] = '';
      });
      setCalificacionesGrid(updatedGrid);
      
      setModalEvaluacionAbierto(false);
      setSuccessMsg('Evaluación creada exitosamente.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      console.error(err);
      setError('Error al crear la evaluación.');
    } finally {
      setCreandoEvaluacion(false);
    }
  };


  // --- DOCENTE: EDITAR CELDA DE CALIFICACIÓN ---
  const handleNotaChange = (estudianteId, criterio, valor) => {
    const uppercaseVal = valor.toUpperCase();
    setCalificacionesGrid(prev => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        [criterio]: uppercaseVal
      }
    }));
  };

  // --- DOCENTE: GUARDAR NOTAS EN LOTE ---
  const handleGuardarNotas = async () => {
    setGuardandoNotas(true);
    setError(null);
    setSuccessMsg(null);

    const notasList = [];
    
    // Convertir cuadrícula de estados a lista de DTOs
    Object.keys(calificacionesGrid).forEach(estId => {
      Object.keys(calificacionesGrid[estId]).forEach(crit => {
        const notaVal = calificacionesGrid[estId][crit];
        if (notaVal !== undefined && notaVal.trim() !== '') {
          notasList.push({
            idEstudiante: estId,
            criterio: crit,
            calificacion: notaVal.trim()
          });
        }
      });
    });

    if (notasList.length === 0) {
      alert('No hay calificaciones ingresadas para guardar.');
      setGuardandoNotas(false);
      return;
    }

    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/notas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notasList)
      });

      if (res.ok) {
        setSuccessMsg('Registro de calificaciones guardado exitosamente.');
        fetchCursoDetalles(selectedCurso.idCurso);
      } else {
        setError('Error al guardar las calificaciones en el servidor.');
      }
    } catch (err) {
      setError('Error de conexión al guardar calificaciones.');
    } finally {
      setGuardandoNotas(false);
    }
  };

  // --- JUEGOS: RETOS Y CUESTIONARIOS ---
  const fetchCuestionarios = async (idCurso) => {
    setLoadingCuestionarios(true);
    try {
      const res = await fetch(`/api/v1/juegos/curso/${idCurso}/cuestionarios`);
      if (res.ok) {
        const data = await res.json();
        setCuestionarios(data);
      }
    } catch (err) {
      console.error("Error al cargar cuestionarios:", err);
    } finally {
      setLoadingCuestionarios(false);
    }
  };

  const fetchPreguntasCuestionario = async (idCuestionario) => {
    try {
      const res = await fetch(`/api/v1/juegos/cuestionarios/${idCuestionario}/preguntas`);
      if (res.ok) {
        const data = await res.json();
        setPreguntasCuestionario(data);
      }
    } catch (err) {
      console.error("Error al cargar preguntas:", err);
    }
  };

  const handleCrearCuestionario = async (e) => {
    e.preventDefault();
    if (!nuevoCuestionarioTitulo.trim()) return;
    setGuardandoCuestionario(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/juegos/docente/${currentUser.idUsuario}/cuestionarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nuevoCuestionarioTitulo.trim(),
          descripcion: nuevoCuestionarioDesc.trim(),
          idCurso: selectedCurso.idCurso
        })
      });
      if (res.ok) {
        setSuccessMsg('Cuestionario de retos creado con éxito.');
        setNuevoCuestionarioTitulo('');
        setNuevoCuestionarioDesc('');
        fetchCuestionarios(selectedCurso.idCurso);
      } else {
        setError('No se pudo crear el cuestionario.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setGuardandoCuestionario(false);
    }
  };

  const handleCrearPregunta = async (e) => {
    e.preventDefault();
    if (!nuevaPreguntaEnunciado.trim() || !cuestionarioSeleccionado) return;
    setGuardandoPregunta(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/juegos/cuestionarios/${cuestionarioSeleccionado.idCuestionario}/preguntas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enunciado: nuevaPreguntaEnunciado.trim(),
          opcionA: nuevaPreguntaOpA.trim(),
          opcionB: nuevaPreguntaOpB.trim(),
          opcionC: nuevaPreguntaOpC.trim(),
          opcionD: nuevaPreguntaOpD.trim(),
          respuestaCorrecta: nuevaPreguntaCorrecta,
          area: selectedCurso.nombre,
          grado: selectedCurso.grado,
          dificultad: 'MEDIO'
        })
      });
      if (res.ok) {
        setSuccessMsg('Pregunta agregada con éxito.');
        setNuevaPreguntaEnunciado('');
        setNuevaPreguntaOpA('');
        setNuevaPreguntaOpB('');
        setNuevaPreguntaOpC('');
        setNuevaPreguntaOpD('');
        setNuevaPreguntaCorrecta('A');
        fetchPreguntasCuestionario(cuestionarioSeleccionado.idCuestionario);
      } else {
        setError('No se pudo agregar la pregunta.');
      }
    } catch (err) {
      setError('Error de red al agregar pregunta.');
    } finally {
      setGuardandoPregunta(false);
    }
  };

  const handleLanzarSalaJuego = async (cuestionario) => {
    setLanzandoSala(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/api/v1/juegos/salas/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCreador: currentUser.idUsuario,
          area: selectedCurso.nombre.toUpperCase(),
          idCuestionario: cuestionario.idCuestionario,
          grado: selectedCurso.grado,
          maxJugadores: 4
        })
      });
      if (res.ok) {
        const sala = await res.json();
        setSalaCreadaDocente(sala);
        setSuccessMsg('Sala de juego creada con éxito. Código generado: ' + sala.codigoSala);
      } else {
        setError("No se pudo crear la sala de juego.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    } finally {
      setLanzandoSala(false);
    }
  };

  // --- DOCENTE: EXPORTAR REGISTRO A EXCEL ---
  const handleExportarExcel = () => {
    if (cursoEstudiantes.length === 0) return;

    // Generar las filas del Excel
    const dataRows = cursoEstudiantes.map((est, index) => {
      const row = {
        'N°': index + 1,
        'DNI': est.dni,
        'Apellidos y Nombres': `${est.apellidos}, ${est.nombres}`,
        'Grado y Sección': `${est.grado}° "${est.seccion}"`
      };

      criteriosList.forEach(crit => {
        row[crit] = calificacionesGrid[est.idUsuario]?.[crit] || '';
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    
    // Auto-ajustar ancho de columnas básico
    const maxKeys = Object.keys(dataRows[0] || {});
    worksheet['!cols'] = maxKeys.map(k => ({ wch: Math.max(k.length + 3, 12) }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Calificaciones');

    // Descargar archivo
    const cleanNombre = selectedCurso.nombre.replace(/[^a-zA-Z0-5]/g, '_');
    XLSX.writeFile(workbook, `Registro_Notas_${cleanNombre}_${selectedCurso.grado}${selectedCurso.seccion}.xlsx`);
  };

  // --- LMS HANDLERS ---
  const handleCrearAnuncio = async (e) => {
    e.preventDefault();
    setCreandoAnuncio(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/anuncios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nuevoAnuncioTitulo.trim(),
          contenido: nuevoAnuncioContenido.trim(),
          idAutor: currentUser.idUsuario
        })
      });
      if (res.ok) {
        setSuccessMsg('Anuncio publicado con éxito');
        setNuevoAnuncioTitulo('');
        setNuevoAnuncioContenido('');
        fetchAnuncios(selectedCurso.idCurso);
      } else {
        setError('No se pudo crear el anuncio.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setCreandoAnuncio(false);
    }
  };

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    setCreandoEvento(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/eventos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nuevoEventoTitulo.trim(),
          descripcion: nuevoEventoDesc.trim(),
          fechaHora: nuevoEventoFecha
        })
      });
      if (res.ok) {
        setSuccessMsg('Evento programado con éxito');
        setNuevoEventoTitulo('');
        setNuevoEventoDesc('');
        setNuevoEventoFecha('');
        fetchEventos(selectedCurso.idCurso);
      } else {
        setError('No se pudo programar el evento.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setCreandoEvento(false);
    }
  };

  const handleCrearDebate = async (e) => {
    e.preventDefault();
    setCreandoDebate(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/debates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: nuevoDebateTitulo.trim(),
          descripcion: nuevoDebateDesc.trim(),
          idAutor: currentUser.idUsuario
        })
      });
      if (res.ok) {
        setSuccessMsg('Debate abierto con éxito');
        setNuevoDebateTitulo('');
        setNuevoDebateDesc('');
        fetchDebates(selectedCurso.idCurso);
      } else {
        setError('No se pudo iniciar el debate.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setCreandoDebate(false);
    }
  };

  const handleCrearRespuesta = async (e) => {
    e.preventDefault();
    if (!nuevaRespuestaContenido.trim()) return;
    setCreandoRespuesta(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/debates/${selectedDebate.idDebate}/respuestas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: nuevaRespuestaContenido.trim(),
          idAutor: currentUser.idUsuario
        })
      });
      if (res.ok) {
        setNuevaRespuestaContenido('');
        fetchDebateRespuestas(selectedCurso.idCurso, selectedDebate.idDebate);
      } else {
        setError('No se pudo enviar la respuesta.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setCreandoRespuesta(false);
    }
  };

  const handleEnviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensajeContenido.trim()) return;
    setEnviandoMensaje(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/mensajes/enviar/${currentUser.idUsuario}/${selectedContacto.idUsuario}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: nuevoMensajeContenido.trim()
        })
      });
      if (res.ok) {
        setNuevoMensajeContenido('');
        fetchChatHistory(selectedCurso.idCurso, selectedContacto.idUsuario);
      } else {
        setError('No se pudo enviar el mensaje.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const handleCrearGrupo = async (e) => {
    e.preventDefault();
    if (!nuevoGrupoNombre.trim()) return;
    setCreandoGrupo(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/grupos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nuevoGrupoNombre.trim(),
          integrantesIds: grupoIntegrantesSeleccionados
        })
      });
      if (res.ok) {
        setSuccessMsg('Grupo de trabajo creado con éxito');
        setNuevoGrupoNombre('');
        setGrupoIntegrantesSeleccionados([]);
        fetchGrupos(selectedCurso.idCurso);
      } else {
        setError('No se pudo crear el grupo.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setCreandoGrupo(false);
    }
  };

  const handleEliminarGrupo = async (idGrupo, nombre) => {
    if (!window.confirm(`¿Está seguro de eliminar el grupo "${nombre}"?`)) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/grupos/${idGrupo}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccessMsg('Grupo eliminado con éxito');
        fetchGrupos(selectedCurso.idCurso);
      } else {
        setError('No se pudo eliminar el grupo.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  // --- FUNCIONES EXTRA: GRUPOS INTELIGENTES Y MEJORAS ---

  const handleMoverAlumnoVistaPrevia = (estudianteId, sourceIdx, targetIdx) => {
    if (!vistaPreviaGrupos) return;
    const updated = vistaPreviaGrupos.map((g, idx) => {
      if (idx === sourceIdx) {
        return {
          ...g,
          integrantes: g.integrantes.filter(i => i.idUsuario !== estudianteId)
        };
      }
      if (idx === targetIdx) {
        const student = vistaPreviaGrupos[sourceIdx].integrantes.find(i => i.idUsuario === estudianteId);
        return {
          ...g,
          integrantes: [...g.integrantes, student]
        };
      }
      return g;
    });
    setVistaPreviaGrupos(updated);
  };

  const generarGruposAleatorios = () => {
    const idsSeleccionados = smartAlumnosSeleccionados;
    if (idsSeleccionados.length === 0) {
      setSmartMsgConflicto('Debes seleccionar al menos un alumno para generar grupos.');
      return;
    }

    const estudiantesParaAgrupar = cursoEstudiantes.filter(est => idsSeleccionados.includes(est.idUsuario));

    let K = 1;
    if (smartTipoDivision === 'numGrupos') {
      K = Math.max(1, parseInt(smartValorDivision) || 1);
    } else {
      const tam = Math.max(1, parseInt(smartValorDivision) || 1);
      K = Math.max(1, Math.ceil(estudiantesParaAgrupar.length / tam));
    }

    let bestPreview = null;
    let ruleConflictMsg = '';
    let trialSuccess = false;

    for (let trial = 0; trial < 100; trial++) {
      const tempGroups = Array.from({ length: K }, (_, i) => ({
        nombre: `${smartPrefijo} ${i + 1}`,
        integrantes: []
      }));

      // Union-find para conectar afinidades ("juntos")
      const parent = {};
      const getParent = (id) => {
        if (!parent[id]) parent[id] = id;
        if (parent[id] === id) return id;
        return parent[id] = getParent(parent[id]);
      };
      const union = (idA, idB) => {
        const rootA = getParent(idA);
        const rootB = getParent(idB);
        if (rootA !== rootB) {
          parent[rootA] = rootB;
        }
      };

      smartReglas.filter(r => r.tipo === 'juntos').forEach(r => {
        if (idsSeleccionados.includes(r.idA) && idsSeleccionados.includes(r.idB)) {
          union(r.idA, r.idB);
        }
      });

      const coalitions = {};
      estudiantesParaAgrupar.forEach(est => {
        const root = getParent(est.idUsuario);
        if (!coalitions[root]) coalitions[root] = [];
        coalitions[root].push(est);
      });

      const coalitionsList = Object.values(coalitions);
      const shuffledCoalitions = [...coalitionsList].sort(() => Math.random() - 0.5);

      let possible = true;
      for (const coalition of shuffledCoalitions) {
        const sortedGroupIndices = tempGroups
          .map((g, idx) => ({ size: g.integrantes.length, idx }))
          .sort((a, b) => a.size - b.size);

        let placed = false;
        for (const { idx } of sortedGroupIndices) {
          const group = tempGroups[idx];
          
          let hasConflict = false;
          for (const rule of smartReglas.filter(r => r.tipo === 'evitar')) {
            const coalitionHasA = coalition.some(est => est.idUsuario === rule.idA);
            const coalitionHasB = coalition.some(est => est.idUsuario === rule.idB);
            const groupHasA = group.integrantes.some(est => est.idUsuario === rule.idA);
            const groupHasB = group.integrantes.some(est => est.idUsuario === rule.idB);
            
            if ((coalitionHasA && groupHasB) || (coalitionHasB && groupHasA)) {
              hasConflict = true;
              break;
            }
          }

          if (!hasConflict) {
            group.integrantes.push(...coalition);
            placed = true;
            break;
          }
        }

        if (!placed) {
          const smallestGroupIdx = sortedGroupIndices[0].idx;
          tempGroups[smallestGroupIdx].integrantes.push(...coalition);
          possible = false;
        }
      }

      if (possible) {
        bestPreview = tempGroups;
        trialSuccess = true;
        break;
      } else {
        if (!bestPreview) {
          bestPreview = tempGroups;
        }
      }
    }

    if (!trialSuccess && smartReglas.filter(r => r.tipo === 'evitar').length > 0) {
      ruleConflictMsg = 'Advertencia: No se pudieron cumplir todas las reglas de exclusión tras varios intentos. Se generaron los grupos con algunos conflictos menores.';
    } else {
      ruleConflictMsg = '';
    }

    setSmartMsgConflicto(ruleConflictMsg);
    setVistaPreviaGrupos(bestPreview);
  };

  const handleGuardarGruposSmart = async () => {
    if (!vistaPreviaGrupos || vistaPreviaGrupos.length === 0) return;
    setCargandoGuardadoSmart(true);
    setError(null);
    setSuccessMsg(null);

    const dtos = vistaPreviaGrupos
      .filter(g => g.integrantes.length > 0)
      .map(g => ({
        nombre: g.nombre,
        integrantesIds: g.integrantes.map(i => i.idUsuario)
      }));

    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/grupos/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dtos)
      });

      if (res.ok) {
        setSuccessMsg('Grupos inteligentes creados y guardados con éxito.');
        setVistaPreviaGrupos(null);
        setModoCreador('manual');
        fetchGrupos(selectedCurso.idCurso);
      } else {
        setError('No se pudieron guardar los grupos inteligentes.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor.');
    } finally {
      setCargandoGuardadoSmart(false);
    }
  };

  const handleEliminarTodosLosGrupos = async () => {
    if (!window.confirm('¿Está seguro de eliminar TODOS los grupos de trabajo de este curso? Esta acción no se puede deshacer.')) return;
    if (!window.confirm('Confirme nuevamente que desea borrar todos los grupos de este aula.')) return;
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/grupos`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSuccessMsg('Todos los grupos fueron eliminados con éxito.');
        fetchGrupos(selectedCurso.idCurso);
      } else {
        setError('No se pudieron eliminar los grupos.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  const handleEnviarMensajeMasivo = async (e) => {
    e.preventDefault();
    if (!grupoMensajeSeleccionado || !mensajeMasivoContenido.trim()) return;
    setEnviandoMensajeMasivo(true);
    setError(null);
    setSuccessMsg(null);
    try {
      let exitos = 0;
      const promesas = grupoMensajeSeleccionado.integrantes.map(async (integrante) => {
        if (integrante.idUsuario === currentUser.idUsuario) return;
        try {
          const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/mensajes/enviar/${currentUser.idUsuario}/${integrante.idUsuario}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contenido: mensajeMasivoContenido.trim()
            })
          });
          if (res.ok) exitos++;
        } catch (e) {
          console.error('Error enviando mensaje a ' + integrante.idUsuario, e);
        }
      });

      await Promise.all(promesas);
      setSuccessMsg(`Mensaje enviado con éxito a ${exitos} integrantes del grupo.`);
      setGrupoMensajeSeleccionado(null);
      setMensajeMasivoContenido('');
    } catch (err) {
      setError('Ocurrió un error al enviar los mensajes.');
    } finally {
      setEnviandoMensajeMasivo(false);
    }
  };

  const handleOtorgarLogro = async (e) => {
    e.preventDefault();
    if (!selectedEstudianteLogro) {
      alert('Seleccione un estudiante.');
      return;
    }
    setCreandoLogro(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/logros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEstudiante: selectedEstudianteLogro,
          insignia: selectedInsignia,
          comentario: comentarioLogro.trim()
        })
      });
      if (res.ok) {
        setSuccessMsg('Insignia otorgada exitosamente');
        setComentarioLogro('');
        fetchLogros(selectedCurso.idCurso);
      } else {
        setError('No se pudo otorgar la insignia.');
      }
    } catch (err) {
      setError('Error de conexión.');
    } finally {
      setCreandoLogro(false);
    }
  };

  const fetchAvances = async (idCurso) => {
    setCargandoAvances(true);
    try {
      let url = `/api/v1/cursos/avances/curso/${idCurso}`;
      if (currentUser.rol === 'ESTUDIANTE') {
        url = `/api/v1/cursos/avances/curso/${idCurso}/estudiante/${currentUser.idUsuario}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAvances(data);
      }
    } catch (e) {
      console.error("Error al cargar avances:", e);
    } finally {
      setCargandoAvances(false);
    }
  };

  const handleSubirAvance = async (e) => {
    e.preventDefault();
    if (!archivoAvance) {
      alert('Por favor seleccione un archivo.');
      return;
    }

    setSubiendoAvance(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append('file', archivoAvance);
    formData.append('titulo', tituloAvance.trim());
    formData.append('descripcion', descAvance.trim());
    if (idEvaluacionAvance) {
      formData.append('idEvaluacion', idEvaluacionAvance);
    }

    try {
      const res = await fetch(`/api/v1/cursos/avances/${selectedCurso.idCurso}/estudiante/${currentUser.idUsuario}`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        setSuccessMsg('Avance de clase subido exitosamente.');
        setTituloAvance('');
        setDescAvance('');
        setArchivoAvance(null);
        setIdEvaluacionAvance('');
        e.target.reset();
        fetchAvances(selectedCurso.idCurso);
      } else {
        const data = await res.json();
        setError(data.message || 'Error al cargar el avance.');
      }
    } catch (err) {
      setError('Error de red al subir el avance.');
    } finally {
      setSubiendoAvance(false);
    }
  };

  const handleEliminarAvance = async (idAvance, titulo) => {
    if (!window.confirm(`¿Está seguro de eliminar su avance de clase "${titulo}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/cursos/avances/${idAvance}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setSuccessMsg('Avance eliminado correctamente.');
        fetchAvances(selectedCurso.idCurso);
      } else {
        setError('Error al eliminar el avance.');
      }
    } catch (err) {
      setError('Error de conexión.');
    }
  };

  const handleGuardarRevision = async (e) => {
    e.preventDefault();
    setGuardandoRevision(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`/api/v1/cursos/avances/${revisandoAvanceObj.idAvance}/revisar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstadoAvance,
          comentarioDocente: nuevoComentarioDocente,
          idEvaluacion: revisandoAvanceObj.idEvaluacion || revisandoNuevaEvaluacionId || null
        })
      });

      if (res.ok) {
        setSuccessMsg('Revisión guardada exitosamente.');
        
        // Si hay notas de evaluación, enviarlas también
        const evalToUse = revisandoAvanceObj.idEvaluacion || revisandoNuevaEvaluacionId;
        const evalObj = evalToUse
          ? evaluacionesList.find(e => e.idEvaluacion === evalToUse) 
          : null;

        if (evalObj && evalObj.criterios && evalObj.criterios.length > 0) {
          const detalles = evalObj.criterios.map(c => ({
            idCriterio: c.idCriterio,
            puntajeAsignado: parseInt(revisandoNotasCriterios[c.idCriterio]) || 0
          }));
          
          await fetch(`/api/v1/cursos/${selectedCurso.idCurso}/evaluaciones/notas`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              idEstudiante: revisandoAvanceObj.idEstudiante,
              idEvaluacion: evalToUse,
              detalles
            })
          });
        }

        setRevisandoAvanceObj(null);
        setNuevoComentarioDocente('');
        setRevisandoNotasCriterios({});
        fetchAvances(selectedCurso.idCurso);
      } else {
        setError('Error al guardar la revisión.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión al guardar revisión o notas.');
    } finally {
      setGuardandoRevision(false);
    }
  };

  // Formatear tamaño de archivos
  const formatBytes = (bytes, decimals = 2) => {

    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Renderizar badge de notas
  const renderNotaBadge = (nota) => {
    if (!nota) return '-';
    const val = nota.trim().toUpperCase();

    let style = 'bg-slate-800 text-slate-350 border border-slate-700';
    if (val === 'AD') style = 'bg-amber-950/60 text-amber-400 border border-amber-900/50';
    else if (val === 'A') style = 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50';
    else if (val === 'B') style = 'bg-blue-950/60 text-blue-400 border border-blue-900/50';
    else if (val === 'C') style = 'bg-rose-950/60 text-rose-400 border border-rose-900/50';
    else {
      // Intentar evaluar nota numérica (escala 0-20)
      const num = parseInt(val);
      if (!isNaN(num)) {
        if (num >= 17) style = 'bg-amber-950/60 text-amber-400 border border-amber-900/50';
        else if (num >= 13) style = 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/50';
        else if (num >= 11) style = 'bg-blue-950/60 text-blue-400 border border-blue-900/50';
        else style = 'bg-rose-950/60 text-rose-400 border border-rose-900/50';
      }
    }

    return (
      <span className={`inline-block px-2.5 py-0.5 rounded-full font-extrabold text-[11px] min-w-[32px] text-center tracking-wide ${style}`}>
        {val}
      </span>
    );
  };

  // --- VISTA DETALLADA DEL CURSO SELECCIONADO ---
  if (selectedCurso) {
    const esDocente = currentUser.rol === 'DOCENTE';
    const esEstudiante = currentUser.rol === 'ESTUDIANTE';

    return (
      <div className="space-y-6 animate-fadeIn">
        {/* Cabecera del Curso */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSelectedCurso(null);
                setCursoEstudiantes([]);
                setCursoMateriales([]);
                setEvaluacionesList([]);
                setCriteriosList([]);
                setSuccessMsg(null);
                setError(null);
                fetchCursos();
              }}
              className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-slate-350 hover:text-white cursor-pointer transition-all"
              title="Volver a la lista de cursos"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-slate-100 flex items-center gap-2">
                {selectedCurso.nombre}
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-900/60 px-2 py-0.5 rounded-full font-bold">
                  {selectedCurso.grado}° "{selectedCurso.seccion}"
                </span>
              </h2>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                {esDocente && `Gestión de aula para la asignatura. NRC: ${selectedCurso.nrc}`}
                {esEstudiante && `Docente: ${selectedCurso.nombreDocente} • NRC: ${selectedCurso.nrc}`}
                {!esDocente && !esEstudiante && `Docente a cargo: ${selectedCurso.nombreDocente} • NRC: ${selectedCurso.nrc}`}
              </p>
            </div>
          </div>

          {/* Menú de Subpestañas */}
          <div className="flex flex-wrap bg-slate-950/60 border border-slate-800 p-1.5 rounded-2xl gap-1 max-w-full overflow-x-auto">
            {[
              { id: 'materiales', label: 'Contenido' },
              !esDocente && { id: 'calendario', label: 'Calendario' },
              !esDocente && {
                id: 'anuncios',
                label: 'Anuncios',
                badge: (() => {
                  const readIds = anunciosLeidos[selectedCurso.idCurso] || [];
                  const unread = anuncios.filter(a => !readIds.includes(a.idAnuncio)).length;
                  return unread > 0 ? unread : 0;
                })()
              },
              !esDocente && { id: 'debates', label: 'Debates' },
              { id: 'notas', label: esEstudiante ? 'Mis Calificaciones' : 'Libro de Calificaciones' },
              {
                id: 'avances',
                label: 'Avances de Clase',
                badge: !esEstudiante ? avances.filter(a => a.estado === 'PENDIENTE').length : 0
              },
              !esDocente && {
                id: 'mensajes',
                label: 'Mensajes',
                badge: chatContactos.reduce((acc, curr) => acc + (curr.mensajesNoLeidos || 0), 0)
              },
              { id: 'grupos', label: 'Grupos' },
              { id: 'logros', label: 'Logros' },
              juegosHabilitados && { id: 'retos', label: 'Retos de Juego' }

            ].filter(Boolean).map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSubTab(tab.id);
                  setSuccessMsg(null);
                  setError(null);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeSubTab === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black leading-none ${
                    activeSubTab === tab.id 
                      ? 'bg-slate-950 text-emerald-400' 
                      : 'bg-rose-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mensajes de Feedback */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 rounded-2xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {error && (
          <div className="p-3.5 bg-rose-950/30 text-rose-450 border border-rose-900/50 rounded-2xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SUBPESTAÑA: MATERIALES DE CLASE */}
        {activeSubTab === 'materiales' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario de Subida (Solo Docentes) */}
            {esDocente && (
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                  <UploadCloud className="w-4.5 h-4.5 text-emerald-400" />
                  Subir Recurso
                </h3>
                <form onSubmit={handleSubirMaterial} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Título del Material</label>
                    <input
                      type="text"
                      required
                      value={tituloMaterial}
                      onChange={(e) => setTituloMaterial(e.target.value)}
                      placeholder="Ej: Guía de Álgebra - Fracciones"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción (Opcional)</label>
                    <textarea
                      value={descMaterial}
                      onChange={(e) => setDescMaterial(e.target.value)}
                      placeholder="Resumen del material o instrucciones de lectura..."
                      rows={3}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Seleccionar Archivo (Máx. 50MB)</label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setArchivoMaterial(e.target.files[0])}
                      className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-950 file:text-slate-300 hover:file:bg-slate-850 file:cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">¿A quién va dirigido?</label>
                    <select
                      value={visibilidadMaterial}
                      onChange={(e) => {
                        setVisibilidadMaterial(e.target.value);
                        if (e.target.value === 'TODOS') setDestinatariosMaterial([]);
                      }}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="TODOS">Para todos los estudiantes</option>
                      <option value="SELECCIONADOS">Solo a alumnos específicos (Reforzamiento)</option>
                    </select>
                  </div>

                  {visibilidadMaterial === 'SELECCIONADOS' && (
                    <div className="space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-950/30 max-h-40 overflow-y-auto">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Seleccione los estudiantes</label>
                      {cursoEstudiantes.length === 0 ? (
                        <p className="text-xs text-slate-500 italic">No hay estudiantes matriculados</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {cursoEstudiantes.map(est => (
                            <label key={est.idUsuario} className="flex items-center gap-2 cursor-pointer group">
                              <input 
                                type="checkbox"
                                checked={destinatariosMaterial.includes(est.idUsuario)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setDestinatariosMaterial(prev => [...prev, est.idUsuario]);
                                  } else {
                                    setDestinatariosMaterial(prev => prev.filter(id => id !== est.idUsuario));
                                  }
                                }}
                                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900"
                              />
                              <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">
                                {est.apellidos}, {est.nombres}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={subiendoMaterial}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-4"
                  >
                    {subiendoMaterial ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Subiendo archivo...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Cargar material</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Listado de Materiales */}
            <div className={`${esDocente ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                <FolderOpen className="w-4.5 h-4.5 text-indigo-400" />
                Materiales disponibles
              </h3>

              {cursoMateriales.length === 0 ? (
                <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                  <FileText className="w-10 h-10 mb-3 text-slate-600 animate-pulse" />
                  <p className="text-xs font-semibold">No se han subido materiales para esta clase todavía.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cursoMateriales.map((mat) => (
                    <div 
                      key={mat.idMaterial} 
                      className="bg-slate-900/40 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 flex gap-3.5 items-start transition-all"
                    >
                      <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-bold text-slate-200 truncate" title={mat.titulo}>{mat.titulo}</h4>
                        {mat.descripcion && (
                          <p className="text-xs text-slate-500 line-clamp-2">{mat.descripcion}</p>
                        )}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-slate-500 font-semibold pt-1">
                          <span className="truncate max-w-[120px] font-mono">{mat.nombreArchivo}</span>
                          <span>•</span>
                          <span>{formatBytes(mat.tamanoArchivo)}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(mat.fechaSubida).toLocaleDateString()}
                          </span>
                          {esDocente && (
                            <>
                              <span>•</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${mat.visibilidad === 'SELECCIONADOS' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {mat.visibilidad === 'SELECCIONADOS' ? `Reforzamiento (${mat.destinatariosIds?.length || 0})` : 'Para Todos'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-center">
                        <button
                          onClick={() => {
                            setViewerUrl(`/api/v1/cursos/materiales/${mat.idMaterial}/descargar`);
                            setViewerName(mat.nombreArchivo);
                            setViewerOpen(true);
                          }}
                          className="p-2 bg-slate-950 hover:bg-slate-850 text-indigo-400 rounded-xl border border-slate-800 cursor-pointer transition-all hover:scale-105"
                          title="Visualizar archivo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`/api/v1/cursos/materiales/${mat.idMaterial}/descargar`}
                          className="p-2 bg-slate-950 hover:bg-slate-850 text-emerald-450 rounded-xl border border-slate-800 cursor-pointer transition-all hover:scale-105"
                          title="Descargar archivo"
                          download
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        {esDocente && (
                          <button
                            onClick={() => handleEliminarMaterial(mat.idMaterial, mat.titulo)}
                            className="p-2 bg-slate-950 hover:bg-rose-955 text-rose-500 hover:text-slate-100 rounded-xl border border-slate-800 cursor-pointer transition-all"
                            title="Eliminar material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBPESTAÑA: REGISTRO/VERIFICACION DE NOTAS */}
        {activeSubTab === 'notas' && (
          <div className="space-y-5">
            {/* VISTA DEL ESTUDIANTE: SUS PROPIAS NOTAS */}
            {esEstudiante ? (
              <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden max-w-2xl">
                <div className="bg-slate-900/60 p-4 border-b border-slate-800 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Historial de Calificaciones</h3>
                </div>
                
                {cursoNotas.filter(n => n.idEstudiante === currentUser.idUsuario).length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No se han registrado calificaciones para tu usuario en esta materia.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-850/60 text-xs">
                    {cursoNotas
                      .filter(n => n.idEstudiante === currentUser.idUsuario)
                      .map((nota) => (
                        <div key={nota.idNota} className="flex justify-between items-center p-4 hover:bg-slate-900/30 transition-all">
                          <div className="space-y-1">
                            <span className="font-bold text-slate-200 block">{nota.criterio}</span>
                            <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              Registrado el {new Date(nota.fechaRegistro).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            {renderNotaBadge(nota.calificacion)}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ) : (
              /* VISTA DEL DOCENTE/CIST: REGISTRO DE NOTAS INTERACTIVO ESTILO EXCEL */
              <div className="space-y-4">
                
                {/* Controles de Notas */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/30 border border-slate-800 p-4 rounded-3xl">
                  {/* Formulario Añadir Columna/Criterio */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModalEvaluacionAbierto(true)}
                      className="bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold p-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Añadir Evaluación</span>
                    </button>
                  </div>

                  {/* Acciones principales */}
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={handleExportarExcel}
                      disabled={cursoEstudiantes.length === 0}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-450" />
                      <span>Exportar Excel</span>
                    </button>

                    <button
                      onClick={handleGuardarNotas}
                      disabled={guardandoNotas || cursoEstudiantes.length === 0}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {guardandoNotas ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Guardar Notas</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Grid Interactiva de Notas */}
                {cursoEstudiantes.length === 0 ? (
                  <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center text-slate-500 text-xs">
                    No hay estudiantes registrados en este Grado y Sección.
                  </div>
                ) : (
                  <div className="bg-slate-900/20 border border-slate-800 rounded-3xl overflow-hidden max-w-full overflow-x-auto shadow-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 font-bold">
                          <th className="p-3 w-12 text-center">N°</th>
                          <th className="p-3 min-w-[200px] sticky left-0 bg-slate-900/95 shadow-md">Estudiante</th>
                          <th className="p-3 w-28 text-center">Grado & Sec.</th>
                          
                          {/* Columnas dinámicas de criterios */}
                          {criteriosList.map((crit) => (
                            <th key={crit} className="p-3 w-32 text-center border-l border-slate-800 group relative">
                              <span className="block truncate max-w-[120px] mx-auto" title={crit}>{crit}</span>
                              <button 
                                onClick={() => {
                                  if (window.confirm(`¿Está seguro de que desea eliminar la columna "${crit}" y todas sus notas asociadas?`)) {
                                    const evalObj = evaluacionesList.find(e => e.titulo === crit);
                                    if (evalObj) {
                                      fetch(`/api/v1/cursos/${selectedCurso.idCurso}/evaluaciones/${evalObj.idEvaluacion}`, {
                                        method: 'DELETE'
                                      }).then(res => {
                                        if (res.ok) {
                                          fetchCursoDetalles(selectedCurso.idCurso);
                                        } else {
                                          alert('Error al eliminar la columna.');
                                        }
                                      }).catch(() => alert('Error de conexión al eliminar.'));
                                    }
                                  }
                                }}
                                className="hidden group-hover:block absolute top-1 right-1 text-rose-500 hover:text-rose-400 p-0.5 cursor-pointer bg-slate-950/80 rounded"
                                title="Eliminar criterio"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </th>
                          ))}

                          {criteriosList.length === 0 && (
                            <th className="p-3 text-slate-500 font-normal italic text-center">Use el campo superior para crear evaluaciones</th>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60 font-semibold text-slate-300">
                        {cursoEstudiantes.map((est, idx) => (
                          <tr key={est.idUsuario} className="hover:bg-slate-900/40 transition-all">
                            <td className="p-3 text-center text-slate-500 font-bold">{idx + 1}</td>
                            <td className="p-3 sticky left-0 bg-slate-950/35 backdrop-blur-md shadow-md text-slate-200">
                              <div>{est.apellidos}, {est.nombres}</div>
                              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{est.dni}</div>
                            </td>
                            <td className="p-3 text-center text-slate-400">
                              {est.grado}° "{est.seccion}"
                            </td>

                            {/* Celdas editables para cada evaluación */}
                            {criteriosList.map((crit) => (
                              <td key={crit} className="p-2 border-l border-slate-800 text-center">
                                <input
                                  type="text"
                                  maxLength={3}
                                  value={calificacionesGrid[est.idUsuario]?.[crit] || ''}
                                  onChange={(e) => handleNotaChange(est.idUsuario, crit, e.target.value)}
                                  placeholder="-"
                                  className="w-16 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-lg py-1 px-1.5 text-center text-xs text-slate-100 font-extrabold focus:outline-none focus:border-emerald-500 transition-all uppercase"
                                  title="Permite: AD, A, B, C o escalas numéricas (ej. 15)"
                                />
                              </td>
                            ))}

                            {criteriosList.length === 0 && (
                              <td className="p-3 text-center text-slate-600 italic">Sin columnas de notas</td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUBPESTAÑA: AVANCES DE CLASE (EVIDENCIAS) */}
        {activeSubTab === 'avances' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* VISTA DEL ESTUDIANTE: FORMULARIO DE SUBIDA */}
            {esEstudiante && (
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                  <UploadCloud className="w-4.5 h-4.5 text-emerald-400" />
                  Subir Avance de Clase
                </h3>
                <form onSubmit={handleSubirAvance} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Seleccione la Tarea / Evaluación</label>
                    <select
                      value={idEvaluacionAvance}
                      onChange={(e) => {
                        setIdEvaluacionAvance(e.target.value);
                        if (e.target.value) {
                          const ev = evaluacionesList.find(x => x.idEvaluacion === e.target.value);
                          if (ev) setTituloAvance(ev.titulo);
                        } else {
                          setTituloAvance('');
                        }
                      }}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="">-- Entrega libre (sin tarea) --</option>
                      {evaluacionesList.map(ev => {
                        const pasada = !ev.permitirEntregasTardias && ev.fechaLimite && new Date() > new Date(ev.fechaLimite);
                        return (
                          <option key={ev.idEvaluacion} value={ev.idEvaluacion} disabled={pasada}>
                            {ev.titulo} {pasada ? '(Cerrada)' : ''}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  
                  {!idEvaluacionAvance && (
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Título de la Actividad / Tema</label>
                      <input
                        type="text"
                        required
                        value={tituloAvance}
                        onChange={(e) => setTituloAvance(e.target.value)}
                        placeholder="Ej: Sesión 1: Algoritmos en PSeInt"
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Comentario / Descripción</label>
                    <textarea
                      value={descAvance}
                      onChange={(e) => setDescAvance(e.target.value)}
                      placeholder="Detalles del trabajo desarrollado o dificultades encontradas..."
                      rows={3}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Archivo de Evidencia (Máx. 50MB)</label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setArchivoAvance(e.target.files[0])}
                      className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-955 file:text-slate-300 hover:file:bg-slate-850 file:cursor-pointer"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={subiendoAvance}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-4"
                  >
                    {subiendoAvance ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Subiendo evidencia...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4" />
                        <span>Enviar Avance</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* VISTA DEL DOCENTE / ADMIN: FILTROS DE AVANCES */}
            {!esEstudiante && (
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-indigo-400" />
                  Filtrar Evidencias
                </h3>
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Por Estudiante</label>
                    <select
                      value={filtroEstudiante}
                      onChange={(e) => setFiltroEstudiante(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="TODOS">👥 Todos los estudiantes</option>
                      {cursoEstudiantes.map(est => (
                        <option key={est.idUsuario} value={est.idUsuario}>
                          {est.apellidos}, {est.nombres}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Por Estado de Revisión</label>
                    <select
                      value={filtroEstado}
                      onChange={(e) => setFiltroEstado(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="TODOS">✨ Todos los estados</option>
                      <option value="PENDIENTE">⏳ Pendiente de revisión</option>
                      <option value="REVISADO">✅ Revisados</option>
                      <option value="CORREGIR">❌ Necesita corrección</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Por Título o Tema</label>
                    <input
                      type="text"
                      value={filtroTituloTema}
                      onChange={(e) => setFiltroTituloTema(e.target.value)}
                      placeholder="Buscar palabras clave..."
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Por Fecha de Entrega</label>
                    <input
                      type="date"
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* LISTADO DE AVANCES / EVIDENCIAS */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                <FolderOpen className="w-4.5 h-4.5 text-indigo-400" />
                {esEstudiante ? 'Mis Entregas Realizadas' : 'Evidencias del Aula'}
              </h3>

              {cargandoAvances ? (
                <div className="text-center p-8 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                  Cargando evidencias...
                </div>
              ) : (
                (() => {
                  // Aplicar filtros de docente
                  const filteredAvances = avances.filter(av => {
                    let matchEstudiante = true;
                    let matchEstado = true;
                    let matchTexto = true;
                    let matchFecha = true;

                    if (!esEstudiante) {
                      matchEstudiante = filtroEstudiante === 'TODOS' || av.idEstudiante === filtroEstudiante;
                      matchEstado = filtroEstado === 'TODOS' || av.estado === filtroEstado;
                      if (filtroTituloTema.trim()) {
                        const query = filtroTituloTema.toLowerCase();
                        matchTexto = (av.titulo && av.titulo.toLowerCase().includes(query)) || 
                                     (av.descripcion && av.descripcion.toLowerCase().includes(query));
                      }
                      if (filtroFecha) {
                        // asumiendo que fechaSubida es ISO,startsWith coincidirá con YYYY-MM-DD
                        matchFecha = av.fechaSubida && av.fechaSubida.startsWith(filtroFecha);
                      }
                    }
                    return matchEstudiante && matchEstado && matchTexto && matchFecha;
                  });

                  if (filteredAvances.length === 0) {
                    return (
                      <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                        <FileText className="w-10 h-10 mb-3 text-slate-650" />
                        <p className="text-xs font-semibold">No se encontraron evidencias de clase entregadas.</p>
                      </div>
                    );
                  }

                  // Agrupar por Fecha
                  const groupedAvances = {};
                  filteredAvances.forEach(av => {
                    let groupKey = 'Sin Fecha';
                    if (av.fechaSubida) {
                      const dateObj = new Date(av.fechaSubida);
                      groupKey = dateObj.toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
                    }
                    if (!groupedAvances[groupKey]) {
                      groupedAvances[groupKey] = [];
                    }
                    groupedAvances[groupKey].push(av);
                  });

                  // Function to toggle accordion
                  const toggleGroup = (key) => {
                    setExpandedAvancesGroups(prev => ({ ...prev, [key]: !prev[key] }));
                  };

                  return (
                    <div className="space-y-6">
                      {Object.entries(groupedAvances).map(([fecha, entregas]) => {
                        const isExpanded = expandedAvancesGroups[fecha] === true; // Cerrado por defecto
                        return (
                        <div key={fecha} className="bg-slate-900/10 rounded-3xl border border-slate-800/50 overflow-hidden">
                          <button
                            onClick={() => toggleGroup(fecha)}
                            className="w-full p-4 flex items-center justify-between bg-slate-950/40 hover:bg-slate-900/60 transition-colors cursor-pointer text-left"
                          >
                            <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-indigo-400" />
                              Entregas del {fecha}
                              <span className="text-[10px] font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                                {entregas.length} entrega{entregas.length !== 1 ? 's' : ''}
                              </span>
                            </h4>
                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="p-4 pt-0">
                              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                                {entregas.map((av) => {
                        let statusColor = 'bg-amber-500/10 text-amber-400 border border-amber-900/50';
                        let statusText = 'Pendiente';
                        if (av.estado === 'REVISADO') {
                          statusColor = 'bg-emerald-500/10 text-emerald-400 border border-emerald-900/50';
                          statusText = 'Revisado';
                        } else if (av.estado === 'CORREGIR') {
                          statusColor = 'bg-rose-500/10 text-rose-455 border border-rose-900/50';
                          statusText = 'Por Corregir';
                        }

                        return (
                          <div 
                            key={av.idAvance} 
                            className="bg-slate-900/30 border border-slate-850 hover:border-slate-800 rounded-3xl p-5 space-y-4 transition-all"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-850/60 pb-3">
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-slate-500 font-extrabold block">
                                  {esEstudiante ? '' : `Estudiante: ${av.nombreEstudiante} • `}
                                  Entregado el: {new Date(av.fechaSubida).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <h4 className="text-sm font-bold text-slate-200">{av.titulo}</h4>
                              </div>
                              <span className={`self-start sm:self-auto inline-block px-3 py-1 rounded-full text-[10px] font-bold ${statusColor}`}>
                                {statusText}
                              </span>
                            </div>

                            {av.descripcion && (
                              <p className="text-xs text-slate-350 leading-relaxed bg-slate-950/20 border border-slate-900 p-3 rounded-xl">
                                <span className="text-[10px] font-black text-slate-500 block uppercase mb-1">Comentario del alumno:</span>
                                "{av.descripcion}"
                              </p>
                            )}

                            {/* Archivo adjunto */}
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/30 border border-slate-900/60 p-3 rounded-2xl text-xs">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-300 block truncate" title={av.nombreArchivo}>{av.nombreArchivo}</span>
                                  <span className="text-[10px] text-slate-550 font-semibold">{formatBytes(av.tamanoArchivo)}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setViewerUrl(`/api/v1/cursos/avances/${av.idAvance}/descargar`);
                                    setViewerName(av.nombreArchivo);
                                    setViewerOpen(true);
                                  }}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-indigo-400 hover:text-indigo-400 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                                  title="Visualizar evidencia"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Visualizar</span>
                                </button>
                                <a
                                  href={`/api/v1/cursos/avances/${av.idAvance}/descargar`}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-emerald-450 hover:text-emerald-400 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                                  download
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Descargar</span>
                                </a>
                              </div>
                            </div>

                            {/* Retroalimentación docente */}
                            {av.comentarioDocente && (
                              <div className="bg-indigo-950/10 border border-indigo-900/30 p-3 rounded-xl text-xs space-y-1">
                                <span className="text-[10px] font-black text-indigo-400 uppercase block">Observación del Docente:</span>
                                <p className="text-slate-300 italic">"{av.comentarioDocente}"</p>
                              </div>
                            )}

                            {/* Botones de acción */}
                            {(esDocente || (esEstudiante && av.estado === 'PENDIENTE')) && (
                              <div className="flex items-center justify-end gap-2 pt-2">
                                {esDocente && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setNuevoComentarioDocente(av.comentarioDocente || '');
                                      setRevisandoNotasCriterios({});
                                      setRevisandoAvanceObj(av);
                                      setRevisandoNuevaEvaluacionId('');
                                      setNuevoEstadoAvance(av.estadoRevision || 'REVISADO');
                                    }}
                                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-500/5"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Evaluar Evidencia</span>
                                  </button>
                                )}
                                {esEstudiante && av.estado === 'PENDIENTE' && (
                                  <button
                                    type="button"
                                    onClick={() => handleEliminarAvance(av.idAvance, av.titulo)}
                                    className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-455 hover:text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Eliminar Entrega</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>
          </div>
        )}

        {/* SUBPESTAÑA: CALENDARIO */}

        {activeSubTab === 'calendario' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Formulario (Docentes/Admin/CIST) */}
            {currentUser.rol !== 'ESTUDIANTE' && (
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                  <Calendar className="w-4.5 h-4.5 text-emerald-400" />
                  Programar Actividad
                </h3>
                <form onSubmit={handleCrearEvento} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Título de Actividad</label>
                    <input
                      type="text"
                      required
                      value={nuevoEventoTitulo}
                      onChange={(e) => setNuevoEventoTitulo(e.target.value)}
                      placeholder="Ej: Evaluación Mensual, Exposición..."
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción / Indicaciones</label>
                    <textarea
                      value={nuevoEventoDesc}
                      onChange={(e) => setNuevoEventoDesc(e.target.value)}
                      placeholder="Indique temas a estudiar o materiales a traer..."
                      rows={3}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      required
                      value={nuevoEventoFecha}
                      onChange={(e) => setNuevoEventoFecha(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creandoEvento}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-4"
                  >
                    {creandoEvento ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <PlusCircle className="w-4 h-4" />
                        <span>Agendar Actividad</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Listado de Actividades / Timeline */}
            <div className={`${currentUser.rol !== 'ESTUDIANTE' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                Cronograma de Actividades
              </h3>

              {eventos.length === 0 ? (
                <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                  <Calendar className="w-10 h-10 mb-3 text-slate-650" />
                  <p className="text-xs font-semibold">No hay actividades programadas para este curso.</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-6">
                  {eventos.map((ev) => {
                    const evDate = new Date(ev.fechaHora);
                    return (
                      <div key={ev.idEvento} className="relative group">
                        <div className="absolute -left-[31px] top-1.5 bg-slate-950 text-indigo-400 p-1 rounded-full border-2 border-slate-850 group-hover:scale-110 transition-transform">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="bg-slate-900/30 border border-slate-850 hover:border-slate-800 rounded-3xl p-5 transition-all">
                          <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 border border-indigo-900/40 px-2.5 py-1 rounded-full uppercase tracking-wider">
                            {evDate.toLocaleString('es-PE', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <h4 className="text-sm font-bold text-slate-100 mt-3">{ev.titulo}</h4>
                          {ev.descripcion && (
                            <p className="text-xs text-slate-400 mt-1.5 whitespace-pre-wrap">{ev.descripcion}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBPESTAÑA: ANUNCIOS */}
        {activeSubTab === 'anuncios' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Formulario (Docentes/Admin/CIST) */}
            {currentUser.rol !== 'ESTUDIANTE' && (
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                  <Bell className="w-4.5 h-4.5 text-emerald-400" />
                  Publicar Anuncio
                </h3>
                <form onSubmit={handleCrearAnuncio} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Título del Anuncio</label>
                    <input
                      type="text"
                      required
                      value={nuevoAnuncioTitulo}
                      onChange={(e) => setNuevoAnuncioTitulo(e.target.value)}
                      placeholder="Ej: Reprogramación de clase, Temario..."
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Cuerpo / Mensaje</label>
                    <textarea
                      required
                      value={nuevoAnuncioContenido}
                      onChange={(e) => setNuevoAnuncioContenido(e.target.value)}
                      placeholder="Escriba el comunicado detallado aquí..."
                      rows={5}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creandoAnuncio}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-4"
                  >
                    {creandoAnuncio ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Publicar Comunicado</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Listado de Anuncios */}
            <div className={`${currentUser.rol !== 'ESTUDIANTE' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                <Bell className="w-4.5 h-4.5 text-indigo-400" />
                Muro de Comunicados
              </h3>

              {anuncios.length === 0 ? (
                <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                  <Bell className="w-10 h-10 mb-3 text-slate-650" />
                  <p className="text-xs font-semibold">No hay comunicados publicados para este curso.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {anuncios.map((an) => {
                    const isUnread = !(anunciosLeidos[selectedCurso.idCurso] || []).includes(an.idAnuncio);
                    return (
                      <div key={an.idAnuncio} className={`relative bg-slate-900/30 border ${isUnread ? 'border-emerald-500/40 shadow-lg shadow-emerald-500/5' : 'border-slate-850'} rounded-3xl p-5 transition-all`}>
                        {isUnread && (
                          <span className="absolute top-4 right-4 bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">Nuevo</span>
                        )}
                        <h4 className="text-sm font-bold text-slate-100">{an.titulo}</h4>
                        <p className="text-xs text-slate-350 mt-2.5 whitespace-pre-wrap leading-relaxed">{an.contenido}</p>
                        <div className="border-t border-slate-850/80 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                          <span>Publicado por: {an.nombreAutor}</span>
                          <span>{new Date(an.fechaPublicacion).toLocaleDateString()} {new Date(an.fechaPublicacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBPESTAÑA: DEBATES */}
        {activeSubTab === 'debates' && (
          <div className="animate-fadeIn">
            {selectedDebate ? (
              /* DETALLE DE UN DEBATE SELECCIONADO Y COMENTARIOS */
              <div className="space-y-5">
                <button
                  onClick={() => {
                    setSelectedDebate(null);
                    setDebateRespuestas([]);
                  }}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 mb-2 cursor-pointer font-bold"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a foros de debates</span>
                </button>

                <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                    <span>Iniciado por: {selectedDebate.nombreAutor}</span>
                    <span>•</span>
                    <span>{new Date(selectedDebate.fechaCreacion).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-base md:text-lg font-black text-slate-100">{selectedDebate.titulo}</h3>
                  <p className="text-xs md:text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{selectedDebate.descripcion}</p>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-400" />
                    Respuestas y Aportaciones ({debateRespuestas.length})
                  </h4>

                  {debateRespuestas.length === 0 ? (
                    <div className="bg-slate-900/10 border border-slate-850 rounded-2xl p-6 text-center text-slate-555 text-xs">
                      No hay respuestas publicadas en este hilo. Sé el primero en aportar.
                    </div>
                  ) : (
                    <div className="space-y-3.5 pl-4 border-l border-slate-850">
                      {debateRespuestas.map((r) => (
                        <div key={r.idRespuesta} className="bg-slate-900/20 border border-slate-850 rounded-2xl p-4 space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-slate-550 font-bold">
                            <span>{r.nombreAutor}</span>
                            <span>{new Date(r.fechaCreacion).toLocaleDateString()} {new Date(r.fechaCreacion).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">{r.contenido}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Formulario de Aportación */}
                  <form onSubmit={handleCrearRespuesta} className="space-y-3 bg-slate-900/10 border border-slate-850 p-4 rounded-2xl">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Publicar mi aporte</label>
                    <textarea
                      required
                      value={nuevaRespuestaContenido}
                      onChange={(e) => setNuevaRespuestaContenido(e.target.value)}
                      placeholder="Escribe tu opinión, argumento o comentario aquí..."
                      rows={3}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={creandoRespuesta}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md"
                    >
                      {creandoRespuesta ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Enviar aporte</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* PANEL GENERAL DE FOROS LISTADO */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Formulario de Inicio (Solo Docentes) */}
                {currentUser.rol !== 'ESTUDIANTE' && (
                  <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                    <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      Iniciar Debate
                    </h3>
                    <form onSubmit={handleCrearDebate} className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tema de Debate / Pregunta</label>
                        <input
                          type="text"
                          required
                          value={nuevoDebateTitulo}
                          onChange={(e) => setNuevoDebateTitulo(e.target.value)}
                          placeholder="Ej: ¿Qué impacto tiene la IA en el empleo?"
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Instrucciones o Contexto</label>
                        <textarea
                          required
                          value={nuevoDebateDesc}
                          onChange={(e) => setNuevoDebateDesc(e.target.value)}
                          placeholder="Escriba las directrices del debate, preguntas detonadoras y criterios de participación..."
                          rows={4}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={creandoDebate}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-4"
                      >
                        {creandoDebate ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            <span>Abrir Foro de Debate</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Listado de debates */}
                <div className={`${currentUser.rol !== 'ESTUDIANTE' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
                  <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                    <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />
                    Foros de Discusión Activos
                  </h3>

                  {debates.length === 0 ? (
                    <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                      <MessageSquare className="w-10 h-10 mb-3 text-slate-650" />
                      <p className="text-xs font-semibold">No se han iniciado foros de debates para esta asignatura.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {debates.map((db) => (
                        <div
                          key={db.idDebate}
                          className="bg-slate-900/30 border border-slate-850 hover:border-slate-700/80 rounded-2xl p-5 flex justify-between items-center gap-4 transition-all"
                        >
                          <div className="space-y-1.5 min-w-0 flex-1">
                            <span className="text-[10px] text-slate-500 font-extrabold block">
                              Iniciado por: {db.nombreAutor} • {new Date(db.fechaCreacion).toLocaleDateString()}
                            </span>
                            <h4 className="text-sm font-bold text-slate-100 truncate">{db.titulo}</h4>
                            <p className="text-xs text-slate-455 line-clamp-1">{db.descripcion}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedDebate(db);
                              fetchDebateRespuestas(selectedCurso.idCurso, db.idDebate);
                            }}
                            className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>Ingresar</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SUBPESTAÑA: MENSAJES DIRECTOS CHAT */}
        {activeSubTab === 'mensajes' && (
          <div className="bg-slate-900/20 border border-slate-850 rounded-3xl overflow-hidden grid grid-cols-1 md:grid-cols-3 h-[500px] animate-fadeIn">
            {/* Panel de Contactos */}
            <div className="md:col-span-1 border-r border-slate-850 flex flex-col h-full bg-slate-950/25">
              <div className="p-4 border-b border-slate-850 bg-slate-950/40">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Bandeja de Entrada
                </h4>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60">
                {chatContactos.length === 0 ? (
                  <p className="text-center text-slate-600 text-xs p-6 italic">Cargando destinatarios...</p>
                ) : (
                  chatContactos.map((c) => {
                    const isSelected = selectedContacto && selectedContacto.idUsuario === c.idUsuario;
                    return (
                      <button
                        key={c.idUsuario}
                        onClick={() => {
                          setSelectedContacto(c);
                          fetchChatHistory(selectedCurso.idCurso, c.idUsuario);
                        }}
                        className={`w-full text-left p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all hover:bg-slate-900/35 ${
                          isSelected ? 'bg-slate-900/40 border-l-4 border-emerald-500' : ''
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <span className="text-xs font-bold text-slate-200 block truncate">{c.apellidos}, {c.nombres}</span>
                          <span className="text-[9px] font-black tracking-wide text-slate-500 block uppercase mt-0.5">{c.rol}</span>
                        </div>
                        {c.mensajesNoLeidos > 0 && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-rose-500 text-white leading-none">
                            {c.mensajesNoLeidos}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Panel de Conversación */}
            <div className="md:col-span-2 flex flex-col h-full bg-slate-900/10">
              {selectedContacto ? (
                <>
                  {/* Cabecera del chat */}
                  <div className="p-4 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200">{selectedContacto.apellidos}, {selectedContacto.nombres}</h4>
                      <span className="text-[9px] font-bold text-slate-550 uppercase tracking-wide">{selectedContacto.rol}</span>
                    </div>
                  </div>

                  {/* Mensajes */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {chatMensajes.length === 0 ? (
                      <p className="text-center text-slate-650 text-[11px] italic mt-10">Historial vacío. Envía un mensaje para comenzar.</p>
                    ) : (
                      chatMensajes.map((m) => {
                        const isMine = m.idEmisor === currentUser.idUsuario;
                        return (
                          <div
                            key={m.idMensaje}
                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[75%] rounded-2xl px-4 py-2 text-xs leading-relaxed space-y-1 shadow-md ${
                                isMine
                                  ? 'bg-indigo-650 text-white rounded-br-none'
                                  : 'bg-slate-850 text-slate-200 rounded-bl-none border border-slate-800'
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{m.contenido}</p>
                              <span className={`block text-[8px] font-bold text-right ${isMine ? 'text-indigo-200' : 'text-slate-500'}`}>
                                {new Date(m.fechaEnvio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Input de envío */}
                  <form onSubmit={handleEnviarMensaje} className="p-3 border-t border-slate-850 bg-slate-950/40 flex gap-2">
                    <input
                      type="text"
                      required
                      value={nuevoMensajeContenido}
                      onChange={(e) => setNuevoMensajeContenido(e.target.value)}
                      placeholder="Escribe un mensaje privado local..."
                      className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={enviandoMensaje}
                      className="p-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                    >
                      {enviandoMensaje ? (
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      ) : (
                        <Send className="w-4.5 h-4.5" />
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-555">
                  <MessageSquare className="w-12 h-12 mb-3 text-slate-700 animate-pulse" />
                  <p className="text-xs font-semibold">Seleccione un participante del curso en el panel izquierdo para chatear de forma offline.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBPESTAÑA: GRUPOS DE TRABAJO */}
        {activeSubTab === 'grupos' && (
          <div className="space-y-6 animate-fadeIn">
            {/* PANEL DE ESTADÍSTICAS Y ACCIONES RÁPIDAS (Solo Docentes) */}
            {currentUser.rol !== 'ESTUDIANTE' && (
              <div className="bg-slate-900/25 border border-slate-850 rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Grupos Registrados</span>
                    <span className="text-xl font-black text-slate-100">{grupos.length}</span>
                  </div>
                  <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Alumnos Asignados</span>
                    <span className="text-xl font-black text-indigo-400">
                      {grupos.reduce((acc, g) => acc + g.integrantes.length, 0)} / {cursoEstudiantes.length}
                    </span>
                  </div>
                  <div className="w-px h-8 bg-slate-800 hidden md:block"></div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Alumnos sin Grupo</span>
                    <span className={`text-xl font-black ${cursoEstudiantes.length - grupos.reduce((acc, g) => acc + g.integrantes.length, 0) > 0 ? 'text-amber-500' : 'text-emerald-400'}`}>
                      {Math.max(0, cursoEstudiantes.length - grupos.reduce((acc, g) => acc + g.integrantes.length, 0))}
                    </span>
                  </div>
                </div>

                {grupos.length > 0 && (
                  <button
                    onClick={handleEliminarTodosLosGrupos}
                    className="px-4 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 text-xs font-bold rounded-xl border border-rose-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 self-start md:self-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar Todos los Grupos</span>
                  </button>
                )}
              </div>
            )}

            {/* AVISO DE ESTUDIANTES SIN GRUPO */}
            {currentUser.rol !== 'ESTUDIANTE' && cursoEstudiantes.length > 0 && (() => {
              const assignedIds = new Set(grupos.flatMap(g => g.integrantes.map(i => i.idUsuario)));
              const unassigned = cursoEstudiantes.filter(est => !assignedIds.has(est.idUsuario));
              if (unassigned.length === 0) return null;
              return (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 space-y-3.5">
                  <div className="flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <h4 className="text-xs font-black uppercase tracking-wider">Estudiantes sin grupo asignado ({unassigned.length})</h4>
                  </div>
                  <p className="text-xs text-slate-350 leading-relaxed">
                    Los siguientes estudiantes no forman parte de ningún equipo. Considere asignarlos manualmente o usar el generador inteligente para volver a agruparlos:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {unassigned.map(est => (
                      <span key={est.idUsuario} className="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 text-[10px] font-bold rounded-lg uppercase">
                        {est.apellidos}, {est.nombres}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* SECCIÓN PRINCIPAL DE CREACIÓN Y LISTADO */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* PANEL DE CREACIÓN / EDICIÓN (Solo Docentes) */}
              {currentUser.rol !== 'ESTUDIANTE' && (
                <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-5 h-fit">
                  {/* PESTAÑAS DEL CREADOR */}
                  <div className="flex bg-slate-950/60 p-1 rounded-2xl border border-slate-850">
                    <button
                      type="button"
                      onClick={() => { setModoCreador('manual'); setVistaPreviaGrupos(null); }}
                      className={`flex-1 text-[10px] font-black uppercase py-2 rounded-xl transition-all ${
                        modoCreador === 'manual' 
                          ? 'bg-slate-800 text-emerald-400' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Creación Manual
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModoCreador('inteligente');
                        if (smartAlumnosSeleccionados.length === 0) {
                          setSmartAlumnosSeleccionados(cursoEstudiantes.map(est => est.idUsuario));
                        }
                      }}
                      className={`flex-1 text-[10px] font-black uppercase py-2 rounded-xl transition-all flex items-center justify-center gap-1 ${
                        modoCreador === 'inteligente' 
                          ? 'bg-slate-800 text-emerald-400' 
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generador Inteligente</span>
                    </button>
                  </div>

                  {modoCreador === 'manual' ? (
                    /* FORMULARIO MANUAL */
                    <form onSubmit={handleCrearGrupo} className="space-y-4">
                      <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                        <Users className="w-4.5 h-4.5 text-emerald-400" />
                        Crear Grupo de Trabajo
                      </h3>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre del Grupo</label>
                        <input
                          type="text"
                          required
                          value={nuevoGrupoNombre}
                          onChange={(e) => setNuevoGrupoNombre(e.target.value)}
                          placeholder="Ej: Grupo 1 - Ciencias, Equipo Alfa..."
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Seleccionar Alumnos ({grupoIntegrantesSeleccionados.length})</label>
                        {cursoEstudiantes.length === 0 ? (
                          <p className="text-[10px] text-amber-500 italic">No hay alumnos disponibles en el curso.</p>
                        ) : (
                          <div className="max-h-52 overflow-y-auto border border-slate-850 bg-slate-950/45 rounded-xl p-2.5 space-y-2 text-xs">
                            {cursoEstudiantes.map((est) => {
                              const isChecked = grupoIntegrantesSeleccionados.includes(est.idUsuario);
                              return (
                                <label key={est.idUsuario} className="flex items-center gap-2.5 cursor-pointer p-1.5 hover:bg-slate-900/30 rounded-lg text-slate-350 hover:text-white transition-all">
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => {
                                      if (isChecked) {
                                        setGrupoIntegrantesSeleccionados(grupoIntegrantesSeleccionados.filter(id => id !== est.idUsuario));
                                      } else {
                                        setGrupoIntegrantesSeleccionados([...grupoIntegrantesSeleccionados, est.idUsuario]);
                                      }
                                    }}
                                    className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500/20"
                                  />
                                  <span>{est.apellidos}, {est.nombres}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={creandoGrupo || grupoIntegrantesSeleccionados.length === 0}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        {creandoGrupo ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <PlusCircle className="w-4 h-4" />
                            <span>Crear Grupo</span>
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* FORMULARIO GENERADOR INTELIGENTE */
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                        <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                        Parámetros del Generador
                      </h3>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Prefijo de Nombre</label>
                        <input
                          type="text"
                          required
                          value={smartPrefijo}
                          onChange={(e) => setSmartPrefijo(e.target.value)}
                          placeholder="Ej: Grupo, Equipo, Mesa..."
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Dividir por</label>
                          <select
                            value={smartTipoDivision}
                            onChange={(e) => setSmartTipoDivision(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="numGrupos">Número de grupos</option>
                            <option value="tamGrupo">Alumnos por grupo</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            value={smartValorDivision}
                            onChange={(e) => setSmartValorDivision(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* SELECCIÓN DE ALUMNOS (Checkboxes rápidos) */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Alumnos a Incluir ({smartAlumnosSeleccionados.length})</label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setSmartAlumnosSeleccionados(cursoEstudiantes.map(e => e.idUsuario))}
                              className="text-[9px] font-bold text-emerald-455 hover:underline"
                            >
                              Todos
                            </button>
                            <span className="text-slate-650 text-[9px]">•</span>
                            <button
                              type="button"
                              onClick={() => setSmartAlumnosSeleccionados([])}
                              className="text-[9px] font-bold text-rose-455 hover:underline"
                            >
                              Ninguno
                            </button>
                          </div>
                        </div>
                        <div className="max-h-36 overflow-y-auto border border-slate-850 bg-slate-950/45 rounded-xl p-2 space-y-1.5 text-[11px]">
                          {cursoEstudiantes.map((est) => {
                            const isChecked = smartAlumnosSeleccionados.includes(est.idUsuario);
                            return (
                              <label key={est.idUsuario} className="flex items-center gap-2 cursor-pointer p-1 hover:bg-slate-900/30 rounded text-slate-350 hover:text-white transition-all">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => {
                                    if (isChecked) {
                                      setSmartAlumnosSeleccionados(smartAlumnosSeleccionados.filter(id => id !== est.idUsuario));
                                    } else {
                                      setSmartAlumnosSeleccionados([...smartAlumnosSeleccionados, est.idUsuario]);
                                    }
                                  }}
                                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500/20 w-3.5 h-3.5"
                                />
                                <span>{est.apellidos}, {est.nombres}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* REGLAS DE COMBINACIÓN (Exclusiones / Afinidades) */}
                      <div className="space-y-2 border-t border-slate-850 pt-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase block">Reglas de Agrupación (Opcional)</label>
                        
                        <div className="space-y-2 bg-slate-950/45 border border-slate-850 rounded-xl p-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-black text-slate-500 uppercase">Alumno A</span>
                              <select
                                value={smartReglaEstudianteA}
                                onChange={(e) => setSmartReglaEstudianteA(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-200 focus:outline-none"
                              >
                                <option value="">Seleccione...</option>
                                {cursoEstudiantes.map(e => (
                                  <option key={e.idUsuario} value={e.idUsuario} disabled={e.idUsuario === smartReglaEstudianteB}>
                                    {e.apellidos}, {e.nombres}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-black text-slate-500 uppercase">Alumno B</span>
                              <select
                                value={smartReglaEstudianteB}
                                onChange={(e) => setSmartReglaEstudianteB(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-[10px] text-slate-200 focus:outline-none"
                              >
                                <option value="">Seleccione...</option>
                                {cursoEstudiantes.map(e => (
                                  <option key={e.idUsuario} value={e.idUsuario} disabled={e.idUsuario === smartReglaEstudianteA}>
                                    {e.apellidos}, {e.nombres}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex gap-2 items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                                <input
                                  type="radio"
                                  name="tipoRegla"
                                  checked={smartReglaTipo === 'evitar'}
                                  onChange={() => setSmartReglaTipo('evitar')}
                                  className="text-emerald-500 focus:ring-emerald-500/20 bg-slate-950 border-slate-800"
                                />
                                <span>Evitar</span>
                              </label>
                              <label className="flex items-center gap-1 text-[10px] text-slate-400 cursor-pointer">
                                <input
                                  type="radio"
                                  name="tipoRegla"
                                  checked={smartReglaTipo === 'juntos'}
                                  onChange={() => setSmartReglaTipo('juntos')}
                                  className="text-emerald-500 focus:ring-emerald-500/20 bg-slate-950 border-slate-800"
                                />
                                <span>Juntos</span>
                              </label>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (!smartReglaEstudianteA || !smartReglaEstudianteB) return;
                                const rule = {
                                  id: Math.random().toString(36).substring(2),
                                  tipo: smartReglaTipo,
                                  idA: smartReglaEstudianteA,
                                  idB: smartReglaEstudianteB,
                                  nombreA: cursoEstudiantes.find(e => e.idUsuario === smartReglaEstudianteA)?.apellidos || '',
                                  nombreB: cursoEstudiantes.find(e => e.idUsuario === smartReglaEstudianteB)?.apellidos || ''
                                };
                                setSmartReglas([...smartReglas, rule]);
                                setSmartReglaEstudianteA('');
                                setSmartReglaEstudianteB('');
                              }}
                              disabled={!smartReglaEstudianteA || !smartReglaEstudianteB}
                              className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-400 text-slate-955 text-[10px] font-black rounded-lg transition-all disabled:opacity-40"
                            >
                              Agregar Regla
                            </button>
                          </div>
                        </div>

                        {/* LISTADO DE REGLAS ACTIVAS */}
                        {smartReglas.length > 0 && (
                          <div className="space-y-1 max-h-24 overflow-y-auto">
                            {smartReglas.map(r => (
                              <div key={r.id} className="flex justify-between items-center bg-slate-950/20 border border-slate-850 rounded-lg p-1.5 text-[9px] text-slate-400">
                                <div className="truncate pr-2">
                                  <span className="font-bold text-slate-300">{r.nombreA}</span>
                                  {r.tipo === 'evitar' ? ' 🚫 NO con ' : ' 🤝 JUNTO a '}
                                  <span className="font-bold text-slate-300">{r.nombreB}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setSmartReglas(smartReglas.filter(rule => rule.id !== r.id))}
                                  className="text-rose-500 hover:text-rose-400 hover:bg-slate-950/40 p-0.5 rounded transition-all"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={generarGruposAleatorios}
                        disabled={smartAlumnosSeleccionados.length === 0}
                        className="w-full bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                      >
                        <Shuffle className="w-4 h-4" />
                        <span>Generar Vista Previa</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* LISTADO DE GRUPOS O VISTA PREVIA */}
              <div className={`${currentUser.rol !== 'ESTUDIANTE' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
                
                {vistaPreviaGrupos ? (
                  /* VISTA PREVIA DEL GENERADOR SMART */
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                          <Sparkles className="w-4.5 h-4.5 text-indigo-400 animate-pulse" />
                          Vista Previa de Grupos Generados
                        </h3>
                        {smartMsgConflicto && (
                          <p className="text-[10px] text-amber-500 font-medium mt-1">{smartMsgConflicto}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setVistaPreviaGrupos(null)}
                        className="text-[10px] text-slate-400 hover:text-white font-bold"
                      >
                        Cancelar
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vistaPreviaGrupos.map((g, groupIdx) => (
                        <div key={groupIdx} className="bg-slate-900/40 border border-indigo-500/20 rounded-3xl p-5 space-y-3.5 relative">
                          <div className="flex justify-between items-center">
                            <h4 className="text-sm font-bold text-slate-100">{g.nombre}</h4>
                            <span className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">Temporal</span>
                          </div>

                          <div className="space-y-1.5">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide block">Integrantes ({g.integrantes.length})</span>
                            <div className="space-y-1.5 max-h-36 overflow-y-auto pl-1 pr-1 text-xs">
                              {g.integrantes.length === 0 ? (
                                <p className="text-[10px] text-slate-600 italic">Grupo vacío.</p>
                              ) : (
                                g.integrantes.map((mem) => (
                                  <div key={mem.idUsuario} className="text-slate-350 flex items-center justify-between gap-2 py-0.5 group">
                                    <div className="flex items-center gap-1.5 min-w-0">
                                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></div>
                                      <span className="truncate">{mem.apellidos}, {mem.nombres}</span>
                                    </div>
                                    
                                    {/* Selector para mover de grupo */}
                                    <select
                                      value={groupIdx}
                                      onChange={(e) => handleMoverAlumnoVistaPrevia(mem.idUsuario, groupIdx, parseInt(e.target.value))}
                                      className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[9px] text-slate-450 focus:outline-none cursor-pointer focus:border-indigo-500 shrink-0"
                                      title="Mover estudiante a otro grupo"
                                    >
                                      {vistaPreviaGrupos.map((destGroup, destIdx) => (
                                        <option key={destIdx} value={destIdx}>
                                          Mover a: {destGroup.nombre}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3 justify-end pt-4 border-t border-slate-850/80">
                      <button
                        onClick={generarGruposAleatorios}
                        className="px-4 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      >
                        <Shuffle className="w-4 h-4" />
                        <span>Volver a Mezclar</span>
                      </button>
                      <button
                        onClick={handleGuardarGruposSmart}
                        disabled={cargandoGuardadoSmart}
                        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {cargandoGuardadoSmart ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Confirmar y Guardar Grupos</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* LISTADO DE GRUPOS REGISTRADOS */
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                      <Users className="w-4.5 h-4.5 text-indigo-400" />
                      Grupos Registrados ({grupos.length})
                    </h3>

                    {grupos.length === 0 ? (
                      <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                        <Users className="w-10 h-10 mb-3 text-slate-650" />
                        <p className="text-xs font-semibold">No se han configurado equipos de trabajo en este aula.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {grupos.map((g) => {
                          const esMiGrupo = g.integrantes.some(i => i.idUsuario === currentUser.idUsuario);
                          return (
                            <div
                              key={g.idGrupo}
                              className={`bg-slate-900/30 border ${
                                esMiGrupo ? 'border-emerald-500/40 bg-emerald-950/5 shadow-md shadow-emerald-500/10' : 'border-slate-850'
                              } rounded-3xl p-5 space-y-3.5`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-sm font-bold text-slate-100">{g.nombre}</h4>
                                  {esMiGrupo && (
                                    <span className="inline-block mt-1 text-[9px] font-black text-emerald-450 bg-emerald-500/10 border border-emerald-900/50 px-2 py-0.5 rounded-full uppercase tracking-wider">Mi Grupo</span>
                                  )}
                                </div>
                                <div className="flex gap-1.5">
                                  {currentUser.rol !== 'ESTUDIANTE' && (
                                    <>
                                      <button
                                        onClick={() => setGrupoMensajeSeleccionado(g)}
                                        className="p-1.5 hover:bg-emerald-955 text-emerald-555 hover:text-slate-100 rounded-lg transition-all cursor-pointer bg-slate-950/40 border border-slate-850"
                                        title="Enviar mensaje al grupo"
                                      >
                                        <Mail className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          const text = `${g.nombre}\nIntegrantes:\n` + g.integrantes.map(mem => `- ${mem.apellidos}, ${mem.nombres}`).join('\n');
                                          navigator.clipboard.writeText(text);
                                          setSuccessMsg(`Información de ${g.nombre} copiada al portapapeles.`);
                                        }}
                                        className="p-1.5 hover:bg-indigo-955 text-indigo-555 hover:text-slate-100 rounded-lg transition-all cursor-pointer bg-slate-950/40 border border-slate-850"
                                        title="Copiar grupo al portapapeles"
                                      >
                                        <Copy className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleEliminarGrupo(g.idGrupo, g.nombre)}
                                        className="p-1.5 hover:bg-rose-955 text-rose-555 hover:text-slate-100 rounded-lg transition-all cursor-pointer bg-slate-950/40 border border-slate-850"
                                        title="Eliminar grupo"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-wide block">Integrantes ({g.integrantes.length})</span>
                                <div className="space-y-1 max-h-36 overflow-y-auto pl-1">
                                  {g.integrantes.map((mem) => (
                                    <div key={mem.idUsuario} className="text-xs text-slate-350 flex items-center gap-1.5 py-0.5">
                                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></div>
                                      <span className={mem.idUsuario === currentUser.idUsuario ? 'font-bold text-emerald-455' : ''}>
                                        {mem.apellidos}, {mem.nombres}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SUBPESTAÑA: LOGROS / INSIGNIAS */}
        {activeSubTab === 'logros' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Otorgamiento (Solo Docentes) */}
            {currentUser.rol !== 'ESTUDIANTE' && (
              <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                  <Award className="w-4.5 h-4.5 text-emerald-400" />
                  Otorgar Insignia
                </h3>
                <form onSubmit={handleOtorgarLogro} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Seleccionar Alumno</label>
                    <select
                      value={selectedEstudianteLogro}
                      onChange={(e) => setSelectedEstudianteLogro(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      {cursoEstudiantes.map(est => (
                        <option key={est.idUsuario} value={est.idUsuario}>
                          {est.apellidos}, {est.nombres}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Insignia / Medalla</label>
                    <select
                      value={selectedInsignia}
                      onChange={(e) => setSelectedInsignia(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="EXCELENCIA_ACADEMICA">🥇 Excelencia Académica</option>
                      <option value="ESFUERZO_DEDICACION">💪 Esfuerzo y Dedicación</option>
                      <option value="PARTICIPACION_ACTIVA">💬 Participación Activa</option>
                      <option value="PUNTUALIDAD">⏱️ Puntualidad</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Mensaje de Reconocimiento</label>
                    <textarea
                      required
                      value={comentarioLogro}
                      onChange={(e) => setComentarioLogro(e.target.value)}
                      placeholder="Ej: Destacado rendimiento en la resolución de problemas lógicos..."
                      rows={3}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creandoLogro || !selectedEstudianteLogro}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-4"
                  >
                    {creandoLogro ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trophy className="w-4 h-4" />
                        <span>Otorgar Medalla</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Vitrina de Medallas */}
            <div className={`${currentUser.rol !== 'ESTUDIANTE' ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4`}>
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                <Trophy className="w-4.5 h-4.5 text-indigo-400" />
                {currentUser.rol === 'ESTUDIANTE' ? 'Mi Vitrina de Insignias' : 'Historial de Medallas'}
              </h3>

              {logros.length === 0 ? (
                <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                  <Trophy className="w-10 h-10 mb-3 text-slate-650" />
                  <p className="text-xs font-semibold">No se han registrado medallas en este curso aún.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {logros.map((lg) => {
                    // Mapeo estético de la insignia
                    let badgeColor = 'from-amber-500/20 to-amber-600/5 border-amber-900/50 hover:border-amber-500/50 text-amber-400 shadow-amber-500/5';
                    let badgeIcon = <Trophy className="w-6 h-6" />;
                    let badgeName = 'Excelencia Académica';

                    if (lg.insignia === 'ESFUERZO_DEDICACION') {
                      badgeColor = 'from-purple-500/20 to-purple-600/5 border-purple-900/50 hover:border-purple-500/50 text-purple-400 shadow-purple-500/5';
                      badgeIcon = <Star className="w-6 h-6" />;
                      badgeName = 'Esfuerzo y Dedicación';
                    } else if (lg.insignia === 'PARTICIPACION_ACTIVA') {
                      badgeColor = 'from-cyan-500/20 to-cyan-600/5 border-cyan-900/50 hover:border-cyan-500/50 text-cyan-400 shadow-cyan-500/5';
                      badgeIcon = <MessageSquare className="w-6 h-6" />;
                      badgeName = 'Participación Activa';
                    } else if (lg.insignia === 'PUNTUALIDAD') {
                      badgeColor = 'from-rose-500/20 to-rose-600/5 border-rose-900/50 hover:border-rose-500/50 text-rose-450 shadow-rose-500/5';
                      badgeIcon = <Clock className="w-6 h-6" />;
                      badgeName = 'Puntualidad';
                    }

                    return (
                      <div
                        key={lg.idLogro}
                        className={`bg-gradient-to-br ${badgeColor} border rounded-3xl p-5 space-y-4 hover:shadow-xl transition-all hover:scale-[1.02] duration-300 relative overflow-hidden group`}
                      >
                        {/* Brillo de fondo */}
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 rounded-full bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          {badgeIcon}
                        </div>
                        
                        <div className="flex gap-3 items-center">
                          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-850 shrink-0">
                            {badgeIcon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-black text-slate-100 truncate">{badgeName}</h4>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mt-0.5 truncate">
                              {lg.nombreEstudiante}
                            </span>
                          </div>
                        </div>
                        
                        {lg.comentario && (
                          <p className="text-xs text-slate-350 italic bg-slate-950/30 border border-slate-900/60 p-3 rounded-xl">
                            "{lg.comentario}"
                          </p>
                        )}
                        
                        <div className="text-[9px] text-slate-500 font-semibold text-right">
                          Otorgado el {new Date(lg.fechaOtorgado).toLocaleDateString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBPESTAÑA: RETOS DE JUEGO */}
        {activeSubTab === 'retos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {/* Si es DOCENTE/CIST */}
            {currentUser.rol !== 'ESTUDIANTE' ? (
              <>
                {/* Listado de cuestionarios */}
                <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4">
                  <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                    <Gamepad2 className="w-4.5 h-4.5 text-emerald-400" />
                    Cuestionarios de Retos del Curso
                  </h3>
                  
                  {loadingCuestionarios ? (
                    <div className="flex justify-center p-10">
                      <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                    </div>
                  ) : cuestionarios.length === 0 ? (
                    <div className="bg-slate-950/40 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                      <Gamepad2 className="w-10 h-10 mb-3 text-slate-600" />
                      <p className="text-xs font-semibold">No has creado cuestionarios de retos para este curso aún.</p>
                      <p className="text-[10px] text-slate-550 mt-1">Usa el panel de la derecha para formular tu primer cuestionario de repaso.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cuestionarios.map(c => (
                        <div 
                          key={c.idCuestionario}
                          className={`bg-slate-950/60 border rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:scale-[1.01] ${
                            cuestionarioSeleccionado?.idCuestionario === c.idCuestionario 
                              ? 'border-emerald-500 bg-emerald-500/5' 
                              : 'border-slate-800 hover:border-slate-700'
                          }`}
                          onClick={() => {
                            setCuestionarioSeleccionado(c);
                            fetchPreguntasCuestionario(c.idCuestionario);
                          }}
                        >
                          <div>
                            <h4 className="font-bold text-sm text-slate-100">{c.titulo}</h4>
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.descripcion || 'Sin descripción.'}</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-900 gap-2">
                            <span>Fecha: {new Date(c.fechaCreacion).toLocaleDateString()}</span>
                            <div className="flex items-center gap-2">
                              <span className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-bold transition-all">
                                Ver Preguntas
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLanzarSalaJuego(c);
                                }}
                                disabled={lanzandoSala}
                                className="bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-850 disabled:text-slate-500 text-slate-950 px-2.5 py-0.5 rounded-full font-black transition-all active:scale-95"
                              >
                                Lanzar Reto
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Panel lateral: Crear o Editar */}
                <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
                  {!cuestionarioSeleccionado ? (
                    <>
                      <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider border-b border-slate-800 pb-2.5">
                        <PlusCircle className="w-4.5 h-4.5 text-emerald-400" />
                        Crear Cuestionario
                      </h3>
                      <form onSubmit={handleCrearCuestionario} className="space-y-3.5">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Título del Cuestionario</label>
                          <input
                            type="text"
                            required
                            value={nuevoCuestionarioTitulo}
                            onChange={(e) => setNuevoCuestionarioTitulo(e.target.value)}
                            placeholder="Ej: Repaso de Ecuaciones Lineales"
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción</label>
                          <textarea
                            value={nuevoCuestionarioDesc}
                            onChange={(e) => setNuevoCuestionarioDesc(e.target.value)}
                            placeholder="Ej: Ejercicios sencillos de suma y resta..."
                            rows={3}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={guardandoCuestionario}
                          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                        >
                          {guardandoCuestionario ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Crear Cuestionario</span>}
                        </button>
                      </form>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                        <h3 className="font-bold text-slate-200 text-xs truncate max-w-[150px]">
                          Preguntas: {cuestionarioSeleccionado.titulo}
                        </h3>
                        <button 
                          onClick={() => setCuestionarioSeleccionado(null)}
                          className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold"
                        >
                          ← Volver
                        </button>
                      </div>

                      {/* Lista de preguntas agregadas */}
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-1 no-scrollbar">
                        {preguntasCuestionario.length === 0 ? (
                          <p className="text-[11px] text-slate-500 italic text-center py-4">No hay preguntas en este cuestionario. Agrega una abajo.</p>
                        ) : (
                          preguntasCuestionario.map((pr, idx) => (
                            <div key={pr.idPregunta} className="p-3 bg-slate-950/50 border border-slate-900 rounded-xl text-[11px]">
                              <p className="font-bold text-slate-200">{idx+1}. {pr.enunciado}</p>
                              <div className="grid grid-cols-2 gap-1 mt-1.5 text-slate-400 text-[10px]">
                                <span className={pr.respuestaCorrecta === 'A' ? 'text-emerald-400 font-bold' : ''}>A: {pr.opcionA}</span>
                                <span className={pr.respuestaCorrecta === 'B' ? 'text-emerald-400 font-bold' : ''}>B: {pr.opcionB}</span>
                                <span className={pr.respuestaCorrecta === 'C' ? 'text-emerald-400 font-bold' : ''}>C: {pr.opcionC}</span>
                                <span className={pr.respuestaCorrecta === 'D' ? 'text-emerald-400 font-bold' : ''}>D: {pr.opcionD}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Formulario para añadir pregunta */}
                      <form onSubmit={handleCrearPregunta} className="space-y-3 pt-2.5 border-t border-slate-900">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Enunciado / Pregunta</label>
                          <textarea
                            required
                            value={nuevaPreguntaEnunciado}
                            onChange={(e) => setNuevaPreguntaEnunciado(e.target.value)}
                            placeholder="Ej: ¿Cuánto es 15% de 200?"
                            rows={2}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text" required placeholder="Opción A" value={nuevaPreguntaOpA}
                            onChange={(e) => setNuevaPreguntaOpA(e.target.value)}
                            className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text" required placeholder="Opción B" value={nuevaPreguntaOpB}
                            onChange={(e) => setNuevaPreguntaOpB(e.target.value)}
                            className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text" required placeholder="Opción C" value={nuevaPreguntaOpC}
                            onChange={(e) => setNuevaPreguntaOpC(e.target.value)}
                            className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                          <input
                            type="text" required placeholder="Opción D" value={nuevaPreguntaOpD}
                            onChange={(e) => setNuevaPreguntaOpD(e.target.value)}
                            className="bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase">Respuesta Correcta</label>
                          <select
                            value={nuevaPreguntaCorrecta}
                            onChange={(e) => setNuevaPreguntaCorrecta(e.target.value)}
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-2 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                          >
                            <option value="A">Opción A</option>
                            <option value="B">Opción B</option>
                            <option value="C">Opción C</option>
                            <option value="D">Opción D</option>
                          </select>
                        </div>

                        <button
                          type="submit"
                          disabled={guardandoPregunta}
                          className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-2"
                        >
                          {guardandoPregunta ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Agregar Pregunta</span>}
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </>
            ) : (
              /* Si es ESTUDIANTE */
              <div className="lg:col-span-3 space-y-4">
                <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                  <Gamepad2 className="w-4.5 h-4.5 text-indigo-400" />
                  Retos y Duelos de Clase Disponibles
                </h3>

                {loadingCuestionarios ? (
                  <div className="flex justify-center p-10">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                  </div>
                ) : cuestionarios.length === 0 ? (
                  <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center text-slate-500">
                    <Gamepad2 className="w-10 h-10 mb-3 text-slate-600" />
                    <p className="text-xs font-semibold">Tu docente no ha creado cuestionarios de retos para este curso todavía.</p>
                    <button
                      onClick={() => onNavigateToJuegos(selectedCurso.nombre)}
                      className="mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
                    >
                      Ir a Juegos (Banco General)
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {cuestionarios.map(c => (
                      <div 
                        key={c.idCuestionario}
                        className="bg-slate-900/30 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all hover:scale-[1.01]"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-900/60 px-2.5 py-0.5 rounded-full uppercase">
                            Reto Activo
                          </span>
                          <h4 className="font-bold text-sm text-slate-100 pt-1">{c.titulo}</h4>
                          <p className="text-xs text-slate-400 line-clamp-3">{c.descripcion || 'Sin descripción detallada.'}</p>
                        </div>
                        
                        <div className="space-y-3 pt-3 border-t border-slate-950">
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>Creado por: {selectedCurso.nombreDocente}</span>
                            <span>{new Date(c.fechaCreacion).toLocaleDateString()}</span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <button
                              onClick={() => onNavigateToJuegos({
                                area: selectedCurso.nombre,
                                idCuestionario: c.idCuestionario,
                                tituloCuestionario: c.titulo,
                                mode: 'single'
                              })}
                              className="bg-slate-950 hover:bg-slate-900 text-slate-200 border border-slate-800 font-bold py-2 rounded-xl text-[11px] cursor-pointer text-center active:scale-95 transition-all"
                            >
                              Jugar Solo
                            </button>
                            <button
                              onClick={() => onNavigateToJuegos({
                                area: selectedCurso.nombre,
                                idCuestionario: c.idCuestionario,
                                tituloCuestionario: c.titulo,
                                mode: 'multi'
                              })}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2 rounded-xl text-[11px] cursor-pointer text-center active:scale-95 transition-all"
                            >
                              Lanzar Duelo
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MODAL DE REVISIÓN DOCENTE (AVANCES DE CLASE) */}
        {revisandoAvanceObj && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5">
              <button 
                type="button"
                onClick={() => setRevisandoAvanceObj(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Evaluar Evidencia de Clase</h3>
                  <p className="text-[10px] text-slate-450 uppercase font-semibold">Estudiante: {revisandoAvanceObj.nombreEstudiante}</p>
                </div>
              </div>

              <form onSubmit={handleGuardarRevision} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Estado de Revisión</label>
                  <select
                    value={nuevoEstadoAvance}
                    onChange={(e) => setNuevoEstadoAvance(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="REVISADO">✅ REVISADO (Aprobado/Conforme)</option>
                    <option value="CORREGIR">❌ POR CORREGIR (Requiere cambios)</option>
                    <option value="PENDIENTE">⏳ PENDIENTE (En espera)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Retroalimentación / Observaciones</label>
                  <textarea
                    value={nuevoComentarioDocente}
                    onChange={(e) => setNuevoComentarioDocente(e.target.value)}
                    placeholder="Escriba los comentarios detallados para el alumno aquí..."
                    rows={2}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Criterios de Evaluación Dinámicos */}
                {(() => {
                  const idEval = revisandoAvanceObj.idEvaluacion || revisandoNuevaEvaluacionId;
                  
                  return (
                    <div className="space-y-4">
                      {/* Si no tiene evaluación vinculada, permitimos vincularla */}
                      {!revisandoAvanceObj.idEvaluacion && evaluacionesList.length > 0 && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-indigo-400 uppercase">Vincular a Evaluación (Libro de Notas)</label>
                          <select
                            value={revisandoNuevaEvaluacionId}
                            onChange={(e) => setRevisandoNuevaEvaluacionId(e.target.value)}
                            className="w-full bg-slate-950/60 border border-indigo-500/50 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-400 cursor-pointer"
                          >
                            <option value="">-- No calificar formalmente (Solo retroalimentación) --</option>
                            {evaluacionesList.map(ev => (
                              <option key={ev.idEvaluacion} value={ev.idEvaluacion}>{ev.titulo}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Mostrar criterios si hay una evaluación seleccionada (o ya vinculada) */}
                      {idEval && (
                        <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase">Calificación por Criterios</h4>
                            {(() => {
                              const evalObj = evaluacionesList.find(e => e.idEvaluacion === idEval);
                              if (!evalObj || !evalObj.criterios) return null;
                              let total = 0;
                              evalObj.criterios.forEach(c => {
                                total += parseInt(revisandoNotasCriterios[c.idCriterio]) || 0;
                              });
                              let bg = "bg-rose-500/10 text-rose-500";
                              let letra = "C";
                              if (total >= 11) { bg = "bg-amber-500/10 text-amber-500"; letra = "B"; }
                              if (total >= 14) { bg = "bg-emerald-500/10 text-emerald-500"; letra = "A"; }
                              if (total >= 18) { bg = "bg-indigo-500/10 text-indigo-500"; letra = "AD"; }
                              return (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-300">Total: {total}/20</span>
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${bg}`}>{letra}</span>
                                </div>
                              );
                            })()}
                          </div>

                          <div className="space-y-3 max-h-[30vh] overflow-y-auto custom-scrollbar pr-2">
                            {(() => {
                              const evalObj = evaluacionesList.find(e => e.idEvaluacion === idEval);
                              if (!evalObj || !evalObj.criterios) return <p className="text-xs text-slate-500">Sin criterios</p>;
                              return evalObj.criterios.map(c => (
                                <div key={c.idCriterio} className="flex flex-col gap-1.5">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-300 font-medium">{c.nombre}</span>
                                    <span className="text-[10px] text-slate-500">Max: {c.puntajeMaximo}</span>
                                  </div>
                                  <input
                                    type="number"
                                    min="0"
                                    max={c.puntajeMaximo}
                                    value={revisandoNotasCriterios[c.idCriterio] || ''}
                                    onChange={(e) => setRevisandoNotasCriterios({
                                      ...revisandoNotasCriterios,
                                      [c.idCriterio]: e.target.value
                                    })}
                                    placeholder="Nota"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                                  />
                                </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setRevisandoAvanceObj(null)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold rounded-xl text-xs cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={guardandoRevision}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-md"
                  >
                    {guardandoRevision ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Guardar Calificación</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL DE MENSAJERÍA GRUPAL MASIVA */}
        {grupoMensajeSeleccionado && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5">
              <button 
                type="button"
                onClick={() => setGrupoMensajeSeleccionado(null)} 
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2.5 bg-indigo-500/10 text-indigo-455 rounded-2xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">Mensaje Masivo a Grupo</h3>
                  <p className="text-[10px] text-slate-450 uppercase font-semibold">Grupo: {grupoMensajeSeleccionado.nombre}</p>
                </div>
              </div>

              <form onSubmit={handleEnviarMensajeMasivo} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mensaje para el grupo</label>
                  <textarea
                    required
                    rows={4}
                    value={mensajeMasivoContenido}
                    onChange={(e) => setMensajeMasivoContenido(e.target.value)}
                    placeholder="Escriba el comunicado o tarea para todos los miembros de este grupo..."
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                  <span className="text-[9px] text-slate-500 block leading-tight">
                    El mensaje se enviará individualmente a la bandeja de cada integrante en este curso.
                  </span>
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setGrupoMensajeSeleccionado(null)}
                    className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={enviandoMensajeMasivo || !mensajeMasivoContenido.trim()}
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-955 text-xs font-black rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                  >
                    {enviandoMensajeMasivo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Enviar Comunicado</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal del Visualizador de Documentos */}
        <DocumentViewerModal
          isOpen={viewerOpen}
          onClose={() => setViewerOpen(false)}
          fileUrl={viewerUrl}
          fileName={viewerName}
        />
        
        {/* MODAL CREAR EVALUACIÓN */}
        {modalEvaluacionAbierto && (
          <ModalNuevaEvaluacion 
            onClose={() => setModalEvaluacionAbierto(false)}
            onSave={handleCrearEvaluacion}
            loading={creandoEvaluacion}
          />
        )}
      </div>
    );
  }

  // --- VISTA LISTADO PRINCIPAL DE CURSOS ---
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            {currentUser.rol === 'CIST' || currentUser.rol === 'PIP' ? 'Gestión de Cursos' : 'Mis Cursos Académicos'}
          </h2>
          <p className="text-sm text-slate-400">
            {currentUser.rol === 'CIST' || currentUser.rol === 'PIP' 
              ? 'Administre la currícula, asigne docentes y cree aulas de curso.'
              : 'Acceda a sus materiales de estudio subidos y gestione el control de notas.'
            }
          </p>
        </div>
      </div>

      {/* Alertas de Mensajes */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 rounded-2xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-rose-950/30 text-rose-450 border border-rose-900/50 rounded-2xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* VISTA DE CIST/PIP: CREACIÓN DE CURSOS & LISTADO GENERAL */}
      {(currentUser.rol === 'CIST' || currentUser.rol === 'PIP') && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Formulario Crear Curso */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-5 space-y-4 h-fit">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                <Plus className="w-4 h-4 text-emerald-400" />
                Registrar Nuevo Curso
              </h3>
              <button
                type="button"
                onClick={handleGenerarPruebas}
                className="px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded-lg transition-colors border border-indigo-500/30"
              >
                Generar Pruebas
              </button>
            </div>
            
            {docentes.length === 0 ? (
              <div className="text-xs text-amber-400 bg-amber-955/20 border border-amber-900/40 p-3 rounded-xl">
                ⚠️ No hay personal docente registrado en la base de datos. Registre docentes en la pestaña de "Usuarios" primero.
              </div>
            ) : (
              <form onSubmit={handleCrearCurso} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Código Único (NRC)</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={nrc}
                    onChange={(e) => setNrc(e.target.value.replace(/\s+/g, ''))}
                    placeholder="Ej: MAT1A, COM3B"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Nombre de la Asignatura</label>
                  <input
                    type="text"
                    required
                    value={nombreCurso}
                    onChange={(e) => setNombreCurso(e.target.value)}
                    placeholder="Ej: MATEMÁTICA, COMUNICACIÓN"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Grado</label>
                    <select
                      value={grado}
                      onChange={(e) => setGrado(e.target.value)}
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
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Sección</label>
                    <input
                      type="text"
                      required
                      maxLength={50}
                      value={seccion}
                      onChange={(e) => setSeccion(e.target.value.toUpperCase())}
                      placeholder="Ej: A, B, UNICA"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Docente Asignado</label>
                  <select
                    value={selectedDocenteId}
                    onChange={(e) => setSelectedDocenteId(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {docentes.map(doc => (
                      <option key={doc.idUsuario} value={doc.idUsuario}>
                        {doc.apellidos}, {doc.nombres} ({doc.areaCurricular || 'Sin Área'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={creandoCurso}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 mt-4"
                >
                  {creandoCurso ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4" />
                      <span>Crear Curso en Servidor</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Listado de Cursos de Admin */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-bold text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wider">
                <Layers className="w-4.5 h-4.5 text-indigo-400" />
                Catálogo de Cursos Activos
              </h3>
              
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Buscar docente, DNI o NRC..."
                  value={filtroCatalogo}
                  onChange={(e) => setFiltroCatalogo(e.target.value)}
                  className="bg-slate-950/60 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center p-8 text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                Cargando asignaturas...
              </div>
            ) : cursos.length === 0 ? (
              <div className="bg-slate-900/10 border border-slate-800 border-dashed rounded-3xl p-10 text-center text-slate-500 text-xs">
                No hay cursos creados en la Intranet todavía.
              </div>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 no-scrollbar">
                {(() => {
                  const query = filtroCatalogo.toLowerCase();
                  
                  // Filter courses
                  const filteredCursos = cursos.filter(c => {
                    if (!query) return true;
                    const matchCurso = c.nombre.toLowerCase().includes(query) || c.nrc.toLowerCase().includes(query);
                    const matchDocente = c.nombreDocente.toLowerCase().includes(query);
                    
                    const docenteInfo = docentes.find(d => d.idUsuario === c.idDocente);
                    const matchDni = docenteInfo && docenteInfo.dni && docenteInfo.dni.includes(query);
                    
                    return matchCurso || matchDocente || matchDni;
                  });

                  if (filteredCursos.length === 0) {
                    return (
                      <div className="text-center p-6 text-slate-500 text-xs bg-slate-900/20 border border-slate-800 rounded-3xl">
                        No se encontraron resultados para "{filtroCatalogo}"
                      </div>
                    );
                  }

                  // Group by docente
                  const grouped = filteredCursos.reduce((acc, curso) => {
                    if (!acc[curso.idDocente]) {
                      const docenteInfo = docentes.find(d => d.idUsuario === curso.idDocente);
                      acc[curso.idDocente] = {
                        idDocente: curso.idDocente,
                        nombreDocente: curso.nombreDocente,
                        dniDocente: docenteInfo ? docenteInfo.dni : 'N/A',
                        areaDocente: docenteInfo && docenteInfo.areaCurricular ? docenteInfo.areaCurricular : 'Sin Especialidad',
                        cursos: []
                      };
                    }
                    acc[curso.idDocente].cursos.push(curso);
                    return acc;
                  }, {});

                  return Object.values(grouped).map(grupo => {
                    const isExpanded = expandedDocentes[grupo.idDocente];
                    return (
                    <div key={grupo.idDocente} className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all">
                      <div 
                        className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900/80 transition-colors"
                        onClick={() => setExpandedDocentes(prev => ({...prev, [grupo.idDocente]: !prev[grupo.idDocente]}))}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-200 text-sm">{grupo.nombreDocente}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <p className="text-[10px] text-slate-500 font-mono">DNI: {grupo.dniDocente}</p>
                              <span className="text-[9px] text-indigo-400 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-wider">{grupo.areaDocente}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-2.5 py-1 bg-slate-800/80 text-slate-400 rounded-full text-[10px] font-bold border border-slate-700">
                            {grupo.cursos.length} Cursos
                          </span>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/20">
                          {grupo.cursos.map(c => (
                            <div key={c.idCurso} className="bg-slate-950/40 hover:bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between transition-all group">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="flex gap-1.5 items-center">
                                    <span className="text-[10px] text-indigo-400 font-mono font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded">{c.nrc}</span>
                                    {c.esPrueba && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${c.pruebaHabilitada ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                        PRUEBA {c.pruebaHabilitada ? 'ON' : 'OFF'}
                                      </span>
                                    )}
                                  </div>
                                  <h5 className="font-bold text-slate-300 text-xs mt-1.5">{c.nombre}</h5>
                                </div>
                                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded-md font-bold text-[9px] shrink-0 ml-2">
                                  {c.grado}° "{c.seccion}"
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/60">
                                <button
                                  onClick={() => setSelectedCurso(c)}
                                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-slate-900 group-hover:bg-indigo-500/10 text-slate-400 group-hover:text-indigo-400 rounded-lg border border-slate-800 text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  <ChevronRight className="w-3.5 h-3.5" />
                                  <span>Administrar</span>
                                </button>
                                {c.esPrueba && (
                                  <button
                                    onClick={() => handleTogglePrueba(c.idCurso)}
                                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-500 hover:text-emerald-400 rounded-lg border border-slate-800 transition-all cursor-pointer"
                                    title="Toggle Prueba"
                                  >
                                    <Gamepad2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleEliminarCurso(c.idCurso, c.nombre)}
                                  className="px-2.5 py-1.5 bg-slate-900 hover:bg-rose-955 text-slate-500 hover:text-rose-450 rounded-lg border border-slate-800 transition-all cursor-pointer"
                                  title="Eliminar curso"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )});
                })()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VISTA DOCENTE / ESTUDIANTE: CARD GRID DE CURSOS ASIGNADOS */}
      {currentUser.rol !== 'CIST' && currentUser.rol !== 'PIP' && (
        <>
          {loading ? (
            <div className="text-center p-10 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
              Cargando tus asignaturas...
            </div>
          ) : cursos.length === 0 ? (
            <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-3xl p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
              <GraduationCap className="w-12 h-12 text-slate-650 animate-bounce" />
              <div>
                <p className="text-sm font-bold text-slate-400">Aún no tienes cursos asociados en el sistema.</p>
                <p className="text-xs text-slate-550 mt-1">El personal CIST debe crearte y asignarte cursos en la Intranet.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursos.map((c, idx) => {
                // Definir colores degradados dinámicos por tarjeta
                const colors = [
                  'from-emerald-500/10 to-indigo-500/5 hover:border-emerald-500/50 hover:shadow-emerald-500/5',
                  'from-blue-500/10 to-purple-500/5 hover:border-blue-500/50 hover:shadow-blue-500/5',
                  'from-amber-500/10 to-rose-500/5 hover:border-amber-500/50 hover:shadow-amber-500/5',
                  'from-cyan-500/10 to-blue-500/5 hover:border-cyan-500/50 hover:shadow-cyan-500/5'
                ];
                const colorClass = colors[idx % colors.length];

                const isDeshabilitado = c.esPrueba && !c.pruebaHabilitada && currentUser.rol === 'DOCENTE';

                return (
                  <button
                    key={c.idCurso}
                    onClick={() => {
                      if (!isDeshabilitado) setSelectedCurso(c);
                    }}
                    disabled={isDeshabilitado}
                    className={`bg-gradient-to-br ${colorClass} border border-slate-850 rounded-3xl p-6 text-left space-y-4 transition-all ${isDeshabilitado ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-2xl cursor-pointer group active:scale-98'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className={`p-3 bg-slate-950/80 text-emerald-400 border border-slate-800 rounded-2xl ${isDeshabilitado ? '' : 'group-hover:scale-110 transition-transform'}`}>
                        <BookOpen className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div className="flex gap-1.5 items-center">
                        {c.esPrueba && (
                          <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${isDeshabilitado ? 'bg-rose-500/20 text-rose-400 border border-rose-900/50' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-900/50'}`}>
                            Prueba
                          </span>
                        )}
                        <span className="text-[10px] bg-slate-950/60 text-slate-400 border border-slate-800 px-2.5 py-1 rounded-full font-mono font-bold tracking-wider uppercase">
                          NRC: {c.nrc}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <h3 className={`text-lg font-black text-slate-100 line-clamp-1 ${isDeshabilitado ? '' : 'group-hover:text-emerald-450 transition-colors'}`}>{c.nombre}</h3>
                      <p className="text-xs text-slate-500 font-semibold uppercase">
                        {currentUser.rol === 'DOCENTE' ? 'Aula asignada' : 'Mi Sección'}: {c.grado}° "{c.seccion}"
                      </p>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3.5 flex justify-between items-center text-xs text-slate-450 font-bold">
                      <span className="truncate max-w-[170px]">
                        {currentUser.rol === 'DOCENTE' ? 'Registro e Intranet' : c.nombreDocente}
                      </span>
                      {!isDeshabilitado && <ChevronRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />}
                      {isDeshabilitado && <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full">Deshabilitado</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal de Sala de Juego Creada por el Docente */}
      {salaCreadaDocente && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full text-center space-y-6 shadow-2xl relative overflow-hidden animate-fadeIn">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex justify-center">
              <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                <Gamepad2 className="w-10 h-10" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-100">¡Sala de Reto Lanzada!</h3>
              <p className="text-xs text-slate-400">
                Se ha generado una sala de Ludo Académico con tu cuestionario.
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl space-y-2 relative">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">Código de Sala</span>
              <span className="text-4xl font-mono font-black text-emerald-400 block tracking-widest drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                {salaCreadaDocente.codigoSala}
              </span>
            </div>

            <p className="text-[11px] text-slate-450 leading-relaxed">
              Comparte este código de 4 dígitos con tus estudiantes. Ellos deben ir a <strong>Juegos Interactivos</strong> e ingresarlo en la tarjeta de Ludo para unirse a la partida.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => {
                  onNavigateToJuegos({
                    area: selectedCurso.nombre,
                    idSala: salaCreadaDocente.idSala,
                    codigoSala: salaCreadaDocente.codigoSala,
                    rol: 'DOCENTE'
                  });
                  setSalaCreadaDocente(null);
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl text-xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4" />
                <span>Ver Tablero (Espectador)</span>
              </button>
              <button
                onClick={() => setSalaCreadaDocente(null)}
                className="flex-1 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 font-bold py-3 rounded-xl text-xs cursor-pointer transition-all active:scale-95"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

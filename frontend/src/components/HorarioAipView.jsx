import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  X, 
  Clock, 
  User, 
  BookOpen, 
  AlertTriangle, 
  CheckCircle,
  Loader2,
  CalendarCheck
} from 'lucide-react';

// Períodos pedagógicos oficiales de la Jornada Escolar Completa (JEC) en Perú
const PERIODS = [
  { num: 1, name: '1° Hora', start: '08:00', end: '08:45', isBreak: false },
  { num: 2, name: '2° Hora', start: '08:45', end: '09:30', isBreak: false },
  { num: 3, name: '3° Hora', start: '09:30', end: '10:15', isBreak: false },
  { num: 4, name: '4° Hora', start: '10:15', end: '11:00', isBreak: false },
  { num: 'R1', name: 'Recreo', start: '11:00', end: '11:15', isBreak: true, label: 'Primer Receso - Recreo' },
  { num: 5, name: '5° Hora', start: '11:15', end: '12:00', isBreak: false },
  { num: 6, name: '6° Hora', start: '12:00', end: '12:45', isBreak: false },
  { num: 7, name: '7° Hora', start: '12:45', end: '13:30', isBreak: false },
  { num: 'R2', name: 'Almuerzo', start: '13:30', end: '14:10', isBreak: true, label: 'Segundo Receso - Almuerzo Escolar' },
  { num: 8, name: '8° Hora', start: '14:10', end: '14:55', isBreak: false },
  { num: 9, name: '9° Hora', start: '14:55', end: '15:40', isBreak: false },
];

const DAYS_OF_WEEK = [
  { dayIndex: 1, name: 'Lunes' },
  { dayIndex: 2, name: 'Martes' },
  { dayIndex: 3, name: 'Miércoles' },
  { dayIndex: 4, name: 'Jueves' },
  { dayIndex: 5, name: 'Viernes' },
];

// Obtener el lunes de la semana de una fecha dada
const getMonday = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

// Formatear fecha a YYYY-MM-DD
const formatDateToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Formatear fecha para mostrar (Ej: Lun 30 Jun)
const formatDayHeader = (date) => {
  const options = { weekday: 'short', day: 'numeric', month: 'short' };
  return date.toLocaleDateString('es-PE', options);
};

export default function HorarioAipView({ currentUser }) {
  const [aulas, setAulas] = useState([]);
  const [selectedAula, setSelectedAula] = useState(null);
  const [currentMonday, setCurrentMonday] = useState(() => getMonday(new Date()));
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cursos disponibles para reservar
  const [cursos, setCursos] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReservaDetalles, setSelectedReservaDetalles] = useState(null);

  // Formulario de nueva reserva
  const [formFecha, setFormFecha] = useState('');
  const [formPeriodo, setFormPeriodo] = useState('');
  const [formCursoId, setFormCursoId] = useState('');
  const [formMotivo, setFormMotivo] = useState('');
  const [formGrado, setFormGrado] = useState('1');
  const [formSeccion, setFormSeccion] = useState('A');
  const [formDocenteId, setFormDocenteId] = useState('');
  const [isGeneralEvent, setIsGeneralEvent] = useState(false);
  const [docentesTodos, setDocentesTodos] = useState([]); // Solo para CIST
  const [creandoReserva, setCreandoReserva] = useState(false);

  // Cargar Aulas AIP al montar el componente
  useEffect(() => {
    fetchAulas();
  }, []);

  // Recargar reservas al cambiar aula, semana o después de una acción
  useEffect(() => {
    if (selectedAula) {
      fetchReservas();
    }
  }, [selectedAula, currentMonday]);

  // Cargar cursos según rol
  useEffect(() => {
    if (showCreateModal) {
      fetchCursosReservas();
      if (currentUser.rol === 'CIST' || currentUser.rol === 'PIP') {
        fetchTodosDocentes();
      }
    }
  }, [showCreateModal]);

  const fetchAulas = async () => {
    try {
      const res = await fetch('/api/v1/reservas/aulas');
      if (res.ok) {
        const data = await res.json();
        setAulas(data);
        if (data.length > 0) {
          setSelectedAula(data[0]);
        }
      } else {
        setError('Error al obtener la lista de aulas AIP.');
      }
    } catch (err) {
      setError('Error de red al conectar con el servidor.');
    }
  };

  const fetchReservas = async () => {
    setLoading(true);
    setError(null);
    try {
      const start = formatDateToISO(currentMonday);
      const end = new Date(currentMonday);
      end.setDate(currentMonday.getDate() + 4); // Viernes
      const endStr = formatDateToISO(end);

      const url = `/api/v1/reservas?idUsuario=${currentUser.idUsuario}&idAula=${selectedAula.idAula}&fechaInicio=${start}&fechaFin=${endStr}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setReservas(data);
      } else {
        setError('No se pudieron recuperar las reservas para la semana seleccionada.');
      }
    } catch (err) {
      setError('Error de red al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCursosReservas = async () => {
    setLoadingCursos(true);
    try {
      let url = '/api/v1/cursos';
      if (currentUser.rol === 'DOCENTE') {
        url = `/api/v1/cursos/docente/${currentUser.idUsuario}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCursos(data);
        if (data.length > 0) {
          setFormCursoId(data[0].idCurso);
          setFormGrado(data[0].grado);
          setFormSeccion(data[0].seccion);
          setFormDocenteId(currentUser.idUsuario);
        }
      }
    } catch (err) {
      console.error('Error al cargar cursos para reservas:', err);
    } finally {
      setLoadingCursos(false);
    }
  };

  const fetchTodosDocentes = async () => {
    try {
      const res = await fetch('/api/v1/usuarios');
      if (res.ok) {
        const data = await res.json();
        const docentesList = data.filter(u => u.rol === 'DOCENTE' || u.rol === 'CIST' || u.rol === 'PIP');
        setDocentesTodos(docentesList);
        if (docentesList.length > 0 && !formDocenteId) {
          setFormDocenteId(docentesList[0].idUsuario);
        }
      }
    } catch (err) {
      console.error('Error al cargar lista de docentes:', err);
    }
  };

  // Manejar cambio en el curso seleccionado para auto-poblar grado y sección
  const handleCursoChange = (e) => {
    const cursoId = e.target.value;
    setFormCursoId(cursoId);
    const selected = cursos.find(c => c.idCurso === cursoId);
    if (selected) {
      setFormGrado(selected.grado);
      setFormSeccion(selected.seccion);
      // Si el docente del curso está definido
      if (selected.docente && selected.docente.idUsuario) {
        setFormDocenteId(selected.docente.idUsuario);
      } else {
        setFormDocenteId(currentUser.idUsuario);
      }
    }
  };

  // Obtener los días de la semana activa
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 5; i++) {
      const temp = new Date(currentMonday);
      temp.setDate(currentMonday.getDate() + i);
      days.push(temp);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Navegación de semanas
  const handlePrevWeek = () => {
    const prev = new Date(currentMonday);
    prev.setDate(currentMonday.getDate() - 7);
    setCurrentMonday(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentMonday);
    next.setDate(currentMonday.getDate() + 7);
    setCurrentMonday(next);
  };

  const handleCurrentWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  // Buscar si una celda (día y período) está reservada
  const findReservaForCell = (date, period) => {
    const dateStr = formatDateToISO(date);
    
    // Convertir horas a minutos para una comparación de intervalos precisa
    const parseTimeToMinutes = (t) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const periodStartMin = parseTimeToMinutes(period.start);
    const periodEndMin = parseTimeToMinutes(period.end);

    return reservas.find(r => {
      if (r.fecha !== dateStr) return false;
      const resStartMin = parseTimeToMinutes(r.horaInicio.substring(0, 5));
      const resEndMin = parseTimeToMinutes(r.horaFin.substring(0, 5));
      
      // Comprobar solapamiento parcial o total
      return (resStartMin < periodEndMin && resEndMin > periodStartMin);
    });
  };

  // Abrir modal de creación sobre celda vacía
  const handleCellClick = (date, period) => {
    if (currentUser.rol === 'ESTUDIANTE') return; // Estudiante es de sólo lectura
    
    setFormFecha(formatDateToISO(date));
    setFormPeriodo(period.num);
    setFormMotivo('');
    setIsGeneralEvent(false);
    
    if (cursos.length > 0) {
      setFormCursoId(cursos[0].idCurso);
      setFormGrado(cursos[0].grado);
      setFormSeccion(cursos[0].seccion);
    }
    
    setFormDocenteId(currentUser.idUsuario);
    setError(null);
    setSuccess(null);
    setShowCreateModal(true);
  };

  // Crear la reserva
  const handleCreateReserva = async (e) => {
    e.preventDefault();
    setCreandoReserva(true);
    setError(null);
    setSuccess(null);

    // Obtener las horas asociadas al periodo seleccionado
    const selectedPeriod = PERIODS.find(p => p.num.toString() === formPeriodo.toString());
    if (!selectedPeriod) {
      setError('Periodo pedagógico no válido.');
      setCreandoReserva(false);
      return;
    }

    const payload = {
      idAula: selectedAula.idAula,
      idDocente: formDocenteId || currentUser.idUsuario,
      fecha: formFecha,
      horaInicio: selectedPeriod.start + ':00',
      horaFin: selectedPeriod.end + ':00',
      grado: isGeneralEvent ? 0 : parseInt(formGrado),
      seccion: isGeneralEvent ? 'TODOS' : formSeccion.trim().toUpperCase(),
      motivo: isGeneralEvent ? formMotivo.trim() : (cursos.find(c => c.idCurso === formCursoId)?.nombre || formMotivo.trim())
    };

    if (!payload.motivo) {
      setError('Por favor proporcione el motivo o tema de la sesión.');
      setCreandoReserva(false);
      return;
    }

    try {
      const res = await fetch('/api/v1/reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Reserva registrada exitosamente.');
        setShowCreateModal(false);
        fetchReservas();
      } else {
        setError(data.message || 'Error al registrar la reserva.');
      }
    } catch (err) {
      setError('Error de conexión al guardar la reserva.');
    } finally {
      setCreandoReserva(false);
    }
  };

  // Ver detalles de una reserva existente
  const handleReservaClick = (reserva, e) => {
    e.stopPropagation(); // Evitar que dispare click de celda vacía
    setSelectedReservaDetalles(reserva);
    setShowDetailsModal(true);
  };

  // Anular reserva
  const handleDeleteReserva = async (idReserva) => {
    if (!window.confirm('¿Está seguro de que desea anular esta reserva en el Aula AIP?')) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/v1/reservas/${idReserva}?idUsuario=${currentUser.idUsuario}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('Reserva anulada con éxito.');
        setShowDetailsModal(false);
        fetchReservas();
      } else {
        setError(data.message || 'No se pudo anular la reserva.');
      }
    } catch (err) {
      setError('Error de red al intentar eliminar.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 tracking-wide">HORARIO INTERACTIVO</h2>
            <p className="text-xs text-slate-400">Reserva de Aulas AIP y control de horarios por aula y sección.</p>
          </div>
        </div>

        {/* Aula AIP pills */}
        <div className="flex gap-1.5 bg-slate-950/60 p-1.5 rounded-2xl border border-slate-800 self-stretch sm:self-auto overflow-x-auto no-scrollbar">
          {aulas.map((aula) => (
            <button
              key={aula.idAula}
              onClick={() => setSelectedAula(aula)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedAula?.idAula === aula.idAula
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {aula.nombreAula}
            </button>
          ))}
        </div>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-rose-950/20 text-rose-450 border border-rose-900/50 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-950/20 text-emerald-400 border border-emerald-900/50 rounded-2xl text-xs flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Navegador de Fechas */}
      <div className="flex justify-between items-center bg-slate-900/20 border border-slate-800/80 p-4 rounded-3xl">
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevWeek}
            className="p-2 hover:bg-slate-850 text-slate-450 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
            title="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={handleCurrentWeek}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all"
          >
            Semana Actual
          </button>
          <button 
            onClick={handleNextWeek}
            className="p-2 hover:bg-slate-850 text-slate-450 hover:text-slate-200 rounded-xl transition-all cursor-pointer"
            title="Siguiente semana"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-right">
          <span className="text-xs uppercase font-bold text-slate-500 block leading-none">Calendario Académico</span>
          <span className="text-sm font-extrabold text-emerald-450 font-mono">
            {currentMonday.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })} - {new Date(new Date(currentMonday).setDate(currentMonday.getDate() + 4)).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>
      {/* Timetable Grid */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 md:p-6 shadow-2xl overflow-x-auto no-scrollbar">
        <div className="min-w-[760px] space-y-3">
          
          {/* Header Row */}
          <div className="grid grid-cols-6 gap-3 border-b border-slate-800 pb-3">
            <div className="text-center py-2 text-[10px] font-bold text-slate-500 uppercase">Periodo / Hora</div>
            {weekDays.map((day, idx) => (
              <div key={idx} className="text-center py-2">
                <span className="block text-xs font-extrabold text-slate-200">{DAYS_OF_WEEK[idx].name}</span>
                <span className="text-[10px] font-semibold text-slate-550 font-mono">{formatDayHeader(day)}</span>
              </div>
            ))}
          </div>

          {/* Body Rows */}
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              <span className="text-xs text-slate-400 font-semibold">Cargando reservas y horarios...</span>
            </div>
          ) : (
            PERIODS.map((period, pIdx) => {
              if (period.isBreak) {
                // Fila de recreo o almuerzo (es una fila completa en la grilla)
                return (
                  <div key={period.num} className="grid grid-cols-6 gap-3">
                    <div className="col-span-1 bg-slate-950/40 border border-slate-900/80 rounded-2xl p-2.5 flex flex-col items-center justify-center min-h-[50px]">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase">{period.name}</span>
                      <span className="text-[10px] font-semibold text-slate-550 font-mono mt-0.5">{period.start} - {period.end}</span>
                    </div>
                    <div className="col-span-5 bg-slate-950/20 border border-dashed border-slate-800/60 rounded-2xl px-4 flex items-center justify-center min-h-[50px]">
                      <span className="text-[10px] font-bold text-slate-550 tracking-widest uppercase flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        {period.label}
                      </span>
                    </div>
                  </div>
                );
              }

              return (
                <div key={period.num} className="grid grid-cols-6 gap-3">
                  {/* Bloque de hora */}
                  <div className="col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-2.5 flex flex-col items-center justify-center min-h-[70px]">
                    <span className="text-[10px] font-extrabold text-slate-350">{period.name}</span>
                    <span className="text-[10px] font-semibold text-slate-500 font-mono mt-0.5">{period.start} - {period.end}</span>
                  </div>

                  {/* Celdas para cada día de la semana */}
                  {weekDays.map((day, dIdx) => {
                    const r = findReservaForCell(day, period);
                    const isReadOnly = currentUser.rol === 'ESTUDIANTE';
                    
                    if (r) {
                      const isOwner = r.idDocente === currentUser.idUsuario;
                      const isSystemAdmin = currentUser.rol === 'CIST' || currentUser.rol === 'PIP';
                      const isMasked = r.grado === null; // Celda oculta por seguridad para docentes
                      
                      return (
                        <div 
                          key={dIdx}
                          onClick={(e) => !isMasked && handleReservaClick(r, e)}
                          className={`col-span-1 border rounded-2xl p-3 flex flex-col justify-between min-h-[70px] transition-all relative ${
                            isMasked
                              ? 'bg-slate-900/30 border-slate-900 text-slate-500 cursor-not-allowed select-none opacity-60'
                              : isOwner
                              ? 'bg-indigo-500/10 border-indigo-500/30 hover:border-indigo-400/60 cursor-pointer'
                              : isSystemAdmin
                              ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-400/60 cursor-pointer'
                              : 'bg-emerald-950/20 border-emerald-900/40 hover:border-emerald-800/60 cursor-pointer'
                          }`}
                        >
                          {/* Contenido Reserva */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-start gap-1">
                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                isMasked
                                  ? 'bg-slate-950 text-slate-650'
                                  : isOwner
                                  ? 'bg-indigo-500/20 text-indigo-455'
                                  : 'bg-emerald-500/20 text-emerald-400'
                              }`}>
                                {isMasked ? 'Ocupado' : r.grado === 0 ? 'Gral' : `${r.grado}° "${r.seccion}"`}
                              </span>
                              
                              {!isReadOnly && (isOwner || isSystemAdmin) && !isMasked && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteReserva(r.idReserva);
                                  }}
                                  className="text-slate-500 hover:text-rose-455 transition-colors p-0.5 rounded cursor-pointer"
                                  title="Anular reserva"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            
                            <p className="text-[10px] font-bold text-slate-200 truncate leading-tight mt-1">
                              {r.motivo}
                            </p>
                          </div>

                          {/* Info Docente */}
                          {!isMasked && (
                            <div className="flex items-center gap-1 mt-2 border-t border-slate-800/40 pt-1.5 text-[9px] text-slate-500 font-semibold truncate">
                              <User className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{r.docenteNombre} {r.docenteApellidos.split(' ')[0]}</span>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // Celda Vacía
                    return (
                      <div
                        key={dIdx}
                        onClick={() => handleCellClick(day, period)}
                        className={`col-span-1 border border-slate-900 bg-slate-950/20 rounded-2xl p-3 min-h-[70px] flex items-center justify-center transition-all group ${
                          isReadOnly 
                            ? 'cursor-default' 
                            : 'hover:border-slate-800 hover:bg-slate-900/20 cursor-pointer active:scale-98'
                        }`}
                      >
                        {!isReadOnly && (
                          <Plus className="w-4 h-4 text-slate-700 group-hover:text-emerald-400 transition-colors opacity-0 group-hover:opacity-100" />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Leyenda */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl flex flex-wrap gap-4 text-[10px] font-bold uppercase text-slate-500 justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-950/40 border border-slate-900"></span>
          Celda Libre
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-indigo-500/20 border border-indigo-500/30"></span>
          Mis Reservas
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-500/10 border border-emerald-500/30"></span>
          Reservas Otras Secciones
        </span>
        {currentUser.rol === 'DOCENTE' && (
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-900/30 border border-slate-900 opacity-60"></span>
            Horas Ocupadas (Externo)
          </span>
        )}
      </div>

      {/* MODAL: REGISTRAR RESERVA */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Reservar Aula AIP</h3>
                <p className="text-xs text-slate-400">Complete los datos de la sesión pedagógica.</p>
              </div>
            </div>

            <form onSubmit={handleCreateReserva} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Fecha</label>
                  <input
                    type="date"
                    required
                    readOnly
                    value={formFecha}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase">Período de Clase</label>
                  <select
                    value={formPeriodo}
                    onChange={(e) => setFormPeriodo(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    {PERIODS.filter(p => !p.isBreak).map(p => (
                      <option key={p.num} value={p.num}>{p.name} ({p.start} - {p.end})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selector tipo de reserva (Solo CIST) */}
              {(currentUser.rol === 'CIST' || currentUser.rol === 'PIP') && (
                <div className="flex items-center gap-2 bg-slate-950/30 p-2.5 rounded-xl border border-slate-850">
                  <input 
                    type="checkbox"
                    id="isGeneralEvent"
                    checked={isGeneralEvent}
                    onChange={(e) => {
                      setIsGeneralEvent(e.target.checked);
                      if (e.target.checked) {
                        setFormCursoId('');
                        setFormMotivo('');
                      } else if (cursos.length > 0) {
                        setFormCursoId(cursos[0].idCurso);
                        setFormGrado(cursos[0].grado);
                        setFormSeccion(cursos[0].seccion);
                      }
                    }}
                    className="w-3.5 h-3.5 accent-emerald-500 cursor-pointer"
                  />
                  <label htmlFor="isGeneralEvent" className="text-[10px] font-bold text-slate-300 uppercase cursor-pointer select-none">
                    Evento Administrativo / General (Sin curso asignado)
                  </label>
                </div>
              )}

              {/* Si es evento general */}
              {isGeneralEvent ? (
                <div className="space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Docente / Responsable</label>
                    <select
                      value={formDocenteId}
                      onChange={(e) => setFormDocenteId(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {docentesTodos.map((doc) => (
                        <option key={doc.idUsuario} value={doc.idUsuario}>
                          {doc.apellidos}, {doc.nombres} ({doc.rol})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Motivo / Título de Actividad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Reunión Colegiada, Mantenimiento de Equipos"
                      value={formMotivo}
                      onChange={(e) => setFormMotivo(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              ) : (
                /* Si es reserva normal de curso */
                <div className="space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Seleccione Asignatura / Curso</label>
                    {loadingCursos ? (
                      <div className="py-2 text-xs text-slate-500 flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                        Cargando asignaturas...
                      </div>
                    ) : cursos.length === 0 ? (
                      <div className="p-3 bg-rose-950/15 border border-rose-900/30 text-rose-450 text-xs rounded-xl flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>No tiene cursos registrados asignados en el sistema.</span>
                      </div>
                    ) : (
                      <select
                        value={formCursoId}
                        onChange={handleCursoChange}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        {cursos.map((c) => (
                          <option key={c.idCurso} value={c.idCurso}>
                            {c.nombre} - {c.grado}° "{c.seccion}" ({c.nrc})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Grado</label>
                      <input
                        type="text"
                        readOnly
                        value={formGrado}
                        className="w-full bg-slate-950/40 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-450 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-450 uppercase">Sección</label>
                      <input
                        type="text"
                        readOnly
                        value={formSeccion}
                        className="w-full bg-slate-950/40 border border-slate-900 rounded-xl px-3 py-2 text-xs text-slate-450 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-450 uppercase">Tema de Clase / Actividad</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Sesión Scratch, Exposición de diapositivas"
                      value={formMotivo}
                      onChange={(e) => setFormMotivo(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={creandoReserva || (!isGeneralEvent && cursos.length === 0)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold py-3.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 text-xs"
              >
                {creandoReserva ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                ) : (
                  <span>Registrar Reserva</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VER DETALLES DE RESERVA */}
      {showDetailsModal && selectedReservaDetalles && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-4">
            <button 
              onClick={() => setShowDetailsModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Detalles de la Reserva</h3>
                <p className="text-xs text-slate-450 uppercase font-semibold">{selectedReservaDetalles.aulaNombre}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs bg-slate-950/40 p-4 rounded-2xl border border-slate-900">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Docente Responsable</span>
                <span className="text-slate-200 font-semibold">{selectedReservaDetalles.docenteNombre} {selectedReservaDetalles.docenteApellidos}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Grado y Sección</span>
                  <span className="text-slate-200 font-semibold">
                    {selectedReservaDetalles.grado === 0 ? 'General / Administrativo' : `${selectedReservaDetalles.grado}° "${selectedReservaDetalles.seccion}"`}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Fecha Agendada</span>
                  <span className="text-slate-200 font-semibold font-mono">{selectedReservaDetalles.fecha}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Hora Inicio</span>
                  <span className="text-emerald-450 font-semibold font-mono">{selectedReservaDetalles.horaInicio.substring(0, 5)}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Hora Fin</span>
                  <span className="text-emerald-450 font-semibold font-mono">{selectedReservaDetalles.horaFin.substring(0, 5)}</span>
                </div>
              </div>

              <div className="space-y-0.5 pt-1 border-t border-slate-900">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Tema / Actividad</span>
                <span className="text-slate-200 font-bold block bg-slate-900/60 p-2 rounded-xl border border-slate-800/40 mt-1 leading-tight">
                  {selectedReservaDetalles.motivo}
                </span>
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex gap-2">
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-350 hover:text-slate-100 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer text-center"
              >
                Cerrar
              </button>
              {(selectedReservaDetalles.idDocente === currentUser.idUsuario || currentUser.rol === 'CIST' || currentUser.rol === 'PIP') && (
                <button 
                  onClick={() => handleDeleteReserva(selectedReservaDetalles.idReserva)}
                  className="flex-1 bg-rose-500/10 hover:bg-rose-500 text-rose-455 hover:text-slate-950 border border-rose-500/20 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Anular Reserva</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

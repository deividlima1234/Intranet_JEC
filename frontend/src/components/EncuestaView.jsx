import { useState, useEffect, useRef } from 'react';
import {
  ClipboardList, ChevronRight, ChevronLeft, CheckCircle, AlertTriangle,
  BarChart2, Users, Download, FileText, ToggleLeft, ToggleRight,
  Plus, Trash2, RefreshCw, Lock, Eye, PieChart, FileSpreadsheet,
  BookOpen, Cpu, Globe, Zap, Star, MessageSquare, Printer
} from 'lucide-react';

// ============================================================
// DEFINICIÓN COMPLETA DE LA ENCUESTA (6 secciones)
// ============================================================
const SURVEY_SECTIONS = [
  {
    id: 'seccion1',
    titulo: 'Sección I: Perfil del Usuario y Carga Académica',
    descripcion: 'Relaciona los requerimientos con tu área curricular específica.',
    icon: BookOpen,
    color: 'emerald',
    preguntas: [
      {
        id: 'q1',
        texto: '¿Cuál es tu área curricular principal que dictas en el presente año escolar?',
        tipo: 'radio',
        requerida: true,
        opciones: [
          { valor: 'MATEMATICA', etiqueta: 'Matemática' },
          { valor: 'COMUNICACION', etiqueta: 'Comunicación' },
          { valor: 'CIENCIA_TECNOLOGIA', etiqueta: 'Ciencia y Tecnología (CyT)' },
          { valor: 'CIENCIAS_SOCIALES', etiqueta: 'Ciencias Sociales' },
          { valor: 'DPCC', etiqueta: 'Desarrollo Personal, Ciudadanía y Cívica (DPCC)' },
          { valor: 'INGLES', etiqueta: 'Inglés' },
          { valor: 'EPT', etiqueta: 'Educación para el Trabajo (EPT)' },
          { valor: 'ARTE_CULTURA', etiqueta: 'Arte y Cultura' },
          { valor: 'EDUCACION_FISICA', etiqueta: 'Educación Física' },
          { valor: 'EDUCACION_RELIGIOSA', etiqueta: 'Educación Religiosa' },
          { valor: 'TUTORIA', etiqueta: 'Tutoría / Orientación Educativa' },
          { valor: 'ADMINISTRATIVO', etiqueta: 'Personal Administrativo (no dicto cursos)' },
        ],
      },
      {
        id: 'q2',
        texto: '¿Cuántas horas a la semana inviertes en tareas administrativas (llenado de registros, reportes UGEL, promedios) que podrían automatizarse?',
        tipo: 'radio',
        requerida: true,
        opciones: [
          { valor: 'MENOS_2H', etiqueta: 'Menos de 2 horas' },
          { valor: 'ENTRE_2_5H', etiqueta: 'Entre 2 y 5 horas' },
          { valor: 'MAS_5H', etiqueta: 'Más de 5 horas' },
        ],
      },
    ],
  },
  {
    id: 'seccion2',
    titulo: 'Sección II: Herramientas Pedagógicas por Área',
    descripcion: 'Define el roadmap de los componentes interactivos. Las preguntas se adaptan a tu área.',
    icon: Cpu,
    color: 'blue',
    preguntas: [
      {
        id: 'q3',
        texto: '(Para CyT y Matemática) Si el sistema integrara simuladores virtuales sin internet, ¿qué tipo priorizarías?',
        tipo: 'checkbox',
        requerida: false,
        areasAplicables: ['CIENCIA_TECNOLOGIA', 'MATEMATICA'],
        opciones: [
          { valor: 'SIM_FISICA', etiqueta: 'Simuladores de Física (Mecánica, Circuitos eléctricos)' },
          { valor: 'SIM_QUIMICA', etiqueta: 'Simuladores de Química (Balanceo, Estados de materia)' },
          { valor: 'SIM_GEOMETRIA', etiqueta: 'Geometría dinámica y graficación (tipo GeoGebra)' },
          { valor: 'NO_APLICA', etiqueta: 'No aplica a mi área' },
        ],
      },
      {
        id: 'q4',
        texto: '(Para Letras: Comunicación, CCSS, DPCC) ¿Qué dinámica digital enriquecería más el debate y comprensión lectora?',
        tipo: 'radio',
        requerida: false,
        areasAplicables: ['COMUNICACION', 'CIENCIAS_SOCIALES', 'DPCC'],
        opciones: [
          { valor: 'PIZARRA_COLABORATIVA', etiqueta: 'Pizarras colaborativas (estudiantes envían notas a la pantalla)' },
          { valor: 'LINEA_TIEMPO', etiqueta: 'Líneas de tiempo interactivas' },
          { valor: 'FOROS_ASINCRONOS', etiqueta: 'Foros de discusión asíncronos con calificación integrada' },
          { valor: 'MAPAS_CONCEPTUALES', etiqueta: 'Mapas conceptuales digitales' },
          { valor: 'NO_APLICA', etiqueta: 'No aplica a mi área' },
        ],
      },
      {
        id: 'q5',
        texto: '(Para Inglés) ¿Qué recurso offline considera más urgente implementar?',
        tipo: 'radio',
        requerida: false,
        areasAplicables: ['INGLES'],
        opciones: [
          { valor: 'LAB_AUDIOS', etiqueta: 'Laboratorio de audios (reproducción sincronizada para Listening)' },
          { valor: 'FILL_BLANKS', etiqueta: 'Ejercicios interactivos de completar espacios (Fill in the blanks)' },
          { valor: 'FLASHCARDS', etiqueta: 'Tarjetas de vocabulario visual (Flashcards)' },
          { valor: 'NO_APLICA', etiqueta: 'No aplica a mi área' },
        ],
      },
      {
        id: 'q6',
        texto: '(Para EPT y Arte) ¿Qué capacidad de almacenamiento de proyectos requeriría por estudiante al bimestre?',
        tipo: 'radio',
        requerida: false,
        areasAplicables: ['EPT', 'ARTE_CULTURA'],
        opciones: [
          { valor: 'ARCHIVOS_LIGEROS', etiqueta: 'Archivos ligeros (Documentos, código fuente) — Hasta 10MB' },
          { valor: 'ARCHIVOS_MULTIMEDIA', etiqueta: 'Archivos multimedia (Imágenes HD, audio) — Hasta 50MB' },
          { valor: 'NO_APLICA', etiqueta: 'No aplica a mi área' },
        ],
      },
    ],
  },
  {
    id: 'seccion3',
    titulo: 'Sección III: Gamificación y Evaluación',
    descripcion: 'Valida la viabilidad del módulo de evaluaciones en tiempo real (WebSockets).',
    icon: Zap,
    color: 'amber',
    preguntas: [
      {
        id: 'q7',
        texto: '¿Qué formato prefiere proyectar a los estudiantes en una evaluación rápida de 10 minutos?',
        tipo: 'radio',
        requerida: true,
        opciones: [
          { valor: 'TRIVIA_COMPETITIVA', etiqueta: 'Cuestionario tipo "Trivia" competitivo (con cronómetro y puntajes en vivo)' },
          { valor: 'CUESTIONARIO_INDIVIDUAL', etiqueta: 'Cuestionario individual de opción múltiple (silencioso y asíncrono)' },
          { valor: 'ENTREGABLES_RAPIDOS', etiqueta: 'Entregables rápidos (subir foto de resolución de problema)' },
        ],
      },
      {
        id: 'q8',
        texto: '¿Qué tipo de insignias o "logros digitales" motivarían más a tus estudiantes?',
        tipo: 'checkbox',
        requerida: false,
        opciones: [
          { valor: 'PARTICIPACION_ACTIVA', etiqueta: '"Participación Activa" (Por intervenciones)' },
          { valor: 'PENSAMIENTO_CRITICO', etiqueta: '"Pensamiento Crítico" (Por buenas resoluciones o debates)' },
          { valor: 'TRABAJO_EQUIPO', etiqueta: '"Trabajo en Equipo" (Por dinámicas grupales)' },
          { valor: 'PUNTUALIDAD', etiqueta: '"Puntualidad Absoluta" (En entrega de trabajos)' },
        ],
      },
    ],
  },
  {
    id: 'seccion4',
    titulo: 'Sección IV: Punto de Dolor Principal',
    descripcion: 'Identifica requerimientos no mapeados — tu voz directa al equipo CIST.',
    icon: MessageSquare,
    color: 'rose',
    preguntas: [
      {
        id: 'q9',
        texto: 'Describe brevemente un procedimiento o dinámica de tu clase que actualmente realizas en pizarra, cuaderno o papel impreso, y que desearías que los estudiantes pudieran resolver directamente en sus computadoras dentro de la Intranet.',
        tipo: 'textarea',
        requerida: false,
        placeholder: 'Ej: "Actualmente aplico dictados en papel y luego los corrijo manualmente uno a uno. Me gustaría que el sistema los corrigiera automáticamente mostrando el puntaje al instante..."',
      },
    ],
  },
  {
    id: 'seccion5',
    titulo: 'Sección V: Conectividad y Usabilidad',
    descripcion: 'Ayúdanos a entender la experiencia de uso actual del sistema.',
    icon: Globe,
    color: 'purple',
    preguntas: [
      {
        id: 'q10',
        texto: '¿Con qué frecuencia tus estudiantes tienen problemas para conectarse al sistema Intranet?',
        tipo: 'radio',
        requerida: true,
        opciones: [
          { valor: 'NUNCA', etiqueta: 'Nunca — el sistema funciona correctamente siempre' },
          { valor: 'A_VECES', etiqueta: 'A veces (1–2 veces por semana)' },
          { valor: 'FRECUENTEMENTE', etiqueta: 'Frecuentemente (más de 3 veces por semana)' },
        ],
      },
      {
        id: 'q11',
        texto: '¿Qué dispositivos usan principalmente tus estudiantes en el Aula de Innovación?',
        tipo: 'radio',
        requerida: true,
        opciones: [
          { valor: 'SOLO_PCS', etiqueta: 'Solo PCs / Laptops del aula' },
          { valor: 'CELULARES_PROPIOS', etiqueta: 'Celulares propios de los estudiantes' },
          { valor: 'AMBOS', etiqueta: 'Ambos (PCs del aula + celulares)' },
        ],
      },
      {
        id: 'q12',
        texto: '¿Qué tan cómodo te sientes usando la Intranet actual para tus clases? (1 = Muy difícil, 5 = Muy fácil)',
        tipo: 'escala',
        requerida: true,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    id: 'seccion6',
    titulo: 'Sección VI: Priorización de Módulos Futuros',
    descripcion: 'Indica qué funcionalidades consideras más urgentes para el próximo desarrollo.',
    icon: Star,
    color: 'indigo',
    preguntas: [
      {
        id: 'q13',
        texto: '¿Cuál de los siguientes módulos considera más urgente implementar? (Selecciona hasta 3 opciones prioritarias)',
        tipo: 'checkbox_max3',
        requerida: false,
        opciones: [
          { valor: 'BANCO_PREGUNTAS', etiqueta: '📝 Banco de Preguntas y Exámenes digitales' },
          { valor: 'COMUNICADOS_DIGITAL', etiqueta: '📢 Comunicados y Circulares digitales (reemplazar papel)' },
          { valor: 'PORTAFOLIO_DIGITAL', etiqueta: '🗂️ Portafolio digital del estudiante' },
          { valor: 'CHAT_MENSAJERIA', etiqueta: '💬 Chat/Mensajería entre docentes y coordinadores' },
          { valor: 'BIBLIOTECA_DIGITAL', etiqueta: '📚 Biblioteca digital offline (PDFs, videos)' },
          { valor: 'ANECDOTARIO_DIGITAL', etiqueta: '📖 Registro de anecdotario digital' },
          { valor: 'ASISTENCIA_BIOMETRICA', etiqueta: '🔍 Asistencia biométrica o facial' },
          { valor: 'TUTORIA_VIRTUAL', etiqueta: '🎓 Módulo de Tutoría y seguimiento de estudiantes' },
        ],
      },
    ],
  },
];

const COLOR_MAP = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', ring: 'ring-emerald-500', activeBg: 'bg-emerald-500', badge: 'bg-emerald-950/60 text-emerald-400 border-emerald-900/60' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', ring: 'ring-blue-500', activeBg: 'bg-blue-500', badge: 'bg-blue-950/60 text-blue-400 border-blue-900/60' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', ring: 'ring-amber-500', activeBg: 'bg-amber-500', badge: 'bg-amber-950/60 text-amber-400 border-amber-900/60' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', ring: 'ring-rose-500', activeBg: 'bg-rose-500', badge: 'bg-rose-950/60 text-rose-400 border-rose-900/60' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', ring: 'ring-purple-500', activeBg: 'bg-purple-500', badge: 'bg-purple-950/60 text-purple-400 border-purple-900/60' },
  indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30', ring: 'ring-indigo-500', activeBg: 'bg-indigo-500', badge: 'bg-indigo-950/60 text-indigo-400 border-indigo-900/60' },
};

const AREA_LABELS = {
  MATEMATICA: 'Matemática', COMUNICACION: 'Comunicación', CIENCIA_TECNOLOGIA: 'Ciencia y Tecnología',
  CIENCIAS_SOCIALES: 'Ciencias Sociales', DPCC: 'DPCC', INGLES: 'Inglés', EPT: 'Ed. para el Trabajo',
  ARTE_CULTURA: 'Arte y Cultura', EDUCACION_FISICA: 'Educación Física', EDUCACION_RELIGIOSA: 'Ed. Religiosa',
  TUTORIA: 'Tutoría', ADMINISTRATIVO: 'Administrativo',
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function EncuestaView({ currentUser, scrollContainer }) {
  const rol = currentUser?.rol || '';
  const esCIST = rol === 'CIST';
  const esPIP = rol === 'PIP';
  const esAdmin = esCIST || esPIP;

  if (esAdmin) {
    return <EncuestaPanelAdmin currentUser={currentUser} esCIST={esCIST} scrollContainer={scrollContainer} />;
  }
  return <EncuestaFormUsuario currentUser={currentUser} scrollContainer={scrollContainer} />;
}

// ============================================================
// PANEL DE ADMINISTRACIÓN (CIST / PIP)
// ============================================================
function EncuestaPanelAdmin({ currentUser, esCIST }) {
  const [encuestas, setEncuestas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [loadingResultados, setLoadingResultados] = useState(false);
  const [showCrear, setShowCrear] = useState(false);
  const [creandoForm, setCreandoForm] = useState({ titulo: '', descripcion: '', rolesHabilitados: 'DOCENTE,AUXILIAR,ADMINISTRATIVO,PIP' });
  const [creandoLoading, setCreandoLoading] = useState(false);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);
  const printRef = useRef();

  const cargarEncuestas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/encuestas');
      const data = await res.json();
      setEncuestas(data);
      if (data.length > 0 && !selectedId) setSelectedId(data[0].idEncuesta);
    } catch {
      setError('Error al cargar encuestas del servidor.');
    } finally {
      setLoading(false);
    }
  };

  const cargarResultados = async (id) => {
    setLoadingResultados(true);
    setResultados(null);
    try {
      const res = await fetch(`/api/v1/encuestas/${id}/resultados`);
      const data = await res.json();
      setResultados(data);
    } catch {
      setError('Error al cargar resultados.');
    } finally {
      setLoadingResultados(false);
    }
  };

  useEffect(() => { cargarEncuestas(); }, []);

  useEffect(() => {
    if (selectedId) cargarResultados(selectedId);
  }, [selectedId]);

  const handleToggle = async (id, activa) => {
    try {
      await fetch(`/api/v1/encuestas/${id}/estado?activa=${!activa}`, { method: 'PATCH' });
      await cargarEncuestas();
      if (selectedId === id) await cargarResultados(id);
    } catch { setError('Error al cambiar estado.'); }
  };

  const handleEliminar = async (id) => {
    if (!confirm('¿Eliminar esta encuesta y todas sus respuestas?')) return;
    try {
      await fetch(`/api/v1/encuestas/${id}`, { method: 'DELETE' });
      setSelectedId(null);
      setResultados(null);
      await cargarEncuestas();
    } catch { setError('Error al eliminar.'); }
  };

  const handleCrear = async (e) => {
    e.preventDefault();
    setCreandoLoading(true);
    try {
      await fetch('/api/v1/encuestas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...creandoForm, dniCreador: currentUser?.dni }),
      });
      setShowCrear(false);
      setCreandoForm({ titulo: '', descripcion: '', rolesHabilitados: 'DOCENTE,AUXILIAR,ADMINISTRATIVO,PIP' });
      await cargarEncuestas();
    } catch { setError('Error al crear encuesta.'); } finally { setCreandoLoading(false); }
  };

  const handleExportarCSV = async () => {
    if (!selectedId) return;
    setExportando(true);
    try {
      const res = await fetch(`/api/v1/encuestas/${selectedId}/exportar-csv`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `encuesta_resultados_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { setError('Error al exportar CSV.'); } finally { setExportando(false); }
  };

  const handleExportarPDF = () => {
    window.print();
  };

  const encuestaActual = encuestas.find(e => e.idEncuesta === selectedId);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-emerald-400" />
            Panel de Encuestas CIST
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {esCIST ? 'Administra y analiza las encuestas de levantamiento de requerimientos.' : 'Visualiza los resultados de las encuestas institucionales.'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {esCIST && (
            <button
              onClick={() => setShowCrear(true)}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Nueva Encuesta
            </button>
          )}
          {selectedId && (
            <>
              <button
                onClick={handleExportarCSV}
                disabled={exportando}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95"
              >
                <FileSpreadsheet className="w-4 h-4 text-green-400" />
                Excel / CSV
              </button>
              <button
                onClick={handleExportarPDF}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95 print:hidden"
              >
                <Printer className="w-4 h-4 text-rose-400" />
                PDF / Imprimir
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-950/30 text-rose-400 border border-rose-900/50 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-rose-300 hover:text-rose-100 cursor-pointer">✕</button>
        </div>
      )}

      {/* Modal Crear Encuesta */}
      {showCrear && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-100">Nueva Encuesta de Requerimientos</h3>
            <form onSubmit={handleCrear} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Título de la Encuesta</label>
                <input
                  type="text" required
                  value={creandoForm.titulo}
                  onChange={e => setCreandoForm(p => ({...p, titulo: e.target.value}))}
                  placeholder="Ej: Levantamiento de Requerimientos CIST - Fase 2"
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Descripción</label>
                <textarea
                  value={creandoForm.descripcion}
                  onChange={e => setCreandoForm(p => ({...p, descripcion: e.target.value}))}
                  rows={3}
                  placeholder="Descripción del objetivo de la encuesta..."
                  className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Roles Habilitados para Responder</label>
                <div className="flex flex-wrap gap-2">
                  {['DOCENTE', 'AUXILIAR', 'ADMINISTRATIVO', 'PIP'].map(r => (
                    <label key={r} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={creandoForm.rolesHabilitados.includes(r)}
                        onChange={e => {
                          const roles = creandoForm.rolesHabilitados.split(',').filter(Boolean);
                          const next = e.target.checked ? [...roles, r] : roles.filter(x => x !== r);
                          setCreandoForm(p => ({...p, rolesHabilitados: next.join(',')}));
                        }}
                        className="accent-emerald-500"
                      />
                      <span className="text-xs text-slate-300">{r}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-1">CIST siempre puede ver los resultados sin responder.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCrear(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold cursor-pointer transition-all">Cancelar</button>
                <button type="submit" disabled={creandoLoading} className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-sm font-bold cursor-pointer transition-all">
                  {creandoLoading ? 'Creando...' : 'Crear Encuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" /></div>
      ) : encuestas.length === 0 ? (
        <div className="text-center py-20 space-y-3">
          <ClipboardList className="w-16 h-16 text-slate-700 mx-auto" />
          <p className="text-slate-400">No hay encuestas creadas aún.</p>
          {esCIST && <button onClick={() => setShowCrear(true)} className="text-emerald-400 text-sm hover:underline cursor-pointer">+ Crear primera encuesta</button>}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de encuestas */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Encuestas Creadas</h3>
            {encuestas.map(enc => (
              <div
                key={enc.idEncuesta}
                onClick={() => setSelectedId(enc.idEncuesta)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedId === enc.idEncuesta ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-200 truncate">{enc.titulo}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{enc.fechaCreacion} · {enc.totalRespuestas} resp.</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${enc.activa ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
                      {enc.activa ? 'ACTIVA' : 'INACTIVA'}
                    </span>
                  </div>
                </div>
                {esCIST && (
                  <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={ev => { ev.stopPropagation(); handleToggle(enc.idEncuesta, enc.activa); }}
                      className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer transition-all ${enc.activa ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                    >
                      {enc.activa ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                      {enc.activa ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={ev => { ev.stopPropagation(); handleEliminar(enc.idEncuesta); }}
                      className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-all"
                    >
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Panel de resultados */}
          <div className="lg:col-span-2" ref={printRef}>
            {loadingResultados ? (
              <div className="flex items-center justify-center py-20"><RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" /></div>
            ) : resultados ? (
              <ResultadosPanel resultados={resultados} encuestaActual={encuestaActual} />
            ) : (
              <div className="flex items-center justify-center py-20 text-slate-500">
                <p>Selecciona una encuesta para ver sus resultados.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PANEL DE RESULTADOS (gráficas SVG + respondentes)
// ============================================================
function ResultadosPanel({ resultados, encuestaActual }) {
  const { totalRespuestas, estadisticas, respuestasLibres, respondentes } = resultados;
  const [tabActivo, setTabActivo] = useState('graficas');

  // Mapeo de preguntas para mostrar labels amigables
  const PREGUNTA_LABELS = {
    'seccion1_q1': 'Área Curricular Principal',
    'seccion1_q2': 'Horas en Tareas Administrativas',
    'seccion2_q3': 'Simuladores Virtuales (CyT/Mat.)',
    'seccion2_q4': 'Dinámica Digital para Letras',
    'seccion2_q5': 'Recurso Offline para Inglés',
    'seccion2_q6': 'Almacenamiento EPT/Arte',
    'seccion3_q7': 'Formato de Evaluación Rápida',
    'seccion3_q8': 'Tipos de Insignias Motivadoras',
    'seccion5_q10': 'Frecuencia de Problemas de Conectividad',
    'seccion5_q11': 'Dispositivos de Estudiantes',
    'seccion5_q12': 'Comodidad con la Intranet (1-5)',
    'seccion6_q13': 'Módulos Futuros Prioritarios',
  };

  const OPCION_LABELS = {
    MATEMATICA: 'Matemática', COMUNICACION: 'Comunicación', CIENCIA_TECNOLOGIA: 'CyT',
    CIENCIAS_SOCIALES: 'CCSS', DPCC: 'DPCC', INGLES: 'Inglés', EPT: 'EPT',
    ARTE_CULTURA: 'Arte', EDUCACION_FISICA: 'Ed. Física', EDUCACION_RELIGIOSA: 'Ed. Religiosa',
    TUTORIA: 'Tutoría', ADMINISTRATIVO: 'Administrativo',
    MENOS_2H: '<2h', ENTRE_2_5H: '2–5h', MAS_5H: '>5h',
    SIM_FISICA: 'Física', SIM_QUIMICA: 'Química', SIM_GEOMETRIA: 'Geometría', NO_APLICA: 'No aplica',
    PIZARRA_COLABORATIVA: 'Pizarra Col.', LINEA_TIEMPO: 'Línea Tiempo', FOROS_ASINCRONOS: 'Foros', MAPAS_CONCEPTUALES: 'Mapas',
    LAB_AUDIOS: 'Lab. Audios', FILL_BLANKS: 'Fill Blanks', FLASHCARDS: 'Flashcards',
    ARCHIVOS_LIGEROS: '≤10MB', ARCHIVOS_MULTIMEDIA: '≤50MB',
    TRIVIA_COMPETITIVA: 'Trivia', CUESTIONARIO_INDIVIDUAL: 'Individual', ENTREGABLES_RAPIDOS: 'Entregables',
    PARTICIPACION_ACTIVA: 'Participación', PENSAMIENTO_CRITICO: 'Pensamiento', TRABAJO_EQUIPO: 'Equipo', PUNTUALIDAD: 'Puntualidad',
    NUNCA: 'Nunca', A_VECES: 'A veces', FRECUENTEMENTE: 'Frecuente',
    SOLO_PCS: 'Solo PCs', CELULARES_PROPIOS: 'Celulares', AMBOS: 'Ambos',
    BANCO_PREGUNTAS: 'Exámenes', COMUNICADOS_DIGITAL: 'Comunicados', PORTAFOLIO_DIGITAL: 'Portafolio',
    CHAT_MENSAJERIA: 'Mensajería', BIBLIOTECA_DIGITAL: 'Biblioteca', ANECDOTARIO_DIGITAL: 'Anecdotario',
    ASISTENCIA_BIOMETRICA: 'Biometría', TUTORIA_VIRTUAL: 'Tutoría Virtual',
  };

  const CHART_COLORS = ['#10b981','#3b82f6','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#f97316','#84cc16','#ec4899','#6366f1','#14b8a6','#a855f7'];

  return (
    <div className="space-y-6">
      {/* Header de resultados */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-100 text-lg">{resultados.encuesta?.titulo}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{resultados.encuesta?.descripcion}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-3xl font-black text-emerald-400">{totalRespuestas}</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold">Respuestas</p>
            </div>
            <div className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${resultados.encuesta?.activa ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900' : 'bg-slate-800 text-slate-500 border-slate-700'}`}>
              {resultados.encuesta?.activa ? '● ACTIVA' : '○ INACTIVA'}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(resultados.encuesta?.rolesHabilitados || '').split(',').map(r => (
            <span key={r} className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">{r}</span>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900/40 border border-slate-800 rounded-xl p-1">
        {[
          { id: 'graficas', label: 'Gráficas', icon: BarChart2 },
          { id: 'respuestasLibres', label: `Respuestas Libres (${respuestasLibres?.length || 0})`, icon: MessageSquare },
          { id: 'respondentes', label: `Respondentes (${respondentes?.length || 0})`, icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setTabActivo(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${tabActivo === tab.id ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido Tabs */}
      {tabActivo === 'graficas' && (
        <div className="space-y-6">
          {totalRespuestas === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <BarChart2 className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p>No hay respuestas aún. Las gráficas aparecerán aquí cuando los usuarios completen la encuesta.</p>
            </div>
          ) : Object.entries(estadisticas).map(([key, conteo]) => {
            const label = PREGUNTA_LABELS[key] || key;
            const entries = Object.entries(conteo).sort((a, b) => b[1] - a[1]);
            const maxVal = Math.max(...entries.map(([,v]) => v));

            return (
              <div key={key} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
                <h4 className="text-sm font-bold text-slate-200 mb-4">{label}</h4>
                <div className="space-y-2.5">
                  {entries.map(([opcion, count], idx) => {
                    const pct = Math.round((count / totalRespuestas) * 100);
                    const color = CHART_COLORS[idx % CHART_COLORS.length];
                    return (
                      <div key={opcion}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium truncate max-w-[70%]">{OPCION_LABELS[opcion] || opcion}</span>
                          <span className="text-slate-400 font-bold ml-2">{count} <span className="text-slate-600">({pct}%)</span></span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-5 overflow-hidden">
                          <div
                            className="h-5 rounded-full flex items-center justify-end pr-2 transition-all duration-700"
                            style={{ width: `${maxVal > 0 ? (count / maxVal) * 100 : 0}%`, backgroundColor: color }}
                          >
                            {pct > 10 && <span className="text-[9px] font-black text-white/90">{pct}%</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tabActivo === 'respuestasLibres' && (
        <div className="space-y-3">
          {!respuestasLibres || respuestasLibres.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p>No hay respuestas libres registradas aún.</p>
            </div>
          ) : respuestasLibres.map((texto, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx + 1}</span>
                <p className="text-sm text-slate-300 leading-relaxed">"{texto}"</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {tabActivo === 'respondentes' && (
        <div className="space-y-2 overflow-x-auto">
          {!respondentes || respondentes.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p>No hay respondentes aún.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-2 px-3 text-slate-500 font-bold uppercase">Nombres</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-bold uppercase">DNI</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-bold uppercase">Rol</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-bold uppercase">Área</th>
                  <th className="text-left py-2 px-3 text-slate-500 font-bold uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {respondentes.map((r, idx) => (
                  <tr key={r.idRespuesta} className={`border-b border-slate-800/50 ${idx % 2 === 0 ? 'bg-slate-950/20' : ''}`}>
                    <td className="py-2 px-3 text-slate-200 font-medium">{r.nombres} {r.apellidos}</td>
                    <td className="py-2 px-3 text-slate-400 font-mono">{r.dni}</td>
                    <td className="py-2 px-3">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">{r.rol}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{AREA_LABELS[r.areaCurricular] || r.areaCurricular || '—'}</td>
                    <td className="py-2 px-3 text-slate-500">{r.fechaRespuesta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// FORMULARIO MULTI-PASO PARA DOCENTES Y OTROS ROLES
// ============================================================
function EncuestaFormUsuario({ currentUser, scrollContainer }) {
  const [encuestaActiva, setEncuestaActiva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yaRespondio, setYaRespondio] = useState(false);
  const [miRespuesta, setMiRespuesta] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(null);

  // Respuestas del formulario
  const [respuestas, setRespuestas] = useState({});
  const [seccionActual, setSeccionActual] = useState(0);

  const rol = currentUser?.rol || '';
  const areaCurricular = currentUser?.areaCurricular || '';

  // Filtrar secciones con preguntas relevantes para el usuario
  const seccionesFiltradas = SURVEY_SECTIONS.filter(seccion => {
    // La sección siempre tiene al menos una pregunta visible para el usuario
    const preguntasVisibles = seccion.preguntas.filter(p => esPreguntaVisible(p, areaCurricular));
    return preguntasVisibles.length > 0;
  });

  function esPreguntaVisible(pregunta, area) {
    if (!pregunta.areasAplicables) return true;
    if (!area) return true; // sin área registrada, mostramos todo
    return pregunta.areasAplicables.includes(area);
  }

  // Scroll al tope del contenedor principal al cambiar de sección
  useEffect(() => {
    if (scrollContainer?.current) {
      // Scroll directo sobre el elemento overflow-y-auto (el <main> de App.jsx)
      scrollContainer.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [seccionActual]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await fetch(`/api/v1/encuestas/activa?rol=${rol}`);
        const data = await res.json();
        if (data.idEncuesta) {
          setEncuestaActiva(data);
          // Verificar si ya respondió
          const resR = await fetch(`/api/v1/encuestas/${data.idEncuesta}/mi-respuesta?dniUsuario=${currentUser.dni}`);
          const dataR = await resR.json();
          if (dataR.idRespuesta) {
            setYaRespondio(true);
            setMiRespuesta(dataR);
          }
        }
      } catch {
        setError('Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [rol]);

  const handleRadio = (seccion, pregunta, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [seccion]: { ...prev[seccion], [pregunta]: valor }
    }));
  };

  const handleCheckbox = (seccion, pregunta, valor, checked, maxItems = 99) => {
    setRespuestas(prev => {
      const actual = prev[seccion]?.[pregunta] || [];
      let siguiente;
      if (checked) {
        if (actual.length >= maxItems) return prev;
        siguiente = [...actual, valor];
      } else {
        siguiente = actual.filter(v => v !== valor);
      }
      return { ...prev, [seccion]: { ...prev[seccion], [pregunta]: siguiente } };
    });
  };

  const handleTextarea = (seccion, pregunta, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [seccion]: { ...prev[seccion], [pregunta]: valor }
    }));
  };

  const handleEscala = (seccion, pregunta, valor) => {
    setRespuestas(prev => ({
      ...prev,
      [seccion]: { ...prev[seccion], [pregunta]: valor }
    }));
  };

  const seccionData = seccionesFiltradas[seccionActual];
  const esUltimaSeccion = seccionActual === seccionesFiltradas.length - 1;

  const puedeAvanzar = () => {
    if (!seccionData) return false;
    const preguntasRequeridas = seccionData.preguntas.filter(p => p.requerida && esPreguntaVisible(p, areaCurricular));
    return preguntasRequeridas.every(p => {
      const val = respuestas[seccionData.id]?.[p.id];
      if (p.tipo === 'radio' || p.tipo === 'escala') return val !== undefined && val !== null && val !== '';
      if (p.tipo === 'checkbox' || p.tipo === 'checkbox_max3') return val && val.length > 0;
      return true;
    });
  };

  const handleEnviar = async () => {
    setEnviando(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/encuestas/${encuestaActiva.idEncuesta}/responder?dniUsuario=${currentUser.dni}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(respuestas),
      });
      if (res.ok) {
        setEnviado(true);
        setYaRespondio(true);
      } else {
        const err = await res.json();
        setError(err.message || 'Error al enviar respuestas.');
      }
    } catch {
      setError('Error de red al conectar con el servidor.');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  // Pantalla de éxito
  if (enviado || (yaRespondio && !miRespuesta)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100">¡Gracias por tu participación!</h2>
        <p className="text-slate-400 max-w-md">Tu respuesta ha sido registrada correctamente. El equipo CIST utilizará tu aporte para priorizar el desarrollo de nuevas herramientas en la Intranet.</p>
      </div>
    );
  }

  // Ya respondió — mostrar su respuesta
  if (yaRespondio && miRespuesta) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">Ya has completado esta encuesta</h2>
            <p className="text-xs text-slate-400">Respondida el {miRespuesta.fechaRespuesta} — Gracias por tu aporte.</p>
          </div>
        </div>
        <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-6 text-sm text-slate-300 space-y-2">
          <p className="font-semibold text-emerald-400">Resumen de tu respuesta:</p>
          <p><span className="text-slate-500">Área Curricular:</span> {AREA_LABELS[miRespuesta.areaCurricular] || miRespuesta.areaCurricular || '—'}</p>
          <p><span className="text-slate-500">Rol:</span> {miRespuesta.rol}</p>
          <p className="text-xs text-slate-600 mt-4">Solo puedes responder una vez. Si necesitas modificar tu respuesta, contacta al coordinador CIST.</p>
        </div>
      </div>
    );
  }

  // Sin encuesta activa
  if (!encuestaActiva) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
          <Lock className="w-8 h-8 text-slate-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-400">No hay encuesta activa disponible</h2>
        <p className="text-slate-500 max-w-md text-sm">El coordinador CIST activará una encuesta cuando esté disponible para tu rol. Vuelve a revisar más tarde.</p>
      </div>
    );
  }

  const progresoPct = ((seccionActual + 1) / seccionesFiltradas.length) * 100;
  const colores = seccionData ? COLOR_MAP[seccionData.color] : COLOR_MAP.emerald;
  const SeccionIcon = seccionData?.icon || ClipboardList;

  return (
    <div className="flex flex-col gap-5 animate-fadeIn max-w-3xl mx-auto w-full">
      {/* Cabecera */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-slate-100">{encuestaActiva.titulo}</h2>
        </div>
        {encuestaActiva.descripcion && (
          <p className="text-xs text-slate-400">{encuestaActiva.descripcion}</p>
        )}
        {areaCurricular && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-900/60 text-emerald-400 text-[10px] font-bold">
            <Eye className="w-3 h-3" />
            Encuesta adaptada para: {AREA_LABELS[areaCurricular] || areaCurricular}
          </div>
        )}
      </div>

      {/* Indicador de progreso */}
      <div>
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span className="font-semibold">Sección {seccionActual + 1} de {seccionesFiltradas.length}</span>
          <span>{Math.round(progresoPct)}% completado</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all duration-500 bg-emerald-500"
            style={{ width: `${progresoPct}%` }}
          />
        </div>
      </div>


      {/* Tarjeta de la sección */}
      {seccionData && (
        <div className={`border rounded-2xl overflow-hidden ${colores.border}`}>
          {/* Header de sección */}
          <div className={`${colores.bg} p-5 border-b ${colores.border}`}>
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl ${colores.bg} border ${colores.border}`}>
                <SeccionIcon className={`w-5 h-5 ${colores.text}`} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">{seccionData.titulo}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{seccionData.descripcion}</p>
              </div>
            </div>
          </div>

          {/* Preguntas */}
          <div className="p-5 space-y-8">
            {seccionData.preguntas
              .filter(p => esPreguntaVisible(p, areaCurricular))
              .map((pregunta, pIdx) => {
                const valor = respuestas[seccionData.id]?.[pregunta.id];

                return (
                  <div key={pregunta.id} className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className={`shrink-0 w-6 h-6 rounded-full ${colores.bg} ${colores.text} text-[10px] font-black flex items-center justify-center border ${colores.border}`}>
                        {pIdx + 1}
                      </span>
                      <p className="text-sm font-semibold text-slate-200 leading-relaxed">
                        {pregunta.texto}
                        {pregunta.requerida && <span className="text-rose-400 ml-1">*</span>}
                      </p>
                    </div>

                    {/* Radio */}
                    {pregunta.tipo === 'radio' && (
                      <div className="ml-8 space-y-2">
                        {pregunta.opciones.map(op => (
                          <label key={op.valor} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-950/40 group"
                            style={{ borderColor: valor === op.valor ? 'rgba(16,185,129,0.5)' : 'rgba(51,65,85,0.5)', backgroundColor: valor === op.valor ? 'rgba(16,185,129,0.08)' : 'transparent' }}>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${valor === op.valor ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600 group-hover:border-slate-400'}`}>
                              {valor === op.valor && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <input type="radio" className="sr-only" value={op.valor} checked={valor === op.valor} onChange={() => handleRadio(seccionData.id, pregunta.id, op.valor)} />
                            <span className={`text-sm ${valor === op.valor ? 'text-slate-100 font-semibold' : 'text-slate-300'}`}>{op.etiqueta}</span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Checkbox */}
                    {(pregunta.tipo === 'checkbox' || pregunta.tipo === 'checkbox_max3') && (
                      <div className="ml-8 space-y-2">
                        {pregunta.tipo === 'checkbox_max3' && (
                          <p className="text-[10px] text-slate-500 mb-2">Selecciona hasta 3 opciones. Seleccionadas: {(valor || []).length}/3</p>
                        )}
                        {pregunta.opciones.map(op => {
                          const checked = (valor || []).includes(op.valor);
                          const maxItems = pregunta.tipo === 'checkbox_max3' ? 3 : 99;
                          const disabled = !checked && (valor || []).length >= maxItems;
                          return (
                            <label key={op.valor} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-950/40'}`}
                              style={{ borderColor: checked ? 'rgba(16,185,129,0.5)' : 'rgba(51,65,85,0.5)', backgroundColor: checked ? 'rgba(16,185,129,0.08)' : 'transparent' }}>
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${checked ? 'border-emerald-500 bg-emerald-500' : 'border-slate-600'}`}>
                                {checked && <span className="text-white text-[8px] font-black">✓</span>}
                              </div>
                              <input type="checkbox" className="sr-only" checked={checked} disabled={disabled} onChange={e => handleCheckbox(seccionData.id, pregunta.id, op.valor, e.target.checked, maxItems)} />
                              <span className={`text-sm ${checked ? 'text-slate-100 font-semibold' : 'text-slate-300'}`}>{op.etiqueta}</span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {/* Textarea */}
                    {pregunta.tipo === 'textarea' && (
                      <div className="ml-8">
                        <textarea
                          rows={5}
                          value={valor || ''}
                          onChange={e => handleTextarea(seccionData.id, pregunta.id, e.target.value)}
                          placeholder={pregunta.placeholder}
                          className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none transition-all"
                        />
                        <p className="text-[10px] text-slate-600 mt-1">{(valor || '').length} caracteres</p>
                      </div>
                    )}

                    {/* Escala */}
                    {pregunta.tipo === 'escala' && (
                      <div className="ml-8">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-500 w-16">{pregunta.min === 1 ? 'Muy difícil' : pregunta.min}</span>
                          <div className="flex gap-2 flex-1 justify-center">
                            {Array.from({ length: pregunta.max - pregunta.min + 1 }, (_, i) => pregunta.min + i).map(n => (
                              <button
                                key={n}
                                onClick={() => handleEscala(seccionData.id, pregunta.id, String(n))}
                                className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all cursor-pointer ${valor == n ? `${colores.activeBg} border-transparent text-white` : 'border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 bg-slate-900/40'}`}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                          <span className="text-xs text-slate-500 w-16 text-right">{pregunta.max === 5 ? 'Muy fácil' : pregunta.max}</span>
                        </div>
                        {valor && (
                          <p className="text-center text-xs text-emerald-400 mt-2 font-semibold">
                            Seleccionaste: {valor} / {pregunta.max}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-rose-950/30 text-rose-400 border border-rose-900/50 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Navegación */}
      <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        <button
          onClick={() => setSeccionActual(p => p - 1)}
          disabled={seccionActual === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 rounded-xl text-sm font-semibold transition-all cursor-pointer active:scale-95"
        >
          <ChevronLeft className="w-4 h-4" />
          Anterior
        </button>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-slate-500 font-semibold">{seccionActual + 1} / {seccionesFiltradas.length}</span>
          <div className="flex gap-1.5">
            {seccionesFiltradas.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i < seccionActual ? 'bg-emerald-500' : i === seccionActual ? 'bg-emerald-400 scale-125' : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>

        {!esUltimaSeccion ? (
          <button
            onClick={() => setSeccionActual(p => p + 1)}
            disabled={!puedeAvanzar()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleEnviar}
            disabled={enviando || !puedeAvanzar()}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 rounded-xl text-sm font-bold transition-all cursor-pointer active:scale-95"
          >
            {enviando ? (
              <><RefreshCw className="w-4 h-4 animate-spin" /> Enviando...</>
            ) : (
              <><CheckCircle className="w-4 h-4" /> Enviar Respuestas</>
            )}
          </button>
        )}
      </div>

    </div>
  );
}

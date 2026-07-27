import { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Upload, Download, Trash2, Search, RefreshCw,
  FileText, FileImage, File, CheckSquare, Square, Users,
  ShieldCheck, AlertTriangle, X, CheckCircle,
  MessageSquare, PlusCircle, Clock, Loader2, Send, Eye
} from 'lucide-react';
import ConfirmationModal from './ConfirmationModal';
import DocumentViewerModal from './DocumentViewerModal';

const ROLES_DISPONIBLES = [
  { id: 'TODOS', label: 'Todos los roles' },
  { id: 'CIST', label: 'CIST' },
  { id: 'PIP', label: 'PIP' },
  { id: 'DOCENTE', label: 'Docente' },
  { id: 'ADMINISTRATIVO', label: 'Administrativo' },
  { id: 'AUXILIAR', label: 'Auxiliar' },
  { id: 'ESTUDIANTE', label: 'Estudiante' },
];

function getFileIcon(tipoContenido) {
  if (!tipoContenido) return <File className="w-4 h-4 text-slate-400" />;
  if (tipoContenido.startsWith('image/')) return <FileImage className="w-4 h-4 text-purple-400" />;
  if (tipoContenido === 'application/pdf') return <FileText className="w-4 h-4 text-rose-400" />;
  if (tipoContenido.includes('word') || tipoContenido.includes('document')) return <FileText className="w-4 h-4 text-blue-400" />;
  if (tipoContenido.includes('excel') || tipoContenido.includes('spreadsheet')) return <FileText className="w-4 h-4 text-emerald-400" />;
  if (tipoContenido.includes('presentation') || tipoContenido.includes('powerpoint')) return <FileText className="w-4 h-4 text-orange-400" />;
  return <File className="w-4 h-4 text-slate-400" />;
}

function formatBytes(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatFecha(fechaStr) {
  if (!fechaStr) return '—';
  return new Date(fechaStr).toLocaleString('es-PE', { dateStyle: 'short', timeStyle: 'short' });
}

function RolBadge({ rolesVisibles }) {
  if (!rolesVisibles) return null;
  const isTodos = rolesVisibles.toUpperCase() === 'TODOS';
  if (isTodos) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-900/40">
        <Users className="w-2.5 h-2.5" />Todos
      </span>
    );
  }
  const roles = rolesVisibles.split(',').map(r => r.trim()).filter(Boolean);
  return (
    <div className="flex flex-wrap gap-1">
      {roles.map(r => (
        <span key={r} className="inline-block px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-sky-950/60 text-sky-400 border border-sky-900/40">
          {r}
        </span>
      ))}
    </div>
  );
}

export default function DocumentosView({ currentUser }) {
  const isAdmin = currentUser?.rol === 'CIST' || currentUser?.rol === 'PIP';

  // Subpestaña activa: 'manuales' o 'soporte'
  const [activeSubTab, setActiveSubTab] = useState('manuales');

  // ==========================================
  // ESTADOS PESTAÑA 1: MANUALES Y DOCUMENTOS
  // ==========================================
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [rolesSeleccionados, setRolesSeleccionados] = useState(['TODOS']);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null); // { type: 'success'|'error', text }
  const fileInputRef = useRef(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Estados para Previsualizador de Documentos
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');
  const [viewerName, setViewerName] = useState('');

  // ==========================================
  // ESTADOS PESTAÑA 2: INCIDENCIAS Y SOPORTE
  // ==========================================
  const [incidencias, setIncidencias] = useState([]);
  const [loadingIncidencias, setLoadingIncidencias] = useState(false);
  const [incidenciaSearch, setIncidenciaSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS'); // TODOS, PENDIENTE, EN_PROCESO, RESUELTO
  const [showIncidenciaForm, setShowIncidenciaForm] = useState(false);
  const [incidenciaTitulo, setIncidenciaTitulo] = useState('');
  const [incidenciaDescripcion, setIncidenciaDescripcion] = useState('');
  const [incidenciaTipo, setIncidenciaTipo] = useState('SUGERENCIA'); // INCIDENCIA, SUGERENCIA
  const [savingIncidencia, setSavingIncidencia] = useState(false);
  
  // Responder Incidencia (Admin)
  const [responderIncidencia, setResponderIncidencia] = useState(null);
  const [respuestaSoporte, setRespuestaSoporte] = useState('');
  const [estadoIncidencia, setEstadoIncidencia] = useState('PENDIENTE');
  const [savingIncidenciaRespuesta, setSavingIncidenciaRespuesta] = useState(false);

  // Mensaje general de feedback para incidencias
  const [incidenciaMsg, setIncidenciaMsg] = useState(null); // { type: 'success'|'error', text }

  useEffect(() => {
    fetchDocumentos();
    fetchIncidencias();
  }, [currentUser]);

  // ==========================================
  // FUNCIONES PESTAÑA 1: MANUALES
  // ==========================================
  const fetchDocumentos = async () => {
    setLoading(true);
    try {
      const url = isAdmin
        ? '/api/v1/documentos/todos'
        : `/api/v1/documentos?rol=${currentUser?.rol || 'TODOS'}`;
      const res = await fetch(url);
      if (res.ok) {
        setDocumentos(await res.json());
      }
    } catch (err) {
      console.error('Error al obtener documentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRol = (rolId) => {
    if (rolId === 'TODOS') {
      setRolesSeleccionados(['TODOS']);
      return;
    }
    setRolesSeleccionados(prev => {
      const sinTodos = prev.filter(r => r !== 'TODOS');
      if (sinTodos.includes(rolId)) {
        const result = sinTodos.filter(r => r !== rolId);
        return result.length === 0 ? ['TODOS'] : result;
      }
      return [...sinTodos, rolId];
    });
  };

  const handleSubirDocumento = async (e) => {
    e.preventDefault();
    if (!archivoSeleccionado || !titulo.trim()) return;

    if (!currentUser?.idUsuario) {
      setUploadMsg({ type: 'error', text: 'Error de sesión: no se pudo identificar al usuario.' });
      return;
    }

    setUploading(true);
    setUploadMsg(null);

    const formData = new FormData();
    formData.append('file', archivoSeleccionado);
    formData.append('titulo', titulo.trim());
    if (descripcion.trim()) formData.append('descripcion', descripcion.trim());
    formData.append('rolesVisibles', rolesSeleccionados.join(','));
    formData.append('idAutor', currentUser.idUsuario);

    try {
      const res = await fetch('/api/v1/documentos', { method: 'POST', body: formData });
      if (res.ok) {
        setUploadMsg({ type: 'success', text: 'Documento subido exitosamente.' });
        setTitulo('');
        setDescripcion('');
        setRolesSeleccionados(['TODOS']);
        setArchivoSeleccionado(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setShowForm(false);
        fetchDocumentos();
      } else {
        const err = await res.text();
        setUploadMsg({ type: 'error', text: `Error al subir: ${err}` });
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: 'Error de conexión al servidor.' });
    } finally {
      setUploading(false);
    }
  };

  const handleEliminar = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/v1/documentos/${deleteTarget.idDocumento}`, { method: 'DELETE' });
      if (res.ok) {
        setDocumentos(prev => prev.filter(d => d.idDocumento !== deleteTarget.idDocumento));
      }
    } catch (err) {
      console.error('Error al eliminar documento:', err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDescargar = (doc) => {
    window.open(`/api/v1/documentos/${doc.idDocumento}/descargar`, '_blank');
  };

  const filtrados = documentos.filter(d =>
    d.titulo.toLowerCase().includes(search.toLowerCase()) ||
    (d.descripcion || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.nombreArchivo || '').toLowerCase().includes(search.toLowerCase())
  );

  // ==========================================
  // FUNCIONES PESTAÑA 2: INCIDENCIAS
  // ==========================================
  const fetchIncidencias = async () => {
    if (!currentUser?.idUsuario) return;
    setLoadingIncidencias(true);
    try {
      const res = await fetch(`/api/v1/incidencias?idUsuario=${currentUser.idUsuario}&rol=${currentUser.rol}`);
      if (res.ok) {
        setIncidencias(await res.json());
      }
    } catch (err) {
      console.error('Error al obtener incidencias:', err);
    } finally {
      setLoadingIncidencias(false);
    }
  };

  const handleCrearIncidencia = async (e) => {
    e.preventDefault();
    if (!incidenciaTitulo.trim() || !incidenciaDescripcion.trim() || !incidenciaTipo) return;

    if (!currentUser?.idUsuario) {
      setIncidenciaMsg({ type: 'error', text: 'Error de sesión: no se pudo identificar al usuario.' });
      return;
    }

    setSavingIncidencia(true);
    setIncidenciaMsg(null);

    const payload = {
      titulo: incidenciaTitulo.trim(),
      descripcion: incidenciaDescripcion.trim(),
      tipo: incidenciaTipo,
      idAutor: currentUser.idUsuario
    };

    try {
      const res = await fetch('/api/v1/incidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIncidenciaMsg({ type: 'success', text: 'Reporte/Sugerencia enviado con éxito.' });
        setIncidenciaTitulo('');
        setIncidenciaDescripcion('');
        setIncidenciaTipo('SUGERENCIA');
        setShowIncidenciaForm(false);
        fetchIncidencias();
      } else {
        const err = await res.text();
        setIncidenciaMsg({ type: 'error', text: `Error al registrar: ${err}` });
      }
    } catch (err) {
      setIncidenciaMsg({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setSavingIncidencia(false);
    }
  };

  const handleResponderIncidencia = async (e) => {
    e.preventDefault();
    if (!respuestaSoporte.trim() || !estadoIncidencia || !responderIncidencia) return;

    if (!currentUser?.idUsuario) return;

    setSavingIncidenciaRespuesta(true);
    setIncidenciaMsg(null);

    const payload = {
      estado: estadoIncidencia,
      respuestaSoporte: respuestaSoporte.trim(),
      idAtendidoPor: currentUser.idUsuario
    };

    try {
      const res = await fetch(`/api/v1/incidencias/${responderIncidencia.idIncidencia}/atender`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIncidenciaMsg({ type: 'success', text: 'Respuesta de soporte guardada correctamente.' });
        setRespuestaSoporte('');
        setResponderIncidencia(null);
        fetchIncidencias();
      } else {
        const err = await res.text();
        setIncidenciaMsg({ type: 'error', text: `Error al responder: ${err}` });
      }
    } catch (err) {
      setIncidenciaMsg({ type: 'error', text: 'Error de conexión con el servidor.' });
    } finally {
      setSavingIncidenciaRespuesta(false);
    }
  };

  const handleEliminarIncidencia = async (idIncidencia) => {
    if (!window.confirm('¿Está seguro de que desea eliminar permanentemente este reporte?')) return;
    try {
      const res = await fetch(`/api/v1/incidencias/${idIncidencia}`, { method: 'DELETE' });
      if (res.ok) {
        setIncidencias(prev => prev.filter(i => i.idIncidencia !== idIncidencia));
        setIncidenciaMsg({ type: 'success', text: 'Reporte eliminado correctamente.' });
      } else {
        setIncidenciaMsg({ type: 'error', text: 'No se pudo eliminar el reporte.' });
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  const filtradosIncidencias = incidencias.filter(i => {
    const matchesEstado = filtroEstado === 'TODOS' || i.estado === filtroEstado;
    const matchesSearch = i.titulo.toLowerCase().includes(incidenciaSearch.toLowerCase()) ||
                          i.descripcion.toLowerCase().includes(incidenciaSearch.toLowerCase()) ||
                          (i.nombreAutor || '').toLowerCase().includes(incidenciaSearch.toLowerCase());
    return matchesEstado && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="border-b border-slate-800 pb-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            Documentación y Ayuda
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {activeSubTab === 'manuales'
              ? (isAdmin
                  ? 'Sube y gestiona manuales del sistema. Controla qué roles pueden acceder a cada documento.'
                  : 'Consulta y descarga los manuales y recursos disponibles para tu perfil.')
              : 'Envía tus recomendaciones, consultas o reporta fallas en la plataforma para que el soporte local te asista.'}
          </p>
        </div>
        <div className="flex gap-2">
          {activeSubTab === 'manuales' ? (
            <>
              <button
                id="btn-refresh-manuales"
                onClick={fetchDocumentos}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              {isAdmin && (
                <button
                  id="btn-subir-documento"
                  onClick={() => { setShowForm(v => !v); setUploadMsg(null); }}
                  className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Subir Documento
                </button>
              )}
            </>
          ) : (
            <>
              <button
                id="btn-refresh-incidencias"
                onClick={fetchIncidencias}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingIncidencias ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
              <button
                id="btn-reportar-incidencia"
                onClick={() => { setShowIncidenciaForm(v => !v); setIncidenciaMsg(null); }}
                className="flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Crear Reporte / Sugerencia
              </button>
            </>
          )}
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div className="flex gap-2 border-b border-slate-800 pb-px">
        <button
          id="btn-subtab-manuales"
          onClick={() => { setActiveSubTab('manuales'); setIncidenciaMsg(null); setUploadMsg(null); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'manuales'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Manuales y Recursos
        </button>
        <button
          id="btn-subtab-soporte"
          onClick={() => { setActiveSubTab('soporte'); setIncidenciaMsg(null); setUploadMsg(null); fetchIncidencias(); }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'soporte'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Soporte e Incidencias
        </button>
      </div>

      {/* VISTA 1: MANUALES */}
      {activeSubTab === 'manuales' && (
        <div className="space-y-6">
          {/* Mensaje de estado upload */}
          {uploadMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium ${
              uploadMsg.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                : 'bg-rose-950/40 border-rose-900/50 text-rose-400'
            }`}>
              {uploadMsg.type === 'success'
                ? <CheckCircle className="w-4 h-4 shrink-0" />
                : <AlertTriangle className="w-4 h-4 shrink-0" />}
              {uploadMsg.text}
              <button onClick={() => setUploadMsg(null)} className="ml-auto cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {/* Formulario de Subida - Solo Admin */}
          {isAdmin && showForm && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                Subir Nuevo Documento
              </h3>
              <form onSubmit={handleSubirDocumento} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Título */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Título *</label>
                    <input
                      type="text"
                      value={titulo}
                      onChange={e => setTitulo(e.target.value)}
                      required
                      placeholder="Ej. Manual de uso del sistema"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  {/* Archivo */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Archivo *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      required
                      onChange={e => setArchivoSeleccionado(e.target.files[0] || null)}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 focus:outline-none focus:border-emerald-500 file:mr-3 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-emerald-500/20 file:text-emerald-400 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Descripción */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Descripción (opcional)</label>
                  <textarea
                    value={descripcion}
                    onChange={e => setDescripcion(e.target.value)}
                    placeholder="Breve descripción del contenido del documento..."
                    rows={2}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Selector de Roles */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Roles que pueden ver este documento *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ROLES_DISPONIBLES.map(rol => {
                      const isTodosMode = rolesSeleccionados.includes('TODOS');
                      const isSelected = isTodosMode
                        ? rol.id === 'TODOS'
                        : rolesSeleccionados.includes(rol.id);
                      return (
                        <button
                          key={rol.id}
                          type="button"
                          onClick={() => handleToggleRol(rol.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400'
                              : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-300'
                          }`}
                        >
                          {isSelected
                            ? <CheckSquare className="w-3 h-3" />
                            : <Square className="w-3 h-3" />}
                          {rol.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-slate-500">
                    Seleccionado: <span className="text-emerald-400 font-semibold">{rolesSeleccionados.join(', ')}</span>
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !titulo.trim() || !archivoSeleccionado}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    {uploading ? 'Subiendo...' : 'Subir Documento'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por título, descripción o nombre de archivo..."
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Listado de documentos */}
          {loading ? (
            <div className="py-20 flex justify-center">
              <RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
          ) : filtrados.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-500">
              <BookOpen className="w-10 h-10 opacity-30" />
              <p className="text-sm">
                {documentos.length === 0
                  ? 'No hay documentos disponibles.'
                  : 'No se encontraron resultados para tu búsqueda.'}
              </p>
            </div>
          ) : isAdmin ? (
            /* Vista Administrador: tabla */
            <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40">
                      <th className="text-left px-4 py-3 text-slate-500 font-semibold uppercase text-[10px]">Documento</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-semibold uppercase text-[10px] hidden md:table-cell">Roles</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-semibold uppercase text-[10px] hidden lg:table-cell">Autor</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-semibold uppercase text-[10px] hidden lg:table-cell">Fecha</th>
                      <th className="text-left px-4 py-3 text-slate-500 font-semibold uppercase text-[10px] hidden md:table-cell">Tamaño</th>
                      <th className="text-right px-4 py-3 text-slate-500 font-semibold uppercase text-[10px]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtrados.map((doc, idx) => (
                      <tr
                        key={doc.idDocumento}
                        className={`border-b border-slate-800/60 hover:bg-slate-900/40 transition-colors ${idx % 2 === 0 ? '' : 'bg-slate-950/10'}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {getFileIcon(doc.tipoContenido)}
                            <div>
                              <p className="text-slate-200 font-semibold truncate max-w-[180px]">{doc.titulo}</p>
                              {doc.descripcion && (
                                <p className="text-slate-500 text-[10px] truncate max-w-[180px]">{doc.descripcion}</p>
                              )}
                              <p className="text-slate-600 font-mono text-[9px] truncate max-w-[180px]">{doc.nombreArchivo}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <RolBadge rolesVisibles={doc.rolesVisibles} />
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-slate-400 text-[10px]">{doc.nombreAutor || '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell text-slate-500 text-[10px] font-mono">{formatFecha(doc.fechaSubida)}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-slate-500 font-mono text-[10px]">{formatBytes(doc.tamanoArchivo)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setViewerUrl(`/api/v1/documentos/${doc.idDocumento}/descargar`);
                                setViewerName(doc.nombreArchivo);
                                setViewerOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-indigo-400 hover:bg-indigo-500/10 cursor-pointer transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDescargar(doc)}
                              className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-500/10 cursor-pointer transition-colors"
                              title="Descargar"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(doc)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-slate-800/60">
                <p className="text-[10px] text-slate-600">{filtrados.length} documento(s) encontrado(s)</p>
              </div>
            </div>
          ) : (
            /* Vista Otros Roles: tarjetas */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtrados.map(doc => (
                <div
                  key={doc.idDocumento}
                  className="bg-slate-900/30 border border-slate-800 rounded-2xl p-4 space-y-3 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-slate-800 rounded-xl shrink-0">
                      {getFileIcon(doc.tipoContenido)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-100 truncate">{doc.titulo}</p>
                      {doc.descripcion && (
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5 line-clamp-2">{doc.descripcion}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-slate-600 font-mono">{formatBytes(doc.tamanoArchivo)}</p>
                      <p className="text-[9px] text-slate-600">{formatFecha(doc.fechaSubida)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setViewerUrl(`/api/v1/documentos/${doc.idDocumento}/descargar`);
                          setViewerName(doc.nombreArchivo);
                          setViewerOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-slate-950 rounded-xl text-[10px] font-bold border border-indigo-900/30 cursor-pointer transition-all active:scale-95"
                        title="Visualizar documento"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Visualizar</span>
                      </button>
                      <button
                        onClick={() => handleDescargar(doc)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded-xl text-[10px] font-bold border border-emerald-900/30 cursor-pointer transition-all active:scale-95"
                      >
                        <Download className="w-3 h-3" />
                        Descargar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: SOPORTE E INCIDENCIAS */}
      {activeSubTab === 'soporte' && (
        <div className="space-y-6">
          {/* Mensaje de estado incidencias */}
          {incidenciaMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium ${
              incidenciaMsg.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400'
                : 'bg-rose-950/40 border-rose-900/50 text-rose-400'
            }`}>
              {incidenciaMsg.type === 'success'
                ? <CheckCircle className="w-4 h-4 shrink-0" />
                : <AlertTriangle className="w-4 h-4 shrink-0" />}
              {incidenciaMsg.text}
              <button onClick={() => setIncidenciaMsg(null)} className="ml-auto cursor-pointer"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}

          {/* Formulario de reporte */}
          {showIncidenciaForm && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Crear Nuevo Reporte o Recomendación
              </h3>
              <form onSubmit={handleCrearIncidencia} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Tipo de reporte */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Tipo de Reporte *</label>
                    <select
                      id="select-incidencia-tipo"
                      value={incidenciaTipo}
                      onChange={e => setIncidenciaTipo(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="SUGERENCIA">Recomendación / Sugerencia</option>
                      <option value="INCIDENCIA">Falla / Error de Sistema</option>
                    </select>
                  </div>
                  {/* Título */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-slate-400">Asunto / Título Breve *</label>
                    <input
                      id="input-incidencia-titulo"
                      type="text"
                      value={incidenciaTitulo}
                      onChange={e => setIncidenciaTitulo(e.target.value)}
                      required
                      placeholder="Ej. Habilitar comentarios en calificaciones"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Detalles */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Descripción Detallada *</label>
                  <textarea
                    id="textarea-incidencia-desc"
                    value={incidenciaDescripcion}
                    onChange={e => setIncidenciaDescripcion(e.target.value)}
                    required
                    placeholder="Describe detalladamente tu solicitud o la falla encontrada en la red local..."
                    rows={4}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-205 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {/* Acciones */}
                <div className="flex justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowIncidenciaForm(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 cursor-pointer transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    id="btn-enviar-incidencia"
                    type="submit"
                    disabled={savingIncidencia || !incidenciaTitulo.trim() || !incidenciaDescripcion.trim()}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
                  >
                    {savingIncidencia ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {savingIncidencia ? 'Enviando...' : 'Enviar Reporte'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Filtros e Incidencia Búsqueda */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                id="input-incidencia-buscar"
                type="text"
                value={incidenciaSearch}
                onChange={e => setIncidenciaSearch(e.target.value)}
                placeholder="Buscar reportes por asunto, descripción o autor..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            {/* Filtro de estado */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0">Estado:</span>
              <select
                id="select-filtro-estado"
                value={filtroEstado}
                onChange={e => setFiltroEstado(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-350 focus:outline-none focus:border-emerald-500"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="EN_PROCESO">En Proceso</option>
                <option value="RESUELTO">Resueltos</option>
              </select>
            </div>
          </div>

          {/* Lista de reportes */}
          {loadingIncidencias ? (
            <div className="py-20 flex justify-center">
              <RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
            </div>
          ) : filtradosIncidencias.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-slate-500">
              <MessageSquare className="w-10 h-10 opacity-30" />
              <p className="text-sm">
                {incidencias.length === 0
                  ? 'No has registrado ningún reporte de soporte aún.'
                  : 'No se encontraron reportes que coincidan con tu búsqueda.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filtradosIncidencias.map(item => (
                <div
                  key={item.idIncidencia}
                  className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all animate-fadeIn"
                >
                  {/* Card Header: Type Badge, Status Badge, Title */}
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Type badge */}
                      {item.tipo === 'INCIDENCIA' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-950/60 text-rose-400 border border-rose-900/40">
                          <AlertTriangle className="w-2.5 h-2.5" /> Falla / Error
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-950/60 text-indigo-400 border border-indigo-900/40">
                          <MessageSquare className="w-2.5 h-2.5" /> Recomendación
                        </span>
                      )}

                      {/* Status Badge */}
                      {item.estado === 'PENDIENTE' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock className="w-2.5 h-2.5 text-amber-400 shrink-0" /> Pendiente
                        </span>
                      )}
                      {item.estado === 'EN_PROCESO' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <RefreshCw className="w-2.5 h-2.5 text-sky-400 shrink-0 animate-spin" /> En Proceso
                        </span>
                      )}
                      {item.estado === 'RESUELTO' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-2.5 h-2.5 text-emerald-400 shrink-0" /> Resuelto
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatFecha(item.fechaCreacion)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-200">{item.titulo}</h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-line bg-slate-950/20 border border-slate-900/20 p-3 rounded-xl">{item.descripcion}</p>
                  </div>

                  {/* Informacion de autor si es Administrador */}
                  {isAdmin && (
                    <div className="flex items-center gap-1.5 pt-2 text-[10px] text-slate-500 border-t border-slate-800/40">
                      <span className="font-bold text-slate-400">Reportado por:</span>
                      <span className="text-slate-350">{item.nombreAutor}</span>
                      <span className="text-slate-500">({item.rolAutor})</span>
                    </div>
                  )}

                  {/* Sección de respuesta */}
                  {item.respuestaSoporte ? (
                    <div className="bg-emerald-950/20 border border-emerald-900/20 rounded-xl p-3.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-emerald-400 uppercase tracking-wider">Respuesta del Soporte Técnico</span>
                        <span className="text-slate-500 font-mono">{formatFecha(item.fechaRespuesta)}</span>
                      </div>
                      <p className="text-xs text-emerald-300/90 leading-relaxed whitespace-pre-line">{item.respuestaSoporte}</p>
                      {item.nombreAtendidoPor && (
                        <p className="text-[9px] text-slate-500 font-medium">
                          Atendido por: <span className="text-slate-450">{item.nombreAtendidoPor}</span>
                        </p>
                      )}
                    </div>
                  ) : (
                    !isAdmin && (
                      <div className="text-[10px] text-slate-500 bg-slate-950/20 border border-slate-900/40 rounded-xl p-3 text-center italic">
                        Aún no hay respuestas del equipo de soporte.
                      </div>
                    )
                  )}

                  {/* Acciones para Administrador */}
                  {isAdmin && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                      <button
                        onClick={() => {
                          setResponderIncidencia(item);
                          setRespuestaSoporte(item.respuestaSoporte || '');
                          setEstadoIncidencia(item.estado);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 rounded-xl text-[10px] font-bold border border-emerald-900/30 cursor-pointer transition-all active:scale-95"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        {item.respuestaSoporte ? 'Actualizar Respuesta' : 'Responder / Atender'}
                      </button>
                      <button
                        onClick={() => handleEliminarIncidencia(item.idIncidencia)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 cursor-pointer transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL PARA RESPONDER A INCIDENCIA (ADMIN) */}
      {responderIncidencia && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-5">
            <button
              onClick={() => { setResponderIncidencia(null); setRespuestaSoporte(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Encabezado del Modal */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Atender Reporte</h3>
                <p className="text-xs text-slate-400">Registra una respuesta técnica y actualiza el estado de la incidencia.</p>
              </div>
            </div>

            {/* Datos del reporte original */}
            <div className="bg-slate-950/45 border border-slate-850 p-4 rounded-2xl text-xs space-y-2">
              <div className="flex justify-between font-semibold text-slate-500 text-[9px] uppercase">
                <span>Detalles de Reporte</span>
                <span>Autor: {responderIncidencia.nombreAutor} ({responderIncidencia.rolAutor})</span>
              </div>
              <p className="font-bold text-slate-200 text-sm">{responderIncidencia.titulo}</p>
              <p className="text-slate-400 whitespace-pre-line leading-relaxed">{responderIncidencia.descripcion}</p>
            </div>

            {/* Formulario de respuesta */}
            <form onSubmit={handleResponderIncidencia} className="space-y-4">
              {/* Selección de estado */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Estado del Reporte *</label>
                <div className="flex gap-3">
                  {['PENDIENTE', 'EN_PROCESO', 'RESUELTO'].map(st => {
                    const label = st === 'PENDIENTE' ? 'Pendiente' : st === 'EN_PROCESO' ? 'En Proceso' : 'Resuelto';
                    const isSelected = estadoIncidencia === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setEstadoIncidencia(st)}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? (st === 'PENDIENTE' ? 'bg-amber-500/10 border-amber-500 text-amber-400'
                               : st === 'EN_PROCESO' ? 'bg-sky-500/10 border-sky-500 text-sky-400'
                               : 'bg-emerald-500/10 border-emerald-500 text-emerald-400')
                            : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-slate-350'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Respuesta soporte */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Respuesta / Resolución Técnica *</label>
                <textarea
                  id="textarea-respuesta-soporte"
                  required
                  value={respuestaSoporte}
                  onChange={e => setRespuestaSoporte(e.target.value)}
                  placeholder="Escribe la respuesta o explicación técnica para el usuario..."
                  rows={4}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Acciones */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setResponderIncidencia(null); setRespuestaSoporte(''); }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  id="btn-guardar-respuesta"
                  type="submit"
                  disabled={savingIncidenciaRespuesta || !respuestaSoporte.trim()}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-extrabold bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 cursor-pointer disabled:cursor-not-allowed transition-all active:scale-95"
                >
                  {savingIncidenciaRespuesta ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {savingIncidenciaRespuesta ? 'Guardando...' : 'Guardar Respuesta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación de documento */}
      <ConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleEliminar}
        title="Eliminar Documento"
        message={`¿Está seguro de que desea eliminar el documento "${deleteTarget?.titulo}"? Esta acción eliminará el archivo físico del servidor y no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal del Visualizador de Documentos */}
      <DocumentViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        fileUrl={viewerUrl}
        fileName={viewerName}
      />
    </div>
  );
}

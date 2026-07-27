import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Calendar, 
  User, 
  Users, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Search, 
  FileSpreadsheet, 
  Check, 
  AlertCircle, 
  Edit3, 
  Clock, 
  Save, 
  ChevronRight, 
  ListFilter, 
  RefreshCw,
  Info
} from 'lucide-react';

export default function AsistenciasView({ currentUser }) {
  const isStudent = currentUser?.rol === 'ESTUDIANTE';
  const hasAdminAccess = currentUser?.rol === 'AUXILIAR' || currentUser?.rol === 'CIST';

  // ================= ESTADOS GENERALES =================
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(isStudent ? 'historial' : 'control'); // 'control', 'reportes', 'configuracion', 'historial'

  // ================= ESTADOS DEL ESTUDIANTE =================
  const [studentHistory, setStudentHistory] = useState([]);
  const [studentStats, setStudentStats] = useState({
    puntual: 0,
    tardanza: 0,
    falta: 0,
    justificado: 0,
    ratio: 0
  });

  // ================= ESTADOS DEL AUXILIAR (CONTROL DIARIO) =================
  const [fechaControl, setFechaControl] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [gradoControl, setGradoControl] = useState((currentUser?.grado && currentUser.grado.toString()) || '1');
  const [seccionControl, setSeccionControl] = useState((currentUser?.seccion && currentUser.seccion.toUpperCase()) || 'A');
  const [alumnosControl, setAlumnosControl] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal de Justificación
  const [showExcuseModal, setShowExcuseModal] = useState(false);
  const [selectedAlumnoExcuse, setSelectedAlumnoExcuse] = useState(null); // { idEstudiante, nombres, apellidos, fecha }
  const [excuseText, setExcuseText] = useState('');
  const [excuseSubmitting, setExcuseSubmitting] = useState(false);

  // ================= ESTADOS DE REPORTES Y EXCEL =================
  const [fechaInicioRep, setFechaInicioRep] = useState(() => {
    const date = new Date();
    // Primer día del mes
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  });
  const [fechaFinRep, setFechaFinRep] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [gradoReporte, setGradoReporte] = useState('ALL');
  const [seccionReporte, setSeccionReporte] = useState('ALL');
  const [exportLoading, setExportLoading] = useState(false);

  // ================= ESTADOS DE CONFIGURACIÓN DE HORARIOS =================
  const [horaEntrada, setHoraEntrada] = useState('07:30:00');
  const [horaTolerancia, setHoraTolerancia] = useState('07:45:00');
  const [configSaving, setConfigSaving] = useState(false);
  const [configMessage, setConfigMessage] = useState(null); // { type, text }

  const [gradosSeccionesList, setGradosSeccionesList] = useState([]);

  const fetchGradosSecciones = async () => {
    try {
      const response = await fetch('/api/v1/usuarios/grados-secciones');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setGradosSeccionesList(data);
          return;
        }
      }
    } catch (e) {
      console.error("Error al obtener grados y secciones:", e);
    }
    // Fallback list
    const fallbackList = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B'];
    setGradosSeccionesList(fallbackList);
  };

  useEffect(() => {
    if (hasAdminAccess) {
      fetchGradosSecciones();
    }
  }, [currentUser]);

  const seccionOptions = React.useMemo(() => {
    return gradosSeccionesList
      .filter(gs => gs.substring(0, 1) === gradoControl)
      .map(gs => gs.substring(1));
  }, [gradosSeccionesList, gradoControl]);

  useEffect(() => {
    if (seccionOptions.length > 0 && !seccionOptions.includes(seccionControl)) {
      setSeccionControl(seccionOptions[0]);
    }
  }, [seccionOptions, seccionControl]);

  const seccionReporteOptions = React.useMemo(() => {
    if (gradoReporte === 'ALL') {
      const sections = new Set(gradosSeccionesList.map(gs => gs.substring(1)));
      return Array.from(sections).sort();
    } else {
      return gradosSeccionesList
        .filter(gs => gs.substring(0, 1) === gradoReporte)
        .map(gs => gs.substring(1));
    }
  }, [gradosSeccionesList, gradoReporte]);

  useEffect(() => {
    if (seccionReporte !== 'ALL' && seccionReporteOptions.length > 0 && !seccionReporteOptions.includes(seccionReporte)) {
      setSeccionReporte('ALL');
    }
  }, [seccionReporteOptions, seccionReporte]);

  // Cargar datos iniciales
  useEffect(() => {
    if (isStudent) {
      cargarHistorialEstudiante();
    } else if (hasAdminAccess) {
      cargarControlDiario();
      cargarConfiguracionHorarios();
    }
  }, [currentUser, activeTab]);

  // Recargar control diario si cambian filtros
  useEffect(() => {
    if (hasAdminAccess && activeTab === 'control') {
      cargarControlDiario();
    }
  }, [fechaControl, gradoControl, seccionControl]);

  // ================= MÉTODOS DE ESTUDIANTE =================
  const cargarHistorialEstudiante = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/asistencias/estudiante/${currentUser.idUsuario}`);
      if (response.ok) {
        const data = await response.json();
        setStudentHistory(data);
        
        // Calcular estadísticas
        let puntual = 0;
        let tardanza = 0;
        let falta = 0;
        let justificado = 0;
        
        data.forEach(asis => {
          if (asis.estado === 'PUNTUAL') puntual++;
          else if (asis.estado === 'TARDANZA') tardanza++;
          else if (asis.estado === 'FALTA') falta++;
          else if (asis.estado === 'JUSTIFICADO') justificado++;
        });

        const totalClases = data.length;
        const asistidos = puntual + tardanza;
        const ratio = totalClases > 0 ? Math.round((asistidos / totalClases) * 100) : 100;

        setStudentStats({ puntual, tardanza, falta, justificado, ratio });
      }
    } catch (err) {
      console.error("Error al cargar historial de estudiante:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= MÉTODOS DE CONTROL DIARIO =================
  const cargarControlDiario = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/asistencias/dia?fecha=${fechaControl}&grado=${gradoControl}&seccion=${encodeURIComponent(seccionControl.toUpperCase())}`);
      if (response.ok) {
        const data = await response.json();
        setAlumnosControl(data);
      }
    } catch (err) {
      console.error("Error al cargar control diario:", err);
    } finally {
      setLoading(false);
    }
  };

  const cargarConfiguracionHorarios = async () => {
    try {
      const response = await fetch('/api/v1/asistencias/configuracion');
      if (response.ok) {
        const data = await response.json();
        // Recortamos segundos sobrantes si vienen en el parse
        setHoraEntrada(data.horaEntrada.slice(0, 8));
        setHoraTolerancia(data.horaTolerancia.slice(0, 8));
      }
    } catch (err) {
      console.error("Error al cargar horarios:", err);
    }
  };

  // Guardar configuración de horarios
  const handleGuardarConfiguracion = async (e) => {
    e.preventDefault();
    setConfigSaving(true);
    setConfigMessage(null);

    // Asegurar formato HH:mm:ss
    const formatTime = (t) => t.length === 5 ? `${t}:00` : t;

    try {
      const response = await fetch('/api/v1/asistencias/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          horaEntrada: formatTime(horaEntrada),
          horaTolerancia: formatTime(horaTolerancia)
        })
      });

      if (response.ok) {
        setConfigMessage({ type: 'success', text: 'Configuración de horarios guardada exitosamente.' });
      } else {
        const errData = await response.json();
        setConfigMessage({ type: 'error', text: errData.message || 'Error al guardar los horarios.' });
      }
    } catch (err) {
      setConfigMessage({ type: 'error', text: 'Fallo de red al conectar con el servidor local.' });
    } finally {
      setConfigSaving(false);
    }
  };

  // Guardar cambio de estado individual manual
  const handleCambiarEstadoManual = async (idEstudiante, estado, actualAsis = null) => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/asistencias/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEstudiante,
          fecha: fechaControl,
          estado,
          observacion: actualAsis?.observacion || ''
        })
      });

      if (response.ok) {
        await cargarControlDiario();
      } else {
        alert("Error al actualizar la asistencia.");
      }
    } catch (err) {
      console.error("Error en cambio de asistencia manual:", err);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para justificar
  const openExcuseModal = (alumno) => {
    setSelectedAlumnoExcuse({
      idEstudiante: alumno.idEstudiante,
      nombres: alumno.nombres,
      apellidos: alumno.apellidos,
      fecha: fechaControl,
      observacionPrev: alumno.observacion || ''
    });
    setExcuseText(alumno.observacion || '');
    setShowExcuseModal(true);
  };

  // Guardar justificación
  const handleGuardarJustificacion = async (e) => {
    e.preventDefault();
    if (!selectedAlumnoExcuse) return;

    setExcuseSubmitting(true);
    try {
      const response = await fetch('/api/v1/asistencias/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idEstudiante: selectedAlumnoExcuse.idEstudiante,
          fecha: selectedAlumnoExcuse.fecha,
          estado: 'JUSTIFICADO',
          observacion: excuseText
        })
      });

      if (response.ok) {
        setShowExcuseModal(false);
        setSelectedAlumnoExcuse(null);
        setExcuseText('');
        await cargarControlDiario();
      } else {
        alert("Fallo al guardar la justificación.");
      }
    } catch (err) {
      console.error("Error al guardar justificación:", err);
    } finally {
      setExcuseSubmitting(false);
    }
  };

  // Completar inasistencias en lote
  const handleCompletarInasistencias = async () => {
    const conf = window.confirm(`¿Desea registrar como FALTA a todos los estudiantes de ${gradoControl}° "${seccionControl}" que no tienen ningún escaneo registrado hoy?`);
    if (!conf) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/v1/asistencias/lote-faltas?grado=${gradoControl}&seccion=${encodeURIComponent(seccionControl.toUpperCase())}`, {
        method: 'POST'
      });

      if (response.ok) {
        const res = await response.json();
        alert(`¡Completado! Se marcaron ${res.cantidad} inasistencias para hoy.`);
        await cargarControlDiario();
      } else {
        alert("Fallo al registrar inasistencias en lote.");
      }
    } catch (err) {
      console.error("Error al registrar lote de faltas:", err);
    } finally {
      setLoading(false);
    }
  };

  // ================= EXPORTACIÓN A EXCEL (XLSX) =================
  const handleExportarExcel = async () => {
    setExportLoading(true);
    try {
      let url = `/api/v1/asistencias/reporte?inicio=${fechaInicioRep}&fin=${fechaFinRep}`;
      if (gradoReporte !== 'ALL') {
        url += `&grado=${gradoReporte}`;
      }
      if (seccionReporte !== 'ALL') {
        url += `&seccion=${encodeURIComponent(seccionReporte.toUpperCase())}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        alert("Error al obtener datos del reporte.");
        setExportLoading(false);
        return;
      }

      const data = await response.json();
      if (data.length === 0) {
        alert("No hay registros de asistencia en el rango de fechas y filtros seleccionados.");
        setExportLoading(false);
        return;
      }

      // Mapear los datos al formato institucional plano requerido
      const dataMapeada = data.map((asis, idx) => ({
        'N°': idx + 1,
        'DNI': asis.dni,
        'Estudiante': `${asis.apellidos}, ${asis.nombres}`,
        'Grado': `${asis.grado}°`,
        'Sección': asis.seccion,
        'Fecha': asis.fecha,
        'Hora de Ingreso': asis.horaIngreso || 'N/A',
        'Estado': asis.estado,
        'Observación/Justificación': asis.observacion || ''
      }));

      // Crear hoja de cálculo
      const worksheet = XLSX.utils.json_to_sheet(dataMapeada);
      
      // Autoajustar ancho de columnas
      const maxLens = {};
      dataMapeada.forEach(row => {
        Object.keys(row).forEach(key => {
          const valStr = row[key] ? row[key].toString() : '';
          maxLens[key] = Math.max(maxLens[key] || 10, valStr.length);
        });
      });
      worksheet['!cols'] = Object.keys(maxLens).map(key => ({
        wch: maxLens[key] + 3
      }));

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencias JEC");

      // Guardar el archivo
      const filename = `reporte_asistencia_grados_${fechaInicioRep}_al_${fechaFinRep}.xlsx`;
      XLSX.writeFile(workbook, filename);
    } catch (err) {
      console.error("Error al exportar a Excel:", err);
      alert("Error de red al generar el reporte de Excel.");
    } finally {
      setExportLoading(false);
    }
  };

  // Filtrado en caliente de alumnos en el buscador diario
  const filteredAlumnos = alumnosControl.filter(a => 
    a.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.dni.includes(searchQuery)
  );

  // Stats acumuladas diarias para las tarjetas
  const dailyStats = (() => {
    let presentes = 0;
    let tardanzas = 0;
    let faltas = 0;
    let justificados = 0;
    let sinRegistro = 0;

    alumnosControl.forEach(a => {
      if (a.estado === 'PUNTUAL') presentes++;
      else if (a.estado === 'TARDANZA') tardanzas++;
      else if (a.estado === 'FALTA') faltas++;
      else if (a.estado === 'JUSTIFICADO') justificados++;
      else if (a.estado === 'SIN_REGISTRO') sinRegistro++;
    });

    const total = alumnosControl.length;
    const asistidos = presentes + tardanzas;
    const ratio = total > 0 ? Math.round((asistidos / total) * 100) : 0;

    return { presentes, tardanzas, faltas, justificados, sinRegistro, total, ratio };
  })();

  // ================= RENDERIZADO VISTA ESTUDIANTE =================
  if (isStudent) {
    return (
      <div className="space-y-6 animate-fadeIn">
        
        {/* Cabecera */}
        <div className="border-b border-slate-800 pb-4">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-450" />
            Mi Historial de Asistencia
          </h2>
          <p className="text-sm text-slate-400 mt-1">Supervise su control de ingreso diario a la institución.</p>
        </div>

        {/* Tarjetas de Estadísticas del Alumno */}
        {loading ? (
          <div className="py-20 flex justify-center"><RefreshCw className="w-8 h-8 text-slate-500 animate-spin" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Porcentaje Asistencia</span>
                <span className="text-3xl font-extrabold text-emerald-450">{studentStats.ratio}%</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Ingresos Puntuales</span>
                <span className="text-3xl font-extrabold text-blue-450">{studentStats.puntual}</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Tardanzas</span>
                <span className="text-3xl font-extrabold text-amber-450">{studentStats.tardanza}</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl text-center space-y-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Inasistencias (Falta)</span>
                <span className="text-3xl font-extrabold text-rose-455">{studentStats.falta}</span>
              </div>
              <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl text-center space-y-1 col-span-2 lg:col-span-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">Faltas Justificadas</span>
                <span className="text-3xl font-extrabold text-purple-450">{studentStats.justificado}</span>
              </div>
            </div>

            {/* Listado Cronológico */}
            <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-5 space-y-4">
              <h3 className="font-bold text-slate-200 text-sm">Registro de Ingresos</h3>
              
              {studentHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">No se registran asistencias en el sistema todavía.</div>
              ) : (
                <div className="overflow-x-auto rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-extrabold uppercase tracking-wider">
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Hora Ingreso</th>
                        <th className="py-3 px-4">Estado</th>
                        <th className="py-3 px-4">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-900/10">
                      {studentHistory.map((asis) => (
                        <tr key={asis.idAsistencia} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-300">{asis.fecha}</td>
                          <td className="py-3 px-4 font-mono text-slate-400">{asis.horaIngreso ? asis.horaIngreso.slice(0, 5) : '—'}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] border uppercase ${
                              asis.estado === 'PUNTUAL'
                                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40'
                                : asis.estado === 'TARDANZA'
                                ? 'bg-amber-950/60 text-amber-400 border-amber-900/40'
                                : asis.estado === 'JUSTIFICADO'
                                ? 'bg-purple-950/60 text-purple-400 border-purple-900/40'
                                : 'bg-rose-950/60 text-rose-400 border-rose-900/40'
                            }`}>
                              {asis.estado}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-400 italic font-mono truncate max-w-xs">{asis.observacion || 'Ninguna'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // ================= RENDERIZADO VISTA AUXILIAR / ADMINISTRACIÓN =================
  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Cabecera */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-450" />
            Gestión y Control de Asistencia
          </h2>
          <p className="text-sm text-slate-400 mt-1">Supervisión en tiempo real por tablets, registro manual de faltas y descarga de reportes.</p>
        </div>

        {/* Tabs superiores */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-slate-800 w-fit shrink-0">
          <button
            onClick={() => setActiveTab('control')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'control' 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            Control Diario
          </button>
          <button
            onClick={() => setActiveTab('reportes')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'reportes' 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            Reportes Mensuales
          </button>
          <button
            onClick={() => setActiveTab('configuracion')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'configuracion' 
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            Configuración Horarios
          </button>
        </div>
      </div>

      {/* ================= TAB 1: CONTROL DIARIO ================= */}
      {activeTab === 'control' && (
        <div className="space-y-6">
          
          {/* Barra de Filtros */}
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-3xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
            <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Fecha:</span>
                <input
                  type="date"
                  value={fechaControl}
                  onChange={(e) => setFechaControl(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Grado:</span>
                <select
                  value={gradoControl}
                  onChange={(e) => setGradoControl(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                >
                  <option value="1">1° Grado</option>
                  <option value="2">2° Grado</option>
                  <option value="3">3° Grado</option>
                  <option value="4">4° Grado</option>
                  <option value="5">5° Grado</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 font-extrabold uppercase">Sección:</span>
                <select
                  value={seccionControl}
                  onChange={(e) => setSeccionControl(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                >
                  {seccionOptions.map(sec => (
                    <option key={sec} value={sec}>Sección {sec}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buscador y Lote de inasistencias */}
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar estudiante por nombre/DNI..."
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-205 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Botón Completar Faltas */}
              <button
                type="button"
                onClick={handleCompletarInasistencias}
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <AlertCircle className="w-4 h-4" />
                <span>Marcar Faltas del Día</span>
              </button>
            </div>
          </div>

          {/* Tarjetas Estadísticas de hoy */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-2xl text-center">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Total Matriculados</span>
              <span className="text-2xl font-extrabold text-slate-300">{dailyStats.total}</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-2xl text-center">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Asistencia Hoy</span>
              <span className="text-2xl font-extrabold text-emerald-400">{dailyStats.ratio}%</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-2xl text-center">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Presentes/Tarde</span>
              <span className="text-2xl font-extrabold text-emerald-450">{dailyStats.presentes + dailyStats.tardanzas}</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-2xl text-center">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Inasistencias (Falta)</span>
              <span className="text-2xl font-extrabold text-rose-455">{dailyStats.faltas + dailyStats.justificados}</span>
            </div>
            <div className="bg-slate-900/30 border border-slate-800 p-3 rounded-2xl text-center col-span-2 sm:col-span-1">
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-wider block">Sin Escaneo (Pendiente)</span>
              <span className="text-2xl font-extrabold text-slate-550">{dailyStats.sinRegistro}</span>
            </div>
          </div>

          {/* Tabla de Alumnos */}
          <div className="bg-slate-900/20 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-200 text-sm">Listado de Estudiantes ({filteredAlumnos.length})</h3>
              <button 
                onClick={cargarControlDiario}
                className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-emerald-455 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Actualizar Lista</span>
              </button>
            </div>

            {loading && filteredAlumnos.length === 0 ? (
              <div className="py-20 flex justify-center"><RefreshCw className="w-8 h-8 text-slate-500 animate-spin" /></div>
            ) : filteredAlumnos.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">No se encontraron estudiantes para los filtros seleccionados.</div>
            ) : (
              <div className="overflow-x-auto rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-slate-400 font-extrabold uppercase tracking-wider">
                      <th className="py-3 px-4 w-12 text-center">N°</th>
                      <th className="py-3 px-4">Estudiante</th>
                      <th className="py-3 px-4 w-32">DNI</th>
                      <th className="py-3 px-4 w-36">Hora Ingreso</th>
                      <th className="py-3 px-4 w-36 text-center">Estado</th>
                      <th className="py-3 px-4 w-52 text-center">Acción / Modificar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850 bg-slate-900/10">
                    {filteredAlumnos.map((asis, idx) => (
                      <tr key={asis.idEstudiante} className="hover:bg-slate-900/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-500 text-center">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-slate-200">{asis.apellidos}, {asis.nombres}</td>
                        <td className="py-3 px-4 font-mono text-slate-450">{asis.dni}</td>
                        <td className="py-3 px-4 font-mono text-slate-400">{asis.horaIngreso ? asis.horaIngreso.slice(0, 8) : '—'}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] border uppercase ${
                            asis.estado === 'PUNTUAL'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-900/40'
                              : asis.estado === 'TARDANZA'
                              ? 'bg-amber-950/60 text-amber-400 border-amber-900/40'
                              : asis.estado === 'JUSTIFICADO'
                              ? 'bg-purple-950/60 text-purple-400 border-purple-900/40'
                              : asis.estado === 'FALTA'
                              ? 'bg-rose-950/60 text-rose-455 border-rose-900/40'
                              : 'bg-slate-950/60 text-slate-500 border-slate-900/40'
                          }`}>
                            {asis.estado === 'SIN_REGISTRO' ? 'SIN REGISTRO' : asis.estado}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {asis.estado === 'SIN_REGISTRO' || asis.estado === 'FALTA' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCambiarEstadoManual(asis.idEstudiante, 'PUNTUAL', asis)}
                                  className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-450 hover:text-slate-950 border border-emerald-500/20 hover:border-emerald-400 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                                  title="Marcar Presente Puntual"
                                >
                                  Puntual
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleCambiarEstadoManual(asis.idEstudiante, 'TARDANZA', asis)}
                                  className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500 text-amber-450 hover:text-slate-950 border border-amber-500/20 hover:border-amber-400 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                                  title="Marcar Presente con Tardanza"
                                >
                                  Tarde
                                </button>
                              </>
                            ) : null}
                            
                            {asis.estado !== 'SIN_REGISTRO' && asis.estado !== 'JUSTIFICADO' ? (
                              <button
                                type="button"
                                onClick={() => handleCambiarEstadoManual(asis.idEstudiante, 'FALTA', asis)}
                                className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-455 hover:text-slate-950 border border-rose-500/20 hover:border-rose-400 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                                title="Marcar Inasistencia (Falta)"
                              >
                                Falta
                              </button>
                            ) : null}

                            <button
                              type="button"
                              onClick={() => openExcuseModal(asis)}
                              className="px-2 py-1 bg-purple-500/10 hover:bg-purple-500 text-purple-450 hover:text-slate-950 border border-purple-500/20 hover:border-purple-400 rounded-lg font-bold text-[9px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                              title="Justificar Inasistencia"
                            >
                              <Edit3 className="w-2.5 h-2.5" />
                              <span>{asis.estado === 'JUSTIFICADO' ? 'Ver' : 'Justificar'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: EXPORTACIÓN DE REPORTES (EXCEL) ================= */}
      {activeTab === 'reportes' && (
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl max-w-2xl mx-auto">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Descarga de Reporte Consolidado (Excel)</h3>
                <p className="text-xs text-slate-450">Genere hojas de cálculo del control de asistencia institucional mensual.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Fecha Inicial:</label>
                <input
                  type="date"
                  value={fechaInicioRep}
                  onChange={(e) => setFechaInicioRep(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Fecha Final:</label>
                <input
                  type="date"
                  value={fechaFinRep}
                  onChange={(e) => setFechaFinRep(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Grado:</label>
                <select
                  value={gradoReporte}
                  onChange={(e) => setGradoReporte(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Todos los Grados</option>
                  <option value="1">1° Grado</option>
                  <option value="2">2° Grado</option>
                  <option value="3">3° Grado</option>
                  <option value="4">4° Grado</option>
                  <option value="5">5° Grado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase">Sección:</label>
                <select
                  value={seccionReporte}
                  onChange={(e) => setSeccionReporte(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                >
                  <option value="ALL">Todas las Secciones</option>
                  {seccionReporteOptions.map(sec => (
                    <option key={sec} value={sec}>Sección {sec}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex items-start gap-3 text-xs text-slate-500">
              <Info className="w-5 h-5 text-emerald-450 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-slate-350">Columnas incluidas en el reporte generado:</p>
                <p className="font-mono text-[10px]">DNI, Nombres del Estudiante, Grado, Sección, Fecha, Hora de ingreso y Estado.</p>
              </div>
            </div>

            <button
              type="button"
              disabled={exportLoading}
              onClick={handleExportarExcel}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-655 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-md"
            >
              {exportLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Procesando reporte...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar Historial consolidado a Excel</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CONFIGURACIÓN DE HORARIOS ================= */}
      {activeTab === 'configuracion' && (
        <div className="space-y-6">
          <form onSubmit={handleGuardarConfiguracion} className="bg-slate-900/30 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl max-w-md mx-auto">
            
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Configuración de Horarios de Ingreso</h3>
                <p className="text-xs text-slate-450">Defina los límites de hora oficial y tolerancia para la I.E.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Hora Oficial de Entrada (Puntual):</label>
                <input
                  type="time"
                  step="1"
                  required
                  value={horaEntrada}
                  onChange={(e) => setHoraEntrada(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[9px] text-slate-550 block font-semibold">Cualquier registro hasta este límite se cataloga como PUNTUAL.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Hora de Tolerancia (Tardanza):</label>
                <input
                  type="time"
                  step="1"
                  required
                  value={horaTolerancia}
                  onChange={(e) => setHoraTolerancia(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 cursor-pointer focus:outline-none focus:border-emerald-500"
                />
                <span className="text-[9px] text-slate-550 block font-semibold">Cualquier registro después de la Hora Oficial hasta este límite se cataloga como TARDANZA. Pasando este límite se marcará como FALTA.</span>
              </div>
            </div>

            {configMessage && (
              <div className={`p-3 border rounded-xl text-xs flex items-center gap-2 ${
                configMessage.type === 'success'
                  ? 'bg-emerald-950/20 text-emerald-400 border-emerald-900/40'
                  : 'bg-rose-950/20 text-rose-450 border-rose-900/40'
              }`}>
                {configMessage.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{configMessage.text}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={configSaving}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-955 disabled:text-slate-655 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 disabled:scale-100 disabled:cursor-not-allowed shadow-md"
            >
              {configSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Guardar Configuración de Horas</span>
            </button>
          </form>
        </div>
      )}

      {/* ================= MODAL REGISTRO DE JUSTIFICACIONES ================= */}
      {showExcuseModal && selectedAlumnoExcuse && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleGuardarJustificacion} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6">
            
            {/* Encabezado */}
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">Registrar Justificación de Inasistencia</h3>
                <p className="text-xs text-slate-450">{selectedAlumnoExcuse.apellidos}, {selectedAlumnoExcuse.nombres}</p>
              </div>
            </div>

            {/* Formulario */}
            <div className="space-y-3">
              <div className="text-xs bg-slate-950/40 p-3.5 border border-slate-900/60 rounded-xl font-medium">
                <span className="text-slate-500 font-bold block uppercase text-[9px] mb-1">Fecha de la inasistencia:</span>
                <span className="text-slate-200 font-mono font-semibold">{selectedAlumnoExcuse.fecha}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-450 uppercase block">Motivo o Descripción de la Justificación:</label>
                <textarea
                  required
                  rows={4}
                  maxLength={500}
                  value={excuseText}
                  onChange={(e) => setExcuseText(e.target.value)}
                  placeholder="Ej: El estudiante no asistió por motivos médicos. Presentó certificado firmado por el puesto de salud de Huanoquite."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder-slate-650"
                />
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2 border-t border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowExcuseModal(false);
                  setSelectedAlumnoExcuse(null);
                }}
                className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2.5 rounded-xl text-xs font-semibold cursor-pointer active:scale-95 transition-all text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={excuseSubmitting}
                className="flex-1 bg-purple-500 hover:bg-purple-400 disabled:bg-slate-800 text-slate-955 disabled:text-slate-655 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 disabled:scale-100 disabled:cursor-not-allowed transition-all"
              >
                {excuseSubmitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Justificar Inasistencia</span>
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

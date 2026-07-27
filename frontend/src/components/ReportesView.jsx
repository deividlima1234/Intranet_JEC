import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Printer, 
  Loader2, 
  User, 
  BookOpen,
  ClipboardList,
  Flame,
  Activity,
  Layers,
  Sparkles,
  Info,
  Download
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportesView({ currentUser }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reportData, setReportData] = useState(null);

  // Filtros de fecha (por defecto mes actual hasta el día de hoy)
  const [fechaInicio, setFechaInicio] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  });
  
  const [fechaFin, setFechaFin] = useState(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });

  // Buscador de docente
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDocenteId, setExpandedDocenteId] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [fechaInicio, fechaFin]);

  const fetchReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `/api/v1/reportes/uso-aip?idUsuario=${currentUser.idUsuario}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (res.ok) {
        setReportData(data);
      } else {
        setError(data.message || 'Error al obtener las estadísticas.');
      }
    } catch (err) {
      setError('Error de conexión con el servidor local.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocentesPdf = async () => {
    const page1 = document.getElementById('pdf-docentes-page1');
    const page2 = document.getElementById('pdf-docentes-page2');
    if (!page1 || !page2) return;
    
    try {
      // Página 1 (Gráfico) - Horizontal
      page1.style.display = 'block';
      const canvas1 = await html2canvas(page1, { scale: 2, backgroundColor: '#ffffff' });
      page1.style.display = 'none';

      const imgData1 = canvas1.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const pdfWidthL = pdf.internal.pageSize.getWidth();
      const pdfHeightL = (canvas1.height * pdfWidthL) / canvas1.width;
      
      pdf.addImage(imgData1, 'PNG', 0, 0, pdfWidthL, pdfHeightL);

      // Página 2 (Tabla) - Vertical
      pdf.addPage('a4', 'p');
      
      page2.style.display = 'block';
      const canvas2 = await html2canvas(page2, { scale: 2, backgroundColor: '#ffffff' });
      page2.style.display = 'none';

      const imgData2 = canvas2.toDataURL('image/png');
      const pdfWidthP = pdf.internal.pageSize.getWidth();
      const pdfHeightP = (canvas2.height * pdfWidthP) / canvas2.width;

      pdf.addImage(imgData2, 'PNG', 0, 0, pdfWidthP, pdfHeightP);

      pdf.save('Estadisticas_Docentes_AIP.pdf');
    } catch (error) {
      console.error('Error generando PDF', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtrar docentes según el buscador
  const getFilteredDocentes = () => {
    if (!reportData?.docentesStats) return [];
    return reportData.docentesStats.filter(doc => {
      const fullname = `${doc.nombres} ${doc.apellidos}`.toLowerCase();
      return fullname.includes(searchTerm.toLowerCase());
    });
  };

  const filteredDocentes = getFilteredDocentes();

  // Calcular métricas derivadas para las visualizaciones
  const getCourseSummary = () => {
    if (!reportData?.docentesStats) return [];
    const courseMap = {};
    
    reportData.docentesStats.forEach(doc => {
      doc.cursos.forEach(c => {
        const key = c.nombre.trim();
        if (!courseMap[key]) {
          courseMap[key] = { nombre: key, sesiones: 0, reservas: 0, totalDocentes: new Set() };
        }
        courseMap[key].sesiones += c.sesionesRealizadas;
        courseMap[key].reservas += c.reservasRealizadas;
        courseMap[key].totalDocentes.add(doc.idDocente);
      });
    });

    return Object.values(courseMap)
      .map(item => ({
        ...item,
        docentesCount: item.totalDocentes.size
      }))
      .sort((a, b) => b.sesiones - a.sesiones);
  };

  const courseSummary = getCourseSummary();

  // Determinar docente con más uso
  const getTopDocente = () => {
    if (!reportData?.docentesStats || reportData.docentesStats.length === 0) return null;
    return [...reportData.docentesStats].sort((a, b) => b.totalSesiones - a.totalSesiones)[0];
  };

  const topDocente = getTopDocente();

  // Obtener ranking de docentes
  const getDocentesRanking = () => {
    if (!reportData?.docentesStats) return [];
    return [...reportData.docentesStats]
      .sort((a, b) => b.totalSesiones - a.totalSesiones);
  };

  const docentesRanking = getDocentesRanking();

  const formatDateInSpanish = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return `${day} de ${months[monthIndex]} de ${year}`;
  };

  return (
    <div className="space-y-6 print:bg-white print:text-black print:p-0">
      <style>{`
        @media print {
          /* Ocultar barra lateral y elementos no deseados */
          aside, 
          header, 
          nav, 
          footer, 
          button, 
          input, 
          select,
          .print-hide,
          .print\\:hidden {
            display: none !important;
          }

          /* Resetear contenedores flex e h-screen */
          #root, 
          body, 
          html,
          .h-screen, 
          .overflow-hidden, 
          .flex,
          .flex-row,
          main {
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            background-color: white !important;
            color: black !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
          }

          /* Estilos del reporte formal */
          .print-report-container {
            display: block !important;
            width: 100% !important;
            background-color: white !important;
            color: black !important;
            font-family: "Nimbus Roman", "Times New Roman", Times, serif !important;
            padding: 30px !important;
            margin: 0 !important;
          }

          /* Forzar saltos de página limpios */
          tr, p, h1, h2, h3, ul, ol, table {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          th, td {
            border: 1px solid black !important;
            padding: 6px 10px !important;
            color: black !important;
          }
        }
      `}</style>
      
      {/* VISTA DE IMPRESIÓN FORMAL (Solo visible al imprimir) */}
      {reportData && (
        <div className="hidden print:block print-report-container text-black bg-white p-2 font-serif text-[11px] space-y-4 leading-relaxed">
          {/* Letterhead */}
          <div className="text-center space-y-1">
            <h1 className="text-xs font-extrabold tracking-wide uppercase">
              INSTITUCIÓN EDUCATIVA SECUNDARIA DE HUANOQUITE
            </h1>
            <p className="text-[9px] italic">
              "Año de la Esperanza y el Fortalecimiento de la Democracia"
            </p>
            <div className="border-b border-black w-full my-2"></div>
          </div>

          {/* Title */}
          <div className="text-center">
            <h2 className="text-xs font-extrabold underline uppercase">
              INFORME TÉCNICO N° 006-2026-I.E.HUANOQUITE-CIST
            </h2>
          </div>

          {/* Date */}
          <div className="text-right font-bold text-[10px]">
            FECHA: {formatDateInSpanish(fechaFin)}
          </div>

          {/* Header fields */}
          <div className="border-t border-b border-black py-2 my-2 space-y-1 text-xs">
            <div className="grid grid-cols-6">
              <span className="font-bold col-span-1">PARA:</span>
              <span className="col-span-5">Dirección de la Institución Educativa Huanoquite</span>
            </div>
            <div className="grid grid-cols-6">
              <span className="font-bold col-span-1">DE:</span>
              <span className="col-span-5">Ing. Eddam Eloy Huallpa Lima — Especialista CIST</span>
            </div>
            <div className="grid grid-cols-6">
              <span className="font-bold col-span-1">ASUNTO:</span>
              <span className="col-span-5 font-bold">Informe de Uso y Cumplimiento Pedagógico de las Aulas AIP</span>
            </div>
          </div>

          {/* 1. ANTECEDENTES */}
          <div className="space-y-1">
            <h3 className="font-bold uppercase text-[10px]">1. ANTECEDENTES:</h3>
            <p className="text-justify pl-4">
              El Aula de Innovación Pedagógica (AIP) de la I.E. Huanoquite es un recurso tecnológico fundamental diseñado para mejorar el proceso de enseñanza y aprendizaje mediante la integración de las TIC. En cumplimiento de las directivas institucionales que exigen el monitoreo del uso de la infraestructura informática, se emite el presente informe técnico detallando el aprovechamiento y cumplimiento del Aula AIP por parte del personal docente durante el periodo comprendido desde el <strong>{formatDateInSpanish(fechaInicio)}</strong> hasta el <strong>{formatDateInSpanish(fechaFin)}</strong>.
            </p>
          </div>

          {/* 2. CLASIFICACIÓN DE USO DE LAS AULAS AIP */}
          <div className="space-y-1">
            <h3 className="font-bold uppercase text-[10px]">2. CLASIFICACIÓN DE USO DE LAS AULAS AIP:</h3>
            <p className="text-justify pl-4">
              Durante el periodo reportado, el uso de las aulas se ha distribuido en las siguientes categorías operativas:
            </p>
            <ul className="list-disc pl-8 space-y-1 text-justify">
              <li><strong>Sesiones de Clases AIP (Modo Clase):</strong> Se realizaron un total de <strong>{reportData.resumen.totalClasesAip}</strong> clases ejecutadas con laptops y software educativo.</li>
              <li><strong>Reservas de Aula AIP:</strong> Los docentes agendaron de forma anticipada <strong>{reportData.resumen.totalReservasRealizadas}</strong> reservas de horario en el planificador interactivo.</li>
              <li><strong>Ocupación por Aulas:</strong>
                <ul className="list-disc pl-6 mt-0.5 space-y-0.5">
                  <li>Aula AIP 01 (Principal): <strong>{reportData.resumen.usoAipPrincipal}</strong> visitas.</li>
                  <li>Otras Aulas AIP: <strong>{reportData.resumen.usoAipSecundaria}</strong> visitas.</li>
                </ul>
              </li>
            </ul>
          </div>

          {/* 3. ANÁLISIS DE DOCENTES Y LÍDER DE INNOVACIÓN */}
          <div className="space-y-1">
            <h3 className="font-bold uppercase text-[10px]">3. ANÁLISIS DE PARTICIPACIÓN Y LÍDER DE INNOVACIÓN:</h3>
            <p className="text-justify pl-4">
              De acuerdo con el registro de asistencia electrónica del Aula AIP, el/la docente que reporta el mayor uso de los recursos tecnológicos es <strong>{topDocente ? `${topDocente.nombres} ${topDocente.apellidos}` : 'Ninguno'}</strong> con un total de <strong>{topDocente ? topDocente.totalSesiones : 0}</strong> sesiones de clase, demostrando una notable incorporación de tecnologías en su práctica docente. Asimismo, el área/curso de mayor dinamismo corresponde a <strong>{courseSummary.length > 0 ? courseSummary[0].nombre : 'Ninguno'}</strong> con un total de <strong>{courseSummary.length > 0 ? courseSummary[0].sesiones : 0}</strong> visitas.
            </p>
          </div>

          {/* 4. INFORME DETALLADO DE CUMPLIMIENTO POR ASIGNATURAS */}
          <div className="space-y-1">
            <h3 className="font-bold uppercase text-[10px]">4. INFORME DETALLADO DE CUMPLIMIENTO POR ASIGNATURAS:</h3>
            <p className="text-justify pl-4 mb-2">
              A continuación, se detalla el nivel de cumplimiento y visitas de cada uno de los docentes y sus respectivos cursos asignados en el sistema:
            </p>
            <table className="w-full border-collapse border border-black text-[9px] mt-1 text-black">
              <thead>
                <tr className="bg-slate-100 border-b border-black">
                  <th className="border border-black px-2 py-1 text-left">Docente</th>
                  <th className="border border-black px-2 py-1 text-left">Asignatura / Curso</th>
                  <th className="border border-black px-2 py-1 text-center">G. y S.</th>
                  <th className="border border-black px-2 py-1 text-center">Reservas</th>
                  <th className="border border-black px-2 py-1 text-center">Clases</th>
                  <th className="border border-black px-2 py-1 text-center">Estado de Cumplimiento</th>
                </tr>
              </thead>
              <tbody>
                {reportData.docentesStats.flatMap((doc) => 
                  doc.cursos.map((c, cIdx) => (
                    <tr key={`${doc.idDocente}-${c.idCurso}`} className="border-b border-black">
                      {cIdx === 0 ? (
                        <td className="border border-black px-2 py-1 font-bold align-middle" rowSpan={doc.cursos.length}>
                          {doc.apellidos}, {doc.nombres}
                        </td>
                      ) : null}
                      <td className="border border-black px-2 py-1">{c.nombre}</td>
                      <td className="border border-black px-2 py-1 text-center">{c.grado}° "{c.seccion}"</td>
                      <td className="border border-black px-2 py-1 text-center font-mono">{c.reservasRealizadas}</td>
                      <td className="border border-black px-2 py-1 text-center font-mono">{c.sesionesRealizadas}</td>
                      <td className="border border-black px-2 py-1 text-center font-bold">
                        {c.sesionesRealizadas >= 6 
                          ? 'CUMPLIMIENTO ÓPTIMO' 
                          : c.sesionesRealizadas >= 1 
                          ? 'USO BAJO' 
                          : 'SIN USO (ALERTA) ⚠️'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. CONCLUSIONES Y RECOMENDACIONES */}
          <div className="space-y-1">
            <h3 className="font-bold uppercase text-[10px]">5. CONCLUSIONES Y RECOMENDACIONES:</h3>
            <ol className="list-decimal pl-6 space-y-1 leading-relaxed text-justify">
              <li>Se evidencia una marcada disparidad en la incorporación de las TIC. Docentes en áreas como Educación para el Trabajo (EPT) muestran un uso frecuente y planificado, mientras que áreas básicas como Matemática o Comunicación presentan niveles de concurrencia nulos en algunas secciones.</li>
              <li>Se sugiere que la Dirección institucional, a través de la Coordinación CIST, convoque a reuniones de acompañamiento pedagógico a los docentes con estados de <strong>"SIN USO (ALERTA)"</strong> para facilitar la incorporación del software educativo offline del servidor LAN.</li>
              <li>Es fundamental que la programación de reservas coincida con la asistencia física al aula AIP, optimizando el uso de la infraestructura tecnológica.</li>
            </ol>
          </div>

          {/* Firma */}
          <div className="pt-8 text-center text-xs space-y-1">
            <div className="w-56 border-t border-black mx-auto"></div>
            <p className="font-bold">Ing. Eddam Eloy Huallpa Lima</p>
            <p>Coordinador CIST / Soporte Tecnológico</p>
            <p>I.E. Huanoquite</p>
          </div>
        </div>
      )}

      {/* VISTA DE PANTALLA (Humedecida por print:hidden) */}
      <div className="space-y-6 print:hidden">
        
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100 tracking-wide">
                ESTADÍSTICAS E INFORMES DE USO AIP
              </h2>
              <p className="text-xs text-slate-400">
                Reporte institucional del uso de aulas tecnológicas por docente, curso y cumplimiento pedagógico.
              </p>
            </div>
          </div>

          <button 
            onClick={handlePrint}
            disabled={loading || error || !reportData}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:text-slate-650 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-750 hover:border-slate-700 transition-all cursor-pointer active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Informe</span>
          </button>
        </div>

        {/* Controles de Rango de Fechas */}
        <div className="bg-slate-900/25 border border-slate-800/80 p-4 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
            <Calendar className="w-4.5 h-4.5 text-emerald-400" />
            <span>Rango del Informe:</span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">Desde:</span>
              <input 
                type="date" 
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
              />
            </div>
            <div className="flex items-center gap-2 bg-slate-950/60 border border-slate-850 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500">Hasta:</span>
              <input 
                type="date" 
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="bg-transparent border-none text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Alertas y Errores */}
        {error && (
          <div className="p-4 bg-rose-950/20 text-rose-450 border border-rose-900/50 rounded-2xl text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <span className="text-xs text-slate-400 font-semibold">Consolidando datos y generando informe...</span>
          </div>
        ) : reportData ? (
          <>
            {/* Tarjetas de Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-lg">
                <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Sesiones Clases dictadas</p>
                  <p className="text-2xl font-extrabold text-slate-100 mt-0.5">{reportData.resumen.totalClasesAip}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-lg">
                <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl">
                  <ClipboardList className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Horas Colegiadas</p>
                  <p className="text-2xl font-extrabold text-slate-100 mt-0.5">{reportData.resumen.totalHorasColegiadas}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-lg">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Reservas Agendadas</p>
                  <p className="text-2xl font-extrabold text-slate-100 mt-0.5">{reportData.resumen.totalReservasRealizadas}</p>
                </div>
              </div>

              <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 p-5 rounded-3xl flex items-center gap-4 shadow-lg">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Líder en Innovación</p>
                  <p className="text-[11px] font-extrabold text-slate-200 mt-1 truncate max-w-[140px]">
                    {topDocente ? `${topDocente.apellidos.split(' ')[0]}, ${topDocente.nombres.split(' ')[0]}` : '-'}
                  </p>
                  <p className="text-[9px] font-bold text-amber-400 uppercase">
                    {topDocente ? `${topDocente.totalSesiones} visitas` : '0 visitas'}
                  </p>
                </div>
              </div>

            </div>

            {/* Gráficos y Distribución */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Gráfico de Barras: Uso por Cursos */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl">
                <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>USO ACADÉMICO POR CURSOS</span>
                </h3>
                
                {courseSummary.length === 0 ? (
                  <p className="text-center py-10 text-xs text-slate-500 italic">No hay clases dictadas en el período.</p>
                ) : (
                  <div className="space-y-3.5">
                    {courseSummary.slice(0, 5).map((c, idx) => {
                      const maxVal = courseSummary[0].sesiones || 1;
                      const percent = Math.round((c.sesiones / maxVal) * 100);

                      // Colores temáticos para cada barra
                      const barColors = [
                        'bg-emerald-500 shadow-emerald-500/10 text-emerald-400',
                        'bg-indigo-500 shadow-indigo-500/10 text-indigo-400',
                        'bg-blue-500 shadow-blue-500/10 text-blue-400',
                        'bg-purple-500 shadow-purple-500/10 text-purple-400',
                        'bg-amber-500 shadow-amber-500/10 text-amber-400'
                      ];

                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-300 flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 font-mono">#{idx+1}</span>
                              {c.nombre}
                            </span>
                            <span className="font-extrabold text-slate-100 font-mono">
                              {c.sesiones} <span className="text-[9px] font-bold text-slate-500 uppercase">visitas</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex-1 bg-slate-950/80 rounded-full h-3 border border-slate-900/60">
                              <div 
                                className={`h-full rounded-full transition-all duration-700 ${barColors[idx % barColors.length].split(' ')[0]}`}
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                            <span className="text-[9px] font-bold text-slate-500 w-8 text-right">{percent}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Uso General por Docente */}
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      <span>USO GENERAL POR DOCENTE</span>
                    </h3>
                    <button 
                      onClick={handleDownloadDocentesPdf}
                      className="flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-colors uppercase tracking-wider"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </button>
                  </div>

                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {docentesRanking.length === 0 ? (
                      <p className="text-center py-10 text-xs text-slate-500 italic">No hay docentes registrados.</p>
                    ) : (
                      docentesRanking.map((doc, idx) => {
                        const maxVal = docentesRanking[0].totalSesiones || 1;
                        const percent = doc.totalSesiones > 0 ? Math.round((doc.totalSesiones / maxVal) * 100) : 0;
                        
                        const barColors = [
                          'bg-emerald-500',
                          'bg-indigo-500',
                          'bg-blue-500',
                          'bg-purple-500',
                          'bg-amber-500'
                        ];
                        const colorClass = doc.totalSesiones > 0 ? barColors[idx % barColors.length] : 'bg-slate-700';

                        return (
                          <div key={doc.idDocente} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className={`font-bold ${doc.totalSesiones === 0 ? 'text-slate-500' : 'text-slate-300'}`}>
                                {doc.apellidos}, {doc.nombres.split(' ')[0]}
                              </span>
                              <span className={`font-mono ${doc.totalSesiones === 0 ? 'text-rose-450' : 'text-slate-100'}`}>
                                {doc.totalSesiones > 0 ? `${doc.totalSesiones} sesiones` : '0 (Nunca viene)'}
                              </span>
                            </div>
                            <div className="w-full bg-slate-950 rounded-full h-2.5">
                              <div 
                                className={`${colorClass} h-2.5 rounded-full transition-all duration-700`} 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Información institucional */}
                <div className="mt-6 pt-4 border-t border-slate-800/60 bg-slate-950/20 p-3 rounded-2xl border border-slate-900 text-[10px] text-slate-450 font-semibold leading-relaxed flex gap-2">
                  <Info className="w-4 h-4 shrink-0 text-emerald-400" />
                  <p>
                    Se muestra el consolidado de visitas generales por cada docente. Aquellos con 0 sesiones (Nunca viene) requieren acompañamiento para incorporar las TIC.
                  </p>
                </div>
              </div>

            </div>

            {/* Tabla de Cumplimiento Docente */}
            <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-800/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-slate-200 text-sm">AUDITORÍA Y CUMPLIMIENTO DOCENTE</h3>
                  <p className="text-[10px] text-slate-450">Listado completo de docentes, cursos a cargo y visitas registradas en el Aula AIP.</p>
                </div>
                
                {/* Buscador */}
                <div className="relative shrink-0 w-full sm:w-64">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Buscar docente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-850 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {filteredDocentes.length === 0 ? (
                <p className="text-center py-10 text-xs text-slate-500 italic">No se encontraron docentes con el término buscado.</p>
              ) : (
                <div className="space-y-3">
                  {filteredDocentes.map((doc) => {
                    const isExpanded = expandedDocenteId === doc.idDocente;
                    const totalCursos = doc.cursos.length;
                    const cursosSinUso = doc.cursos.filter(c => c.sesionesRealizadas === 0).length;
                    
                    // Calcular estado general
                    let complianceStatus = "SIN_USO";
                    if (doc.totalSesiones > 0) {
                      complianceStatus = cursosSinUso === 0 ? "COMPLETO" : "PARCIAL";
                    }

                    return (
                      <div 
                        key={doc.idDocente}
                        className={`border rounded-2xl transition-all duration-200 overflow-hidden ${
                          isExpanded 
                            ? 'bg-slate-950/40 border-slate-700/80 shadow-md' 
                            : 'bg-slate-950/15 border-slate-850 hover:border-slate-750'
                        }`}
                      >
                        {/* Fila del docente */}
                        <div 
                          onClick={() => setExpandedDocenteId(isExpanded ? null : doc.idDocente)}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                              <User className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-200 text-xs block">
                                {doc.apellidos}, {doc.nombres}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">
                                Docente JEC • {totalCursos} cursos asignados
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-5">
                            
                            {/* Estadísticas en miniatura */}
                            <div className="flex gap-4 text-center">
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">Clases</span>
                                <span className="font-extrabold text-slate-200 text-xs font-mono">{doc.totalSesiones}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">Colegiados</span>
                                <span className="font-extrabold text-slate-200 text-xs font-mono">{doc.totalColegiados}</span>
                              </div>
                              <div>
                                <span className="text-[9px] text-slate-500 uppercase font-bold block">Reservas</span>
                                <span className="font-extrabold text-slate-200 text-xs font-mono">{doc.totalReservas}</span>
                              </div>
                            </div>

                            {/* Cumplimiento Badge */}
                            <div className="flex items-center gap-3">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                                complianceStatus === 'COMPLETO'
                                  ? 'bg-emerald-500/15 text-emerald-440 border-emerald-500/25'
                                  : complianceStatus === 'PARCIAL'
                                  ? 'bg-amber-500/15 text-amber-450 border-amber-500/25'
                                  : 'bg-rose-500/15 text-rose-450 border-rose-500/25'
                              }`}>
                                {complianceStatus === 'COMPLETO' ? 'Uso Completo' : complianceStatus === 'PARCIAL' ? 'Uso Parcial' : 'Sin Uso'}
                              </span>
                              
                              <div>
                                {isExpanded ? <ChevronUp className="w-4.5 h-4.5 text-slate-400" /> : <ChevronDown className="w-4.5 h-4.5 text-slate-500" />}
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* Desglose de Cursos */}
                        {isExpanded && (
                          <div className="border-t border-slate-850/60 bg-slate-950/60 p-4 space-y-3 animate-fadeIn">
                            <span className="text-[10px] text-slate-500 uppercase font-bold block tracking-wider">
                              Desglose detallado por Asignaturas:
                            </span>

                            {doc.cursos.length === 0 ? (
                              <p className="text-xs text-slate-450 italic py-2">Este docente no posee cursos o asignaturas cargadas en el sistema.</p>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {doc.cursos.map((c) => (
                                  <div 
                                    key={c.idCurso}
                                    className={`p-3.5 border rounded-2xl flex items-center justify-between text-xs transition-all ${
                                      c.sesionesRealizadas >= 6
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : c.sesionesRealizadas >= 1
                                        ? 'bg-amber-500/5 border-amber-500/20'
                                        : 'bg-rose-500/5 border-rose-500/20'
                                    }`}
                                  >
                                    <div className="space-y-1">
                                      <span className="font-extrabold text-slate-200 block">
                                        {c.nombre}
                                      </span>
                                      <span className="text-[10px] text-slate-450 block font-semibold">
                                        Sección: {c.grado}° "{c.seccion}" • NRC: {c.nrc}
                                      </span>
                                      <div className="flex gap-3 text-[10px] font-semibold text-slate-550 pt-1">
                                        <span>Visitas AIP: <strong className="text-slate-350 font-mono">{c.sesionesRealizadas}</strong></span>
                                        <span>Reservas: <strong className="text-slate-400 font-mono">{c.reservasRealizadas}</strong></span>
                                      </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1.5">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${
                                        c.sesionesRealizadas >= 6
                                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                          : c.sesionesRealizadas >= 1
                                          ? 'bg-amber-500/10 text-amber-450 border-amber-500/20'
                                          : 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                                      }`}>
                                        {c.sesionesRealizadas >= 6 ? 'Óptimo' : c.sesionesRealizadas >= 1 ? 'Bajo' : 'Sin Uso'}
                                      </span>
                                      
                                      {c.sesionesRealizadas === 0 && (
                                        <span className="text-[9px] text-rose-450 font-bold flex items-center gap-1">
                                          <AlertTriangle className="w-3 h-3" />
                                          Alerta de Incumplimiento
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>

      {/* TEMPLATES OCULTOS PARA PDF */}
      
      {/* PÁGINA 1: Gráfico Top 10 (Fondo blanco, diseño limpio, apaisado) */}
      <div id="pdf-docentes-page1" style={{ display: 'none', width: '1120px', backgroundColor: '#ffffff', padding: '40px', color: '#000000', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '2px solid #000', paddingBottom: '15px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', margin: 0, letterSpacing: '1px' }}>Estadísticas de Uso General por Docente - Aula AIP</h1>
          <p style={{ fontSize: '14px', color: '#4b5563', margin: '8px 0 0 0', fontWeight: 'bold' }}>
            Periodo Analizado: {formatDateInSpanish(fechaInicio)} al {formatDateInSpanish(fechaFin)}
          </p>
        </div>

        {/* GRÁFICO VISUAL (TOP 10) */}
        {docentesRanking && docentesRanking.length > 0 && (
          <div style={{ marginBottom: '40px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '15px', color: '#334155' }}>Top 10 Docentes con Mayor Participación</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {docentesRanking.slice(0, 10).map((doc, idx) => {
                const maxVal = docentesRanking[0].totalSesiones || 1;
                const percent = doc.totalSesiones > 0 ? Math.round((doc.totalSesiones / maxVal) * 100) : 0;
                
                const pdfColors = ['#10b981', '#6366f1', '#3b82f6', '#8b5cf6', '#f59e0b'];
                const color = doc.totalSesiones > 0 ? pdfColors[idx % pdfColors.length] : '#cbd5e1';

                return (
                  <div key={`pdf-chart-${doc.idDocente}`} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '320px', fontSize: '14px', fontWeight: 'bold', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingBottom: '3px', marginTop: '2px' }}>
                      {idx + 1}. {doc.apellidos}, {doc.nombres}
                    </div>
                    <div style={{ flex: 1, backgroundColor: '#e2e8f0', height: '24px', borderRadius: '12px', overflow: 'hidden' }}>
                      <div style={{ width: `${percent}%`, backgroundColor: color, height: '100%', borderRadius: '12px' }}></div>
                    </div>
                    <div style={{ width: '80px', fontSize: '14px', fontWeight: 'bold', color: '#475569', textAlign: 'right' }}>
                      {doc.totalSesiones} sesiones
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PÁGINA 2: Tabla Completa (Fondo blanco, diseño limpio, vertical) */}
      <div id="pdf-docentes-page2" style={{ display: 'none', width: '800px', backgroundColor: '#ffffff', padding: '40px', color: '#000000', fontFamily: 'sans-serif' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', textTransform: 'uppercase', margin: 0 }}>Reporte de Uso General por Docente - Aula AIP</h1>
          <p style={{ fontSize: '12px', color: '#555', margin: '5px 0 0 0' }}>
            Periodo Analizado: {formatDateInSpanish(fechaInicio)} al {formatDateInSpanish(fechaFin)}
          </p>
        </div>

        <h2 style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px', color: '#334155' }}>Detalle Completo de Docentes</h2>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '12px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #000' }}>
              <th style={{ padding: '8px', textAlign: 'left' }}>#</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Docente</th>
              <th style={{ padding: '8px', textAlign: 'center' }}>Total Sesiones</th>
              <th style={{ padding: '8px', textAlign: 'left' }}>Nivel de Uso</th>
            </tr>
          </thead>
          <tbody>
            {docentesRanking && docentesRanking.map((doc, idx) => (
              <tr key={doc.idDocente} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '8px', fontWeight: 'bold', color: '#6b7280' }}>{idx + 1}</td>
                <td style={{ padding: '8px', fontWeight: 'bold' }}>{doc.apellidos}, {doc.nombres}</td>
                <td style={{ padding: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                  {doc.totalSesiones > 0 ? doc.totalSesiones : <span style={{ color: '#ef4444' }}>0</span>}
                </td>
                <td style={{ padding: '8px' }}>
                  {doc.totalSesiones >= 6 ? (
                    <span style={{ color: '#059669', fontWeight: 'bold' }}>Óptimo</span>
                  ) : doc.totalSesiones >= 1 ? (
                    <span style={{ color: '#d97706', fontWeight: 'bold' }}>Bajo</span>
                  ) : (
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>Nunca viene</span>
                  )}
                </td>
              </tr>
            ))}
            {docentesRanking && docentesRanking.length === 0 && (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', fontStyle: 'italic', color: '#6b7280' }}>
                  No hay docentes registrados en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #000', fontSize: '10px', fontWeight: 'bold', textAlign: 'right' }}>
          Generado por CIST: Eddam Eloy SYSTEM_JEC-HUANOQUITE
        </div>
      </div>
    </div>
  );
}

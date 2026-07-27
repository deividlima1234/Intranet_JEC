import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Tablet, 
  HardDrive, 
  ShieldAlert, 
  Monitor, 
  CheckCircle, 
  RefreshCw, 
  Clock, 
  Calendar, 
  ChevronDown, 
  ChevronUp,
  Printer,
  ClipboardList,
  Trash2
} from 'lucide-react';
import { printActa } from '../utils/printActa';
import ConfirmationModal from './ConfirmationModal';

export default function DashboardView({ currentUser }) {
  const [inventories, setInventories] = useState({
    1: { name: 'AIP 01 - Principal', laptops: [], tablets: [], loading: true, error: null },
    2: { name: 'AIP 02', laptops: [], tablets: [], loading: true, error: null },
    3: { name: 'AIP 03', laptops: [], tablets: [], loading: true, error: null }
  });

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState(null);
  const [expandedSessionId, setExpandedSessionId] = useState(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Estados de eliminación de transacción
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);

  useEffect(() => {
    const fetchInventory = async (aulaId) => {
      try {
        const response = await fetch(`/api/v1/aulas/${aulaId}/inventario`);
        if (!response.ok) throw new Error('Error al obtener inventario');
        const data = await response.json();
        
        const laptops = data.filter(e => e.tipoEquipo === 'LAPTOP');
        const tablets = data.filter(e => e.tipoEquipo === 'TABLET' || e.tipoEquipo === 'PC_ESCRITORIO');

        setInventories(prev => ({
          ...prev,
          [aulaId]: {
            ...prev[aulaId],
            laptops,
            tablets,
            loading: false,
            error: null
          }
        }));
      } catch (err) {
        setInventories(prev => ({
          ...prev,
          [aulaId]: {
            ...prev[aulaId],
            loading: false,
            error: 'No se pudo conectar al servidor local.'
          }
        }));
      }
    };

    const fetchHistory = async () => {
      setHistoryLoading(true);
      try {
        const response = await fetch('/api/v1/sesiones/historial');
        if (!response.ok) throw new Error('Error al obtener el historial');
        const data = await response.json();
        setHistory(data);
        setHistoryError(null);
      } catch (err) {
        setHistoryError('No se pudo establecer conexión con el servidor local para el historial.');
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchInventory(1);
    fetchInventory(2);
    fetchInventory(3);
    fetchHistory();
  }, [refreshTrigger]);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const confirmDeleteTransaction = (idSesion) => {
    setSessionToDelete(idSesion);
    setShowDeleteModal(true);
  };

  const handleDeleteTransaction = async () => {
    if (!sessionToDelete) return;

    try {
      const response = await fetch(`/api/v1/sesiones/${sessionToDelete}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSessionToDelete(null);
        handleRefresh();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Error al eliminar la transacción.');
      }
    } catch (err) {
      alert('Error de conexión con el servidor local.');
    }
  };

  // Cálculos globales
  const getAllDevices = (type) => {
    let list = [];
    Object.values(inventories).forEach(aula => {
      if (aula.laptops && type === 'LAPTOP') list = [...list, ...aula.laptops];
      if (aula.tablets && type === 'TABLET') list = [...list, ...aula.tablets];
    });
    return list;
  };

  const laptopsGlobal = getAllDevices('LAPTOP');
  const tabletsGlobal = getAllDevices('TABLET');

  const totalDevicesCount = laptopsGlobal.length + tabletsGlobal.length;
  const availableDevicesCount = [ ...laptopsGlobal, ...tabletsGlobal ].filter(d => d.ubicacionActual === 'EN_AIP').length;
  const loanedDevicesCount = [ ...laptopsGlobal, ...tabletsGlobal ].filter(d => d.ubicacionActual === 'PRESTADO_AULA').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera del Dashboard */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Panel de Control Patrimonial</h2>
          <p className="text-sm text-slate-400">Resumen en tiempo real del estado físico y disponibilidad de los activos.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-all cursor-pointer active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* Tarjetas Estadísticas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Total Equipos</p>
            <p className="text-2xl font-bold text-slate-100">{totalDevicesCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">Disponibles</p>
            <p className="text-2xl font-bold text-emerald-400">{availableDevicesCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
            <Laptop className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">En Uso/Prestados</p>
            <p className="text-2xl font-bold text-amber-400">{loanedDevicesCount}</p>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800 p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold">De Baja / Incidencias</p>
            <p className="text-2xl font-bold text-red-400">0</p>
          </div>
        </div>
      </div>

      {/* Estado del Inventario de cada Aula */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(inventories).map(([id, aula]) => {
          const totalLaptops = aula.laptops ? aula.laptops.length : 0;
          const avLaptops = aula.laptops ? aula.laptops.filter(e => e.ubicacionActual === 'EN_AIP').length : 0;

          const totalTablets = aula.tablets ? aula.tablets.length : 0;
          const avTablets = aula.tablets ? aula.tablets.filter(e => e.ubicacionActual === 'EN_AIP').length : 0;

          return (
            <div key={id} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
                  <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-400" />
                    {aula.name}
                  </h3>
                  <span className={`w-2.5 h-2.5 rounded-full ${aula.error ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                </div>

                {aula.loading ? (
                  <div className="h-32 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-slate-500 animate-spin" />
                  </div>
                ) : aula.error ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3">
                    <ShieldAlert className="w-8 h-8 text-rose-500/80 mb-2" />
                    <p className="text-xs text-slate-400">{aula.error}</p>
                  </div>
                ) : totalLaptops === 0 && totalTablets === 0 ? (
                  <div className="h-32 flex flex-col items-center justify-center text-center p-3">
                    <HardDrive className="w-8 h-8 text-slate-600 mb-2" />
                    <p className="text-xs text-slate-400">No hay activos patrimoniales en esta Aula base.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sección Laptops */}
                    {totalLaptops > 0 && (
                      <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-850">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <Laptop className="w-3.5 h-3.5 text-blue-400" />
                            Laptops
                          </span>
                          <span>{avLaptops} / {totalLaptops} Disp.</span>
                        </div>
                        {/* Barra de progreso */}
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(avLaptops / totalLaptops) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Sección Tabletas */}
                    {totalTablets > 0 && (
                      <div className="bg-slate-950/40 rounded-xl p-3 border border-slate-850">
                        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                          <span className="flex items-center gap-1.5 text-slate-300">
                            <Tablet className="w-3.5 h-3.5 text-indigo-400" />
                            Tabletas
                          </span>
                          <span>{avTablets} / {totalTablets} Disp.</span>
                        </div>
                        {/* Barra de progreso */}
                        <div className="w-full bg-slate-800 rounded-full h-2">
                          <div 
                            className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${(avTablets / totalTablets) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón rápido del Aula */}
              {!aula.loading && !aula.error && (totalLaptops > 0 || totalTablets > 0) && (
                <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-between text-xs text-slate-400">
                  <span>Equipos Ocupados:</span>
                  <span className="font-bold text-slate-200">
                    {(totalLaptops - avLaptops) + (totalTablets - avTablets)}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Sección Historial de Transacciones (Préstamos y Retornos) */}
      <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-450" />
            <div>
              <h3 className="font-bold text-slate-200 text-sm">Historial de Transacciones</h3>
              <p className="text-[11px] text-slate-450">Últimos registros de inicio de clase y préstamos de dispositivos.</p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {history.length} Registros
          </span>
        </div>

        {historyLoading ? (
          <div className="py-8 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-emerald-450 animate-spin" />
          </div>
        ) : historyError ? (
          <div className="py-6 text-center text-rose-450 text-xs">{historyError}</div>
        ) : history.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-500 italic">No hay registros de transacciones o préstamos en la base de datos.</p>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {history.map((session) => {
              const isActive = !session.horaFin;
              const isClase = session.tipoOperacion === 'CLASE_INTERNA';
              const isColegiado = session.tipoOperacion === 'TRABAJO_COLEGIADO';
              const isExpanded = expandedSessionId === session.idSesion;

              // Formatear fechas
              const formatTime = (isoString) => {
                if (!isoString) return '-';
                const d = new Date(isoString);
                return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              };

              const formatDate = (isoString) => {
                if (!isoString) return '-';
                const d = new Date(isoString);
                return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: 'numeric' });
              };

              return (
                <div 
                  key={session.idSesion} 
                  className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                    isExpanded 
                      ? 'bg-slate-950/40 border-slate-700/80 shadow-md' 
                      : 'bg-slate-950/20 border-slate-800 hover:border-slate-750'
                  }`}
                >
                  {/* Encabezado de fila */}
                  <div 
                    onClick={() => setExpandedSessionId(isExpanded ? null : session.idSesion)}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Badge de tipo de operación */}
                      <div className={`p-2 rounded-xl border shrink-0 ${
                        isColegiado
                          ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                          : isClase 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {isColegiado ? <ClipboardList className="w-4 h-4" /> : isClase ? <Monitor className="w-4 h-4" /> : <Tablet className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-200 text-xs">
                            {isColegiado ? 'Hora Colegiada / Refuerzo' : isClase ? 'Sesión Clase AIP' : 'Préstamo Externo'}
                          </span>
                          {session.gradoSeccion && session.gradoSeccion !== 'COLEGIADO' && (
                            <span className="bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-bold">
                              {session.gradoSeccion}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-550 font-mono">
                            ({session.idSesion.substring(0, 8)}...)
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] mt-0.5">
                          Docente: <span className="text-slate-350 font-medium">{session.docenteNombre}</span> • Aula: <span className="text-slate-350 font-medium">{session.aulaNombre}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      {/* Fechas e Horas */}
                      <div className="text-right text-[10px]">
                        <div className="flex items-center gap-1.5 justify-end text-slate-400">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(session.horaInicio)}</span>
                          <span className="text-slate-550">|</span>
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatTime(session.horaInicio)}</span>
                        </div>
                        {session.horaFin ? (
                          <p className="text-slate-550 mt-0.5">
                            Retornado: {formatTime(session.horaFin)}
                          </p>
                        ) : (
                          <p className="text-emerald-450 mt-0.5 animate-pulse font-bold">
                            En curso (activo)
                          </p>
                        )}
                      </div>

                      {/* Badge de Estado y Flecha */}
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isActive 
                            ? 'bg-emerald-500/10 text-emerald-440 border-emerald-500/20' 
                            : 'bg-slate-800/40 text-slate-400 border-slate-700/50'
                        }`}>
                          {isActive ? 'Activo' : 'Completado'}
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                      </div>
                    </div>
                  </div>

                  {/* Panel Detalle Desplegable */}
                  {isExpanded && (
                    <div className="border-t border-slate-800/60 bg-slate-950/60 p-4 space-y-3 animate-fadeIn">
                      <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold">
                        <span>
                          {isColegiado 
                            ? 'Detalles de la sesión colegiada' 
                            : `Equipos vinculados a la transacción (${session.detalles?.length || 0})`}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              printActa(session);
                            }}
                            className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all active:scale-95"
                          >
                            <Printer className="w-2.5 h-2.5" />
                            <span>Imprimir Acta</span>
                          </button>
                          {currentUser?.rol === 'CIST' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteTransaction(session.idSesion);
                              }}
                              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded text-[9px] font-bold cursor-pointer transition-all active:scale-95"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                              <span>Eliminar Registro</span>
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {isColegiado ? (
                        <div className="bg-slate-900/50 border border-slate-850 p-4 rounded-lg space-y-2">
                          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">Área / Categoría:</p>
                          <p className="text-xs text-slate-200 bg-slate-950/60 border border-slate-850 p-2 rounded-xl font-semibold">
                            {session.gradoSeccion || 'Sin área registrada.'}
                          </p>
                          <p className="text-xs font-bold text-teal-400 uppercase tracking-wider mt-3">Agenda / Tema a Tratar:</p>
                          <p className="text-xs text-slate-200 bg-slate-950/60 border border-slate-850 p-3 rounded-xl italic">
                            {session.descripcion || 'Sin agenda registrada.'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Actividad de planificación pedagógica. Sin asignación física de equipos.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {session.detalles?.map((det, idx) => (
                            <div 
                              key={det.idDetalle || idx} 
                              className="bg-slate-900/50 border border-slate-855 p-2.5 rounded-lg flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                {det.tipoEquipo === 'LAPTOP' ? (
                                  <Laptop className="w-3.5 h-3.5 text-blue-400" />
                                ) : (
                                  <Tablet className="w-3.5 h-3.5 text-indigo-400" />
                                )}
                                <div>
                                  <p className="font-mono text-slate-200 font-bold">{det.codPatrimonial}</p>
                                  {det.estudianteNombre && (
                                    <p className="text-[10px] text-slate-450">
                                      Estudiante: {det.estudianteNombre} {det.numeroOrden ? `(Orden N° ${det.numeroOrden})` : ''}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400">
                                {det.tipoEquipo}
                              </span>
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

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSessionToDelete(null);
        }}
        onConfirm={handleDeleteTransaction}
        title="Eliminar Registro de Transacción"
        message="¿Está seguro de que desea eliminar permanentemente este registro de transacción? Esta acción no se puede deshacer y liberará los equipos asociados si el préstamo sigue activo."
        confirmText="Eliminar Registro"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}

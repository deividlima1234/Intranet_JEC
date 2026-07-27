import React, { useState } from 'react';
import { X, Plus, Trash2, Loader2, Save } from 'lucide-react';

const ModalNuevaEvaluacion = ({ onClose, onSave, loading }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [fechaLimite, setFechaLimite] = useState('');
  const [permitirEntregasTardias, setPermitirEntregasTardias] = useState(false);
  const [criterios, setCriterios] = useState([{ nombre: '', puntajeMaximo: 20 }]);
  const [error, setError] = useState('');

  const handleAddCriterio = () => {
    setCriterios([...criterios, { nombre: '', puntajeMaximo: 0 }]);
  };

  const handleRemoveCriterio = (index) => {
    const newCriterios = [...criterios];
    newCriterios.splice(index, 1);
    setCriterios(newCriterios);
  };

  const handleChangeCriterio = (index, field, value) => {
    const newCriterios = [...criterios];
    if (field === 'puntajeMaximo') {
      newCriterios[index][field] = parseInt(value) || 0;
    } else {
      newCriterios[index][field] = value;
    }
    setCriterios(newCriterios);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validar suma = 20
    const suma = criterios.reduce((acc, curr) => acc + curr.puntajeMaximo, 0);
    if (suma !== 20) {
      setError(`La suma de los puntajes de los criterios debe ser exactamente 20. Suma actual: ${suma}`);
      return;
    }

    // Validar nombres vacíos
    for (let c of criterios) {
      if (!c.nombre.trim()) {
        setError('Todos los criterios deben tener un nombre.');
        return;
      }
      if (c.puntajeMaximo <= 0) {
        setError('Todos los criterios deben tener un puntaje mayor a 0.');
        return;
      }
    }

    onSave({
      titulo,
      descripcion,
      fechaLimite: fechaLimite ? new Date(fechaLimite).toISOString() : null,
      permitirEntregasTardias,
      criterios
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <h2 className="font-bold text-slate-100 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" />
            Nueva Evaluación / Tarea
          </h2>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 text-rose-400 border border-rose-900/50 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          <form id="form-nueva-evaluacion" onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Título de Evaluación</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej: Práctica Calificada 01"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Fecha Límite</label>
                <input
                  type="datetime-local"
                  required
                  value={fechaLimite}
                  onChange={(e) => setFechaLimite(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 [color-scheme:dark]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción / Instrucciones</label>
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Opcional. Detalles de lo que se va a evaluar..."
                rows={2}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="checkbox"
                id="entregasTardias"
                checked={permitirEntregasTardias}
                onChange={(e) => setPermitirEntregasTardias(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="entregasTardias" className="text-xs text-slate-300 cursor-pointer">
                Permitir entregas tardías (después de la fecha límite)
              </label>
            </div>

            <hr className="border-slate-800" />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 uppercase flex items-center gap-2">
                  Criterios de Calificación 
                  <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full text-[10px]">
                    Suma = {criterios.reduce((a, b) => a + b.puntajeMaximo, 0)}/20
                  </span>
                </label>
                <button
                  type="button"
                  onClick={handleAddCriterio}
                  className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded cursor-pointer transition-colors"
                >
                  + Añadir Criterio
                </button>
              </div>

              <div className="space-y-2">
                {criterios.map((c, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      required
                      value={c.nombre}
                      onChange={(e) => handleChangeCriterio(index, 'nombre', e.target.value)}
                      placeholder="Nombre del criterio"
                      className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                    <div className="relative w-24">
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        value={c.puntajeMaximo}
                        onChange={(e) => handleChangeCriterio(index, 'puntajeMaximo', e.target.value)}
                        className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 text-center focus:outline-none focus:border-indigo-500"
                        title="Puntaje Máximo"
                      />
                      <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-bold">pts</span>
                    </div>
                    {criterios.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCriterio(index)}
                        className="p-2 text-slate-500 hover:text-rose-500 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
                        title="Eliminar criterio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </form>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="form-nueva-evaluacion"
            disabled={loading}
            className="px-5 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Crear Evaluación
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalNuevaEvaluacion;

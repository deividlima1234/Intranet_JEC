import { AlertTriangle, HelpCircle, CheckCircle, Info, X } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = 'Confirmación', 
  message = '¿Está seguro de realizar esta acción?', 
  confirmText = 'Confirmar', 
  cancelText = 'Cancelar', 
  type = 'info' 
}) {
  if (!isOpen) return null;

  // Determinar colores y el icono según el tipo
  let icon = <HelpCircle className="w-6 h-6 text-indigo-400" />;
  let iconBg = 'bg-indigo-500/10';
  let confirmBtnClass = 'bg-emerald-500 hover:bg-emerald-400 text-slate-950';

  if (type === 'danger') {
    icon = <AlertTriangle className="w-6 h-6 text-rose-400" />;
    iconBg = 'bg-rose-500/10';
    confirmBtnClass = 'bg-rose-500 hover:bg-rose-455 text-slate-950';
  } else if (type === 'warning') {
    icon = <AlertTriangle className="w-6 h-6 text-amber-400" />;
    iconBg = 'bg-amber-500/10';
    confirmBtnClass = 'bg-amber-500 hover:bg-amber-400 text-slate-950';
  } else if (type === 'success') {
    icon = <CheckCircle className="w-6 h-6 text-emerald-400" />;
    iconBg = 'bg-emerald-500/10';
    confirmBtnClass = 'bg-emerald-500 hover:bg-emerald-400 text-slate-950';
  } else if (type === 'info') {
    icon = <Info className="w-6 h-6 text-sky-400" />;
    iconBg = 'bg-sky-500/10';
    confirmBtnClass = 'bg-sky-500 hover:bg-sky-400 text-slate-950';
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      {/* Caja del modal con animación de entrada */}
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative space-y-6 transform scale-100 transition-all duration-300">
        
        {/* Botón Cerrar X */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado y Mensaje */}
        <div className="flex gap-4 items-start">
          <div className={`p-3 rounded-2xl shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div className="space-y-1.5 flex-1">
            <h3 className="text-base font-bold text-slate-100">{title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 cursor-pointer transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all active:scale-95 ${confirmBtnClass}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>
  );
}

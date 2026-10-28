import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturó un error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  componentDidUpdate(prevProps) {
    // Si cambian los resetKeys (por ej. el usuario cambia de pestaña o curso), reseteamos el error automáticamente
    if (this.props.resetKeys && prevProps.resetKeys) {
      const hasChanged = this.props.resetKeys.some(
        (key, idx) => key !== prevProps.resetKeys[idx]
      );
      if (hasChanged && this.state.hasError) {
        this.resetError();
      }
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { fallbackTitle, fallbackMessage } = this.props;

      return (
        <div className="w-full p-6 my-4 bg-slate-900/60 border border-slate-800 rounded-3xl text-center flex flex-col items-center justify-center space-y-4 animate-fadeIn">
          <div className="p-3.5 bg-rose-500/10 text-rose-450 border border-rose-500/20 rounded-2xl">
            <AlertTriangle className="w-8 h-8 text-rose-450" />
          </div>

          <div className="max-w-md space-y-1.5">
            <h3 className="text-sm md:text-base font-bold text-slate-100">
              {fallbackTitle || 'Hubo un inconveniente al cargar esta sección'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {fallbackMessage || 'La sección no se pudo mostrar correctamente. Puedes reintentar la carga o navegar a otra pestaña.'}
            </p>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <div className="w-full max-w-xl text-left bg-slate-950 border border-slate-800/80 p-3 rounded-xl overflow-x-auto">
              <p className="text-[11px] font-mono text-rose-400 font-semibold mb-1">
                {this.state.error.toString()}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={this.resetError}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-500/10"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reintentar</span>
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-slate-950 hover:bg-slate-850 text-slate-300 border border-slate-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Recargar página completa</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

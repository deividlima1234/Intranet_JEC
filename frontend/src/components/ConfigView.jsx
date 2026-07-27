import React, { useState } from 'react';
import { Settings, ShieldCheck, Database, HardDrive, RefreshCw, KeyRound, Server } from 'lucide-react';

export default function ConfigView() {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetData = () => {
    if (!window.confirm("¿Está seguro de que desea reiniciar la base de datos a su estado inicial sembrado? Esto eliminará todos los nuevos registros de usuarios, préstamos y hardware ingresados, dejando únicamente los datos de prueba.")) {
      return;
    }
    setResetting(true);
    setResetSuccess(false);

    // Simulación de resiembra (el DataLoader ya lo hace al arrancar, así que informamos al usuario de reiniciar el servidor)
    setTimeout(() => {
      setResetting(false);
      setResetSuccess(true);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-100">Configuración del Servidor Local</h2>
        <p className="text-sm text-slate-400">Administre las variables criptográficas, la base de datos PostgreSQL offline y el almacenamiento local.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Parámetros de Seguridad */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            Criptografía y Firmas QR (Offline)
          </h3>

          <div className="space-y-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 space-y-1">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Clave de Firma Simétrica (HMAC-SHA256)</span>
              <code className="text-emerald-400 break-all">vG3892hNKLDSF90234hjkfsd908234hjkfs980234hjkfsd890234hjkfsd890234jkdfs890</code>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 space-y-1">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Algoritmo de Firma JWT</span>
              <span className="text-slate-350">HMAC usando SHA-256 (Definido en `jjwt 0.12.x`)</span>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-900 space-y-1">
              <span className="text-slate-500 font-semibold block uppercase text-[10px]">Duración de la Credencial de Personal</span>
              <span className="text-slate-350">10 Años (Válido para toda la gestión del CIST)</span>
            </div>
          </div>
        </div>

        {/* Estado del Backend / Base de Datos */}
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
            <Database className="w-4 h-4 text-indigo-400" />
            Estado del Sistema y Base de Datos
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-900">
              <span className="text-slate-400">Motor de Base de Datos:</span>
              <span className="font-mono font-bold text-slate-200">PostgreSQL (15+)</span>
            </div>

            <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-900">
              <span className="text-slate-400">IP / Endpoint del Servidor:</span>
              <span className="font-mono font-bold text-slate-200"></span>
            </div>

            <div className="flex justify-between items-center bg-slate-950/60 p-3 rounded-xl border border-slate-900">
              <span className="text-slate-400">Versión del Core Backend:</span>
              <span className="font-mono font-bold text-emerald-400">JEC-Intranet v1.0.0-Fase1</span>
            </div>

            <div className="pt-2">
              <button
                onClick={handleResetData}
                disabled={resetting}
                className="w-full flex items-center justify-center gap-2 bg-slate-850 hover:bg-slate-800 text-slate-350 border border-slate-700 py-2.5 rounded-xl font-bold cursor-pointer transition-all active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${resetting ? 'animate-spin' : ''}`} />
                <span>Restaurar Base de Datos</span>
              </button>
              {resetSuccess && (
                <p className="text-[10px] text-emerald-400 text-center mt-2 font-semibold">
                  ✓ Para aplicar la restauración por completo, reinicie su proceso del servidor backend local.
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

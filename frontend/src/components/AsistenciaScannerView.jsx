import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Settings, 
  UserCheck, 
  Users, 
  WifiOff, 
  ArrowLeft 
} from 'lucide-react';

// Utilidad para reproducir alertas sonoras offline mediante Web Audio API
const playTone = (type) => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    if (type === 'success') {
      // Un tono agudo y alegre (Bip!)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } else if (type === 'warning') {
      // Dos tonos rápidos de advertencia (Bip-Bip!)
      const osc1 = audioCtx.createOscillator();
      const gain1 = audioCtx.createGain();
      osc1.connect(gain1);
      gain1.connect(audioCtx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(650, audioCtx.currentTime);
      gain1.gain.setValueAtTime(0.06, audioCtx.currentTime);
      osc1.start();
      osc1.stop(audioCtx.currentTime + 0.08);

      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        osc2.connect(gain2);
        gain2.connect(audioCtx.destination);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(650, audioCtx.currentTime);
        gain2.gain.setValueAtTime(0.06, audioCtx.currentTime);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.08);
      }, 120);
    } else if (type === 'error') {
      // Tono grave y largo de error (Bzzzzz)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    }
  } catch (e) {
    console.warn("Audio Context bloqueado o no soportado:", e);
  }
};

export default function AsistenciaScannerView() {
  const [selectedGrade, setSelectedGrade] = useState(() => {
    const saved = localStorage.getItem('jec_tablet_grade');
    return saved ? parseInt(saved, 10) : null;
  });

  const [scannerActive, setScannerActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (trasera) o 'user' (frontal)
  const [lastScannedQr, setLastScannedQr] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado del overlay gigante de escaneo
  const [overlay, setOverlay] = useState(null); // { type: 'success'|'warning'|'duplicate'|'error', title: '', desc: '', alert: '' }

  const scannerRef = useRef(null);
  const overlayTimeoutRef = useRef(null);
  const throttleRef = useRef(false);

  // Manejo del almacenamiento del grado en la tableta
  const handleSelectGrade = (grade) => {
    setSelectedGrade(grade);
    localStorage.setItem('jec_tablet_grade', grade.toString());
  };

  const handleResetGrade = () => {
    stopScanner();
    setSelectedGrade(null);
    localStorage.removeItem('jec_tablet_grade');
  };

  // Iniciar / detener el scanner según el grado configurado
  useEffect(() => {
    if (selectedGrade) {
      startScanner();
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
      if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    };
  }, [selectedGrade]);

  const startScanner = (mode = facingMode) => {
    setScannerActive(true);
    setOverlay(null);
    if (overlayTimeoutRef.current) clearTimeout(overlayTimeoutRef.current);
    
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("attendance-qr-reader");
      
      const onScanSuccess = (decodedText) => {
        // Evitar procesar lecturas múltiples en ráfaga (throttle de 3.5 segundos)
        if (throttleRef.current) return;
        
        throttleRef.current = true;
        processAttendanceScan(decodedText);
      };

      html5QrCode.start(
        { facingMode: mode }, 
        {
          fps: 10, 
          qrbox: { width: 260, height: 260 } 
        },
        onScanSuccess,
        (errorMessage) => {}
      )
      .catch((err) => {
        // Fallback al lado opuesto (ej: en laptop sin cámara trasera)
        const fallbackMode = mode === 'environment' ? 'user' : 'environment';
        console.warn(`Fallo cámara ${mode}, reintentando con ${fallbackMode}...`);
        return html5QrCode.start(
          { facingMode: fallbackMode },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 }
          },
          onScanSuccess,
          (errorMessage) => {}
        );
      })
      .catch((err) => {
        console.error("Fallo definitivo al iniciar cámara: ", err);
        setOverlay({
          type: 'error',
          title: 'Cámara Bloqueada',
          desc: 'No se pudo acceder a la cámara del dispositivo. Otorgue permisos de cámara al navegador.',
          alert: ''
        });
        playTone('error');
        setScannerActive(false);
      });
      
      scannerRef.current = html5QrCode;
    }, 200);
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        return scannerRef.current.stop()
          .then(() => {
            setScannerActive(false);
            scannerRef.current = null;
          })
          .catch(err => {
            console.error("Error al detener cámara:", err);
            setScannerActive(false);
            scannerRef.current = null;
          });
      } else {
        setScannerActive(false);
        scannerRef.current = null;
        return Promise.resolve();
      }
    } else {
      setScannerActive(false);
      return Promise.resolve();
    }
  };

  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    
    if (scannerActive) {
      stopScanner().then(() => {
        setTimeout(() => {
          startScanner(nextMode);
        }, 300);
      });
    }
  };

  // Enviar el token escaneado al servidor
  const processAttendanceScan = async (qrToken) => {
    setLoading(true);
    setLastScannedQr(qrToken);

    try {
      const response = await fetch('/api/v1/asistencias/escanear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrToken,
          gradoTablet: selectedGrade
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Asistencia registrada con éxito
        const hasWarning = !!data.mensajeAlerta;
        
        if (hasWarning) {
          // Registro exitoso pero grado incorrecto (Advertencia)
          setOverlay({
            type: 'warning',
            title: 'ASISTENCIA REGISTRADA',
            desc: `Estudiante: ${data.apellidos}, ${data.nombres}\nGrado y Sección: ${data.grado}° "${data.seccion}"`,
            alert: data.mensajeAlerta
          });
          playTone('warning');
        } else {
          // Registro limpio (Éxito)
          setOverlay({
            type: 'success',
            title: data.estado === 'PUNTUAL' ? 'INGRESO PUNTUAL' : 'INGRESO TARDANZA',
            desc: `Estudiante: ${data.apellidos}, ${data.nombres}\nGrado y Sección: ${data.grado}° "${data.seccion}"\nHora: ${data.horaIngreso.slice(0, 5)}`,
            alert: '¡Registro de asistencia exitoso!'
          });
          playTone('success');
        }
      } else {
        // Falló la llamada: DNI no registrado, Token inválido o Duplicado
        const message = data.message || '';
        
        if (message.includes('ya registró') || message.includes('registrado hoy')) {
          setOverlay({
            type: 'duplicate',
            title: 'REGISTRO PREVIO',
            desc: message,
            alert: 'Usted ya registró su ingreso el día de hoy.'
          });
          playTone('warning');
        } else {
          setOverlay({
            type: 'error',
            title: 'CÓDIGO NO VÁLIDO',
            desc: message || 'No se reconoce la credencial JEC.',
            alert: 'Por favor intente nuevamente o acuda a un Auxiliar.'
          });
          playTone('error');
        }
      }
    } catch (err) {
      setOverlay({
        type: 'error',
        title: 'FALLO DE CONEXIÓN',
        desc: 'No se pudo conectar con el servidor local. Verifique el estado de la red LAN.',
        alert: ''
      });
      playTone('error');
    } finally {
      setLoading(false);
      
      // Activar un temporizador de 3.5 segundos para mostrar el overlay y luego regresar a esperar escaneo
      overlayTimeoutRef.current = setTimeout(() => {
        setOverlay(null);
        // Quitar el candado de throttle una vez que se apaga el overlay para que vuelva a escanear
        throttleRef.current = false;
      }, 3500);
    }
  };

  // ================= VISTA 1: CONFIGURAR GRADO =================
  if (selectedGrade === null) {
    return (
      <div className="space-y-8 animate-fadeIn max-w-4xl mx-auto">
        <div className="border-b border-slate-800 pb-4 text-center">
          <h2 className="text-2xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 text-emerald-400" />
            Configuración de Estación de Asistencia
          </h2>
          <p className="text-sm text-slate-400 mt-1">Configure esta tableta seleccionando el Grado escolar que registrará en la entrada.</p>
        </div>

        <div className="bg-slate-900/30 border border-slate-800 rounded-3xl p-8 space-y-6 text-center shadow-xl">
          <h3 className="text-lg font-bold text-slate-200">Seleccione el Grado del Dispositivo:</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => handleSelectGrade(g)}
                className="bg-slate-950 hover:bg-emerald-500 hover:text-slate-950 border border-slate-800 hover:border-emerald-400 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 group shadow-lg"
              >
                <span className="text-3xl font-extrabold tracking-tight group-hover:scale-110 transition-transform">{g}°</span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 group-hover:text-slate-950">Grado</span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs border-t border-slate-850 pt-6">
            <Users className="w-4 h-4 text-slate-600" />
            <span>Habrá un quiosco activo por cada uno de los 5 grados de la institución.</span>
          </div>
        </div>
      </div>
    );
  }

  // ================= VISTA 2: QUIOSCO DE ESCANEO ACTIVO =================
  return (
    <div className="space-y-6 animate-fadeIn max-w-lg mx-auto relative min-h-[500px]">
      
      {/* Cabecera de Quiosco */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-base uppercase leading-none">Quiosco de Asistencia</h3>
            <p className="text-[11px] font-bold text-emerald-400 uppercase mt-1 tracking-wider">{selectedGrade}° Grado</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={toggleCamera}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-slate-200 cursor-pointer active:scale-90"
            title="Rotar cámara"
          >
            <Camera className="w-4.5 h-4.5" />
          </button>
          <button
            onClick={handleResetGrade}
            className="flex items-center gap-1 px-3 py-1.5 bg-rose-950/40 text-rose-450 border border-rose-900/40 rounded-xl text-xs font-bold cursor-pointer active:scale-90 transition-all"
            title="Cambiar grado"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Grado</span>
          </button>
        </div>
      </div>

      {/* Lector QR en Pantalla */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/80 shadow-2xl p-4 flex flex-col items-center">
        
        {/* Marcador del escáner en pantalla */}
        <div className="w-full aspect-square max-w-sm rounded-2xl overflow-hidden relative border border-slate-900 bg-slate-900/20">
          <div id="attendance-qr-reader" className="w-full h-full"></div>
          
          {/* Laser de animación decorativo */}
          {!overlay && (
            <div className="absolute inset-x-8 top-1/2 h-0.5 bg-emerald-500/60 shadow-[0_0_10px_#10b981] animate-bounce z-10 pointer-events-none"></div>
          )}
        </div>

        {/* Mensaje de Standby */}
        <div className="mt-4 text-center space-y-1">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest animate-pulse">En Espera de Credencial QR</p>
          <p className="text-[10px] text-slate-550">Acerque su tarjeta de identificación frente a la cámara.</p>
        </div>

        {/* Estado Offline / Servidor local */}
        <div className="w-full border-t border-slate-900/60 mt-4 pt-3 flex items-center justify-center gap-1.5 text-[9px] text-slate-600 font-bold uppercase tracking-wider">
          <WifiOff className="w-3.5 h-3.5 text-slate-650" />
          <span>Servidor Local Offline LAN JEC</span>
        </div>
      </div>

      {/* OVERLAY GIGANTE DE COMENTARIO TRAS ESCANEO */}
      {overlay && (
        <div className={`fixed inset-0 flex flex-col items-center justify-center p-6 z-50 animate-fadeIn backdrop-blur-md ${
          overlay.type === 'success' 
            ? 'bg-emerald-950/95' 
            : overlay.type === 'warning'
            ? 'bg-amber-950/95'
            : overlay.type === 'duplicate'
            ? 'bg-yellow-950/95'
            : 'bg-rose-950/95'
        }`}>
          
          <div className="max-w-md w-full text-center space-y-6 animate-scaleIn">
            
            {/* Icono de Estado */}
            <div className="flex justify-center">
              {overlay.type === 'success' && (
                <div className="p-5 bg-emerald-500/10 text-emerald-400 rounded-full border-2 border-emerald-400/40">
                  <UserCheck className="w-16 h-16" />
                </div>
              )}
              {overlay.type === 'warning' && (
                <div className="p-5 bg-amber-500/10 text-amber-400 rounded-full border-2 border-amber-400/40">
                  <AlertTriangle className="w-16 h-16" />
                </div>
              )}
              {overlay.type === 'duplicate' && (
                <div className="p-5 bg-yellow-500/10 text-yellow-400 rounded-full border-2 border-yellow-400/40">
                  <AlertTriangle className="w-16 h-16 animate-bounce" />
                </div>
              )}
              {overlay.type === 'error' && (
                <div className="p-5 bg-rose-500/10 text-rose-400 rounded-full border-2 border-rose-400/40">
                  <XCircle className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Título de Estado */}
            <h1 className={`text-3xl font-extrabold tracking-tight uppercase ${
              overlay.type === 'success' 
                ? 'text-emerald-450' 
                : overlay.type === 'warning'
                ? 'text-amber-450'
                : overlay.type === 'duplicate'
                ? 'text-yellow-450'
                : 'text-rose-450'
            }`}>
              {overlay.title}
            </h1>

            {/* Descripción del Estudiante */}
            <div className="bg-slate-950/60 border border-slate-900/60 p-6 rounded-3xl space-y-2">
              <pre className="text-base font-bold text-slate-100 font-sans whitespace-pre-line leading-relaxed">
                {overlay.desc}
              </pre>
            </div>

            {/* Alerta o instrucción */}
            {overlay.alert && (
              <p className={`text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-full inline-block ${
                overlay.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : overlay.type === 'warning'
                  ? 'bg-amber-500/10 text-amber-450 border border-amber-500/25 animate-pulse'
                  : overlay.type === 'duplicate'
                  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {overlay.alert}
              </p>
            )}

            {/* Barra de progreso de retorno rápido */}
            <div className="w-48 h-1 bg-slate-900 mx-auto rounded-full overflow-hidden">
              <div className={`h-full rounded-full animate-progressShrink ${
                overlay.type === 'success' 
                  ? 'bg-emerald-500' 
                  : overlay.type === 'warning'
                  ? 'bg-amber-500'
                  : overlay.type === 'duplicate'
                  ? 'bg-yellow-500'
                  : 'bg-rose-500'
              }`}></div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

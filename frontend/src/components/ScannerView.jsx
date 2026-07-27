import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  User, 
  Layers, 
  Laptop, 
  Tablet, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Trash2, 
  Play, 
  Square,
  Sparkles,
  ClipboardList,
  RotateCcw,
  RefreshCw,
  Search,
  Check,
  Info,
  CheckCircle,
  AlertCircle,
  Printer,
  X
} from 'lucide-react';
import { printActa } from '../utils/printActa';

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime); // 1000Hz (pleasant beep frequency)
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime); // mild volume

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.08); // short beep duration of 80ms
  } catch (e) {
    console.warn("No se pudo reproducir el sonido de escaneo:", e);
  }
};

export default function ScannerView() {
  const [operationMode, setOperationMode] = useState('CLASE_INTERNA'); // 'CLASE_INTERNA', 'PRESTAMO_EXTERNO', 'TRABAJO_COLEGIADO', 'DEVOLUCION_INDIVIDUAL'
  
  // Datos del formulario de Inicio de Clase / Préstamo
  const [teacherJwt, setTeacherJwt] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [selectedAula, setSelectedAula] = useState('1');
  const [gradoSeccion, setGradoSeccion] = useState('3A');
  const [gradosSeccionesList, setGradosSeccionesList] = useState([]);
  const [descripcion, setDescripcion] = useState('');
  const [colegiadoArea, setColegiadoArea] = useState('Letras');
  const [customArea, setCustomArea] = useState('');

  // Estados para el Modo Kiosco (Estación de Puerta)
  const [kioskMode, setKioskMode] = useState(true);
  const [kioskStep, setKioskStep] = useState('WAITING_FOR_SCAN'); // 'WAITING_FOR_SCAN', 'SELECT_MODE', 'FORM_CLASE', 'FORM_COLEGIADO', 'FORM_PRESTAMO', 'RETURN_CONFIRM', 'SUCCESS_INITIATE', 'SUCCESS_RETURN'
  const [successCountdown, setSuccessCountdown] = useState(5);
  
  // Para Modo Préstamo Externo: Equipos escaneados temporalmente
  const [scannedEquipos, setScannedEquipos] = useState([]);
  const [manualEquipoQr, setManualEquipoQr] = useState('');

  // Para Modo Devolución: Docente responsable y sesión seleccionada
  const [activeSessions, setActiveSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null); // Sesión activa elegida para devolver
  const [returnEquipoQr, setReturnEquipoQr] = useState('');
  const [searchActiveTeacher, setSearchActiveTeacher] = useState('');

  // Estados de carga e interfaz
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(null); // { type: 'success'|'error', text: '', data?: any }

  // Control de scanner QR real
  const [scannerActive, setScannerActive] = useState(false);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (trasera) o 'user' (frontal)
  const scannerRef = useRef(null);

  // Listado de docentes cargados de la DB y modo de selección
  const [docentes, setDocentes] = useState([]);
  const [docenteInputMode, setDocenteInputMode] = useState('scan'); // 'scan' o 'list'
  const [scannedReturnQrs, setScannedReturnQrs] = useState([]);
  const [scannerPurpose, setScannerPurpose] = useState('docente_prestamo'); // 'docente_prestamo', 'docente_devolucion_clase', 'docente_devolucion_prestamo', 'equipo_devolucion_continuo'
  const lastScannedRef = useRef({ text: '', time: 0 });
  const docentesRef = useRef([]);
  const activeSessionsRef = useRef([]);
  const selectedSessionRef = useRef(null);
  const scannedReturnQrsRef = useRef([]);
  const operationModeRef = useRef('');

  useEffect(() => {
    docentesRef.current = docentes;
  }, [docentes]);

  useEffect(() => {
    activeSessionsRef.current = activeSessions;
  }, [activeSessions]);

  useEffect(() => {
    selectedSessionRef.current = selectedSession;
  }, [selectedSession]);

  useEffect(() => {
    scannedReturnQrsRef.current = scannedReturnQrs;
  }, [scannedReturnQrs]);

  useEffect(() => {
    operationModeRef.current = operationMode;
  }, [operationMode]);

  const resetToKiosk = () => {
    stopScanner();
    setTeacherJwt('');
    setTeacherName('');
    setDescripcion('');
    setScannedEquipos([]);
    setSelectedSession(null);
    setScannedReturnQrs([]);
    setResultMessage(null);
    setKioskStep('WAITING_FOR_SCAN');
    fetchActiveSessions();
  };

  useEffect(() => {
    fetchActiveSessions();
    fetchDocentes();
    fetchGradosSecciones();
  }, []);

  useEffect(() => {
    if (kioskMode && kioskStep === 'WAITING_FOR_SCAN') {
      const timer = setTimeout(() => {
        startScanner('kiosk_teacher');
      }, 300);
      return () => {
        clearTimeout(timer);
        stopScanner();
      };
    }
  }, [kioskMode, kioskStep]);

  useEffect(() => {
    let interval = null;
    if (kioskMode && (kioskStep === 'SUCCESS_INITIATE' || kioskStep === 'SUCCESS_RETURN')) {
      setSuccessCountdown(5);
      interval = setInterval(() => {
        setSuccessCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            resetToKiosk();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [kioskStep, kioskMode]);

  const fetchDocentes = async () => {
    try {
      const response = await fetch('/api/v1/usuarios');
      if (response.ok) {
        const data = await response.json();
        const listDocentes = data.filter(u => u.rol !== 'ESTUDIANTE');
        setDocentes(listDocentes);
      }
    } catch (e) {
      console.error("Error al obtener docentes:", e);
    }
  };
  const fetchGradosSecciones = async () => {
    try {
      const response = await fetch('/api/v1/usuarios/grados-secciones');
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setGradosSeccionesList(data);
          // Set the first one as default if gradoSeccion is empty or not in the list
          if (data.indexOf(gradoSeccion) === -1) {
            setGradoSeccion(data[0]);
          }
          return;
        }
      }
    } catch (e) {
      console.error("Error al obtener grados y secciones:", e);
    }
    // Fallback list
    const fallbackList = ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B'];
    setGradosSeccionesList(fallbackList);
    setGradoSeccion('3A');
  };
  const fetchActiveSessions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/sesiones/activas');
      if (response.ok) {
        const data = await response.json();
        setActiveSessions(data);
        
        // Si hay una sesión actualmente seleccionada, la actualizamos con la nueva data del servidor
        if (selectedSession) {
          const updated = data.find(s => s.idSesion === selectedSession.idSesion);
          setSelectedSession(updated || null);
        }
      }
    } catch (e) {
      console.error("Error al obtener sesiones activas desde el backend:", e);
    } finally {
      setLoading(false);
    }
  };

  const findDocenteByQr = (qr) => {
    if (!qr) return null;
    const cleanQr = qr.trim();
    let matchedDoc = docentesRef.current.find(d => d.qrToken === cleanQr);
    if (matchedDoc) return matchedDoc;
    
    if (cleanQr.includes(':')) {
      const dni = cleanQr.split(':')[0].trim();
      return docentesRef.current.find(d => d.dni === dni) || null;
    }
    
    if (cleanQr.startsWith('eyJ')) {
      try {
        const payloadBase64 = cleanQr.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/')));
        const dni = decodedPayload.dni;
        if (dni) {
          return docentesRef.current.find(d => d.dni === dni) || null;
        }
      } catch (e) {
        console.error("Error decoding JWT payload in findDocenteByQr:", e);
      }
    }
    
    return null;
  };

  const handleKioskTeacherScan = (qrDocente) => {
    const matchedDoc = findDocenteByQr(qrDocente);
    
    if (!matchedDoc) {
      setResultMessage({ type: 'error', text: 'El código QR escaneado no corresponde a un personal docente o administrativo registrado.' });
      return;
    }

    setTeacherJwt(qrDocente.trim());
    setTeacherName(`${matchedDoc.apellidos}, ${matchedDoc.nombres}`);

    // Check active sessions in activeSessions list
    const teacherSessions = activeSessionsRef.current.filter(s => {
      return s.docenteNombre.toLowerCase().includes(matchedDoc.nombres.toLowerCase()) &&
             s.docenteNombre.toLowerCase().includes(matchedDoc.apellidos.toLowerCase());
    });

    if (teacherSessions.length > 0) {
      stopScanner().then(() => {
        setSelectedSession(teacherSessions[0]);
        setKioskStep('RETURN_CONFIRM');
        setResultMessage(null);
      });
    } else {
      stopScanner().then(() => {
        setKioskStep('SELECT_MODE');
        setResultMessage(null);
      });
    }
  };

  const startScanner = (purpose = 'docente_prestamo', forceMode = null) => {
    // Si por error se pasa el evento click de React como purpose, usar el valor por defecto
    if (purpose && typeof purpose === 'object' && purpose.nativeEvent) {
      purpose = 'docente_prestamo';
    }
    const modeToUse = forceMode || facingMode;
    setScannerPurpose(purpose);
    setScannerActive(true);
    setResultMessage(null);
    
    setTimeout(() => {
      const html5QrCode = new Html5Qrcode("qr-reader");
      
      const onScanSuccess = (decodedText) => {
        // Prevent double scans in short window
        const now = Date.now();
        if (lastScannedRef.current.text === decodedText && now - lastScannedRef.current.time < 3000) {
          return;
        }
        lastScannedRef.current = { text: decodedText, time: now };

        if (purpose === 'kiosk_teacher') {
          if (decodedText.startsWith('eyJ') || decodedText.includes(':')) {
            playBeep();
            handleKioskTeacherScan(decodedText);
          } else {
            setResultMessage({ type: 'error', text: 'Debe escanear el QR de su credencial de Docente.' });
          }
        }
        else if (purpose === 'docente_prestamo') {
          if (decodedText.startsWith('eyJ') || decodedText.includes(':')) {
            playBeep();
            if (operationModeRef.current === 'DEVOLUCION_INDIVIDUAL') {
              handleSelectDocenteByJwt(decodedText);
            } else {
              setTeacherJwt(decodedText);
              const matchedDoc = findDocenteByQr(decodedText);
              if (matchedDoc) {
                setTeacherName(`${matchedDoc.apellidos}, ${matchedDoc.nombres}`);
              } else if (decodedText.includes(':')) {
                setTeacherName(`Docente DNI: ${decodedText.split(':')[0]}`);
              } else {
                setTeacherName("Docente Escaneado");
              }
              setResultMessage({ type: 'success', text: 'Código QR de Docente escaneado con éxito.' });
            }
            stopScanner();
          } else {
            if (operationModeRef.current === 'DEVOLUCION_INDIVIDUAL') {
              setResultMessage({ type: 'error', text: 'Debe identificar primero al Docente responsable seleccionándolo o escaneando su fotocheck.' });
            } else {
              setResultMessage({ type: 'error', text: 'Debe escanear el QR de su credencial de Docente.' });
            }
            stopScanner();
          }
        }
        else if (purpose === 'docente_devolucion_clase') {
          handleAuthorizeAndFinalizeClase(decodedText);
        }
        else if (purpose === 'docente_devolucion_prestamo') {
          handleAuthorizeAndReturnPrestamo(decodedText);
        }
        else if (purpose === 'equipo_devolucion_continuo') {
          handleContinuousScanEquipo(decodedText);
        }
        else if (purpose === 'equipo_prestamo_continuo') {
          handleScanEquipo(decodedText);
        }
      };

      html5QrCode.start(
        { facingMode: modeToUse }, 
        {
          fps: 10, 
          qrbox: { width: 250, height: 250 } 
        },
        onScanSuccess,
        (errorMessage) => {}
      )
      .catch((err) => {
        // Fallback al modo opuesto si falla (ej: desktop que no tiene trasera)
        const fallbackMode = modeToUse === 'environment' ? 'user' : 'environment';
        console.warn(`Fallo al iniciar cámara con ${modeToUse}, reintentando con ${fallbackMode}...`);
        return html5QrCode.start(
          { facingMode: fallbackMode },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 }
          },
          onScanSuccess,
          (errorMessage) => {}
        );
      })
      .catch((err) => {
        console.error("Error al iniciar cámara: ", err);
        setResultMessage({ 
          type: 'error', 
          text: 'No se pudo acceder a la cámara. Por favor asegúrese de otorgar permisos en su navegador o de usar una conexión segura (localhost/HTTPS).' 
        });
        setScannerActive(false);
      });
      
      scannerRef.current = html5QrCode;
    }, 150);
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
      const currentPurpose = scannerPurpose;
      stopScanner().then(() => {
        // Esperamos un momento breve para que la cámara anterior se libere antes de encender la otra
        setTimeout(() => {
          startScanner(currentPurpose, nextMode);
        }, 300);
      });
    }
  };

  const handleSelectDocenteByJwt = (jwt) => {
    const matchedDoc = findDocenteByQr(jwt);
    let session = null;
    
    if (matchedDoc) {
      session = activeSessionsRef.current.find(s => 
        s.docenteNombre.toLowerCase().includes(matchedDoc.nombres.toLowerCase()) &&
        s.docenteNombre.toLowerCase().includes(matchedDoc.apellidos.toLowerCase())
      );
    }

    if (session) {
      setSelectedSession(session);
      setScannedReturnQrs([]); // Limpiar la lista de retornos escaneados para esta nueva sesión
      setResultMessage({ type: 'success', text: `Docente ${session.docenteNombre} identificado. Cargando equipos asignados.` });
    } else {
      setResultMessage({ type: 'error', text: 'No se encontró ninguna sesión activa vinculada a este docente.' });
    }
  };

  const handleAuthorizeAndFinalizeClase = async (qrDocente) => {
    playBeep();
    const matchedDoc = findDocenteByQr(qrDocente);
    let isAuthorized = false;
    
    if (matchedDoc) {
      isAuthorized = selectedSessionRef.current.docenteNombre.toLowerCase().includes(matchedDoc.nombres.toLowerCase()) &&
                     selectedSessionRef.current.docenteNombre.toLowerCase().includes(matchedDoc.apellidos.toLowerCase());
    }

    if (isAuthorized) {
      stopScanner();
      await handleFinalizeSession(selectedSessionRef.current.idSesion, qrDocente);
    } else {
      setResultMessage({ type: 'error', text: 'Autorización denegada: El QR escaneado no corresponde al responsable registrado para esta sesión.' });
    }
  };

  const handleAuthorizeAndReturnPrestamo = async (qrDocente) => {
    playBeep();
    const matchedDoc = findDocenteByQr(qrDocente);
    let isAuthorized = false;
    
    if (matchedDoc) {
      isAuthorized = selectedSessionRef.current.docenteNombre.toLowerCase().includes(matchedDoc.nombres.toLowerCase()) &&
                     selectedSessionRef.current.docenteNombre.toLowerCase().includes(matchedDoc.apellidos.toLowerCase());
    }

    if (isAuthorized) {
      stopScanner();
      setLoading(true);
      setResultMessage({ type: 'success', text: 'Autorización concedida. Procesando devolución de equipos...' });
      
      try {
        let successCount = 0;
        let failCount = 0;
        
        let lastSessionData = null;
        for (const qr of scannedReturnQrsRef.current) {
          const response = await fetch(`/api/v1/sesiones/retorno-equipo?qrEquipo=${qr}&qrDocente=${encodeURIComponent(qrDocente)}`, {
            method: 'PUT'
          });
          if (response.ok) {
            successCount++;
            lastSessionData = await response.json();
          } else {
            failCount++;
          }
        }
        
        if (failCount === 0) {
          setResultMessage({ 
            type: 'success', 
            text: `Devolución exitosa de ${successCount} equipos. Sesión de préstamo finalizada.`,
            data: lastSessionData
          });
          if (kioskMode) {
            setKioskStep('SUCCESS_RETURN');
          } else {
            setScannedReturnQrs([]);
            setSelectedSession(null);
          }
          fetchActiveSessions();
        } else {
          setResultMessage({ 
            type: 'error', 
            text: `Se devolvieron ${successCount} equipos, pero falló la devolución de ${failCount} equipos.` 
          });
          setScannedReturnQrs(prev => prev.filter(q => !scannedReturnQrs.slice(0, successCount).includes(q)));
          fetchActiveSessions();
        }
      } catch (err) {
        setResultMessage({ type: 'error', text: 'Error de red al registrar la devolución de los equipos.' });
      } finally {
        setLoading(false);
      }
    } else {
      setResultMessage({ type: 'error', text: 'Autorización denegada: El QR escaneado no corresponde al docente responsable de este préstamo.' });
    }
  };

  const handleContinuousScanEquipo = (qr) => {
    const now = Date.now();
    if (lastScannedRef.current.text === qr && (now - lastScannedRef.current.time) < 2000) {
      return;
    }
    lastScannedRef.current = { text: qr, time: now };
    playBeep();

    const targetDetail = selectedSession.detalles?.find(d => d.qrEquipo === qr);
    if (!targetDetail) {
      setResultMessage({ type: 'error', text: `El equipo ${qr} no pertenece a esta sesión de préstamo.` });
      return;
    }

    if (targetDetail.ubicacionActual === 'EN_AIP') {
      setResultMessage({ type: 'warning', text: `El equipo ${qr} ya fue devuelto previamente al AIP.` });
      return;
    }

    if (scannedReturnQrs.includes(qr)) {
      setResultMessage({ type: 'success', text: `El equipo ${qr} ya está en la lista de devolución.` });
      return;
    }

    const pendingInDb = selectedSession.detalles?.filter(d => d.ubicacionActual !== 'EN_AIP') || [];
    const newScannedList = [...scannedReturnQrs, qr];
    setScannedReturnQrs(newScannedList);

    if (newScannedList.length >= pendingInDb.length) {
      setResultMessage({ 
        type: 'success', 
        text: `Todos los ${pendingInDb.length} equipos pendientes fueron escaneados. Cerrando escáner...` 
      });
      stopScanner();
    } else {
      setResultMessage({ 
        type: 'success', 
        text: `Equipo ${qr} agregado a la lista (${newScannedList.length} de ${pendingInDb.length} listos).` 
      });
    }
  };

  const handleScanEquipo = (qr) => {
    if (!qr.trim()) return;
    const cleanQr = qr.trim();

    if (scannerActive && scannerPurpose === 'equipo_prestamo_continuo') {
      const now = Date.now();
      if (lastScannedRef.current.text === cleanQr && (now - lastScannedRef.current.time) < 2000) {
        return;
      }
      lastScannedRef.current = { text: cleanQr, time: now };
    }
    playBeep();

    if (scannedEquipos.includes(cleanQr)) {
      setResultMessage({ type: 'error', text: `El equipo ${cleanQr} ya fue escaneado.` });
      return;
    }
    setScannedEquipos(prev => [...prev, cleanQr]);
    setManualEquipoQr('');
    setResultMessage({ type: 'success', text: `Equipo ${cleanQr} agregado a la lista.` });
  };

  const removeEquipo = (index) => {
    setScannedEquipos(prev => prev.filter((_, i) => i !== index));
  };

  // Petición de Devolución Individual al Backend
  const handleExecuteReturn = async (qr) => {
    const targetQr = qr || returnEquipoQr;
    if (!targetQr.trim()) {
      setResultMessage({ type: 'error', text: 'Debe ingresar o escáner el código QR de un equipo para registrar su devolución.' });
      return;
    }

    setLoading(true);
    setResultMessage(null);

    try {
      const response = await fetch(`/api/v1/sesiones/retorno-equipo?qrEquipo=${encodeURIComponent(targetQr.trim())}`, {
        method: 'PUT'
      });

      const data = await response.json();

      if (response.ok) {
        setResultMessage({
          type: 'success',
          text: `¡Equipo ${targetQr} devuelto con éxito! Se reincorporó disponible en Aula.`,
          data: data
        });
        
        // Recargar sesiones activas
        await fetchActiveSessions();
        setReturnEquipoQr('');
      } else {
        setResultMessage({ type: 'error', text: data.message || 'Error al procesar la devolución.' });
      }
    } catch (err) {
      setResultMessage({ type: 'error', text: 'No se pudo conectar con el servidor local para realizar la devolución.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInitiateSession = async (e) => {
    e.preventDefault();
    if (operationMode === 'DEVOLUCION_INDIVIDUAL') {
      handleExecuteReturn();
      return;
    }

    if (!teacherJwt) {
      setResultMessage({ type: 'error', text: 'Debe escanear la credencial QR del Docente responsable.' });
      return;
    }

    setLoading(true);
    setResultMessage(null);

    try {
      if (operationMode === 'CLASE_INTERNA') {
        const response = await fetch('/api/v1/sesiones/iniciar-clase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrDocente: teacherJwt,
            idAulaAip: parseInt(selectedAula),
            gradoSeccion,
            descripcion
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setResultMessage({
            type: 'success',
            text: `¡Clase de ${data.gradoSeccion} iniciada con éxito en ${data.aulaNombre}!`,
            data: data
          });
          fetchActiveSessions();
          if (kioskMode) {
            setKioskStep('SUCCESS_INITIATE');
          } else {
            setTeacherJwt('');
            setTeacherName('');
            setDescripcion('');
          }
        } else {
          setResultMessage({ type: 'error', text: data.message || 'Error al iniciar la sesión Modo Clase.' });
        }
      } else if (operationMode === 'TRABAJO_COLEGIADO') {
        if (!descripcion.trim()) {
          setResultMessage({ type: 'error', text: 'Debe ingresar la agenda o tema a tratar en sus horas colegiado.' });
          setLoading(false);
          return;
        }

        const areaToSubmit = colegiadoArea === 'Otro' ? customArea : colegiadoArea;
        if (colegiadoArea === 'Otro' && !customArea.trim()) {
          setResultMessage({ type: 'error', text: 'Debe especificar el área personalizada.' });
          setLoading(false);
          return;
        }

        const response = await fetch('/api/v1/sesiones/iniciar-colegiado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrDocente: teacherJwt,
            idAulaAip: parseInt(selectedAula),
            descripcion,
            area: areaToSubmit
          })
        });

        const data = await response.json();
        
        if (response.ok) {
          setResultMessage({
            type: 'success',
            text: `¡Trabajo Colegiado iniciado con éxito por ${data.docenteNombre} en ${data.aulaNombre}!`,
            data: data
          });
          fetchActiveSessions();
          if (kioskMode) {
            setKioskStep('SUCCESS_INITIATE');
          } else {
            setTeacherJwt('');
            setTeacherName('');
            setDescripcion('');
            setCustomArea('');
          }
        } else {
          setResultMessage({ type: 'error', text: data.message || 'Error al iniciar la sesión de Trabajo Colegiado.' });
        }
      } else {
        if (scannedEquipos.length === 0) {
          setResultMessage({ type: 'error', text: 'Debe escanear al menos un código QR de equipo para el préstamo.' });
          setLoading(false);
          return;
        }

        const response = await fetch('/api/v1/sesiones/registrar-prestamo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            qrDocente: teacherJwt,
            idAulaAip: parseInt(selectedAula),
            qrEquipos: scannedEquipos
          })
        });

        const data = await response.json();

        if (response.ok) {
          setResultMessage({
            type: 'success',
            text: `¡Préstamo externo registrado exitosamente para ${data.docenteNombre}!`,
            data: data
          });
          fetchActiveSessions();
          if (kioskMode) {
            setKioskStep('SUCCESS_INITIATE');
          } else {
            setTeacherJwt('');
            setTeacherName('');
            setScannedEquipos([]);
          }
        } else {
          setResultMessage({ type: 'error', text: data.message || 'Error al registrar el préstamo externo.' });
        }
      }
    } catch (error) {
      setResultMessage({ type: 'error', text: 'No se pudo establecer conexión con el servidor REST local.' });
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeSession = async (sessionId, qrDocente = null) => {
    setLoading(true);
    try {
      const url = qrDocente 
        ? `/api/v1/sesiones/${sessionId}/finalizar?qrDocente=${encodeURIComponent(qrDocente)}`
        : `/api/v1/sesiones/${sessionId}/finalizar`;
      const response = await fetch(url, {
        method: 'PUT'
      });
      const data = await response.json();
      if (response.ok) {
        setResultMessage({ 
          type: 'success', 
          text: 'Sesión finalizada. Todos los equipos fueron devueltos al AIP en estado Disponible.',
          data: data
        });
        if (kioskMode) {
          setKioskStep('SUCCESS_RETURN');
        } else {
          setSelectedSession(null);
        }
        fetchActiveSessions();
      } else {
        setResultMessage({ type: 'error', text: data.message || 'Error al finalizar la sesión.' });
      }
    } catch (err) {
      setResultMessage({ type: 'error', text: 'Error de red al intentar finalizar la sesión.' });
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de sesiones activas por docente responsable
  const filteredActiveSessions = activeSessions.filter(s => 
    s.docenteNombre.toLowerCase().includes(searchActiveTeacher.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-100">Estación de Escaneo y Préstamos</h2>
        <p className="text-sm text-slate-400">Registre clases del AIP, préstamos de tabletas y retornos de equipos con control de responsable.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Formulario e Interfaz de Registro (8 Columnas) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Selector de Modo Operativo */}
          <div className="bg-slate-900/50 p-2 rounded-2xl border border-slate-800 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => { setOperationMode('CLASE_INTERNA'); setResultMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer min-w-[120px] ${
                operationMode === 'CLASE_INTERNA' 
                  ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Modo Clase AIP</span>
            </button>
            <button
              type="button"
              onClick={() => { setOperationMode('TRABAJO_COLEGIADO'); setResultMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer min-w-[120px] ${
                operationMode === 'TRABAJO_COLEGIADO' 
                  ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Hora Colegiada / Refuerzo</span>
            </button>
            <button
              type="button"
              onClick={() => { setOperationMode('PRESTAMO_EXTERNO'); setResultMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer min-w-[120px] ${
                operationMode === 'PRESTAMO_EXTERNO' 
                  ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Préstamo Externo</span>
            </button>
            <button
              type="button"
              onClick={() => { setOperationMode('DEVOLUCION_INDIVIDUAL'); setResultMessage(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-xs transition-all cursor-pointer min-w-[120px] ${
                operationMode === 'DEVOLUCION_INDIVIDUAL' 
                  ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/10' 
                  : 'text-slate-400 hover:bg-slate-800/50'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retorno QR (Devolución)</span>
            </button>
          </div>

          {/* Formulario Principal */}
          <form onSubmit={handleInitiateSession} className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-2xl p-6 space-y-6">
            
            {operationMode !== 'DEVOLUCION_INDIVIDUAL' ? (
              <>
                {/* Sección Docente Responsable */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="block text-sm font-semibold text-slate-300">
                      1. Cargar Docente Responsable
                    </label>
                    
                    {/* Selector de Modo de Entrada */}
                    <div className="flex gap-1.5 p-1 bg-slate-950/60 border border-slate-800 rounded-xl">
                      <button
                        type="button"
                        onClick={() => {
                          setDocenteInputMode('scan');
                          setResultMessage(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                          docenteInputMode === 'scan'
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <Camera className="w-3.5 h-3.5" />
                        Cámara QR
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDocenteInputMode('list');
                          stopScanner();
                          setResultMessage(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                          docenteInputMode === 'list'
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                            : 'text-slate-400 hover:text-slate-200 border border-transparent'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        Seleccionar de Lista
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {docenteInputMode === 'scan' ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => scannerActive ? stopScanner() : startScanner('docente_prestamo')}
                          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            scannerActive 
                              ? 'bg-rose-950 text-rose-400 border-rose-800' 
                              : 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25 hover:bg-emerald-500/20'
                          }`}
                        >
                          <Camera className="w-4 h-4" />
                          <span>{scannerActive ? 'Detener Escáner de Cámara' : 'Abrir Cámara para Escanear'}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full flex gap-2">
                        <select
                          onChange={(e) => {
                            const selectedId = e.target.value;
                            if (!selectedId) {
                              setTeacherJwt('');
                              setTeacherName('');
                              return;
                            }
                            const doc = docentes.find(d => d.idUsuario === selectedId);
                            if (doc) {
                              setTeacherJwt(doc.qrToken);
                              setTeacherName(`${doc.apellidos}, ${doc.nombres}`);
                              setResultMessage({ type: 'success', text: `Docente ${doc.nombres} ${doc.apellidos} seleccionado.` });
                            }
                          }}
                          value={docentes.find(d => d.qrToken === teacherJwt)?.idUsuario || ''}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="">-- Seleccionar Docente --</option>
                          {docentes.map(doc => (
                            <option key={doc.idUsuario} value={doc.idUsuario}>
                              {doc.apellidos}, {doc.nombres} (DNI: {doc.dni})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Docente Cargado Estado */}
                    {teacherName && (
                      <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-xl p-3 flex items-center justify-between animate-fadeIn">
                        <div className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <div>
                            <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Docente Cargado y Listo</p>
                            <p className="text-xs font-bold text-slate-200">{teacherName}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTeacherJwt('');
                            setTeacherName('');
                            setResultMessage(null);
                          }}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-500/10 cursor-pointer"
                          title="Quitar docente"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Configuración de Ubicación y Destinatarios */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-300">
                      2. Seleccionar Aula AIP de Origen
                    </label>
                    <select
                      value={selectedAula}
                      onChange={(e) => setSelectedAula(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1">AIP 01 - Principal (Laptops)</option>
                      <option value="2">AIP 02 (Tabletas)</option>
                      <option value="3">AIP 03</option>
                    </select>
                  </div>

                  {operationMode === 'CLASE_INTERNA' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">
                          3. Grado y Sección de Alumnos
                        </label>
                        <select
                          value={gradoSeccion}
                          onChange={(e) => setGradoSeccion(e.target.value)}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          {gradosSeccionesList.map((gs) => (
                            <option key={gs} value={gs}>
                              {gs.substring(0, 1)}° "{gs.substring(1)}"
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">
                          4. Tema / Descripción de la Clase (Opcional)
                        </label>
                        <input
                          type="text"
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          placeholder="Ej: Sesión 3: Introducción a Scratch o Algoritmos"
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}

                  {operationMode === 'TRABAJO_COLEGIADO' && (
                    <>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">
                          3. Seleccionar Área / Categoría
                        </label>
                        <select
                          value={colegiadoArea}
                          onChange={(e) => {
                            setColegiadoArea(e.target.value);
                            if (e.target.value !== 'Otro') {
                              setCustomArea('');
                            }
                          }}
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                        >
                          <option value="Letras">Letras</option>
                          <option value="Ciencias">Ciencias</option>
                          <option value="Matemática">Matemática</option>
                          <option value="Comunicación">Comunicación</option>
                          <option value="Tutoría y Orientación">Tutoría y Orientación</option>
                          <option value="EPT">EPT (Educación para el Trabajo)</option>
                          <option value="Ciencias Sociales / DPCC">Ciencias Sociales / DPCC</option>
                          <option value="Soporte Tecnológico (CIST/PIP)">Soporte Tecnológico (CIST/PIP)</option>
                          <option value="Otro">Otro (Especificar)</option>
                        </select>
                      </div>

                      {colegiadoArea === 'Otro' && (
                        <div className="space-y-2 animate-fadeIn">
                          <label className="block text-sm font-semibold text-slate-300">
                            Especifique el Área
                          </label>
                          <input
                            type="text"
                            required
                            value={customArea}
                            onChange={(e) => setCustomArea(e.target.value)}
                            placeholder="Ej: Arte y Cultura, Inglés, etc."
                            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      )}

                      <div className="md:col-span-2 space-y-2">
                        <label className="block text-sm font-semibold text-slate-300">
                          4. Agenda o Tema del Trabajo Colegiado
                        </label>
                        <input
                          type="text"
                          required
                          value={descripcion}
                          onChange={(e) => setDescripcion(e.target.value)}
                          placeholder="Ej: Planificación de sesiones de Letras o Capacitación en herramientas AIP"
                          className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </>
                  )}

                  {operationMode === 'PRESTAMO_EXTERNO' && (
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-slate-300">
                        3. Escaneo de Equipos a Llevar
                      </label>
                      
                      {/* Botón de Escáner continuo a lo ancho */}
                      <button
                        type="button"
                        onClick={() => {
                          if (scannerActive && scannerPurpose === 'equipo_prestamo_continuo') {
                            stopScanner();
                          } else {
                            startScanner('equipo_prestamo_continuo');
                          }
                        }}
                        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          scannerActive && scannerPurpose === 'equipo_prestamo_continuo'
                            ? 'bg-rose-950 text-rose-450 border-rose-800'
                            : 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25 hover:bg-emerald-500/20'
                        }`}
                      >
                        <Camera className="w-4 h-4" />
                        <span>
                          {scannerActive && scannerPurpose === 'equipo_prestamo_continuo' 
                            ? 'Detener Escáner Continuo' 
                            : 'Iniciar Escáner Continuo'}
                        </span>
                      </button>

                      {/* Input manual y Añadir en su propia línea */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={manualEquipoQr}
                          onChange={(e) => setManualEquipoQr(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (manualEquipoQr.trim()) {
                                handleScanEquipo(manualEquipoQr);
                              }
                            }
                          }}
                          placeholder="Código QR de Tableta / Laptop"
                          className="flex-1 bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (manualEquipoQr.trim()) {
                              handleScanEquipo(manualEquipoQr);
                            }
                          }}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                        >
                          Añadir
                        </button>
                      </div>

                      {/* Lista de Equipos a Llevar Escaneados */}
                      <div className="space-y-2 pt-2 border-t border-slate-850">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold">
                          <span>Equipos a Llevar ({scannedEquipos.length})</span>
                          {scannedEquipos.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setScannedEquipos([])}
                              className="text-rose-450 hover:underline cursor-pointer lowercase font-medium"
                            >
                              limpiar lista
                            </button>
                          )}
                        </div>

                        {scannedEquipos.length === 0 ? (
                          <p className="text-xs text-slate-550 italic py-2">Ningún equipo ha sido escaneado aún para este préstamo.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
                            {scannedEquipos.map((eqQr, idx) => (
                              <div
                                key={idx}
                                className="bg-slate-950 border border-slate-850 hover:border-slate-800 p-2.5 rounded-xl flex items-center justify-between text-xs transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <Tablet className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                  <span className="font-mono text-slate-200 font-bold">{eqQr}</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeEquipo(idx)}
                                  className="text-slate-500 hover:text-rose-450 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                                  title="Quitar equipo"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>

                {/* Botón de envío de formulario para Iniciar Clase o Registrar Préstamo */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-slate-950 transition-all cursor-pointer active:scale-95 ${
                    loading 
                      ? 'bg-emerald-700/80 cursor-not-allowed' 
                      : 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>
                        {operationMode === 'CLASE_INTERNA' ? 'Iniciar Sesión en AIP' : 
                         operationMode === 'TRABAJO_COLEGIADO' ? 'Iniciar Trabajo Colegiado' : 
                         'Confirmar Préstamo de Tabletas'}
                      </span>
                    </>
                  )}
                </button>
              </>
            ) : (
              /* MODO DEVOLUCION / RETORNO QR CONDICIONADO AL RESPONSABLE */
              <div className="space-y-6">
                
                {/* Paso A: Identificar Responsable Activo */}
                <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-5 space-y-4">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    Paso 1: Identificar Docente con Préstamos Activos
                  </h4>
                  
                  {selectedSession ? (
                    <div className="bg-emerald-950/20 border border-emerald-900/50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Responsable Activo</p>
                        <p className="text-sm font-bold text-slate-100">{selectedSession.docenteNombre}</p>
                        <p className="text-[10px] text-slate-550 mt-0.5">
                          Sesión: {selectedSession.tipoOperacion === 'CLASE_INTERNA' ? `Aula ${selectedSession.gradoSeccion}` : 
                                   selectedSession.tipoOperacion === 'TRABAJO_COLEGIADO' ? `Colegiado - ${selectedSession.gradoSeccion}` : 'Préstamo Externo'} • {selectedSession.aulaNombre}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSession(null)}
                        className="text-xs text-rose-400 hover:underline font-bold cursor-pointer"
                      >
                        Cambiar Docente
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="w-4 h-4 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={searchActiveTeacher}
                            onChange={(e) => setSearchActiveTeacher(e.target.value)}
                            placeholder="Buscar docente con sesión activa..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => scannerActive ? stopScanner() : startScanner('docente_prestamo')}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 px-4 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Escanear QR
                        </button>
                      </div>

                      {/* Lista de Docentes Activos */}
                      {filteredActiveSessions.length === 0 ? (
                        <p className="text-xs text-slate-550 italic text-center py-4">No hay docentes con sesiones o préstamos activos registrados en la DB.</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                          {filteredActiveSessions.map(s => (
                            <button
                              key={s.idSesion}
                              type="button"
                              onClick={() => { setSelectedSession(s); setResultMessage(null); }}
                              className="text-left bg-slate-950/60 border border-slate-800 hover:border-emerald-500/40 p-2.5 rounded-xl transition-all cursor-pointer"
                            >
                              <p className="text-xs font-bold text-slate-200">{s.docenteNombre}</p>
                              <div className="flex justify-between text-[9px] text-slate-500 mt-1 font-mono">
                                <span>{s.tipoOperacion === 'CLASE_INTERNA' ? `AIP - Sec ${s.gradoSeccion}` : 
                                       s.tipoOperacion === 'TRABAJO_COLEGIADO' ? `Col: ${s.gradoSeccion}` : 'Préstamo'}</span>
                                <span>{s.aulaNombre}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selectedSession && (
                  <div className="space-y-4 animate-fadeIn">
                    {selectedSession.tipoOperacion === 'CLASE_INTERNA' ? (
                      /* MODO DEVOLUCIÓN CLASE AIP (LOTE AUTOMÁTICO AUTORIZADO POR EL DOCENTE CON SU QR) */
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
                          <RotateCcw className="w-4 h-4" />
                          Paso 2: Autorización de Retorno por el Docente
                        </h4>

                        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex items-start gap-3">
                          <Info className="w-5 h-5 text-emerald-455 shrink-0 mt-0.5" />
                          <div className="text-xs text-slate-300">
                            <p className="font-bold text-emerald-400">Retorno Automatizado en Aula AIP</p>
                            <p className="mt-1 text-slate-400">Las laptops permanecen cargadas en sus escritorios dentro del aula. Para confirmar el retorno físico de todo el lote y cerrar la clase, el docente responsable debe escanear su fotocheck QR a continuación.</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (scannerActive && scannerPurpose === 'docente_devolucion_clase') {
                              stopScanner();
                            } else {
                              startScanner('docente_devolucion_clase');
                            }
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-slate-950 transition-all cursor-pointer active:scale-95 ${
                            scannerActive && scannerPurpose === 'docente_devolucion_clase'
                              ? 'bg-rose-950 text-rose-455 border border-rose-800'
                              : 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10'
                          }`}
                        >
                          <Camera className="w-4.5 h-4.5" />
                          <span>
                            {scannerActive && scannerPurpose === 'docente_devolucion_clase' 
                              ? 'Detener Escáner de Autorización' 
                              : 'Escanear QR de Docente para Cerrar Clase'}
                          </span>
                        </button>
                      </div>
                    ) : selectedSession.tipoOperacion === 'TRABAJO_COLEGIADO' ? (
                      /* MODO DEVOLUCIÓN TRABAJO COLEGIADO (FIRMA QR DEL COORDINADOR RESPONSABLE OBLIGATORIA) */
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
                          <RotateCcw className="w-4 h-4" />
                          Paso 2: Firma de Salida de Coordinador
                        </h4>

                        <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 flex items-start gap-3">
                          <Info className="w-5 h-5 text-emerald-455 shrink-0 mt-0.5" />
                          <div className="text-xs text-slate-300">
                            <p className="font-bold text-emerald-450">Cierre de Sesión Colegiada</p>
                            <p className="mt-1 text-slate-400">Esta sesión registra el uso del Aula AIP para planificación o capacitación. Para finalizar y registrar la hora de salida de forma formal, el Coordinador responsable debe escanear su fotocheck QR a continuación.</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (scannerActive && scannerPurpose === 'docente_devolucion_clase') {
                              stopScanner();
                            } else {
                              startScanner('docente_devolucion_clase');
                            }
                          }}
                          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-slate-950 transition-all cursor-pointer active:scale-95 ${
                            scannerActive && scannerPurpose === 'docente_devolucion_clase'
                              ? 'bg-rose-950 text-rose-455 border border-rose-800'
                              : 'bg-emerald-500 hover:bg-emerald-400 shadow-lg shadow-emerald-500/10'
                          }`}
                        >
                          <Camera className="w-4.5 h-4.5" />
                          <span>
                            {scannerActive && scannerPurpose === 'docente_devolucion_clase' 
                              ? 'Detener Escáner de Salida' 
                              : 'Escanear QR de Coordinador para Cerrar Sesión'}
                          </span>
                        </button>
                      </div>
                    ) : (
                      /* MODO DEVOLUCIÓN PRÉSTAMOS EXTERNOS (ESCANEO CONTINUO UNITARIO OBLIGATORIO) */
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-emerald-450 uppercase tracking-widest flex items-center gap-1.5">
                          <RotateCcw className="w-4 h-4" />
                          Paso 2: Registrar Escaneo del Equipo a Retornar
                        </h4>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              if (scannerActive && scannerPurpose === 'equipo_devolucion_continuo') {
                                stopScanner();
                              } else {
                                startScanner('equipo_devolucion_continuo');
                              }
                            }}
                            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              scannerActive && scannerPurpose === 'equipo_devolucion_continuo'
                                ? 'bg-rose-950 text-rose-400 border-rose-800'
                                : 'bg-emerald-500/10 text-emerald-405 border-emerald-500/25 hover:bg-emerald-500/20'
                            }`}
                          >
                            <Camera className="w-4 h-4" />
                            <span>{scannerActive && scannerPurpose === 'equipo_devolucion_continuo' ? 'Detener Escáner' : 'Iniciar Escáner Continuo'}</span>
                          </button>

                          <div className="flex-1 flex gap-2">
                            <input
                              type="text"
                              value={returnEquipoQr}
                              onChange={(e) => setReturnEquipoQr(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (returnEquipoQr.trim()) {
                                    handleContinuousScanEquipo(returnEquipoQr.trim());
                                    setReturnEquipoQr('');
                                  }
                                }
                              }}
                              placeholder="Escanee o ingrese QR del dispositivo..."
                              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (returnEquipoQr.trim()) {
                                  handleContinuousScanEquipo(returnEquipoQr.trim());
                                  setReturnEquipoQr('');
                                }
                              }}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 rounded-xl text-xs font-semibold cursor-pointer"
                            >
                              Añadir
                            </button>
                          </div>
                        </div>

                        <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-3 flex items-start gap-2.5">
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-slate-400">
                            <span className="font-bold text-amber-400">Escaneo Unitario Obligatorio:</span> Al ser un préstamo externo, es obligatorio escanear cada laptop/tableta para corroborar su ingreso físico. Al finalizar el escaneo, confirme la devolución solicitando el QR del docente responsable.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Lista de Equipos a su Cargo (Con estados de corroboración integrados) */}
                    {selectedSession.tipoOperacion !== 'TRABAJO_COLEGIADO' && (
                      <div className="space-y-2 pt-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Equipos asignados a esta sesión ({selectedSession.detalles ? selectedSession.detalles.length : 0}):</p>
                        
                        {selectedSession.detalles && selectedSession.detalles.length === 0 ? (
                          <p className="text-xs text-slate-550 italic">No hay equipos registrados en esta sesión.</p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedSession.detalles && selectedSession.detalles.map((det, idx) => {
                              const isDevuelto = det.ubicacionActual === 'EN_AIP';
                              const isScannedForReturn = scannedReturnQrs.includes(det.qrEquipo);
                              
                              return (
                                <div 
                                  key={idx} 
                                  className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                    isDevuelto 
                                      ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-300' 
                                      : isScannedForReturn
                                        ? 'bg-indigo-950/20 border-indigo-500/40 text-indigo-200'
                                        : 'bg-slate-950 border-slate-900 text-slate-400'
                                  }`}
                                >
                                  <div>
                                    <div className="font-bold flex items-center gap-1.5">
                                      {det.tipoEquipo === 'TABLET' ? <Tablet className="w-3.5 h-3.5 text-indigo-400" /> : <Laptop className="w-3.5 h-3.5 text-blue-400" />}
                                      <span className={isDevuelto ? 'text-emerald-300' : isScannedForReturn ? 'text-indigo-300 font-bold' : 'text-slate-350'}>{det.codPatrimonial}</span>
                                    </div>
                                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">QR: {det.qrEquipo} • N/S: {det.numSerie || 'N/A'}</p>
                                    {det.estudianteNombre && (
                                      <p className="text-[9px] text-slate-455 mt-1">Est: N°{det.numeroOrden} - {det.estudianteNombre}</p>
                                    )}
                                  </div>

                                  <div>
                                    {isDevuelto ? (
                                      <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-455 px-2 py-0.5 rounded text-[9px] font-bold">
                                        <Check className="w-3 h-3" /> Devuelto
                                      </span>
                                    ) : isScannedForReturn ? (
                                      <div className="flex items-center gap-1.5">
                                        <span className="flex items-center gap-1 bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded text-[9px] font-bold">
                                          ✓ Escaneado
                                        </span>
                                        {selectedSession.tipoOperacion !== 'CLASE_INTERNA' && (
                                          <button
                                            type="button"
                                            onClick={() => setScannedReturnQrs(prev => prev.filter(q => q !== det.qrEquipo))}
                                            className="text-slate-500 hover:text-rose-455 p-1 rounded hover:bg-rose-500/10 cursor-pointer"
                                            title="Quitar de escaneados"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="flex items-center gap-1 bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-[9px] font-medium border border-slate-800">
                                        Pendiente
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Confirmación y Autorización para Préstamos Externos */}
                    {selectedSession.tipoOperacion !== 'CLASE_INTERNA' && selectedSession.tipoOperacion !== 'TRABAJO_COLEGIADO' && scannedReturnQrs.length > 0 && (
                      <div className="pt-4 border-t border-slate-850 space-y-3 animate-fadeIn">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                          <span className="text-xs text-slate-350">
                            Se han escaneado <strong className="text-indigo-400">{scannedReturnQrs.length}</strong> de <strong className="text-slate-200">{selectedSession.detalles?.filter(d => d.ubicacionActual !== 'EN_AIP').length}</strong> equipos pendientes.
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => {
                              if (scannerActive && scannerPurpose === 'docente_devolucion_prestamo') {
                                stopScanner();
                              } else {
                                startScanner('docente_devolucion_prestamo');
                              }
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              scannerActive && scannerPurpose === 'docente_devolucion_prestamo'
                                ? 'bg-rose-950 text-rose-455 border border-rose-800'
                                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/10 active:scale-95'
                            }`}
                          >
                            <Camera className="w-4 h-4" />
                            <span>
                              {scannerActive && scannerPurpose === 'docente_devolucion_prestamo'
                                ? 'Detener Escáner de Autorización'
                                : 'Confirmar Devolución y Solicitar QR de Docente'}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            )}
            {resultMessage && (
              <div className={`p-4 rounded-xl border flex items-start gap-3 text-sm animate-fadeIn ${
                resultMessage.type === 'success' 
                  ? 'bg-emerald-950/45 text-emerald-300 border-emerald-800' 
                  : 'bg-rose-950/45 text-rose-300 border-rose-800'
              }`}>
                {resultMessage.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-rose-455" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{resultMessage.text}</p>
                  {resultMessage.type === 'success' && resultMessage.data && (
                    <button
                      type="button"
                      onClick={() => printActa(resultMessage.data)}
                      className="mt-2.5 flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-500/10"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Acta de Aval (Firma Digital)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </form>

        </div>

        {/* Lector QR o Monitor Lateral (4 Columnas) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Lector QR de Cámara en Modal Centrado */}
          {scannerActive && (
            <div 
              onClick={(e) => { if (e.target === e.currentTarget) stopScanner(); }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-fadeIn"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col items-center max-w-md w-full animate-scaleUp relative">
                
                {/* Botón X de Cierre Absoluto */}
                <button
                  type="button"
                  onClick={stopScanner}
                  className="absolute top-4 right-4 text-slate-450 hover:text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-all cursor-pointer"
                  title="Cerrar Escáner"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 mb-4 pr-8">
                  <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5 font-mono">
                    <Camera className="w-4 h-4 text-emerald-450 animate-pulse" />
                    Escáner Activo
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      type="button"
                      onClick={toggleCamera}
                      className="text-[10px] text-emerald-455 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1 font-bold bg-emerald-500/10 px-2.5 py-1.5 rounded-lg uppercase tracking-wider"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{facingMode === 'environment' ? 'Frontal' : 'Trasera'}</span>
                    </button>
                  </div>
                </div>

                {/* Indicador del objetivo de escaneo */}
                <div className="w-full bg-slate-950/60 border border-slate-850 rounded-xl p-3 mb-4 text-center">
                  <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider mb-1 font-mono">Objetivo del Escaneo</p>
                  <p className="text-xs font-bold text-slate-200">
                    {scannerPurpose === 'docente_prestamo' && 'Escanear credencial QR del Docente responsable'}
                    {scannerPurpose === 'docente_devolucion_clase' && 'Escanear QR del Docente responsable para cerrar clase'}
                    {scannerPurpose === 'docente_devolucion_prestamo' && 'Escanear QR del Docente responsable para autorizar devolución'}
                    {scannerPurpose === 'equipo_devolucion_continuo' && 'Escanear código QR del Equipo a retornar'}
                    {scannerPurpose === 'equipo_prestamo_continuo' && 'Escanear código QR del Equipo a prestar'}
                  </p>
                </div>

                <div id="qr-reader" className="w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-900 aspect-square"></div>
                
                <p className="text-[10px] text-slate-500 text-center mt-4">
                  Enfoque el código QR dentro del recuadro. Sonará un pitido de confirmación al capturar el código.
                </p>
              </div>
            </div>
          )}

          {/* Monitor de Sesiones Activas */}
          <div className="bg-slate-900/30 backdrop-blur-md border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-400" />
                Sesiones Activas
              </h3>
              <button
                type="button"
                onClick={fetchActiveSessions}
                className="text-slate-400 hover:text-slate-200 transition-colors"
                title="Actualizar sesiones activas de la DB"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {activeSessions.length === 0 ? (
              <div className="py-8 text-center text-slate-650">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                <p className="text-xs">No hay préstamos ni sesiones activas en la base de datos.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activeSessions.map((session, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-xl p-3 space-y-2 transition-all ${
                      selectedSession && selectedSession.idSesion === session.idSesion
                        ? 'bg-emerald-950/30 border-emerald-500/50'
                        : 'bg-slate-950/60 border-slate-850 hover:bg-slate-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          session.tipoOperacion === 'CLASE_INTERNA' 
                            ? 'bg-emerald-950 text-emerald-440 border border-emerald-900' 
                            : session.tipoOperacion === 'TRABAJO_COLEGIADO'
                              ? 'bg-teal-950 text-teal-400 border border-teal-900'
                              : 'bg-indigo-950 text-indigo-400 border border-indigo-900'
                        }`}>
                          {session.tipoOperacion === 'CLASE_INTERNA' ? `Aula ${session.gradoSeccion}` : 
                           session.tipoOperacion === 'TRABAJO_COLEGIADO' ? `Colegiado - ${session.gradoSeccion}` : 'Préstamo Externo'}
                        </span>
                        <p className="text-xs font-bold text-slate-200 mt-1">{session.docenteNombre}</p>
                      </div>
                      
                      <div className="flex gap-1.5 items-center">
                        <button
                          type="button"
                          onClick={() => printActa(session)}
                          className="flex items-center gap-1 bg-slate-800 hover:bg-emerald-500 text-slate-300 hover:text-slate-950 px-2 py-1 rounded text-[9px] font-bold border border-slate-700 cursor-pointer transition-all active:scale-95"
                          title="Imprimir Acta de Entrega / Firma Digital"
                        >
                          <Printer className="w-2.5 h-2.5" />
                          <span>Acta</span>
                        </button>
                        {operationMode === 'DEVOLUCION_INDIVIDUAL' ? (
                          <button
                            type="button"
                            onClick={() => setSelectedSession(session)}
                            className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 px-2 py-1 rounded text-[9px] font-bold border border-emerald-500/20 cursor-pointer active:scale-95"
                          >
                            Seleccionar
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedSession(session);
                              setResultMessage(null);
                              startScanner('docente_devolucion_clase');
                            }}
                            className="flex items-center gap-1 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-slate-950 px-2 py-1 rounded text-[9px] font-bold border border-rose-500/20 cursor-pointer transition-all active:scale-95"
                          >
                            <Square className="w-2.5 h-2.5 fill-current" />
                            <span>Retornar</span>
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-[10px] text-slate-500 flex flex-col gap-0.5 font-mono">
                      <span>Aula: {session.aulaNombre}</span>
                      <span>Equipos: {session.detalles ? session.detalles.filter(d => d.ubicacionActual === 'PRESTADO_AULA').length : 0} pendientes</span>
                      <span>Inicio: {new Date(session.horaInicio).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
 
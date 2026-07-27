import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { 
  Laptop, 
  Tablet, 
  HardDrive, 
  RefreshCw, 
  PlusCircle, 
  CheckCircle, 
  ShieldAlert, 
  AlertCircle,
  FileSpreadsheet,
  Upload,
  Play,
  X,
  Cpu,
  Monitor,
  Network,
  Keyboard
} from 'lucide-react';

export default function HardwareView() {
  const [equipos, setEquipos] = useState([]);
  const [selectedAula, setSelectedAula] = useState('1');
  const [activeTab, setActiveTab] = useState('PRESTAMO'); // 'PRESTAMO', 'PERIFERICOS', 'INFRAESTRUCTURA'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modales/Vistas
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  // Formulario de Alta Individual
  const [codPatrimonial, setCodPatrimonial] = useState('');
  const [qrEquipo, setQrEquipo] = useState('');
  const [numSerie, setNumSerie] = useState('');
  const [qrCargador, setQrCargador] = useState('');
  const [numSerieCargador, setNumSerieCargador] = useState('');
  const [marca, setMarca] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [hasCharger, setHasCharger] = useState(false);
  const [tipoEquipo, setTipoEquipo] = useState('LAPTOP');
  const [estadoFisico, setEstadoFisico] = useState('OPERATIVO');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState(null);

  // Importación Masiva Excel
  const [excelFile, setExcelFile] = useState(null);
  const [parsedEquipos, setParsedEquipos] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccessCount, setImportSuccessCount] = useState(0);

  const filteredEquipos = equipos.filter(eq => {
    if (activeTab === 'PRESTAMO') {
      return ['LAPTOP', 'TABLET', 'PC_ESCRITORIO'].includes(eq.tipoEquipo);
    } else if (activeTab === 'PERIFERICOS') {
      return ['MONITOR', 'TECLADO', 'MAUSE'].includes(eq.tipoEquipo);
    } else {
      return ['SERVIDOR', 'SWITCH', 'ACCES_POINT', 'DVR', 'GABINETE', 'UPC', 'OTROS'].includes(eq.tipoEquipo);
    }
  });

  const getEquipoIcon = (tipo) => {
    switch (tipo) {
      case 'LAPTOP':
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case 'TABLET':
        return <Tablet className="w-4 h-4 text-indigo-400" />;
      case 'PC_ESCRITORIO':
        return <Monitor className="w-4 h-4 text-teal-400" />;
      case 'SERVIDOR':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'MONITOR':
        return <Monitor className="w-4 h-4 text-slate-400" />;
      case 'TECLADO':
        return <Keyboard className="w-4 h-4 text-amber-400" />;
      case 'MAUSE':
        return <Keyboard className="w-4 h-4 text-orange-400" />;
      case 'SWITCH':
        return <Network className="w-4 h-4 text-emerald-400" />;
      case 'DVR':
        return <Cpu className="w-4 h-4 text-rose-400" />;
      case 'ACCES_POINT':
        return <Network className="w-4 h-4 text-cyan-400" />;
      case 'GABINETE':
        return <HardDrive className="w-4 h-4 text-slate-350" />;
      case 'UPC':
        return <Cpu className="w-4 h-4 text-yellow-400" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-400" />;
    }
  };

  useEffect(() => {
    fetchEquipos();
  }, [selectedAula]);

  const fetchEquipos = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/aulas/${selectedAula}/inventario`);
      if (!response.ok) throw new Error('Error al obtener inventario');
      const data = await response.json();
      setEquipos(data);
    } catch (err) {
      setError('No se pudo establecer conexión con la base de datos local.');
      setEquipos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAltaEquipo = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(false);

    const payload = {
      codPatrimonial,
      qrEquipo,
      numSerie,
      qrCargador: hasCharger ? qrCargador : '',
      numSerieCargador: hasCharger ? numSerieCargador : '',
      marca,
      descripcion,
      tipoEquipo,
      estadoFisico,
      idAulaBase: parseInt(selectedAula)
    };

    try {
      const response = await fetch('/api/v1/equipos/alta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setFormSuccess(true);
        setCodPatrimonial('');
        setQrEquipo('');
        setNumSerie('');
        setQrCargador('');
        setNumSerieCargador('');
        setMarca('');
        setDescripcion('');
        setHasCharger(false);
        fetchEquipos();
      } else {
        const data = await response.json();
        setFormError(data.message || 'Error al dar de alta el equipo.');
      }
    } catch (err) {
      setFormError('Error de red con el servidor local.');
    } finally {
      setFormLoading(false);
    }
  };

  // Carga e Importación masiva de Equipos desde Excel
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);
    setImportErrors([]);
    setImportSuccessCount(0);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonList = XLSX.utils.sheet_to_json(sheet);
        
        const formatted = jsonList.map(row => {
          const normalizedRow = {};
          Object.keys(row).forEach(key => {
            const normKey = key.toString().toLowerCase().replace(/[\s_-]/g, '');
            normalizedRow[normKey] = row[key];
          });

          const getVal = (keys) => {
            for (let k of keys) {
              const normK = k.toString().toLowerCase().replace(/[\s_-]/g, '');
              if (normalizedRow[normK] !== undefined) return normalizedRow[normK];
            }
            return null;
          };

          // Mapeo inteligente del Aula (soporta ID o Nombres como "AIP 01", "AIP 1", etc.)
          const rawAula = getVal(['aula', 'AULA', 'aula_base', 'id_aula_base', 'id_aula']);
          let parsedAulaId = 1; // Por defecto Aula 1
          if (rawAula) {
            const aStr = rawAula.toString().toUpperCase();
            if (aStr.includes('2') || aStr.includes('AIP02') || aStr.includes('AIP 02')) parsedAulaId = 2;
            else if (aStr.includes('3') || aStr.includes('AIP03') || aStr.includes('AIP 03')) parsedAulaId = 3;
          }

          // Mapeo de Tipo de Equipo
          const rawTipo = getVal(['tipo', 'TIPO', 'tipo_equipo', 'tipoEquipo']);
          let parsedTipo = 'LAPTOP';
          if (rawTipo) {
            const tStr = rawTipo.toString().toUpperCase();
            if (tStr.includes('TAB') || tStr.includes('TABLET')) parsedTipo = 'TABLET';
            else if (tStr.includes('LAP') || tStr.includes('LAPTOP')) parsedTipo = 'LAPTOP';
            else if (tStr.includes('PC') || tStr.includes('ESCRITORIO') || tStr.includes('COMPUTADORA')) parsedTipo = 'PC_ESCRITORIO';
            else if (tStr.includes('SERV') || tStr.includes('SERVIDOR')) parsedTipo = 'SERVIDOR';
            else if (tStr.includes('MONIT') || tStr.includes('MONITOR') || tStr.includes('PANTALLA')) parsedTipo = 'MONITOR';
            else if (tStr.includes('TECLA') || tStr.includes('TECLADO')) parsedTipo = 'TECLADO';
            else if (tStr.includes('MAU') || tStr.includes('MAUSE') || tStr.includes('MOUSE') || tStr.includes('RATON')) parsedTipo = 'MAUSE';
            else if (tStr.includes('SWIT') || tStr.includes('SWITCH')) parsedTipo = 'SWITCH';
            else if (tStr.includes('DVR')) parsedTipo = 'DVR';
            else if (tStr.includes('ACC') || tStr.includes('POINT') || tStr.includes('AP') || tStr.includes('POINT')) parsedTipo = 'ACCES_POINT';
            else if (tStr.includes('GAB') || tStr.includes('GABINETE') || tStr.includes('MUEBLE') || tStr.includes('CARRO') || tStr.includes('STAND')) parsedTipo = 'GABINETE';
            else if (tStr.includes('UPC') || tStr.includes('UPS') || tStr.includes('ESTAB') || tStr.includes('ESTABILIZADOR')) parsedTipo = 'UPC';
            else parsedTipo = 'OTROS';
          }

          // Mapeo de Estado
          const rawEstado = getVal(['estado', 'ESTADO', 'estado_fisico', 'estadoFisico']);
          let parsedEstado = 'OPERATIVO';
          if (rawEstado) {
            const eStr = rawEstado.toString().toUpperCase();
            if (eStr.includes('MANT') || eStr.includes('PROCESO')) parsedEstado = 'MANTENIMIENTO';
            else if (eStr.includes('BAJA')) parsedEstado = 'BAJA';
          }

          return {
            codPatrimonial: getVal(['cod_patrimonial', 'codigo_patrimonial', 'patrimonio', 'COD_PATRIMONIAL']) ? getVal(['cod_patrimonial', 'codigo_patrimonial', 'patrimonio', 'COD_PATRIMONIAL']).toString().trim() : '',
            qrEquipo: getVal(['qr_equipo', 'qr', 'codigo_qr', 'codigo_barras', 'QR_EQUIPO']) ? getVal(['qr_equipo', 'qr', 'codigo_qr', 'codigo_barras', 'QR_EQUIPO']).toString().trim() : '',
            numSerie: getVal(['num_serie', 'ns', 'n/s', 'serie', 'numero_serie', 'NUM_SERIE']) ? getVal(['num_serie', 'ns', 'n/s', 'serie', 'numero_serie', 'NUM_SERIE']).toString().trim() : '',
            qrCargador: getVal(['qr_cargador', 'cargador_qr', 'QR_CARGADOR']) ? getVal(['qr_cargador', 'cargador_qr', 'QR_CARGADOR']).toString().trim() : '',
            numSerieCargador: getVal(['num_serie_cargador', 'serie_cargador', 'numSerieCargador', 'SERIE_CARGADOR']) ? getVal(['num_serie_cargador', 'serie_cargador', 'numSerieCargador', 'SERIE_CARGADOR']).toString().trim() : '',
            marca: getVal(['marca', 'MARCA', 'brand']) ? getVal(['marca', 'MARCA', 'brand']).toString().trim() : '',
            descripcion: getVal(['descripcion', 'DESCRIPCION', 'observaciones', 'nota', 'details', 'detail']) ? getVal(['descripcion', 'DESCRIPCION', 'observaciones', 'nota', 'details', 'detail']).toString().trim() : '',
            tipoEquipo: parsedTipo,
            estadoFisico: parsedEstado,
            idAulaBase: parsedAulaId
          };
        }).filter(eq => eq.codPatrimonial && eq.qrEquipo && eq.numSerie);

        setParsedEquipos(formatted);
      } catch (err) {
        alert('Error al leer el archivo Excel. Verifique el formato e inténtelo de nuevo.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleStartImport = async () => {
    if (parsedEquipos.length === 0) return;
    setImporting(true);
    setImportErrors([]);
    setImportSuccessCount(0);
    setImportProgress({ current: 0, total: parsedEquipos.length });

    let success = 0;
    let errorsList = [];

    for (let i = 0; i < parsedEquipos.length; i++) {
      const eq = parsedEquipos[i];
      setImportProgress(prev => ({ ...prev, current: i + 1 }));

      try {
        const response = await fetch('/api/v1/equipos/alta', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eq)
        });

        if (response.ok) {
          success++;
          setImportSuccessCount(success);
        } else {
          const data = await response.json();
          errorsList.push({
            patrimonio: eq.codPatrimonial,
            qr: eq.qrEquipo,
            reason: data.message || 'Patrimonio o QR ya registrados'
          });
        }
      } catch (err) {
        errorsList.push({
          patrimonio: eq.codPatrimonial,
          qr: eq.qrEquipo,
          reason: 'Error de red local'
        });
      }
    }

    setImporting(false);
    setImportErrors(errorsList);
    setParsedEquipos([]);
    setExcelFile(null);
    fetchEquipos();
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans">Inventario de Hardware AIP</h2>
          <p className="text-sm text-slate-400">Registre y catalogue las laptops, PCs y tabletas destinadas a los AIP 01, 02 y 03.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowAddForm(!showAddForm); setShowImportForm(false); }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <PlusCircle className="w-4.5 h-4.5" />
            <span>Dar de Alta Individual</span>
          </button>
          <button 
            onClick={() => { setShowImportForm(!showImportForm); setShowAddForm(false); }}
            className="flex items-center gap-2 bg-indigo-650 hover:bg-indigo-500 text-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar Inventario (Excel)</span>
          </button>
        </div>
      </div>

      {/* FORMULARIO DE ALTA INDIVIDUAL */}
      {showAddForm && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 relative animate-fadeIn space-y-4">
          <button 
            onClick={() => setShowAddForm(false)} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-slate-200 text-base">Registrar Nuevo Equipo Físico</h3>

          <form onSubmit={handleAltaEquipo} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Código Patrimonial</label>
              <input
                type="text"
                required
                value={codPatrimonial}
                onChange={(e) => setCodPatrimonial(e.target.value)}
                placeholder="Ej: LAP-MINEDU-2026-999"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Número de Serie (N/S)</label>
              <input
                type="text"
                value={numSerie}
                onChange={(e) => setNumSerie(e.target.value)}
                placeholder="Ej: SN-ABCD1234EF (Opcional)"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Código QR de Barras</label>
              <input
                type="text"
                required
                value={qrEquipo}
                onChange={(e) => setQrEquipo(e.target.value)}
                placeholder="Ej: QR-LAP-AIP1-999"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo de Equipo</label>
              <select
                value={tipoEquipo}
                onChange={(e) => setTipoEquipo(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="LAPTOP">Laptop (Notebook)</option>
                <option value="TABLET">Tableta (Android)</option>
                <option value="PC_ESCRITORIO">PC de Escritorio</option>
                <option value="SERVIDOR">Servidor</option>
                <option value="MONITOR">Monitor</option>
                <option value="TECLADO">Teclado</option>
                <option value="MAUSE">Mouse</option>
                <option value="SWITCH">Switch de Red</option>
                <option value="DVR">DVR (Cámaras)</option>
                <option value="ACCES_POINT">Access Point</option>
                <option value="GABINETE">Gabinete / Mobiliario</option>
                <option value="UPC">UPS / Estabilizador (UPC)</option>
                <option value="OTROS">Otros Activos</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Estado Físico Inicial</label>
              <select
                value={estadoFisico}
                onChange={(e) => setEstadoFisico(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="OPERATIVO">Operativo</option>
                <option value="MANTENIMIENTO">En Mantenimiento</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Marca</label>
              <input
                type="text"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej: Lenovo, HP, Dell (Opcional)"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Descripción / Observaciones</label>
              <input
                type="text"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Pantalla rajada pero operativo, falta tapa (Opcional)"
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-2 p-2 bg-slate-950/30 rounded-xl border border-slate-850">
              <input
                type="checkbox"
                id="hasChargerCheckbox"
                checked={hasCharger}
                onChange={(e) => setHasCharger(e.target.checked)}
                className="rounded border-slate-800 text-emerald-500 focus:ring-emerald-500 bg-slate-950 w-4 h-4 cursor-pointer"
              />
              <label htmlFor="hasChargerCheckbox" className="text-xs font-bold text-slate-350 cursor-pointer select-none">
                Registrar cargador o fuente de alimentación asociada (Opcional)
              </label>
            </div>

            {hasCharger && (
              <>
                <div className="space-y-1 animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Código QR del Cargador</label>
                  <input
                    type="text"
                    required={hasCharger}
                    value={qrCargador}
                    onChange={(e) => setQrCargador(e.target.value)}
                    placeholder="Ej: QR-CARG-LAP-AIP1-999"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1 animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">N/S del Cargador (Fabricante)</label>
                  <input
                    type="text"
                    value={numSerieCargador}
                    onChange={(e) => setNumSerieCargador(e.target.value)}
                    placeholder="Ej: SN-CARG-12345 (Opcional)"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </>
            )}

            {formSuccess && (
              <div className="sm:col-span-2 p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-xl text-[11px] flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Equipo registrado con éxito en la base de datos local.</span>
              </div>
            )}

            {formError && (
              <div className="sm:col-span-2 p-3 bg-rose-950/40 text-rose-450 border border-rose-900/50 rounded-xl text-[11px] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-rose-450" />
                <span>{formError}</span>
              </div>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                {formLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Guardar Equipo</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORMULARIO DE IMPORTACION MASIVA EXCEL DE INVENTARIO */}
      {showImportForm && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 relative animate-fadeIn space-y-4">
          <button 
            onClick={() => setShowImportForm(false)} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-slate-200 text-base">Carga Masiva de Equipos (Excel)</h3>

          <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/30 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors relative">
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
              disabled={importing}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-xs font-semibold text-slate-350">
              {excelFile ? excelFile.name : 'Seleccione o arrastre su archivo Excel (.xlsx)'}
            </p>
            <p className="text-[10px] text-slate-500 mt-1">
              Columnas del Excel: cod_patrimonial, num_serie, qr_equipo, tipo (LAPTOP, TABLET), aula, qr_cargador, num_serie_cargador, estado, marca, descripcion
            </p>
          </div>

          {parsedEquipos.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between animate-fadeIn">
              <div>
                <p className="text-xs font-bold text-slate-300">Equipos de Inventario listos</p>
                <p className="text-[11px] text-slate-500">Se encontraron {parsedEquipos.length} equipos para agregar al inventario.</p>
              </div>
              <button
                onClick={handleStartImport}
                className="bg-indigo-650 hover:bg-indigo-500 text-slate-100 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Iniciar Importación masiva</span>
              </button>
            </div>
          )}

          {importing && (
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-350">
                <span className="font-bold">Dando de alta equipos en base de datos local...</span>
                <span>{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-indigo-505 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {!importing && (importSuccessCount > 0 || importErrors.length > 0) && (
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Carga Masiva de Equipos Completada
              </p>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>Equipos ingresados exitosamente: <span className="font-bold text-emerald-400">{importSuccessCount}</span></p>
                {importErrors.length > 0 && (
                  <p>Equipos duplicados o fallidos: <span className="font-bold text-rose-400">{importErrors.length}</span></p>
                )}
              </div>
              {importErrors.length > 0 && (
                <div className="max-h-24 overflow-y-auto border border-slate-900 rounded bg-slate-950/80 p-2 text-[10px] text-rose-350/80 space-y-1">
                  {importErrors.map((err, idx) => (
                    <div key={idx}>Patrimonio {err.patrimonio} (QR {err.qr}): {err.reason}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Selector de Aula y listado con Pestañas de categorías */}
      <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-bold text-slate-450 uppercase whitespace-nowrap">Mostrar Inventario del Aula:</span>
          <select
            value={selectedAula}
            onChange={(e) => setSelectedAula(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer w-full sm:w-auto"
          >
            <option value="1">AIP 01 - Principal (Laptops)</option>
            <option value="2">AIP 02 (Tabletas)</option>
            <option value="3">AIP 03</option>
          </select>
        </div>

        {/* Pestañas de categorías */}
        <div className="flex flex-wrap bg-slate-950/65 p-1 rounded-xl border border-slate-850 gap-1 w-full md:w-auto justify-start md:justify-end">
          <button
            onClick={() => setActiveTab('PRESTAMO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PRESTAMO'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            💻 Equipos de Préstamo
          </button>
          <button
            onClick={() => setActiveTab('PERIFERICOS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'PERIFERICOS'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔌 Periféricos
          </button>
          <button
            onClick={() => setActiveTab('INFRAESTRUCTURA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'INFRAESTRUCTURA'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🌐 Red e Infraestructura
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-60 flex items-center justify-center bg-slate-900/10 border border-slate-850 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="h-60 flex flex-col items-center justify-center bg-slate-900/10 border border-slate-850 rounded-2xl text-center p-6">
          <ShieldAlert className="w-10 h-10 text-rose-500 mb-2" />
          <p className="text-xs text-slate-400">{error}</p>
        </div>
      ) : equipos.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center bg-slate-900/10 border border-slate-850 rounded-2xl text-center p-6 text-slate-600">
          <HardDrive className="w-10 h-10 mb-2 text-slate-700" />
          <p className="text-xs text-slate-400 font-semibold">No hay hardware cargado en esta Aula base.</p>
        </div>
      ) : filteredEquipos.length === 0 ? (
        <div className="h-60 flex flex-col items-center justify-center bg-slate-900/10 border border-slate-850 rounded-2xl text-center p-6 text-slate-600">
          <HardDrive className="w-10 h-10 mb-2 text-slate-700" />
          <p className="text-xs text-slate-400 font-semibold">No hay activos registrados en esta categoría en esta Aula.</p>
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase">
                  <th className="p-4">Cód. Patrimonial</th>
                  <th className="p-4">Marca</th>
                  <th className="p-4">N/S</th>
                  <th className="p-4">Cód. QR</th>
                  <th className="p-4">Cargador / Fuente</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Estado Físico</th>
                  <th className="p-4">Descripción / Observaciones</th>
                  <th className="p-4 text-center">Ubicación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 text-sm text-slate-200">
                {filteredEquipos.map((eq) => (
                  <tr key={eq.idEquipo} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-350">{eq.codPatrimonial}</td>
                    <td className="p-4 text-xs font-semibold text-slate-300">{eq.marca || '-'}</td>
                    <td className="p-4 font-mono text-xs text-slate-300">{eq.numSerie || '-'}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">{eq.qrEquipo}</td>
                    <td className="p-4 text-xs text-slate-355 font-mono">
                      {eq.qrCargador ? (
                        <div>
                          <span className="font-semibold text-slate-500">QR:</span> {eq.qrCargador}
                          {eq.numSerieCargador && (
                            <span className="block text-[10px] text-slate-500">SN: {eq.numSerieCargador}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-600 italic">No asignado</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className="flex items-center gap-1.5">
                        {getEquipoIcon(eq.tipoEquipo)}
                        <span className="text-xs font-semibold">{eq.tipoEquipo}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        eq.estadoFisico === 'OPERATIVO' 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60' 
                          : 'bg-rose-950/60 text-rose-455 border border-rose-900/60'
                      }`}>
                        {eq.estadoFisico}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400 max-w-[150px] truncate" title={eq.descripcion || ''}>
                      {eq.descripcion || '-'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        eq.ubicacionActual === 'EN_AIP' 
                          ? 'text-emerald-450' 
                          : 'text-amber-450'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          eq.ubicacionActual === 'EN_AIP' ? 'bg-emerald-400' : 'bg-amber-450 animate-pulse'
                        }`}></span>
                        {eq.ubicacionActual === 'EN_AIP' ? 'Disponible (En AIP)' : 'Prestado (Aula)'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

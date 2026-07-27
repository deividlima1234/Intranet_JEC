import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { 
  Users, 
  Search, 
  Trash2, 
  ShieldAlert, 
  CheckCircle, 
  RefreshCw, 
  Eye, 
  UserPlus, 
  FileSpreadsheet, 
  Upload, 
  Play, 
  X,
  AlertTriangle,
  KeyRound,
  Pencil
} from 'lucide-react';

export default function UsersView({ currentUser, onViewCredential }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modales/Formularios visibles
  const [showAddForm, setShowAddForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);

  // Registro Manual
  const [dni, setDni] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [rol, setRol] = useState('ESTUDIANTE');
  const [grado, setGrado] = useState(1);
  const [seccion, setSeccion] = useState('A');
  const [numeroOrden, setNumeroOrden] = useState(1);
  const [cargo, setCargo] = useState('DOCENTE');
  const [areaCurricular, setAreaCurricular] = useState('COMUNICACION');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Estados de Edición de Usuario
  const [editingUser, setEditingUser] = useState(null);
  const [editDni, setEditDni] = useState('');
  const [editNombres, setEditNombres] = useState('');
  const [editApellidos, setEditApellidos] = useState('');
  const [editRol, setEditRol] = useState('ESTUDIANTE');
  const [editGrado, setEditGrado] = useState(1);
  const [editSeccion, setEditSeccion] = useState('A');
  const [editNumeroOrden, setEditNumeroOrden] = useState(1);
  const [editCargo, setEditCargo] = useState('DOCENTE');
  const [editAreaCurricular, setEditAreaCurricular] = useState('COMUNICACION');
  const [editFormLoading, setEditFormLoading] = useState(false);
  const [editFormError, setEditFormError] = useState(null);

  // Importación Masiva Excel
  const [excelFile, setExcelFile] = useState(null);
  const [parsedUsers, setParsedUsers] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importErrors, setImportErrors] = useState([]);
  const [importSuccessCount, setImportSuccessCount] = useState(0);

  // Diagnósticos de importación
  const [detectedColumns, setDetectedColumns] = useState([]);
  const [totalRowsInExcel, setTotalRowsInExcel] = useState(0);
  const [invalidRowsCount, setInvalidRowsCount] = useState(0);
  const [parseError, setParseError] = useState('');

  // Filtros de búsqueda en la tabla
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [sectionFilter, setSectionFilter] = useState('ALL');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchUsers();
  }, [refreshTrigger]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/v1/usuarios');
      if (!response.ok) throw new Error('Error al recuperar usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError('No se pudo conectar con el servidor local para recuperar la lista de usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    const payload = {
      dni,
      nombres,
      apellidos,
      rol,
      grado: rol === 'ESTUDIANTE' ? parseInt(grado) : null,
      seccion: rol === 'ESTUDIANTE' ? seccion : null,
      numeroOrden: rol === 'ESTUDIANTE' ? parseInt(numeroOrden) : null,
      cargo: rol !== 'ESTUDIANTE' ? cargo : null,
      areaCurricular: rol !== 'ESTUDIANTE' ? areaCurricular : null
    };

    try {
      const response = await fetch('/api/v1/usuarios/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setDni('');
        setNombres('');
        setApellidos('');
        setShowAddForm(false);
        setRefreshTrigger(prev => prev + 1);
      } else {
        setFormError(data.message || 'Error al registrar al usuario.');
      }
    } catch (err) {
      setFormError('Error al conectar con el servidor local.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUserClick = (user) => {
    setEditingUser(user);
    setEditDni(user.dni || '');
    setEditNombres(user.nombres || '');
    setEditApellidos(user.apellidos || '');
    setEditRol(user.rol || 'ESTUDIANTE');
    setEditGrado(user.grado || 1);
    setEditSeccion(user.seccion || 'A');
    setEditNumeroOrden(user.numeroOrden || 1);
    setEditCargo(user.cargo || 'DOCENTE');
    setEditAreaCurricular(user.areaCurricular || 'GENERAL');
    setEditFormError(null);
    setShowAddForm(false);
    setShowImportForm(false);
  };

  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    setEditFormLoading(true);
    setEditFormError(null);

    const payload = {
      dni: editDni,
      nombres: editNombres,
      apellidos: editApellidos,
      rol: editRol,
      grado: editRol === 'ESTUDIANTE' ? parseInt(editGrado) : null,
      seccion: editRol === 'ESTUDIANTE' ? editSeccion : null,
      numeroOrden: editRol === 'ESTUDIANTE' ? parseInt(editNumeroOrden) : null,
      cargo: editRol !== 'ESTUDIANTE' ? editCargo : null,
      areaCurricular: editRol !== 'ESTUDIANTE' ? editAreaCurricular : null
    };

    try {
      const response = await fetch(`/api/v1/usuarios/${editingUser.idUsuario}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setEditingUser(null);
        setRefreshTrigger(prev => prev + 1);
      } else {
        setEditFormError(data.message || 'Error al actualizar al usuario.');
      }
    } catch (err) {
      setEditFormError('Error al conectar con el servidor local.');
    } finally {
      setEditFormLoading(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar al usuario "${name}"? Esta acción borrará permanentemente su fotocheck y sus registros vinculados.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/usuarios/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setUsers(prev => prev.filter(u => u.idUsuario !== id));
      } else {
        alert('No se pudo eliminar al usuario. Es posible que tenga dependencias activas.');
      }
    } catch (err) {
      alert('Error de red al intentar eliminar.');
    }
  };

  const handleResetUserPassword = async (id, dni, name) => {
    if (!window.confirm(`¿Está seguro de que desea restablecer la contraseña de "${name}" a su DNI por defecto ("${dni}")?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/usuarios/${id}/restablecer-contrasena`, {
        method: 'POST'
      });
      if (response.ok) {
        alert(`La contraseña de "${name}" se restableció correctamente a su DNI: ${dni}`);
      } else {
        alert('No se pudo restablecer la contraseña en el servidor.');
      }
    } catch (err) {
      alert('Error de red al intentar restablecer la contraseña.');
    }
  };

  // Carga e Importación masiva de Excel
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setExcelFile(file);
    setImportErrors([]);
    setImportSuccessCount(0);
    setDetectedColumns([]);
    setTotalRowsInExcel(0);
    setInvalidRowsCount(0);
    setParseError('');

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let sheet = null;
        let sheetName = '';
        
        // Buscar la primera hoja que tenga datos
        for (const name of workbook.SheetNames) {
          const sh = workbook.Sheets[name];
          const rows = XLSX.utils.sheet_to_json(sh, { header: 1 });
          if (rows.length > 0) {
            sheet = sh;
            sheetName = name;
            break;
          }
        }

        if (!sheet) {
          sheetName = workbook.SheetNames[0];
          sheet = workbook.Sheets[sheetName];
        }

        // Obtener filas en bruto para encontrar dinámicamente la fila de cabeceras
        const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        if (rawRows.length === 0) {
          setParseError('La hoja de cálculo está vacía.');
          setParsedUsers([]);
          return;
        }

        // Buscar qué fila contiene los encabezados DNI, nombres o apellidos
        let headerRowIndex = -1;
        for (let i = 0; i < rawRows.length; i++) {
          const row = rawRows[i];
          if (Array.isArray(row)) {
            const hasHeaderKeyword = row.some(cell => {
              if (cell === null || cell === undefined) return false;
              const str = cell.toString().toLowerCase().replace(/[\s_-]/g, '');
              return str === 'dni' || str === 'documento' || str === 'nombres' || str === 'apellidos';
            });
            if (hasHeaderKeyword) {
              headerRowIndex = i;
              break;
            }
          }
        }

        // Parsear usando el rango detectado o por defecto
        let jsonList = [];
        if (headerRowIndex !== -1) {
          jsonList = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex });
        } else {
          jsonList = XLSX.utils.sheet_to_json(sheet);
        }

        if (jsonList.length === 0) {
          setParseError('No se encontraron filas de datos después de la fila de cabeceras.');
          setParsedUsers([]);
          return;
        }

        // Registrar cabeceras detectadas
        const sampleRow = jsonList[0];
        const cols = Object.keys(sampleRow);
        setDetectedColumns(cols);
        setTotalRowsInExcel(jsonList.length);

        let invalidCount = 0;

        const formatted = jsonList.map((row, index) => {
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

          const rawRol = getVal(['rol', 'ROL', 'tipo_usuario', 'cargo', 'CARGO']);
          let parsedRol = 'ESTUDIANTE';
          if (rawRol) {
            const rUpper = rawRol.toString().toUpperCase();
            if (rUpper.includes('ESTUD') || rUpper.includes('ALUMN')) {
              parsedRol = 'ESTUDIANTE';
            } else if (rUpper.includes('AUXILIAR DE EDUC') || (rUpper.includes('AUX') && rUpper.includes('EDUC'))) {
              parsedRol = 'AUXILIAR';
            } else if (rUpper.includes('AUXILIAR DE BIBLI') || rUpper.includes('BIBLIOTECA') || rUpper.includes('OFICIN') || rUpper.includes('PSICOL') || rUpper.includes('SERV') || rUpper.includes('VIGIL') || rUpper.includes('ADMIN')) {
              parsedRol = 'ADMINISTRATIVO';
            } else if (rUpper.includes('AUX')) {
              parsedRol = 'AUXILIAR';
            } else if (rUpper.includes('CIST')) {
              parsedRol = 'CIST';
            } else if (rUpper.includes('PIP')) {
              parsedRol = 'PIP';
            } else if (
              rUpper.includes('DOC') || rUpper.includes('PROF') || rUpper.includes('DIR') || 
              rUpper.includes('COORD') || rUpper.includes('COMUNIC') || rUpper.includes('CIENC') || 
              rUpper.includes('SOC') || rUpper.includes('MATEMAT') || rUpper.includes('INGLES') || 
              rUpper.includes('FISICA') || rUpper.includes('RELIG') || rUpper.includes('AIP') || 
              rUpper.includes('DPCC') || rUpper.includes('CYT') || rUpper.includes('ART')
            ) {
              parsedRol = 'DOCENTE';
            }
          }

          let rawDni = getVal(['dni', 'DNI', 'documento']);
          let cleanDni = rawDni ? rawDni.toString().trim() : '';

          // Pad DNI to 8 digits if it is numeric and short (very common excel issue where leading zeros are stripped)
          if (cleanDni && cleanDni.length < 8 && /^\d+$/.test(cleanDni)) {
            cleanDni = cleanDni.padStart(8, '0');
          }

          const nombres = getVal(['nombres', 'NOMBRES', 'nombre']);
          const apellidos = getVal(['apellidos', 'APELLIDOS', 'apellido']);

          const isValid = cleanDni && nombres && apellidos;
          if (!isValid) {
            invalidCount++;
          }

          return {
            dni: cleanDni,
            nombres: nombres ? nombres.toString().trim() : null,
            apellidos: apellidos ? apellidos.toString().trim() : null,
            rol: parsedRol,
            grado: parsedRol === 'ESTUDIANTE' ? parseInt(getVal(['grado', 'GRADO', 'anio'])) : null,
            seccion: parsedRol === 'ESTUDIANTE' ? (getVal(['seccion', 'SECCION', 'aula']) ? getVal(['seccion', 'SECCION', 'aula']).toString().toUpperCase().trim() : 'A') : null,
            numeroOrden: parsedRol === 'ESTUDIANTE' ? parseInt(getVal(['numero_orden', 'orden', 'N°', 'NRO'])) : null,
            cargo: parsedRol !== 'ESTUDIANTE' ? (getVal(['cargo', 'CARGO']) || 'DOCENTE') : null,
            areaCurricular: parsedRol !== 'ESTUDIANTE' ? (getVal(['area', 'AREA', 'area_curricular']) || 'GENERAL') : null
          };
        });

        const filtered = formatted.filter(u => u.dni && u.nombres && u.apellidos);
        setParsedUsers(filtered);
        setInvalidRowsCount(invalidCount);

        if (filtered.length === 0) {
          setParseError('No se encontraron filas con columnas válidas (DNI, NOMBRES, APELLIDOS). Verifique que los encabezados existan y que las filas tengan datos.');
        }
      } catch (err) {
        setParseError('Error al leer el archivo Excel. Asegúrese de que sea un archivo válido (.xlsx, .xls o .csv).');
        setParsedUsers([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleStartImport = async () => {
    if (parsedUsers.length === 0) return;
    setImporting(true);
    setImportErrors([]);
    setImportSuccessCount(0);
    setImportProgress({ current: parsedUsers.length, total: parsedUsers.length });

    try {
      const response = await fetch('/api/v1/usuarios/registro/lote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedUsers)
      });

      if (response.ok) {
        const data = await response.json();
        setImportSuccessCount(data.exitosos);
        const mappedErrors = data.detallesFallos.map(fallo => ({
          dni: fallo.dni,
          name: fallo.nombreCompleto,
          reason: fallo.motivo
        }));
        setImportErrors(mappedErrors);
      } else {
        const text = await response.text();
        setImportErrors([{
          dni: 'N/A',
          name: 'Lote de usuarios',
          reason: `Error en servidor: ${text || response.statusText}`
        }]);
      }
    } catch (err) {
      setImportErrors([{
        dni: 'N/A',
        name: 'Lote de usuarios',
        reason: 'Error de red local al conectar con el servidor.'
      }]);
    } finally {
      setImporting(false);
      setParsedUsers([]);
      setExcelFile(null);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const uniqueSections = useMemo(() => {
    const sections = new Set();
    users.forEach(u => {
      if (u.rol === 'ESTUDIANTE' && u.seccion) {
        if (gradeFilter === 'ALL' || String(u.grado) === gradeFilter) {
          sections.add(u.seccion.trim().toUpperCase());
        }
      }
    });
    return Array.from(sections).sort();
  }, [users, gradeFilter]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.nombres.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.apellidos.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.dni.includes(searchQuery);

    const matchesRole = roleFilter === 'ALL' || user.rol === roleFilter;
    const matchesGrade = gradeFilter === 'ALL' || (user.rol === 'ESTUDIANTE' && String(user.grado) === gradeFilter);
    const matchesSection = sectionFilter === 'ALL' || (user.rol === 'ESTUDIANTE' && user.seccion && user.seccion.toUpperCase() === sectionFilter);

    return matchesSearch && matchesRole && matchesGrade && matchesSection;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera */}
      <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 font-sans">Gestión y Registro de Usuarios</h2>
          <p className="text-sm text-slate-400">Registre individualmente o cargue masivamente el padrón de alumnos y docentes de la I.E.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowAddForm(!showAddForm); setShowImportForm(false); setEditingUser(null); }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Añadir Individual</span>
          </button>
          <button 
            onClick={() => { setShowImportForm(!showImportForm); setShowAddForm(false); setEditingUser(null); }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Importar Excel</span>
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
          <h3 className="font-bold text-slate-200 text-base">Registrar Nuevo Usuario</h3>
          
          <form onSubmit={handleRegisterUser} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">DNI</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  pattern="\d{8}"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="DNI de 8 dígitos"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Rol</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                >
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="DOCENTE">Docente</option>
                  <option value="ADMINISTRATIVO">Administrativo</option>
                  <option value="AUXILIAR">Auxiliar de Educación</option>
                  {currentUser?.rol === 'CIST' && (
                    <option value="PIP">Coordinador PIP</option>
                  )}
                  <option value="CIST">Coordinador CIST</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nombres</label>
                <input
                  type="text"
                  required
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Nombres completos"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Apellidos</label>
                <input
                  type="text"
                  required
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Apellidos completos"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {rol === 'ESTUDIANTE' ? (
              <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Grado</label>
                  <select
                    value={grado}
                    onChange={(e) => setGrado(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                  >
                    {[1, 2, 3, 4, 5].map(g => <option key={g} value={g}>{g}° Sec</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Sección</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={seccion}
                    onChange={(e) => setSeccion(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 text-center"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cargo</label>
                  <input
                    type="text"
                    required
                    value={cargo}
                    onChange={(e) => setCargo(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Área Curricular</label>
                  <input
                    type="text"
                    required
                    value={areaCurricular}
                    onChange={(e) => setAreaCurricular(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>
            )}

            {formError && (
              <div className="p-3 bg-rose-950/30 text-rose-450 border border-rose-900/50 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{formError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              {formLoading ? (
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>Completar Registro</span>
              )}
            </button>
          </form>
        </div>
      )}

      {/* FORMULARIO DE EDICIÓN DE USUARIO */}
      {editingUser && (
        <div className="bg-slate-900/30 border border-blue-500/30 rounded-2xl p-6 relative animate-fadeIn space-y-4">
          <button 
            onClick={() => setEditingUser(null)} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-blue-450 text-base">Editar Datos de Usuario: {editingUser.nombres} {editingUser.apellidos}</h3>
          
          <form onSubmit={handleEditUserSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">DNI</label>
                <input
                  type="text"
                  required
                  maxLength={8}
                  pattern="\d{8}"
                  value={editDni}
                  onChange={(e) => setEditDni(e.target.value.replace(/\D/g, ''))}
                  placeholder="DNI de 8 dígitos"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Rol</label>
                <select
                  value={editRol}
                  onChange={(e) => setEditRol(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                >
                  <option value="ESTUDIANTE">Estudiante</option>
                  <option value="DOCENTE">Docente</option>
                  <option value="ADMINISTRATIVO">Administrativo</option>
                  <option value="AUXILIAR">Auxiliar de Educación</option>
                  {currentUser?.rol === 'CIST' && (
                    <option value="PIP">Coordinador PIP</option>
                  )}
                  <option value="CIST">Coordinador CIST</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Nombres</label>
                <input
                  type="text"
                  required
                  value={editNombres}
                  onChange={(e) => setEditNombres(e.target.value)}
                  placeholder="Nombres completos"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Apellidos</label>
                <input
                  type="text"
                  required
                  value={editApellidos}
                  onChange={(e) => setEditApellidos(e.target.value)}
                  placeholder="Apellidos completos"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200"
                />
              </div>
            </div>

            {editRol === 'ESTUDIANTE' ? (
              <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Grado</label>
                  <select
                    value={editGrado}
                    onChange={(e) => setEditGrado(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200"
                  >
                    {[1, 2, 3, 4, 5].map(g => <option key={g} value={g}>{g}° Sec</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Sección</label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={editSeccion}
                    onChange={(e) => setEditSeccion(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-200 text-center"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 bg-slate-950/40 p-4 rounded-xl border border-slate-900">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Cargo</label>
                  <input
                    type="text"
                    required
                    value={editCargo}
                    onChange={(e) => setEditCargo(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Área Curricular</label>
                  <input
                    type="text"
                    required
                    value={editAreaCurricular}
                    onChange={(e) => setEditAreaCurricular(e.target.value.toUpperCase())}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  />
                </div>
              </div>
            )}

            {editFormError && (
              <div className="p-3 bg-rose-950/30 text-rose-450 border border-rose-900/50 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{editFormError}</span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={editFormLoading}
                className="w-1/2 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                {editFormLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Guardar Cambios</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FORMULARIO DE IMPORTACION MASIVA EXCEL */}
      {showImportForm && (
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-6 relative animate-fadeIn space-y-4">
          <button 
            onClick={() => setShowImportForm(false)} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="font-bold text-slate-200 text-base">Carga Masiva desde Archivo Excel</h3>

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
              Columnas requeridas: DNI, NOMBRES, APELLIDOS, ROL (Grado, Sección y Orden para Estudiantes)
            </p>
          </div>

          {parseError && (
            <div className="p-3 bg-rose-950/30 text-rose-450 border border-rose-900/50 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {excelFile && (detectedColumns.length > 0 || totalRowsInExcel > 0) && (
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-2 text-xs text-slate-300 animate-fadeIn">
              <p className="font-bold text-slate-200">Resultados del análisis del archivo:</p>
              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-900 pb-2">
                <div>Filas totales encontradas: <span className="font-bold text-slate-100">{totalRowsInExcel}</span></div>
                <div>Filas válidas (DNI + Nombre + Apellido): <span className="font-bold text-emerald-450">{parsedUsers.length}</span></div>
                <div>Filas descartadas/incompletas: <span className="font-bold text-rose-450">{invalidRowsCount}</span></div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Columnas detectadas en la tabla:</p>
                <div className="flex flex-wrap gap-1">
                  {detectedColumns.map((col, idx) => {
                    const norm = col.toString().toLowerCase().replace(/[\s_-]/g, '');
                    const isRequired = ['dni', 'documento', 'nombres', 'nombre', 'apellidos', 'apellido'].includes(norm);
                    return (
                      <span 
                        key={idx} 
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          isRequired ? 'bg-emerald-950/50 text-emerald-450 border border-emerald-900/50' : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {col}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {parsedUsers.length > 0 && (
            <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between animate-fadeIn">
              <div>
                <p className="text-xs font-bold text-slate-300">Padrón escolar cargado</p>
                <p className="text-[11px] text-slate-500">Se encontraron {parsedUsers.length} registros listos para importar.</p>
              </div>
              <button
                onClick={handleStartImport}
                className="bg-indigo-600 hover:bg-indigo-500 text-slate-100 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Comenzar Importación</span>
              </button>
            </div>
          )}

          {importing && (
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-xs text-slate-350">
                <span className="font-bold">Registrando usuarios en servidor local...</span>
                <span>{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {!importing && (importSuccessCount > 0 || importErrors.length > 0) && (
            <div className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Carga Masiva Completada
              </p>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>Importados con éxito: <span className="font-bold text-emerald-400">{importSuccessCount}</span></p>
                {importErrors.length > 0 && (
                  <p>Duplicados o fallidos: <span className="font-bold text-rose-400">{importErrors.length}</span></p>
                )}
              </div>
              {importErrors.length > 0 && (
                <div className="max-h-24 overflow-y-auto border border-slate-900 rounded bg-slate-950/80 p-2 text-[10px] text-rose-350/80 space-y-1">
                  {importErrors.map((err, idx) => (
                    <div key={idx}>DNI {err.dni} ({err.name}): {err.reason}</div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por Nombre o DNI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-xs text-slate-500 uppercase font-bold">Filtrar por:</span>
          
          <select
            value={roleFilter}
            onChange={(e) => {
              const val = e.target.value;
              setRoleFilter(val);
              if (val !== 'ALL' && val !== 'ESTUDIANTE') {
                setGradeFilter('ALL');
                setSectionFilter('ALL');
              }
            }}
            className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">Todos los Roles</option>
            <option value="ESTUDIANTE">Estudiantes</option>
            <option value="DOCENTE">Docentes</option>
            <option value="ADMINISTRATIVO">Administrativos</option>
            <option value="CIST">Coordinador CIST</option>
            <option value="PIP">Coordinador PIP</option>
          </select>

          {roleFilter === 'ESTUDIANTE' && (
            <select
              value={gradeFilter}
              onChange={(e) => {
                const val = e.target.value;
                setGradeFilter(val);
                if (val === 'ALL') {
                  setSectionFilter('ALL');
                }
              }}
              className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer animate-fadeIn"
            >
              <option value="ALL">Todos los Grados</option>
              <option value="1">1° de Secundaria</option>
              <option value="2">2° de Secundaria</option>
              <option value="3">3° de Secundaria</option>
              <option value="4">4° de Secundaria</option>
              <option value="5">5° de Secundaria</option>
            </select>
          )}

          {roleFilter === 'ESTUDIANTE' && gradeFilter !== 'ALL' && (
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer animate-fadeIn"
            >
              <option value="ALL">Todas las Secciones</option>
              {uniqueSections.map(sec => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      {loading && users.length === 0 ? (
        <div className="py-20 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-slate-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl py-12 flex flex-col items-center justify-center text-center p-6">
          <ShieldAlert className="w-10 h-10 text-rose-500/80 mb-2" />
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900/10 border border-slate-850 rounded-2xl py-16 text-center text-slate-650">
          <Users className="w-10 h-10 mx-auto mb-2 text-slate-700" />
          <p className="text-sm">No se encontraron usuarios registrados.</p>
        </div>
      ) : (
        <div className="bg-slate-900/20 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/40 text-xs font-bold text-slate-400 uppercase">
                  <th className="p-4">DNI</th>
                  <th className="p-4">Apellidos y Nombres</th>
                  <th className="p-4">Rol</th>
                  <th className="p-4">Grado / Cargo</th>
                  <th className="p-4 text-center">Credencial QR</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/50 text-sm text-slate-200">
                {filteredUsers.map((user) => (
                  <tr key={user.idUsuario} className="hover:bg-slate-900/30 transition-colors">
                    <td className="p-4 font-mono font-semibold text-slate-350">{user.dni}</td>
                    <td className="p-4">
                      <div className="font-bold">{user.apellidos}, {user.nombres}</div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        user.rol === 'ESTUDIANTE' 
                          ? 'bg-blue-950/60 text-blue-400 border border-blue-900/60' 
                          : user.rol === 'DOCENTE'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-900/60'
                          : user.rol === 'CIST'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/60'
                          : user.rol === 'PIP'
                          ? 'bg-purple-950/60 text-purple-400 border border-purple-900/60'
                          : user.rol === 'AUXILIAR'
                          ? 'bg-sky-950/60 text-sky-400 border border-sky-900/60'
                          : user.rol === 'ADMINISTRATIVO'
                          ? 'bg-teal-950/60 text-teal-400 border border-teal-900/60'
                          : 'bg-slate-950/60 text-slate-400 border border-slate-900/60'
                      }`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-400 font-medium">
                      {user.rol === 'ESTUDIANTE' ? (
                        <span>{user.grado}° Sec. "{user.seccion}" (N° {user.numeroOrden})</span>
                      ) : (
                        <span>{user.cargo || 'PERSONAL'} - {user.areaCurricular || 'GENERAL'}</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onViewCredential(user.idUsuario)}
                        className="inline-flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border border-slate-800 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver QR</span>
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleEditUserClick(user)}
                        className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 hover:text-blue-400 rounded-lg transition-colors cursor-pointer mr-1.5"
                        title="Editar Usuario"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetUserPassword(user.idUsuario, user.dni, `${user.nombres} ${user.apellidos}`)}
                        className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 hover:text-amber-400 rounded-lg transition-colors cursor-pointer mr-1.5"
                        title="Restablecer Contraseña"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.idUsuario, `${user.nombres} ${user.apellidos}`)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-455 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar Usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 bg-slate-900/10 border-t border-slate-800/60 text-xs text-slate-550 flex justify-between">
            <span>Total: {filteredUsers.length} usuarios filtrados</span>
            <span>Intranet local LAN JEC</span>
          </div>
        </div>
      )}
    </div>
  );
}

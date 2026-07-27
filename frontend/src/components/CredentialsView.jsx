import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { 
  Users, 
  HardDrive, 
  Printer, 
  Download, 
  Search, 
  QrCode, 
  GraduationCap, 
  ShieldCheck, 
  RefreshCw, 
  CheckSquare, 
  Square,
  Laptop,
  Tablet
} from 'lucide-react';

// Función para formatear y acortar nombres largos (Primer nombre y primer apellido con soporte de partículas compuestas)
function getFormattedName(nombres, apellidos) {
  const cleanNombres = (nombres || '').trim();
  const cleanApellidos = (apellidos || '').trim();
  
  let finalNames = cleanNombres;
  let finalSurnames = cleanApellidos;
  
  // Si los nombres exceden 16 caracteres, los resumimos al primer nombre
  if (cleanNombres.length > 16) {
    const nombreParts = cleanNombres.split(/\s+/);
    finalNames = nombreParts[0] || '';
  }
  
  // Si los apellidos exceden 16 caracteres, los resumimos al primer apellido (con soporte de partículas compuestas)
  if (cleanApellidos.length > 16) {
    const apellidoParts = cleanApellidos.split(/\s+/);
    if (apellidoParts.length > 0) {
      const firstPartUpper = apellidoParts[0].toUpperCase();
      if (['DE', 'DEL', 'LA', 'LAS', 'SAN'].includes(firstPartUpper) && apellidoParts[1]) {
        finalSurnames = `${apellidoParts[0]} ${apellidoParts[1]}`;
      } else {
        finalSurnames = apellidoParts[0];
      }
    }
  }
  
  return {
    firstName: finalNames.toUpperCase(),
    lastName: finalSurnames.toUpperCase()
  };
}

export default function CredentialsView({ currentUser, preselectedUserId, onClearPreselected }) {
  const [subTab, setSubTab] = useState('usuarios'); // 'usuarios' o 'equipos'

  const hasFullAccess = currentUser?.rol === 'CIST' || currentUser?.rol === 'PIP';

  // ================= ESTADOS PARA SUB-TAB: USUARIOS =================
  const [usuarios, setUsuarios] = useState([]);
  const [searchUser, setSearchUser] = useState('');
  const [selectedUserCred, setSelectedUserCred] = useState(null);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [printSelectionMode, setPrintSelectionMode] = useState('all'); // 'all', 'only', 'except'
  const [pdfFormat, setPdfFormat] = useState('a4'); // 'a4' o 'cr80'
  const [pdfStyle, setPdfStyle] = useState('dark'); // 'dark' o 'light'
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = useState('');

  // ================= ESTADOS PARA SUB-TAB: EQUIPOS =================
  const [equipos, setEquipos] = useState([]);
  const [searchEquipo, setSearchEquipo] = useState('');
  const [selectedAula, setSelectedAula] = useState('1'); // Aula base para el filtro
  const [equiposLoading, setEquiposLoading] = useState(false);
  const [selectedEquiposIds, setSelectedEquiposIds] = useState([]); // Para impresión en lote

  // Si no es CIST/PIP, cargar automáticamente su propia credencial al montar
  useEffect(() => {
    if (currentUser && !hasFullAccess) {
      fetchCredencial(currentUser.idUsuario);
    }
  }, [currentUser, hasFullAccess]);

  useEffect(() => {
    if (hasFullAccess) {
      if (subTab === 'usuarios') {
        fetchUsuarios();
      } else {
        fetchEquipos();
      }
    }
  }, [subTab, selectedAula, currentUser]);

  // Si nos pasan un ID de usuario desde fuera (ej: click en "Ver" en la Gestión de Usuarios)
  useEffect(() => {
    if (preselectedUserId) {
      setSubTab('usuarios');
      fetchCredencial(preselectedUserId);
      if (onClearPreselected) onClearPreselected();
    }
  }, [preselectedUserId]);

  // Generar QR de alta calidad para la previsualización en pantalla (con nivel de corrección de errores Bajo 'L' para maximizar el tamaño de los módulos)
  useEffect(() => {
    if (selectedUserCred && selectedUserCred.usuario) {
      QRCode.toDataURL(selectedUserCred.usuario.qrToken || `TEMP-${selectedUserCred.usuario.dni}`, { errorCorrectionLevel: 'L', margin: 1, width: 300 })
        .then(url => setQrPreviewUrl(url))
        .catch(err => console.error("Error al generar QR de vista previa:", err));
    } else {
      setQrPreviewUrl('');
    }
  }, [selectedUserCred]);

  const fetchUsuarios = async () => {
    setUsersLoading(true);
    try {
      const response = await fetch('/api/v1/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data);
      }
    } catch (err) {
      console.error("Error al obtener usuarios para credenciales:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCredencial = async (idUsuario) => {
    try {
      const response = await fetch(`/api/v1/usuarios/${idUsuario}/credencial`);
      if (response.ok) {
        const cred = await response.json();
        setSelectedUserCred(cred);
      }
    } catch (err) {
      console.error("Error al obtener credencial del usuario:", err);
    }
  };

  const fetchEquipos = async () => {
    setEquiposLoading(true);
    try {
      const response = await fetch(`/api/v1/aulas/${selectedAula}/inventario`);
      if (response.ok) {
        const data = await response.json();
        setEquipos(data);
        // Desmarcar selecciones anteriores al cambiar de aula
        setSelectedEquiposIds([]);
      }
    } catch (err) {
      console.error("Error al obtener inventario de equipos:", err);
    } finally {
      setEquiposLoading(false);
    }
  };

  // Filtrado de usuarios
  const filteredUsers = usuarios.filter(u => 
    u.nombres.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.apellidos.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.dni.includes(searchUser)
  );

  // Filtrado de equipos (en caliente)
  const filteredEquipos = equipos.filter(e => 
    e.codPatrimonial.toLowerCase().includes(searchEquipo.toLowerCase()) ||
    e.qrEquipo.toLowerCase().includes(searchEquipo.toLowerCase())
  );

  // Selección de Usuarios para impresión en lote
  const toggleSelectUser = (id) => {
    if (selectedUserIds.includes(id)) {
      setSelectedUserIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedUserIds(prev => [...prev, id]);
    }
  };

  const usersToPrint = (() => {
    if (printSelectionMode === 'all') {
      return filteredUsers;
    } else if (printSelectionMode === 'only') {
      return usuarios.filter(u => selectedUserIds.includes(u.idUsuario));
    } else if (printSelectionMode === 'except') {
      return filteredUsers.filter(u => !selectedUserIds.includes(u.idUsuario));
    }
    return [];
  })();

  // Descarga de Fotocheck de Usuario Individual (Usa vectores de alta calidad en vez de html2canvas)
  const handleDownloadUserPdf = async () => {
    if (!selectedUserCred) return;
    try {
      const logoBase64 = await getBase64ImageFromUrl('/images/logo_IE.png');
      const qrUrl = await QRCode.toDataURL(selectedUserCred.usuario.qrToken || `TEMP-${selectedUserCred.usuario.dni}`, { errorCorrectionLevel: 'L', margin: 1, width: 250 });
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [53.98, 85.6]
      });
      drawUserCard(pdf, 0, 0, 53.98, 85.6, selectedUserCred.usuario, qrUrl, pdfStyle, logoBase64);
      pdf.save(`credencial_${selectedUserCred.usuario.dni}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF individual:", err);
    }
  };

  // Impresión en lote de fotochecks (Vectores de alta calidad organizados)
  const handlePrintBatchUsers = async () => {
    if (usersToPrint.length === 0) return;
    setIsGeneratingBatch(true);
    try {
      const logoBase64 = await getBase64ImageFromUrl('/images/logo_IE.png');
      const promises = usersToPrint.map(async (user) => {
        const qrUrl = await QRCode.toDataURL(user.qrToken || `TEMP-${user.dni}`, { errorCorrectionLevel: 'L', margin: 1, width: 250 });
        return { user, qrUrl };
      });
      const items = await Promise.all(promises);

      let doc;
      if (pdfFormat === 'cr80') {
        doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: [53.98, 85.6]
        });

        items.forEach((item, index) => {
          if (index > 0) {
            doc.addPage([53.98, 85.6], 'portrait');
          }
          drawUserCard(doc, 0, 0, 53.98, 85.6, item.user, item.qrUrl, pdfStyle, logoBase64);
        });
      } else {
        // Formato A4 grilla 3x3
        doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4'
        });

        let colIndex = 0;
        let rowIndex = 0;
        const cardW = 53.98;
        const cardH = 85.6;
        const gapX = 5;
        const gapY = 6;
        const startX = 19;
        const startY = 14;

        items.forEach((item, index) => {
          if (index > 0 && index % 9 === 0) {
            doc.addPage();
            colIndex = 0;
            rowIndex = 0;
          }

          const x = startX + colIndex * (cardW + gapX);
          const y = startY + rowIndex * (cardH + gapY);

          drawUserCard(doc, x, y, cardW, cardH, item.user, item.qrUrl, pdfStyle, logoBase64);

          colIndex++;
          if (colIndex === 3) {
            colIndex = 0;
            rowIndex++;
          }
        });
      }

      doc.save(`fotochecks_intranet_jec_${pdfStyle}_${pdfFormat}.pdf`);
    } catch (err) {
      console.error("Error al generar PDF en lote:", err);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  // Control de Selección de Equipos (Lote)
  const toggleSelectEquipo = (id) => {
    if (selectedEquiposIds.includes(id)) {
      setSelectedEquiposIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedEquiposIds(prev => [...prev, id]);
    }
  };

  const toggleSelectAllEquipos = () => {
    if (selectedEquiposIds.length === filteredEquipos.length) {
      setSelectedEquiposIds([]);
    } else {
      setSelectedEquiposIds(filteredEquipos.map(e => e.idEquipo));
    }
  };

  // Impresión de Etiquetas QR de Equipos en lote
  const handlePrintEquiposLabels = () => {
    if (selectedEquiposIds.length === 0) return;
    
    // Crear una ventana temporal de impresión para las etiquetas
    const printWindow = window.open('', '_blank');
    const selectedList = equipos.filter(e => selectedEquiposIds.includes(e.idEquipo));

    // Generar las imágenes QR offline en la ventana de impresión
    let htmlContent = `
      <html>
      <head>
        <title>Imprimir Etiquetas QR de Hardware</title>
        <style>
          body {
            font-family: 'Courier New', Courier, monospace;
            background-color: white;
            color: black;
            margin: 0;
            padding: 10px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
          }
          .label-card {
            border: 1px solid black;
            padding: 8px;
            text-align: center;
            width: 170px;
            height: 220px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
            page-break-inside: avoid;
          }
          .label-card.has-charger {
            height: 295px;
          }
          .header {
            border-bottom: 1px solid black;
            width: 100%;
            padding-bottom: 4px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }
          .header-main {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 2px;
          }
          .header-main img {
            height: 14px;
            width: 14px;
            object-fit: contain;
            margin-right: 4px;
          }
          .header-sub {
            font-size: 9px;
            font-weight: bold;
            font-family: monospace;
          }
          .qr-img {
            width: 100px;
            height: 100px;
          }
          .info-section {
            border-top: 1px solid black;
            width: 100%;
            padding-top: 4px;
            display: flex;
            flex-direction: column;
            text-align: left;
            font-size: 7.5px;
            font-family: monospace;
            gap: 2px;
            word-break: break-all;
          }
          .footer {
            font-size: 6.5px;
            font-weight: bold;
            border-top: 1px solid black;
            width: 100%;
            padding-top: 2px;
            text-transform: uppercase;
            font-family: sans-serif;
            margin-top: 2px;
          }
          .charger-divider {
            width: 100%;
            border-top: 3px double black;
            margin: 6px 0 4px 0;
          }
          .charger-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            text-align: left;
            box-sizing: border-box;
          }
          .charger-info {
            font-size: 7.5px;
            font-family: monospace;
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 2px;
          }
          .charger-tag {
            font-family: sans-serif;
            font-weight: bold;
            font-size: 8px;
            text-transform: uppercase;
          }
          .charger-qr {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
            margin-left: 6px;
          }
          .qr-carg-img {
            width: 40px;
            height: 40px;
          }
          @media print {
            body { padding: 0; }
            .label-card { border: 1px dashed black; }
          }
        </style>
      </head>
      <body>
        <div class="grid" id="labels-container">
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();

    const container = printWindow.document.getElementById('labels-container');
    
    // Generar asíncronamente los QRs offline usando canvas de la ventana de impresión
    let promises = selectedList.map(async (eq) => {
      const qrDataUrl = await QRCode.toDataURL(eq.qrEquipo, { margin: 1, width: 250 });
      let qrCargDataUrl = null;
      if (eq.qrCargador) {
        qrCargDataUrl = await QRCode.toDataURL(eq.qrCargador, { margin: 1, width: 150 });
      }

      const card = printWindow.document.createElement('div');
      card.className = eq.qrCargador ? 'label-card has-charger' : 'label-card';
      
      let chargerSectionHtml = '';
      if (qrCargDataUrl) {
        chargerSectionHtml = `
          <div class="charger-divider"></div>
          <div class="charger-section">
            <div class="charger-info">
              <div class="charger-tag">CARGADOR JEC</div>
              <div><strong>N/S:</strong> ${eq.numSerieCargador || 'N/A'}</div>
              <div class="charger-vinculo"><strong>LAP:</strong> ${eq.codPatrimonial}</div>
            </div>
            <div class="charger-qr">
              <img class="qr-carg-img" src="${qrCargDataUrl}" />
            </div>
          </div>
        `;
      }

      card.innerHTML = `
        <div class="header">
          <div class="header-main">
            <img src="/images/logo_IE.png" onerror="if(this.src.endsWith('.png')){this.src='/images/logo_IE.jpg';}else if(this.src.endsWith('.jpg')){this.src='/images/logo_IE.jpeg';}else{this.style.display='none';}" />
            <span>I.E. HUANOQUITE</span>
          </div>
          <div class="header-sub">${eq.codPatrimonial}</div>
        </div>
        <img class="qr-img" src="${qrDataUrl}" />
        <div class="info-section">
          <div><strong>N/S:</strong> ${eq.numSerie || 'N/A'}</div>
          <div><strong>QR:</strong> ${eq.qrEquipo}</div>
          <div><strong>TIPO:</strong> ${eq.tipoEquipo}</div>
        </div>
        <div class="footer">CONTROL PATRIMONIAL JEC</div>
        ${chargerSectionHtml}
      `;
      container.appendChild(card);
    });

    Promise.all(promises).then(() => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cabecera Principal */}
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-2xl font-bold text-slate-100">
          {hasFullAccess ? "Centro de Identificación QR" : "Mi Identificación JEC"}
        </h2>
        <p className="text-sm text-slate-400">
          {hasFullAccess 
            ? "Genere y exporte credenciales firmadas de usuarios y etiquetas patrimoniales para hardware."
            : "Visualiza y descarga tu fotocheck digital con tu código QR de acceso personal."}
        </p>
      </div>

      {/* Selectores de Sub-Secciones - Solo Admin/Staff */}
      {hasFullAccess && (
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setSubTab('usuarios')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
              subTab === 'usuarios'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/10'
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Códigos QR de Usuarios (Fotochecks)</span>
          </button>
          <button
            onClick={() => setSubTab('equipos')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-xs border-b-2 transition-all cursor-pointer ${
              subTab === 'equipos'
                ? 'border-emerald-500 text-emerald-400 bg-slate-900/10'
                : 'border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>Etiquetas QR de Equipos (Hardware)</span>
          </button>
        </div>
      )}

      {/* ================= CONTENIDO DE USUARIOS ================= */}
      {subTab === 'usuarios' && (
        <div className={hasFullAccess ? "grid grid-cols-1 lg:grid-cols-12 gap-6" : "flex flex-col items-center justify-center py-6 w-full"}>
          {/* Listado de Usuarios a elegir (7 Columnas) - Solo Admin/Staff */}
          {hasFullAccess && (
            <div className="lg:col-span-7 bg-slate-900/20 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-200 text-sm">Seleccione el Usuario:</h3>
                <button 
                  onClick={fetchUsuarios}
                  className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${usersLoading ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
              </div>
              
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder="Buscar docente o estudiante por DNI/Nombre..."
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Panel de Configuración de Lote */}
              <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-850/80 pb-2">
                  <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-sans">
                    <Printer className="w-3.5 h-3.5 text-emerald-400" />
                    Impresión en Lote de Fotochecks
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded-full">
                    {usersToPrint.length} para imprimir
                  </span>
                </div>

                {/* Modo de selección */}
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Modo de Selección:</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPrintSelectionMode('all')}
                      className={`px-2 py-1.5 text-[10px] font-bold border rounded-lg transition-all cursor-pointer text-center ${
                        printSelectionMode === 'all'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950/20 border-slate-850 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintSelectionMode('only')}
                      className={`px-2 py-1.5 text-[10px] font-bold border rounded-lg transition-all cursor-pointer text-center ${
                        printSelectionMode === 'only'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950/20 border-slate-850 text-slate-400 hover:text-slate-205'
                      }`}
                    >
                      Solo seleccionados
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrintSelectionMode('except')}
                      className={`px-2 py-1.5 text-[10px] font-bold border rounded-lg transition-all cursor-pointer text-center ${
                        printSelectionMode === 'except'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950/20 border-slate-850 text-slate-400 hover:text-slate-205'
                      }`}
                    >
                      Todos menos estos
                    </button>
                  </div>
                </div>

                {/* Formato y estilo */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Formato de Página:</span>
                    <select
                      value={pdfFormat}
                      onChange={(e) => setPdfFormat(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="a4">Hoja A4 (Grilla 3x3)</option>
                      <option value="cr80">Tarjeta Indiv. (CR80)</option>
                    </select>
                  </div>
                  <div className="space-y-1 flex flex-col">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase mb-1">Estilo del Badge:</span>
                    <select
                      value={pdfStyle}
                      onChange={(e) => setPdfStyle(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-850 rounded-lg px-2.5 py-1.5 text-[10px] text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="dark">Premium Oscuro</option>
                      <option value="light">Ahorro de Tinta</option>
                    </select>
                  </div>
                </div>

                {/* Botón de acción e indicador de selección masiva */}
                <div className="flex gap-2 pt-1">
                  {printSelectionMode !== 'all' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedUserIds.length > 0) {
                          setSelectedUserIds([]);
                        } else {
                          setSelectedUserIds(filteredUsers.map(u => u.idUsuario));
                        }
                      }}
                      className="text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-355 px-3 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                    >
                      {selectedUserIds.length > 0 ? "Deseleccionar" : "Marcar Todos"}
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={usersToPrint.length === 0 || isGeneratingBatch}
                    onClick={handlePrintBatchUsers}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-955 disabled:text-slate-655 py-2 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isGeneratingBatch ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generando PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Descargar Lote ({usersToPrint.length})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {usersLoading ? (
                <div className="py-20 flex justify-center"><RefreshCw className="w-6 h-6 text-slate-500 animate-spin" /></div>
              ) : filteredUsers.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No hay usuarios registrados en el sistema.</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredUsers.map(user => {
                    const isChecked = selectedUserIds.includes(user.idUsuario);
                    const isHighlighted = selectedUserCred && selectedUserCred.usuario.idUsuario === user.idUsuario;
                    
                    return (
                      <div
                        key={user.idUsuario}
                        className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${
                          isHighlighted
                            ? 'bg-emerald-950/40 border-emerald-500/50 text-slate-100'
                            : 'bg-slate-950/30 border-slate-850 hover:bg-slate-900/30 text-slate-355'
                        }`}
                        onClick={() => fetchCredencial(user.idUsuario)}
                      >
                        {/* Checkbox selector para lote */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectUser(user.idUsuario);
                          }}
                          className="text-slate-500 hover:text-emerald-400 transition-colors p-1 shrink-0"
                        >
                          {isChecked ? (
                            <CheckSquare className="w-4.5 h-4.5 text-emerald-400 fill-current/10" />
                          ) : (
                            <Square className="w-4.5 h-4.5 text-slate-600 hover:text-slate-450" />
                          )}
                        </button>

                        {/* Información de usuario */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{user.apellidos}, {user.nombres}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                            DNI: {user.dni} • Rol: {user.rol}
                          </p>
                        </div>

                        <span className="text-[10px] text-emerald-450 font-semibold shrink-0">
                          Ver
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Previsualizador de Fotocheck */}
          <div className={hasFullAccess ? "lg:col-span-5 flex flex-col items-center justify-start" : "w-full flex flex-col items-center justify-center"}>
            {selectedUserCred ? (
              <div className="space-y-4 flex flex-col items-center">
                {/* Fotocheck CR80 */}
                <div 
                  id="user-badge-card"
                  className="w-[260px] h-[412px] bg-slate-950 border-2 border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
                  <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  {/* Cabecera compacta centrada */}
                  <div className="w-full border-b border-slate-800/80 pb-2 text-center shrink-0">
                    <p className="text-[8px] uppercase tracking-widest text-emerald-400 font-black flex items-center justify-center gap-1 font-sans">
                      <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
                      I.E. Huanoquite
                    </p>
                    <h4 className="text-xs font-black text-slate-100 uppercase tracking-tight font-sans mt-0.5">Intranet JEC</h4>
                  </div>

                  {/* Contenedor del Cuerpo (Centrado vertical y horizontal) */}
                  <div className="flex-1 w-full flex flex-col justify-around py-2.5 items-center">
                    
                    {/* Datos del Usuario Agrandados y Centrados */}
                    <div className="space-y-0.5 w-full text-center px-1 shrink-0">
                      <h3 className="text-base font-black text-slate-100 leading-tight uppercase truncate">
                        {getFormattedName(selectedUserCred.usuario.nombres, selectedUserCred.usuario.apellidos).lastName}
                      </h3>
                      <h3 className="text-base font-black text-slate-100 leading-tight uppercase truncate">
                        {getFormattedName(selectedUserCred.usuario.nombres, selectedUserCred.usuario.apellidos).firstName}
                      </h3>
                    </div>

                    {/* Píldora de Rol */}
                    <div className="shrink-0">
                      <span className={`inline-block px-3 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase border ${
                        selectedUserCred.usuario.rol === 'ESTUDIANTE' 
                          ? 'bg-blue-950/80 text-blue-400 border-blue-900/60' 
                          : 'bg-emerald-950/80 text-emerald-400 border-emerald-900/60'
                      }`}>
                        {selectedUserCred.usuario.rol}
                      </span>
                    </div>

                    {/* Detalles y DNI */}
                    <div className="w-full text-center space-y-0.5 shrink-0">
                      {selectedUserCred.usuario.rol !== 'ESTUDIANTE' && (
                        <p className="text-[9px] font-mono text-slate-550">DNI: {selectedUserCred.usuario.dni}</p>
                      )}
                      {selectedUserCred.usuario.rol === 'ESTUDIANTE' ? (
                        <p className="text-[10px] text-slate-400 font-bold">
                          Grado: {selectedUserCred.usuario.grado}° - Secc: {selectedUserCred.usuario.seccion}
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-bold">
                          Área: {selectedUserCred.usuario.areaCurricular || 'GENERAL'}
                        </p>
                      )}
                    </div>

                    {/* QR Agrandado y Priorizado abajo, sin bordes excesivos */}
                    <div className="bg-white p-1 rounded-2xl shadow-xl border border-emerald-500/20 w-[156px] h-[156px] flex items-center justify-center shrink-0 relative">
                      {qrPreviewUrl ? (
                        <>
                          <img 
                            src={qrPreviewUrl} 
                            alt="Código QR de Acceso" 
                            className="w-[148px] h-[148px] rounded-lg"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white p-1 rounded-md shadow-sm">
                              <img src="/images/logo_IE.png" className="w-8 h-8 object-contain" alt="Logo IE" onError={(e) => e.target.style.display='none'} />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-[148px] h-[148px] flex items-center justify-center bg-slate-50 rounded-lg">
                          <RefreshCw className="w-6 h-6 animate-spin text-slate-400" />
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Pie de Firma */}
                  <div className="w-full border-t border-slate-800/80 pt-2 flex items-center justify-center gap-1 mt-auto shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[8px] text-slate-550 uppercase tracking-widest font-black">Identidad Firmada Offline</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 w-[260px]">
                  <button
                    onClick={handleDownloadUserPdf}
                    className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-450" />
                    <span>Guardar PDF</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                  >
                    <Printer className="w-4 h-4 text-indigo-400" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-[260px] h-[412px] bg-slate-900/10 border border-dashed border-slate-850 rounded-2xl flex flex-col items-center justify-center text-center p-6 text-slate-650">
                <QrCode className="w-12 h-12 mb-3 text-slate-700 animate-pulse" />
                <p className="text-xs">
                  {hasFullAccess 
                    ? "Seleccione un usuario de la lista de la izquierda para generar y visualizar su Fotocheck corporativo."
                    : "Cargando credencial de acceso personal..."}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= CONTENIDO DE EQUIPOS ================= */}
      {subTab === 'equipos' && (
        <div className="space-y-4">
          
          {/* Barra de Filtros de Hardware */}
          <div className="bg-slate-900/30 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold uppercase">Aula AIP:</span>
              <select
                value={selectedAula}
                onChange={(e) => setSelectedAula(e.target.value)}
                className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 cursor-pointer focus:outline-none"
              >
                <option value="1">AIP 01 - Principal (Laptops)</option>
                <option value="2">AIP 02 (Tabletas)</option>
                <option value="3">AIP 03</option>
              </select>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchEquipo}
                onChange={(e) => setSearchEquipo(e.target.value)}
                placeholder="Buscar por patrimonio o QR..."
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={toggleSelectAllEquipos}
                className="text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 px-3 py-2 rounded-xl cursor-pointer"
              >
                {selectedEquiposIds.length === filteredEquipos.length ? "Deseleccionar Todos" : "Seleccionar Todos"}
              </button>
              <button
                onClick={handlePrintEquiposLabels}
                disabled={selectedEquiposIds.length === 0}
                className="flex items-center gap-2 bg-emerald-500 disabled:bg-slate-800 hover:bg-emerald-400 disabled:text-slate-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Lote ({selectedEquiposIds.length})</span>
              </button>
            </div>
          </div>

          {/* Grilla de Equipos con Generador QR Offline */}
          {equiposLoading ? (
            <div className="py-20 flex justify-center"><RefreshCw className="w-6 h-6 text-slate-500 animate-spin" /></div>
          ) : filteredEquipos.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-10">No hay hardware registrado en esta Aula AIP.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredEquipos.map(eq => {
                const isSelected = selectedEquiposIds.includes(eq.idEquipo);
                return (
                  <div 
                    key={eq.idEquipo}
                    onClick={() => toggleSelectEquipo(eq.idEquipo)}
                    className={`bg-slate-900/30 border p-4 rounded-2xl flex flex-col justify-between items-center text-center relative cursor-pointer select-none transition-all ${
                      isSelected 
                        ? 'border-emerald-500 bg-emerald-950/10 shadow-lg shadow-emerald-500/5' 
                        : 'border-slate-800 hover:border-slate-705'
                    }`}
                  >
                    {/* Botón check de selección */}
                    <div className="absolute top-3 right-3 text-slate-500">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 fill-current" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-700" />
                      )}
                    </div>

                    <div className="w-full border-b border-slate-850 pb-2 mb-3 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1.5 justify-center mb-0.5">
                        <img 
                          src="/images/logo_IE.png" 
                          onError={(e) => {
                            if (e.target.src.endsWith('.png')) {
                              e.target.src = '/images/logo_IE.jpg';
                            } else if (e.target.src.endsWith('.jpg')) {
                              e.target.src = '/images/logo_IE.jpeg';
                            } else {
                              e.target.style.display = 'none';
                            }
                          }} 
                          alt="" 
                          className="w-4 h-4 object-contain" 
                        />
                        <p className="text-[9px] uppercase font-bold text-slate-500">I.E. HUANOQUITE</p>
                      </div>
                      <p className="text-[10px] text-slate-300 font-bold truncate">{eq.codPatrimonial}</p>
                    </div>

                    {/* QR Imagen offline */}
                    <QrLocalRenderer text={eq.qrEquipo} />

                    <div className="w-full border-t border-slate-850 pt-2 mt-3 text-left text-[9px] text-slate-400 font-mono space-y-0.5">
                      <div><strong>N/S:</strong> {eq.numSerie || 'N/A'}</div>
                      <div><strong>QR:</strong> {eq.qrEquipo}</div>
                      <div className="flex gap-2 text-[8px] text-slate-500 mt-1 border-t border-slate-900 pt-1">
                        <span><strong>TIPO:</strong> {eq.tipoEquipo}</span>
                        <span className={eq.ubicacionActual === 'EN_AIP' ? 'text-emerald-450 font-bold' : 'text-amber-450 font-bold'}>
                          {eq.ubicacionActual}
                        </span>
                      </div>
                    </div>

                    {eq.qrCargador && (
                      <div className="w-full mt-3 pt-3 border-t-2 border-double border-slate-700/60">
                        <div className="flex justify-between items-center text-left text-[9px] text-slate-400 font-mono">
                          <div className="flex-1 space-y-0.5">
                            <div className="text-[9px] font-bold text-slate-300 font-sans tracking-wide">CARGADOR JEC</div>
                            <div><strong>N/S:</strong> {eq.numSerieCargador || 'N/A'}</div>
                            <div className="text-[8px] text-slate-550 font-sans mt-0.5">LAP: {eq.codPatrimonial}</div>
                          </div>
                          <div className="shrink-0 ml-3">
                            <QrLocalRenderer text={eq.qrCargador} size={32} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// Componente helper para renderizar el código QR offline localmente usando canvas en base64
function QrLocalRenderer({ text, size = 96 }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(text, { margin: 1, width: size * 1.5 })
      .then(res => setUrl(res))
      .catch(err => console.error(err));
  }, [text, size]);

  const containerClass = size === 32 
    ? "bg-white p-0.5 rounded shadow-sm border border-slate-800/10 flex items-center justify-center"
    : "bg-white p-2 rounded-xl shadow-md border border-slate-800/10 flex items-center justify-center";

  const imgSize = size === 32 ? "w-8 h-8" : "w-24 h-24";
  const spinnerSize = size === 32 ? "w-3 h-3" : "w-4 h-4";

  return (
    <div className={containerClass}>
      {url ? (
        <img src={url} alt="QR Código de Barras" className={imgSize} />
      ) : (
        <div className={`${imgSize} flex items-center justify-center`}>
          <RefreshCw className={`${spinnerSize} animate-spin text-slate-400`} />
        </div>
      )}
    </div>
  );
}

// Helper para cargar imagen base64
async function getBase64ImageFromUrl(imageUrl) {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Error cargando imagen base64:', e);
    return null;
  }
}

// Dibujar la credencial de usuario en formato vectorial de alta definición usando jsPDF
function drawUserCard(doc, x, y, width, height, user, qrDataUrl, style, logoBase64) {
  // 1. Fondo y Borde
  if (style === 'dark') {
    doc.setFillColor(2, 6, 17); // Slate-950
    doc.setDrawColor(16, 185, 129); // Emerald-500
  } else {
    doc.setFillColor(255, 255, 255); // Blanco
    doc.setDrawColor(16, 185, 129); // Emerald-500
  }
  doc.roundedRect(x, y, width, height, 4, 4, 'FD');

  // 2. Línea divisoria de cabecera
  if (style === 'dark') {
    doc.setDrawColor(30, 41, 59); // Slate-800
  } else {
    doc.setDrawColor(226, 232, 240); // Slate-200
  }

  // 3. Textos del Header (Centrado)
  doc.setFontSize(5.5);
  if (style === 'dark') {
    doc.setTextColor(52, 211, 153); // Emerald-400
  } else {
    doc.setTextColor(4, 120, 87); // Emerald-700
  }
  doc.setFont("Helvetica", "bold");
  doc.text("I.E. HUANOQUITE", x + width / 2, y + 7, { align: "center" });

  doc.setFontSize(8.5);
  if (style === 'dark') {
    doc.setTextColor(241, 245, 249); // Slate-100
  } else {
    doc.setTextColor(15, 23, 42); // Slate-900
  }
  doc.text("INTRANET JEC", x + width / 2, y + 11.5, { align: "center" });
  
  doc.line(x + 4, y + 14, x + width - 4, y + 14);

  const { firstName, lastName } = getFormattedName(user.nombres, user.apellidos);

  // 4. Nombres y Apellidos (Centrados y Agrandados)
  doc.setFontSize(10);
  doc.setFont("Helvetica", "bold");
  if (style === 'dark') {
    doc.setTextColor(248, 250, 252);
  } else {
    doc.setTextColor(15, 23, 42);
  }
  
  doc.text(lastName, x + width / 2, y + 19, { align: "center" });
  doc.text(firstName, x + width / 2, y + 23, { align: "center" });

  // 5. Píldora de Rol (Badge) justo abajo del nombre
  const pillW = 24;
  const pillH = 4.5;
  const px = x + (width - pillW) / 2;
  const py = y + 26;

  let fillColors, borderColors, textColors;
  if (user.rol === 'ESTUDIANTE') {
    if (style === 'dark') {
      fillColors = [23, 37, 84];
      borderColors = [30, 58, 138];
      textColors = [96, 165, 250];
    } else {
      fillColors = [239, 246, 255];
      borderColors = [191, 219, 254];
      textColors = [29, 78, 216];
    }
  } else {
    if (style === 'dark') {
      fillColors = [6, 78, 59];
      borderColors = [6, 95, 70];
      textColors = [52, 211, 153];
    } else {
      fillColors = [236, 253, 245];
      borderColors = [167, 243, 208];
      textColors = [4, 120, 87];
    }
  }

  doc.setFillColor(fillColors[0], fillColors[1], fillColors[2]);
  doc.setDrawColor(borderColors[0], borderColors[1], borderColors[2]);
  doc.roundedRect(px, py, pillW, pillH, 1.5, 1.5, 'FD');

  doc.setFontSize(5);
  doc.setTextColor(textColors[0], textColors[1], textColors[2]);
  doc.text(user.rol || '', x + width / 2, py + 3.2, { align: "center" });

  // 6. Detalles (DNI y Grado/Sección o Área)
  doc.setFontSize(6.5);
  doc.setFont("Helvetica", "normal");
  if (style === 'dark') {
    doc.setTextColor(148, 163, 184);
  } else {
    doc.setTextColor(71, 85, 105);
  }
  if (user.rol !== 'ESTUDIANTE') {
    doc.text(`DNI: ${user.dni || ''}`, x + width / 2, y + 34.5, { align: "center" });
  }

  doc.setFontSize(7.5);
  if (style === 'dark') {
    doc.setTextColor(148, 163, 184);
  } else {
    doc.setTextColor(71, 85, 105);
  }

  let detailsText = '';
  let detailsY = y + 38;
  if (user.rol === 'ESTUDIANTE') {
    detailsText = `Grado: ${user.grado || ''}° - Secc: ${user.seccion || ''}`;
    detailsY = y + 36;
  } else {
    detailsText = `Área: ${user.areaCurricular || 'GENERAL'}`;
    detailsY = y + 38;
  }
  doc.text(detailsText, x + width / 2, detailsY, { align: "center" });

  // 7. Contenedor de QR e Imagen (Centrado en la parte inferior, Agrandado a 37mm x 37mm)
  const qrBoxSize = 37;
  const qrImgSize = 35;
  const qrBoxX = x + (width - qrBoxSize) / 2;
  const qrBoxY = y + 40.5;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 3, 3, 'FD');

  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', x + (width - qrImgSize) / 2, qrBoxY + 1, qrImgSize, qrImgSize);
    
    // Dibujar logo centrado encima del QR
    if (logoBase64) {
      try {
        const logoSize = 8;
        const logoX = x + width / 2 - logoSize / 2;
        const logoY = qrBoxY + 1 + qrImgSize / 2 - logoSize / 2;
        
        doc.setFillColor(255, 255, 255);
        doc.roundedRect(logoX - 0.5, logoY - 0.5, logoSize + 1, logoSize + 1, 0.5, 0.5, 'F');
        doc.addImage(logoBase64, 'PNG', logoX, logoY, logoSize, logoSize);
      } catch(e) {}
    }
  }

  // 8. Footer
  if (style === 'dark') {
    doc.setDrawColor(30, 41, 59);
    doc.setTextColor(71, 85, 105);
  } else {
    doc.setDrawColor(241, 245, 249);
    doc.setTextColor(148, 163, 184);
  }
  doc.line(x + 4, y + 79.5, x + width - 4, y + 79.5);

  doc.setFontSize(5);
  doc.setFont("Helvetica", "bold");
  doc.text("IDENTIDAD FIRMADA OFFLINE", x + width / 2, y + 83, { align: "center" });
}

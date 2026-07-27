/**
 * Utilidad para imprimir el Acta de Asignación o Préstamo de la Intranet JEC (I.E. Huanoquite)
 * Genera un documento formal optimizado para impresión física o guardado en PDF.
 */
export const printActa = (session) => {
  const printWindow = window.open('', '_blank', 'width=850,height=950');
  if (!printWindow) {
    alert("Por favor, permita las ventanas emergentes (pop-ups) para ver e imprimir el acta.");
    return;
  }

  const formatDateTime = (isoString) => {
    if (!isoString) return '-';
    const d = new Date(isoString);
    return d.toLocaleString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const isClase = session.tipoOperacion === 'CLASE_INTERNA';
  const isColegiado = session.tipoOperacion === 'TRABAJO_COLEGIADO';
  
  // Extraer hashes cortos para mostrar como sellos digitales de no repudio
  const getFirmaHash = (firmaJwt) => {
    if (!firmaJwt) return null;
    if (firmaJwt.includes(':')) {
      return firmaJwt.split(':')[1]; // Retorna la firma HMAC corta
    }
    // Si es un JWT largo, extraemos una porción del signature al final
    const parts = firmaJwt.split('.');
    if (parts.length === 3) {
      return parts[2].substring(0, 16) + '...';
    }
    return firmaJwt.substring(0, 16) + '...';
  };

  const hashInicio = getFirmaHash(session.firmaInicio);
  const hashFin = getFirmaHash(session.firmaFin);

  const content = `
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Acta de Asignación y Préstamo - Intranet JEC</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            color: #111;
            padding: 30px;
            line-height: 1.4;
            font-size: 11px;
            background-color: #fff;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
          }
          .header-text {
            text-align: center;
            flex-grow: 1;
            padding: 0 10px;
          }
          .header-text h1 {
            font-size: 14px;
            margin: 0;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .header-text h2 {
            font-size: 10px;
            margin: 4px 0 0 0;
            color: #333;
            font-weight: normal;
            line-height: 1.3;
          }
          .header-logo {
            width: 70px;
            height: 70px;
            border: 2px solid #333;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: bold;
            text-align: center;
            background-color: #fafafa;
          }
          .header-logo-right {
            border-radius: 4px;
          }
          .title-area {
            text-align: center;
            margin: 15px 0;
          }
          .title {
            text-decoration: underline;
            font-size: 13px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 0;
          }
          .subtitle {
            font-size: 9px;
            color: #555;
            margin-top: 3px;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .details-table td {
            padding: 5px 8px;
            border: 1px solid #bbb;
            font-size: 11px;
          }
          .details-table td.label {
            font-weight: bold;
            background-color: #f2f2f2;
            width: 25%;
            text-transform: uppercase;
            font-size: 10px;
          }
          .devices-title {
            font-weight: bold;
            font-size: 11px;
            margin-top: 15px;
            margin-bottom: 6px;
            text-transform: uppercase;
            border-bottom: 1px solid #111;
            padding-bottom: 2px;
          }
          .devices-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .devices-table th, .devices-table td {
            border: 1px solid #888;
            padding: 6px 8px;
            text-align: left;
            font-size: 10px;
          }
          .devices-table th {
            background-color: #f2f2f2;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 9px;
          }
          .declaracion {
            text-align: justify;
            margin-bottom: 20px;
            font-size: 10px;
            border: 1px solid #ddd;
            padding: 8px;
            background-color: #fafafa;
          }
          
          /* SECCIÓN DE NO REPUDIO (SELLOS DIGITALES) */
          .security-section {
            border: 2px dashed #000;
            padding: 12px;
            background-color: #fcfcfc;
            margin-bottom: 20px;
            border-radius: 8px;
          }
          .security-title {
            font-size: 10px;
            font-weight: bold;
            text-align: center;
            text-transform: uppercase;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          .security-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
          }
          .security-seal {
            border: 1px solid #ccc;
            padding: 8px;
            background: #fff;
            border-radius: 6px;
            position: relative;
          }
          .seal-active {
            border-color: #059669;
          }
          .seal-pending {
            border-color: #dc2626;
            background-color: #fef2f2;
          }
          .seal-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 9px;
            margin-bottom: 4px;
            padding-bottom: 3px;
            border-bottom: 1px solid #eee;
          }
          .seal-header-in { color: #059669; }
          .seal-header-out { color: #dc2626; }
          .seal-row {
            display: flex;
            margin-bottom: 2px;
            font-size: 9px;
          }
          .seal-label {
            font-weight: bold;
            width: 75px;
            color: #555;
          }
          .seal-value {
            font-family: monospace;
            word-break: break-all;
            color: #111;
          }
          
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 25px;
          }
          .signature-block {
            text-align: center;
            width: 45%;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-bottom: 4px;
            width: 80%;
            margin-left: auto;
            margin-right: auto;
          }
          
          .footer-text {
            text-align: center;
            font-size: 8px;
            color: #666;
            margin-top: 25px;
            border-top: 1px solid #eee;
            padding-top: 5px;
          }

          .print-btn-container {
            margin-bottom: 15px;
            display: flex;
            justify-content: flex-end;
          }
          .print-btn {
            background-color: #059669;
            color: white;
            border: none;
            padding: 7px 14px;
            font-size: 11px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .print-btn:hover {
            background-color: #047857;
          }
          
          @media print {
            .print-btn-container {
              display: none;
            }
            body {
              padding: 0;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-btn-container">
          <button class="print-btn" onclick="window.print()">Imprimir Acta / Guardar PDF</button>
        </div>
        
        <div class="header">
          <div class="header-logo">
            <span style="font-size: 10px; margin-bottom: 2px;">MINEDU</span>
            <span style="border-top: 1px solid #333; padding-top: 2px; width: 85%;">JEC</span>
          </div>
          <div class="header-text">
            <h1>Institución Educativa Huanoquite</h1>
            <h2>Jornada Escolar Completa (JEC)<br>Área de Innovación y Soporte Tecnológico (AIST)</h2>
          </div>
          <div class="header-logo header-logo-right">
            <span style="font-size: 8px;">AIP CONTROL</span>
            <span style="font-size: 10px; font-weight: bold; margin-top: 4px; color: #059669;">VALIDADO</span>
          </div>
        </div>
        
        <div class="title-area">
          <div class="title">
            ${isColegiado ? 'Acta de Registro de Trabajo Colegiado / Reforzamiento' : isClase ? 'Acta de Asignación y Uso de Aula AIP' : 'Acta de Préstamo Externo de Activos'}
          </div>
          <div class="subtitle">DOCUMENTO DE AVAL PATRIMONIAL Y CONFORMIDAD TÉCNICA</div>
        </div>
        
        <table class="details-table">
          <tr>
            <td class="label">Código de Acta (ID):</td>
            <td style="font-family: monospace; font-weight: bold;">${session.idSesion}</td>
          </tr>
          <tr>
            <td class="label">Docente Responsable:</td>
            <td><strong>${session.docenteNombre}</strong></td>
          </tr>
          <tr>
            <td class="label">Aula AIP de Origen:</td>
            <td>${session.aulaNombre}</td>
          </tr>
          <tr>
            <td class="label">Tipo de Transacción:</td>
            <td>${isColegiado ? 'Trabajo Colegiado / Planificación' : isClase ? 'Modo Clase AIP (Laptops Fijas)' : 'Préstamo Externo (Salida de Tabletas/Equipos)'}</td>
          </tr>
          ${isColegiado ? `
          <tr>
            <td class="label">Área / Categoría:</td>
            <td><strong>${session.gradoSeccion || 'Sin área registrada.'}</strong></td>
          </tr>
          <tr>
            <td class="label">Agenda / Tema a Tratar:</td>
            <td><strong>${session.descripcion || 'Sin agenda registrada.'}</strong></td>
          </tr>
          ` : isClase ? `
          <tr>
            <td class="label">Grado y Sección:</td>
            <td><strong>${session.gradoSeccion}</strong></td>
          </tr>
          <tr>
            <td class="label">Tema de Sesión:</td>
            <td>${session.descripcion || 'Sin descripción o tema registrado'}</td>
          </tr>
          ` : ''}
          <tr>
            <td class="label">Fecha y Hora de Inicio:</td>
            <td>${formatDateTime(session.horaInicio)}</td>
          </tr>
          <tr>
            <td class="label">Fecha y Hora de Fin:</td>
            <td>${session.horaFin ? formatDateTime(session.horaFin) : '<strong>EN CURSO (Pendiente de Devolución)</strong>'}</td>
          </tr>
        </table>
        
        ${isColegiado ? `
        <div class="devices-title">Detalles de Actividad</div>
        <div style="border: 1px solid #888; padding: 10px; font-size: 10px; background-color: #fafafa; margin-bottom: 15px;">
          Actividad de planificación pedagógica, capacitación docente o trabajo colegiado de área. No se han asignado ni retirado dispositivos físicos para esta sesión.
        </div>
        ` : `
        <div class="devices-title">Equipos Tecnológicos Asignados (${session.detalles?.length || 0})</div>
        <table class="devices-table">
          <thead>
            <tr>
              <th style="width: 5%">N°</th>
              <th style="width: 25%">Código Patrimonial</th>
              <th style="width: 20%">Tipo de Equipo</th>
              <th style="width: 35%">Usuario / Estudiante Asignado</th>
              <th style="width: 15%">Estado de Entrega</th>
            </tr>
          </thead>
          <tbody>
            ${session.detalles && session.detalles.length > 0 ? session.detalles.map((det, index) => `
              <tr>
                <td>${index + 1}</td>
                <td><strong>${det.codPatrimonial}</strong></td>
                <td>${det.tipoEquipo}</td>
                <td>${det.estudianteNombre ? `Orden N° ${det.numeroOrden || '-'} - ${det.estudianteNombre}` : 'Docente Responsable (Custodia Directa)'}</td>
                <td>${det.incidencias || 'Operativo'}</td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="5" style="text-align: center; font-style: italic; color: #666;">No hay equipos asociados en este registro.</td>
              </tr>
            `}
          </tbody>
        </table>
        `}
        
        <div class="declaracion">
          ${isColegiado ? `
            <strong>DECLARACIÓN DE CONFORMIDAD Y REGISTRO:</strong> El coordinador/docente firmante declara el uso formal del ambiente del Aula de Innovación Pedagógica (AIP) para la realización del trabajo colegiado o de capacitación pedagógica. Se compromete a cuidar el mobiliario y los recursos del aula, así como dejar el ambiente apagado y asegurado al finalizar.
          ` : `
            <strong>DECLARACIÓN DE CONFORMIDAD Y RESPONSABILIDAD:</strong> El docente firmante declara recibir a entera conformidad la infraestructura y equipos tecnológicos descritos en el presente documento, todos en condiciones operativas y con carga de batería suficiente. Asimismo, asume el compromiso legal y técnico de custodiar los activos, vigilar el uso responsable por parte de los estudiantes y reportar de forma inmediata cualquier incidencia física o técnica al Coordinador de Innovación y Soporte Tecnológico (CIST).
          `}
        </div>
        
        <!-- SECCIÓN DE NO REPUDIO (CRIPTOGRAFÍA QR) -->
        <div class="security-section">
          <div class="security-title">Verificación de Firmas Electrónicas y No Repudio (Credencial QR Criptográfica)</div>
          <div class="security-grid">
            
            <!-- Firma de Inicio -->
            <div class="security-seal seal-active">
              <div class="seal-header seal-header-in">
                <span>[✓] FIRMA DIGITAL DE INICIO</span>
                <span>AUTORIZADO</span>
              </div>
              <div class="seal-row">
                <div class="seal-label">Firmante:</div>
                <div class="seal-value" style="font-weight: bold;">${session.docenteNombre}</div>
              </div>
              <div class="seal-row">
                <div class="seal-label">Fecha/Hora:</div>
                <div class="seal-value">${formatDateTime(session.horaInicio)}</div>
              </div>
              <div class="seal-row">
                <div class="seal-label">Firma Hash:</div>
                <div class="seal-value">${hashInicio || 'Verificación QR Offline'}</div>
              </div>
              <div class="seal-row">
                <div class="seal-label">Token QR:</div>
                <div class="seal-value" style="font-size: 8px; color: #777;">${session.firmaInicio ? session.firmaInicio.substring(0, 32) + '...' : 'Autenticación CIST'}</div>
              </div>
            </div>
            
            <!-- Firma de Fin -->
            ${session.firmaFin ? `
              <div class="security-seal seal-active">
                <div class="seal-header seal-header-in">
                  <span>[✓] FIRMA DIGITAL DE RETORNO</span>
                  <span>CERRADO</span>
                </div>
                <div class="seal-row">
                  <div class="seal-label">Firmante:</div>
                  <div class="seal-value" style="font-weight: bold;">${session.docenteNombre}</div>
                </div>
                <div class="seal-row">
                  <div class="seal-label">Fecha/Hora:</div>
                  <div class="seal-value">${formatDateTime(session.horaFin)}</div>
                </div>
                <div class="seal-row">
                  <div class="seal-label">Firma Hash:</div>
                  <div class="seal-value">${hashFin || 'Verificación QR Offline'}</div>
                </div>
                <div class="seal-row">
                  <div class="seal-label">Token QR:</div>
                  <div class="seal-value" style="font-size: 8px; color: #777;">${session.firmaFin.substring(0, 32) + '...'}</div>
                </div>
              </div>
            ` : `
              <div class="security-seal seal-pending">
                <div class="seal-header seal-header-out">
                  <span>[!] FIRMA DIGITAL DE RETORNO</span>
                  <span>PENDIENTE</span>
                </div>
                <div style="height: 48px; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; color: #dc2626; text-transform: uppercase;">
                  Requiere escaneo de credencial QR al devolver
                </div>
              </div>
            `}
            
          </div>
        </div>
        
        <div class="signatures">
          <div class="signature-block">
            <div style="height: 35px;"></div>
            <div class="signature-line"></div>
            <p style="margin: 0; font-size: 10px;"><strong>Coordinadora PIP</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 9px; color: #444;">Soporte Pedagógico</p>
          </div>
          <div class="signature-block">
            <div style="height: 35px;"></div>
            <div class="signature-line"></div>
            <p style="margin: 0; font-size: 10px;"><strong>Coordinador CIST</strong></p>
            <p style="margin: 2px 0 0 0; font-size: 9px; color: #444;">Área de Innovación y Soporte</p>
          </div>
        </div>
        
        <div class="footer-text">
          Intranet JEC Offline - I.E. Huanoquite. Este documento constituye un registro legal de custodia temporal y control de bienes estatales. Generado e impreso de forma local y descentralizada.
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
};

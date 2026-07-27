const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let targetUrl = 'https://colegiohuanoquite.org.pe/?kiosk=asistencia';
let canQuit = false;

// Determinar ruta del archivo de configuración al lado del ejecutable
const isPackaged = app.isPackaged;
const baseDir = isPackaged ? path.dirname(process.execPath) : __dirname;
const configPath = path.join(baseDir, 'kiosk_config.txt');

function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      const defaultContent = 
        "# CONFIGURACION DE LA ESTACION DE ASISTENCIA JEC\n" +
        "# Cambie la URL por la correspondiente a su servidor de Intranet JEC.\n\n" +
        "URL=https://colegiohuanoquite.org.pe/?kiosk=asistencia\n";
      fs.writeFileSync(configPath, defaultContent, 'utf8');
    } else {
      const content = fs.readFileSync(configPath, 'utf8');
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.toLowerCase().startsWith('url=')) {
          const urlVal = trimmed.substring(4).trim();
          if (urlVal) {
            targetUrl = urlVal;
          }
        }
      }
    }
  } catch (err) {
    console.error('Error cargando configuración:', err);
  }
}

// Cargar la configuración antes de que inicie la app para registrar switches de red
loadConfig();

// Permitir el uso de la cámara en orígenes locales HTTP (útil para pruebas en red LAN local)
if (targetUrl.startsWith('http://') && !targetUrl.includes('localhost') && !targetUrl.includes('127.0.0.1')) {
  app.commandLine.appendSwitch('unsafely-treat-insecure-origin-as-secure', targetUrl);
}

function createWindow() {
  // Ya no llamamos a loadConfig() aquí porque se carga antes de app.ready
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    kiosk: true, // Kiosk mode
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(targetUrl).catch((err) => {
    console.error('Fallo al cargar URL:', err);
    mainWindow.loadURL(`data:text/html;charset=utf-8,
      <html>
        <head>
          <style>
            body { background-color: #020617; color: #f1f5f9; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            h1 { color: #f43f5e; font-size: 24px; margin-bottom: 10px; }
            p { color: #94a3b8; font-size: 14px; max-width: 400px; line-height: 1.5; }
            .badge { background-color: #1e293b; padding: 4px 8px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #10b981; }
          </style>
        </head>
        <body>
          <div>
            <h1>Error de Conexión en Kiosco</h1>
            <p>No se pudo conectar con el servidor de la intranet.</p>
            <p><span class="badge">${targetUrl}</span></p>
            <p>Asegúrese de que el servidor esté en línea o revise la URL en kiosk_config.txt.</p>
            <p style="font-size: 10px; color: #475569; margin-top: 40px;">Presione Ctrl + Shift + Q para salir.</p>
          </div>
        </body>
      </html>
    `);
  });

  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      event.preventDefault();
    }
  });

  mainWindow.on('close', (e) => {
    if (!canQuit) {
      e.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  const { session } = require('electron');

  // Permitir automáticamente el acceso a la cámara (media)
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      return callback(true);
    }
    callback(false);
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (permission === 'media') {
      return true;
    }
    return false;
  });

  createWindow();

  // Registrar Ctrl + Shift + Q para salir
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['No', 'Sí, Salir'],
      defaultId: 0,
      title: 'Salir de la Aplicación',
      message: '¿Está seguro de que desea cerrar la Estación de Asistencia Estudiantil?'
    }).then((result) => {
      if (result.response === 1) {
        canQuit = true;
        app.quit();
      }
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

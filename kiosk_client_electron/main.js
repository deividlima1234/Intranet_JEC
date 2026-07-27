const { app, BrowserWindow, globalShortcut, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let targetUrl = 'http://192.168.50.10/?kiosk=scanner';
let canQuit = false;

// Determinar ruta del archivo de configuración al lado del ejecutable
const isPackaged = app.isPackaged;
const baseDir = isPackaged ? path.dirname(process.execPath) : __dirname;
const configPath = path.join(baseDir, 'kiosk_config.txt');

function loadConfig() {
  try {
    if (!fs.existsSync(configPath)) {
      const defaultContent = 
        "# CONFIGURACION DE LA ESTACION DE ESCAÑO/ASISTENCIA JEC\n" +
        "# Cambie la URL por la correspondiente a su servidor local de Intranet JEC.\n\n" +
        "# Estación de Escaneo y Préstamos:\n" +
        "# URL=http://192.168.50.10/?kiosk=scanner\n\n" +
        "# Estación de Asistencia Estudiantil:\n" +
        "# URL=http://192.168.50.10/?kiosk=asistencia\n\n" +
        "URL=http://192.168.50.10/?kiosk=scanner\n";
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

function createWindow() {
  loadConfig();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    fullscreen: true,
    kiosk: true, // Kiosk mode bloquea la pantalla completa y desactiva atajos del sistema
    alwaysOnTop: true,
    frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    }
  });

  // Ocultar barra de menús en Windows/Linux
  mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(false);

  // Navegar a la URL
  mainWindow.loadURL(targetUrl).catch((err) => {
    console.error('Fallo al cargar URL:', err);
    // Mostrar HTML de error local simple si el servidor está desconectado
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
            <p>No se pudo conectar con el servidor local de la intranet.</p>
            <p><span class="badge">${targetUrl}</span></p>
            <p>Asegúrese de que el servidor esté encendido y que el cable de red local esté conectado.</p>
            <p style="font-size: 10px; color: #475569; margin-top: 40px;">Presione Ctrl + Shift + Q para salir.</p>
          </div>
        </body>
      </html>
    `);
  });

  // Bloquear el click derecho (Menú Contextual)
  mainWindow.webContents.on('context-menu', (e) => {
    e.preventDefault();
  });

  // Bloquear F12 y combinación F12/Ctrl+Shift+I desde el propiowebContents
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      event.preventDefault();
    }
  });

  // Controlar cierre de la ventana
  mainWindow.on('close', (e) => {
    if (!canQuit) {
      e.preventDefault(); // Previene Alt+F4 o cierre externo
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  // Registrar atajo de cierre global: Ctrl + Shift + Q
  globalShortcut.register('CommandOrControl+Shift+Q', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['No', 'Sí, Salir'],
      defaultId: 0,
      title: 'Salir de la Aplicación',
      message: '¿Está seguro de que desea cerrar la Estación Kiosco JEC?'
    }).then((result) => {
      if (result.response === 1) {
        canQuit = true;
        app.quit();
      }
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  // Desregistrar atajos globales al salir
  globalShortcut.unregisterAll();
});

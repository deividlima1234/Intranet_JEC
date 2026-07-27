const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const configAsistencia = {
  appId: "pe.org.colegiohuanoquite.kiosk.asistencia",
  productName: "AsistenciaJEC",
  directories: {
    output: "dist"
  },
  win: {
    target: ["portable"],
    icon: "build/icon_asistencia.png",
    requestedExecutionLevel: "highestAvailable"
  },
  files: [
    "main_asistencia.js",
    "package.json"
  ],
  extraMetadata: {
    main: "main_asistencia.js"
  }
};

const configScanner = {
  appId: "pe.org.colegiohuanoquite.kiosk.scanner",
  productName: "ScannerJEC",
  directories: {
    output: "dist"
  },
  win: {
    target: ["portable"],
    icon: "build/icon_scanner.png",
    requestedExecutionLevel: "highestAvailable"
  },
  files: [
    "main_scanner.js",
    "package.json"
  ],
  extraMetadata: {
    main: "main_scanner.js"
  }
};

const pathAsistencia = path.join(__dirname, 'config_asistencia.json');
const pathScanner = path.join(__dirname, 'config_scanner.json');

try {
  console.log('--- Generando configuraciones temporales de construcción ---');
  fs.writeFileSync(pathAsistencia, JSON.stringify(configAsistencia, null, 2));
  fs.writeFileSync(pathScanner, JSON.stringify(configScanner, null, 2));

  console.log('\n======================================================');
  console.log('1. COMPILANDO KIOSCO: ASISTENCIA ESTUDIANTIL JEC');
  console.log('======================================================');
  execSync('npx electron-builder build --win --x64 --config config_asistencia.json', { stdio: 'inherit' });
  console.log('✔ AsistenciaJEC.exe compilado exitosamente.');

  console.log('\n======================================================');
  console.log('2. COMPILANDO KIOSCO: ESCANEO Y PRESTAMOS AIP JEC');
  console.log('======================================================');
  execSync('npx electron-builder build --win --x64 --config config_scanner.json', { stdio: 'inherit' });
  console.log('✔ ScannerJEC.exe compilado exitosamente.');

} catch (err) {
  console.error('\n❌ Ocurrió un error durante la compilación:', err.message);
  process.exit(1);
} finally {
  console.log('\n--- Limpiando archivos temporales ---');
  if (fs.existsSync(pathAsistencia)) fs.unlinkSync(pathAsistencia);
  if (fs.existsSync(pathScanner)) fs.unlinkSync(pathScanner);
}

console.log('\n🎉 ¡PROCESO FINALIZADO CON ÉXITO! Ambos ejecutables están listos en la carpeta "dist/".');

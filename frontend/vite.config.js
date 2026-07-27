import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0', // Permite conexiones desde la red LAN y la IP de Tailscale
    port: 5173,
    strictPort: true,
    // Permite que Vite responda a peticiones provenientes de tu dominio
    allowedHosts: ['colegiohuanoquite.org.pe'], 
    // Configuración crítica de WebSockets para atravesar Cloudflare Tunnels
    hmr: {
      protocol: 'wss', // Secure WebSockets
      host: 'colegiohuanoquite.org.pe',
      clientPort: 443 // Cloudflare Edge expone el puerto 443, no el 5173
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

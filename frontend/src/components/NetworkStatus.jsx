import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(false);
  const [latency, setLatency] = useState(null);

  useEffect(() => {
    const checkStatus = async () => {
      const startTime = Date.now();
      try {
        // Hacemos una consulta rápida al endpoint de inventario
        const response = await fetch('/api/v1/aulas/1/inventario', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // Timeout corto para evitar colgar la UI si el servidor se apaga
          signal: AbortSignal.timeout(2000)
        });
        if (response.ok) {
          setIsOnline(true);
          setLatency(Date.now() - startTime);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        setIsOnline(false);
        setLatency(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check cada 5s

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-inner transition-colors duration-300 ${
      isOnline 
        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30' 
        : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
    }`}>
      {isOnline ? (
        <>
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          <span>INTRANET ONLINE {latency ? `(${latency}ms)` : ''}</span>
        </>
      ) : (
        <>
          <WifiOff className="w-3.5 h-3.5" />
          <span>INTRANET OFFLINE</span>
        </>
      )}
    </div>
  );
}

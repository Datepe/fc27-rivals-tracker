import React from 'react';
import { 
  Trophy, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  PlusCircle, 
  Download, 
  Upload, 
  ShieldAlert,
  Gamepad2
} from 'lucide-react';

export default function Header({ 
  stats, 
  driveConfig, 
  isSyncing, 
  onOpenRegister, 
  onOpenDriveModal, 
  onSyncNow,
  onExport,
  onImport
}) {
  const isConnected = Boolean(driveConfig?.scriptUrl);
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = '';
    }
  };

  return (
    <header className="border-b border-fc-border bg-fc-surface/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo & Marca FC 27 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#00ff87] to-[#38bdf8] flex items-center justify-center shadow-neon">
                <Gamepad2 className="h-6 w-6 text-black font-black" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-xl font-black tracking-wider text-white">
                    FC 27 <span className="text-fc-neon">RIVALS</span>
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-fc-border text-fc-neon border border-fc-neon/30">
                    Tracker
                  </span>
                </div>
                <p className="text-xs text-slate-400">Historial y Registro de Rivales</p>
              </div>
            </div>

            {/* Mobile Actions Shortcut */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={() => onOpenRegister()}
                className="p-2 rounded-lg bg-fc-neon text-black font-bold hover:bg-fc-neonHover transition shadow-neon"
                title="Registrar partido"
              >
                <PlusCircle className="h-5 w-5" />
              </button>
              <button
                onClick={onOpenDriveModal}
                className={`p-2 rounded-lg border transition ${
                  isConnected 
                    ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' 
                    : 'border-amber-500/50 bg-amber-500/10 text-amber-400'
                }`}
                title="Ajustes de Google Drive"
              >
                <Cloud className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Estadísticas rápidas globales (W-L) */}
          <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-4 py-1 px-3 bg-fc-bg/80 rounded-xl border border-fc-border/80">
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">Partidos</span>
              <span className="text-lg font-black text-white">{stats.totalMatches}</span>
            </div>
            <div className="h-7 w-[1px] bg-fc-border"></div>
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold block">Ganados</span>
              <span className="text-lg font-black text-emerald-400">{stats.wins}</span>
            </div>
            <div className="h-7 w-[1px] bg-fc-border"></div>
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-red-400 font-semibold block">Perdidos</span>
              <span className="text-lg font-black text-red-400">{stats.losses}</span>
            </div>
            <div className="h-7 w-[1px] bg-fc-border"></div>
            <div className="text-center px-2">
              <span className="text-[11px] uppercase tracking-wider text-fc-neon font-semibold block">Efectividad</span>
              <span className="text-lg font-black text-fc-neon">{stats.winRate}%</span>
            </div>
          </div>

          {/* Botones de acción desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Estado de Google Drive */}
            <div className="flex items-center space-x-1">
              <button
                onClick={onOpenDriveModal}
                className={`flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-xl border transition ${
                  isConnected 
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20' 
                    : 'border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                }`}
              >
                {isConnected ? (
                  <>
                    <Cloud className="h-4 w-4 text-emerald-400" />
                    <span>Google Drive Conectado</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="h-4 w-4 text-amber-400" />
                    <span>Conectar Google Drive</span>
                  </>
                )}
              </button>

              {isConnected && (
                <button
                  onClick={onSyncNow}
                  disabled={isSyncing}
                  className="p-2 rounded-xl border border-fc-border hover:border-fc-neon text-slate-300 hover:text-white transition disabled:opacity-50"
                  title="Sincronizar ahora con Google Drive"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-fc-neon' : ''}`} />
                </button>
              )}
            </div>

            {/* Import / Export JSON */}
            <div className="flex items-center space-x-1 border-l border-fc-border pl-2">
              <button
                onClick={onExport}
                className="p-2 text-slate-400 hover:text-fc-neon hover:bg-fc-card rounded-lg transition"
                title="Descargar copia de seguridad (JSON)"
              >
                <Download className="h-4 w-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-fc-cyan hover:bg-fc-card rounded-lg transition"
                title="Restaurar copia de seguridad (JSON)"
              >
                <Upload className="h-4 w-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Botón Principal: Registrar Rival */}
            <button
              onClick={() => onOpenRegister()}
              className="flex items-center space-x-2 bg-fc-neon hover:bg-fc-neonHover text-black font-extrabold px-4 py-2 rounded-xl transition shadow-neon active:scale-95"
            >
              <PlusCircle className="h-5 w-5" />
              <span>Registrar Partido</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}

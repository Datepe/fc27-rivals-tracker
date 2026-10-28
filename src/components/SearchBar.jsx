import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Trophy, 
  Skull, 
  HelpCircle, 
  PlusCircle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function SearchBar({ 
  searchQuery, 
  onSearchChange, 
  matchedPlayer, 
  isSearching, 
  onQuickAddMatch,
  onOpenRegisterWithPlayer
}) {
  const inputRef = React.useRef(null);

  // Atajo de teclado: presionar '/' para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        onSearchChange('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      {/* Campo de Búsqueda Principal */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-fc-neon transition">
          <Search className="h-6 w-6" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Escribe el nombre o Gamertag del rival (ej. ProGamer99)..."
          className="w-full pl-12 pr-12 py-4 rounded-2xl bg-fc-surface/90 border-2 border-fc-border text-white placeholder-slate-400 focus:outline-none focus:border-fc-neon focus:ring-4 focus:ring-fc-neon/20 transition-all text-lg shadow-xl"
        />
        {hasQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition"
          >
            <X className="h-5 w-5 bg-fc-card p-1 rounded-full border border-fc-border" />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center mt-2 px-2 text-xs text-slate-400">
        <span>Presiona <kbd className="px-1.5 py-0.5 rounded bg-fc-card border border-fc-border text-slate-300 font-mono">/</kbd> para buscar</span>
        {hasQuery && <span>Buscando: &quot;{searchQuery}&quot;</span>}
      </div>

      {/* RESULTADO DE LA BÚSQUEDA */}
      {hasQuery && (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {matchedPlayer ? (
            /* CASO 1: JUGADOR YA ENCONTRADO EN EL REGISTRO */
            <div className="rounded-2xl border-2 border-fc-neon/60 bg-gradient-to-br from-fc-surface via-fc-card to-fc-surface p-6 shadow-neon">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Info del Rival */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2.5 w-2.5 rounded-full bg-fc-neon animate-pulse"></span>
                    <span className="text-xs uppercase font-extrabold tracking-widest text-fc-neon">
                      ¡Rival Ya Enfrentado!
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-wide">
                    {matchedPlayer.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs text-slate-300">
                      Último resultado:{' '}
                      <strong className={
                        matchedPlayer.lastResult === 'Ganado' 
                          ? 'text-emerald-400' 
                          : (matchedPlayer.lastResult === 'Perdido' ? 'text-red-400' : 'text-amber-400')
                      }>
                        {matchedPlayer.lastResult || 'No especificado'}
                      </strong>
                    </span>
                    {matchedPlayer.lastDate && (
                      <span className="text-xs text-slate-400 flex items-center space-x-1">
                        <Clock className="h-3 w-3 inline" />
                        <span>{matchedPlayer.lastDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Balance Ganadas / Perdidas */}
                <div className="flex items-center gap-3 bg-fc-bg/90 p-3 rounded-xl border border-fc-border">
                  <div className="text-center px-3">
                    <span className="text-xs text-emerald-400 font-bold block">Ganaste</span>
                    <span className="text-2xl font-black text-emerald-400">{matchedPlayer.wins}</span>
                  </div>
                  <div className="text-lg font-bold text-slate-500">-</div>
                  <div className="text-center px-3">
                    <span className="text-xs text-red-400 font-bold block">Perdiste</span>
                    <span className="text-2xl font-black text-red-400">{matchedPlayer.losses}</span>
                  </div>
                  {matchedPlayer.draws > 0 && (
                    <>
                      <div className="text-lg font-bold text-slate-500">-</div>
                      <div className="text-center px-2">
                        <span className="text-xs text-amber-400 font-bold block">Empates</span>
                        <span className="text-2xl font-black text-amber-400">{matchedPlayer.draws}</span>
                      </div>
                    </>
                  )}
                  <div className="border-l border-fc-border pl-3 text-center">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total</span>
                    <span className="text-sm font-extrabold text-white">{matchedPlayer.totalMatches} partidos</span>
                  </div>
                </div>

              </div>

              {/* Notas guardadas del rival */}
              {matchedPlayer.notes && (
                <div className="mt-4 p-3 bg-fc-bg/60 rounded-xl border border-fc-border text-sm text-slate-300">
                  <span className="text-xs uppercase font-bold text-slate-400 tracking-wider block mb-1">
                    Notas sobre su estilo de juego:
                  </span>
                  &quot;{matchedPlayer.notes}&quot;
                </div>
              )}

              {/* Botón rápido para registrar nuevo partido contra él */}
              <div className="mt-5 pt-4 border-t border-fc-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-slate-300 font-medium">
                  ¿Lo estás enfrentando ahora mismo en FC 27?
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => onQuickAddMatch(matchedPlayer.name, 'W')}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 font-bold text-xs transition active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>+ Le Gané</span>
                  </button>
                  <button
                    onClick={() => onQuickAddMatch(matchedPlayer.name, 'L')}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-300 font-bold text-xs transition active:scale-95"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>+ Me Ganó</span>
                  </button>
                  <button
                    onClick={() => onOpenRegisterWithPlayer(matchedPlayer.name)}
                    className="px-3 py-2 rounded-xl bg-fc-card hover:bg-fc-cardHover border border-fc-border text-slate-300 text-xs font-semibold transition"
                  >
                    Detallar
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* CASO 2: RIVAL NO ENCONTRADO (NUEVO JUGADOR) */
            <div className="rounded-2xl border-2 border-dashed border-amber-500/60 bg-fc-surface/90 p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
                      Rival No Registrado
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    No has jugado contra <span className="text-amber-300">&quot;{searchQuery.trim()}&quot;</span> antes
                  </h3>
                  <p className="text-xs text-slate-400">
                    Es la primera vez que te enfrentas a este usuario en FC 27.
                  </p>
                </div>

                {/* Acciones directas de registro */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => onQuickAddMatch(searchQuery.trim(), 'W')}
                    className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-black font-extrabold px-4 py-2.5 rounded-xl transition shadow-win active:scale-95 text-sm"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>¡Gané!</span>
                  </button>
                  <button
                    onClick={() => onQuickAddMatch(searchQuery.trim(), 'L')}
                    className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-extrabold px-4 py-2.5 rounded-xl transition shadow-loss active:scale-95 text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Perdí</span>
                  </button>
                  <button
                    onClick={() => onOpenRegisterWithPlayer(searchQuery.trim())}
                    className="flex items-center space-x-1 px-3 py-2.5 rounded-xl bg-fc-card hover:bg-fc-border border border-fc-border text-slate-300 text-xs font-semibold transition"
                  >
                    <span>Más opciones</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

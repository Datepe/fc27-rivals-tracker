import React from 'react';
import { 
  Trophy, 
  Skull, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Equal
} from 'lucide-react';

export default function PlayerCard({ 
  player, 
  onQuickAddMatch, 
  onDeletePlayer 
}) {
  const isPositive = player.wins > player.losses;
  const isNegative = player.losses > player.wins;
  const isTied = player.wins === player.losses;

  return (
    <div className="group rounded-2xl bg-fc-card/70 border border-fc-border hover:border-slate-500/50 p-5 transition-all duration-200 hover:shadow-xl hover:bg-fc-card flex flex-col justify-between">
      <div>
        {/* Cabecera de la tarjeta: Nombre y Badge de Estado */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="text-lg font-black text-white truncate tracking-wide group-hover:text-fc-neon transition">
              {player.name}
            </h4>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-0.5">
              <span className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>Último: {player.lastDate || 'Reciente'}</span>
              </span>
            </div>
          </div>

          {/* Badge de Efectividad */}
          <div className="flex items-center space-x-1 px-2.5 py-1 rounded-xl text-xs font-black border" style={{
            backgroundColor: isPositive ? 'rgba(16, 185, 129, 0.15)' : (isNegative ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)'),
            borderColor: isPositive ? 'rgba(16, 185, 129, 0.4)' : (isNegative ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'),
            color: isPositive ? '#34d399' : (isNegative ? '#f87171' : '#fbbf24')
          }}>
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {isTied && <Equal className="h-3 w-3" />}
            <span>{player.winRate}% W</span>
          </div>
        </div>

        {/* Marcador W - L */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-fc-bg/80 border border-fc-border mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Récord:</span>
            <span className="text-sm font-extrabold text-emerald-400">{player.wins}W</span>
            <span className="text-xs text-slate-500">/</span>
            <span className="text-sm font-extrabold text-red-400">{player.losses}L</span>
            {player.draws > 0 && (
              <>
                <span className="text-xs text-slate-500">/</span>
                <span className="text-sm font-extrabold text-amber-400">{player.draws}D</span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {player.totalMatches} {player.totalMatches === 1 ? 'partido' : 'partidos'}
          </span>
        </div>

        {/* Último Resultado */}
        <div className="text-xs text-slate-300 mb-3 flex items-center justify-between">
          <span className="text-slate-400">Último enfrentamiento:</span>
          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
            player.lastResult === 'Ganado' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : (player.lastResult === 'Perdido' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30')
          }`}>
            {player.lastResult || 'Ganado'}
          </span>
        </div>

        {/* Notas del Jugador */}
        {player.notes && (
          <div className="flex items-start space-x-1.5 p-2 rounded-lg bg-fc-surface/50 border border-fc-border/60 text-xs text-slate-300 mb-3 italic">
            <MessageSquare className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">&quot;{player.notes}&quot;</span>
          </div>
        )}
      </div>

      {/* Botones de acción al pie de la tarjeta */}
      <div className="pt-3 border-t border-fc-border/80 flex items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onQuickAddMatch(player.name, 'W')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition active:scale-95"
            title="Registrar una nueva victoria contra este jugador"
          >
            <Plus className="h-3 w-3" />
            <span>Gané</span>
          </button>
          <button
            onClick={() => onQuickAddMatch(player.name, 'L')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition active:scale-95"
            title="Registrar una nueva derrota contra este jugador"
          >
            <Plus className="h-3 w-3" />
            <span>Perdí</span>
          </button>
        </div>

        <button
          onClick={() => onDeletePlayer(player.id || player.name)}
          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
          title="Eliminar registro"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

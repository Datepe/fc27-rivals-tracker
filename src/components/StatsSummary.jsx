import React from 'react';
import { 
  Users, 
  Flame, 
  ThumbsUp, 
  ThumbsDown, 
  Filter, 
  ArrowUpDown,
  Search,
  PlusCircle
} from 'lucide-react';

export default function StatsSummary({ 
  totalPlayers, 
  activeFilter, 
  onFilterChange, 
  sortBy, 
  onSortChange,
  onOpenRegister
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-fc-border">
      
      {/* Pestañas de Filtro */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-fc-neon text-black shadow-neon'
              : 'bg-fc-card text-slate-300 hover:bg-fc-cardHover border border-fc-border'
          }`}
        >
          Todos ({totalPlayers})
        </button>

        <button
          onClick={() => onFilterChange('positive')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
            activeFilter === 'positive'
              ? 'bg-emerald-500 text-black shadow-win'
              : 'bg-fc-card text-slate-300 hover:bg-fc-cardHover border border-fc-border'
          }`}
        >
          <ThumbsUp className="h-3 w-3" />
          <span>Récord a favor</span>
        </button>

        <button
          onClick={() => onFilterChange('negative')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
            activeFilter === 'negative'
              ? 'bg-red-500 text-white shadow-loss'
              : 'bg-fc-card text-slate-300 hover:bg-fc-cardHover border border-fc-border'
          }`}
        >
          <ThumbsDown className="h-3 w-3" />
          <span>Récord en contra</span>
        </button>

        <button
          onClick={() => onFilterChange('frequent')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center space-x-1 ${
            activeFilter === 'frequent'
              ? 'bg-fc-cyan text-black shadow-cyan'
              : 'bg-fc-card text-slate-300 hover:bg-fc-cardHover border border-fc-border'
          }`}
        >
          <Flame className="h-3 w-3" />
          <span>Más enfrentados</span>
        </button>
      </div>

      {/* Ordenar */}
      <div className="flex items-center space-x-2">
        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-xs text-slate-400 font-semibold">Ordenar:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="bg-fc-card border border-fc-border text-slate-200 text-xs font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-fc-neon"
        >
          <option value="recent">Más recientes</option>
          <option value="matches">Más partidos jugados</option>
          <option value="wins">Más victorias</option>
          <option value="losses">Más derrotas</option>
          <option value="name">Nombre (A-Z)</option>
        </select>
      </div>

    </div>
  );
}

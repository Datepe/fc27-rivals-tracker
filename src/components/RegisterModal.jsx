import React, { useState, useEffect } from 'react';
import { X, Trophy, Skull, Minus, Check, Sparkles } from 'lucide-react';

export default function RegisterModal({ isOpen, onClose, onSave, initialPlayerName = '' }) {
  const [name, setName] = useState('');
  const [result, setResult] = useState('W'); // 'W' = Win, 'L' = Loss, 'D' = Draw
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const nameInputRef = React.useRef(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialPlayerName);
      setResult('W');
      setNote('');
      setError('');
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialPlayerName]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor escribe el nombre o Gamertag del jugador');
      return;
    }

    onSave({
      name: name.trim(),
      result,
      note: note.trim(),
      date: new Date().toLocaleDateString('es-ES')
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-fc-surface border border-fc-border rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-fc-border bg-fc-card">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-fc-neon" />
            <h2 className="text-lg font-bold text-white">Registrar Partido de FC 27</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-fc-border transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-500/15 border border-red-500/40 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Nombre / Gamertag del Jugador */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Nombre o Gamertag del Rival *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="Ej. RealMadrid_Crack, Juanito99..."
              className="w-full px-4 py-3 bg-fc-card border border-fc-border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-fc-neon focus:ring-2 focus:ring-fc-neon/20 transition text-base"
            />
          </div>

          {/* Resultado del Partido (GANÉ o PERDÍ) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              ¿Cuál fue el resultado contra este jugador? *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setResult('W')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  result === 'W'
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-win scale-[1.02]'
                    : 'border-fc-border bg-fc-card text-slate-400 hover:border-emerald-500/50 hover:text-slate-200'
                }`}
              >
                <Trophy className="h-7 w-7 mb-1 text-emerald-400" />
                <span className="font-extrabold text-base">¡GANÉ!</span>
                <span className="text-[11px] opacity-80">Victoria</span>
              </button>

              <button
                type="button"
                onClick={() => setResult('L')}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                  result === 'L'
                    ? 'border-red-500 bg-red-500/20 text-red-300 shadow-loss scale-[1.02]'
                    : 'border-fc-border bg-fc-card text-slate-400 hover:border-red-500/50 hover:text-slate-200'
                }`}
              >
                <Skull className="h-7 w-7 mb-1 text-red-400" />
                <span className="font-extrabold text-base">PERDÍ</span>
                <span className="text-[11px] opacity-80">Derrota</span>
              </button>
            </div>

            {/* Opción opcional de Empate */}
            <div className="mt-2 text-right">
              <button
                type="button"
                onClick={() => setResult('D')}
                className={`text-xs font-semibold px-2 py-1 rounded transition ${
                  result === 'D' 
                    ? 'text-amber-400 bg-amber-400/20 border border-amber-400/40' 
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {result === 'D' ? '✓ Empate seleccionado' : '¿Fue un empate? Haz clic aquí'}
              </button>
            </div>
          </div>

          {/* Notas Opcionales */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Notas sobre su estilo (Opcional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej. Mucho contragolpe, línea de 5, peligroso por bandas..."
              className="w-full px-4 py-2.5 bg-fc-card border border-fc-border rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-fc-cyan focus:ring-2 focus:ring-fc-cyan/20 transition text-sm"
            />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-fc-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-fc-border text-slate-300 hover:bg-fc-card transition text-sm font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 bg-fc-neon hover:bg-fc-neonHover text-black font-extrabold px-5 py-2.5 rounded-xl transition shadow-neon active:scale-95 text-sm"
            >
              <Check className="h-4 w-4" />
              <span>Guardar Resultado</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

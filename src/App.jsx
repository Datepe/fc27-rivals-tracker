import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import PlayerCard from './components/PlayerCard';
import RegisterModal from './components/RegisterModal';
import DriveSetupModal from './components/DriveSetupModal';
import StatsSummary from './components/StatsSummary';
import { 
  getLocalPlayers, 
  saveLocalPlayers, 
  getDriveConfig, 
  saveDriveConfig, 
  exportDatabase, 
  parseImportFile 
} from './services/storage';
import { 
  fetchPlayersFromDrive, 
  sendMatchToDrive, 
  syncAllPlayersToDrive 
} from './services/driveApi';
import { Users, PlusCircle, AlertCircle, CheckCircle2, ShieldQuestion } from 'lucide-react';

export default function App() {
  const [players, setPlayers] = useState(() => getLocalPlayers());
  const [driveConfig, setDriveConfigState] = useState(() => getDriveConfig());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  
  // Modals & UI States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerInitialName, setRegisterInitialName] = useState('');
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'info' | 'error' }

  // Guardar en LocalStorage cada vez que cambien los jugadores
  useEffect(() => {
    saveLocalPlayers(players);
  }, [players]);

  // Al cargar, si hay Google Drive configurado, sincronizar
  useEffect(() => {
    if (driveConfig.scriptUrl) {
      handleSyncFromDrive();
    }
  }, []);

  // Mostrar mensaje Toast temporal
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sincronizar desde Google Drive
  const handleSyncFromDrive = async () => {
    if (!driveConfig.scriptUrl || isSyncing) return;
    setIsSyncing(true);
    try {
      const drivePlayers = await fetchPlayersFromDrive(driveConfig.scriptUrl);
      if (drivePlayers && drivePlayers.length > 0) {
        // Unir datos de Google Drive con locales
        setPlayers((current) => {
          const map = new Map();
          // Añadir locales primero
          current.forEach(p => map.set(p.id, p));
          // Sobrescribir o añadir desde Drive
          drivePlayers.forEach(p => map.set(p.id, p));
          const merged = Array.from(map.values());
          saveLocalPlayers(merged);
          return merged;
        });
        showToast('Sincronizado con Google Drive');
      }
    } catch (err) {
      console.warn('No se pudo sincronizar desde Google Drive:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Guardar nueva configuración de Drive
  const handleSaveDriveConfig = (newConfig) => {
    setDriveConfigState(newConfig);
    saveDriveConfig(newConfig);
  };

  // Búsqueda en tiempo real
  const matchedPlayer = useMemo(() => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    if (!cleanQuery) return null;

    // Buscar coincidencia exacta primero
    const exact = players.find(p => p.id === cleanQuery || p.name.toLowerCase() === cleanQuery);
    if (exact) return exact;

    // Si no hay exacta, buscar por coincidencia parcial si solo hay 1 candidato relevante
    const partials = players.filter(p => p.name.toLowerCase().includes(cleanQuery));
    if (partials.length === 1) {
      return partials[0];
    }

    return null;
  }, [players, searchQuery]);

  // Manejar Registro o Actualización de Partido
  const handleSaveMatch = async ({ name, result, note, date }) => {
    const cleanName = name.trim();
    const searchId = cleanName.toLowerCase();
    const resultLabel = result === 'W' ? 'Ganado' : (result === 'L' ? 'Perdido' : 'Empate');
    const matchDate = date || new Date().toLocaleDateString('es-ES');

    // Actualizar estado local inmediatamente (0 ms)
    setPlayers((prev) => {
      const index = prev.findIndex(p => p.id === searchId);
      if (index !== -1) {
        const existing = prev[index];
        const wins = existing.wins + (result === 'W' ? 1 : 0);
        const losses = existing.losses + (result === 'L' ? 1 : 0);
        const draws = existing.draws + (result === 'D' ? 1 : 0);
        const total = wins + losses + draws;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
        const history = [
          { date: matchDate, result, note: note || '' },
          ...(existing.history || [])
        ];

        const updated = [...prev];
        updated[index] = {
          ...existing,
          wins,
          losses,
          draws,
          totalMatches: total,
          winRate,
          lastResult: resultLabel,
          lastDate: matchDate,
          notes: note || existing.notes,
          history
        };
        return updated;
      } else {
        const wins = result === 'W' ? 1 : 0;
        const losses = result === 'L' ? 1 : 0;
        const draws = result === 'D' ? 1 : 0;
        const total = 1;
        const winRate = wins === 1 ? 100 : 0;
        const newPlayer = {
          id: searchId,
          name: cleanName,
          wins,
          losses,
          draws,
          totalMatches: total,
          winRate,
          lastResult: resultLabel,
          lastDate: matchDate,
          notes: note || '',
          history: [{ date: matchDate, result, note: note || '' }]
        };
        return [newPlayer, ...prev];
      }
    });

    showToast(`Resultado guardado: ${result === 'W' ? '¡Victoria!' : (result === 'L' ? 'Derrota' : 'Empate')} contra ${cleanName}`);

    // Sincronizar con Google Drive en segundo plano si está conectado
    if (driveConfig.scriptUrl) {
      try {
        await sendMatchToDrive(driveConfig.scriptUrl, {
          name: cleanName,
          result,
          note,
          date: matchDate
        });
      } catch (err) {
        console.error('Error sincronizando partido con Google Drive', err);
      }
    }
  };

  // Botón rápido de 1 clic para añadir partido
  const handleQuickAddMatch = (playerName, result) => {
    handleSaveMatch({
      name: playerName,
      result: result,
      note: '',
      date: new Date().toLocaleDateString('es-ES')
    });
  };

  // Eliminar jugador
  const handleDeletePlayer = (playerId) => {
    if (window.confirm('¿Seguro que deseas eliminar este jugador de tu historial?')) {
      const updated = players.filter(p => p.id !== playerId && p.name !== playerId);
      setPlayers(updated);
      showToast('Jugador eliminado del registro', 'info');

      // Sincronizar lista actualizada a Drive
      if (driveConfig.scriptUrl) {
        syncAllPlayersToDrive(driveConfig.scriptUrl, updated).catch(console.error);
      }
    }
  };

  // Abrir modal de registro con nombre prellenado
  const handleOpenRegisterWithPlayer = (name) => {
    setRegisterInitialName(name);
    setIsRegisterOpen(true);
  };

  // Importar archivo JSON
  const handleImport = async (file) => {
    try {
      const imported = await parseImportFile(file);
      setPlayers(imported);
      showToast(`Se importaron ${imported.length} rivales correctamente`);
      if (driveConfig.scriptUrl) {
        syncAllPlayersToDrive(driveConfig.scriptUrl, imported).catch(console.error);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Exportar base de datos
  const handleExport = () => {
    exportDatabase(players);
    showToast('Copia de seguridad descargada');
  };

  // Filtrado y ordenamiento de jugadores
  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...players];

    // Si hay una búsqueda activa y NO coincide exactamente, filtrar lista por la búsqueda
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }

    // Filtros
    if (activeFilter === 'positive') {
      result = result.filter(p => p.wins > p.losses);
    } else if (activeFilter === 'negative') {
      result = result.filter(p => p.losses > p.wins);
    } else if (activeFilter === 'frequent') {
      result = result.filter(p => p.totalMatches >= 2);
    }

    // Ordenamiento
    result.sort((a, b) => {
      if (sortBy === 'matches') return b.totalMatches - a.totalMatches;
      if (sortBy === 'wins') return b.wins - a.wins;
      if (sortBy === 'losses') return b.losses - a.losses;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      // 'recent' por defecto
      return 0;
    });

    return result;
  }, [players, searchQuery, activeFilter, sortBy]);

  // Estadísticas globales
  const globalStats = useMemo(() => {
    const totalMatches = players.reduce((sum, p) => sum + (p.totalMatches || 0), 0);
    const wins = players.reduce((sum, p) => sum + (p.wins || 0), 0);
    const losses = players.reduce((sum, p) => sum + (p.losses || 0), 0);
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    return { totalMatches, wins, losses, winRate, totalRivals: players.length };
  }, [players]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Toast Notificación */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-semibold border ${
            toast.type === 'error'
              ? 'bg-red-950/90 border-red-500 text-red-200'
              : 'bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-neon'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-400" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Principal */}
      <Header
        stats={globalStats}
        driveConfig={driveConfig}
        isSyncing={isSyncing}
        onOpenRegister={() => handleOpenRegisterWithPlayer('')}
        onOpenDriveModal={() => setIsDriveOpen(true)}
        onSyncNow={handleSyncFromDrive}
        onExport={handleExport}
        onImport={handleImport}
      />

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        
        {/* Barra de Búsqueda de Rivales */}
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          matchedPlayer={matchedPlayer}
          onQuickAddMatch={handleQuickAddMatch}
          onOpenRegisterWithPlayer={handleOpenRegisterWithPlayer}
        />

        {/* Resumen de Filtros y Ordenamiento */}
        <div className="mt-8">
          <StatsSummary
            totalPlayers={players.length}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            onOpenRegister={() => handleOpenRegisterWithPlayer('')}
          />

          {/* Lista / Cuadrícula de Rivales */}
          {filteredAndSortedPlayers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndSortedPlayers.map((player) => (
                <PlayerCard
                  key={player.id || player.name}
                  player={player}
                  onQuickAddMatch={handleQuickAddMatch}
                  onDeletePlayer={handleDeletePlayer}
                />
              ))}
            </div>
          ) : (
            /* Estado Vacío */
            <div className="text-center py-16 px-4 bg-fc-surface/40 rounded-3xl border border-fc-border mt-4">
              <div className="h-16 w-16 mx-auto mb-4 rounded-2xl bg-fc-card border border-fc-border flex items-center justify-center text-slate-400">
                <Users className="h-8 w-8 text-fc-neon" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">
                {players.length === 0 ? 'No hay rivales registrados aún' : 'No se encontraron rivales con ese filtro'}
              </h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
                {players.length === 0 
                  ? 'Usa el buscador arriba para consultar a cualquier jugador en tu pantalla de emparejamiento de FC 27, o regístralo manualmente.'
                  : 'Prueba cambiando los filtros o borrando el término de búsqueda.'}
              </p>
              <button
                onClick={() => handleOpenRegisterWithPlayer(searchQuery)}
                className="inline-flex items-center space-x-2 bg-fc-neon hover:bg-fc-neonHover text-black font-extrabold px-5 py-2.5 rounded-xl transition shadow-neon active:scale-95 text-sm"
              >
                <PlusCircle className="h-5 w-5" />
                <span>Registrar Primer Rival</span>
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-fc-border py-6 bg-fc-surface/50 text-center text-xs text-slate-500">
        <p>FC 27 Rivals Tracker • Diseñado para partidos de EA Sports FC • Almacenamiento seguro en tu Google Drive</p>
      </footer>

      {/* Modales */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSave={handleSaveMatch}
        initialPlayerName={registerInitialName}
      />

      <DriveSetupModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        config={driveConfig}
        onSaveConfig={handleSaveDriveConfig}
        players={players}
        onSyncComplete={() => showToast('¡Sincronización inicial completada con Google Drive!')}
      />

    </div>
  );
}

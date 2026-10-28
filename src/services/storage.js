const STORAGE_KEY_PLAYERS = 'fc27_rivals_players';
const STORAGE_KEY_CONFIG = 'fc27_rivals_config';

/**
 * Obtiene los jugadores guardados localmente
 */
export function getLocalPlayers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PLAYERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error al leer de localStorage', e);
    return [];
  }
}

/**
 * Guarda la lista de jugadores localmente
 */
export function saveLocalPlayers(players) {
  try {
    localStorage.setItem(STORAGE_KEY_PLAYERS, JSON.stringify(players));
    return true;
  } catch (e) {
    console.error('Error al guardar en localStorage', e);
    return false;
  }
}

/**
 * Configuración de sincronización con Google Drive
 */
export function getDriveConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      return { scriptUrl: '', lastSync: null, autoSync: true };
    }
    return JSON.parse(raw);
  } catch (e) {
    return { scriptUrl: '', lastSync: null, autoSync: true };
  }
}

export function saveDriveConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Error al guardar config de Drive', e);
    return false;
  }
}

/**
 * Exportar base de datos a un archivo JSON descargable
 */
export function exportDatabase(players) {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(players, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `fc27_rivales_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Importar base de datos desde un archivo JSON
 */
export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          resolve(parsed);
        } else if (parsed && Array.isArray(parsed.players)) {
          resolve(parsed.players);
        } else {
          reject(new Error('El formato del archivo no contiene una lista válida de jugadores'));
        }
      } catch (err) {
        reject(new Error('Error al analizar el archivo JSON'));
      }
    };
    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
}

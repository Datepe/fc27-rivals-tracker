/**
 * Servicio para comunicar la app web de React con el Google Apps Script
 * alojado en la cuenta de Google Drive del usuario.
 */

export async function pingDriveService(scriptUrl) {
  if (!scriptUrl || !scriptUrl.trim()) {
    throw new Error('Debes ingresar la URL de tu Google Apps Script');
  }

  const url = new URL(scriptUrl.trim());
  url.searchParams.set('action', 'ping');

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Error en el servidor de Google Drive (Código: ${response.status})`);
  }

  const data = await response.json();
  return data;
}

/**
 * Obtener todos los rivales guardados en la hoja de Google Drive
 */
export async function fetchPlayersFromDrive(scriptUrl) {
  if (!scriptUrl || !scriptUrl.trim()) return [];

  const url = new URL(scriptUrl.trim());
  url.searchParams.set('action', 'get_all');
  url.searchParams.set('_t', Date.now().toString()); // evitar caché

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('No se pudo conectar con tu Google Drive');
  }

  const result = await response.json();
  if (result.status === 'success' && Array.isArray(result.data)) {
    return result.data;
  }
  return [];
}

/**
 * Registrar un nuevo partido en Google Drive
 * match: { name: string, result: 'W'|'L'|'D', note?: string, date?: string }
 */
export async function sendMatchToDrive(scriptUrl, match) {
  if (!scriptUrl || !scriptUrl.trim()) return null;

  const payload = {
    action: 'save_match',
    match: {
      name: match.name,
      result: match.result,
      note: match.note || '',
      date: match.date || new Date().toISOString()
    }
  };

  // Usamos text/plain para evitar el preflight OPTIONS en Google Apps Script
  const response = await fetch(scriptUrl.trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Error al guardar el partido en Google Drive');
  }

  const result = await response.json();
  return result;
}

/**
 * Sincronizar todos los datos locales hacia Google Drive
 */
export async function syncAllPlayersToDrive(scriptUrl, players) {
  if (!scriptUrl || !scriptUrl.trim()) return null;

  const payload = {
    action: 'sync_all',
    players: players
  };

  const response = await fetch(scriptUrl.trim(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain;charset=utf-8'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Error al sincronizar datos con Google Drive');
  }

  return await response.json();
}

/**
 * Servicio para comunicar la app web de React con el Google Apps Script
 * alojado en la cuenta de Google Drive del usuario.
 */

function formatScriptUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = rawUrl.trim();
  // Si le falta /exec al final y termina en / o en el id
  if (url.includes('/macros/s/') && !url.endsWith('/exec')) {
    // Si termina con /, quitarla
    if (url.endsWith('/')) url = url.slice(0, -1);
    // Si no termina en /exec, añadirlo si parece ser el endpoint
    if (!url.endsWith('/exec')) {
      url = `${url}/exec`;
    }
  }
  return url;
}

/**
 * Prueba la conexión con el Google Apps Script
 */
export async function pingDriveService(scriptUrl) {
  const cleanUrl = formatScriptUrl(scriptUrl);
  if (!cleanUrl) {
    throw new Error('Debes ingresar la URL de tu Google Apps Script');
  }

  const urlObj = new URL(cleanUrl);
  urlObj.searchParams.set('action', 'ping');
  urlObj.searchParams.set('_t', Date.now().toString());

  let response;
  try {
    response = await fetch(urlObj.toString(), {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow'
    });
  } catch (netErr) {
    throw new Error(
      'No se pudo establecer conexión con Google. Esto ocurre casi siempre porque Google requiere que autorices los permisos de la aplicación en tu cuenta. Haz clic en el botón "Abrir enlace para autorizar permisos" para completarlo.'
    );
  }

  if (!response.ok) {
    throw new Error(`Google Drive respondió con error HTTP ${response.status}`);
  }

  const rawText = await response.text();
  try {
    const data = JSON.parse(rawText);
    return data;
  } catch (parseErr) {
    // Si devuelve HTML es porque Google está mostrando la pantalla de login o advertencia de permisos
    if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
      throw new Error(
        'Google requiere autorización de tu cuenta. Abre la URL en una nueva pestaña del navegador, inicia sesión con tu cuenta y presiona "Permitir" o "Avanzado > Continuar".'
      );
    }
    throw new Error('Respuesta no válida del servidor de Google Drive');
  }
}

/**
 * Obtener todos los rivales guardados en la hoja de Google Drive
 */
export async function fetchPlayersFromDrive(scriptUrl) {
  const cleanUrl = formatScriptUrl(scriptUrl);
  if (!cleanUrl) return [];

  const urlObj = new URL(cleanUrl);
  urlObj.searchParams.set('action', 'get_all');
  urlObj.searchParams.set('_t', Date.now().toString());

  try {
    const response = await fetch(urlObj.toString(), {
      method: 'GET',
      mode: 'cors',
      redirect: 'follow'
    });

    if (!response.ok) return [];

    const result = await response.json();
    if (result.status === 'success' && Array.isArray(result.data)) {
      return result.data;
    }
    return [];
  } catch (err) {
    console.warn('Error al obtener datos de Google Drive:', err);
    return [];
  }
}

/**
 * Registrar un nuevo partido en Google Drive
 */
export async function sendMatchToDrive(scriptUrl, match) {
  const cleanUrl = formatScriptUrl(scriptUrl);
  if (!cleanUrl) return null;

  const payload = {
    action: 'save_match',
    match: {
      name: match.name,
      result: match.result,
      note: match.note || '',
      date: match.date || new Date().toISOString()
    }
  };

  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      mode: 'cors',
      redirect: 'follow'
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('Error al guardar partido en Google Drive:', err);
    return null;
  }
}

/**
 * Sincronizar todos los datos locales hacia Google Drive
 */
export async function syncAllPlayersToDrive(scriptUrl, players) {
  const cleanUrl = formatScriptUrl(scriptUrl);
  if (!cleanUrl) return null;

  const payload = {
    action: 'sync_all',
    players: players
  };

  try {
    const response = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload),
      mode: 'cors',
      redirect: 'follow'
    });

    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('Error al sincronizar con Google Drive:', err);
    return null;
  }
}

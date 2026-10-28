/**
 * ===================================================================
 * FC 27 RIVALS TRACKER - BACKEND EN GOOGLE DRIVE (GOOGLE APPS SCRIPT)
 * ===================================================================
 * 
 * Este script corre 100% GRATIS en tu cuenta de Google Drive.
 * Al ejecutarse, creará o usará automáticamente una hoja de cálculo llamada
 * "FC27_Rivales" en tu Google Drive para guardar todos tus rivales y partidos.
 * 
 * INSTRUCCIONES DE INSTALACIÓN EN 1 MINUTO:
 * 1. Ve a Google Drive (https://drive.google.com) y crea una nueva "Hoja de cálculo de Google".
 *    (O puedes ir directamente a https://script.google.com para crear un nuevo proyecto).
 * 2. En el menú superior de la hoja, haz clic en: Extensiones > Apps Script.
 * 3. Borra todo el código que aparezca y pega TODO el contenido de este archivo.
 * 4. Arriba a la derecha, haz clic en el botón azul "Implementar" (Deploy) > "Nueva implementación" (New deployment).
 * 5. Haz clic en el ícono de engranaje (⚙️) al lado de "Seleccionar tipo" y elige: "Aplicación web" (Web app).
 * 6. Configura lo siguiente:
 *    - Descripción: FC 27 Tracker API
 *    - Ejecutar como (Execute as): "Yo" (tu cuenta de correo)
 *    - Quién tiene acceso (Who has access): "Cualquier usuario" (Anyone)
 *      *(IMPORTANTE: Seleccionar "Cualquier usuario" permite que tu app web en React pueda leer y guardar datos).*
 * 7. Haz clic en "Implementar" (Deploy). Google te pedirá autorizar permisos una sola vez.
 * 8. Copia la "URL de la aplicación web" (termina en /exec) y pégala en la app en React.
 * ¡Listo! Todos tus partidos quedarán guardados en tu Google Drive.
 */

const SHEET_NAME = 'Rivales_FC27';

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    // Configurar encabezados con estilo profesional
    const headers = [
      'Gamertag / Nombre',
      'Victorias',
      'Derrotas',
      'Empates',
      'Total Partidos',
      'Efectividad (%)',
      'Último Resultado',
      'Última Fecha',
      'Notas / Estilo',
      'Historial Detallado'
    ];
    sheet.appendRow(headers);
    
    // Dar formato a los encabezados
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#0f172a');
    headerRange.setFontColor('#00ff87');
    headerRange.setFontWeight('bold');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  return sheet;
}

// -------------------------------------------------------------
// GET: Obtener todos los jugadores y probar conexión
// -------------------------------------------------------------
function doGet(e) {
  try {
    const action = e.parameter.action || 'get_all';
    
    if (action === 'ping') {
      return responseJSON({ status: 'success', message: 'Conectado exitosamente con Google Drive' });
    }

    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    const players = [];

    // Fila 0 es encabezado, empezamos en 1
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue; // Saltear filas vacías

      let history = [];
      try {
        if (row[9]) {
          history = JSON.parse(row[9]);
        }
      } catch (err) {
        history = [];
      }

      players.push({
        id: String(row[0]).trim().toLowerCase(),
        name: String(row[0]).trim(),
        wins: Number(row[1]) || 0,
        losses: Number(row[2]) || 0,
        draws: Number(row[3]) || 0,
        totalMatches: Number(row[4]) || 0,
        winRate: Number(row[5]) || 0,
        lastResult: String(row[6] || ''),
        lastDate: row[7] ? String(row[7]) : '',
        notes: String(row[8] || ''),
        history: history
      });
    }

    return responseJSON({ status: 'success', data: players });
  } catch (error) {
    return responseJSON({ status: 'error', message: error.toString() });
  }
}

// -------------------------------------------------------------
// POST: Registrar partido, sincronizar o actualizar
// -------------------------------------------------------------
function doPost(e) {
  try {
    let body;
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else {
      body = e.parameter;
    }

    const action = body.action || 'save_match';
    const sheet = getOrCreateSheet();

    if (action === 'save_match') {
      const match = body.match; // { name, result: 'W'|'L'|'D', note, date }
      if (!match || !match.name) {
        return responseJSON({ status: 'error', message: 'Falta el nombre del jugador' });
      }

      const cleanName = match.name.trim();
      const searchKey = cleanName.toLowerCase();
      const rows = sheet.getDataRange().getValues();
      let rowIndex = -1;

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim().toLowerCase() === searchKey) {
          rowIndex = i + 1; // 1-based index in Sheet
          break;
        }
      }

      const matchDate = match.date || new Date().toISOString();
      const matchNote = match.note || '';
      const matchResult = match.result; // 'W' = Win, 'L' = Loss, 'D' = Draw

      if (rowIndex !== -1) {
        // Actualizar jugador existente
        const currentRow = rows[rowIndex - 1];
        let wins = Number(currentRow[1]) || 0;
        let losses = Number(currentRow[2]) || 0;
        let draws = Number(currentRow[3]) || 0;

        if (matchResult === 'W') wins++;
        else if (matchResult === 'L') losses++;
        else if (matchResult === 'D') draws++;

        const total = wins + losses + draws;
        const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
        const lastResultLabel = matchResult === 'W' ? 'Ganado' : (matchResult === 'L' ? 'Perdido' : 'Empate');

        let history = [];
        try {
          if (currentRow[9]) history = JSON.parse(currentRow[9]);
        } catch (e) {
          history = [];
        }
        history.unshift({
          date: matchDate,
          result: matchResult,
          note: matchNote
        });

        // Actualizar fila
        sheet.getRange(rowIndex, 2).setValue(wins);
        sheet.getRange(rowIndex, 3).setValue(losses);
        sheet.getRange(rowIndex, 4).setValue(draws);
        sheet.getRange(rowIndex, 5).setValue(total);
        sheet.getRange(rowIndex, 6).setValue(winRate);
        sheet.getRange(rowIndex, 7).setValue(lastResultLabel);
        sheet.getRange(rowIndex, 8).setValue(new Date().toLocaleDateString('es-ES'));
        if (matchNote) sheet.getRange(rowIndex, 9).setValue(matchNote);
        sheet.getRange(rowIndex, 10).setValue(JSON.stringify(history));

        return responseJSON({
          status: 'success',
          message: 'Partido actualizado para ' + cleanName,
          player: {
            id: searchKey,
            name: cleanName,
            wins, losses, draws, totalMatches: total, winRate,
            lastResult: lastResultLabel,
            notes: matchNote || currentRow[8],
            history
          }
        });
      } else {
        // Nuevo rival: crear nueva fila
        const wins = matchResult === 'W' ? 1 : 0;
        const losses = matchResult === 'L' ? 1 : 0;
        const draws = matchResult === 'D' ? 1 : 0;
        const total = 1;
        const winRate = wins === 1 ? 100 : 0;
        const lastResultLabel = matchResult === 'W' ? 'Ganado' : (matchResult === 'L' ? 'Perdido' : 'Empate');
        const history = [{
          date: matchDate,
          result: matchResult,
          note: matchNote
        }];

        const newRow = [
          cleanName,
          wins,
          losses,
          draws,
          total,
          winRate,
          lastResultLabel,
          new Date().toLocaleDateString('es-ES'),
          matchNote,
          JSON.stringify(history)
        ];
        sheet.appendRow(newRow);

        return responseJSON({
          status: 'success',
          message: 'Rival ' + cleanName + ' registrado con éxito',
          player: {
            id: searchKey,
            name: cleanName,
            wins, losses, draws, totalMatches: total, winRate,
            lastResult: lastResultLabel,
            notes: matchNote,
            history
          }
        });
      }
    } else if (action === 'sync_all') {
      // Sincronización completa masiva
      const players = body.players || [];
      // Limpiar datos anteriores (excepto encabezado)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }

      players.forEach(p => {
        sheet.appendRow([
          p.name,
          p.wins || 0,
          p.losses || 0,
          p.draws || 0,
          p.totalMatches || 0,
          p.winRate || 0,
          p.lastResult || '',
          p.lastDate || new Date().toLocaleDateString('es-ES'),
          p.notes || '',
          JSON.stringify(p.history || [])
        ]);
      });

      return responseJSON({ status: 'success', message: 'Sincronización masiva completada' });
    }

    return responseJSON({ status: 'error', message: 'Acción no reconocida' });
  } catch (error) {
    return responseJSON({ status: 'error', message: error.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * ===================================================================
 * FC 27 RIVALS TRACKER - BACKEND EN GOOGLE DRIVE (GOOGLE APPS SCRIPT)
 * ===================================================================
 * 
 * Este script corre 100% GRATIS en tu cuenta de Google Drive.
 * Al ejecutarse, creará o usará automáticamente una hoja de cálculo llamada
 * "Rivales_FC27" en tu Google Drive para guardar todos tus rivales y partidos.
 */

const SHEET_NAME = 'Rivales_FC27';

function getOrCreateSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = null;
  }

  // Si no está vinculado a una hoja abierta, buscar o crear en Drive
  if (!ss) {
    const files = DriveApp.getFilesByName('FC27_Rivales_Data');
    if (files.hasNext()) {
      ss = SpreadsheetApp.open(files.next());
    } else {
      ss = SpreadsheetApp.create('FC27_Rivales_Data');
    }
  }

  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    // Si la hoja por defecto está vacía, renombrarla, o crear una nueva
    const defaultSheet = ss.getActiveSheet();
    if (defaultSheet && defaultSheet.getLastRow() === 0) {
      sheet = defaultSheet;
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }

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
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all';
    
    if (action === 'ping') {
      return responseJSON({ 
        status: 'success', 
        message: 'Conectado exitosamente con Google Drive' 
      });
    }

    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    const players = [];

    // Fila 0 es encabezado, empezamos en 1
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;

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
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      body = e.parameter;
    } else {
      body = {};
    }

    const action = body.action || 'save_match';
    const sheet = getOrCreateSheet();

    if (action === 'save_match') {
      const match = body.match;
      if (!match || !match.name) {
        return responseJSON({ status: 'error', message: 'Falta el nombre del jugador' });
      }

      const cleanName = match.name.trim();
      const searchKey = cleanName.toLowerCase();
      const rows = sheet.getDataRange().getValues();
      let rowIndex = -1;

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0]).trim().toLowerCase() === searchKey) {
          rowIndex = i + 1;
          break;
        }
      }

      const matchDate = match.date || new Date().toISOString();
      const matchNote = match.note || '';
      const matchResult = match.result;

      if (rowIndex !== -1) {
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
          message: 'Partido actualizado para ' + cleanName
        });
      } else {
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
          message: 'Rival ' + cleanName + ' registrado con éxito'
        });
      }
    } else if (action === 'sync_all') {
      const players = body.players || [];
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

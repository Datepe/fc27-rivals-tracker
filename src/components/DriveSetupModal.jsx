import React, { useState } from 'react';
import { 
  X, 
  Cloud, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Unplug,
  KeyRound
} from 'lucide-react';
import { pingDriveService, syncAllPlayersToDrive } from '../services/driveApi';

export default function DriveSetupModal({ 
  isOpen, 
  onClose, 
  config, 
  onSaveConfig, 
  players, 
  onSyncComplete 
}) {
  const [url, setUrl] = useState(config?.scriptUrl || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // { success: boolean, message: string }
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Código Apps Script
  const appsScriptCode = `const SHEET_NAME = 'Rivales_FC27';

function getOrCreateSheet() {
  let ss = null;
  try {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  } catch (e) {
    ss = null;
  }
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
    const defaultSheet = ss.getActiveSheet();
    if (defaultSheet && defaultSheet.getLastRow() === 0) {
      sheet = defaultSheet;
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    const headers = ['Gamertag / Nombre', 'Victorias', 'Derrotas', 'Empates', 'Total Partidos', 'Efectividad (%)', 'Último Resultado', 'Última Fecha', 'Notas / Estilo', 'Historial Detallado'];
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

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all';
    if (action === 'ping') {
      return responseJSON({ status: 'success', message: 'Conectado exitosamente con Google Drive' });
    }
    const sheet = getOrCreateSheet();
    const rows = sheet.getDataRange().getValues();
    const players = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      let history = [];
      try { if (row[9]) history = JSON.parse(row[9]); } catch (err) { history = []; }
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
      if (!match || !match.name) return responseJSON({ status: 'error', message: 'Falta el nombre' });
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
        try { if (currentRow[9]) history = JSON.parse(currentRow[9]); } catch (e) { history = []; }
        history.unshift({ date: matchDate, result: matchResult, note: matchNote });
        sheet.getRange(rowIndex, 2).setValue(wins);
        sheet.getRange(rowIndex, 3).setValue(losses);
        sheet.getRange(rowIndex, 4).setValue(draws);
        sheet.getRange(rowIndex, 5).setValue(total);
        sheet.getRange(rowIndex, 6).setValue(winRate);
        sheet.getRange(rowIndex, 7).setValue(lastResultLabel);
        sheet.getRange(rowIndex, 8).setValue(new Date().toLocaleDateString('es-ES'));
        if (matchNote) sheet.getRange(rowIndex, 9).setValue(matchNote);
        sheet.getRange(rowIndex, 10).setValue(JSON.stringify(history));
        return responseJSON({ status: 'success', message: 'Partido actualizado para ' + cleanName });
      } else {
        const wins = matchResult === 'W' ? 1 : 0;
        const losses = matchResult === 'L' ? 1 : 0;
        const draws = matchResult === 'D' ? 1 : 0;
        const total = 1;
        const winRate = wins === 1 ? 100 : 0;
        const lastResultLabel = matchResult === 'W' ? 'Ganado' : (matchResult === 'L' ? 'Perdido' : 'Empate');
        const history = [{ date: matchDate, result: matchResult, note: matchNote }];
        sheet.appendRow([cleanName, wins, losses, draws, total, winRate, lastResultLabel, new Date().toLocaleDateString('es-ES'), matchNote, JSON.stringify(history)]);
        return responseJSON({ status: 'success', message: 'Rival ' + cleanName + ' registrado con éxito' });
      }
    } else if (action === 'sync_all') {
      const allPlayers = body.players || [];
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) sheet.deleteRows(2, lastRow - 1);
      allPlayers.forEach(p => {
        sheet.appendRow([p.name, p.wins || 0, p.losses || 0, p.draws || 0, p.totalMatches || 0, p.winRate || 0, p.lastResult || '', p.lastDate || new Date().toLocaleDateString('es-ES'), p.notes || '', JSON.stringify(p.history || [])]);
      });
      return responseJSON({ status: 'success', message: 'Sincronización masiva completada' });
    }
    return responseJSON({ status: 'error', message: 'Acción no reconocida' });
  } catch (error) {
    return responseJSON({ status: 'error', message: error.toString() });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Asegurar formato de la URL
  const getFormattedUrl = () => {
    let clean = url.trim();
    if (clean.includes('/macros/s/') && !clean.endsWith('/exec')) {
      if (clean.endsWith('/')) clean = clean.slice(0, -1);
      if (!clean.endsWith('/exec')) clean = `${clean}/exec`;
    }
    return clean;
  };

  const handleTestAndConnect = async () => {
    const finalUrl = getFormattedUrl();
    if (!finalUrl) {
      setTestResult({ success: false, message: 'Por favor escribe la URL de tu Web App' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);

    try {
      await pingDriveService(finalUrl);
      setTestResult({
        success: true,
        message: '¡Conexión exitosa! Tu app ahora sincroniza con Google Drive.'
      });
      onSaveConfig({
        scriptUrl: finalUrl,
        lastSync: new Date().toISOString(),
        autoSync: true
      });

      if (players && players.length > 0) {
        await syncAllPlayersToDrive(finalUrl, players);
        if (onSyncComplete) onSyncComplete();
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: err.message || 'Error de conexión'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    onSaveConfig({
      scriptUrl: '',
      lastSync: null,
      autoSync: false
    });
    setUrl('');
    setTestResult(null);
  };

  const formattedUrl = getFormattedUrl();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="w-full max-w-2xl bg-fc-surface border border-fc-border rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-fc-border bg-fc-card">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Cloud className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Conectar con tu Google Drive</h2>
              <p className="text-xs text-slate-400">Persistencia 100% gratuita y privada en tu cuenta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-fc-border transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Explicación rápida */}
          <div className="p-4 bg-fc-card rounded-xl border border-fc-border text-sm text-slate-300">
            <p>
              Tus rivales se guardarán automáticamente en una hoja de cálculo llamada <strong className="text-fc-neon">Rivales_FC27</strong> directamente en tu Google Drive. Podrás consultarla, editarla o descargarla a Excel en cualquier momento.
            </p>
          </div>

          {/* Pasos de configuración */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Pasos para conectar:
            </h3>

            {/* Paso 1 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-fc-bg border border-fc-border">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-fc-neon text-black font-black text-xs">
                1
              </span>
              <div className="text-xs text-slate-300 w-full">
                <p className="font-semibold text-white">Copia el código actualizado en Apps Script</p>
                <p className="text-slate-400 mt-0.5 mb-2">
                  Si creaste una hoja de cálculo, ve a <strong>Extensiones &gt; Apps Script</strong> y pega este código:
                </p>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-fc-card hover:bg-fc-border border border-fc-neon/50 text-fc-neon text-xs font-bold transition shadow-sm"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? '¡Código copiado al portapapeles!' : 'Copiar código para Apps Script'}</span>
                </button>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-fc-bg border border-fc-border">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-fc-neon text-black font-black text-xs">
                2
              </span>
              <div className="text-xs text-slate-300">
                <p className="font-semibold text-white">Implementación de la Aplicación web</p>
                <p className="text-slate-400 mt-0.5">
                  Haz clic en <strong className="text-slate-200">Implementar &gt; Administrar las implementaciones</strong>.
                  Asegúrate de copiar la URL con el botón azul <strong>&quot;Copiar&quot;</strong> que está debajo de la URL (para que no se corte y termine en <code>/exec</code>).
                </p>
              </div>
            </div>

            {/* Paso 3: Autorizar Permisos en el Navegador */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-black font-black text-xs">
                3
              </span>
              <div className="text-xs text-slate-200 w-full">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="h-4 w-4 text-emerald-400" />
                  <span>IMPORTANTE: Autorizar permisos de Google (Solo la 1ª vez)</span>
                </p>
                <p className="text-slate-300 mt-1">
                  Google exige que abras el enlace en una pestaña para conceder permisos a tu cuenta. Haz clic en el botón a continuación para abrirlo:
                </p>
                {formattedUrl ? (
                  <div className="mt-2.5">
                    <a
                      href={formattedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-extrabold text-xs shadow-win hover:bg-emerald-400 transition"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Abrir URL en nueva pestaña para Autorizar</span>
                    </a>
                    <span className="block text-[11px] text-slate-400 mt-1">
                      (Si Google te muestra una advertencia de seguridad, haz clic en <em>&quot;Avanzado&quot;</em> y luego en <em>&quot;Ir a ... (no seguro)&quot;</em> y <em>&quot;Permitir&quot;</em>).
                    </span>
                  </div>
                ) : (
                  <p className="text-slate-400 italic mt-1">
                    (Pega la URL abajo en el Paso 4 para activar este botón de autorización)
                  </p>
                )}
              </div>
            </div>

            {/* Paso 4 */}
            <div className="flex items-start space-x-3 p-3 rounded-xl bg-fc-bg border border-fc-border">
              <span className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-fc-neon text-black font-black text-xs">
                4
              </span>
              <div className="text-xs text-slate-300 w-full">
                <p className="font-semibold text-white">Pega la URL y pulsa Conectar</p>
                <p className="text-slate-400 mt-0.5">
                  Una vez autorizada, vuelve aquí y haz clic en <strong>Guardar y Conectar</strong>.
                </p>
              </div>
            </div>

          </div>

          {/* Campo de URL y Botón de Conexión */}
          <div className="p-4 bg-fc-card rounded-xl border border-fc-border space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              URL de la Aplicación Web de Google Apps Script:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="flex-1 px-4 py-2.5 bg-fc-bg border border-fc-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-fc-neon text-xs font-mono"
              />
              <button
                onClick={handleTestAndConnect}
                disabled={isTesting || !url.trim()}
                className="flex items-center justify-center space-x-1.5 px-4 py-2.5 bg-fc-neon hover:bg-fc-neonHover text-black font-bold rounded-xl transition text-xs disabled:opacity-50 shadow-neon whitespace-nowrap"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Guardar y Conectar</span>
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                testResult.success
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/15 border-red-500/40 text-red-300'
              }`}>
                {testResult.success ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{testResult.message}</p>
                </div>
              </div>
            )}

            {config?.scriptUrl && (
              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  Estado actual: <strong className="text-emerald-400">Conectado</strong>
                </span>
                <button
                  onClick={handleDisconnect}
                  className="text-red-400 hover:text-red-300 flex items-center space-x-1"
                >
                  <Unplug className="h-3.5 w-3.5" />
                  <span>Desconectar Google Drive</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-fc-border bg-fc-card flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-fc-border hover:bg-slate-700 text-white text-xs font-bold transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}

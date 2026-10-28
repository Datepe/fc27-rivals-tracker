# ⚽ FC 27 Rivals Tracker - Registro de Rivales

Aplicación web rápida desarrollada en **React + Vite + Tailwind CSS** con estética de EA FC 27 para llevar el control de los rivales a los que te enfrentas en Ultimate Team, Temporadas o Clubes.

Permite consultar a cualquier rival en **menos de 1 segundo durante las pantallas de carga** para saber si ya jugaste contra él, si le ganaste o perdiste, o si es un rival nuevo. Los datos se sincronizan y persisten **100% gratis en tu cuenta personal de Google Drive**.

---

## 🚀 Características Principales

1. **Buscador en Tiempo Real Instantáneo**:
   - Escribe el gamertag o ID del rival mientras carga el partido.
   - **Si ya jugaste contra él**: Verás inmediatamente si le ganaste o perdiste, el récord acumulado (W - L) y las notas sobre su estilo de juego.
   - **Si NO has jugado contra él**: Te avisa que es un rival nuevo y te da botones de 1 solo clic para registrar si ganaste o perdiste al terminar el partido.
2. **Persistencia Gratuita en Google Drive**:
   - Tus rivales se guardan en una hoja de cálculo llamada `Rivales_FC27` en tu Google Drive a través de un Google Apps Script Web App.
   - Sin servidores de pago, sin suscripciones y sin límites.
3. **Modo Offline-First (LocalStorage)**:
   - Funciona incluso sin internet o si la API de Google tarda en responder. La app siempre responde en milisegundos gracias al almacenamiento local.
4. **Respaldo y Portabilidad**:
   - Botones para descargar tu historial en formato `.json` y restaurarlo en cualquier momento.

---

## 🛠️ Instalación y Ejecución Local

Desde la carpeta `fc27-rivals-tracker`:

```bash
# 1. Instalar las dependencias
npm install

# 2. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación se abrirá en tu navegador en `http://localhost:5173`.

---

## ☁️ Conexión con tu Google Drive (Paso a Paso)

Solo necesitas hacer esto una vez:

1. Ve a [Google Sheets (sheets.new)](https://sheets.new) desde tu navegador con tu cuenta de Google.
2. En el menú superior, ve a **Extensiones > Apps Script**.
3. Borra el código por defecto y pega el contenido del archivo [`google-apps-script/Code.gs`](./google-apps-script/Code.gs) (o cópialo directamente desde el botón en la app web).
4. Arriba a la derecha, haz clic en el botón azul **Implementar (Deploy) > Nueva implementación (New deployment)**.
5. Selecciona el tipo **Aplicación web (Web app)** y configura:
   - **Descripción**: `FC 27 API`
   - **Ejecutar como**: `Yo (tu correo)`
   - **Quién tiene acceso**: **`Cualquier usuario` (Anyone)** *(indispensable para permitir la conexión desde tu navegador)*.
6. Haz clic en **Implementar** y autoriza los permisos en tu cuenta de Google.
7. Copia la **URL de la aplicación web** (termina en `/exec`).
8. En la app web de FC 27 Rivals, haz clic en **"Conectar Google Drive"**, pega la URL y pulsa **Guardar y Conectar**.

¡Listo! A partir de ese momento, cada victoria o derrota quedará registrada tanto en tu app como en tu Google Drive.

---

## 📁 Estructura del Código

```
fc27-rivals-tracker/
├── google-apps-script/
│   └── Code.gs               # Backend en Google Apps Script para Google Drive
├── src/
│   ├── components/
│   │   ├── Header.jsx        # Logo, balance global W-L y accesos rápidos
│   │   ├── SearchBar.jsx     # Buscador instantáneo con detección de rivales
│   │   ├── PlayerCard.jsx    # Tarjeta de rival con récord y botones rápidos
│   │   ├── RegisterModal.jsx # Formulario rápido de resultado (Gané / Perdí)
│   │   ├── DriveSetupModal.jsx # Asistente interactivo de Google Drive
│   │   └── StatsSummary.jsx  # Filtros (récord a favor, en contra, etc.)
│   ├── services/
│   │   ├── driveApi.js       # Cliente HTTP para comunicarse con Apps Script
│   │   └── storage.js        # Almacenamiento local (LocalStorage) y exportación
│   ├── App.jsx               # Estado principal de la app
│   ├── index.css             # Estilos y tema oscuro de FC 27
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

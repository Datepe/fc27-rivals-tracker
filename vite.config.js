import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: './' asegura que los assets carguen correctamente en GitHub Pages (ej. /fc27-rivals-tracker/)
  base: './',
  server: {
    port: 5173,
    open: true
  }
});

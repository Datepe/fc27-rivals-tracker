/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fc: {
          bg: '#080d1a',
          surface: '#111827',
          card: '#162035',
          cardHover: '#1c2944',
          border: '#263554',
          neon: '#00ff87',     // EA FC signature neon green
          neonHover: '#00df76',
          cyan: '#38bdf8',     // Secondary cyan
          win: '#10b981',      // Emerald green for wins
          winBg: 'rgba(16, 185, 129, 0.15)',
          loss: '#ef4444',     // Bright red for losses
          lossBg: 'rgba(239, 68, 68, 0.15)',
          draw: '#f59e0b',     // Amber for draws
          drawBg: 'rgba(245, 158, 11, 0.15)'
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px -3px rgba(0, 255, 135, 0.35)',
        'cyan': '0 0 20px -3px rgba(56, 189, 248, 0.35)',
        'win': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'loss': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
      }
    },
  },
  plugins: [],
}

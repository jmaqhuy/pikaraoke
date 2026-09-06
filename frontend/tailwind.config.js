/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ktv: {
          bg: '#08090d',
          card: '#121520',
          surface: '#181d2e',
          hover: '#222940',
          border: '#2a3452',
          rose: '#f43f5e',
          purple: '#a855f7',
          cyan: '#06b6d4',
          amber: '#f59e0b',
          emerald: '#10b981'
        }
      },
      boxShadow: {
        'neon-rose': '0 0 20px -3px rgba(244, 63, 94, 0.45)',
        'neon-purple': '0 0 20px -3px rgba(168, 85, 247, 0.45)',
        'neon-cyan': '0 0 20px -3px rgba(6, 182, 212, 0.45)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

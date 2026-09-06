import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/kiosk/', // Clean base path for assets under /kiosk/
  server: {
    port: 5173,
    host: '0.0.0.0', // Allow accessing dev server from phones on local network
    proxy: {
      '/logo': 'http://localhost:5555',
      '/api': 'http://localhost:5555',
      '/now_playing': 'http://localhost:5555',
      '/pause': 'http://localhost:5555',
      '/skip': 'http://localhost:5555',
      '/restart': 'http://localhost:5555',
      '/volume': 'http://localhost:5555',
      '/vol_up': 'http://localhost:5555',
      '/vol_down': 'http://localhost:5555',
      '/transpose': 'http://localhost:5555',
      '/enqueue': 'http://localhost:5555',
      '/get_queue': 'http://localhost:5555',
      '/queue': 'http://localhost:5555',
      '/download': 'http://localhost:5555',
      '/stream': 'http://localhost:5555',
      '/subtitle': 'http://localhost:5555',
      '/splash': 'http://localhost:5555',
      '/static': 'http://localhost:5555',
      '/socket.io': {
        target: 'http://localhost:5555',
        ws: true
      }
    }
  }
})

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Proxy /api to the backend so the frontend never hardcodes the port.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})

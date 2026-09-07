import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      external: ['recharts', 'jspdf', 'leaflet', 'react-leaflet'],
      output: {
        globals: {
          recharts: 'Recharts',
          jspdf: 'jsPDF',
          leaflet: 'L',
          'react-leaflet': 'ReactLeaflet',
        },
      },
    },
  },
})

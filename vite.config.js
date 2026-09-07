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
    minify: false, // Prevents high RAM consumption during chunk minification
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      external: [
        'recharts',
        'jspdf',
        'leaflet',
        'react-leaflet',
      ],
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

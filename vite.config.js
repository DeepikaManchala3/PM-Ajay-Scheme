import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
    sourcemap: false,
    minify: false, // Disables memory-intensive minification phase
    cssCodeSplit: false,
    chunkSizeWarningLimit: 3000,
    maxParallelFileOps: 1, // Restricts build process to single thread to save RAM
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

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
    minify: 'esbuild',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'vendor-recharts';
            if (id.includes('leaflet') || id.includes('react-leaflet')) return 'vendor-maps';
            if (id.includes('jspdf')) return 'vendor-pdf';
            return 'vendor-core';
          }
        }
      }
    }
  }
})

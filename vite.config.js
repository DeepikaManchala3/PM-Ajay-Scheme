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
    minify: false,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 3000,
    maxParallelFileOps: 1,
    rollupOptions: {
      external: [
        'jspdf', // Keep jspdf external if loaded via CDN, otherwise remove it too
      ],
      output: {
        globals: {
          jspdf: 'jsPDF',
        },
      },
    },
  },
})
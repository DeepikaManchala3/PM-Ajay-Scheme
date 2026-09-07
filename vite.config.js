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
    chunkSizeWarningLimit: 1600,
    // Reduces memory spikes during chunk generation
    maxParallelFileOps: 1, 
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split heavy packages into isolated chunks
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('lodash') || id.includes('date-fns') || id.includes('axios')) {
              return 'vendor-utils';
            }
            return 'vendor-core';
          }
        },
      },
    },
  },
})

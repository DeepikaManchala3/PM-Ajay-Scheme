import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: false,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      maxParallelFileOps: 1,
      output: {
        manualChunks: undefined
      }
    }
  }
})

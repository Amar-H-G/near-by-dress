import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Put core React frameworks in a separate base vendor chunk
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) {
            return 'vendor-core';
          }
          // Put Leaflet maps in a separate lazy-load chunk
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'vendor-maps';
          }
          // Put icons library in separate lazy chunk
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // Default: cluster other node_modules into third-party vendor
          if (id.includes('node_modules')) {
            return 'vendor-utils';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  }
})

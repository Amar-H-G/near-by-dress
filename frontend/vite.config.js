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
    // Target modern mobile browsers — smaller, faster output
    target: ['es2020', 'chrome80', 'safari13'],
    cssMinify: true,
    rollupOptions: {
      output: {
        // Aggressive manual chunking for optimal mobile lazy loading
        manualChunks(id) {
          // ── Core React framework — always loaded ──
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/scheduler/')
          ) {
            return 'vendor-react';
          }
          // ── React Router — loaded on first navigation ──
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          // ── Leaflet maps — LAZY: only when map component mounts ──
          if (id.includes('node_modules/leaflet') || id.includes('node_modules/react-leaflet')) {
            return 'vendor-maps';
          }
          // ── Lucide icons — lazy, tree-shaken ──
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          // ── GSAP animations — lazy ──
          if (id.includes('node_modules/gsap')) {
            return 'vendor-gsap';
          }
          // ── Admin pages — lazy-loaded route chunk ──
          if (id.includes('/src/admin/')) {
            return 'chunk-admin';
          }
          // ── Seller pages — lazy-loaded route chunk ──
          if (id.includes('/src/seller/')) {
            return 'chunk-seller';
          }
          // ── All other node_modules — general vendor ──
          if (id.includes('node_modules')) {
            return 'vendor-utils';
          }
        },
        // Consistent, cache-friendly chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    },
    chunkSizeWarningLimit: 600,
    // Enable asset inlining for tiny assets (reduces requests on mobile)
    assetsInlineLimit: 4096,
  }
})

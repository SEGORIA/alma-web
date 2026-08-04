/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: 'spa',

  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'server-utils/**/*.test.ts'],
  },

  build: {
    // Split vendor chunks para mejor cache del browser
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router'))
            return 'vendor-react'
          if (id.includes('framer-motion'))
            return 'vendor-motion'
          if (id.includes('firebase'))
            return 'vendor-firebase'
          // Todo lo demás (incluido jspdf, usado solo por la ruta lazy de
          // AlumnosAdmin) se deja sin agrupar a propósito: un catch-all
          // "vendor-misc" forzaba TODO node_modules a un solo chunk siempre
          // cargado, incluidos canvg/html2canvas/dompurify — dependencias que
          // jspdf importa con import() dinámico para su función .html(), que
          // no usamos. Ese catch-all anulaba el code-splitting automático de
          // Rollup para esos imports dinámicos. Sin él, Rollup los deja en
          // chunks separados que solo se descargan si de verdad se ejecutan.
        },
      },
    },
    // Avisarnos si un chunk supera 500 kB
    chunkSizeWarningLimit: 500,
    // Minificación CSS inline
    cssMinify: true,
    // Sourcemaps solo en desarrollo
    sourcemap: false,
  },

  // Pre-bundle todas las dependencias pesadas
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'framer-motion', 'react-helmet-async',
    ],
  },
})

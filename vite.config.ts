import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  appType: 'spa',

  build: {
    // Split vendor chunks para mejor cache del browser
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react':   ['react', 'react-dom', 'react-router-dom'],
          'vendor-motion':  ['framer-motion'],
          'vendor-firebase': [
            'firebase/app', 'firebase/firestore',
            'firebase/auth', 'firebase/storage',
          ],
          'vendor-misc':    ['react-helmet-async', 'emailjs-com'],
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

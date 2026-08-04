import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'

// Activa el <link media="print"> de Google Fonts (ver index.html) — carga la
// hoja de estilos sin bloquear el primer render, sin depender de un onload
// inline en el HTML (que un CSP script-src estricto bloquearía).
document.querySelectorAll<HTMLLinkElement>('link[data-font-async]')
  .forEach(link => { link.media = 'all' })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  </StrictMode>,
)

import { useState, useEffect } from 'react'

/**
 * Detecta viewport "móvil" por debajo de `breakpoint`.
 *
 * Usa matchMedia (la evaluación nativa del navegador del media query) en
 * lugar de leer window.innerWidth dentro de un handler de resize: en Android
 * innerWidth suele venir desactualizado justo en el orientationchange, lo que
 * dejaba la navegación atascada en el modo equivocado (el menú no aparecía).
 */
export function useIsMobile(breakpoint = 768) {
  const query = `(max-width: ${breakpoint - 1}px)`

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false
    return typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : window.innerWidth < breakpoint
  })

  useEffect(() => {
    const hasMM = typeof window.matchMedia === 'function'
    const mql = hasMM ? window.matchMedia(query) : null

    // Re-evalúa siempre el media query (no innerWidth, que en Android llega
    // desactualizado en el orientationchange).
    const handler = () => setIsMobile(mql ? mql.matches : window.innerWidth < breakpoint)
    handler() // sincroniza al montar y cuando cambia el breakpoint

    // Escuchamos el evento del media query y, como respaldo, resize y
    // orientationchange: algunos navegadores (y ciertos Android/WebView) no
    // emiten el evento 'change' de matchMedia de forma fiable.
    if (mql) {
      if (mql.addEventListener) mql.addEventListener('change', handler)
      else mql.addListener(handler) // Safari < 14
    }
    window.addEventListener('resize', handler)
    window.addEventListener('orientationchange', handler)

    return () => {
      if (mql) {
        if (mql.removeEventListener) mql.removeEventListener('change', handler)
        else mql.removeListener(handler)
      }
      window.removeEventListener('resize', handler)
      window.removeEventListener('orientationchange', handler)
    }
  }, [breakpoint, query])

  return isMobile
}

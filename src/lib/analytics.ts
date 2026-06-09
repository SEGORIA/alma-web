/**
 * Helpers de tracking para Firebase Analytics / GA4.
 * Cada función es silenciosa si analytics no está inicializado
 * (ej: en desarrollo sin VITE_FIREBASE_MEASUREMENT_ID).
 */
import { logEvent } from 'firebase/analytics'
import { analytics } from './firebase'

/** Registra una vista de página (llamar en cada cambio de ruta) */
export function trackPageView(path: string, title?: string) {
  if (!analytics) return
  logEvent(analytics, 'page_view', {
    page_path:  path,
    page_title: title ?? document.title,
  })
}

/** Lead capturado (kit gratuito, formulario de contacto, etc.) */
export function trackLeadSubmit(source: 'kit_gratuito' | 'contacto' | 'brief' | string) {
  if (!analytics) return
  logEvent(analytics, 'generate_lead', { source })
}

/** Cliente abre su portal */
export function trackPortalVisit(clientToken: string) {
  if (!analytics) return
  logEvent(analytics, 'portal_visit', { client_token: clientToken })
}

/** Brief enviado */
export function trackBriefSubmit(clientId?: string) {
  if (!analytics) return
  logEvent(analytics, 'brief_submit', { client_id: clientId ?? 'anon' })
}

/** Evento genérico */
export function trackEvent(name: string, params?: Record<string, string | number | boolean>) {
  if (!analytics) return
  logEvent(analytics, name, params)
}

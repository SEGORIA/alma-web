/* ── Tema del panel admin (módulos de Negocio) ─────────────────
   Dos paletas premium intercambiables desde Config → Apariencia:
   - light: lavanda claro, cards blancas (descanso visual)
   - dark:  obsidiana original con texto crema

   La preferencia persiste en localStorage. Las páginas leen la
   paleta activa al cargar el módulo, por lo que el cambio de tema
   se aplica con un reload (lo hace el selector de Config). */

export type AdminThemeMode = 'light' | 'dark'

const KEY = 'alma-admin-theme'

export function getAdminThemeMode(): AdminThemeMode {
  try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light' } catch { return 'light' }
}

export function setAdminThemeMode(mode: AdminThemeMode) {
  try { localStorage.setItem(KEY, mode) } catch { /* modo privado */ }
}

export type AdminPalette = {
  BK: string        // fondo de página
  DIM: string       // fondo de cards
  BDR: string       // borde suave
  BDR2: string      // borde fuerte / inputs
  MUT: string       // texto secundario
  WHT: string       // texto principal
  C1: string        // accent principal
  C1_BG: string     // fondo del accent (chips/filtros activos)
  ACC2: string      // violeta de apoyo
  ROSE: string      // danger
  AMB: string       // ámbar / advertencia
  TEAL: string
  GRN: string
  BLUE: string
  INPUT_BG: string  // fondo de inputs
  GHOST: string     // iconos decorativos gigantes de stat cards
  SOFT: string      // fondo suave de botones secundarios accent
  ZEBRA: string     // franja alterna de tablas
}

export const ADM_LIGHT: AdminPalette = {
  BK:       '#F7F5FC',
  DIM:      '#FFFFFF',
  BDR:      '#EAE5F4',
  BDR2:     '#D9D1EA',
  MUT:      '#756E8C',
  WHT:      '#221636',
  C1:       '#7C3AED',
  C1_BG:    'rgba(124,58,237,0.10)',
  ACC2:     '#9333EA',
  ROSE:     '#E11D48',
  AMB:      '#D97706',
  TEAL:     '#0D9488',
  GRN:      '#16A34A',
  BLUE:     '#2563EB',
  INPUT_BG: '#FFFFFF',
  GHOST:    '#F1ECFA',
  SOFT:     '#F3EBFF',
  ZEBRA:    'rgba(107,33,168,0.025)',
}

export const ADM_DARK: AdminPalette = {
  BK:       '#08080B',
  DIM:      '#18181E',
  BDR:      '#2A2A33',
  BDR2:     '#3A3A44',
  MUT:      '#606080',
  WHT:      '#F1E8DA',
  C1:       '#8A3FFC',
  C1_BG:    'rgba(138,63,252,0.12)',
  ACC2:     '#A855F7',
  ROSE:     '#FF4D8D',
  AMB:      '#FFB865',
  TEAL:     '#2DD4BF',
  GRN:      '#4ADE80',
  BLUE:     '#60A5FA',
  INPUT_BG: '#1A1A22',
  GHOST:    '#1A1A22',
  SOFT:     '#1a0d36',
  ZEBRA:    'rgba(255,255,255,0.015)',
}

/** Paleta activa, resuelta una vez al cargar el bundle. */
export const ADM: AdminPalette = getAdminThemeMode() === 'dark' ? ADM_DARK : ADM_LIGHT

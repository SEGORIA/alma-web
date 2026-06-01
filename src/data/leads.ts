// ── Tipos ─────────────────────────────────────────────────────

export type KitArchivo = {
  _id?:         string
  nombre:       string       // "Guía de Métricas.pdf"
  descripcion?: string
  url:          string       // Cloudinary secure_url
  tipo:         string       // 'pdf' | 'docx' | 'zip' | etc.
  tamano?:      number       // bytes
  orden?:       number
}

export type Lead = {
  _id?:      string
  email:     string
  fuente:    'kit'
  estado:    'nuevo' | 'contactado' | 'cerrado'
  createdAt?: unknown
  updatedAt?: unknown
}

// ── Helpers ───────────────────────────────────────────────────

export function formatTamano(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function tipoIcono(tipo: string): string {
  const t = tipo.toLowerCase()
  if (t === 'pdf')             return '📄'
  if (t === 'docx' || t === 'doc') return '📝'
  if (t === 'xlsx' || t === 'xls') return '📊'
  if (t === 'zip' || t === 'rar')  return '🗜️'
  if (t === 'mp4' || t === 'mov')  return '🎬'
  return '📁'
}

export const LEAD_ESTADOS: { value: Lead['estado']; label: string; color: string; bg: string }[] = [
  { value: 'nuevo',      label: 'Nuevo',       color: '#6B21A8', bg: 'rgba(107,33,168,0.10)' },
  { value: 'contactado', label: 'Contactado',   color: '#D97706', bg: 'rgba(217,119,6,0.10)'  },
  { value: 'cerrado',    label: 'Cerrado',      color: '#059669', bg: 'rgba(5,150,105,0.10)'  },
]

// ── Tipos ──────────────────────────────────────────────────────

export type EntregableCategoria = 'branding' | 'redes' | 'web' | 'documentos' | 'videos' | 'otro'

export type Entregable = {
  id:          string
  categoria:   EntregableCategoria
  nombre:      string
  url:         string
  descripcion?: string
}

export type ParrillaEstado = 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'publicado'

export type ParrillaItem = {
  id:          string
  fecha:       string
  red:         string
  tipo:        string
  descripcion: string
  estado:      ParrillaEstado
  link?:       string
}

export type SolicitudEstado = 'pendiente' | 'en_revision' | 'resuelto'
export type SolicitudTipo   = 'cambio' | 'mejora' | 'consulta'

export type Solicitud = {
  id:           string
  tipo:         SolicitudTipo
  descripcion:  string
  material_ref?: string
  estado:       SolicitudEstado
  respuesta?:   string
  createdAt?:   unknown
}

export type ClienteEstado = 'activo' | 'pausado' | 'finalizado' | 'prospecto'

export type Cliente = {
  _id?:          string
  access_token?: string    // token único para el portal del cliente
  // Datos personales
  nombre:        string
  email:         string
  telefono?:     string
  empresa?:      string
  marca:         string
  // Servicios
  servicios:     string[]
  estado:        ClienteEstado
  fecha_inicio?: string
  fecha_fin?:    string
  valor_contrato?: string
  moneda?:       'COP' | 'USD'
  // Contenido
  contrato_url?:  string
  entregables:   Entregable[]
  parrilla:      ParrillaItem[]
  solicitudes:   Solicitud[]
  // Admin interno
  notas?:        string
  // Meta
  createdAt?:    unknown
  updatedAt?:    unknown
}

// ── Constantes ─────────────────────────────────────────────────

export const CLIENTE_ESTADOS: {
  value:  ClienteEstado
  label:  string
  color:  string
  bg:     string
  icon:   string
}[] = [
  { value: 'activo',     label: 'Activo',     color: '#16A34A', bg: 'rgba(22,163,74,0.10)',    icon: '🟢' },
  { value: 'prospecto',  label: 'Prospecto',  color: '#0EA5E9', bg: 'rgba(14,165,233,0.10)',   icon: '🔵' },
  { value: 'pausado',    label: 'Pausado',    color: '#D97706', bg: 'rgba(217,119,6,0.10)',    icon: '🟡' },
  { value: 'finalizado', label: 'Finalizado', color: '#6B7280', bg: 'rgba(107,114,128,0.10)', icon: '⚫' },
]

export const SERVICIOS_DISPONIBLES = [
  'Branding & Identidad',
  'Community Management',
  'Diseño Web',
  'Fotografía',
  'Video & Reels',
  'Estrategia Digital',
  'Publicidad Meta Ads',
  'Publicidad Google Ads',
  'Email Marketing',
  'Consultoría',
]

export const ENTREGABLE_CATEGORIAS: {
  key:   EntregableCategoria
  label: string
  icon:  string
  color: string
}[] = [
  { key: 'branding',    label: 'Branding',    icon: '🎨', color: '#9333EA' },
  { key: 'redes',       label: 'Redes',       icon: '📱', color: '#0EA5E9' },
  { key: 'web',         label: 'Web',         icon: '🌐', color: '#10B981' },
  { key: 'documentos',  label: 'Documentos',  icon: '📑', color: '#F59E0B' },
  { key: 'videos',      label: 'Videos',      icon: '🎬', color: '#EF4444' },
  { key: 'otro',        label: 'Otro',        icon: '📦', color: '#6B7280' },
]

export const PARRILLA_ESTADOS: {
  value: ParrillaEstado
  label: string
  color: string
  bg:    string
}[] = [
  { value: 'borrador',            label: 'Borrador',            color: '#6B7280', bg: '#F3F4F6' },
  { value: 'pendiente_aprobacion',label: 'Pendiente aprobación',color: '#D97706', bg: '#FEF3C7' },
  { value: 'aprobado',            label: 'Aprobado',            color: '#059669', bg: '#D1FAE5' },
  { value: 'publicado',           label: 'Publicado',           color: '#2563EB', bg: '#DBEAFE' },
]

export const SOLICITUD_TIPOS: { value: SolicitudTipo; label: string; color: string }[] = [
  { value: 'cambio',   label: 'Solicitud de cambio',  color: '#EF4444' },
  { value: 'mejora',   label: 'Propuesta de mejora',  color: '#F59E0B' },
  { value: 'consulta', label: 'Consulta',              color: '#3B82F6' },
]

export const SOLICITUD_ESTADOS: { value: SolicitudEstado; label: string; color: string; bg: string }[] = [
  { value: 'pendiente',    label: 'Pendiente',    color: '#EF4444', bg: 'rgba(239,68,68,0.10)'   },
  { value: 'en_revision',  label: 'En revisión',  color: '#D97706', bg: 'rgba(217,119,6,0.10)'   },
  { value: 'resuelto',     label: 'Resuelto',     color: '#16A34A', bg: 'rgba(22,163,74,0.10)'   },
]

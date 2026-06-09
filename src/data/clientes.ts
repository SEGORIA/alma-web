// ── Tipos ──────────────────────────────────────────────────────

export type EntregableCategoria = 'branding' | 'redes' | 'web' | 'documentos' | 'videos' | 'otro'

export type ComentarioContenido = {
  id:        string
  tipo:      'aprobacion' | 'ajuste'
  texto:     string
  autor:     'cliente' | 'alma'
  createdAt?: string
}

export type EntregableRevision = 'pendiente_revision' | 'en_revision' | 'aprobado' | 'con_ajustes'

export type Entregable = {
  id:               string
  categoria:        EntregableCategoria
  nombre:           string
  url:              string
  descripcion?:     string
  estado_revision?: EntregableRevision
  comentarios?:     ComentarioContenido[]
}

export const ENTREGABLE_REVISION_ESTADOS: {
  value:  EntregableRevision
  label:  string
  color:  string
  bg:     string
  icon:   string
}[] = [
  { value: 'pendiente_revision', label: 'Pendiente',   color: '#6B7280', bg: '#F3F4F6',  icon: '⏳' },
  { value: 'en_revision',        label: 'En revisión', color: '#D97706', bg: '#FEF3C7',  icon: '👀' },
  { value: 'aprobado',           label: 'Aprobado',    color: '#059669', bg: '#D1FAE5',  icon: '✅' },
  { value: 'con_ajustes',        label: 'Con ajustes', color: '#DC2626', bg: '#FEE2E2',  icon: '🔄' },
]

export type ParrillaEstado = 'borrador' | 'pendiente_aprobacion' | 'aprobado' | 'publicado'

export type ParrillaMetricas = {
  alcance?:     number
  impresiones?: number
  likes?:       number
  comentarios?: number
  guardados?:   number
  compartidos?: number
  clics?:       number
  engagement?:  number   // porcentaje ej: 4.5
}

export type ParrillaItem = {
  id:          string
  // Calendario
  dia_num?:    number        // 1, 2, 3… (dentro del plan)
  semana?:     number        // 1, 2, 3…
  fecha:       string        // YYYY-MM-DD
  // Formato
  red:         string        // Instagram, TikTok, etc.
  tipo:        string        // Reel, Carrusel, Post, Story, Video
  duracion?:   string        // "20 seg", "7 slides", "30 seg"
  // Contenido principal
  descripcion: string        // hook / título principal (backward compat)
  subtitulo?:  string        // subtítulo en gris bajo el hook
  pilar?:      string        // pilar de contenido
  cta?:        string        // CTA / keyword para el CTA badge
  // Contenido detallado (expandido en portal)
  concepto_visual?: string   // concepto visual + guión
  caption?:    string        // caption completo listo para copiar
  instrucciones?: string     // instrucciones de publicación (una por línea)
  story_del_dia?: string     // contenido de la story de ese día
  hashtags?:   string        // hashtags como string libre
  // Estado
  estado:      ParrillaEstado
  link?:       string        // link del post publicado
  // Métricas post-publicación
  metricas?:   ParrillaMetricas
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

export type MetricaMes = {
  mes:                string   // YYYY-MM
  plataforma?:        string   // "ig" | "fb" | "tk" | "tw" | "li" | "yt" — si aplica a una red específica
  alcance?:           number
  impresiones?:       number
  likes?:             number
  comentarios?:       number
  guardados?:         number
  compartidos?:       number
  seguidores?:        number   // nuevos seguidores ese mes
  engagement?:        number   // porcentaje, ej: 4.5
  posts_publicados?:  number
}

export type PlanMes = {
  nombre?:  string     // "Plan Esencial"
  periodo?: string     // "Julio 2026"
  valor?:   string     // "$1.500.000 COP"
  incluye?: string[]   // bullet points
  notas?:   string
}

export type AnalisisMarca = {
  resumen?:       string   // descripción general de la marca
  colores?:       string   // "Verde Oliva #4A4A1E · Ámbar #C9A84C · Arena #C8B888"
  tipografias?:   string   // "Display: Lora · Cuerpo: Montserrat"
  voz_si?:        string   // cómo SÍ habla la marca (separado por ·)
  voz_no?:        string   // cómo NO habla la marca
  fortalezas?:    string
  brechas?:       string
  bio_actual?:    string
  bio_propuesta?: string
}

export type ParrillaHtml = {
  id:         string
  mes:        string    // "2026-07"
  label:      string    // "Mes 1 · Julio 2026"
  contenido:  string    // HTML completo como string
  titulo?:    string    // "Estrategia Digital Mes 1"
  createdAt?: string
}

// ── Tablero Trello por meses ──────────────────────────────

export type ParrillaDriveLinks = {
  post?:      string   // URL Google Drive — POSTs
  reels?:     string   // URL Google Drive — Reels
  historias?: string   // URL Google Drive — Historias
  carrusel?:  string   // URL Google Drive — Carruseles (legacy)
}

export type ParrillaExtraItem = {
  id:     string
  label:  string
  url?:   string
  nota?:  string
}

export type ParrillaMes = {
  id:              string
  mes:             string              // "2026-07"
  label:           string              // "Julio 2026" · "Mes 1 · Julio 2026"
  // Bloque 1 — estrategia HTML (opcional)
  html_contenido?: string
  html_titulo?:    string
  // Bloque 2 — accesos Google Drive
  drive_links?:    ParrillaDriveLinks
  // Bloque 3 — extras / otros (opcional)
  extras?:         ParrillaExtraItem[]
  createdAt?:      string
}

// ── Accesos / Credenciales por plataforma ─────────────────

export type AccesoItem = {
  id:         string
  plataforma: string    // "Instagram", "Facebook", "TikTok", etc.
  usuario:    string    // usuario / email / número
  password:   string    // contraseña (cifrado a cargo del admin)
  url?:       string    // enlace directo a la cuenta
  notas?:     string    // notas adicionales
  createdAt?: string
}

export type ClienteEstado = 'activo' | 'pausado' | 'finalizado' | 'prospecto'

export type Cliente = {
  _id?:          string
  access_token?: string    // token único para el portal del cliente
  // Branding
  logo_url?:     string    // URL del logo de la marca
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
  metricas_historico?: MetricaMes[]  // métricas mensuales manuales
  // Estrategia mensual
  plan_mes?:       PlanMes
  analisis_marca?: AnalisisMarca
  parrilla_htmls?: ParrillaHtml[]
  parrilla_meses?: ParrillaMes[]    // Tablero Trello por mes
  accesos?:        AccesoItem[]     // Credenciales de plataformas
  // Servicios adicionales
  acomp_eventos?: boolean             // acompañamiento a eventos incluido
  grabaciones_mes?: number            // grabaciones programadas por mes
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

export const PILARES_CONTENIDO: { value: string; label: string; color: string; bg: string }[] = [
  { value: 'marca',       label: 'Marca',        color: '#059669', bg: '#D1FAE5' },
  { value: 'educacion',   label: 'Educación',     color: '#2563EB', bg: '#DBEAFE' },
  { value: 'lifestyle',   label: 'Lifestyle',     color: '#92400E', bg: '#FEF3C7' },
  { value: 'market_intel',label: 'Market Intel',  color: '#6B21A8', bg: '#F3E8FF' },
  { value: 'social',      label: 'Social',        color: '#BE185D', bg: '#FCE7F3' },
  { value: 'producto',    label: 'Producto',      color: '#0284C7', bg: '#E0F2FE' },
  { value: 'testimonio',  label: 'Testimonio',    color: '#D97706', bg: '#FEF3C7' },
  { value: 'otro',        label: 'Otro',          color: '#6B7280', bg: '#F3F4F6' },
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

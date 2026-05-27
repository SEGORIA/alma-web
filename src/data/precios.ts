// ── Tipos ─────────────────────────────────────────────────────

export type ServicioCategoria = {
  _id?:  string
  id:    string
  label: string
  emoji: string
  desc:  string   // descripción corta para la calculadora
  orden?: number
}

export type Plan = {
  _id?:      string
  tabId:     string    // coincide con ServicioCategoria.id
  nombre:    string
  precioNum: number    // entero en COP (sin formatear)
  periodo?:  string    // '/mes' | undefined
  destacado?: boolean
  items:     string[]
  orden?:    number
}

export type Extra = {
  _id?:      string
  label:     string
  precioNum: number
  emoji:     string
  orden?:    number
}

// ── Formateador ───────────────────────────────────────────────

export function fmtPrecio(n: number): string {
  return '$' + n.toLocaleString('es-CO')
}

// ── Categorías (estáticas — cambian poco) ─────────────────────

export const categoriasEstaticas: ServicioCategoria[] = [
  { id: 'web',        label: 'Desarrollo Web',    emoji: '💻', desc: 'Landing page, sitio corporativo o tienda virtual',      orden: 0 },
  { id: 'branding',   label: 'Branding',           emoji: '🎨', desc: 'Logo, identidad visual y manual de marca',              orden: 1 },
  { id: 'marketing',  label: 'Marketing Digital',  emoji: '📱', desc: 'Gestión de redes sociales y pauta digital',             orden: 2 },
  { id: 'fotovideo',  label: 'Foto & Video',        emoji: '📷', desc: 'Fotografía de producto, reels y video corporativo',    orden: 3 },
  { id: 'estrategia', label: 'Estrategia Digital',  emoji: '🎯', desc: 'Diagnóstico, plan de marca y acompañamiento integral', orden: 4 },
]

// ── Planes estáticos (fallback sin Firebase) ──────────────────

export const planesEstaticos: Plan[] = [
  // ── Desarrollo Web ──
  {
    tabId: 'web', nombre: 'Básico', precioNum: 1580000, orden: 0,
    items: ['Landing page profesional', 'Diseño responsive', 'SEO básico', 'Hasta 5 secciones', 'Formulario de contacto', 'Entrega en 7 días hábiles'],
  },
  {
    tabId: 'web', nombre: 'Empresarial', precioNum: 2130000, destacado: true, orden: 1,
    items: ['Sitio corporativo completo', 'Blog integrado', 'Formulario avanzado', 'Hasta 8 secciones', 'Google Analytics', 'Entrega en 12 días hábiles'],
  },
  {
    tabId: 'web', nombre: 'Tienda Virtual', precioNum: 3800000, orden: 2,
    items: ['E-commerce completo', 'Pasarela de pagos', 'Gestión de inventario', 'Productos ilimitados', 'Panel administrativo', 'Entrega en 20 días hábiles'],
  },
  // ── Branding ──
  {
    tabId: 'branding', nombre: 'Identidad Básica', precioNum: 680000, orden: 0,
    items: ['Logo profesional', 'Paleta de colores', 'Tipografías', '2 variaciones del logo', 'Archivos editables', 'Entrega en 5 días hábiles'],
  },
  {
    tabId: 'branding', nombre: 'Branding Completo', precioNum: 1200000, destacado: true, orden: 1,
    items: ['Todo de Identidad Básica', 'Manual de marca', 'Papelería digital', 'Assets para redes sociales', '5 variaciones del logo', 'Entrega en 10 días hábiles'],
  },
  {
    tabId: 'branding', nombre: 'Premium', precioNum: 2000000, orden: 2,
    items: ['Todo de Branding Completo', 'Mockups en 3D', 'Estrategia de marca', 'Guía de voz y tono', 'Asesoría de implementación', 'Soporte 30 días'],
  },
  // ── Marketing Digital ──
  {
    tabId: 'marketing', nombre: 'Gestión Social', precioNum: 800000, periodo: '/mes', orden: 0,
    items: ['3 redes sociales', '12 contenidos al mes', 'Diseño gráfico incluido', 'Calendario editorial', 'Reporte mensual', 'Soporte vía WhatsApp'],
  },
  {
    tabId: 'marketing', nombre: 'Marketing Pro', precioNum: 1500000, periodo: '/mes', destacado: true, orden: 1,
    items: ['5 redes sociales', '20 contenidos al mes', 'Pauta básica incluida', 'Reportes semanales', 'Estrategia mensual', 'Asesor dedicado'],
  },
  {
    tabId: 'marketing', nombre: 'Full Service', precioNum: 2800000, periodo: '/mes', orden: 2,
    items: ['Canales ilimitados', 'Contenido ilimitado', 'Pauta avanzada', 'Mentoría mensual', 'Estrategia integral', 'Prioridad absoluta'],
  },
  // ── Foto & Video ──
  {
    tabId: 'fotovideo', nombre: 'Fotografía', precioNum: 450000, orden: 0,
    items: ['Sesión de producto o marca', '20 fotos editadas', 'Retoque profesional', 'Entrega en alta resolución', 'Licencia comercial', 'Entrega en 3 días hábiles'],
  },
  {
    tabId: 'fotovideo', nombre: 'Foto + Reels', precioNum: 850000, destacado: true, orden: 1,
    items: ['Sesión fotográfica completa', '30 fotos editadas', '4 reels para redes sociales', 'Música licenciada', 'Guión y dirección incluidos', 'Entrega en 7 días hábiles'],
  },
  {
    tabId: 'fotovideo', nombre: 'Video Corporativo', precioNum: 1800000, orden: 2,
    items: ['Video institucional 1–2 min', 'Guión y storyboard', 'Grabación profesional', 'Edición + motion graphics', 'Versión corta para redes', 'Entrega en 10 días hábiles'],
  },
  // ── Estrategia Digital ──
  {
    tabId: 'estrategia', nombre: 'Diagnóstico', precioNum: 380000, orden: 0,
    items: ['Auditoría de marca y redes', 'Análisis de competencia', 'Mapa de oportunidades', 'Informe ejecutivo PDF', 'Sesión de resultados 1h', 'Entrega en 5 días hábiles'],
  },
  {
    tabId: 'estrategia', nombre: 'Plan Estratégico', precioNum: 950000, periodo: '/mes', destacado: true, orden: 1,
    items: ['Diagnóstico inicial incluido', 'Plan mensual de acción', 'KPIs y métricas de éxito', 'Acompañamiento quincenal', 'Ajustes y optimización', 'Reporte de resultados'],
  },
  {
    tabId: 'estrategia', nombre: 'Estrategia Integral', precioNum: 2500000, orden: 2,
    items: ['Plan completo 3 meses', 'Estrategia de marca + digital', 'Contenido + pauta + SEO', 'Reuniones semanales', 'Dashboard de métricas', 'Garantía de continuidad'],
  },
]

// ── Extras estáticos (fallback sin Firebase) ──────────────────

export const extrasEstaticos: Extra[] = [
  { label: 'Fotografía de producto',         precioNum: 350000, emoji: '📷', orden: 0 },
  { label: 'Video corporativo (1 min)',       precioNum: 450000, emoji: '🎬', orden: 1 },
  { label: 'Estrategia de lanzamiento',      precioNum: 200000, emoji: '🚀', orden: 2 },
  { label: 'Capacitación de uso',            precioNum: 150000, emoji: '🎓', orden: 3 },
  { label: 'Soporte extendido (3 meses)',    precioNum: 300000, emoji: '🛡️', orden: 4 },
  { label: 'Pauta en Meta Ads (primer mes)', precioNum: 500000, emoji: '📣', orden: 5 },
]

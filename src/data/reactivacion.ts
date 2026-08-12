// ── Reactivación del comercio — brief temporal ────────────────────────────
// Formulario público para que negocios de Manizales afectados por el sismo
// dejen sus datos y Alma pueda ofrecerles acompañamiento en marketing
// digital. Página: /reactivacion · Admin: /admin/reactivacion.
// Colección propia (no se mezcla con `leads` ni `briefs`) porque el pensado
// es que sea temporal — se puede borrar de un lado sin tocar el resto.

// ── Catálogos de selección múltiple ────────────────────────────────────

export const CANALES_VENTA = [
  'Punto físico',
  'Redes sociales',
  'WhatsApp',
  'Página web',
  'Otros',
] as const
export type CanalVenta = typeof CANALES_VENTA[number]

export const AFECTACIONES_TIPO = [
  'Daños o afectaciones en el punto físico',
  'No podemos operar presencialmente',
  'Pérdida o afectación de inventario/productos',
  'Disminución de clientes o ventas',
  'Necesitamos encontrar nuevos canales de venta',
  'Necesitamos comunicar nuestra situación a nuestros clientes',
  'Tenemos dificultades para promocionar nuestros productos/servicios',
  'Otra',
] as const
export type AfectacionTipo = typeof AFECTACIONES_TIPO[number]

export const APOYOS_ALMA = [
  'Estrategia de comunicación digital',
  'Creación de contenido para redes sociales',
  'Diseño de piezas gráficas',
  'Fotografía o video de productos',
  'Organización o activación de redes sociales',
  'Campañas de publicidad digital',
  'Estrategia para aumentar ventas por redes sociales',
  'Implementación o fortalecimiento de ventas por WhatsApp',
  'Asesoría para encontrar nuevos canales digitales de venta',
  'Fortalecimiento de marca y comunicación',
  'Asesoría estratégica para la reactivación del negocio',
  'Otro',
] as const
export type ApoyoAlma = typeof APOYOS_ALMA[number]

export const HERRAMIENTAS_DIGITALES = [
  'Instagram',
  'Facebook',
  'TikTok',
  'WhatsApp Business',
  'Página web',
  'Tienda virtual',
  'Google Business Profile',
  'Ninguna',
  'Otra',
] as const
export type HerramientaDigital = typeof HERRAMIENTAS_DIGITALES[number]

export type ActividadRedes = 'muy_activo' | 'algo_activo' | 'poco_activo' | 'no_publicando'

export const ACTIVIDAD_REDES_OPCIONES: { value: ActividadRedes; label: string }[] = [
  { value: 'muy_activo',    label: 'Muy activo' },
  { value: 'algo_activo',   label: 'Algo activo' },
  { value: 'poco_activo',   label: 'Poco activo' },
  { value: 'no_publicando', label: 'Actualmente no estamos publicando' },
]

export type Urgencia = 'urgente' | 'prioritario' | 'puede_esperar'

export const URGENCIA_OPCIONES: { value: Urgencia; label: string; icono: string; color: string; bg: string }[] = [
  { value: 'urgente',       label: 'Urgente: necesitamos activar ventas lo antes posible.',  icono: '🔴', color: '#DC2626', bg: 'rgba(220,38,38,0.10)' },
  { value: 'prioritario',   label: 'Prioritario: estamos operando con muchas dificultades.',  icono: '🟠', color: '#D97706', bg: 'rgba(217,119,6,0.10)' },
  { value: 'puede_esperar', label: 'Podemos esperar unos días mientras organizamos la situación.', icono: '🟢', color: '#059669', bg: 'rgba(5,150,105,0.10)' },
]

export function urgenciaInfo(u: Urgencia) {
  return URGENCIA_OPCIONES.find(o => o.value === u) ?? URGENCIA_OPCIONES[1]
}

// ── Estado del seguimiento (uso interno del equipo) ────────────────────

export type SolicitudEstado = 'nuevo' | 'contactado' | 'en_proceso' | 'cerrado'

export const SOLICITUD_ESTADOS: { value: SolicitudEstado; label: string; color: string; bg: string }[] = [
  { value: 'nuevo',       label: 'Nuevo',       color: '#6B21A8', bg: 'rgba(107,33,168,0.10)' },
  { value: 'contactado',  label: 'Contactado',  color: '#D97706', bg: 'rgba(217,119,6,0.10)' },
  { value: 'en_proceso',  label: 'En proceso',  color: '#2563EB', bg: 'rgba(37,99,235,0.10)' },
  { value: 'cerrado',     label: 'Cerrado',     color: '#059669', bg: 'rgba(5,150,105,0.10)' },
]

// ── Tipo principal ──────────────────────────────────────────────────────

export type SolicitudReactivacion = {
  _id?: string

  // 1. Datos de contacto
  nombre_contacto: string
  cargo:            string
  nombre_negocio:   string
  whatsapp:         string   // dígitos puros con indicativo (normalizado igual que Red de Ayuda)
  email:            string
  ubicacion:        string   // ciudad / barrio / zona

  // 2. Información del negocio
  sector:               string
  productos_servicios:  string
  tiempo_funcionando:   string
  canales_venta:        CanalVenta[]
  canales_venta_otro?:  string

  // 3. ¿Qué está pasando?
  afectaciones_relato:   string
  afectaciones_tipo:     AfectacionTipo[]
  afectaciones_otro?:    string

  // 4. ¿Cómo podemos ayudarte desde Alma?
  apoyos:       ApoyoAlma[]
  apoyo_otro?:  string

  // 5. La pregunta que más interesa
  ayuda_ideal: string

  // 6. Capacidad digital actual
  herramientas:         HerramientaDigital[]
  herramientas_otro?:   string
  actividad_redes:      ActividadRedes

  // 7. Nivel de urgencia
  urgencia: Urgencia

  // 8. Autorización
  autoriza: boolean

  // Seguimiento interno
  estado: SolicitudEstado
  createdAt?: unknown
  updatedAt?: unknown
}

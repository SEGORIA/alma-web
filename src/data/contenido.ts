// ── Tipos ─────────────────────────────────────────────────────

export type PasoItem = {
  _id?:   string
  n:      string   // '01', '02', …
  icon:   string   // emoji
  titulo: string
  desc:   string
  color:  string   // CSS gradient
  orden?: number
}

export type EquipoMember = {
  _id?:      string
  nombre:    string
  rol:       string
  desc:      string
  iniciales: string
  emoji:     string
  color:     string   // CSS gradient
  orden?:    number
}

// ── Estáticos (fallback sin Firebase) ─────────────────────────

export const pasosEstaticos: PasoItem[] = [
  { n: '01', icon: '🎧', titulo: 'Escuchamos',   desc: 'Comprendemos las necesidades, problemáticas y deseos de tu marca antes de proponer cualquier solución.',                                     color: 'linear-gradient(135deg,#6B21A8,#9333EA)', orden: 0 },
  { n: '02', icon: '💡', titulo: 'Ideamos',       desc: 'Realizamos un diagnóstico detallado de la marca y construimos un plan de trabajo personalizado.',                                             color: 'linear-gradient(135deg,#7C3AED,#A855F7)', orden: 1 },
  { n: '03', icon: '🎯', titulo: 'Atraemos',      desc: 'Diseñamos contenido memorable y en tendencia para conectar tus servicios con el cliente y posicionar tu marca.',                             color: 'linear-gradient(135deg,#9333EA,#C026D3)', orden: 2 },
  { n: '04', icon: '💰', titulo: 'Convertimos',   desc: 'Pasamos de seguidores a clientes, materializando los objetivos de la marca en resultados concretos.',                                        color: 'linear-gradient(135deg,#6B21A8,#7C3AED)', orden: 3 },
  { n: '05', icon: '🤝', titulo: 'Fidelizamos',   desc: 'Consolidamos relaciones duraderas entre la marca y sus clientes mediante visibilidad y comunicación permanente.',                             color: 'linear-gradient(135deg,#6D28D9,#9333EA)', orden: 4 },
  { n: '06', icon: '📊', titulo: 'Evidenciamos',  desc: 'Mostramos la evolución real: posicionamiento, nuevos clientes y seguidores a través de reportes de métricas.',                              color: 'linear-gradient(135deg,#7C3AED,#6B21A8)', orden: 5 },
]

export const equipoEstatico: EquipoMember[] = [
  {
    nombre: 'Alejandra Giraldo Márquez', rol: 'CEO & Fundadora',
    desc: 'Lidera la visión y dirección de Alma. Apasionada por construir marcas que conectan emocionalmente con las personas y generan resultados reales.',
    iniciales: 'AG', emoji: '🚀', color: 'linear-gradient(135deg,#E11D48,#F43F5E)', orden: 0,
  },
  {
    nombre: 'Sebastián González', rol: 'Gerente Operativo & Co-founder',
    desc: 'Garantiza que cada proyecto fluya con precisión, desde la estrategia hasta la entrega. Más de 6 años convirtiendo ideas en experiencias digitales.',
    iniciales: 'SG', emoji: '🎨', color: 'linear-gradient(135deg,#6B21A8,#9333EA)', orden: 1,
  },
  {
    nombre: 'Lina Márquez', rol: 'Coordinadora de Clientes',
    desc: 'El puente entre el equipo y cada cliente. Asegura que cada experiencia sea clara, cercana y que los proyectos avancen con total tranquilidad.',
    iniciales: 'LM', emoji: '🤝', color: 'linear-gradient(135deg,#0284C7,#38BDF8)', orden: 2,
  },
]

// gradientes disponibles para avatar del equipo
export const EQUIPO_GRADIENTES = [
  'linear-gradient(135deg,#E11D48,#F43F5E)',
  'linear-gradient(135deg,#6B21A8,#9333EA)',
  'linear-gradient(135deg,#0284C7,#38BDF8)',
  'linear-gradient(135deg,#059669,#34D399)',
  'linear-gradient(135deg,#D97706,#FCD34D)',
  'linear-gradient(135deg,#7C3AED,#A78BFA)',
  'linear-gradient(135deg,#DC2626,#F87171)',
  'linear-gradient(135deg,#0891B2,#67E8F9)',
]

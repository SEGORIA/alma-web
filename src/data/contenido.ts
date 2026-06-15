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
  foto?:     string   // URL de foto (opcional, reemplaza emoji+gradiente)
  orden?:    number
  pin?:      string   // PIN de acceso al portal interno de tareas (/equipo/:pin)
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
    iniciales: 'SG', emoji: '💻', color: 'linear-gradient(135deg,#6B21A8,#9333EA)', orden: 1,
  },
  {
    nombre: 'Lina Márquez', rol: 'Coordinadora de Clientes',
    desc: 'El puente entre el equipo y cada cliente. Asegura que cada experiencia sea clara, cercana y que los proyectos avancen con total tranquilidad.',
    iniciales: 'LM', emoji: '🤝', color: 'linear-gradient(135deg,#4C1D95,#818CF8)', orden: 2,
  },
  {
    nombre: 'Anny', rol: 'Creadora Audiovisual',
    desc: 'Transforma ideas en contenido visual que impacta. Especialista en producción de video, reels y piezas audiovisuales que conectan con la audiencia.',
    iniciales: 'AN', emoji: '🎬', color: 'linear-gradient(135deg,#EC4899,#F43F5E)', orden: 3,
  },
  {
    nombre: 'Ana Milena', rol: 'Estrategia Publicitaria & Retail',
    desc: 'Diseña estrategias que venden. Combina el análisis del comportamiento del consumidor con creatividad para maximizar resultados en retail y publicidad.',
    iniciales: 'AM', emoji: '📊', color: 'linear-gradient(135deg,#D97706,#FBBF24)', orden: 4,
  },
  {
    nombre: 'Mariana Alvarán', rol: 'Diseñadora Gráfica & Publicista',
    desc: 'Crea piezas que enamoran. Fusiona diseño gráfico y comunicación publicitaria para dar vida a identidades visuales memorables y coherentes.',
    iniciales: 'MA', emoji: '🎨', color: 'linear-gradient(135deg,#6B21A8,#9333EA)', orden: 5,
  },
  {
    nombre: 'Daniela Ruiz', rol: 'Estratega Holística',
    desc: 'Ve el todo para optimizar las partes. Integra marca, comunicación y propósito en una estrategia coherente que alinea cada acción con los objetivos del negocio.',
    iniciales: 'DR', emoji: '🌟', color: 'linear-gradient(135deg,#7C3AED,#A78BFA)', orden: 6,
  },
  {
    nombre: 'Roger Flores', rol: 'Programador',
    desc: 'Convierte diseños en experiencias digitales que funcionan. Construye webs y aplicaciones rápidas, accesibles y optimizadas para convertir visitantes en clientes.',
    iniciales: 'RF', emoji: '⚙️', color: 'linear-gradient(135deg,#6B21A8,#9333EA)', orden: 7,
  },
  {
    nombre: 'Natalia Sánchez', rol: 'Abogada',
    desc: 'Protege cada proyecto desde su base legal. Asesora en contratos, propiedad intelectual y cumplimiento normativo para que la marca opere con total respaldo jurídico.',
    iniciales: 'NS', emoji: '⚖️', color: 'linear-gradient(135deg,#9D174D,#FDA4AF)', orden: 8,
  },
]

// gradientes disponibles para avatar del equipo
export const EQUIPO_GRADIENTES = [
  'linear-gradient(135deg,#3B0764,#6B21A8)',
  'linear-gradient(135deg,#6B21A8,#9333EA)',
  'linear-gradient(135deg,#4A0E8F,#7E22CE)',
  'linear-gradient(135deg,#7E22CE,#A855F7)',
  'linear-gradient(135deg,#D97706,#FBBF24)',
  'linear-gradient(135deg,#5B21B6,#9333EA)',
  'linear-gradient(135deg,#3B0764,#9333EA)',
  'linear-gradient(135deg,#581C87,#A855F7)',
]

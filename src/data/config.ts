// ── Tipos ─────────────────────────────────────────────────────

export type SeccionesConfig = {
  clientes:    boolean
  nosotros:    boolean
  manifiesto:  boolean
  proceso:     boolean
  servicios:   boolean
  academia:    boolean
  leadMagnet:  boolean
  portafolio:  boolean
  calculadora: boolean
  testimonios: boolean
  blog:        boolean
  faq:         boolean
}

export type Testimonio = {
  _id?:      string
  nombre:    string
  rol:       string
  empresa:   string
  texto:     string
  iniciales: string
  color:     string   // CSS gradient
  fila:      1 | 2
  orden?:    number
}

export type FaqItem = {
  _id?:   string
  q:      string
  a:      string
  orden?: number
}

export type ContactoInfo = {
  whatsapp:  string   // número puro: '573188006436'
  telefono:  string   // texto a mostrar: '+57 301 336 9325'
  email:     string
  ubicacion: string
  instagram: string
  academia:  string
}

export type HeroStat = {
  target: number
  suffix: string
  label:  string
}

export type SiteConfig = {
  secciones:      SeccionesConfig
  clientes:       string[]
  contactoInfo?:  ContactoInfo
  heroStats?:     HeroStat[]
  heroSubtitulo?: string
}

// ── Secciones — información para el admin ─────────────────────

export const seccionesInfo: {
  id:    keyof SeccionesConfig
  label: string
  desc:  string
  icon:  string
}[] = [
  { id: 'clientes',    icon: '🏢', label: 'Clientes',            desc: 'Marquee de nombres bajo el hero' },
  { id: 'nosotros',    icon: '👥', label: 'Nosotros',            desc: 'Sección sobre el equipo y la agencia' },
  { id: 'manifiesto',  icon: '✨', label: 'Manifiesto',          desc: 'Valores y misión de Alma' },
  { id: 'proceso',     icon: '🔄', label: 'Proceso',             desc: 'Pasos del proceso de trabajo' },
  { id: 'servicios',   icon: '💼', label: 'Servicios & Tarifas', desc: 'Planes y precios por categoría' },
  { id: 'academia',    icon: '🎓', label: 'Academia',            desc: 'Recursos y formación digital' },
  { id: 'leadMagnet',  icon: '🎁', label: 'Kit Gratuito',        desc: 'Captura de leads con kit descargable' },
  { id: 'portafolio',  icon: '🖼️', label: 'Portafolio',         desc: 'Proyectos destacados' },
  { id: 'calculadora', icon: '🧮', label: 'Calculadora',         desc: 'Calculadora interactiva de presupuesto' },
  { id: 'testimonios', icon: '💬', label: 'Testimonios',         desc: 'Reseñas de clientes en marquee animado' },
  { id: 'blog',        icon: '📝', label: 'Blog (inicio)',        desc: 'Últimos artículos en el inicio' },
  { id: 'faq',         icon: '❓', label: 'Preguntas Frecuentes', desc: 'Acordeón de preguntas y respuestas' },
]

// ── Defaults de contacto y hero ──────────────────────────────

export const contactoDefault: ContactoInfo = {
  whatsapp:  '573188006436',
  telefono:  '+57 301 336 9325',
  email:     'alma.directivo@gmail.com',
  ubicacion: 'Manizales, Colombia',
  instagram: 'https://www.instagram.com/alma.agenciacreativa',
  academia:  'https://edu.almaagenciacreativa.com',
}

export const heroStatsDefault: HeroStat[] = [
  { target: 150, suffix: '+', label: 'Proyectos entregados' },
  { target: 6,   suffix: '',  label: 'Años de experiencia'  },
  { target: 98,  suffix: '%', label: 'Clientes satisfechos' },
]

export const heroSubtituloDefault = 'Diseñamos marcas, sitios web y estrategias digitales que conectan con tu audiencia y generan resultados medibles.'

// ── Defaults estáticos ────────────────────────────────────────

export const seccionesDefault: SeccionesConfig = {
  clientes:    true,
  nosotros:    true,
  manifiesto:  true,
  proceso:     true,
  servicios:   true,
  academia:    true,
  leadMagnet:  true,
  portafolio:  true,
  calculadora: true,
  testimonios: true,
  blog:        true,
  faq:         true,
}

export const clientesEstaticos: string[] = [
  'Prr Love', 'Malasaña Store', 'Magic All Stars', 'Café Ritual',
  'Nexo Legal', 'Bloom Spa', 'Studio Norte', 'Vereda Digital',
  'Casa Creativa', 'Forma Studio',
]

export const testimoniosEstaticos: Testimonio[] = [
  { nombre: 'María Londoño',    rol: 'Fundadora',         empresa: 'Café Ritual',    fila: 1, orden: 0, iniciales: 'ML', color: 'linear-gradient(135deg,#F5D0FE,#A855F7)', texto: 'Alma transformó nuestra marca por completo. El branding que crearon nos hizo destacar en un mercado muy competitivo. Cada detalle refleja exactamente quiénes somos.' },
  { nombre: 'Carlos Restrepo',  rol: 'Director Comercial', empresa: 'Malasaña Store', fila: 1, orden: 1, iniciales: 'CR', color: 'linear-gradient(135deg,#DDD6FE,#7C3AED)', texto: 'La tienda virtual que desarrollaron superó todas nuestras expectativas. Las ventas aumentaron un 40% el primer mes. El panel de administración es súper fácil de usar.' },
  { nombre: 'Valentina Torres', rol: 'CEO',                empresa: 'Prr Love',       fila: 1, orden: 2, iniciales: 'VT', color: 'linear-gradient(135deg,#FECDD3,#E11D48)', texto: 'El equipo de Alma entiende perfectamente lo que necesita una marca. Creatividad y estrategia en perfecto balance. El resultado fue mucho mejor de lo que imaginé.' },
  { nombre: 'Andrés Gómez',     rol: 'Director',           empresa: 'Magic All Stars', fila: 1, orden: 3, iniciales: 'AG', color: 'linear-gradient(135deg,#FDE68A,#F59E0B)', texto: 'Gracias a la gestión de redes con Alma, pasamos de 500 a 8.000 seguidores en 3 meses. El contenido que crean conecta de verdad con nuestra audiencia.' },
  { nombre: 'Sofía Ramírez',    rol: 'Socia Directora',    empresa: 'Nexo Legal',     fila: 2, orden: 4, iniciales: 'SR', color: 'linear-gradient(135deg,#BAE6FD,#0284C7)', texto: 'Profesionalismo, creatividad y resultados reales. Alma es la agencia que todo negocio necesita. Nuestro sitio web ahora genera consultas todos los días.' },
  { nombre: 'Laura Díaz',       rol: 'Propietaria',        empresa: 'Bloom Spa',      fila: 2, orden: 5, iniciales: 'LD', color: 'linear-gradient(135deg,#D1FAE5,#059669)', texto: 'Nuestro spa nunca había tenido tanta visibilidad digital. El contenido que crea Alma es hermoso y profesional. Las reservas online aumentaron un 60%.' },
  { nombre: 'Sebastián Moreno', rol: 'Gerente General',    empresa: 'Café Ritual',    fila: 2, orden: 6, iniciales: 'SM', color: 'linear-gradient(135deg,#FED7AA,#EA580C)', texto: 'El proceso fue fluido desde el inicio. Entendieron nuestra esencia y la tradujeron perfectamente al diseño. Definitivamente los recomiendo sin dudarlo.' },
  { nombre: 'Daniela Ospina',   rol: 'Consultora',         empresa: 'Marca Personal', fila: 2, orden: 7, iniciales: 'DO', color: 'linear-gradient(135deg,#E0E7FF,#6366F1)', texto: 'Contratamos el plan Marketing Pro y en 2 meses ya teníamos lista de espera. El equipo de Alma se convirtió en parte estratégica de nuestro negocio.' },
]

export const faqsEstaticos: FaqItem[] = [
  { q: '¿Cuánto tiempo tarda la entrega de un proyecto web?',      a: 'Una landing page tarda entre 5 y 7 días hábiles. Un sitio corporativo completo entre 10 y 15 días. Una tienda virtual entre 15 y 25 días hábiles.',                                                            orden: 0 },
  { q: '¿Puedo hacer cambios después de recibir el proyecto?',     a: 'Sí. Todos nuestros planes incluyen una ronda de revisiones sin costo adicional. Cambios fuera del alcance inicial tienen un costo según el trabajo requerido.',                                                     orden: 1 },
  { q: '¿Trabajan con negocios de cualquier ciudad o país?',       a: 'Trabajamos 100% de forma remota y atendemos clientes en toda Colombia, Latinoamérica y el mundo de habla hispana.',                                                                                                 orden: 2 },
  { q: '¿Qué necesito para comenzar un proyecto de branding?',     a: 'Solo un brief básico con tus referencias, colores que te gustan y la esencia de tu marca. Nosotros te guiamos en todo el proceso creativo.',                                                                        orden: 3 },
  { q: '¿El hosting y dominio están incluidos en los planes web?', a: 'No están incluidos, pero te asesoramos para configurarlos correctamente. El costo promedio es entre $80.000 y $120.000 anuales.',                                                                                   orden: 4 },
  { q: '¿Cómo es el proceso de trabajo con Alma?',                 a: 'Briefing → Propuesta creativa → Desarrollo → Revisión → Entrega final. Tendrás acceso directo a tu asesor vía WhatsApp durante todo el proceso.',                                                                   orden: 5 },
]

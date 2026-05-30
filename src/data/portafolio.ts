export type CasoEstudio = {
  desafio?:           string       // El reto del cliente
  solucion?:          string       // Cómo lo resolvimos
  resultados?:        string[]     // Métricas clave: ["127% más engagement", "+3K seguidores"]
  imagenes?:          string[]     // Galería de imágenes del proceso/resultado
  testimonial?:       string       // Quote del cliente
  testimonialAutor?:  string       // Nombre + cargo del autor del testimonial
}

export type Proyecto = {
  _id?:         string
  titulo:       string
  cat:          string
  desc:         string
  año:          string
  tags:         string[]
  g:            string    // gradient CSS (fallback si no hay imagen)
  imagen?:      string    // URL de imagen de portada (Firebase Storage)
  featured?:    boolean
  orden?:       number
  casoEstudio?: CasoEstudio  // Contenido del modal de caso de estudio
}

export const proyectosEstaticos: Proyecto[] = [
  {
    titulo: 'Prr Love',
    cat:    'Branding',
    desc:   'Identidad visual completa para marca de accesorios para mascotas. Logotipo, paleta, manual de marca y assets digitales.',
    año:    '2024',
    tags:   ['Logo', 'Manual de marca', 'Redes sociales'],
    g:      'linear-gradient(135deg,#F5D0FE 0%,#A855F7 100%)',
    featured: true,
  },
  {
    titulo: 'Malasaña Store',
    cat:    'Desarrollo Web',
    desc:   'Tienda virtual con pasarela de pagos, gestión de inventario y panel administrativo personalizado.',
    año:    '2024',
    tags:   ['E-commerce', 'Pasarela de pagos', 'Admin'],
    g:      'linear-gradient(135deg,#DDD6FE 0%,#7C3AED 100%)',
  },
  {
    titulo: 'Magic All Stars',
    cat:    'Marketing Digital',
    desc:   'Estrategia de contenido y pauta digital para academia deportiva. Crecimiento de 0 a 8K seguidores en 3 meses.',
    año:    '2023',
    tags:   ['Instagram', 'Pauta', 'Contenido'],
    g:      'linear-gradient(135deg,#FDE68A 0%,#F59E0B 100%)',
  },
  {
    titulo: 'Café Ritual',
    cat:    'Branding',
    desc:   'Rebranding completo para cafetería de especialidad. Naming, identidad visual y aplicaciones en empaque y señalética.',
    año:    '2024',
    tags:   ['Rebranding', 'Empaque', 'Señalética'],
    g:      'linear-gradient(135deg,#FECDD3 0%,#E11D48 100%)',
    featured: true,
  },
  {
    titulo: 'Nexo Legal',
    cat:    'Desarrollo Web',
    desc:   'Sitio corporativo para firma de abogados con blog integrado, formulario de consultas y SEO posicionado.',
    año:    '2023',
    tags:   ['Corporativo', 'Blog', 'SEO'],
    g:      'linear-gradient(135deg,#BAE6FD 0%,#0284C7 100%)',
  },
  {
    titulo: 'Bloom Spa',
    cat:    'Marketing Digital',
    desc:   'Gestión mensual de redes sociales, diseño de contenido y campañas de pauta con enfoque en reservas online.',
    año:    '2024',
    tags:   ['Community', 'Diseño', 'Conversión'],
    g:      'linear-gradient(135deg,#D1FAE5 0%,#059669 100%)',
  },
]

export const filtrosPortafolio = ['Todos', 'Branding', 'Desarrollo Web', 'Marketing Digital']

export const gradientesDisponibles = [
  { label: 'Morado',   value: 'linear-gradient(135deg,#F5D0FE 0%,#A855F7 100%)' },
  { label: 'Índigo',   value: 'linear-gradient(135deg,#DDD6FE 0%,#7C3AED 100%)' },
  { label: 'Ámbar',    value: 'linear-gradient(135deg,#FDE68A 0%,#F59E0B 100%)' },
  { label: 'Rosa',     value: 'linear-gradient(135deg,#FECDD3 0%,#E11D48 100%)' },
  { label: 'Azul',     value: 'linear-gradient(135deg,#BAE6FD 0%,#0284C7 100%)' },
  { label: 'Verde',    value: 'linear-gradient(135deg,#D1FAE5 0%,#059669 100%)' },
  { label: 'Violeta',  value: 'linear-gradient(135deg,#6B21A8 0%,#9333EA 100%)' },
  { label: 'Naranja',  value: 'linear-gradient(135deg,#FED7AA 0%,#EA580C 100%)' },
]

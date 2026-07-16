/* ── Academia: cursos y recursos gratis ─────────────────────────
   Backend en Firestore (colecciones `cursos` y `recursos`), gestionado
   desde /admin/academia. Consumido por el sitio público en el repo
   hermano `alma-edu` (edu.almaagenciacreativa.com), que lee/escribe al
   mismo proyecto de Firebase. */

export type LeccionTipo = 'video' | 'texto'

export type LeccionRecurso = { nombre: string; url: string }

export type Leccion = {
  id:              string
  titulo:          string
  tipo:            LeccionTipo
  video_url?:      string   // embed de YouTube/Vimeo (no listado)
  contenido_html?: string
  recursos?:       LeccionRecurso[]
  duracion_min?:   number
  orden:           number
}

export type Modulo = {
  id:        string
  titulo:    string
  lecciones: Leccion[]
  orden:     number
}

export type CursoCategoria = 'diseno_branding' | 'marketing_digital' | 'emprendimiento' | 'fotografia_video'
export type CursoNivel     = 'principiante' | 'intermedio' | 'avanzado'
export type CursoEstado    = 'borrador' | 'publicado'

export const CURSO_CATEGORIAS: { value: CursoCategoria; label: string; icon: string }[] = [
  { value: 'diseno_branding',   label: 'Diseño & Branding',    icon: '🎨' },
  { value: 'marketing_digital', label: 'Marketing Digital',    icon: '📲' },
  { value: 'emprendimiento',    label: 'Emprendimiento',       icon: '💼' },
  { value: 'fotografia_video',  label: 'Fotografía & Video',   icon: '📸' },
]

export type Curso = {
  _id?:            string
  titulo:          string
  slug:            string
  descripcion:     string
  categoria:       CursoCategoria
  imagen_portada?: string
  instructor?:     string
  nivel?:          CursoNivel
  modulos:         Modulo[]
  estado:          CursoEstado
  createdAt?:      unknown
  updatedAt?:      unknown
}

/* ── Recursos gratis (biblioteca pública, home de edu.*) ────── */

export type RecursoTipo = 'prompt' | 'pdf' | 'plantilla' | 'video' | 'checklist' | 'otro'

export const RECURSO_TIPOS: { value: RecursoTipo; label: string; icon: string }[] = [
  { value: 'prompt',    label: 'Prompt para copiar', icon: '🤖' },
  { value: 'pdf',       label: 'PDF descargable',    icon: '📄' },
  { value: 'plantilla', label: 'Plantilla',          icon: '🧩' },
  { value: 'video',     label: 'Video',              icon: '🎬' },
  { value: 'checklist', label: 'Checklist',          icon: '✅' },
  { value: 'otro',      label: 'Otro',               icon: '🎁' },
]

export type Recurso = {
  _id?:         string
  titulo:       string
  descripcion:  string
  tipo:         RecursoTipo
  contenido?:   string   // texto/prompt para copiar
  url?:         string   // link a archivo/plantilla externa, si aplica
  orden:        number
  estado:       CursoEstado
  createdAt?:   unknown
}

/** Los "7 Hacks de Instagram con Claude" que hoy viven hardcodeados en
 *  `alma-edu/src/App.tsx` — semilla para poblar la colección `recursos`
 *  la primera vez, desde el botón "Cargar los 7 Hacks iniciales" en
 *  /admin/academia, para no tener que volver a escribirlos a mano. */
export const RECURSOS_SEED_HACKS_IG: Omit<Recurso, '_id' | 'createdAt'>[] = [
  {
    titulo: 'Estrategia de contenido mensual',
    descripcion: 'Planifica 30 días de contenido estratégico en minutos. Deja de improvisar y empieza a publicar con propósito.',
    tipo: 'prompt',
    orden: 0,
    estado: 'publicado',
    contenido: `Actúa como un estratega de redes sociales experto en Instagram. Necesito un plan de contenido para el mes de [MES] para mi agencia creativa [NOMBRE].

Mi nicho: [DESCRIBE TU NICHO]
Mi público objetivo: [DESCRIBE TU AUDIENCIA]
Mis pilares de contenido: [LISTA 3-4 TEMAS PRINCIPALES]

Crea un calendario con 20 publicaciones que incluya:
- Tipo de contenido (Reel, carrusel, imagen estática, Story)
- Tema específico de cada publicación
- Objetivo de cada post (alcance, engagement, conversión)
- Mejor día y hora para publicar

Equilibra contenido educativo, entretenimiento y ventas en proporción 70/20/10.`,
  },
  {
    titulo: 'Captions que generan comentarios',
    descripcion: 'Escribe descripciones que hacen que tu audiencia no pueda evitar interactuar. El engagement que necesitas, sin bloqueo creativo.',
    tipo: 'prompt',
    orden: 1,
    estado: 'publicado',
    contenido: `Eres un copywriter especialista en Instagram con historial de generar alto engagement. Escribe 5 versiones de caption para este post:

Tema del post: [DESCRIBE EL CONTENIDO]
Tono de mi marca: [DESCRIBE TU TONO: profesional/cercano/divertido/inspiracional]
Mi audiencia: [DESCRIBE TU AUDIENCIA]

Cada caption debe:
- Comenzar con un gancho irresistible (primera línea que pare el scroll)
- Tener entre 150-300 palabras
- Incluir una pregunta que invite a comentar
- Terminar con un CTA claro
- Incluir espaciado visual con saltos de línea
- Sugerir 3-5 emojis estratégicos

Al final dame el caption que recomiendas usar y explica por qué.`,
  },
  {
    titulo: 'Hashtags de nicho estratégicos',
    descripcion: 'Encuentra los hashtags que tu audiencia busca pero tu competencia ignora. Más alcance real, menos ruido.',
    tipo: 'prompt',
    orden: 2,
    estado: 'publicado',
    contenido: `Actúa como un experto en SEO para Instagram. Necesito una estrategia completa de hashtags para mi cuenta.

Mi negocio: [DESCRIBE TU NEGOCIO]
Mi nicho: [DESCRIBE TU NICHO]
Mi ubicación (si es relevante): [CIUDAD/PAÍS]
Tipo de contenido que publico: [DESCRIBE TUS POSTS]

Dame una lista de 30 hashtags dividida así:
- 10 hashtags grandes (1M-10M posts) para mayor alcance
- 10 hashtags medianos (100K-1M posts) para audiencia media
- 10 hashtags pequeños de nicho (10K-100K posts) para audiencia muy específica

Para cada categoría explica la estrategia de uso. También dame 5 hashtags de comunidad y cómo usarlos para conectar con creadores de tu nicho.`,
  },
  {
    titulo: 'Guión para Reels virales',
    descripcion: 'Crea guiones con estructura probada que maximizan reproducciones y compartidos. Tu próximo viral empieza aquí.',
    tipo: 'prompt',
    orden: 3,
    estado: 'publicado',
    contenido: `Eres un director creativo de contenido viral en Instagram. Crea un guión completo para un Reel de [DURACIÓN: 30/60/90 segundos].

Tema del Reel: [TEMA]
Objetivo: [EDUCAR / ENTRETENER / VENDER / INSPIRAR]
Tono: [TONO DE LA MARCA]

El guión debe incluir:
- Hook (primeros 3 segundos): qué se ve en pantalla + qué se dice
- Desarrollo (cuerpo): escena por escena con texto en pantalla y narración
- Cierre y CTA (últimos 5 segundos): llamada a la acción

También dame:
- Texto para el primer frame para parar el scroll
- Sugerencia de música o sonido tendencia
- Ideas para la miniatura (cover del Reel)
- Caption de 100 palabras para acompañar el Reel`,
  },
  {
    titulo: 'Análisis de competencia profundo',
    descripcion: 'Descubre exactamente qué hace tu competencia y cómo superarla. El framework que usan las agencias top.',
    tipo: 'prompt',
    orden: 4,
    estado: 'publicado',
    contenido: `Actúa como un analista de marketing digital especializado en Instagram. Voy a darte información sobre 3 competidores y necesito un análisis estratégico.

Mi cuenta: [DESCRIBE TU CUENTA Y NICHO]
Competidor 1: [CUENTA + DESCRIPCIÓN]
Competidor 2: [CUENTA + DESCRIPCIÓN]
Competidor 3: [CUENTA + DESCRIPCIÓN]

Analiza cada uno y dime:
1. ¿Qué tipos de contenido generan más engagement?
2. ¿Qué frecuencia de publicación usan?
3. ¿Cuál es su propuesta de valor diferencial?
4. ¿Qué están haciendo bien que yo debería adoptar?
5. ¿Qué huecos o oportunidades están dejando que yo puedo aprovechar?

Concluye con una estrategia de diferenciación específica para mi cuenta.`,
  },
  {
    titulo: 'Bio que convierte visitas en seguidores',
    descripcion: 'Optimiza tu bio para que cada visitante sepa por qué debe seguirte. 150 caracteres que valen oro.',
    tipo: 'prompt',
    orden: 5,
    estado: 'publicado',
    contenido: `Eres un especialista en optimización de perfiles de Instagram con experiencia en growth hacking. Necesito reescribir mi bio.

Mi negocio/marca: [NOMBRE Y DESCRIPCIÓN]
Lo que hago: [DESCRIBE TU SERVICIO/PRODUCTO]
Para quién: [DESCRIBE TU CLIENTE IDEAL]
Mi propuesta de valor única: [QUÉ TE DIFERENCIA]
Mi CTA actual (enlace en bio): [DÓNDE DIRIGES A LA GENTE]

Crea 3 versiones de bio considerando:
- Máximo 150 caracteres
- Primera línea como headline con tu diferencial
- Uso estratégico de emojis (máximo 3)
- Palabras clave relevantes para búsqueda
- CTA claro hacia el enlace en bio

Para cada versión explica qué perfil de audiencia atraería mejor. Dame también ideas para el nombre del perfil para mejorar la búsqueda.`,
  },
  {
    titulo: 'Identidad visual coherente',
    descripcion: 'Define la estética de tu feed y crea un sistema visual que haga reconocible tu marca al instante.',
    tipo: 'prompt',
    orden: 6,
    estado: 'publicado',
    contenido: `Actúa como un director de arte especializado en branding para Instagram. Necesito crear una identidad visual coherente para mi perfil.

Mi marca: [NOMBRE]
Sector/nicho: [DESCRIBE TU INDUSTRIA]
Personalidad de marca (elige 3-5 adjetivos): [ej: moderna, elegante, cercana, audaz, minimalista]
Referencias visuales que me gustan: [MENCIONA CUENTAS O MARCAS]
Lo que NO quiero: [ESTILOS A EVITAR]

Dame un sistema visual completo:
1. Paleta de colores principal (3 colores con códigos hex) + 2 colores de acento
2. Tipografías recomendadas (1 para títulos, 1 para textos) disponibles en Canva
3. Estilo fotográfico (composición, luz, fondos, props)
4. Plantilla de cuadrícula del feed (patrón de publicación)
5. Filtro o preset de edición de fotos a aplicar (describe los ajustes)
6. Elementos gráficos recurrentes (marcos, líneas, formas)

Concluye con las 5 reglas de oro de consistencia visual que debo seguir siempre.`,
  },
]

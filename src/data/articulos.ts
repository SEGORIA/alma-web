// ── Tipos ─────────────────────────────────────────────────────
export type Bloque =
  | { tipo: 'p';         texto: string }
  | { tipo: 'h2';        texto: string }
  | { tipo: 'h3';        texto: string }
  | { tipo: 'lista';     items: string[] }
  | { tipo: 'destacado'; texto: string }
  | { tipo: 'tip';       titulo: string; texto: string }
  | { tipo: 'separador' }
  | { tipo: 'imagen';    url: string; alt?: string; caption?: string }

export type Articulo = {
  _id?:      string
  slug:      string
  cat:       string
  titulo:    string
  excerpt:   string
  minutos:   number
  fecha:     string
  emoji:     string
  gradient:  string
  destacado?: boolean
  contenido: Bloque[]
}

// ── Artículos ──────────────────────────────────────────────────
export const articulos: Articulo[] = [
  {
    slug:      '5-senales-rediseno-marca',
    cat:       'Branding',
    titulo:    '5 señales de que tu marca necesita un rediseño urgente',
    excerpt:   'Logo pixelado, colores que no recuerdas haber elegido, tipografía que no dice nada… Si te identificas con alguna de estas señales, es momento de actuar.',
    minutos:   5,
    fecha:     'May 2026',
    emoji:     '🎨',
    gradient:  'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)',
    destacado: true,
    contenido: [
      { tipo: 'p', texto: 'Tu marca es la primera impresión que das — y las primeras impresiones no tienen segunda oportunidad. Sin embargo, muchos negocios operan durante años con una identidad visual que ya no los representa, que espanta clientes en lugar de atraerlos, o que simplemente se ve desactualizada.' },
      { tipo: 'p', texto: 'La buena noticia es que hay señales claras que te indican cuándo es el momento de renovar. Aquí te las contamos.' },
      { tipo: 'separador' },
      { tipo: 'h2', texto: '1. Tu logo se ve pixelado o borroso' },
      { tipo: 'p', texto: 'Si tu logo fue diseñado hace más de 5 años, probablemente fue creado en baja resolución para la web de esa época. Hoy, con pantallas Retina, redes sociales y vallas publicitarias, necesitas archivos vectoriales que se vean perfectos a cualquier tamaño.' },
      { tipo: 'tip', titulo: 'Cómo detectarlo', texto: 'Haz zoom en tu logo en el celular. Si los bordes se ven borrosos o dentados, el problema existe.' },

      { tipo: 'h2', texto: '2. No recuerdas por qué elegiste esos colores' },
      { tipo: 'p', texto: 'Los colores de una marca no son decoración — comunican valores, generan emociones y condicionan decisiones de compra. El azul transmite confianza. El verde, naturaleza o dinero. El rojo, urgencia o pasión. Si tus colores fueron elegidos porque "me gustaron en ese momento", es una señal de alerta.' },
      { tipo: 'p', texto: 'Una marca sólida tiene una paleta definida con criterio estratégico, no por capricho estético.' },

      { tipo: 'h2', texto: '3. Tu competencia se ve más profesional que tú' },
      { tipo: 'p', texto: 'Haz este ejercicio: pon el logo de tu empresa junto al de tus 3 competidores principales. ¿Cuál se ve más confiable? ¿Cuál parece más establecido? Si la respuesta no eres tú, estás perdiendo clientes antes de que te den la oportunidad de hablar.' },
      { tipo: 'destacado', texto: 'Los consumidores tardan 0.05 segundos en formarse una opinión visual de una marca. Si en ese momento no impresionas, ya perdiste.' },

      { tipo: 'h2', texto: '4. Tu identidad se ve diferente en cada canal' },
      { tipo: 'p', texto: 'En Instagram usas un logo, en tu tarjeta de presentación otro, en tu sitio web los colores son distintos... Esta inconsistencia visual genera desconfianza. Los clientes no saben si están viendo la misma empresa.' },
      { tipo: 'lista', items: [
        'Logo en múltiples versiones sin criterio unificado',
        'Tipografías distintas en cada pieza de comunicación',
        'Paleta de colores diferente en digital vs. impreso',
        'Tono de comunicación inconsistente entre canales',
      ]},

      { tipo: 'h2', texto: '5. Te da pena compartir tu web o tu tarjeta de presentación' },
      { tipo: 'p', texto: 'Esta es la señal más honesta de todas. Si en un evento de networking dudas en entregar tu tarjeta, o si prefieres no compartir el link de tu sitio web porque "está desactualizado" o "hay que actualizarlo", tu marca está trabajando en tu contra.' },
      { tipo: 'p', texto: 'Una buena identidad visual te da orgullo. Cuando la tienes, la compartes en todas partes.' },
      { tipo: 'separador' },
      { tipo: 'h2', texto: '¿Te identificaste con alguna de estas señales?' },
      { tipo: 'p', texto: 'No es el fin del mundo — es el comienzo de algo mejor. Un rediseño bien hecho no solo mejora cómo te ves, sino cómo te perciben, cuánto cobras y qué tipo de clientes atraes.' },
      { tipo: 'p', texto: 'En Alma hemos acompañado a decenas de negocios en Manizales y Colombia a transformar su identidad visual. El proceso es más accesible de lo que crees, y los resultados son inmediatos.' },
    ],
  },

  {
    slug:      'web-profesional-2025',
    cat:       'Diseño Web',
    titulo:    'Por qué tu negocio necesita una web profesional en 2025',
    excerpt:   'Tener solo Instagram ya no es suficiente. Una web propia te da credibilidad, control y clientes 24/7. Te explicamos qué debe tener y qué cuesta.',
    minutos:   4,
    fecha:     'Abr 2026',
    emoji:     '💻',
    gradient:  'linear-gradient(135deg, #4C1D95 0%, #818CF8 100%)',
    contenido: [
      { tipo: 'p', texto: 'En 2025, "tener presencia digital" ya no significa tener Instagram. Significa tener un ecosistema digital propio que trabaje por ti las 24 horas, los 7 días de la semana. Y el centro de ese ecosistema es tu sitio web.' },
      { tipo: 'p', texto: 'Si todavía dependes exclusivamente de las redes sociales para que te encuentren, estás construyendo sobre terreno prestado. Hoy Instagram te da alcance, mañana cambia el algoritmo y desapareces.' },
      { tipo: 'separador' },
      { tipo: 'h2', texto: 'Las redes sociales son un alquiler. Tu web es tu casa.' },
      { tipo: 'p', texto: 'Piénsalo así: cuando publicas en Instagram, estás invirtiendo en una plataforma que le pertenece a Meta. Ellos deciden quién ve tu contenido, pueden cambiar las reglas, pueden desactivar tu cuenta. Ya le ha pasado a miles de negocios.' },
      { tipo: 'p', texto: 'Tu sitio web es tuyo. Nadie puede quitártelo. El contenido que publicas ahí te pertenece, y Google puede indexarlo para que nuevos clientes te encuentren por años.' },

      { tipo: 'h2', texto: '¿Qué debe tener un buen sitio web en 2025?' },
      { tipo: 'lista', items: [
        'Carga en menos de 3 segundos (si no, el 40% cierra la página)',
        'Diseño responsive — perfecto en celular, tablet y desktop',
        'Propuesta de valor clara en los primeros 5 segundos',
        'Call to action visible: botón de WhatsApp, formulario o reserva',
        'SEO básico para aparecer en Google',
        'HTTPS y dominio propio (no .wixsite ni .webflow.io)',
      ]},

      { tipo: 'destacado', texto: '75% de los usuarios juzgan la credibilidad de un negocio basándose en el diseño de su sitio web. — Stanford Web Credibility Research' },

      { tipo: 'h2', texto: '¿Cuánto cuesta y en cuánto tiempo se recupera?' },
      { tipo: 'p', texto: 'Una landing page profesional en Alma arranca desde $1.580.000. Si esa página convierte un solo cliente nuevo que paga $300.000 o más, ya se pagó sola. Y seguirá generando leads por años.' },
      { tipo: 'p', texto: 'La pregunta no es si puedes darte el lujo de tener una web profesional. La pregunta es si puedes darte el lujo de no tenerla.' },

      { tipo: 'h2', texto: 'Señales de que ya es urgente tener tu web' },
      { tipo: 'lista', items: [
        'Tus clientes te preguntan "¿tienes web?" y no sabes qué responder',
        'Estás perdiendo licitaciones o contratos por no tener presencia digital formal',
        'Tu competencia aparece en Google y tú no',
        'No puedes medir cuántas personas se interesan en tu negocio',
        'Dependes de que Instagram no te suspenda la cuenta',
      ]},
      { tipo: 'separador' },
      { tipo: 'p', texto: 'En Alma diseñamos sitios web desde landing pages hasta tiendas virtuales completas, siempre con foco en conversión: que quien llegue, se quede — y que quien se quede, te contacte.' },
    ],
  },

  {
    slug:      'colores-para-tu-marca',
    cat:       'Branding',
    titulo:    'Cómo elegir los colores perfectos para tu marca',
    excerpt:   'Los colores no son solo estética — comunican valores, generan emociones y condicionan decisiones de compra. Guía práctica para no elegirlos al azar.',
    minutos:   3,
    fecha:     'Mar 2026',
    emoji:     '🎯',
    gradient:  'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',
    contenido: [
      { tipo: 'p', texto: 'Uno de los errores más comunes que vemos en pequeños negocios es elegir los colores de su marca porque "me gustan" o "se ven bonitos juntos". El problema es que los colores no son decoración — son comunicación.' },
      { tipo: 'p', texto: 'Cada color activa respuestas emocionales específicas en el cerebro humano. Ignorar esto es como escribir el texto de tu marca en un idioma que nadie entiende.' },
      { tipo: 'separador' },
      { tipo: 'h2', texto: 'Qué dice cada color sobre tu marca' },
      { tipo: 'lista', items: [
        '🔵 Azul — Confianza, profesionalismo, seguridad. Ideal para finanzas, salud, tecnología.',
        '🟢 Verde — Naturaleza, crecimiento, sostenibilidad. Perfecto para alimentación, bienestar, ecología.',
        '🔴 Rojo — Urgencia, pasión, energía. Funciona en ofertas, restaurantes, entretenimiento.',
        '🟡 Amarillo — Optimismo, creatividad, cercanía. Bueno para marcas juveniles y alegres.',
        '🟣 Morado — Lujo, creatividad, espiritualidad. Usado en marcas premium y artísticas.',
        '⚫ Negro — Elegancia, poder, exclusividad. El rey del lujo y la moda.',
        '🟠 Naranja — Entusiasmo, calidez, acción. Ideal para marcas dinámicas y accesibles.',
      ]},

      { tipo: 'h2', texto: 'Los 3 errores más comunes al elegir colores' },
      { tipo: 'h3', texto: '1. Elegir demasiados colores' },
      { tipo: 'p', texto: 'Una paleta sólida tiene 1 color principal, 1 secundario y 1-2 de acento. Más de eso crea ruido visual y confusión.' },
      { tipo: 'h3', texto: '2. Ignorar el contexto cultural' },
      { tipo: 'p', texto: 'El blanco simboliza pureza en occidente, pero luto en algunos países asiáticos. Si tu negocio tiene alcance internacional, investiga antes de elegir.' },
      { tipo: 'h3', texto: '3. No revisar el contraste y la accesibilidad' },
      { tipo: 'p', texto: 'Tu texto debe ser legible. Un amarillo sobre blanco, por ejemplo, puede ser imposible de leer para personas con baja visión.' },

      { tipo: 'tip', titulo: 'Herramienta gratuita', texto: 'Usa coolors.co para explorar paletas y verificar contraste. Es gratis y muy intuitiva.' },
      { tipo: 'separador' },
      { tipo: 'h2', texto: 'El proceso correcto para elegir tus colores' },
      { tipo: 'lista', items: [
        'Define los 3 adjetivos que quieres que tu marca transmita',
        'Investiga qué colores usa tu competencia (para diferenciarte)',
        'Elige tu color principal basado en los valores de tu marca',
        'Complementa con un secundario que armonice (usa el círculo cromático)',
        'Prueba tu paleta en fondo claro Y fondo oscuro',
        'Valida con personas de tu público objetivo antes de lanzar',
      ]},
      { tipo: 'destacado', texto: 'Los consumidores toman decisiones de compra basadas en el color en el 85% de los casos. No es un detalle — es estrategia.' },
    ],
  },

  {
    slug:      'instagram-negocios-locales',
    cat:       'Marketing Digital',
    titulo:    'Instagram para negocios locales: la guía que nadie te da',
    excerpt:   'Algoritmo, horarios, hashtags, formatos... Deja de publicar sin estrategia. Estas son las claves que aplican los negocios que realmente crecen.',
    minutos:   6,
    fecha:     'Feb 2026',
    emoji:     '📱',
    gradient:  'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
    contenido: [
      { tipo: 'p', texto: 'El 90% de los negocios locales que manejan sus redes sociales cometen el mismo error: publican sin estrategia. Suben una foto del producto, esperan likes, y cuando no llegan, concluyen que "Instagram no funciona para mi negocio".' },
      { tipo: 'p', texto: 'Instagram sí funciona. El problema es cómo se usa. Esta guía te da las claves reales.' },
      { tipo: 'separador' },
      { tipo: 'h2', texto: '1. Entiende cómo funciona el algoritmo en 2025' },
      { tipo: 'p', texto: 'El algoritmo de Instagram prioriza contenido que genera interacción genuina. No es solo sobre likes — es sobre guardados, compartidos, tiempo de visualización y comentarios reales.' },
      { tipo: 'lista', items: [
        'Reels cortos (15-30 segundos) tienen el mayor alcance orgánico',
        'Las historias mantienen tu relación con seguidores actuales',
        'Los carruseles generan más guardados (la métrica más valiosa)',
        'Las publicaciones en feed son para posicionamiento de marca, no para alcance masivo',
      ]},

      { tipo: 'h2', texto: '2. Los 3 tipos de contenido que debes publicar' },
      { tipo: 'h3', texto: 'Contenido de valor (40%)' },
      { tipo: 'p', texto: 'Tips, tutoriales, datos curiosos, información útil para tu audiencia. Este contenido se guarda y se comparte — el mejor para crecer.' },
      { tipo: 'h3', texto: 'Contenido de conexión (40%)' },
      { tipo: 'p', texto: 'Detrás de cámaras, el equipo, el proceso, historias reales. Este genera confianza y humaniza tu marca.' },
      { tipo: 'h3', texto: 'Contenido de venta (20%)' },
      { tipo: 'p', texto: 'Productos, servicios, ofertas, testimonios. La regla de oro: si el 100% de tu contenido es venta, la gente deja de seguirte.' },

      { tipo: 'tip', titulo: 'La regla del 80/20', texto: 'El 80% de tu contenido debe dar valor, el 20% puede vender. No al revés.' },

      { tipo: 'h2', texto: '3. Horarios que realmente funcionan para Colombia' },
      { tipo: 'p', texto: 'Los mejores momentos para publicar en Colombia (hora local):\n• Martes a jueves: 9am–11am y 7pm–9pm\n• Viernes: 6pm–9pm\n• Sábado: 10am–12pm' },
      { tipo: 'p', texto: 'Pero ojo: estos son promedios. Cada negocio tiene su propia audiencia. Revisa tu Instagram Insights para ver cuándo están activos TUS seguidores.' },

      { tipo: 'h2', texto: '4. Hashtags: la verdad en 2025' },
      { tipo: 'p', texto: 'Los hashtags masivos (#amor, #colombia) ya no generan el alcance que generaban. Hoy lo que funciona es una combinación de:' },
      { tipo: 'lista', items: [
        '3-5 hashtags de nicho muy específicos (#brandingManizales, #diseñograficocolombia)',
        '3-5 hashtags de tu industria (#agenciadediseño, #marketingdigital)',
        '2-3 hashtags locales (#Manizales, #Caldas, #Eje cafetero)',
      ]},
      { tipo: 'destacado', texto: 'Menos hashtags, más relevantes. Instagram recomienda usar entre 3 y 5 hashtags altamente relevantes.' },

      { tipo: 'h2', texto: '5. La métrica que más importa (y que nadie mide)' },
      { tipo: 'p', texto: 'Olvídate de los likes. La métrica más valiosa son los guardados. Cuando alguien guarda tu contenido, está diciendo "esto es tan bueno que quiero volver a verlo". Y el algoritmo lo premia.' },
      { tipo: 'p', texto: 'Crea contenido tan útil que la gente quiera guardarlo. Esa es la fórmula.' },
      { tipo: 'separador' },
      { tipo: 'p', texto: 'Aplicar todo esto toma tiempo y consistencia. Si prefieres enfocarte en tu negocio y dejar las redes en manos de expertos, en Alma lo hacemos por ti — con estrategia, diseño y resultados medibles.' },
    ],
  },

  {
    slug:      'manual-de-marca',
    cat:       'Estrategia',
    titulo:    'Manual de marca: qué es y por qué necesitas uno hoy',
    excerpt:   'Sin manual de marca tu negocio se ve diferente en cada pieza. Descubre qué debe incluir un manual profesional y cómo protege tu identidad.',
    minutos:   4,
    fecha:     'Ene 2026',
    emoji:     '📖',
    gradient:  'linear-gradient(135deg, #4A0E8F 0%, #9333EA 100%)',
    contenido: [
      { tipo: 'p', texto: 'Imagina contratar a un diseñador freelance para hacer una pieza. Termina, te entrega el trabajo y... los colores no son exactamente los tuyos, la tipografía es diferente a la que usas, el logo tiene proporciones distintas. ¿Te ha pasado?' },
      { tipo: 'p', texto: 'Eso es exactamente lo que evita un manual de marca. Es el documento que le dice a cualquier diseñador, empleado o socio exactamente cómo debe verse y sonar tu empresa.' },
      { tipo: 'separador' },
      { tipo: 'h2', texto: '¿Qué es un manual de marca?' },
      { tipo: 'p', texto: 'Un manual de marca (también llamado brand guidelines o manual de identidad corporativa) es el documento que consolida todas las reglas de uso de tu identidad visual y verbal. Es la biblia de tu marca.' },
      { tipo: 'p', texto: 'No es un lujo de grandes empresas. Es una necesidad para cualquier negocio que quiera crecer de forma ordenada y coherente.' },

      { tipo: 'h2', texto: '¿Qué incluye un manual de marca profesional?' },
      { tipo: 'lista', items: [
        'Filosofía de marca: misión, visión, valores y personalidad',
        'Logo: versión principal, alternativas, versión en blanco y negro',
        'Zona de protección: espacio mínimo alrededor del logo',
        'Usos incorrectos del logo (ejemplos de lo que NO hacer)',
        'Paleta de colores: códigos HEX, RGB y CMYK de cada color',
        'Tipografías: fuente principal, secundaria y uso de cada una',
        'Tono de voz y ejemplos de cómo escribir (y cómo no escribir)',
        'Aplicaciones: cómo se ve la marca en tarjetas, redes, papelería, etc.',
      ]},

      { tipo: 'destacado', texto: 'Las marcas que mantienen coherencia visual en todos sus canales tienen un 23% más de ingresos que las que no lo hacen. — Forbes' },

      { tipo: 'h2', texto: 'Señales de que necesitas un manual de marca ahora' },
      { tipo: 'lista', items: [
        'Cada pieza de comunicación se ve diferente a la anterior',
        'Tus empleados o colaboradores no saben qué colores ni tipografías usar',
        'Has tenido que corregir trabajos de diseñadores porque "no se parece a tu marca"',
        'Estás pensando en escalar o contratar equipo',
        'Quieres empezar a delegar la comunicación visual de tu negocio',
      ]},

      { tipo: 'h2', texto: 'El ROI de tener un manual de marca' },
      { tipo: 'p', texto: 'Un manual de marca es una inversión única que se amortiza en el primer proyecto de diseño que delegas. En lugar de gastar horas en correcciones y revisiones, tu diseñador tiene todo lo que necesita desde el primer día.' },
      { tipo: 'p', texto: 'Además, la coherencia visual genera confianza. Y la confianza genera ventas.' },
      { tipo: 'tip', titulo: 'Dato práctico', texto: 'En Alma incluimos el manual de marca completo en nuestro plan Branding Completo desde $1.200.000. Es el documento que más valoran nuestros clientes a largo plazo.' },
    ],
  },

  {
    slug:      'seo-local-manizales',
    cat:       'Estrategia',
    titulo:    'SEO local: cómo aparecer primero en Google Manizales',
    excerpt:   'Google My Business, reseñas, palabras clave locales y velocidad de carga. Si tienes un negocio local y no apareces en el mapa, estás regalando clientes.',
    minutos:   5,
    fecha:     'Dic 2025',
    emoji:     '🔍',
    gradient:  'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
    contenido: [
      { tipo: 'p', texto: 'Cuando alguien en Manizales busca "agencia de diseño Manizales", "restaurante cerca de mí" o "plomero Manizales urgente", Google muestra primero los negocios locales. La pregunta es: ¿apareces tú, o aparece tu competencia?' },
      { tipo: 'p', texto: 'El SEO local es la práctica de optimizar tu presencia online para aparecer en búsquedas con intención geográfica. Y es una de las estrategias más rentables para negocios locales.' },
      { tipo: 'separador' },
      { tipo: 'h2', texto: '1. Google My Business: tu activo más importante' },
      { tipo: 'p', texto: 'Si no tienes un perfil en Google My Business (ahora llamado Google Business Profile), estás prácticamente invisible para las búsquedas locales. Es gratis, toma 15 minutos configurarlo, y es el factor #1 en el ranking local de Google.' },
      { tipo: 'lista', items: [
        'Completa el 100% de la información: horario, dirección, teléfono, web',
        'Sube al menos 10 fotos de alta calidad de tu negocio',
        'Elige la categoría correcta (es el factor más importante)',
        'Publica actualizaciones regularmente (al menos 1 por semana)',
        'Responde TODOS los mensajes y preguntas de clientes',
      ]},

      { tipo: 'h2', texto: '2. Las reseñas son tu moneda de oro' },
      { tipo: 'p', texto: 'Google favorece en el ranking a los negocios con más reseñas y mejor calificación. Una estrella más en tu calificación puede aumentar tus ingresos hasta un 9% según estudios de Harvard Business School.' },
      { tipo: 'tip', titulo: 'Estrategia simple', texto: 'Después de cada servicio exitoso, envía un mensaje de WhatsApp a tu cliente con el link directo para dejar reseña. La tasa de conversión es sorprendentemente alta.' },

      { tipo: 'h2', texto: '3. Palabras clave locales en tu sitio web' },
      { tipo: 'p', texto: 'Tu sitio web debe mencionar explícitamente tu ciudad y región. No asumas que Google sabe dónde estás.' },
      { tipo: 'lista', items: [
        'Usa "Manizales", "Caldas" y "Eje Cafetero" en tus textos de forma natural',
        'Crea una página "Contacto" con tu dirección completa',
        'Menciona barrios o zonas si atienes a áreas específicas',
        'Usa Schema.org LocalBusiness en el código de tu web (tu desarrollador lo sabe)',
      ]},

      { tipo: 'destacado', texto: '"Cerca de mí" y "abierto ahora" son dos de las búsquedas locales que más han crecido en los últimos años. Asegúrate de aparecer en ellas.' },

      { tipo: 'h2', texto: '4. Velocidad de carga: el factor que nadie cuida' },
      { tipo: 'p', texto: 'Google penaliza los sitios lentos en el ranking. Si tu web tarda más de 3 segundos en cargar, pierdes posicionamiento Y pierdes usuarios (el 40% abandona antes de que cargue).' },
      { tipo: 'p', texto: 'Factores que afectan la velocidad: imágenes sin optimizar, hosting económico, demasiados plugins, código no optimizado. Un sitio bien desarrollado desde el inicio evita todos estos problemas.' },

      { tipo: 'h2', texto: '5. Consistencia NAP: el detalle que pocos conocen' },
      { tipo: 'p', texto: 'NAP significa Name, Address, Phone (Nombre, Dirección, Teléfono). Tu información de contacto debe ser EXACTAMENTE igual en todos los lugares donde apareces online: Google My Business, tu web, redes sociales, directorios.' },
      { tipo: 'p', texto: 'Una discrepancia tan pequeña como "Cra." vs "Carrera" puede afectar tu ranking local. La consistencia es clave.' },
      { tipo: 'separador' },
      { tipo: 'p', texto: 'El SEO local no da resultados de un día para otro, pero es una inversión que se acumula con el tiempo. Cada mes que optimizas, estás más arriba. Y una vez que llegas, es muy difícil que te bajen.' },
    ],
  },
]

// ── Helper ─────────────────────────────────────────────────────
export const catColor: Record<string, string> = {
  Branding:            '#6B21A8',
  'Diseño Web':        '#7C3AED',
  'Marketing Digital': '#9333EA',
  Estrategia:          '#9333EA',
}

export const categorias = ['Todos', 'Branding', 'Diseño Web', 'Marketing Digital', 'Estrategia']

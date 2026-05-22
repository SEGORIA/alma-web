import { motion } from 'framer-motion'
import { useState } from 'react'
import { P, PL, Y, WA_PROYECTO } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'

// ── Actualiza/agrega artículos aquí ──────────────────────────
type Articulo = {
  cat:        string
  titulo:     string
  excerpt:    string
  minutos:    number
  fecha:      string
  emoji:      string
  gradient:   string
  destacado?: boolean
}

const articulos: Articulo[] = [
  {
    cat:       'Branding',
    titulo:    '5 señales de que tu marca necesita un rediseño urgente',
    excerpt:   'Logo pixelado, colores que no recuerdas haber elegido, tipografía que no dice nada… Si te identificas con alguna de estas señales, es momento de actuar. Tu marca es la primera impresión que das — y las primeras impresiones no tienen segunda oportunidad.',
    minutos:   5,
    fecha:     'May 2025',
    emoji:     '🎨',
    gradient:  `linear-gradient(135deg, ${P} 0%, ${PL} 100%)`,
    destacado: true,
  },
  {
    cat:      'Diseño Web',
    titulo:   'Por qué tu negocio necesita una web profesional en 2025',
    excerpt:  'Tener solo Instagram ya no es suficiente. Una web propia te da credibilidad, control y clientes 24/7. Te explicamos qué debe tener y qué cuesta.',
    minutos:  4,
    fecha:    'Abr 2025',
    emoji:    '💻',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
  },
  {
    cat:      'Branding',
    titulo:   'Cómo elegir los colores perfectos para tu marca',
    excerpt:  'Los colores no son solo estética — comunican valores, generan emociones y condicionan decisiones de compra. Guía práctica para no elegirlos al azar.',
    minutos:  3,
    fecha:    'Abr 2025',
    emoji:    '🎯',
    gradient: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)',
  },
  {
    cat:      'Marketing Digital',
    titulo:   'Instagram para negocios locales: la guía que nadie te da',
    excerpt:  'Algoritmo, horarios, hashtags, formatos... Deja de publicar sin estrategia. Estas son las claves que aplican los negocios que realmente crecen en Manizales.',
    minutos:  6,
    fecha:    'Mar 2025',
    emoji:    '📱',
    gradient: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)',
  },
  {
    cat:      'Estrategia',
    titulo:   'Manual de marca: qué es y por qué necesitas uno hoy',
    excerpt:  'Sin manual de marca tu negocio se ve diferente en cada pieza. Descubre qué debe incluir un manual profesional y cómo protege tu identidad en todos los canales.',
    minutos:  4,
    fecha:    'Mar 2025',
    emoji:    '📖',
    gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
  },
  {
    cat:      'Estrategia',
    titulo:   'SEO local: cómo aparecer primero en Google Manizales',
    excerpt:  'Google My Business, reseñas, palabras clave locales y velocidad de carga. Si tienes un negocio local y no apareces en el mapa, estás regalando clientes.',
    minutos:  5,
    fecha:    'Feb 2025',
    emoji:    '🔍',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)',
  },
]

const categorias = ['Todos', 'Branding', 'Diseño Web', 'Marketing Digital', 'Estrategia']

const catColor: Record<string, string> = {
  Branding:           P,
  'Diseño Web':       '#0284C7',
  'Marketing Digital': '#9333EA',
  Estrategia:         '#059669',
}

function ArticuloCard({ a, index, grande }: { a: Articulo; index: number; grande?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const waText = encodeURIComponent(`Hola, leí el artículo "${a.titulo}" en el blog de Alma y me gustaría saber más`)
  const waLink = `https://wa.me/573188006436?text=${waText}`
  const color  = catColor[a.cat] ?? P

  if (grande) {
    return (
      <motion.a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#fff',
          borderRadius: '24px',
          border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
          overflow: 'hidden',
          boxShadow: hovered ? '0 24px 64px rgba(107,33,168,0.14)' : '0 4px 20px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease',
          textDecoration: 'none',
          marginBottom: '24px',
          cursor: 'pointer',
        }}
      >
        {/* Visual */}
        <div style={{
          background: a.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '260px', fontSize: '72px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.08)',
          }} />
          <span style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }}>{a.emoji}</span>
          {/* Destacado badge */}
          <div style={{
            position: 'absolute', top: '16px', left: '16px',
            background: Y, color: '#111', fontSize: '11px', fontWeight: 800,
            padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px',
          }}>
            ★ Destacado
          </div>
        </div>
        {/* Content */}
        <div style={{ padding: '36px 32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, color, letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: '12px', display: 'block',
          }}>{a.cat}</span>
          <h3 style={{ fontSize: 'clamp(20px,2.5vw,26px)', fontWeight: 800, color: '#111827', lineHeight: 1.25, marginBottom: '14px' }}>
            {a.titulo}
          </h3>
          <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#6B7280', marginBottom: '24px' }}>
            {a.excerpt}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
              🕐 {a.minutos} min · {a.fecha}
            </span>
            <span style={{
              fontSize: '13px', fontWeight: 700, color: P,
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              transform: hovered ? 'translateX(4px)' : 'translateX(0)',
              transition: 'transform 0.2s ease',
            }}>
              Leer artículo →
            </span>
          </div>
        </div>
      </motion.a>
    )
  }

  return (
    <motion.a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        background: '#fff',
        borderRadius: '20px',
        border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
        overflow: 'hidden',
        boxShadow: hovered ? '0 16px 48px rgba(107,33,168,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        textDecoration: 'none',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        cursor: 'pointer',
      }}
    >
      {/* Visual strip */}
      <div style={{
        background: a.gradient,
        height: '120px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '42px', position: 'relative',
      }}>
        {a.emoji}
      </div>
      {/* Content */}
      <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <span style={{
          fontSize: '10px', fontWeight: 700, color, letterSpacing: '1px',
          textTransform: 'uppercase', marginBottom: '8px', display: 'block',
        }}>{a.cat}</span>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', lineHeight: 1.35, marginBottom: '10px', flex: 1 }}>
          {a.titulo}
        </h3>
        <p style={{ fontSize: '12px', lineHeight: 1.65, color: '#9CA3AF', marginBottom: '16px' }}>
          {a.excerpt.slice(0, 90)}…
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <span style={{ fontSize: '11px', color: '#D1D5DB', fontWeight: 500 }}>
            🕐 {a.minutos} min · {a.fecha}
          </span>
          <span style={{
            fontSize: '12px', fontWeight: 700, color: P,
            transform: hovered ? 'translateX(3px)' : 'translateX(0)',
            transition: 'transform 0.2s ease',
          }}>
            Leer →
          </span>
        </div>
      </div>
    </motion.a>
  )
}

export default function Blog() {
  const isMobile              = useIsMobile()
  const [filtro, setFiltro]   = useState('Todos')

  const visibles = filtro === 'Todos'
    ? articulos
    : articulos.filter(a => a.cat === filtro)

  const destacado   = articulos.find(a => a.destacado)!
  const sinDestacado = articulos.filter(a => !a.destacado)
  const grid         = filtro === 'Todos' ? sinDestacado : visibles

  return (
    <section id="blog" style={{ background: '#F9FAFB', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '48px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Blog & Recursos
          </p>
          <h2 style={{ fontSize: isMobile ? 'clamp(26px,7vw,38px)' : 'clamp(30px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '16px' }}>
            Ideas que te ayudan<br />
            <span style={{ color: P }}>a crecer tu marca</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
            Consejos prácticos de branding, diseño web y marketing digital para negocios que quieren destacar.
          </p>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center',
            marginBottom: isMobile ? '32px' : '44px',
          }}
        >
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              style={{
                padding: '8px 18px', borderRadius: '20px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
                background: filtro === cat ? P : '#fff',
                color:      filtro === cat ? '#fff' : '#6B7280',
                boxShadow:  filtro === cat ? `0 4px 14px rgba(107,33,168,0.25)` : '0 1px 4px rgba(0,0,0,0.06)',
                transition: 'all 0.2s ease',
                border: `1px solid ${filtro === cat ? P : '#E5E7EB'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Artículo destacado — solo en "Todos" y desktop */}
        {filtro === 'Todos' && !isMobile && (
          <ArticuloCard a={destacado} index={0} grande />
        )}

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '16px' : '20px',
          marginBottom: isMobile ? '36px' : '52px',
        }}>
          {(filtro === 'Todos' ? grid : visibles).map((a, i) => (
            <ArticuloCard key={a.titulo} a={a} index={i} />
          ))}
        </div>

        {/* CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: `linear-gradient(135deg, ${P} 0%, #9333EA 100%)`,
            borderRadius: '20px',
            padding: isMobile ? '28px 24px' : '36px 48px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div>
            <p style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
              ¿Quieres contenido exclusivo cada semana?
            </p>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              Síguenos en Instagram — tips de branding, casos reales y recursos gratis.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', flexShrink: 0 }}>
            <a
              href="https://instagram.com/alma.agenciacreativa"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#fff', color: P,
                padding: '12px 22px', borderRadius: '12px',
                fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                transition: 'opacity 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              📸 Seguir en Instagram
            </a>
            <a
              href={WA_PROYECTO}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                padding: '12px 22px', borderRadius: '12px',
                fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'background 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              💬 Hablar con el equipo
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

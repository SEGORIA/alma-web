import { motion } from 'framer-motion'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { P, Y, WA_PROYECTO } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { articulos, catColor, categorias, type Articulo } from '../data/articulos'

function ArticuloCard({ a, index, grande }: { a: Articulo; index: number; grande?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const color = catColor[a.cat] ?? P

  if (grande) {
    return (
      <Link to={`/blog/${a.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '24px' }}>
        <motion.div
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
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
            <span style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }}>{a.emoji}</span>
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
        </motion.div>
      </Link>
    )
  }

  return (
    <Link to={`/blog/${a.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
      <motion.div
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
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          cursor: 'pointer',
          width: '100%',
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
      </motion.div>
    </Link>
  )
}

export default function Blog() {
  const isMobile            = useIsMobile()
  const [filtro, setFiltro] = useState('Todos')

  const visibles    = filtro === 'Todos' ? articulos : articulos.filter(a => a.cat === filtro)
  const destacado   = articulos.find(a => a.destacado)!
  const sinDestacado = articulos.filter(a => !a.destacado)
  const grid        = filtro === 'Todos' ? sinDestacado : visibles

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
            <ArticuloCard key={a.slug} a={a} index={i} />
          ))}
        </div>

        {/* Ver todos link */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '52px' }}>
          <Link
            to="/blog"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: P, fontWeight: 700, fontSize: '14px',
              textDecoration: 'none', padding: '10px 20px',
              border: `1.5px solid ${P}`, borderRadius: '10px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = P
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.color = P
            }}
          >
            Ver todos los artículos →
          </Link>
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
                transition: 'opacity 0.2s ease', whiteSpace: 'nowrap',
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
                transition: 'background 0.2s ease', whiteSpace: 'nowrap',
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

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { articulos, catColor } from '../data/articulos'
import { getContactoInfo } from '../lib/db'
import { contactoDefault } from '../data/config'

export default function Blog() {
  const isMobile = useIsMobile()
  const ultimo   = articulos[0]
  const color    = catColor[ultimo.cat] ?? P
  const [hovered,    setHovered]    = useState(false)
  const [waLink,     setWaLink]     = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`
  )
  const [instagram,  setInstagram]  = useState(contactoDefault.instagram)

  useEffect(() => {
    getContactoInfo().then(c => {
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`)
      setInstagram(c.instagram)
    })
  }, [])

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
            Último artículo
          </p>
          <h2 style={{
            fontSize: isMobile ? 'clamp(26px,7vw,38px)' : 'clamp(30px,4vw,46px)',
            fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '16px',
          }}>
            Ideas que te ayudan<br />
            <span style={{ color: P }}>a crecer tu marca</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, maxWidth: '500px', margin: '0 auto' }}>
            Consejos prácticos de branding, diseño web y marketing digital para negocios que quieren destacar.
          </p>
        </motion.div>

        {/* Artículo más reciente — card grande */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: isMobile ? '28px' : '36px' }}
        >
          <Link to={`/blog/${ultimo.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
            <div
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                display: isMobile ? 'flex' : 'grid',
                flexDirection: isMobile ? 'column' : undefined,
                gridTemplateColumns: isMobile ? undefined : '1fr 1fr',
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
                background: ultimo.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                minHeight: isMobile ? '200px' : '300px',
                fontSize: isMobile ? '64px' : '88px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
                <span style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }}>
                  {ultimo.emoji}
                </span>
                {/* Badges */}
                <div style={{
                  position: 'absolute', top: '16px', left: '16px',
                  display: 'flex', gap: '8px',
                }}>
                  <span style={{
                    background: Y, color: '#111', fontSize: '12px', fontWeight: 800,
                    padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.5px',
                  }}>
                    ★ Último artículo
                  </span>
                </div>
              </div>

              {/* Content */}
              <div style={{
                padding: isMobile ? '28px 24px' : '44px 40px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '12px', fontWeight: 700, color, letterSpacing: '1px',
                  textTransform: 'uppercase', marginBottom: '12px', display: 'block',
                }}>
                  {ultimo.cat}
                </span>
                <h3 style={{
                  fontSize: isMobile ? 'clamp(18px,5vw,24px)' : 'clamp(20px,2.5vw,28px)',
                  fontWeight: 900, color: '#111827', lineHeight: 1.2, marginBottom: '14px',
                  letterSpacing: '-0.5px',
                }}>
                  {ultimo.titulo}
                </h3>
                <p style={{ fontSize: '14px', lineHeight: 1.75, color: '#6B7280', marginBottom: '28px' }}>
                  {ultimo.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
                    🕐 {ultimo.minutos} min · {ultimo.fecha}
                  </span>
                  <span style={{
                    fontSize: '14px', fontWeight: 700, color: P,
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    transform: hovered ? 'translateX(5px)' : 'translateX(0)',
                    transition: 'transform 0.2s ease',
                  }}>
                    Leer artículo →
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Ver todos */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '52px' }}
        >
          <Link
            to="/blog"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: P, fontWeight: 700, fontSize: '14px',
              textDecoration: 'none', padding: '11px 24px',
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
            Ver todos los artículos del blog →
          </Link>
        </motion.div>

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
              href={instagram}
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
              href={waLink}
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

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { articulos, catColor } from '../data/articulos'
import { getContactoInfo } from '../lib/db'
import { contactoDefault } from '../data/config'

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`

/* ── Category icon by cat string ─────────────────────────── */
function CatIcon({ cat, size = 24 }: { cat: string; size?: number }) {
  const s = size
  const map: Record<string, React.ReactNode> = {
    Branding: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
    'Diseño Web': (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="white" strokeWidth="2"/>
        <path d="M8 21h8M12 17v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    'Marketing Digital': (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    Estrategia: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
        <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    ),
  }
  return (
    <>{map[cat] ?? (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    )}</>
  )
}

const ClockIcon = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const IgIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="6" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2"/>
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/>
  </svg>
)

const WaIcon2 = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

/* ── Small article card ─────────────────────────────────── */
function SmallCard({ art, index }: { art: typeof articulos[0]; index: number }) {
  const [hov, setHov] = useState(false)
  const col = catColor[art.cat] ?? P
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/blog/${art.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${hov ? col + '55' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: '18px', overflow: 'hidden',
            boxShadow: hov ? `0 16px 40px rgba(0,0,0,0.3), 0 0 0 1px ${col}33` : '0 2px 16px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease', cursor: 'pointer',
            display: 'flex', flexDirection: 'column',
          }}
        >
          {/* Mini visual strip */}
          <div style={{
            background: art.gradient,
            height: '72px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.12)',
            }} />
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', zIndex: 1,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}>
              <CatIcon cat={art.cat} size={20} />
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
              color: col, display: 'block', marginBottom: '7px',
            }}>{art.cat}</span>
            <h3 style={{
              fontSize: '14px', fontWeight: 800, color: '#fff', lineHeight: 1.3,
              marginBottom: '10px', flex: 1,
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>{art.titulo}</h3>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.32)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ClockIcon size={11} /> {art.minutos} min
              </span>
              <span style={{
                fontSize: '12px', fontWeight: 700, color: hov ? '#fff' : 'rgba(255,255,255,0.45)',
                transition: 'all 0.2s ease',
                transform: hov ? 'translateX(3px)' : 'translateX(0)',
              }}>→</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Main ───────────────────────────────────────────────── */
export default function Blog() {
  const isMobile  = useIsMobile()
  const ultimo    = articulos[0]
  const rest      = articulos.slice(1, isMobile ? 2 : 3)
  const color     = catColor[ultimo.cat] ?? P
  const [hov,         setHov]         = useState(false)
  const [waLink,      setWaLink]      = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`
  )
  const [instagram, setInstagram] = useState(contactoDefault.instagram)

  useEffect(() => {
    getContactoInfo().then(c => {
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`)
      setInstagram(c.instagram)
    })
  }, [])

  return (
    <section id="blog" style={{
      background: 'linear-gradient(160deg, #0A0118 0%, #160330 50%, #0D0220 100%)',
      padding: isMobile ? '52px 20px' : '76px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grain */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: NOISE, backgroundRepeat: 'repeat', backgroundSize: '250px 250px',
        opacity: 0.04, pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-60px',
        width: '500px', height: '400px',
        background: `radial-gradient(ellipse, ${P}22 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
          style={{
            display: 'flex', alignItems: isMobile ? 'flex-start' : 'flex-end',
            justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row',
            gap: '16px', marginBottom: isMobile ? '24px' : '36px',
          }}
        >
          <div>
            <p style={{ color: Y, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>
              Blog
            </p>
            <h2 style={{
              fontSize: isMobile ? 'clamp(24px,7vw,34px)' : 'clamp(26px,3vw,38px)',
              fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.05,
            }}>
              Ideas que te ayudan<br />
              <span className="gradient-text">a crecer tu marca</span>
            </h2>
          </div>
          <Link
            to="/blog"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px', flexShrink: 0,
              color: 'rgba(255,255,255,0.55)', fontWeight: 600, fontSize: '13px',
              textDecoration: 'none', padding: '9px 18px',
              border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px',
              transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
          >
            Ver todos los artículos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </motion.div>

        {/* Content grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : `1fr ${rest.length > 1 ? '280px 280px' : '300px'}`,
          gap: isMobile ? '12px' : '16px',
          alignItems: 'stretch',
        }}>

          {/* ── Featured article ── */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to={`/blog/${ultimo.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <div
                onMouseEnter={() => setHov(true)}
                onMouseLeave={() => setHov(false)}
                style={{
                  display: 'flex', flexDirection: 'column',
                  height: '100%',
                  background: hov ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${hov ? color + '55' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '22px', overflow: 'hidden',
                  boxShadow: hov ? `0 24px 64px rgba(0,0,0,0.35), 0 0 0 1px ${color}33` : '0 4px 24px rgba(0,0,0,0.25)',
                  transition: 'all 0.3s ease', cursor: 'pointer',
                  minHeight: isMobile ? 'auto' : '320px',
                }}
              >
                {/* Visual */}
                <div style={{
                  background: ultimo.gradient,
                  height: isMobile ? '160px' : '200px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative', overflow: 'hidden', flexShrink: 0,
                }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }} />
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
                  <div style={{ position: 'absolute', bottom: '-20px', left: '10%', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                  {/* Category icon */}
                  <div style={{
                    width: '60px', height: '60px', borderRadius: '18px',
                    background: 'rgba(255,255,255,0.16)',
                    backdropFilter: 'blur(12px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', zIndex: 1,
                    boxShadow: '0 8px 28px rgba(0,0,0,0.25)',
                    transform: hov ? 'scale(1.07)' : 'scale(1)',
                    transition: 'transform 0.35s ease',
                  }}>
                    <CatIcon cat={ultimo.cat} size={28} />
                  </div>
                  {/* Badge */}
                  <div style={{ position: 'absolute', top: '14px', left: '14px', zIndex: 2 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '5px',
                      background: Y, color: '#111', fontSize: '11px', fontWeight: 800,
                      padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.3px',
                    }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#111">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                      Último artículo
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: isMobile ? '20px' : '24px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase',
                    color, display: 'block', marginBottom: '8px',
                  }}>{ultimo.cat}</span>
                  <h3 style={{
                    fontSize: isMobile ? '18px' : '20px',
                    fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: '10px',
                    letterSpacing: '-0.5px', flex: 1,
                  }}>{ultimo.titulo}</h3>
                  <p style={{
                    fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.45)',
                    marginBottom: '16px',
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>{ultimo.excerpt}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ClockIcon size={12} /> {ultimo.minutos} min · {ultimo.fecha}
                    </span>
                    <span style={{
                      fontSize: '13px', fontWeight: 700,
                      color: hov ? '#fff' : 'rgba(255,255,255,0.5)',
                      display: 'flex', alignItems: 'center', gap: '5px',
                      transform: hov ? 'translateX(4px)' : 'translateX(0)',
                      transition: 'all 0.2s ease',
                    }}>
                      Leer
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>

          {/* ── Secondary articles ── */}
          {rest.map((art, i) => (
            <SmallCard key={art.slug} art={art} index={i} />
          ))}
        </div>

        {/* ── CTA band ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            marginTop: isMobile ? '20px' : '20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: '20px', padding: isMobile ? '22px 20px' : '24px 36px',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between', gap: '18px',
          }}
        >
          <div>
            <p style={{ fontSize: isMobile ? '16px' : '17px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
              ¿Quieres contenido exclusivo cada semana?
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6 }}>
              Síguenos en Instagram — tips de branding, casos reales y recursos gratis.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
            <a
              href={instagram}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #833AB4, #FD1D1D 50%, #F77737)',
                color: '#fff', padding: '11px 20px', borderRadius: '11px',
                fontWeight: 700, fontSize: '13px', textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(131,58,180,0.35)',
                transition: 'all 0.2s ease', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <IgIcon size={15} />
              Seguir en Instagram
            </a>
            <a
              href={waLink}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.8)', padding: '11px 20px', borderRadius: '11px',
                fontWeight: 700, fontSize: '13px', textDecoration: 'none',
                transition: 'all 0.2s ease', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
            >
              <WaIcon2 size={15} />
              Hablar con el equipo
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}

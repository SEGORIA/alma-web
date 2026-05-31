import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { P, PL, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getProyectos, getContactoInfo } from '../lib/db'
import { proyectosEstaticos, filtrosPortafolio, type Proyecto } from '../data/portafolio'
import { contactoDefault } from '../data/config'

/* ── Filter chip icons ─────────────────────────────────────── */
const IconGrid = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/>
  </svg>
)
const IconLayers = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
)
const IconMonitor = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
    <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const IconChart = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const FILTER_ICONS: Record<string, React.ReactNode> = {
  'Todos':             <IconGrid />,
  'Branding':          <IconLayers />,
  'Desarrollo Web':    <IconMonitor />,
  'Marketing Digital': <IconChart />,
}

/* ── Project Card — horizontal on desktop, stacked on mobile ── */
function ProyectoCard({ p, index, isMobile }: { p: Proyecto; index: number; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        background: '#fff',
        borderRadius: '16px',
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(107,33,168,0.22)' : 'rgba(107,33,168,0.07)'}`,
        boxShadow: hovered
          ? '0 14px 44px rgba(107,33,168,0.13)'
          : '0 2px 10px rgba(107,33,168,0.05)',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.28s cubic-bezier(0.22,1,0.36,1)',
        cursor: 'default',
      }}
    >
      {/* Thumbnail — left strip (desktop) or top strip (mobile) */}
      <div style={{
        position: 'relative',
        width: isMobile ? '100%' : '118px',
        height: isMobile ? '100px' : 'auto',
        minHeight: isMobile ? undefined : '110px',
        background: p.g,
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        {p.imagen && (
          <img src={p.imagen} alt={p.titulo} loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        {!p.imagen && (
          <>
            <div style={{ position: 'absolute', bottom: -22, right: -22, width: 90, height: 90, borderRadius: '50%', background: 'rgba(255,255,255,0.14)' }} />
            <div style={{ position: 'absolute', top: -10, left: -10, width: 55, height: 55, borderRadius: '50%', background: 'rgba(255,255,255,0.09)' }} />
            {isMobile && (
              <div style={{ position: 'absolute', bottom: '14px', left: '14px', right: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ height: '6px', width: '55%', background: 'rgba(255,255,255,0.45)', borderRadius: '4px' }} />
                <div style={{ height: '4px', width: '35%', background: 'rgba(255,255,255,0.28)', borderRadius: '4px' }} />
              </div>
            )}
          </>
        )}
        {p.imagen && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />}
        {/* Hover brightness */}
        <div style={{ position: 'absolute', inset: 0, background: `rgba(255,255,255,${hovered ? 0.08 : 0})`, transition: 'background 0.28s ease', pointerEvents: 'none' }} />

        {/* Mobile badges */}
        {isMobile && (
          <>
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 700, color: '#fff' }}>{p.cat}</div>
            <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', padding: '3px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.75)' }}>{p.año}</div>
          </>
        )}
      </div>

      {/* Content */}
      <div style={{
        flex: 1, padding: isMobile ? '14px 16px' : '14px 18px',
        display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0,
      }}>
        {/* Top row: title + year (desktop) or just title (mobile) */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <h3 style={{
            fontSize: isMobile ? '14px' : '14px', fontWeight: 800, color: '#111827',
            margin: 0, lineHeight: 1.3, flex: 1, minWidth: 0,
          }}>{p.titulo}</h3>
          {!isMobile && (
            <span style={{
              fontSize: '11px', fontWeight: 700, color: P,
              background: 'rgba(107,33,168,0.07)', padding: '2px 8px',
              borderRadius: '20px', whiteSpace: 'nowrap', flexShrink: 0,
            }}>{p.año}</span>
          )}
        </div>

        {/* Category (desktop only — saves space) */}
        {!isMobile && (
          <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>{p.cat}</span>
        )}

        {/* Description — 2-line clamp */}
        <p style={{
          fontSize: '12px', color: '#6B7280', lineHeight: 1.6, margin: 0,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          flex: 1,
        }}>{p.desc}</p>

        {/* Bottom row: tags + CTA */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '2px' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
            {p.tags.slice(0, isMobile ? 2 : 3).map(t => (
              <span key={t} style={{
                fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(107,33,168,0.06)', color: P,
                border: '1px solid rgba(107,33,168,0.12)',
                whiteSpace: 'nowrap',
              }}>{t}</span>
            ))}
            {p.tags.length > (isMobile ? 2 : 3) && (
              <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px', background: '#F3F4F6', color: '#9CA3AF' }}>
                +{p.tags.length - (isMobile ? 2 : 3)}
              </span>
            )}
          </div>
          <Link
            to="/portafolio"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: '11px', fontWeight: 800, color: hovered ? P : '#9CA3AF',
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              transition: 'color 0.2s ease',
            }}
          >
            Ver caso
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main ──────────────────────────────────────────────────── */
export default function Portafolio() {
  const isMobile                  = useIsMobile()
  const [filtro,    setFiltro]    = useState('Todos')
  const [proyectos, setProyectos] = useState<Proyecto[]>(proyectosEstaticos)
  const [waLink,    setWaLink]    = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20iniciar%20un%20proyecto%20con%20Alma`
  )

  useEffect(() => {
    getProyectos().then(setProyectos)
    getContactoInfo().then(c => {
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20iniciar%20un%20proyecto%20con%20Alma`)
    })
  }, [])

  const filtered = filtro === 'Todos' ? proyectos : proyectos.filter(p => p.cat === filtro)

  return (
    <section style={{
      background: 'linear-gradient(160deg, #FFFFFF 0%, #F5F3FF 55%, #FAF8FF 100%)',
      padding: isMobile ? '60px 20px' : '90px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Subtle top-right glow */}
      <div style={{
        position: 'absolute', top: '-140px', right: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(107,33,168,0.07) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Subtle bottom-left glow */}
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-60px',
        width: '340px', height: '340px',
        background: 'radial-gradient(ellipse, rgba(250,204,21,0.07) 0%, transparent 65%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '40px' }}
        >
          <p style={{
            color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
            textTransform: 'uppercase', marginBottom: '12px',
          }}>Portafolio</p>
          <h2 style={{
            fontSize: isMobile ? 'clamp(24px,6vw,34px)' : 'clamp(28px,4vw,46px)',
            fontWeight: 900, color: '#111827',
            letterSpacing: '-1.5px', lineHeight: 1.08,
          }}>
            Proyectos que hablan{' '}
            <span style={{ color: P }}>por sí solos</span>
          </h2>
          {!isMobile && (
            <p style={{
              color: '#6B7280', fontSize: '15px',
              marginTop: '14px', maxWidth: '420px', margin: '14px auto 0', lineHeight: 1.7,
            }}>
              Cada proyecto es una historia de transformación. Estos son algunos de los que más nos enorgullecen.
            </p>
          )}
        </motion.div>

        {/* ── Filter chips ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'flex', justifyContent: 'center', gap: '8px',
            marginBottom: isMobile ? '20px' : '36px', flexWrap: 'wrap',
          }}
        >
          {filtrosPortafolio.map((f, i) => {
            const active = filtro === f
            return (
              <motion.button
                key={f}
                onClick={() => setFiltro(f)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: isMobile ? '7px 14px' : '8px 18px',
                  borderRadius: '10px', cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '13px', fontWeight: 700,
                  background: active ? `linear-gradient(135deg, ${P}, ${PL})` : '#fff',
                  color: active ? '#fff' : '#6B7280',
                  border: `1.5px solid ${active ? 'transparent' : '#E5E7EB'}`,
                  boxShadow: active
                    ? `0 4px 18px rgba(107,33,168,0.3)`
                    : '0 1px 4px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {FILTER_ICONS[f]}
                </span>
                {f}
              </motion.button>
            )
          })}
        </motion.div>

        {/* ── Project grid ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filtro}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '10px' : '14px',
            }}
          >
            {filtered.map((p, i) => (
              <ProyectoCard key={p._id ?? p.titulo} p={p} index={i} isMobile={isMobile} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ── Stats strip ── */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            style={{
              marginTop: '36px',
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              background: '#fff',
              border: '1px solid rgba(107,33,168,0.08)',
              borderRadius: '16px', overflow: 'hidden',
              boxShadow: '0 4px 24px rgba(107,33,168,0.06)',
            }}
          >
            {[
              { n: '+40',  label: 'Proyectos entregados', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11l3 3L22 4" stroke={P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={P} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )},
              { n: '100%', label: 'Clientes satisfechos', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#EC4899" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
              )},
              { n: '3',    label: 'Líneas de servicio', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke={PL} strokeWidth="2"/>
                  <circle cx="12" cy="12" r="6"  stroke={PL} strokeWidth="2"/>
                  <circle cx="12" cy="12" r="2"  fill={PL}/>
                </svg>
              )},
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                padding: '18px 22px',
                display: 'flex', alignItems: 'center', gap: '13px',
                borderRight: i < arr.length - 1 ? '1px solid rgba(107,33,168,0.07)' : 'none',
              }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: 'rgba(107,33,168,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: '20px', fontWeight: 900, color: '#111827', margin: 0, lineHeight: 1 }}>{s.n}</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '4px 0 0', fontWeight: 500 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── CTA ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          style={{
            marginTop: isMobile ? '32px' : '20px',
            textAlign: 'center',
            padding: isMobile ? '28px 20px' : '44px 32px',
            borderRadius: '24px',
            background: `linear-gradient(135deg, ${P} 0%, #7C3AED 50%, #9333EA 100%)`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: '-70px', right: '-70px',
            width: '240px', height: '240px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-50px', left: '-50px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />
          <p style={{
            color: 'rgba(255,255,255,0.6)', fontSize: '11px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px',
          }}>¿Tu proyecto podría estar aquí?</p>
          <h3 style={{
            color: '#fff', fontSize: isMobile ? '20px' : 'clamp(20px,3vw,28px)',
            fontWeight: 900, marginBottom: '22px', lineHeight: 1.2, letterSpacing: '-0.5px',
          }}>
            Cuéntanos tu idea y la hacemos realidad
          </h3>
          <motion.a
            href={waLink} target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              background: Y, color: '#111',
              padding: isMobile ? '13px 26px' : '14px 32px',
              borderRadius: '12px', fontWeight: 800, fontSize: '15px',
              textDecoration: 'none',
              boxShadow: '0 6px 24px rgba(250,204,21,0.4)',
              transition: 'box-shadow 0.2s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" fill="currentColor"/>
            </svg>
            Iniciar mi proyecto
          </motion.a>
        </motion.div>

      </div>
    </section>
  )
}

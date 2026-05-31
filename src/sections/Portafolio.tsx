import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { P, PL, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getProyectos, getContactoInfo } from '../lib/db'
import { proyectosEstaticos, filtrosPortafolio, type Proyecto } from '../data/portafolio'
import { contactoDefault } from '../data/config'

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`

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
  'Todos':            <IconGrid />,
  'Branding':         <IconLayers />,
  'Desarrollo Web':   <IconMonitor />,
  'Marketing Digital':<IconChart />,
}

/* ── Proyecto Card ─────────────────────────────────────────── */
function ProyectoCard({ p, index }: { p: Proyecto; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(167,139,250,0.35)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px', overflow: 'hidden',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        boxShadow: hovered
          ? `0 24px 60px rgba(0,0,0,0.45), 0 0 0 1px ${P}40`
          : '0 4px 20px rgba(0,0,0,0.25)',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'all 0.3s cubic-bezier(0.22,1,0.36,1)',
        display: 'flex', flexDirection: 'column',
        cursor: 'default',
      }}
    >
      {/* Gradient header */}
      <div style={{ position: 'relative', height: '145px', background: p.g, overflow: 'hidden', flexShrink: 0 }}>
        {p.imagen && (
          <img src={p.imagen} alt={p.titulo} loading="lazy"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        )}
        {!p.imagen && (
          <>
            <div style={{ position: 'absolute', bottom: -30, right: -30, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.13)' }} />
            <div style={{ position: 'absolute', top: -15, left: -15, width: 75, height: 75, borderRadius: '50%', background: 'rgba(255,255,255,0.09)' }} />
            <div style={{ position: 'absolute', bottom: '16px', left: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ height: '7px', width: '58%', background: 'rgba(255,255,255,0.45)', borderRadius: '4px' }} />
              <div style={{ height: '5px', width: '36%', background: 'rgba(255,255,255,0.28)', borderRadius: '4px' }} />
            </div>
          </>
        )}
        {p.imagen && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.22)' }} />}
        {/* Overlay on hover: subtle brightness lift */}
        <div style={{ position: 'absolute', inset: 0, background: `rgba(255,255,255,${hovered ? 0.07 : 0})`, transition: 'background 0.3s ease', pointerEvents: 'none' }} />
        {/* Cat */}
        <div style={{
          position: 'absolute', top: '11px', left: '11px',
          background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)',
          padding: '4px 11px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 700, color: '#fff', letterSpacing: '0.2px',
        }}>{p.cat}</div>
        {/* Year */}
        <div style={{
          position: 'absolute', top: '11px', right: '11px',
          background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)',
          padding: '4px 9px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.7)',
        }}>{p.año}</div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '9px', flex: 1 }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>
          {p.titulo}
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.65, margin: 0, flex: 1 }}>
          {p.desc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {p.tags.map(t => (
            <span key={t} style={{
              fontSize: '11px', fontWeight: 600, padding: '3px 9px', borderRadius: '20px',
              background: 'rgba(107,33,168,0.2)', color: 'rgba(192,167,250,0.9)',
              border: '1px solid rgba(107,33,168,0.3)',
            }}>{t}</span>
          ))}
        </div>
        <Link
          to="/portafolio"
          style={{
            marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '9px 13px', borderRadius: '10px',
            background: hovered ? `linear-gradient(135deg, ${P}, ${PL})` : 'rgba(107,33,168,0.15)',
            color: hovered ? '#fff' : 'rgba(192,167,250,0.85)',
            fontWeight: 700, fontSize: '12px', textDecoration: 'none',
            border: `1px solid ${hovered ? 'transparent' : 'rgba(107,33,168,0.25)'}`,
            boxShadow: hovered ? `0 4px 16px ${P}50` : 'none',
            transition: 'all 0.25s ease',
          }}
        >
          Ver caso de estudio
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
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
      background: 'linear-gradient(160deg, #070014 0%, #130228 55%, #0A0118 100%)',
      padding: isMobile ? '60px 20px' : '90px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grain */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: NOISE, backgroundRepeat: 'repeat', backgroundSize: '250px 250px',
        opacity: 0.04, pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Glow top-right */}
      <div style={{
        position: 'absolute', top: '-160px', right: '-120px',
        width: '550px', height: '550px',
        background: `radial-gradient(ellipse, ${P}25 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Glow bottom-left */}
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-80px',
        width: '380px', height: '380px',
        background: `radial-gradient(ellipse, rgba(250,204,21,0.08) 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '44px' }}
        >
          <p style={{
            color: Y, fontSize: '12px', fontWeight: 700, letterSpacing: '2px',
            textTransform: 'uppercase', marginBottom: '12px',
          }}>Portafolio</p>
          <h2 style={{
            fontSize: isMobile ? 'clamp(24px,6vw,34px)' : 'clamp(28px,4vw,46px)',
            fontWeight: 900, color: '#fff',
            letterSpacing: '-1.5px', lineHeight: 1.08,
          }}>
            Proyectos que hablan{' '}
            <span className="gradient-text">por sí solos</span>
          </h2>
          {!isMobile && (
            <p style={{
              color: 'rgba(255,255,255,0.48)', fontSize: '15px',
              marginTop: '14px', maxWidth: '420px', margin: '14px auto 0', lineHeight: 1.7,
            }}>
              Cada proyecto es una historia de transformación. Estos son algunos de los que más nos enorgullecen.
            </p>
          )}
        </motion.div>

        {/* ── Filter chips ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'flex', justifyContent: 'center', gap: '8px',
            marginBottom: isMobile ? '24px' : '44px', flexWrap: 'wrap',
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
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: isMobile ? '7px 14px' : '8px 18px',
                  borderRadius: '10px', cursor: 'pointer',
                  fontSize: isMobile ? '12px' : '13px', fontWeight: 700,
                  background: active
                    ? `linear-gradient(135deg, ${P}, ${PL})`
                    : 'rgba(255,255,255,0.06)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  border: `1.5px solid ${active ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                  boxShadow: active ? `0 4px 18px ${P}55` : 'none',
                  transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease',
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(310px, 1fr))',
              gap: isMobile ? '14px' : '20px',
            }}
          >
            {filtered.map((p, i) => (
              <ProyectoCard key={p._id ?? p.titulo} p={p} index={i} />
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
              marginTop: '44px',
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px', overflow: 'hidden',
              backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            {[
              { n: '+40',  label: 'Proyectos entregados', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke={Y} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke={Y} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )},
              { n: '100%', label: 'Clientes satisfechos', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="#EC4899" strokeWidth="2" strokeLinejoin="round"/></svg>
              )},
              { n: '3',    label: 'Categorías de servicio', icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke={PL} strokeWidth="2"/><circle cx="12" cy="12" r="6" stroke={PL} strokeWidth="2"/><circle cx="12" cy="12" r="2" fill={PL}/></svg>
              )},
            ].map((s, i, arr) => (
              <div key={s.label} style={{
                padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: '14px',
                borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>{s.n}</p>
                  <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.42)', margin: '4px 0 0', fontWeight: 500 }}>{s.label}</p>
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
            marginTop: isMobile ? '36px' : '24px',
            textAlign: 'center',
            padding: isMobile ? '28px 20px' : '44px 32px',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            boxShadow: `0 0 80px ${P}18, inset 0 1px 0 rgba(255,255,255,0.06)`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: '-80px', right: '-80px',
            width: '260px', height: '260px', borderRadius: '50%',
            background: `radial-gradient(ellipse, ${P}30 0%, transparent 65%)`,
            pointerEvents: 'none',
          }} />
          <p style={{
            color: 'rgba(255,255,255,0.4)', fontSize: '11px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px',
          }}>¿Tu proyecto podría estar aquí?</p>
          <h3 style={{
            color: '#fff', fontSize: isMobile ? '20px' : 'clamp(20px,3vw,28px)',
            fontWeight: 900, marginBottom: '22px', lineHeight: 1.2, letterSpacing: '-0.5px',
          }}>
            Cuéntanos tu idea y{' '}
            <span className="gradient-text">la hacemos realidad</span>
          </h3>
          <motion.a
            href={waLink} target="_blank" rel="noopener noreferrer"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '9px',
              background: Y, color: '#111',
              padding: isMobile ? '13px 26px' : '14px 32px',
              borderRadius: '12px', fontWeight: 800, fontSize: '15px',
              textDecoration: 'none',
              boxShadow: `0 6px 24px rgba(250,204,21,0.35)`,
              transition: 'box-shadow 0.2s ease',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Iniciar mi proyecto
          </motion.a>
        </motion.div>

      </div>
    </section>
  )
}

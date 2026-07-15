import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { P, PL, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getEquipo, getContactoInfo } from '../lib/db'
import { equipoEstatico } from '../data/contenido'
import { contactoDefault } from '../data/config'
import type { EquipoMember } from '../data/contenido'
import { AnimatedCounter } from '../components/AnimatedCounter'
import WhatsAppIcon from '../components/WhatsAppIcon'

/* ── Stat card icons ───────────────────────────────────────── */
const ClockSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const CheckboxSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)
const HeartSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
)
const TargetSvg = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="6"  stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2"  fill="currentColor"/>
  </svg>
)

const STATS = [
  { n: 6,   suffix: '+', label: 'Años de experiencia',     color: `linear-gradient(135deg,${P},#7C3AED)`,      icon: <ClockSvg />   },
  { n: 150, suffix: '+', label: 'Proyectos entregados',    color: 'linear-gradient(135deg,#6B21A8,#9333EA)',    icon: <CheckboxSvg /> },
  { n: 98,  suffix: '%', label: 'Clientes satisfechos',    color: 'linear-gradient(135deg,#7E22CE,#A855F7)',    icon: <HeartSvg />   },
  { n: 3,   suffix: '',  label: 'Líneas de servicio',       color: `linear-gradient(135deg,#D97706,#FBBF24)`,   icon: <TargetSvg />  },
]

const TEAM_EXTRAS = [
  { iniciales: 'AN', bg: 'linear-gradient(135deg,#D97706,#FBBF24)' },
  { iniciales: 'AM', bg: 'linear-gradient(135deg,#3B0764,#6B21A8)' },
  { iniciales: 'MA', bg: 'linear-gradient(135deg,#6B21A8,#9333EA)' },
  { iniciales: 'DR', bg: 'linear-gradient(135deg,#4A0E8F,#7E22CE)' },
  { iniciales: 'RF', bg: 'linear-gradient(135deg,#7E22CE,#A855F7)' },
]

/* ── 3D Team Card ──────────────────────────────────────────── */
function TeamCard({ m, index }: { m: EquipoMember; index: number }) {
  const wrapRef                 = useRef<HTMLDivElement>(null)
  const [tilt,  setTilt]        = useState({ x: 0, y: 0 })
  const [hov,   setHov]         = useState(false)
  const [sheen, setSheen]       = useState({ x: 50, y: 50 })

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return
    const r  = wrapRef.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top)  / r.height
    setTilt({ x: (ny - 0.5) * -20, y: (nx - 0.5) * 22 })
    setSheen({ x: nx * 100, y: ny * 100 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <div
        ref={wrapRef}
        onMouseMove={onMove}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => { setHov(false); setTilt({ x: 0, y: 0 }) }}
        style={{ perspective: '900px', height: '100%', position: 'relative' }}
      >
        {/* Ambient glow behind card */}
        <div style={{
          position: 'absolute', inset: '-20px', borderRadius: '36px',
          background: `radial-gradient(ellipse, ${P}1E 0%, transparent 65%)`,
          filter: 'blur(20px)',
          opacity: hov ? 1 : 0, transition: 'opacity 0.35s ease',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* 3D card surface */}
        <motion.div
          animate={{
            rotateX: hov ? tilt.x : 0,
            rotateY: hov ? tilt.y : 0,
            scale:   hov ? 1.04  : 1,
          }}
          transition={{ type: 'spring', stiffness: 290, damping: 26, mass: 0.85 }}
          style={{
            background: '#fff',
            borderRadius: '24px',
            padding: '32px 24px',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', textAlign: 'center',
            height: '100%', minHeight: '300px',
            boxShadow: hov
              ? `${-tilt.y * 1.2}px ${tilt.x}px 52px rgba(107,33,168,0.2), 0 20px 44px rgba(107,33,168,0.07)`
              : '0 2px 18px rgba(107,33,168,0.07)',
            border: `1.5px solid ${hov ? 'rgba(107,33,168,0.2)' : 'rgba(107,33,168,0.08)'}`,
            position: 'relative', overflow: 'hidden',
            cursor: 'default', zIndex: 1,
          }}
        >
          {/* Sheen highlight */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: `radial-gradient(ellipse 80% 60% at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.32) 0%, transparent 58%)`,
            opacity: hov ? 1 : 0, transition: 'opacity 0.22s ease',
          }} />

          {/* Expanding accent line at top */}
          <motion.div
            animate={{ width: hov ? '72%' : '28%' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              height: '3px', background: `linear-gradient(90deg, ${P}, ${PL})`,
              borderRadius: '0 0 4px 4px',
            }}
          />

          {/* Avatar — lifts in Z on hover */}
          <motion.div
            animate={{ y: hov ? -8 : 0, scale: hov ? 1.08 : 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              width: '90px', height: '90px', borderRadius: '50%',
              overflow: 'hidden', marginBottom: '20px', flexShrink: 0,
              background: m.foto ? 'transparent' : (m.color ?? `linear-gradient(135deg, ${P}, ${PL})`),
              boxShadow: hov
                ? `0 18px 42px rgba(107,33,168,0.3), 0 0 0 4px rgba(107,33,168,0.15)`
                : `0 4px 18px rgba(0,0,0,0.12), 0 0 0 2px rgba(107,33,168,0.08)`,
              transition: 'box-shadow 0.3s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {m.foto
              ? <img src={m.foto} alt={m.nombre} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>
                  {m.iniciales}
                </span>
            }
          </motion.div>

          {/* Name */}
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '7px', lineHeight: 1.2 }}>
            {m.nombre}
          </h3>

          {/* Role pill */}
          <motion.span
            animate={{ background: hov ? `linear-gradient(135deg, ${P}15, ${PL}18)` : 'rgba(107,33,168,0.07)' }}
            style={{
              display: 'inline-flex', padding: '4px 13px', borderRadius: '20px',
              fontSize: '12px', fontWeight: 700, color: P, letterSpacing: '0.3px',
              marginBottom: '14px', border: `1px solid ${hov ? 'rgba(107,33,168,0.18)' : 'transparent'}`,
              transition: 'border-color 0.25s ease',
            }}
          >
            {m.rol}
          </motion.span>

          {/* Description */}
          <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#6B7280', flex: 1 }}>
            {m.desc}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

/* ── Ver Equipo card ───────────────────────────────────────── */
function EquipoCard() {
  const wrapRef                 = useRef<HTMLDivElement>(null)
  const [tilt,   setTilt]       = useState({ x: 0, y: 0 })
  const [hov,    setHov]        = useState(false)
  const [sheen,  setSheen]      = useState({ x: 50, y: 50 })
  const [fanHov, setFanHov]     = useState(false)

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!wrapRef.current) return
    const r  = wrapRef.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width
    const ny = (e.clientY - r.top)  / r.height
    setTilt({ x: (ny - 0.5) * -18, y: (nx - 0.5) * 20 })
    setSheen({ x: nx * 100, y: ny * 100 })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <Link to="/equipo" style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
        <div
          ref={wrapRef}
          onMouseMove={onMove}
          onMouseEnter={() => { setHov(true); setFanHov(true) }}
          onMouseLeave={() => { setHov(false); setFanHov(false); setTilt({ x: 0, y: 0 }) }}
          style={{ perspective: '900px', height: '100%', position: 'relative' }}
        >
          {/* Glow */}
          <div style={{
            position: 'absolute', inset: '-20px', borderRadius: '36px',
            background: `radial-gradient(ellipse, ${P}30 0%, transparent 65%)`,
            filter: 'blur(22px)',
            opacity: hov ? 1 : 0.4, transition: 'opacity 0.35s ease',
            pointerEvents: 'none', zIndex: 0,
          }} />

          {/* 3D card surface */}
          <motion.div
            animate={{
              rotateX: hov ? tilt.x : 0,
              rotateY: hov ? tilt.y : 0,
              scale:   hov ? 1.04  : 1,
            }}
            transition={{ type: 'spring', stiffness: 290, damping: 26, mass: 0.85 }}
            style={{
              background: `linear-gradient(145deg, ${P} 0%, #7C3AED 50%, #9333EA 100%)`,
              borderRadius: '24px',
              padding: '32px 24px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center',
              height: '100%', minHeight: '300px', justifyContent: 'center', gap: '18px',
              boxShadow: hov
                ? `${-tilt.y * 1.2}px ${tilt.x}px 52px rgba(107,33,168,0.4), 0 20px 44px rgba(107,33,168,0.25)`
                : '0 8px 36px rgba(107,33,168,0.22)',
              position: 'relative', overflow: 'hidden',
              zIndex: 1, cursor: 'pointer',
            }}
          >
            {/* Sheen */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none',
              background: `radial-gradient(ellipse 80% 60% at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.18) 0%, transparent 58%)`,
              opacity: hov ? 1 : 0, transition: 'opacity 0.22s ease',
            }} />
            {/* Background decorative circles */}
            <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '130px', height: '130px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />

            {/* Fanning avatars */}
            <div style={{ position: 'relative', height: '48px', width: '200px', margin: '0 auto' }}>
              {TEAM_EXTRAS.map((a, i) => (
                <motion.div
                  key={a.iniciales}
                  animate={{
                    x:     fanHov ? 2 + i * 40 : 30 + i * 26,
                    y:     fanHov ? -Math.abs(i - 2) * 7 : 0,
                    scale: fanHov ? 1.14 : 1,
                    rotate: fanHov ? (i - 2) * 6 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 22, delay: i * 0.035 }}
                  style={{
                    position: 'absolute', top: 4, left: 0,
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: a.bg,
                    border: '2.5px solid rgba(255,255,255,0.55)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: 800, color: '#fff',
                    zIndex: fanHov ? i + 1 : 5 - i,
                    boxShadow: '0 3px 12px rgba(0,0,0,0.25)',
                  }}
                >
                  {a.iniciales}
                </motion.div>
              ))}
            </div>

            <div style={{ position: 'relative', zIndex: 2 }}>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
                +5 personas más
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, maxWidth: '200px', margin: '0 auto' }}>
                Diseñadores, estrategas, creadores y programadores listos para tu proyecto.
              </p>
            </div>

            {/* CTA pill */}
            <motion.div
              animate={{ scale: hov ? 1.06 : 1, y: hov ? -2 : 0 }}
              transition={{ type: 'spring', stiffness: 350, damping: 22 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: Y, color: '#111',
                padding: '10px 22px', borderRadius: '12px',
                fontWeight: 800, fontSize: '13px',
                boxShadow: hov ? '0 8px 24px rgba(250,204,21,0.45)' : '0 4px 14px rgba(250,204,21,0.3)',
                transition: 'box-shadow 0.25s ease',
                position: 'relative', zIndex: 2,
              }}
            >
              Ver equipo completo
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.div>
          </motion.div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── Main ──────────────────────────────────────────────────── */
export default function Nosotros() {
  const isMobile              = useIsMobile()
  const [equipo,  setEquipo]  = useState<EquipoMember[]>(equipoEstatico)
  const [waLink,  setWaLink]  = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20Alma`
  )

  useEffect(() => {
    getEquipo().then(setEquipo)
    getContactoInfo().then(c =>
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20Alma`)
    )
  }, [])

  return (
    <section style={{
      background: '#FFFFFF',
      padding: isMobile ? '60px 20px' : '100px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'absolute', top: '-120px', right: '-80px', width: '480px', height: '480px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,33,168,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-60px', width: '360px', height: '360px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(250,204,21,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── About section ── */}
        <div style={{
          display: 'flex', gap: isMobile ? '40px' : '80px',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: isMobile ? '56px' : '80px',
        }}>

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ flex: '1 1 320px' }}
          >
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <div style={{ height: '2px', width: '24px', background: P, borderRadius: '2px' }} />
              <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
                Quiénes somos
              </p>
            </div>

            <h2 style={{
              fontSize: isMobile ? 'clamp(28px,7vw,40px)' : 'clamp(32px,4vw,52px)',
              fontWeight: 900, color: '#111827',
              letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '20px',
            }}>
              Somos Alma,<br />
              <span style={{ color: P }}>somos tu equipo.</span>
            </h2>

            <p style={{ fontSize: isMobile ? '15px' : '16px', lineHeight: 1.75, color: '#4B5563', marginBottom: '20px' }}>
              Somos una agencia creativa nacida en Manizales con una misión clara: convertir cada marca en una experiencia que conecta, emociona y genera resultados reales.
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#4B5563', marginBottom: '32px' }}>
              No somos intermediarios ni plantillas. Cada proyecto tiene un equipo dedicado, un proceso claro y una obsesión por los detalles que marcan la diferencia.
            </p>

            {/* CTA */}
            <motion.a
              href={waLink}
              target="_blank" rel="noopener noreferrer"
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: `linear-gradient(135deg, ${P}, #7C3AED)`,
                color: '#fff', padding: '14px 28px', borderRadius: '12px',
                fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                boxShadow: `0 6px 22px rgba(107,33,168,0.32)`,
                transition: 'box-shadow 0.2s ease',
              }}
            >
              <WhatsAppIcon size={18} fill="white" />
              Trabaja con nosotros
            </motion.a>
          </motion.div>

          {/* Right — stats grid with 3D hover */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              flex: '0 0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '14px',
              width: isMobile ? '100%' : '340px',
            }}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.88 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.07, rotateX: -5, rotateY: 6, z: 20 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.35, delay: 0.2 + i * 0.08, type: 'spring', stiffness: 280, damping: 22 }}
                style={{
                  background: s.color,
                  borderRadius: '18px',
                  padding: '22px 16px',
                  textAlign: 'center',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
                  cursor: 'default',
                  perspective: '600px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', color: 'rgba(255,255,255,0.75)' }}>
                  {s.icon}
                </div>
                <p style={{ fontSize: '30px', fontWeight: 900, color: '#fff', lineHeight: 1, letterSpacing: '-1px' }}>
                  <AnimatedCounter value={s.n} suffix={s.suffix} duration={1.6} />
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.82)', marginTop: '7px', fontWeight: 600, lineHeight: 1.35 }}>
                  {s.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Team section heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '44px' }}
        >
          <p style={{
            color: P, fontSize: '12px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px',
          }}>El equipo</p>
          <h3 style={{
            fontSize: isMobile ? 'clamp(22px,5vw,32px)' : 'clamp(24px,3vw,36px)',
            fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            Las personas detrás de{' '}
            <span style={{ color: P }}>cada proyecto</span>
          </h3>
        </motion.div>

        {/* ── 3 cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          maxWidth: isMobile ? '100%' : '960px',
          margin: '0 auto',
          gap: isMobile ? '14px' : '20px',
        }}>
          {equipo.slice(0, 2).map((m, i) => (
            <TeamCard key={m._id ?? m.nombre} m={m} index={i} />
          ))}
          <EquipoCard />
        </div>

      </div>

      {/* Suppress AnimatePresence warning */}
      <AnimatePresence />
    </section>
  )
}

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getContactoInfo, getLeadMagnetConfig } from '../lib/db'
import { contactoDefault, leadMagnetDefault } from '../data/config'
import type { LeadMagnetConfig } from '../data/config'

/* ── Icons ─────────────────────────────────────────────────── */
const PhoneIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>
)
const BrushIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
)
const ChartIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const StarIcon = ({ size = 13, color = '#F59E0B' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="#9333EA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const GiftIcon = ({ size = 22, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 12v10H4V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 7H2v5h20V7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const SparkleIcon = ({ color = '#FACC15' }: { color?: string }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z"/>
    <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75L19 14z" opacity=".6"/>
    <path d="M5 16l.5 1.5L7 18l-1.5.5L5 20l-.5-1.5L3 18l1.5-.5L5 16z" opacity=".5"/>
  </svg>
)

/* ── Icons assigned positionally (se ciclan si hay más de 3 recursos) ── */
const RESOURCE_ICONS = [PhoneIcon, BrushIcon, ChartIcon]

function buildRecursos(textos: string[]) {
  return textos.map((texto, i) => ({
    icon: RESOURCE_ICONS[i % RESOURCE_ICONS.length],
    texto,
  }))
}

/* ── Resource item with hover lift ─────────────────────────── */
function ResourceItem({ r, index }: { r: { icon: React.FC; texto: string }; index: number }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.35 + index * 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHov(true)}
      onHoverEnd={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '11px 14px', borderRadius: '12px',
        background: hov ? `rgba(107,33,168,0.06)` : '#F8F7FF',
        border: `1px solid ${hov ? 'rgba(107,33,168,0.18)' : 'rgba(107,33,168,0.06)'}`,
        boxShadow: hov ? '0 6px 18px rgba(107,33,168,0.1)' : 'none',
        transform: hov ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'all 0.22s ease',
        cursor: 'default',
      }}
    >
      <span style={{ color: hov ? P : '#6B7280', transition: 'color 0.2s', display: 'inline-flex' }}>
        <r.icon />
      </span>
      <span style={{
        fontSize: '13px', fontWeight: 600, flex: 1,
        color: hov ? '#111' : '#374151', transition: 'color 0.2s',
      }}>{r.texto}</span>
      <motion.span animate={{ scale: hov ? 1.25 : 1 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
        <CheckIcon />
      </motion.span>
    </motion.div>
  )
}

/* ── Main ──────────────────────────────────────────────────── */
export default function LeadMagnet() {
  const isMobile              = useIsMobile()
  const [email, setEmail]     = useState('')
  const [focused, setFocused] = useState(false)
  const [sent, setSent]       = useState(false)
  const [phone, setPhone]     = useState(contactoDefault.whatsapp)
  const [btnHov, setBtnHov]   = useState(false)
  const [lmConfig, setLmConfig] = useState<LeadMagnetConfig>(leadMagnetDefault)

  /* 3D card state */
  const cardWrapRef                 = useRef<HTMLDivElement>(null)
  const [tilt, setTilt]             = useState({ x: 0, y: 0 })
  const [hov3d, setHov3d]           = useState(false)
  const [sheen, setSheen]           = useState({ x: 50, y: 50 })

  /* Animated counter */
  const [count, setCount] = useState(0)

  useEffect(() => {
    getContactoInfo().then(c => setPhone(c.whatsapp))
    getLeadMagnetConfig().then(setLmConfig).catch(() => setLmConfig(leadMagnetDefault))
    /* Count up to 500 after a brief delay */
    const t = setTimeout(() => {
      let n = 0
      const iv = setInterval(() => {
        n += 14
        if (n >= 500) { setCount(500); clearInterval(iv) }
        else setCount(n)
      }, 28)
    }, 900)
    return () => clearTimeout(t)
  }, [])

  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardWrapRef.current) return
    const r = cardWrapRef.current.getBoundingClientRect()
    const nx = (e.clientX - r.left) / r.width    // 0–1
    const ny = (e.clientY - r.top) / r.height     // 0–1
    setTilt({ x: (ny - 0.5) * -22, y: (nx - 0.5) * 26 })
    setSheen({ x: nx * 100, y: ny * 100 })
  }

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    const texto = `Hola, quiero recibir el kit gratuito de Alma. Mi correo es: ${email.trim()}`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(texto)}`, '_blank')
    setSent(true)
  }

  return (
    <section style={{
      background: '#FFFFFF',
      padding: isMobile ? '60px 20px' : '100px 24px',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Animated background blobs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.75, 0.5] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: '-120px', right: '-80px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,33,168,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.65, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
        style={{ position: 'absolute', bottom: '-90px', left: '-80px', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(250,204,21,0.15) 0%, transparent 70%)', pointerEvents: 'none' }}
      />
      {/* Small floating dot accents */}
      {!isMobile && ([
        { top: '15%', left: '8%',  size: 8,  color: P,       delay: 0 },
        { top: '70%', left: '12%', size: 6,  color: '#EC4899', delay: 1.2 },
        { top: '25%', right: '6%', size: 10, color: Y,       delay: 0.6 },
        { top: '80%', right: '9%', size: 7,  color: P,       delay: 2 },
      ] as const).map((d, i) => (
        <motion.div
          key={i}
          animate={{ y: [0, -10, 0], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3 + i * 0.7, repeat: Infinity, ease: 'easeInOut', delay: d.delay }}
          style={{
            position: 'absolute', top: d.top, left: 'left' in d ? d.left : undefined,
            right: 'right' in d ? d.right : undefined,
            width: d.size, height: d.size, borderRadius: '50%',
            background: d.color, pointerEvents: 'none',
          }}
        />
      ))}

      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '32px' : '72px',
      }}>

        {/* ── LEFT: 3D interactive card ── */}
        <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -36, y: isMobile ? -20 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center', maxWidth: isMobile ? '100%' : undefined }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '380px' : '340px' }}>

              {/* Perspective wrapper — receives mouse events */}
              <div
                ref={cardWrapRef}
                onMouseMove={onCardMouseMove}
                onMouseEnter={() => setHov3d(true)}
                onMouseLeave={() => { setHov3d(false); setTilt({ x: 0, y: 0 }) }}
                style={{ perspective: '800px', perspectiveOrigin: 'center center' }}
              >
                {/* Soft glow behind card that tilts with it */}
                <motion.div
                  animate={{
                    rotateX: hov3d ? tilt.x * 0.5 : 0,
                    rotateY: hov3d ? tilt.y * 0.5 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                  style={{
                    position: 'absolute', inset: '-24px', borderRadius: '32px',
                    background: `radial-gradient(ellipse, ${P}28 0%, transparent 65%)`,
                    filter: 'blur(22px)', zIndex: 0,
                    opacity: hov3d ? 1 : 0.55,
                    transition: 'opacity 0.3s ease',
                    pointerEvents: 'none',
                  }}
                />

                {/* The 3D card */}
                <motion.div
                  animate={{
                    rotateX: hov3d ? tilt.x : 0,
                    rotateY: hov3d ? tilt.y : 0,
                    scale: hov3d ? 1.035 : 1,
                  }}
                  transition={{ type: 'spring', stiffness: 290, damping: 26, mass: 0.85 }}
                  style={{
                    background: '#fff',
                    borderRadius: '20px',
                    padding: '28px',
                    border: '1px solid rgba(107,33,168,0.1)',
                    position: 'relative', overflow: 'hidden',
                    boxShadow: hov3d
                      ? `${-tilt.y * 1.4}px ${tilt.x * 1.2}px 60px rgba(107,33,168,0.22), 0 24px 50px rgba(107,33,168,0.1)`
                      : '0 24px 80px rgba(107,33,168,0.14), 0 6px 20px rgba(107,33,168,0.06)',
                    cursor: 'default',
                    zIndex: 1,
                  }}
                >
                  {/* Sheen highlight — follows cursor */}
                  <div style={{
                    position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
                    background: `radial-gradient(ellipse 80% 65% at ${sheen.x}% ${sheen.y}%, rgba(255,255,255,0.32) 0%, transparent 58%)`,
                    opacity: hov3d ? 1 : 0,
                    transition: 'opacity 0.22s ease',
                    borderRadius: '20px',
                  }} />

                  {/* Header gradient bar */}
                  <div style={{
                    background: `linear-gradient(135deg, ${P}, #7C3AED, #9333EA)`,
                    borderRadius: '14px', padding: '18px 20px',
                    marginBottom: '18px',
                    display: 'flex', alignItems: 'center', gap: '13px',
                  }}>
                    <motion.div
                      animate={{ rotate: hov3d ? [0, -8, 8, 0] : 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      style={{
                        width: '44px', height: '44px', borderRadius: '11px',
                        background: 'rgba(255,255,255,0.2)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                      }}
                    >
                      <GiftIcon size={22} color="white" />
                    </motion.div>
                    <div>
                      <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', marginBottom: '4px' }}>KIT GRATUITO</p>
                      <p style={{ color: '#fff', fontSize: '15px', fontWeight: 800, lineHeight: 1.2 }}>Crece tu marca digital</p>
                    </div>
                  </div>

                  {/* Resource items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {buildRecursos(lmConfig.recursos).map((r, i) => <ResourceItem key={r.texto} r={r} index={i} />)}
                  </div>

                  {/* Value strip */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    style={{
                      marginTop: '18px', padding: '11px 16px', borderRadius: '12px',
                      background: `linear-gradient(135deg, ${Y}, #FDE047)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      boxShadow: '0 4px 14px rgba(250,204,21,0.3)',
                      cursor: 'default',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <SparkleIcon color="#92400E" />
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#111' }}>Valor total</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#92400E', textDecoration: 'line-through', fontWeight: 500 }}>$150.000</span>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>GRATIS</span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Floating badge — parallax opposite to card tilt */}
              <motion.div
                animate={{
                  y: [0, -8, 0],
                  x: hov3d ? -tilt.y * 1.6 : 0,
                  rotateZ: hov3d ? -tilt.y * 0.55 : 0,
                }}
                transition={{
                  y: { duration: 2.8, repeat: Infinity, ease: 'easeInOut' },
                  x: { type: 'spring', stiffness: 180, damping: 18 },
                  rotateZ: { type: 'spring', stiffness: 180, damping: 18 },
                }}
                style={{
                  position: 'absolute', top: '-18px', right: '-18px',
                  background: '#fff',
                  boxShadow: '0 8px 28px rgba(107,33,168,0.18)',
                  borderRadius: '22px', padding: '8px 15px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  border: '1px solid rgba(107,33,168,0.1)',
                  zIndex: 20,
                }}
              >
                <StarIcon size={13} color="#F59E0B" />
                <span style={{ fontSize: '12px', fontWeight: 800, color: P }}>
                  +{count} descargas
                </span>
              </motion.div>

              {/* Second floating chip — bottom-left */}
              <motion.div
                animate={{
                  y: [0, 6, 0],
                  x: hov3d ? tilt.y * 1.2 : 0,
                }}
                transition={{
                  y: { duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 1 },
                  x: { type: 'spring', stiffness: 160, damping: 18 },
                }}
                style={{
                  position: 'absolute', bottom: '-14px', left: '-14px',
                  background: '#fff', boxShadow: '0 6px 20px rgba(250,204,21,0.28)',
                  borderRadius: '20px', padding: '7px 13px',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  border: `1px solid rgba(250,204,21,0.25)`,
                  zIndex: 20,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#D97706" strokeWidth="2" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400E' }}>100% gratuito</span>
              </motion.div>
            </div>
          </motion.div>

        {/* ── RIGHT: Text + form ── */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 32 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: '1 1 300px', maxWidth: isMobile ? '100%' : '480px' }}
        >
          {/* Eyebrow */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ height: '2px', width: '24px', background: P, borderRadius: '2px' }} />
            <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase' }}>
              Recurso gratuito
            </p>
          </div>

          {/* Headline */}
          <h2 style={{
            fontSize: isMobile ? 'clamp(22px,6vw,32px)' : 'clamp(26px,3.5vw,40px)',
            fontWeight: 900, color: '#111827',
            letterSpacing: '-1.2px', lineHeight: 1.15, marginBottom: '16px',
          }}>
            <span style={{ color: P }}>{lmConfig.titulo}</span>
          </h2>

          {/* Body */}
          <p style={{
            fontSize: isMobile ? '14px' : '16px', color: '#4B5563',
            lineHeight: 1.75, marginBottom: '28px',
          }}>
            {lmConfig.subtitulo}
          </p>

          {/* Form / success */}
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                style={{
                  background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)',
                  border: '1.5px solid #A78BFA', borderRadius: '18px',
                  padding: '28px 24px',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                }}
              >
                <motion.div
                  initial={{ scale: 0.5, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                  style={{
                    width: '60px', height: '60px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #6B21A8, #9333EA)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 8px 28px rgba(107,33,168,0.35)',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </motion.div>
                <p style={{ color: '#3B0764', fontWeight: 800, fontSize: '16px', textAlign: 'center' }}>
                  ¡Te lo enviamos por WhatsApp ahora mismo!
                </p>
                <p style={{ color: '#6B21A8', fontSize: '13px', textAlign: 'center' }}>
                  Revisa tus mensajes — llegará en segundos.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Email + button row */}
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  borderRadius: '14px', overflow: 'hidden',
                  boxShadow: focused
                    ? `0 0 0 3px rgba(107,33,168,0.18), 0 8px 28px rgba(107,33,168,0.12)`
                    : '0 4px 18px rgba(0,0,0,0.07)',
                  transition: 'box-shadow 0.25s ease',
                  border: `2px solid ${focused ? P : '#E5E7EB'}`,
                }}>
                  <input
                    type="email" required value={email}
                    aria-label="Correo electrónico"
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="tu@correo.com"
                    style={{
                      flex: 1, padding: '16px 18px',
                      border: 'none', outline: 'none',
                      fontSize: '15px', color: '#111', background: '#fff',
                    }}
                  />
                  <button
                    type="submit"
                    onMouseEnter={() => setBtnHov(true)}
                    onMouseLeave={() => setBtnHov(false)}
                    style={{
                      background: btnHov
                        ? `linear-gradient(135deg, #581C87, ${P})`
                        : `linear-gradient(135deg, ${P}, #7C3AED)`,
                      color: '#fff',
                      padding: isMobile ? '16px' : '16px 26px',
                      border: 'none', cursor: 'pointer',
                      fontWeight: 800, fontSize: '14px',
                      whiteSpace: 'nowrap',
                      transition: 'background 0.25s ease',
                      letterSpacing: '-0.2px',
                    }}
                  >
                    Quiero el kit →
                  </button>
                </div>

                {/* Trust */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#9333EA" strokeWidth="2" strokeLinejoin="round"/>
                  </svg>
                  <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Sin spam. Solo recursos que realmente sirven.</p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  )
}

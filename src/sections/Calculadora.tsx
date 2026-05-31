import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getPlanes, getExtras, getCategorias, getContactoInfo } from '../lib/db'
import { categoriasEstaticas, planesEstaticos, extrasEstaticos, fmtPrecio, type Plan, type Extra, type ServicioCategoria } from '../data/precios'
import { contactoDefault, type ContactoInfo } from '../data/config'

const STEPS = ['Servicio', 'Plan', 'Extras', 'Resumen']

// Paleta de colores por posición para las tarjetas de servicio
const SERVICE_GRADIENTS = [
  'linear-gradient(135deg,#2563EB,#1D4ED8)',
  'linear-gradient(135deg,#7C3AED,#9333EA)',
  'linear-gradient(135deg,#059669,#10B981)',
  'linear-gradient(135deg,#D97706,#F59E0B)',
  'linear-gradient(135deg,#DB2777,#EC4899)',
]
const SERVICE_GLOWS = [
  'rgba(37,99,235,0.45)',
  'rgba(124,58,237,0.45)',
  'rgba(5,150,105,0.45)',
  'rgba(217,119,6,0.45)',
  'rgba(219,39,119,0.45)',
]

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`

/* ── SVG icons para servicios y extras ─────────────────────── */
function SvgIcon({ id, size = 24 }: { id: string; size?: number }) {
  const s = size
  const icons: Record<string, React.ReactNode> = {
    // Servicios por ID
    web: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="20" height="14" rx="2" stroke="white" strokeWidth="2"/>
        <path d="M8 21h8M12 17v4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    branding: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
    marketing: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    fotovideo: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M23 7l-7 5 7 5V7z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <rect x="1" y="5" width="15" height="14" rx="2" stroke="white" strokeWidth="2"/>
      </svg>
    ),
    estrategia: (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
        <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
    ),
    // Extras por emoji string
    '📷': (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="white" strokeWidth="2"/>
        <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2"/>
      </svg>
    ),
    '🎬': (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="2.18" stroke="white" strokeWidth="2"/>
        <path d="M7 2v20M17 2v20M2 12h20M2 7h5M17 7h5M2 17h5M17 17h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    '🚀': (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" stroke="white" strokeWidth="2"/>
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" stroke="white" strokeWidth="2"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke="white" strokeWidth="2"/>
      </svg>
    ),
    '🎓': (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M22 10v6M2 10l10-5 10 5-10 5-10-5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12v5c3 3 9 3 12 0v-5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    '🛡️': (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
      </svg>
    ),
    '📣': (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none">
        <path d="M3 11l19-9-9 19-2-8-8-2z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  }
  return <>{icons[id] ?? <svg width={s} height={s} viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2"/></svg>}</>
}

export default function Calculadora() {
  const isMobile = useIsMobile()

  const [planes,    setPlanes]    = useState<Plan[]>(planesEstaticos)
  const [extras,    setExtras]    = useState<Extra[]>(extrasEstaticos)
  const [servicios, setServicios] = useState<ServicioCategoria[]>(categoriasEstaticas)
  const [contacto,  setContacto]  = useState<ContactoInfo>(contactoDefault)

  useEffect(() => {
    getPlanes().then(setPlanes)
    getExtras().then(setExtras)
    getCategorias().then(setServicios)
    getContactoInfo().then(setContacto)
  }, [])

  const [step,           setStep]           = useState(0)
  const [servicioId,     setServicioId]     = useState<string | null>(null)
  const [planId,         setPlanId]         = useState<string | null>(null)
  const [extrasSelected, setExtrasSelected] = useState<string[]>([])

  const servicio   = servicios.find(s => s.id === servicioId)
  const planLista  = servicioId ? planes.filter(p => p.tabId === servicioId) : []
  const plan       = planLista.find(p => (p._id ?? p.nombre) === planId)
  const extrasObjs = extras.filter(e => extrasSelected.includes(e._id ?? e.label))

  const precioBase   = plan?.precioNum ?? 0
  const precioExtras = extrasObjs.reduce((a, e) => a + e.precioNum, 0)
  const precioTotal  = precioBase + precioExtras

  const toggleExtra = (key: string) =>
    setExtrasSelected(prev =>
      prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key]
    )

  const buildWA = () => {
    const lines = [
      'Hola, calculé mi presupuesto en la web de Alma 🎯',
      '',
      `📌 Servicio: ${servicio?.label}`,
      `📦 Plan: ${plan?.nombre} — ${fmtPrecio(precioBase)}${plan?.periodo ?? ''}`,
      extrasObjs.length ? `➕ Extras:\n${extrasObjs.map(e => `  · ${e.label} (${fmtPrecio(e.precioNum)})`).join('\n')}` : '',
      '',
      `💰 Total estimado: ${fmtPrecio(precioTotal)}`,
      '',
      '¿Podemos agendar una llamada para conversarlo?',
    ].filter(Boolean).join('\n')
    return `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(lines)}`
  }

  const canNext = [servicioId !== null, planId !== null, true]
  const goNext  = () => setStep(s => s + 1)
  const goBack  = () => setStep(s => s - 1)
  const reset   = () => { setStep(0); setServicioId(null); setPlanId(null); setExtrasSelected([]) }

  const servicioIdx   = servicios.findIndex(s => s.id === servicioId)
  const servicioColor = servicioIdx >= 0 ? SERVICE_GRADIENTS[servicioIdx % SERVICE_GRADIENTS.length] : SERVICE_GRADIENTS[0]
  const servicioGlow  = servicioIdx >= 0 ? SERVICE_GLOWS[servicioIdx % SERVICE_GLOWS.length]     : SERVICE_GLOWS[0]

  return (
    <section style={{
      background: 'linear-gradient(160deg,#080818 0%,#0F0824 55%,#130A1E 100%)',
      padding: isMobile ? '60px 20px' : '100px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grain */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: NOISE, backgroundRepeat: 'repeat', backgroundSize: '250px 250px',
        opacity: 0.04, pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Glow top */}
      <div style={{
        position: 'absolute', top: '-220px', left: '50%', transform: 'translateX(-50%)',
        width: '900px', height: '500px',
        background: `radial-gradient(ellipse,${P}22 0%,transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Glow bottom-right */}
      <div style={{
        position: 'absolute', bottom: '-120px', right: '-80px',
        width: '450px', height: '450px',
        background: `radial-gradient(ellipse,${Y}0D 0%,transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '860px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '52px' }}
        >
          <p style={{ color: Y, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>Calculadora</p>
          <h2 style={{ fontSize: isMobile ? 'clamp(26px,7vw,38px)' : 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '14px' }}>
            ¿Cuánto cuesta<br />
            <span className="gradient-text-gold">tu proyecto ideal?</span>
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto' }}>
            Calcula tu presupuesto en 3 pasos. Sin compromiso.
          </p>
        </motion.div>

        {/* ── Step indicator premium ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? '28px' : '44px' }}>
          {STEPS.map((s, i) => {
            const done = step > i; const current = step === i
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <motion.div
                  animate={{
                    background: done ? '#10B981' : current ? P : 'rgba(255,255,255,0.08)',
                    boxShadow: current ? `0 0 0 4px rgba(107,33,168,0.2), 0 0 22px ${P}66` : 'none',
                    borderColor: done ? '#10B981' : current ? P : 'rgba(255,255,255,0.15)',
                  }}
                  transition={{ duration: 0.35 }}
                  style={{
                    width: isMobile ? '28px' : '34px', height: isMobile ? '28px' : '34px',
                    borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.15)',
                    color: (done || current) ? '#fff' : 'rgba(255,255,255,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: isMobile ? '11px' : '13px', fontWeight: 800, flexShrink: 0,
                  }}
                >
                  {done ? '✓' : i + 1}
                </motion.div>
                {!isMobile && (
                  <span style={{
                    fontSize: '12px', fontWeight: 600, marginLeft: '6px', transition: 'color 0.3s',
                    color: done ? '#10B981' : current ? Y : 'rgba(255,255,255,0.3)',
                  }}>{s}</span>
                )}
                {i < STEPS.length - 1 && (
                  <motion.div
                    animate={{ background: done ? '#10B981' : 'rgba(255,255,255,0.08)' }}
                    transition={{ duration: 0.4 }}
                    style={{ width: isMobile ? '24px' : '40px', height: '2px', margin: isMobile ? '0 6px' : '0 12px', borderRadius: '2px', flexShrink: 0 }}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Card principal — glassmorphism ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.09)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          padding: isMobile ? '24px 20px' : '40px 48px',
          minHeight: '340px',
          boxShadow: '0 40px 100px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07)',
        }}>
          <AnimatePresence mode="wait">

            {/* ── PASO 0: Servicio ── */}
            {step === 0 && (
              <motion.div key="step0"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>¿Qué necesitas?</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', marginBottom: '24px' }}>Selecciona el servicio principal</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  {servicios.map((s, idx) => {
                    const sel = servicioId === s.id
                    const grad = SERVICE_GRADIENTS[idx % SERVICE_GRADIENTS.length]
                    const glow = SERVICE_GLOWS[idx % SERVICE_GLOWS.length]
                    return (
                      <motion.button key={s.id}
                        onClick={() => { setServicioId(s.id); setPlanId(null); setExtrasSelected([]) }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '16px',
                          padding: '18px 20px', borderRadius: '18px',
                          border: `1.5px solid ${sel ? 'transparent' : 'rgba(255,255,255,0.09)'}`,
                          background: sel ? grad : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer', textAlign: 'left',
                          boxShadow: sel ? `0 10px 36px ${glow}` : 'none',
                          transition: 'background 0.25s, border 0.25s, box-shadow 0.25s',
                        }}
                      >
                        <div style={{
                          width: '50px', height: '50px', borderRadius: '14px', flexShrink: 0,
                          background: sel ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.25s',
                        }}>
                          <SvgIcon id={s.id} size={26} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '15px', fontWeight: 700, color: '#fff', marginBottom: '3px' }}>{s.label}</p>
                          <p style={{ fontSize: '12px', color: sel ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.38)', fontWeight: 400 }}>{s.desc}</p>
                        </div>
                        <AnimatePresence>
                          {sel && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                              style={{
                                width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                                background: 'rgba(255,255,255,0.28)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontSize: '14px', fontWeight: 900,
                              }}
                            >✓</motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ── PASO 1: Plan ── */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {servicioId && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '8px', background: servicioColor, boxShadow: `0 3px 10px ${servicioGlow}`, flexShrink: 0 }}><SvgIcon id={servicioId} size={16} /></span>}
                  {servicio?.label} — ¿Qué alcance necesitas?
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', marginBottom: '24px' }}>Elige el plan que mejor se adapta</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px' }}>
                  {planLista.map(p => {
                    const key = p._id ?? p.nombre
                    const sel = planId === key
                    return (
                      <motion.button key={key} onClick={() => setPlanId(key)}
                        whileHover={{ scale: 1.03, y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                        style={{
                          padding: '22px 18px', borderRadius: '18px', textAlign: 'left',
                          cursor: 'pointer', position: 'relative', overflow: 'visible',
                          border: `1.5px solid ${sel ? P : p.destacado ? `${P}44` : 'rgba(255,255,255,0.09)'}`,
                          background: sel
                            ? 'linear-gradient(135deg,rgba(107,33,168,0.38),rgba(147,51,234,0.22))'
                            : 'rgba(255,255,255,0.05)',
                          boxShadow: sel ? `0 10px 36px rgba(107,33,168,0.4), inset 0 1px 0 rgba(255,255,255,0.1)` : 'none',
                          transition: 'background 0.25s, border 0.25s, box-shadow 0.25s',
                        }}
                      >
                        {p.destacado && (
                          <div style={{
                            position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                            background: Y, color: '#111', fontSize: '10px', fontWeight: 800,
                            padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap',
                            boxShadow: '0 4px 14px rgba(250,204,21,0.45)',
                          }}>MÁS SOLICITADO</div>
                        )}
                        <p style={{ fontSize: '13px', fontWeight: 700, color: sel ? '#fff' : 'rgba(255,255,255,0.8)', marginBottom: '8px' }}>{p.nombre}</p>
                        <p style={{ fontSize: '26px', fontWeight: 900, color: Y, lineHeight: 1, marginBottom: '12px', textShadow: sel ? `0 0 24px ${Y}66` : 'none' }}>
                          {fmtPrecio(p.precioNum)}
                          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>{p.periodo ?? ''}</span>
                        </p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {p.items.map((it, i) => (
                            <li key={i} style={{ fontSize: '12px', color: sel ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.38)', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                              <span style={{ color: sel ? Y : P, flexShrink: 0, fontWeight: 700 }}>✓</span>{it}
                            </li>
                          ))}
                        </ul>
                        <AnimatePresence>
                          {sel && (
                            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                              style={{ marginTop: '14px', textAlign: 'right', fontSize: '12px', color: Y, fontWeight: 700 }}
                            >Seleccionado ✓</motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ── PASO 2: Extras ── */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                  ¿Algo adicional? <span style={{ fontSize: '13px', fontWeight: 400, color: 'rgba(255,255,255,0.32)' }}>(opcional)</span>
                </h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', marginBottom: '24px' }}>Suma servicios complementarios</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  {extras.map(e => {
                    const key = e._id ?? e.label
                    const sel = extrasSelected.includes(key)
                    return (
                      <motion.button key={key} onClick={() => toggleExtra(key)}
                        whileHover={{ scale: 1.015 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '16px 18px', borderRadius: '16px', textAlign: 'left',
                          border: `1.5px solid ${sel ? P : 'rgba(255,255,255,0.09)'}`,
                          background: sel ? 'rgba(107,33,168,0.22)' : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          boxShadow: sel ? '0 6px 24px rgba(107,33,168,0.28)' : 'none',
                          transition: 'background 0.2s, border 0.2s, box-shadow 0.2s',
                        }}
                      >
                        <div style={{
                          width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                          background: sel ? 'rgba(107,33,168,0.4)' : 'rgba(255,255,255,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'background 0.2s',
                        }}><SvgIcon id={e.emoji} size={22} /></div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{e.label}</p>
                          <p style={{ fontSize: '12px', fontWeight: sel ? 700 : 400, color: sel ? Y : 'rgba(255,255,255,0.35)' }}>
                            + {fmtPrecio(e.precioNum)}
                          </p>
                        </div>
                        <motion.div
                          animate={{ background: sel ? P : 'rgba(255,255,255,0.07)' }}
                          style={{
                            width: '24px', height: '24px', borderRadius: '7px', flexShrink: 0,
                            border: `1.5px solid ${sel ? P : 'rgba(255,255,255,0.18)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'border-color 0.2s',
                          }}
                        >
                          <AnimatePresence>
                            {sel && (
                              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                                style={{ color: '#fff', fontSize: '14px', fontWeight: 900 }}
                              >✓</motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ── PASO 3: Resumen ── */}
            {step === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.3 }}
              >
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Tu presupuesto estimado</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)', marginBottom: '22px' }}>Comparte este resumen por WhatsApp</p>

                {/* Badge servicio seleccionado */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  background: servicioColor, padding: '6px 16px', borderRadius: '20px',
                  marginBottom: '20px',
                  boxShadow: `0 4px 18px ${servicioGlow}`,
                }}>
                  {servicioId && <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '22px', height: '22px', flexShrink: 0 }}><SvgIcon id={servicioId} size={16} /></span>}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{servicio?.label}</span>
                </div>

                {/* Receipt card */}
                <div style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.09)',
                  padding: '24px',
                  marginBottom: '18px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', fontWeight: 500, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '1px' }}>Plan seleccionado</p>
                      <p style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{plan?.nombre}</p>
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: Y }}>
                      {fmtPrecio(precioBase)}
                      <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 400 }}>{plan?.periodo ?? ''}</span>
                    </p>
                  </div>
                  {extrasObjs.map(e => (
                    <div key={e._id ?? e.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{e.emoji} {e.label}</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>+ {fmtPrecio(e.precioNum)}</p>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: '14px', paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Total estimado</p>
                      <motion.p
                        key={precioTotal}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, type: 'spring', stiffness: 280 }}
                        style={{
                          fontSize: isMobile ? '34px' : '42px', fontWeight: 900, color: Y, lineHeight: 1,
                          textShadow: `0 0 36px ${Y}77`,
                        }}
                      >
                        {fmtPrecio(precioTotal)}
                        <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{plan?.periodo ?? ''}</span>
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                      style={{ fontSize: '48px', filter: 'drop-shadow(0 0 16px rgba(250,204,21,0.4))' }}
                    >🎯</motion.div>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.28)', textAlign: 'center', marginBottom: '20px', lineHeight: 1.6 }}>
                  💡 Estimado orientativo. El precio final se define en la llamada de proyecto.
                </p>

                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                  <motion.a href={buildWA()} target="_blank" rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: 'linear-gradient(135deg,#25D366,#128C7E)',
                      color: '#fff', padding: '16px 24px', borderRadius: '14px',
                      fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                      boxShadow: '0 8px 28px rgba(37,211,102,0.38)',
                    }}
                  >
                    💬 Enviar presupuesto por WhatsApp
                  </motion.a>
                  <motion.button onClick={reset}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    style={{
                      padding: '16px 24px', borderRadius: '14px',
                      border: '1.5px solid rgba(255,255,255,0.14)',
                      background: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.65)', fontWeight: 600, fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >↺ Recalcular</motion.button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Barra inferior ── */}
        {step < 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '16px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', gap: '12px',
              flexDirection: isMobile ? 'column-reverse' : 'row',
            }}
          >
            {/* Live price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '32px' }}>
              {plan ? (
                <>
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.38)' }}>Estimado actual:</span>
                  <motion.span key={precioTotal}
                    initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.25, type: 'spring', stiffness: 320 }}
                    style={{ fontSize: '22px', fontWeight: 900, color: Y, textShadow: `0 0 22px ${Y}66` }}
                  >{fmtPrecio(precioTotal)}</motion.span>
                  {plan.periodo && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>{plan.periodo}</span>}
                </>
              ) : (
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.22)' }}>
                  {step === 0 ? 'Selecciona un servicio para continuar' : 'Selecciona un plan para ver el estimado'}
                </span>
              )}
            </div>

            {/* Nav buttons */}
            <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
              {step > 0 && (
                <motion.button onClick={goBack}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  style={{
                    padding: '13px 22px', borderRadius: '12px',
                    border: '1.5px solid rgba(255,255,255,0.13)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '14px',
                    cursor: 'pointer', flex: isMobile ? 1 : 'unset',
                  }}
                >← Atrás</motion.button>
              )}
              <motion.button onClick={goNext} disabled={!canNext[step]}
                whileHover={canNext[step] ? { scale: 1.03, y: -1 } : {}}
                whileTap={canNext[step] ? { scale: 0.97 } : {}}
                style={{
                  padding: '13px 28px', borderRadius: '12px',
                  background: canNext[step] ? `linear-gradient(135deg,${P},#9333EA)` : 'rgba(255,255,255,0.07)',
                  color: canNext[step] ? '#fff' : 'rgba(255,255,255,0.28)',
                  fontWeight: 700, fontSize: '14px', border: 'none',
                  cursor: canNext[step] ? 'pointer' : 'not-allowed',
                  boxShadow: canNext[step] ? '0 6px 24px rgba(107,33,168,0.48)' : 'none',
                  flex: isMobile ? 1 : 'unset',
                  transition: 'background 0.2s, box-shadow 0.2s',
                }}
              >
                {step === 2 ? 'Ver resumen →' : 'Siguiente →'}
              </motion.button>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  )
}

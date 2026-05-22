import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { P, PD, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'

// ── Datos alineados con ServiciosTabs ─────────────────────────
const servicios = [
  { id: 'branding', label: 'Branding',          emoji: '🎨', desc: 'Logo, identidad visual y manual de marca' },
  { id: 'web',      label: 'Desarrollo Web',     emoji: '💻', desc: 'Landing page, sitio corporativo o tienda virtual' },
  { id: 'marketing',label: 'Marketing Digital',  emoji: '📱', desc: 'Gestión de redes sociales y pauta digital' },
]

type Plan = { id: string; nombre: string; precio: number; periodo?: string; destacado?: boolean; items: string[] }

const planes: Record<string, Plan[]> = {
  branding: [
    { id: 'basico',    nombre: 'Identidad Básica',   precio: 680000,   items: ['Logo profesional', 'Paleta de colores', 'Tipografías', '2 variaciones del logo', 'Archivos editables'] },
    { id: 'completo',  nombre: 'Branding Completo',  precio: 1200000,  destacado: true, items: ['Todo de Identidad Básica', 'Manual de marca', 'Papelería digital', 'Assets para redes', '5 variaciones'] },
    { id: 'premium',   nombre: 'Premium',             precio: 2000000,  items: ['Todo de Branding Completo', 'Mockups 3D', 'Estrategia de marca', 'Guía de voz y tono', 'Soporte 30 días'] },
  ],
  web: [
    { id: 'basico',    nombre: 'Landing Page',        precio: 1580000,  items: ['Página de aterrizaje', 'Diseño responsive', 'SEO básico', 'Hasta 5 secciones', 'Formulario de contacto'] },
    { id: 'empresarial', nombre: 'Sitio Corporativo', precio: 2130000,  destacado: true, items: ['Sitio corporativo completo', 'Blog integrado', 'Google Analytics', 'Hasta 8 secciones', 'Formulario avanzado'] },
    { id: 'ecommerce', nombre: 'Tienda Virtual',       precio: 3800000,  items: ['E-commerce completo', 'Pasarela de pagos', 'Gestión de inventario', 'Productos ilimitados', 'Panel administrativo'] },
  ],
  marketing: [
    { id: 'social',   nombre: 'Gestión Social',       precio: 800000,   periodo: '/mes', items: ['3 redes sociales', '12 contenidos al mes', 'Diseño incluido', 'Calendario editorial', 'Reporte mensual'] },
    { id: 'pro',      nombre: 'Marketing Pro',         precio: 1500000,  periodo: '/mes', destacado: true, items: ['5 redes sociales', '20 contenidos', 'Pauta básica', 'Reportes semanales', 'Asesor dedicado'] },
    { id: 'full',     nombre: 'Full Service',          precio: 2800000,  periodo: '/mes', items: ['Canales ilimitados', 'Contenido ilimitado', 'Pauta avanzada', 'Mentoría mensual', 'Prioridad absoluta'] },
  ],
}

const extras = [
  { id: 'foto',       label: 'Fotografía de producto',        precio: 350000,  emoji: '📷' },
  { id: 'video',      label: 'Video corporativo (1 min)',      precio: 450000,  emoji: '🎬' },
  { id: 'lanzamiento',label: 'Estrategia de lanzamiento',     precio: 200000,  emoji: '🚀' },
  { id: 'capacitacion',label: 'Capacitación de uso',          precio: 150000,  emoji: '🎓' },
  { id: 'soporte',    label: 'Soporte extendido (3 meses)',    precio: 300000,  emoji: '🛡️' },
  { id: 'pauta',      label: 'Pauta en Meta Ads (primer mes)', precio: 500000,  emoji: '📣' },
]

function fmt(n: number) {
  return '$' + n.toLocaleString('es-CO')
}

const STEPS = ['Servicio', 'Plan', 'Extras', 'Resumen']

export default function Calculadora() {
  const isMobile = useIsMobile()

  const [step,          setStep]          = useState(0)
  const [servicioId,    setServicioId]    = useState<string | null>(null)
  const [planId,        setPlanId]        = useState<string | null>(null)
  const [extrasSelected,setExtrasSelected]= useState<string[]>([])

  const servicio   = servicios.find(s => s.id === servicioId)
  const planLista  = servicioId ? planes[servicioId] : []
  const plan       = planLista.find(p => p.id === planId)
  const extrasObjs = extras.filter(e => extrasSelected.includes(e.id))

  const precioBase   = plan?.precio ?? 0
  const precioExtras = extrasObjs.reduce((a, e) => a + e.precio, 0)
  const precioTotal  = precioBase + precioExtras

  const toggleExtra = (id: string) =>
    setExtrasSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )

  // WhatsApp CTA con resumen
  const buildWA = () => {
    const lines = [
      'Hola, calculé mi presupuesto en la web de Alma 🎯',
      '',
      `📌 Servicio: ${servicio?.label}`,
      `📦 Plan: ${plan?.nombre} — ${fmt(precioBase)}${plan?.periodo ?? ''}`,
      extrasObjs.length ? `➕ Extras:\n${extrasObjs.map(e => `  · ${e.label} (${fmt(e.precio)})`).join('\n')}` : '',
      '',
      `💰 Total estimado: ${fmt(precioTotal)}`,
      '',
      '¿Podemos agendar una llamada para conversarlo?',
    ].filter(Boolean).join('\n')
    return `https://wa.me/573188006436?text=${encodeURIComponent(lines)}`
  }

  const canNext = [
    servicioId !== null,
    planId !== null,
    true, // extras opcional
  ]

  const goNext = () => setStep(s => s + 1)
  const goBack = () => setStep(s => s - 1)
  const reset  = () => { setStep(0); setServicioId(null); setPlanId(null); setExtrasSelected([]) }

  return (
    <section id="calculadora" style={{ background: '#fff', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '52px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
            Calculadora
          </p>
          <h2 style={{ fontSize: isMobile ? 'clamp(26px,7vw,38px)' : 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '14px' }}>
            ¿Cuánto cuesta<br />
            <span style={{ color: P }}>tu proyecto ideal?</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto' }}>
            Calcula tu presupuesto en 3 pasos. Sin compromiso — y si quieres ajustarlo, hablamos.
          </p>
        </motion.div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: isMobile ? '28px' : '44px' }}>
          {STEPS.map((s, i) => {
            const done    = step > i
            const current = step === i
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: isMobile ? '28px' : '34px',
                  height: isMobile ? '28px' : '34px',
                  borderRadius: '50%',
                  background: done ? P : current ? P : '#E5E7EB',
                  color: (done || current) ? '#fff' : '#9CA3AF',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: isMobile ? '11px' : '13px', fontWeight: 800,
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                }}>
                  {done ? '✓' : i + 1}
                </div>
                {!isMobile && (
                  <span style={{ fontSize: '12px', fontWeight: 600, color: (done || current) ? P : '#9CA3AF', marginLeft: '6px', transition: 'color 0.3s ease' }}>
                    {s}
                  </span>
                )}
                {i < STEPS.length - 1 && (
                  <div style={{ width: isMobile ? '24px' : '40px', height: '2px', background: done ? P : '#E5E7EB', margin: isMobile ? '0 6px' : '0 12px', transition: 'background 0.3s ease', flexShrink: 0 }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Card contenedor */}
        <div style={{
          background: '#F9FAFB', borderRadius: '24px',
          border: '1.5px solid #E5E7EB',
          padding: isMobile ? '24px 20px' : '40px 48px',
          minHeight: '340px',
        }}>
          <AnimatePresence mode="wait">

            {/* ── PASO 0: Servicio ── */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>¿Qué necesitas?</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>Selecciona el servicio principal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {servicios.map(s => (
                    <button
                      key={s.id}
                      onClick={() => { setServicioId(s.id); setPlanId(null); setExtrasSelected([]) }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '18px 20px', borderRadius: '16px',
                        border: `2px solid ${servicioId === s.id ? P : '#E5E7EB'}`,
                        background: servicioId === s.id ? `rgba(107,33,168,0.05)` : '#fff',
                        cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease',
                        boxShadow: servicioId === s.id ? `0 4px 20px rgba(107,33,168,0.12)` : 'none',
                      }}
                    >
                      <span style={{ fontSize: '30px', flexShrink: 0 }}>{s.emoji}</span>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: servicioId === s.id ? P : '#111827', marginBottom: '2px' }}>{s.label}</p>
                        <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 400 }}>{s.desc}</p>
                      </div>
                      {servicioId === s.id && (
                        <span style={{ marginLeft: 'auto', color: P, fontSize: '18px', fontWeight: 900 }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── PASO 1: Plan ── */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                  {servicio?.emoji} {servicio?.label} — ¿Qué alcance necesitas?
                </h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>Elige el plan que mejor se adapta a tu proyecto</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px' }}>
                  {planLista.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPlanId(p.id)}
                      style={{
                        padding: '20px 18px', borderRadius: '16px', textAlign: 'left', cursor: 'pointer',
                        border: `2px solid ${planId === p.id ? P : p.destacado ? `${P}44` : '#E5E7EB'}`,
                        background: planId === p.id ? `rgba(107,33,168,0.06)` : '#fff',
                        transition: 'all 0.2s ease', position: 'relative',
                        boxShadow: planId === p.id ? `0 4px 20px rgba(107,33,168,0.14)` : 'none',
                      }}
                    >
                      {p.destacado && (
                        <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: Y, color: '#111', fontSize: '9px', fontWeight: 800, padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>
                          MÁS SOLICITADO
                        </div>
                      )}
                      <p style={{ fontSize: '13px', fontWeight: 700, color: planId === p.id ? P : '#111827', marginBottom: '6px' }}>{p.nombre}</p>
                      <p style={{ fontSize: '20px', fontWeight: 900, color: P, lineHeight: 1, marginBottom: '10px' }}>
                        {fmt(p.precio)}<span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{p.periodo ?? ''}</span>
                      </p>
                      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                        {p.items.map(it => (
                          <li key={it} style={{ fontSize: '11px', color: '#6B7280', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                            <span style={{ color: P, flexShrink: 0, fontWeight: 700 }}>✓</span>{it}
                          </li>
                        ))}
                      </ul>
                      {planId === p.id && (
                        <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '13px', color: P, fontWeight: 700 }}>Seleccionado ✓</div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── PASO 2: Extras ── */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>¿Algo adicional? <span style={{ fontSize: '13px', fontWeight: 400, color: '#9CA3AF' }}>(opcional)</span></h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>Suma servicios complementarios a tu proyecto</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  {extras.map(e => {
                    const sel = extrasSelected.includes(e.id)
                    return (
                      <button
                        key={e.id}
                        onClick={() => toggleExtra(e.id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '16px 18px', borderRadius: '14px', textAlign: 'left',
                          border: `2px solid ${sel ? P : '#E5E7EB'}`,
                          background: sel ? `rgba(107,33,168,0.05)` : '#fff',
                          cursor: 'pointer', transition: 'all 0.2s ease',
                        }}
                      >
                        <span style={{ fontSize: '24px', flexShrink: 0 }}>{e.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: sel ? P : '#111827', marginBottom: '2px' }}>{e.label}</p>
                          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>+ {fmt(e.precio)}</p>
                        </div>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                          border: `2px solid ${sel ? P : '#D1D5DB'}`,
                          background: sel ? P : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease',
                        }}>
                          {sel && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 900 }}>✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* ── PASO 3: Resumen ── */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>Tu presupuesto estimado</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '28px' }}>Comparte este resumen con el equipo de Alma por WhatsApp</p>

                {/* Desglose */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
                  {/* Servicio + plan */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>{servicio?.emoji} {servicio?.label}</p>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{plan?.nombre}</p>
                    </div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: P }}>
                      {fmt(precioBase)}<span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>{plan?.periodo ?? ''}</span>
                    </p>
                  </div>

                  {/* Extras */}
                  {extrasObjs.map(e => (
                    <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <p style={{ fontSize: '13px', color: '#374151' }}>{e.emoji} {e.label}</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>+ {fmt(e.precio)}</p>
                    </div>
                  ))}

                  {/* Total */}
                  <div style={{ borderTop: '2px solid #F3F4F6', marginTop: '14px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Total estimado</p>
                    <motion.p
                      key={precioTotal}
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      style={{ fontSize: '28px', fontWeight: 900, color: P, lineHeight: 1 }}
                    >
                      {fmt(precioTotal)}
                      <span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 400 }}>{plan?.periodo ?? ''}</span>
                    </motion.p>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginBottom: '20px', lineHeight: 1.6 }}>
                  💡 Este es un estimado. El precio final puede variar según los detalles del proyecto.
                </p>

                {/* CTAs */}
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                  <a
                    href={buildWA()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                      background: P, color: '#fff',
                      padding: '15px 24px', borderRadius: '14px',
                      fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = PD)}
                    onMouseLeave={e => (e.currentTarget.style.background = P)}
                  >
                    💬 Enviar presupuesto por WhatsApp
                  </a>
                  <button
                    onClick={reset}
                    style={{
                      padding: '15px 24px', borderRadius: '14px',
                      border: '1.5px solid #E5E7EB', background: '#fff',
                      color: '#6B7280', fontWeight: 600, fontSize: '14px',
                      cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
                  >
                    ↺ Recalcular
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Barra inferior: precio en vivo + botones nav */}
        {step < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
              flexDirection: isMobile ? 'column-reverse' : 'row',
            }}
          >
            {/* Precio acumulado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {plan && (
                <>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Estimado actual:</span>
                  <motion.span
                    key={precioTotal}
                    initial={{ y: -8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{ fontSize: '20px', fontWeight: 900, color: P }}
                  >
                    {fmt(precioTotal)}
                  </motion.span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{plan.periodo ?? ''}</span>
                </>
              )}
            </div>

            {/* Botones */}
            <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
              {step > 0 && (
                <button
                  onClick={goBack}
                  style={{
                    padding: '12px 22px', borderRadius: '12px', border: '1.5px solid #E5E7EB',
                    background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: '14px',
                    cursor: 'pointer', flex: isMobile ? 1 : 'unset',
                  }}
                >
                  ← Atrás
                </button>
              )}
              <button
                onClick={goNext}
                disabled={!canNext[step]}
                style={{
                  padding: '12px 28px', borderRadius: '12px',
                  background: canNext[step] ? P : '#E5E7EB',
                  color: canNext[step] ? '#fff' : '#9CA3AF',
                  fontWeight: 700, fontSize: '14px', border: 'none',
                  cursor: canNext[step] ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                  flex: isMobile ? 1 : 'unset',
                  boxShadow: canNext[step] ? '0 4px 16px rgba(107,33,168,0.25)' : 'none',
                }}
              >
                {step === 2 ? 'Ver resumen →' : 'Siguiente →'}
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </section>
  )
}

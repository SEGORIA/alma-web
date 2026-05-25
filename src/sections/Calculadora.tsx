import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { P, PD, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getPlanes, getExtras, getCategorias, getContactoInfo } from '../lib/db'
import { categoriasEstaticas, planesEstaticos, extrasEstaticos, fmtPrecio, type Plan, type Extra, type ServicioCategoria } from '../data/precios'
import { contactoDefault, type ContactoInfo } from '../data/config'

const STEPS = ['Servicio', 'Plan', 'Extras', 'Resumen']

export default function Calculadora() {
  const isMobile = useIsMobile()

  const [planes,     setPlanes]     = useState<Plan[]>(planesEstaticos)
  const [extras,     setExtras]     = useState<Extra[]>(extrasEstaticos)
  const [servicios,  setServicios]  = useState<ServicioCategoria[]>(categoriasEstaticas)
  const [contacto,   setContacto]   = useState<ContactoInfo>(contactoDefault)

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

  // servicios ya viene del estado dinámico

  const servicio  = servicios.find(s => s.id === servicioId)
  const planLista = servicioId ? planes.filter(p => p.tabId === servicioId) : []
  const plan      = planLista.find(p => (p._id ?? p.nombre) === planId)
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

  const canNext = [
    servicioId !== null,
    planId !== null,
    true,
  ]

  const goNext = () => setStep(s => s + 1)
  const goBack = () => setStep(s => s - 1)
  const reset  = () => { setStep(0); setServicioId(null); setPlanId(null); setExtrasSelected([]) }

  return (
    <section id="calculadora" style={{ background: '#fff', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '52px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>Calculadora</p>
          <h2 style={{ fontSize: isMobile ? 'clamp(26px,7vw,38px)' : 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '14px' }}>
            ¿Cuánto cuesta<br /><span style={{ color: P }}>tu proyecto ideal?</span>
          </h2>
          <p style={{ fontSize: '15px', color: '#6B7280', lineHeight: 1.7, maxWidth: '440px', margin: '0 auto' }}>
            Calcula tu presupuesto en 3 pasos. Sin compromiso.
          </p>
        </motion.div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: isMobile ? '28px' : '44px' }}>
          {STEPS.map((s, i) => {
            const done = step > i; const current = step === i
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: isMobile ? '28px' : '34px', height: isMobile ? '28px' : '34px', borderRadius: '50%', background: (done || current) ? P : '#E5E7EB', color: (done || current) ? '#fff' : '#9CA3AF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '11px' : '13px', fontWeight: 800, transition: 'all 0.3s ease', flexShrink: 0 }}>
                  {done ? '✓' : i + 1}
                </div>
                {!isMobile && <span style={{ fontSize: '12px', fontWeight: 600, color: (done || current) ? P : '#9CA3AF', marginLeft: '6px', transition: 'color 0.3s ease' }}>{s}</span>}
                {i < STEPS.length - 1 && <div style={{ width: isMobile ? '24px' : '40px', height: '2px', background: done ? P : '#E5E7EB', margin: isMobile ? '0 6px' : '0 12px', transition: 'background 0.3s ease', flexShrink: 0 }} />}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div style={{ background: '#F9FAFB', borderRadius: '24px', border: '1.5px solid #E5E7EB', padding: isMobile ? '24px 20px' : '40px 48px', minHeight: '340px' }}>
          <AnimatePresence mode="wait">

            {/* PASO 0: Servicio */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>¿Qué necesitas?</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>Selecciona el servicio principal</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {servicios.map(s => (
                    <button key={s.id} onClick={() => { setServicioId(s.id); setPlanId(null); setExtrasSelected([]) }}
                      style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 20px', borderRadius: '16px', border: `2px solid ${servicioId === s.id ? P : '#E5E7EB'}`, background: servicioId === s.id ? `rgba(107,33,168,0.05)` : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s ease', boxShadow: servicioId === s.id ? `0 4px 20px rgba(107,33,168,0.12)` : 'none' }}
                    >
                      <span style={{ fontSize: '30px', flexShrink: 0 }}>{s.emoji}</span>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 700, color: servicioId === s.id ? P : '#111827', marginBottom: '2px' }}>{s.label}</p>
                        <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 400 }}>{s.desc}</p>
                      </div>
                      {servicioId === s.id && <span style={{ marginLeft: 'auto', color: P, fontSize: '18px', fontWeight: 900 }}>✓</span>}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PASO 1: Plan */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>{servicio?.emoji} {servicio?.label} — ¿Qué alcance necesitas?</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>Elige el plan que mejor se adapta</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px' }}>
                  {planLista.map(p => {
                    const key = p._id ?? p.nombre
                    return (
                      <button key={key} onClick={() => setPlanId(key)}
                        style={{ padding: '20px 18px', borderRadius: '16px', textAlign: 'left', cursor: 'pointer', border: `2px solid ${planId === key ? P : p.destacado ? `${P}44` : '#E5E7EB'}`, background: planId === key ? `rgba(107,33,168,0.06)` : '#fff', transition: 'all 0.2s ease', position: 'relative', boxShadow: planId === key ? `0 4px 20px rgba(107,33,168,0.14)` : 'none' }}
                      >
                        {p.destacado && <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', background: Y, color: '#111', fontSize: '9px', fontWeight: 800, padding: '2px 10px', borderRadius: '20px', whiteSpace: 'nowrap' }}>MÁS SOLICITADO</div>}
                        <p style={{ fontSize: '13px', fontWeight: 700, color: planId === key ? P : '#111827', marginBottom: '6px' }}>{p.nombre}</p>
                        <p style={{ fontSize: '20px', fontWeight: 900, color: P, lineHeight: 1, marginBottom: '10px' }}>
                          {fmtPrecio(p.precioNum)}<span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 500 }}>{p.periodo ?? ''}</span>
                        </p>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                          {p.items.map((it, i) => (
                            <li key={i} style={{ fontSize: '11px', color: '#6B7280', display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                              <span style={{ color: P, flexShrink: 0, fontWeight: 700 }}>✓</span>{it}
                            </li>
                          ))}
                        </ul>
                        {planId === key && <div style={{ marginTop: '12px', textAlign: 'right', fontSize: '13px', color: P, fontWeight: 700 }}>Seleccionado ✓</div>}
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* PASO 2: Extras */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>¿Algo adicional? <span style={{ fontSize: '13px', fontWeight: 400, color: '#9CA3AF' }}>(opcional)</span></h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '24px' }}>Suma servicios complementarios</p>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px' }}>
                  {extras.map(e => {
                    const key = e._id ?? e.label
                    const sel = extrasSelected.includes(key)
                    return (
                      <button key={key} onClick={() => toggleExtra(key)}
                        style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', borderRadius: '14px', textAlign: 'left', border: `2px solid ${sel ? P : '#E5E7EB'}`, background: sel ? `rgba(107,33,168,0.05)` : '#fff', cursor: 'pointer', transition: 'all 0.2s ease' }}
                      >
                        <span style={{ fontSize: '24px', flexShrink: 0 }}>{e.emoji}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: sel ? P : '#111827', marginBottom: '2px' }}>{e.label}</p>
                          <p style={{ fontSize: '12px', color: '#9CA3AF' }}>+ {fmtPrecio(e.precioNum)}</p>
                        </div>
                        <div style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, border: `2px solid ${sel ? P : '#D1D5DB'}`, background: sel ? P : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease' }}>
                          {sel && <span style={{ color: '#fff', fontSize: '13px', fontWeight: 900 }}>✓</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* PASO 3: Resumen */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.3 }}>
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>Tu presupuesto estimado</h3>
                <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '28px' }}>Comparte este resumen por WhatsApp</p>
                <div style={{ background: '#fff', borderRadius: '16px', border: '1.5px solid #E5E7EB', padding: '24px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '14px', borderBottom: '1px solid #F3F4F6', marginBottom: '14px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500, marginBottom: '2px' }}>{servicio?.emoji} {servicio?.label}</p>
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>{plan?.nombre}</p>
                    </div>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: P }}>{fmtPrecio(precioBase)}<span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 400 }}>{plan?.periodo ?? ''}</span></p>
                  </div>
                  {extrasObjs.map(e => (
                    <div key={e._id ?? e.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <p style={{ fontSize: '13px', color: '#374151' }}>{e.emoji} {e.label}</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>+ {fmtPrecio(e.precioNum)}</p>
                    </div>
                  ))}
                  <div style={{ borderTop: '2px solid #F3F4F6', marginTop: '14px', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Total estimado</p>
                    <motion.p key={precioTotal} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
                      style={{ fontSize: '28px', fontWeight: 900, color: P, lineHeight: 1 }}>
                      {fmtPrecio(precioTotal)}<span style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 400 }}>{plan?.periodo ?? ''}</span>
                    </motion.p>
                  </div>
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', marginBottom: '20px', lineHeight: 1.6 }}>
                  💡 Este es un estimado. El precio final puede variar según los detalles del proyecto.
                </p>
                <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                  <a href={buildWA()} target="_blank" rel="noopener noreferrer"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: P, color: '#fff', padding: '15px 24px', borderRadius: '14px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', transition: 'background 0.2s ease' }}
                    onMouseEnter={e => (e.currentTarget.style.background = PD)}
                    onMouseLeave={e => (e.currentTarget.style.background = P)}
                  >
                    💬 Enviar presupuesto por WhatsApp
                  </a>
                  <button onClick={reset}
                    style={{ padding: '15px 24px', borderRadius: '14px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#6B7280' }}
                  >↺ Recalcular</button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Barra inferior */}
        {step < 3 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexDirection: isMobile ? 'column-reverse' : 'row' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {plan && (
                <>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>Estimado actual:</span>
                  <motion.span key={precioTotal} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}
                    style={{ fontSize: '20px', fontWeight: 900, color: P }}>{fmtPrecio(precioTotal)}</motion.span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{plan.periodo ?? ''}</span>
                </>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
              {step > 0 && (
                <button onClick={goBack} style={{ padding: '12px 22px', borderRadius: '12px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', fontWeight: 600, fontSize: '14px', cursor: 'pointer', flex: isMobile ? 1 : 'unset' }}>← Atrás</button>
              )}
              <button onClick={goNext} disabled={!canNext[step]}
                style={{ padding: '12px 28px', borderRadius: '12px', background: canNext[step] ? P : '#E5E7EB', color: canNext[step] ? '#fff' : '#9CA3AF', fontWeight: 700, fontSize: '14px', border: 'none', cursor: canNext[step] ? 'pointer' : 'not-allowed', transition: 'all 0.2s ease', flex: isMobile ? 1 : 'unset', boxShadow: canNext[step] ? '0 4px 16px rgba(107,33,168,0.25)' : 'none' }}
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

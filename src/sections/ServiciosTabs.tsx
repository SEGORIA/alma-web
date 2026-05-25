import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getPlanes, getCategorias, getContactoInfo } from '../lib/db'
import { categoriasEstaticas, planesEstaticos, fmtPrecio, type Plan, type ServicioCategoria } from '../data/precios'
import { contactoDefault } from '../data/config'

function PlanCard({ plan, wa }: { plan: Plan; wa: string }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative', border: `2px solid ${plan.destacado ? P : '#E5E7EB'}`,
        borderRadius: '20px', padding: '32px 24px 24px', background: '#fff',
        boxShadow: plan.destacado ? '0 8px 40px rgba(107,33,168,0.12)' : hover ? '0 8px 24px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {plan.destacado && (
        <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: Y, color: '#111', fontSize: '11px', fontWeight: 800, padding: '4px 16px', borderRadius: '20px', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
          MÁS SOLICITADO
        </div>
      )}
      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>{plan.nombre}</h3>
      <div style={{ marginBottom: '20px' }}>
        <span style={{ fontSize: '34px', fontWeight: 900, color: P, lineHeight: 1 }}>{fmtPrecio(plan.precioNum)}</span>
        {plan.periodo && <span style={{ fontSize: '15px', color: '#6B7280', fontWeight: 500 }}>{plan.periodo}</span>}
      </div>
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px', marginBottom: '24px' }}>
        {plan.items.map((item, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: '#374151' }}>
            <span style={{ color: P, fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>✓</span>{item}
          </li>
        ))}
      </ul>
      <a
        href={wa} target="_blank" rel="noopener noreferrer"
        style={{
          display: 'block', textAlign: 'center',
          background: plan.destacado ? Y : '#F3F4F6',
          color: plan.destacado ? '#111' : P,
          padding: '13px', borderRadius: '12px', fontWeight: 700, fontSize: '14px', textDecoration: 'none', transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = plan.destacado ? '#EAB308' : P; e.currentTarget.style.color = '#fff' }}
        onMouseLeave={e => { e.currentTarget.style.background = plan.destacado ? Y : '#F3F4F6'; e.currentTarget.style.color = plan.destacado ? '#111' : P }}
      >
        Cotizar este plan
      </a>
    </div>
  )
}

export default function ServiciosTabs() {
  const isMobile = useIsMobile()
  const [planes,     setPlanes]     = useState<Plan[]>(planesEstaticos)
  const [categorias, setCategorias] = useState<ServicioCategoria[]>(categoriasEstaticas)
  const [wa,         setWa]         = useState(`https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20cotizar%20un%20proyecto%20con%20Alma`)
  const [active,     setActive]     = useState('web')

  useEffect(() => {
    getPlanes().then(setPlanes)
    getCategorias().then(cats => {
      setCategorias(cats)
      if (cats.length > 0) setActive(cats[0].id)
    })
    getContactoInfo().then(c =>
      setWa(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20cotizar%20un%20proyecto%20con%20Alma`)
    )
  }, [])

  const planesActivos = planes.filter(p => p.tabId === active)

  return (
    <section style={{ background: '#fff', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '48px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Servicios & Tarifas</p>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Precios transparentes,{' '}<span style={{ color: P }}>resultados reales</span>
          </h2>
        </motion.div>

        {/* Tabs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: isMobile ? '24px' : '48px', flexWrap: 'wrap' }}>
          {categorias.map(t => (
            <button
              key={t.id} onClick={() => setActive(t.id)}
              style={{
                padding: isMobile ? '9px 18px' : '10px 24px', borderRadius: '10px',
                fontWeight: 600, fontSize: isMobile ? '13px' : '14px',
                border: `2px solid ${active === t.id ? P : '#E5E7EB'}`,
                background: active === t.id ? P : '#fff',
                color: active === t.id ? '#fff' : '#6B7280',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {t.emoji} {t.label}
            </button>
          ))}
        </div>

        {/* Plans */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: isMobile ? '16px' : '24px',
            }}
          >
            {planesActivos.map(plan => <PlanCard key={plan._id ?? plan.nombre} plan={plan} wa={wa} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

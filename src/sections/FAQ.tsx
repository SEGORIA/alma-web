import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const P = '#6B21A8'
const Y = '#FACC15'

const faqs = [
  { q: '¿Cuánto tiempo tarda la entrega de un proyecto web?', a: 'Una landing page tarda entre 5 y 7 días hábiles. Un sitio corporativo completo entre 10 y 15 días. Una tienda virtual entre 15 y 25 días hábiles.' },
  { q: '¿Puedo hacer cambios después de recibir el proyecto?', a: 'Sí. Todos nuestros planes incluyen una ronda de revisiones sin costo adicional. Cambios fuera del alcance inicial tienen un costo según el trabajo requerido.' },
  { q: '¿Trabajan con negocios de cualquier ciudad o país?', a: 'Trabajamos 100% de forma remota y atendemos clientes en toda Colombia, Latinoamérica y el mundo de habla hispana.' },
  { q: '¿Qué necesito para comenzar un proyecto de branding?', a: 'Solo un brief básico con tus referencias, colores que te gustan y la esencia de tu marca. Nosotros te guiamos en todo el proceso creativo.' },
  { q: '¿El hosting y dominio están incluidos en los planes web?', a: 'No están incluidos, pero te asesoramos para configurarlos correctamente. El costo promedio es entre $80.000 y $120.000 anuales.' },
  { q: '¿Cómo es el proceso de trabajo con Alma?', a: 'Briefing → Propuesta creativa → Desarrollo → Revisión → Entrega final. Tendrás acceso directo a tu asesor vía WhatsApp durante todo el proceso.' },
]

function FAQItem({ faq, idx }: { faq: typeof faqs[0]; idx: number }) {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: idx * 0.05 }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 24px',
          background: open ? '#F5F3FF' : '#fff',
          border: `1px solid ${open ? '#DDD6FE' : '#E5E7EB'}`,
          borderRadius: open ? '14px 14px 0 0' : '14px',
          cursor: 'pointer', textAlign: 'left',
          transition: 'all 0.2s ease',
        }}
      >
        <span style={{ fontWeight: 700, fontSize: '15px', color: '#111827', paddingRight: '16px' }}>{faq.q}</span>
        <span style={{
          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? Y : '#F3F4F6',
          color: open ? '#111' : P,
          fontWeight: 900, fontSize: '18px', lineHeight: 1,
          transition: 'all 0.2s ease',
        }}>
          {open ? '−' : '+'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              padding: '16px 24px 20px',
              background: '#F5F3FF',
              border: '1px solid #DDD6FE', borderTop: 'none',
              borderRadius: '0 0 14px 14px',
              fontSize: '15px', color: '#4B5563', lineHeight: 1.7,
            }}>
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQ() {
  return (
    <section style={{ background: '#fff', padding: '100px 24px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Preguntas Frecuentes
          </p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>
            Resolvemos tus{' '}
            <span style={{ color: P }}>dudas</span>
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((f, i) => <FAQItem key={f.q} faq={f} idx={i} />)}
        </div>
      </div>
    </section>
  )
}

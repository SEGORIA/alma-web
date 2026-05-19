import { motion } from 'framer-motion'

const PD = '#581C87'
const Y = '#FACC15'

const mockups = [
  { titulo: 'Guía Instagram con IA', sub: 'E-book gratuito', g: 'linear-gradient(135deg,#A855F7,#EC4899)', h: 180, cta: true },
  { titulo: 'Plantillas Notion', sub: 'Organización de marca', g: 'linear-gradient(135deg,#FACC15,#F59E0B)', h: 120, cta: false },
  { titulo: 'Canva Pro Templates', sub: 'Pack de diseño', g: 'linear-gradient(135deg,#6B21A8,#C026D3)', h: 100, cta: false },
]

export default function Academia() {
  return (
    <section style={{ background: PD, padding: '100px 24px' }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap',
      }}>
        {/* Left: mockup cards */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: '1 1 320px', display: 'flex', gap: '14px', alignItems: 'flex-end' }}
        >
          {mockups.map((m, i) => (
            <div
              key={m.titulo}
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '14px', padding: '16px',
                border: '1px solid rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                marginBottom: i === 0 ? 0 : i === 1 ? '24px' : '48px',
              }}
            >
              <div style={{ width: '100%', height: m.h, background: m.g, borderRadius: '10px', marginBottom: '12px' }} />
              <p style={{ fontWeight: 700, color: '#fff', fontSize: '13px', marginBottom: '4px' }}>{m.titulo}</p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>{m.sub}</p>
              {m.cta && (
                <div style={{
                  marginTop: '10px', background: Y, borderRadius: '6px',
                  padding: '6px 10px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#111',
                }}>
                  Descargar →
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* Right: text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: '1 1 320px', maxWidth: '460px' }}
        >
          <p style={{ color: Y, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Academia Alma
          </p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '20px' }}>
            Lleva el control de tu marca: Aprende con Alma
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '36px' }}>
            Recursos digitales, guías prácticas, plantillas y formación estratégica para que tu marca crezca con intención y creatividad.
          </p>
          <a
            href="https://edu.almaagenciacreativa.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: Y, color: '#111',
              padding: '16px 32px', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px', textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#EAB308')}
            onMouseLeave={e => (e.currentTarget.style.background = Y)}
          >
            Explorar la Academia →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

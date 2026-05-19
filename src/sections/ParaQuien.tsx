import { motion } from 'framer-motion'

const GRAD = `linear-gradient(135deg,#8B35E8,#C026D3)`

const clientes = [
  {
    emoji: '🏥',
    titulo: 'Salud y Bienestar',
    sub: 'Clínicas, consultorios, gimnasios, spas, centros de bienestar.',
    items: ['Recordatorios de citas', 'Confirmaciones automáticas', 'Seguimiento a pacientes', 'Campañas preventivas'],
    color: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.25)',
  },
  {
    emoji: '🏢',
    titulo: 'Real Estate',
    sub: 'Inmobiliarias, brokers, constructoras y asesores independientes.',
    items: ['Captación y nutrición de leads', 'Envío de fichas y proyectos', 'Agendamiento de visitas', 'Seguimiento automático'],
    color: 'rgba(139,53,232,0.12)',
    border: 'rgba(139,53,232,0.25)',
  },
  {
    emoji: '⭐',
    titulo: 'Marcas Personales',
    sub: 'Coaches, consultores, speakers, creadores y profesionales.',
    items: ['Lanzamientos y anuncios', 'Secuencias automatizadas', 'Construcción de comunidad', 'Relación cercana y auténtica'],
    color: 'rgba(192,38,211,0.12)',
    border: 'rgba(192,38,211,0.25)',
  },
  {
    emoji: '✨',
    titulo: 'Proyectos Personalizados',
    sub: 'Soluciones a la medida para proyectos con necesidades únicas.',
    items: ['Flujos personalizados', 'Integraciones a medida', 'Estrategia y acompañamiento', 'Resultados medibles'],
    color: 'rgba(139,53,232,0.08)',
    border: 'rgba(139,53,232,0.2)',
  },
]

export default function ParaQuien() {
  return (
    <section style={{
      position: 'relative', zIndex: 1,
      padding: '100px 24px',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p style={{
            color: '#A855F7', fontSize: '12px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Para quién es Alma
          </p>
          <h2 style={{
            fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900,
            letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            Diseñado para{' '}
            <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              tu industria
            </span>
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '20px',
        }}>
          {clientes.map((c, i) => (
            <motion.div
              key={c.titulo}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: c.color,
                border: `1px solid ${c.border}`,
                borderRadius: '20px',
                padding: '32px 28px',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '16px' }}>{c.emoji}</div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '8px' }}>{c.titulo}</h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px', lineHeight: 1.55 }}>
                {c.sub}
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {c.items.map(item => (
                  <li key={item} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    fontSize: '13px', color: 'rgba(255,255,255,0.7)',
                  }}>
                    <span style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: GRAD, flexShrink: 0,
                    }} />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

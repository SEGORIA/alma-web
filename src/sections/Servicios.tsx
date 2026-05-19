import { motion } from 'framer-motion'

const V = '#8B35E8'
const GRAD = `linear-gradient(135deg,${V},#C026D3)`

const servicios = [
  {
    icon: '👥',
    titulo: 'Contactos',
    desc: 'Importa y organiza tus bases de datos. Campos personalizados, etiquetas y más.',
  },
  {
    icon: '🎯',
    titulo: 'Segmentación',
    desc: 'Filtra y crea audiencias inteligentes según comportamiento, datos e intereses.',
  },
  {
    icon: '📤',
    titulo: 'Campañas',
    desc: 'Crea, personaliza y programa campañas masivas o segmentadas con plantillas dinámicas.',
  },
  {
    icon: '🤖',
    titulo: 'Automatizaciones',
    desc: 'Flujos de conversación automatizados con triggers, respuestas rápidas y acciones inteligentes.',
  },
  {
    icon: '💬',
    titulo: 'Conversaciones',
    desc: 'Gestiona y responde todas las conversaciones desde una bandeja colaborativa y ordenada.',
  },
  {
    icon: '📊',
    titulo: 'Reportes',
    desc: 'Mide enviados, entregados, leídos, respondidos y conversiones en un solo lugar.',
  },
  {
    icon: '🕐',
    titulo: 'Historial',
    desc: 'Accede al historial completo de cada contacto e interacción en un solo lugar.',
  },
  {
    icon: '🔗',
    titulo: 'Integraciones',
    desc: 'Conecta con CRM, Calendarios, Formularios y otras herramientas clave para tu negocio.',
  },
]

export default function Servicios() {
  return (
    <section id="servicios" style={{
      position: 'relative', zIndex: 1,
      padding: '100px 24px',
      background: 'rgba(255,255,255,0.02)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header */}
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
            Funcionalidades principales
          </p>
          <h2 style={{
            fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900,
            letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '16px',
          }}>
            Todo lo que necesitas{' '}
            <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              en un solo lugar
            </span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', lineHeight: 1.6, maxWidth: '520px', margin: '0 auto' }}>
            Automatiza, gestiona y optimiza tu comunicación con clientes a través de WhatsApp.
          </p>
        </motion.div>

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px',
        }}>
          {servicios.map((s, i) => (
            <motion.div
              key={s.titulo}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, borderColor: 'rgba(139,53,232,0.4)' }}
              style={{
                background: '#13132a',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '16px',
                padding: '28px 24px',
                transition: 'border-color 0.2s ease',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '14px' }}>{s.icon}</div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '8px', color: '#fff' }}>
                {s.titulo}
              </h3>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

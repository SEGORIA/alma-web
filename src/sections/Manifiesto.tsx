import { motion } from 'framer-motion'
import { useState } from 'react'
import { P, Y } from '../tokens'

const recursos = [
  { n: '01', titulo: 'Humanización', desc: 'Mensajes con alma que generan conexiones reales y duraderas con cada persona.' },
  { n: '02', titulo: 'Estrategia', desc: 'Cada acción tiene un propósito medible y un resultado esperado desde el inicio.' },
  { n: '03', titulo: 'Creatividad', desc: 'Diseño visual y narrativo que inspira, diferencia e impacta en cada punto de contacto.' },
  { n: '04', titulo: 'Resultados', desc: 'Decisiones basadas en datos reales para escalar tu marca de forma sostenible.' },
  { n: '05', titulo: 'Autenticidad', desc: 'Comunicación coherente, cercana y alineada con la esencia real de tu marca.' },
  { n: '06', titulo: 'Impacto', desc: 'Transformamos la atención de tu audiencia en conversiones y relaciones de valor.' },
]

function RecursoCard({ r, i }: { r: typeof recursos[0]; i: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? P : '#fff',
        border: `1px solid ${hovered ? P : '#E5E7EB'}`,
        borderRadius: '18px', padding: '32px 28px',
        cursor: 'default',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 60px rgba(107,33,168,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
      }}
    >
      <p style={{
        fontSize: '42px', fontWeight: 900, lineHeight: 1,
        color: hovered ? Y : '#E5E7EB',
        marginBottom: '16px', transition: 'color 0.3s ease',
      }}>
        {r.n}
      </p>
      <h3 style={{
        fontSize: '18px', fontWeight: 800,
        color: hovered ? '#fff' : '#111827',
        marginBottom: '10px', transition: 'color 0.3s ease',
      }}>
        {r.titulo}
      </h3>
      <p style={{
        fontSize: '14px', lineHeight: 1.65,
        color: hovered ? 'rgba(255,255,255,0.8)' : '#6B7280',
        transition: 'color 0.3s ease',
      }}>
        {r.desc}
      </p>
    </motion.div>
  )
}

export default function Manifiesto() {
  return (
    <section style={{ background: '#F3F4F6', padding: '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            El Manifiesto Alma
          </p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Los 6 recursos que definen{' '}
            <span style={{ color: P }}>nuestra agencia</span>
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
        }}>
          {recursos.map((r, i) => <RecursoCard key={r.n} r={r} i={i} />)}
        </div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { useState } from 'react'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'

const recursos = [
  { n: '01', titulo: 'Humanización', desc: 'Mensajes con alma que generan conexiones reales y duraderas con cada persona. Porque detrás de cada marca hay personas que merecen ser escuchadas.', featured: true },
  { n: '02', titulo: 'Estrategia',    desc: 'Cada acción tiene un propósito medible y un resultado esperado desde el inicio.' },
  { n: '03', titulo: 'Creatividad',   desc: 'Diseño visual y narrativo que inspira, diferencia e impacta en cada punto de contacto.' },
  { n: '04', titulo: 'Resultados',    desc: 'Decisiones basadas en datos reales para escalar tu marca de forma sostenible.' },
  { n: '05', titulo: 'Autenticidad',  desc: 'Comunicación coherente, cercana y alineada con la esencia real de tu marca.' },
  { n: '06', titulo: 'Impacto',       desc: 'Transformamos la atención de tu audiencia en conversiones y relaciones de valor.' },
]

function RecursoCard({ r, i, isMobile }: { r: typeof recursos[0]; i: number; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false)

  if (r.featured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.6, delay: 0 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          gridColumn: isMobile ? '1 / -1' : 'span 2',
          background: hovered ? P : `linear-gradient(135deg, ${P} 0%, #9333EA 100%)`,
          borderRadius: '20px',
          padding: isMobile ? '28px 24px' : '40px 36px',
          cursor: 'default', position: 'relative', overflow: 'hidden',
          boxShadow: hovered ? '0 28px 80px rgba(107,33,168,0.35)' : '0 8px 32px rgba(107,33,168,0.2)',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          transition: 'all 0.3s ease',
        }}
      >
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', right: '80px', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(250,204,21,0.08)', pointerEvents: 'none' }} />

        <p style={{ fontSize: isMobile ? '40px' : '52px', fontWeight: 900, lineHeight: 1, color: Y, marginBottom: '16px' }}>{r.n}</p>
        <h3 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 900, color: '#fff', marginBottom: '10px' }}>{r.titulo}</h3>
        <p style={{ fontSize: '15px', lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', maxWidth: '480px' }}>{r.desc}</p>
        <div style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '8px', background: Y, color: '#111', padding: '8px 18px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
          ✦ Nuestra esencia
        </div>
      </motion.div>
    )
  }

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
        borderRadius: '18px',
        padding: isMobile ? '24px 20px' : '32px 28px',
        cursor: 'default',
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 60px rgba(107,33,168,0.25)' : '0 2px 8px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
      }}
    >
      <p style={{ fontSize: '42px', fontWeight: 900, lineHeight: 1, color: hovered ? Y : '#E5E7EB', marginBottom: '14px', transition: 'color 0.3s ease' }}>{r.n}</p>
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: hovered ? '#fff' : '#111827', marginBottom: '10px', transition: 'color 0.3s ease' }}>{r.titulo}</h3>
      <p style={{ fontSize: '14px', lineHeight: 1.65, color: hovered ? 'rgba(255,255,255,0.8)' : '#6B7280', transition: 'color 0.3s ease' }}>{r.desc}</p>
    </motion.div>
  )
}

export default function Manifiesto() {
  const isMobile = useIsMobile()

  return (
    <section style={{ background: '#F3F4F6', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '40px' : '64px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            El Manifiesto Alma
          </p>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Los 6 recursos que definen{' '}
            <span style={{ color: P }}>nuestra agencia</span>
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: isMobile ? '14px' : '20px',
        }}>
          {recursos.map((r, i) => <RecursoCard key={r.n} r={r} i={i} isMobile={isMobile} />)}
        </div>
      </div>
    </section>
  )
}

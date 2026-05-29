import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getTestimonios } from '../lib/db'
import { testimoniosEstaticos } from '../data/config'
import type { Testimonio } from '../data/config'

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={Y}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

function TestimonioCard({ t }: { t: Testimonio }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #F3F4F6', borderRadius: '20px', padding: '24px',
      width: '300px', flexShrink: 0, boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: '14px',
    }}>
      <div style={{ display: 'flex', gap: '3px' }}>
        {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
      </div>
      <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#374151', flex: 1, fontStyle: 'italic' }}>"{t.texto}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.12)' }}>
          {t.iniciales}
        </div>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{t.nombre}</p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '1px' }}>{t.rol} · {t.empresa}</p>
        </div>
      </div>
    </div>
  )
}

function MarqueeRow({ items, direction }: { items: Testimonio[]; direction: 'left' | 'right' }) {
  if (items.length === 0) return null
  const doubled  = [...items, ...items]
  const animFrom = direction === 'left' ? '0%'   : '-50%'
  const animTo   = direction === 'left' ? '-50%' : '0%'

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <motion.div
        animate={{ x: [animFrom, animTo] }}
        transition={{ duration: direction === 'left' ? 32 : 38, ease: 'linear', repeat: Infinity }}
        style={{ display: 'flex', gap: '16px', width: 'max-content', cursor: 'default', willChange: 'transform' }}
      >
        {doubled.map((t, i) => <TestimonioCard key={`${t._id ?? t.nombre}-${i}`} t={t} />)}
      </motion.div>
    </div>
  )
}

export default function Testimonios() {
  const isMobile = useIsMobile()
  const [testimonios, setTestimonios] = useState<Testimonio[]>(testimoniosEstaticos)

  useEffect(() => {
    getTestimonios().then(setTestimonios)
  }, [])

  const fila1 = testimonios.filter(t => t.fila === 1)
  const fila2 = testimonios.filter(t => t.fila === 2)

  return (
    <section style={{ background: '#F9FAFB', padding: isMobile ? '60px 0' : '100px 0', overflow: 'hidden' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '56px', padding: '0 24px' }}
      >
        <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Testimonios</p>
        <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1 }}>
          Lo que dicen nuestros <span style={{ color: P }}>clientes</span>
        </h2>
        {!isMobile && (
          <p style={{ color: '#6B7280', fontSize: '16px', marginTop: '16px', maxWidth: '440px', margin: '16px auto 0', lineHeight: 1.65 }}>
            Más de 150 proyectos entregados y una comunidad de clientes que confían en Alma para crecer.
          </p>
        )}
      </motion.div>

      {/* Filas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '14px' : '20px' }}>
        <MarqueeRow items={fila1.length > 0 ? fila1 : testimonios} direction="left" />
        {!isMobile && fila2.length > 0 && <MarqueeRow items={fila2} direction="right" />}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}
        style={{ display: 'flex', justifyContent: 'center', marginTop: isMobile ? '32px' : '56px', padding: '0 24px' }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px', background: '#fff',
          border: '1px solid #E5E7EB', borderRadius: '20px', padding: '12px 24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>4.9 / 5</span>
          <span style={{ width: '1px', height: '16px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>+150 proyectos entregados</span>
        </div>
      </motion.div>
    </section>
  )
}

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getPasos } from '../lib/db'
import { pasosEstaticos } from '../data/contenido'
import type { PasoItem } from '../data/contenido'

function PasoCard({ paso, index, isMobile }: { paso: PasoItem; index: number; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
        borderRadius: '20px',
        padding: isMobile ? '20px 18px' : '28px 24px',
        position: 'relative',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 56px rgba(107,33,168,0.18)' : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      <p style={{
        fontSize: isMobile ? '56px' : '72px', fontWeight: 900, lineHeight: 1,
        color: hovered ? 'rgba(107,33,168,0.06)' : '#F3F4F6',
        position: 'absolute', top: '10px', right: '14px',
        transition: 'color 0.3s ease', userSelect: 'none', letterSpacing: '-3px',
      }}>{paso.n}</p>

      <div style={{
        width: isMobile ? '44px' : '52px', height: isMobile ? '44px' : '52px',
        borderRadius: '14px',
        background: hovered ? paso.color : '#F5F3FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: isMobile ? '12px' : '18px',
        transition: 'background 0.3s ease',
        boxShadow: hovered ? '0 8px 20px rgba(107,33,168,0.25)' : 'none',
      }}>
        <span style={{ fontSize: isMobile ? '20px' : '24px' }}>{paso.icon}</span>
      </div>

      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: hovered ? `${P}15` : '#F9FAFB',
        border: `1px solid ${hovered ? P : '#E5E7EB'}`,
        borderRadius: '20px', padding: '2px 10px', marginBottom: '8px',
        transition: 'all 0.3s ease',
      }}>
        <span style={{ fontSize: '10px', fontWeight: 700, color: hovered ? P : '#9CA3AF', letterSpacing: '1px', textTransform: 'uppercase', transition: 'color 0.3s ease' }}>
          Paso {paso.n}
        </span>
      </div>

      <h3 style={{ fontSize: isMobile ? '16px' : '19px', fontWeight: 800, color: hovered ? P : '#111827', marginBottom: '8px', transition: 'color 0.3s ease' }}>{paso.titulo}</h3>
      <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#6B7280' }}>{paso.desc}</p>
    </motion.div>
  )
}

export default function Proceso() {
  const isMobile = useIsMobile()
  const [pasos, setPasos] = useState<PasoItem[]>(pasosEstaticos)

  useEffect(() => {
    getPasos().then(setPasos)
  }, [])

  return (
    <section style={{ background: '#F9FAFB', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '64px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            ¿Cómo trabajamos?
          </p>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Un método probado para{' '}<span style={{ color: P }}>resultados reales</span>
          </h2>
          {!isMobile && (
            <p style={{ color: '#6B7280', fontSize: '16px', maxWidth: '480px', margin: '16px auto 0', lineHeight: 1.65 }}>
              Cada proyecto sigue etapas que garantizan claridad, calidad y resultados medibles desde el primer día.
            </p>
          )}
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? '12px' : '24px',
        }}>
          {pasos.map((paso, i) => (
            <PasoCard key={paso._id ?? paso.n} paso={paso} index={i} isMobile={isMobile} />
          ))}
        </div>

        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              marginTop: '56px', background: '#fff', border: '1px solid #E5E7EB',
              borderRadius: '20px', padding: '28px 40px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: '24px', boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
            }}
          >
            {[
              { icon: '⚡', label: 'Tiempo promedio de entrega',             value: '3–6 semanas' },
              { icon: '🔄', label: 'Revisiones incluidas por etapa',         value: '2 rondas' },
              { icon: '📲', label: 'Comunicación directa con tu asesor',     value: 'WhatsApp 24/7' },
              { icon: '✅', label: 'Clientes satisfechos con el proceso',    value: '98%' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 180px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, background: '#F5F3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
                  {stat.icon}
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: P }}>{stat.value}</p>
                  <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px', fontWeight: 500 }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: isMobile ? '32px' : '48px' }}
        >
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '12px' }}>¿Listo para comenzar? El primer paso es tuyo.</p>
          <a
            href="#contacto"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: P, fontWeight: 700, fontSize: '15px', textDecoration: 'none', borderBottom: `2px solid ${Y}`, paddingBottom: '2px', transition: 'opacity 0.2s ease' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            Agendar reunión inicial →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

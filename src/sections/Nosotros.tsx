import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { P, WA_PROYECTO } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getEquipo } from '../lib/db'
import { equipoEstatico } from '../data/contenido'
import type { EquipoMember } from '../data/contenido'

const valores = [
  { icon: '🎯', label: 'Orientados a resultados' },
  { icon: '💬', label: 'Comunicación directa' },
  { icon: '🔍', label: 'Atención al detalle' },
  { icon: '🚀', label: 'Entrega a tiempo' },
  { icon: '❤️', label: 'Trabajo con propósito' },
]

function TeamCard({ m, index }: { m: EquipoMember; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
        borderRadius: '20px',
        padding: '28px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 20px 56px rgba(107,33,168,0.14)' : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '88px', height: '88px', borderRadius: '50%',
        background: m.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', fontWeight: 900, color: '#fff',
        marginBottom: '20px', flexShrink: 0,
        boxShadow: hovered ? '0 12px 32px rgba(107,33,168,0.25)' : '0 4px 16px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.3s ease',
        position: 'relative',
      }}>
        {/* Emoji badge */}
        <span style={{ fontSize: '28px' }}>{m.emoji}</span>
        <div style={{
          position: 'absolute', bottom: '-2px', right: '-2px',
          width: '28px', height: '28px', borderRadius: '50%',
          background: '#fff', border: `2px solid ${hovered ? P : '#E5E7EB'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 900, color: P,
          transition: 'border-color 0.3s ease',
        }}>
          {m.iniciales[0]}
        </div>
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{m.nombre}</h3>
      <p style={{ fontSize: '12px', fontWeight: 700, color: P, marginBottom: '12px', letterSpacing: '0.5px' }}>{m.rol}</p>
      <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#6B7280' }}>{m.desc}</p>
    </motion.div>
  )
}

export default function Nosotros() {
  const isMobile = useIsMobile()
  const [equipo, setEquipo] = useState<EquipoMember[]>(equipoEstatico)

  useEffect(() => {
    getEquipo().then(setEquipo)
  }, [])

  return (
    <section id="nosotros" style={{ background: '#fff', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* ── Header 2 columnas ── */}
        <div style={{
          display: 'flex', gap: isMobile ? '32px' : '80px',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          marginBottom: isMobile ? '48px' : '72px',
        }}>
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6 }}
            style={{ flex: '1 1 320px' }}
          >
            <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Quiénes somos
            </p>
            <h2 style={{ fontSize: isMobile ? 'clamp(28px,7vw,40px)' : 'clamp(32px,4vw,52px)', fontWeight: 900, color: '#111827', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '20px' }}>
              Somos Alma,<br />
              <span style={{ color: P }}>somos tu equipo.</span>
            </h2>
            <p style={{ fontSize: isMobile ? '15px' : '17px', lineHeight: 1.7, color: '#4B5563', marginBottom: '28px' }}>
              Somos una agencia creativa nacida en Manizales con una misión clara: convertir cada marca en una experiencia que conecta, emociona y genera resultados reales.
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.7, color: '#4B5563', marginBottom: '32px' }}>
              No somos intermediarios ni plantillas. Cada proyecto tiene un equipo dedicado, un proceso claro y una obsesión por los detalles que marcan la diferencia.
            </p>
            <a
              href={WA_PROYECTO}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: P, color: '#fff',
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: 700, fontSize: '14px', textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#581C87')}
              onMouseLeave={e => (e.currentTarget.style.background = P)}
            >
              Trabaja con nosotros →
            </a>
          </motion.div>

          {/* Right — stats */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              flex: '0 0 auto',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              width: isMobile ? '100%' : '340px',
            }}
          >
            {[
              { n: '6+',   label: 'Años de experiencia',     color: `linear-gradient(135deg,${P},#9333EA)` },
              { n: '150+', label: 'Proyectos entregados',    color: 'linear-gradient(135deg,#E11D48,#F43F5E)' },
              { n: '98%',  label: 'Clientes satisfechos',    color: 'linear-gradient(135deg,#059669,#34D399)' },
              { n: '3',    label: 'Servicios especializados', color: 'linear-gradient(135deg,#F59E0B,#FBBF24)' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                style={{
                  background: s.color,
                  borderRadius: '16px',
                  padding: '20px 16px',
                  textAlign: 'center',
                }}
              >
                <p style={{ fontSize: '32px', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', marginTop: '6px', fontWeight: 600, lineHeight: 1.3 }}>{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Equipo ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '40px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>El equipo</p>
          <h3 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>
            Las personas detrás de <span style={{ color: P }}>cada proyecto</span>
          </h3>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          maxWidth: isMobile ? '100%' : '960px',
          margin: '0 auto',
          gap: isMobile ? '14px' : '20px',
          marginBottom: isMobile ? '40px' : '64px',
        }}>
          {equipo.map((m, i) => <TeamCard key={m._id ?? m.nombre} m={m} index={i} />)}
        </div>

        {/* ── Valores / Pills ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            background: '#F9FAFB', borderRadius: '20px',
            padding: isMobile ? '24px 20px' : '28px 40px',
            display: 'flex', alignItems: 'center',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '16px' : '0',
          }}
        >
          <p style={{
            fontSize: '13px', fontWeight: 700, color: '#9CA3AF',
            letterSpacing: '1px', textTransform: 'uppercase',
            marginRight: isMobile ? 0 : '32px',
            flexShrink: 0,
            textAlign: isMobile ? 'center' : 'left',
          }}>
            Nos mueve
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
            {valores.map(v => (
              <div key={v.label} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#fff', border: '1px solid #E5E7EB',
                borderRadius: '20px', padding: '8px 16px',
                fontSize: '13px', fontWeight: 600, color: '#374151',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}>
                <span>{v.icon}</span> {v.label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

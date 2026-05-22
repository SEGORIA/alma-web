import { useState } from 'react'
import { motion } from 'framer-motion'
import { P, Y } from '../tokens'

const pasos = [
  {
    n: '01',
    icon: '🎧',
    titulo: 'Escuchamos',
    desc: 'Comprendemos las necesidades, problemáticas y deseos de tu marca antes de proponer cualquier solución.',
    color: `linear-gradient(135deg, ${P}, #9333EA)`,
  },
  {
    n: '02',
    icon: '💡',
    titulo: 'Ideamos',
    desc: 'Realizamos un diagnóstico detallado de la marca y construimos un plan de trabajo personalizado.',
    color: 'linear-gradient(135deg, #7C3AED, #A855F7)',
  },
  {
    n: '03',
    icon: '🎯',
    titulo: 'Atraemos',
    desc: 'Diseñamos contenido memorable y en tendencia para conectar tus servicios con el cliente y posicionar tu marca.',
    color: 'linear-gradient(135deg, #9333EA, #C026D3)',
  },
  {
    n: '04',
    icon: '💰',
    titulo: 'Convertimos',
    desc: 'Pasamos de seguidores a clientes, materializando los objetivos de la marca en resultados concretos.',
    color: `linear-gradient(135deg, ${P}, #7C3AED)`,
  },
  {
    n: '05',
    icon: '🤝',
    titulo: 'Fidelizamos',
    desc: 'Consolidamos relaciones duraderas entre la marca y sus clientes mediante visibilidad y comunicación permanente.',
    color: 'linear-gradient(135deg, #6D28D9, #9333EA)',
  },
  {
    n: '06',
    icon: '📊',
    titulo: 'Evidenciamos',
    desc: 'Mostramos la evolución real: posicionamiento, nuevos clientes y seguidores a través de reportes de métricas.',
    color: 'linear-gradient(135deg, #7C3AED, #6B21A8)',
  },
]

function PasoCard({ paso, index }: { paso: typeof pasos[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#fff' : '#fff',
        border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
        borderRadius: '20px',
        padding: '28px 24px',
        position: 'relative',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 20px 56px rgba(107,33,168,0.18)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
      }}
    >
      {/* Number watermark */}
      <p style={{
        fontSize: '72px', fontWeight: 900, lineHeight: 1,
        color: hovered ? `rgba(107,33,168,0.06)` : '#F3F4F6',
        position: 'absolute', top: '12px', right: '16px',
        transition: 'color 0.3s ease',
        userSelect: 'none',
        letterSpacing: '-3px',
      }}>
        {paso.n}
      </p>

      {/* Icon circle */}
      <div style={{
        width: '52px', height: '52px', borderRadius: '14px',
        background: hovered ? paso.color : '#F5F3FF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '18px',
        transition: 'background 0.3s ease',
        boxShadow: hovered ? '0 8px 20px rgba(107,33,168,0.25)' : 'none',
      }}>
        <span style={{ fontSize: '24px' }}>{paso.icon}</span>
      </div>

      {/* Step number badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        background: hovered ? `${P}15` : '#F9FAFB',
        border: `1px solid ${hovered ? P : '#E5E7EB'}`,
        borderRadius: '20px', padding: '2px 10px',
        marginBottom: '10px',
        transition: 'all 0.3s ease',
      }}>
        <span style={{
          fontSize: '10px', fontWeight: 700,
          color: hovered ? P : '#9CA3AF',
          letterSpacing: '1px', textTransform: 'uppercase',
          transition: 'color 0.3s ease',
        }}>
          Paso {paso.n}
        </span>
      </div>

      <h3 style={{
        fontSize: '19px', fontWeight: 800,
        color: hovered ? P : '#111827',
        marginBottom: '10px',
        transition: 'color 0.3s ease',
      }}>
        {paso.titulo}
      </h3>
      <p style={{
        fontSize: '14px', lineHeight: 1.7,
        color: '#6B7280',
      }}>
        {paso.desc}
      </p>
    </motion.div>
  )
}

export default function Proceso() {
  return (
    <section style={{ background: '#F9FAFB', padding: '100px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '64px' }}
        >
          <p style={{
            color: P, fontSize: '12px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px',
          }}>
            ¿Cómo trabajamos?
          </p>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900,
            color: '#111827', letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            Un método probado para{' '}
            <span style={{ color: P }}>resultados reales</span>
          </h2>
          <p style={{
            color: '#6B7280', fontSize: '16px',
            maxWidth: '480px', margin: '16px auto 0', lineHeight: 1.65,
          }}>
            Cada proyecto sigue seis etapas que garantizan claridad, calidad
            y resultados medibles desde el primer día.
          </p>
        </motion.div>

        {/* Flow connector — decorative */}
        <div style={{ position: 'relative' }}>
          {/* Grid 3×2 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
          }}>
            {pasos.map((paso, i) => (
              <PasoCard key={paso.n} paso={paso} index={i} />
            ))}
          </div>

          {/* Row separator with arrow */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            whileInView={{ opacity: 1, scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            style={{
              position: 'absolute',
              top: 'calc(50% - 12px)',
              left: '24px', right: '24px',
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${Y}60, ${Y}60, transparent)`,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Bottom stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{
            marginTop: '56px',
            background: '#fff',
            border: '1px solid #E5E7EB',
            borderRadius: '20px',
            padding: '28px 40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '24px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}
        >
          {[
            { icon: '⚡', label: 'Tiempo promedio de entrega', value: '3–6 semanas' },
            { icon: '🔄', label: 'Revisiones incluidas por etapa', value: '2 rondas' },
            { icon: '📲', label: 'Comunicación directa con tu asesor', value: 'WhatsApp 24/7' },
            { icon: '✅', label: 'Clientes satisfechos con el proceso', value: '98%' },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 180px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                background: '#F5F3FF',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px',
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 800, color: P }}>{stat.value}</p>
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px', fontWeight: 500 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: '48px' }}
        >
          <p style={{ color: '#9CA3AF', fontSize: '14px', marginBottom: '16px' }}>
            ¿Listo para comenzar? El primer paso es tuyo.
          </p>
          <a
            href="#contacto"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              color: P, fontWeight: 700, fontSize: '15px',
              textDecoration: 'none',
              borderBottom: `2px solid ${Y}`,
              paddingBottom: '2px',
              transition: 'opacity 0.2s ease',
            }}
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

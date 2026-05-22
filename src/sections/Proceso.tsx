import { useState } from 'react'
import { motion } from 'framer-motion'
import { P, Y } from '../tokens'

const pasos = [
  {
    n: '01',
    icon: '🎯',
    titulo: 'Brief',
    desc: 'Escuchamos tu proyecto, objetivos y audiencia en una reunión inicial sin compromiso. Queremos entender tu esencia antes de proponer nada.',
  },
  {
    n: '02',
    icon: '💡',
    titulo: 'Propuesta',
    desc: 'Diseñamos una estrategia creativa y te presentamos la propuesta con tiempos, entregables y presupuesto claro desde el primer día.',
  },
  {
    n: '03',
    icon: '⚙️',
    titulo: 'Desarrollo',
    desc: 'Nuestro equipo trabaja con actualizaciones constantes. Tú apruebas cada etapa del proceso y tienes acceso directo a tu asesor vía WhatsApp.',
  },
  {
    n: '04',
    icon: '🚀',
    titulo: 'Entrega',
    desc: 'Entregamos el proyecto terminado, te capacitamos en su uso y quedamos disponibles para soporte. Tu éxito es nuestra mejor referencia.',
  },
]

function PasoCard({ paso, index }: { paso: typeof pasos[0]; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? P : '#fff',
        border: `1px solid ${hovered ? P : '#E5E7EB'}`,
        borderRadius: '20px',
        padding: '32px 28px',
        flex: '1 1 220px',
        position: 'relative',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 24px 64px rgba(107,33,168,0.22)'
          : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
      }}
    >
      {/* Número grande decorativo */}
      <p style={{
        fontSize: '64px', fontWeight: 900, lineHeight: 1,
        color: hovered ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
        position: 'absolute', top: '16px', right: '20px',
        transition: 'color 0.3s ease',
        userSelect: 'none',
      }}>
        {paso.n}
      </p>

      {/* Círculo del número activo */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '50%',
        background: hovered
          ? 'rgba(255,255,255,0.15)'
          : `linear-gradient(135deg, ${P}, #9333EA)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
        transition: 'background 0.3s ease',
      }}>
        <span style={{ fontSize: '20px' }}>{paso.icon}</span>
      </div>

      <h3 style={{
        fontSize: '20px', fontWeight: 800,
        color: hovered ? '#fff' : '#111827',
        marginBottom: '12px',
        transition: 'color 0.3s ease',
      }}>
        {paso.titulo}
      </h3>
      <p style={{
        fontSize: '14px', lineHeight: 1.7,
        color: hovered ? 'rgba(255,255,255,0.75)' : '#6B7280',
        transition: 'color 0.3s ease',
      }}>
        {paso.desc}
      </p>

      {/* Arrow connector (visible excepto último) */}
      {index < pasos.length - 1 && (
        <div style={{
          position: 'absolute',
          top: '50%', right: '-20px',
          transform: 'translateY(-50%)',
          zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '40px', height: '40px',
          background: Y,
          borderRadius: '50%',
          fontSize: '16px',
          boxShadow: '0 4px 12px rgba(250,204,21,0.35)',
        }}>
          →
        </div>
      )}
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
            Proceso de trabajo
          </p>
          <h2 style={{
            fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900,
            color: '#111827', letterSpacing: '-1px', lineHeight: 1.1,
          }}>
            Simple, transparente{' '}
            <span style={{ color: P }}>y sin sorpresas</span>
          </h2>
          <p style={{
            color: '#6B7280', fontSize: '16px',
            maxWidth: '460px', margin: '16px auto 0', lineHeight: 1.65,
          }}>
            Cada proyecto sigue el mismo camino probado para garantizar calidad y resultados en el tiempo prometido.
          </p>
        </motion.div>

        {/* Pasos */}
        <div style={{
          display: 'flex',
          gap: '40px',
          alignItems: 'stretch',
          flexWrap: 'wrap',
          position: 'relative',
        }}>
          {pasos.map((paso, i) => (
            <PasoCard key={paso.n} paso={paso} index={i} />
          ))}
        </div>

        {/* CTA inline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: '56px' }}
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

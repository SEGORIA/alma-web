import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P, Y } from '../tokens'

type Proyecto = { titulo: string; cat: string; g: string; tall?: boolean }

const proyectos: Proyecto[] = [
  { titulo: 'Prr Love', cat: 'Branding', g: 'linear-gradient(135deg,#F5D0FE,#A855F7)', tall: true },
  { titulo: 'Malasaña Store', cat: 'Desarrollo Web', g: 'linear-gradient(135deg,#DDD6FE,#7C3AED)' },
  { titulo: 'Magic All Stars', cat: 'Marketing Digital', g: 'linear-gradient(135deg,#FDE68A,#F59E0B)' },
  { titulo: 'Café Ritual', cat: 'Branding', g: 'linear-gradient(135deg,#FECDD3,#E11D48)', tall: true },
  { titulo: 'Nexo Legal', cat: 'Desarrollo Web', g: 'linear-gradient(135deg,#BAE6FD,#0284C7)' },
  { titulo: 'Bloom Spa', cat: 'Marketing Digital', g: 'linear-gradient(135deg,#D1FAE5,#059669)' },
]

const filtros = ['Todos', 'Branding', 'Desarrollo Web', 'Marketing Digital']

function ProyectoCard({ p }: { p: Proyecto }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', borderRadius: '18px', overflow: 'hidden',
        background: p.g, cursor: 'pointer',
        height: p.tall ? '340px' : '220px',
        gridRow: p.tall ? 'span 2' : 'span 1',
      }}
    >
      <div style={{
        position: 'absolute', bottom: -30, right: -30,
        width: 120, height: 120, borderRadius: '50%',
        background: 'rgba(255,255,255,0.15)',
      }} />
      <div style={{
        position: 'absolute', top: 20, right: 20,
        width: 50, height: 50, borderRadius: '50%',
        background: 'rgba(255,255,255,0.2)',
      }} />

      {/* Hover overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(88,28,135,0.78)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: '8px',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }}>
        <p style={{ color: '#fff', fontWeight: 800, fontSize: '18px', textAlign: 'center', padding: '0 16px' }}>{p.titulo}</p>
        <p style={{ color: Y, fontWeight: 600, fontSize: '13px' }}>{p.cat}</p>
        <span style={{
          marginTop: '8px', background: Y, color: '#111',
          padding: '8px 20px', borderRadius: '8px',
          fontWeight: 700, fontSize: '13px',
        }}>
          Ver caso →
        </span>
      </div>
    </div>
  )
}

export default function Portafolio() {
  const [filtro, setFiltro] = useState('Todos')
  const filtered = filtro === 'Todos' ? proyectos : proyectos.filter(p => p.cat === filtro)

  return (
    <section style={{ background: '#F3F4F6', padding: '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Portafolio
          </p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Proyectos que hablan{' '}
            <span style={{ color: P }}>por sí solos</span>
          </h2>
        </motion.div>

        {/* Filters */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {filtros.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '8px 20px', borderRadius: '8px',
                border: `2px solid ${filtro === f ? P : '#E5E7EB'}`,
                background: filtro === f ? P : '#fff',
                color: filtro === f ? '#fff' : '#6B7280',
                fontWeight: 600, fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence>
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '20px',
              gridAutoRows: '160px',
            }}
          >
            {filtered.map((p, i) => (
              <motion.div
                key={p.titulo}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                style={{ gridRow: p.tall ? 'span 2' : 'span 1' }}
              >
                <ProyectoCard p={p} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

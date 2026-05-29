import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getProyectos, getContactoInfo } from '../lib/db'
import { proyectosEstaticos, filtrosPortafolio, type Proyecto } from '../data/portafolio'
import { contactoDefault } from '../data/config'

const filtros = filtrosPortafolio

function Tag({ label }: { label: string }) {
  return (
    <span style={{ fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px', background: 'rgba(107,33,168,0.08)', color: P, whiteSpace: 'nowrap' }}>{label}</span>
  )
}

function ProyectoCard({ p, index, waBase }: { p: Proyecto; index: number; waBase: string }) {
  const [hovered, setHovered] = useState(false)
  const waText = encodeURIComponent(`Hola, me interesa conocer más sobre el proyecto ${p.titulo} que vi en el portafolio de Alma`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: '20px', overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(107,33,168,0.2)' : '#E5E7EB'}`,
        boxShadow: hovered ? '0 16px 48px rgba(107,33,168,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Visual */}
      <div style={{ position: 'relative', height: p.featured ? '200px' : '170px', background: p.g, overflow: 'hidden', flexShrink: 0 }}>
        {/* Imagen de portada si existe */}
        {p.imagen && (
          <img
            src={p.imagen}
            alt={p.titulo}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
        {/* Decoración solo si no hay imagen */}
        {!p.imagen && (
          <>
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ height: '8px', width: '60%', background: 'rgba(255,255,255,0.5)', borderRadius: '4px' }} />
              <div style={{ height: '6px', width: '40%', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
            </div>
          </>
        )}
        {/* Overlay cuando hay imagen para legibilidad de badges */}
        {p.imagen && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.25)' }} />}
        <div style={{ position: 'absolute', top: '14px', left: '14px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, color: P }}>{p.cat}</div>
        <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', padding: '5px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, color: '#fff' }}>{p.año}</div>
      </div>

      {/* Content */}
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>{p.titulo}</h3>
        <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0, flex: 1 }}>{p.desc}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {p.tags.map(t => <Tag key={t} label={t} />)}
        </div>
        <a
          href={`${waBase}?text=${waText}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderRadius: '10px',
            background: hovered ? P : '#F5F3FF', color: hovered ? '#fff' : P,
            fontWeight: 700, fontSize: '13px', textDecoration: 'none', transition: 'all 0.25s ease',
          }}
        >
          Ver caso de estudio <span style={{ fontSize: '16px' }}>→</span>
        </a>
      </div>
    </motion.div>
  )
}

export default function Portafolio() {
  const isMobile                  = useIsMobile()
  const [filtro,    setFiltro]    = useState('Todos')
  const [proyectos, setProyectos] = useState<Proyecto[]>(proyectosEstaticos)
  const [waBase,    setWaBase]    = useState(`https://wa.me/${contactoDefault.whatsapp}`)
  const [waLink,    setWaLink]    = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20iniciar%20un%20proyecto%20con%20Alma`
  )

  useEffect(() => {
    getProyectos().then(setProyectos)
    getContactoInfo().then(c => {
      setWaBase(`https://wa.me/${c.whatsapp}`)
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20iniciar%20un%20proyecto%20con%20Alma`)
    })
  }, [])

  const filtered = filtro === 'Todos' ? proyectos : proyectos.filter(p => p.cat === filtro)

  return (
    <section style={{ background: '#F9FAFB', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '48px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>Portafolio</p>
          <h2 style={{ fontSize: 'clamp(26px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Proyectos que hablan{' '}<span style={{ color: P }}>por sí solos</span>
          </h2>
          {!isMobile && (
            <p style={{ color: '#6B7280', fontSize: '16px', marginTop: '16px', maxWidth: '480px', margin: '16px auto 0', lineHeight: 1.65 }}>
              Cada proyecto es una historia de transformación. Estos son algunos de los que más nos enorgullecen.
            </p>
          )}
        </motion.div>

        {/* Filtros */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: isMobile ? '24px' : '48px', flexWrap: 'wrap' }}>
          {filtros.map(f => (
            <button
              key={f} onClick={() => setFiltro(f)}
              style={{
                padding: isMobile ? '7px 14px' : '8px 20px', borderRadius: '10px',
                border: `2px solid ${filtro === f ? P : '#E5E7EB'}`,
                background: filtro === f ? P : '#fff',
                color: filtro === f ? '#fff' : '#6B7280',
                fontWeight: 600, fontSize: isMobile ? '12px' : '13px',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={filtro}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: isMobile ? '16px' : '24px',
            }}
          >
            {filtered.map((p, i) => <ProyectoCard key={p._id ?? p.titulo} p={p} index={i} waBase={waBase} />)}
          </motion.div>
        </AnimatePresence>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.6 }}
          style={{
            marginTop: isMobile ? '40px' : '64px', textAlign: 'center',
            padding: isMobile ? '32px 24px' : '48px 32px', borderRadius: '24px',
            background: `linear-gradient(135deg, ${P}, #9333EA)`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>¿Tu proyecto podría estar aquí?</p>
          <h3 style={{ color: '#fff', fontSize: 'clamp(18px,3vw,28px)', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2 }}>Cuéntanos tu idea y la hacemos realidad</h3>
          <a
            href={waLink} target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: Y, color: '#111', padding: '14px 32px', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(250,204,21,0.4)', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(250,204,21,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(250,204,21,0.4)' }}
          >
            Iniciar mi proyecto →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

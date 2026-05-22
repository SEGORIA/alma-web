import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P, Y, WA_CONTACTO } from '../tokens'

type Proyecto = {
  titulo: string
  cat: string
  desc: string
  año: string
  tags: string[]
  g: string
  featured?: boolean
}

const proyectos: Proyecto[] = [
  {
    titulo: 'Prr Love',
    cat: 'Branding',
    desc: 'Identidad visual completa para marca de accesorios para mascotas. Logotipo, paleta, manual de marca y assets digitales.',
    año: '2024',
    tags: ['Logo', 'Manual de marca', 'Redes sociales'],
    g: 'linear-gradient(135deg,#F5D0FE 0%,#A855F7 100%)',
    featured: true,
  },
  {
    titulo: 'Malasaña Store',
    cat: 'Desarrollo Web',
    desc: 'Tienda virtual con pasarela de pagos, gestión de inventario y panel administrativo personalizado.',
    año: '2024',
    tags: ['E-commerce', 'Pasarela de pagos', 'Admin'],
    g: 'linear-gradient(135deg,#DDD6FE 0%,#7C3AED 100%)',
  },
  {
    titulo: 'Magic All Stars',
    cat: 'Marketing Digital',
    desc: 'Estrategia de contenido y pauta digital para academia deportiva. Crecimiento de 0 a 8K seguidores en 3 meses.',
    año: '2023',
    tags: ['Instagram', 'Pauta', 'Contenido'],
    g: 'linear-gradient(135deg,#FDE68A 0%,#F59E0B 100%)',
  },
  {
    titulo: 'Café Ritual',
    cat: 'Branding',
    desc: 'Rebranding completo para cafetería de especialidad. Naming, identidad visual y aplicaciones en empaque y señalética.',
    año: '2024',
    tags: ['Rebranding', 'Empaque', 'Señalética'],
    g: 'linear-gradient(135deg,#FECDD3 0%,#E11D48 100%)',
    featured: true,
  },
  {
    titulo: 'Nexo Legal',
    cat: 'Desarrollo Web',
    desc: 'Sitio corporativo para firma de abogados con blog integrado, formulario de consultas y SEO posicionado.',
    año: '2023',
    tags: ['Corporativo', 'Blog', 'SEO'],
    g: 'linear-gradient(135deg,#BAE6FD 0%,#0284C7 100%)',
  },
  {
    titulo: 'Bloom Spa',
    cat: 'Marketing Digital',
    desc: 'Gestión mensual de redes sociales, diseño de contenido y campañas de pauta con enfoque en reservas online.',
    año: '2024',
    tags: ['Community', 'Diseño', 'Conversión'],
    g: 'linear-gradient(135deg,#D1FAE5 0%,#059669 100%)',
  },
]

const filtros = ['Todos', 'Branding', 'Desarrollo Web', 'Marketing Digital']

/* ── Tag chip ─────────────────────────────────────────────── */
function Tag({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600,
      padding: '3px 10px', borderRadius: '20px',
      background: 'rgba(107,33,168,0.08)',
      color: P, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

/* ── Proyecto Card ────────────────────────────────────────── */
function ProyectoCard({ p, index }: { p: Proyecto; index: number }) {
  const [hovered, setHovered] = useState(false)

  const waText = encodeURIComponent(`Hola, me interesa conocer más sobre el proyecto ${p.titulo} que vi en el portafolio de Alma`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '20px',
        overflow: 'hidden',
        border: `1px solid ${hovered ? 'rgba(107,33,168,0.2)' : '#E5E7EB'}`,
        boxShadow: hovered ? '0 16px 48px rgba(107,33,168,0.12)' : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s ease',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Visual mockup */}
      <div style={{
        position: 'relative',
        height: p.featured ? '220px' : '180px',
        background: p.g,
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', bottom: -40, right: -40,
          width: 140, height: 140, borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
        }} />
        <div style={{
          position: 'absolute', top: -20, left: -20,
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
        }} />

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: '14px', left: '14px',
          background: 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(8px)',
          padding: '5px 12px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 700, color: P,
        }}>
          {p.cat}
        </div>

        {/* Year */}
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(0,0,0,0.18)',
          backdropFilter: 'blur(8px)',
          padding: '5px 10px', borderRadius: '20px',
          fontSize: '11px', fontWeight: 600, color: '#fff',
        }}>
          {p.año}
        </div>

        {/* Simulated UI elements inside mockup */}
        <div style={{
          position: 'absolute', bottom: '20px', left: '20px', right: '20px',
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <div style={{ height: '8px', width: '60%', background: 'rgba(255,255,255,0.5)', borderRadius: '4px' }} />
          <div style={{ height: '6px', width: '40%', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
          {p.titulo}
        </h3>
        <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.6, margin: 0, flex: 1 }}>
          {p.desc}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {p.tags.map(t => <Tag key={t} label={t} />)}
        </div>

        {/* CTA */}
        <a
          href={`https://wa.me/573188006436?text=${waText}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 14px', borderRadius: '10px',
            background: hovered ? P : '#F5F3FF',
            color: hovered ? '#fff' : P,
            fontWeight: 700, fontSize: '13px', textDecoration: 'none',
            transition: 'all 0.25s ease',
          }}
        >
          Ver caso de estudio
          <span style={{ fontSize: '16px' }}>→</span>
        </a>
      </div>
    </motion.div>
  )
}

/* ── Portafolio ───────────────────────────────────────────── */
export default function Portafolio() {
  const [filtro, setFiltro] = useState('Todos')
  const filtered = filtro === 'Todos' ? proyectos : proyectos.filter(p => p.cat === filtro)

  return (
    <section style={{ background: '#F9FAFB', padding: '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
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
          <p style={{ color: '#6B7280', fontSize: '16px', marginTop: '16px', maxWidth: '480px', margin: '16px auto 0', lineHeight: 1.65 }}>
            Cada proyecto es una historia de transformación. Estos son algunos de los que más nos enorgullecen.
          </p>
        </motion.div>

        {/* Filtros */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '48px', flexWrap: 'wrap' }}>
          {filtros.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '8px 20px', borderRadius: '10px',
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
        <AnimatePresence mode="wait">
          <motion.div
            key={filtro}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {filtered.map((p, i) => (
              <ProyectoCard key={p.titulo} p={p} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* CTA final */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          style={{
            marginTop: '64px', textAlign: 'center',
            padding: '48px 32px', borderRadius: '24px',
            background: `linear-gradient(135deg, ${P}, #9333EA)`,
            position: 'relative', overflow: 'hidden',
          }}
        >
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '200px', height: '200px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-40px',
            width: '150px', height: '150px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />

          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
            ¿Tu proyecto podría estar aquí?
          </p>
          <h3 style={{ color: '#fff', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 900, marginBottom: '24px', lineHeight: 1.2 }}>
            Cuéntanos tu idea y la hacemos realidad
          </h3>
          <a
            href={WA_CONTACTO}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: Y, color: '#111',
              padding: '14px 32px', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(250,204,21,0.4)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(250,204,21,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(250,204,21,0.4)'
            }}
          >
            Iniciar mi proyecto →
          </a>
        </motion.div>
      </div>
    </section>
  )
}

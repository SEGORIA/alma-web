import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { P, PD, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getEquipo, getContactoInfo } from '../lib/db'
import { equipoEstatico } from '../data/contenido'
import { contactoDefault } from '../data/config'
import type { EquipoMember } from '../data/contenido'
import SiteNav from '../components/SiteNav'

/* ── Card individual ─────────────────────────────────────── */
function MemberCard({ m, index }: { m: EquipoMember; index: number }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
        borderRadius: '24px',
        padding: '32px 24px 28px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 24px 60px rgba(107,33,168,0.14)' : '0 2px 12px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
    >
      {/* Avatar */}
      <div style={{
        width: '88px', height: '88px', borderRadius: '50%',
        background: m.foto ? 'transparent' : m.color,
        flexShrink: 0, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px',
        boxShadow: hovered ? '0 12px 32px rgba(107,33,168,0.25)' : '0 4px 16px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.3s ease',
        position: 'relative',
        border: m.foto ? `3px solid ${hovered ? P : '#E5E7EB'}` : 'none',
      }}>
        {m.foto
          ? <img src={m.foto} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <>
              <span style={{ fontSize: '30px' }}>{m.emoji}</span>
              {/* Iniciales badge */}
              <div style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#fff', border: `2px solid ${hovered ? P : '#E5E7EB'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 900, color: P,
                transition: 'border-color 0.3s ease',
              }}>
                {m.iniciales}
              </div>
            </>
        }
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '4px', lineHeight: 1.3 }}>
        {m.nombre}
      </h3>
      <p style={{
        fontSize: '12px', fontWeight: 700, color: P,
        marginBottom: '14px', letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}>
        {m.rol}
      </p>
      <p style={{ fontSize: '13px', lineHeight: 1.7, color: '#6B7280' }}>
        {m.desc}
      </p>
    </motion.div>
  )
}

/* ── EquipoPage ──────────────────────────────────────────── */
export default function EquipoPage() {
  const isMobile = useIsMobile()
  const [equipo,  setEquipo]  = useState<EquipoMember[]>(equipoEstatico)
  const [waLink,  setWaLink]  = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20el%20equipo%20de%20Alma`
  )

  useEffect(() => {
    window.scrollTo(0, 0)
    getEquipo().then(setEquipo)
    getContactoInfo().then(c =>
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20el%20equipo%20de%20Alma`)
    )
  }, [])

  /* ── divide en fundadores (primeros 2) y colaboradores ── */
  const sorted       = [...equipo].sort((a, b) => (a.orden ?? 99) - (b.orden ?? 99))
  const fundadores   = sorted.filter(m => (m.orden ?? 99) < 2)
  const colaboradores = sorted.filter(m => (m.orden ?? 99) >= 2)

  const colsColab = isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))'

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <Helmet>
        <title>Equipo | Alma Agencia Creativa — Las personas detrás de cada proyecto</title>
        <meta name="description" content="Conoce al equipo de Alma Agencia Creativa: diseñadores, estrategas, programadores y creadores que dan vida a cada proyecto en Manizales, Colombia." />
        <link rel="canonical" href="https://almaagenciacreativa.com/equipo" />
      </Helmet>

      <SiteNav activePath="/equipo" />

      {/* ── Hero ── */}
      <div style={{ background: `linear-gradient(135deg, ${P} 0%, #9333EA 100%)`, paddingTop: '68px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '1100px', margin: '0 auto', padding: '64px 24px 56px', textAlign: 'center' }}
        >
          <p style={{ color: Y, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>
            Nuestro Equipo
          </p>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '18px' }}>
            Las personas detrás<br />de cada proyecto
          </h1>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, maxWidth: '520px', margin: '0 auto' }}>
            Un equipo multidisciplinar con un solo objetivo: hacer crecer tu marca con creatividad, estrategia y pasión.
          </p>

          {/* Stat pills */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '36px' }}>
            {[
              { n: `${equipo.length}`, label: 'Profesionales' },
              { n: '6+',              label: 'Años de experiencia' },
              { n: '150+',            label: 'Proyectos entregados' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '20px', padding: '10px 22px',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '18px', fontWeight: 900, color: Y }}>{s.n}</span>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Contenido ── */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '48px 20px 80px' : '72px 24px 100px' }}>

        {/* Fundadores */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '40px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
            Fundadores & Líderes
          </p>
          <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>
            Quienes crearon <span style={{ color: P }}>Alma</span>
          </h2>
        </motion.div>

        {/* wrapper centrado con marginLeft/Right:auto explícitos */}
        <div style={{
          display: 'block',
          maxWidth: '784px',
          marginLeft: 'auto',
          marginRight: 'auto',
          marginBottom: isMobile ? '52px' : '80px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? '16px' : '24px',
          }}>
            {fundadores.map((m, i) => <MemberCard key={m._id ?? m.nombre} m={m} index={i} />)}
          </div>
        </div>

        {/* Colaboradores */}
        {colaboradores.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '40px' }}
            >
              <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
                Talento del equipo
              </p>
              <h2 style={{ fontSize: 'clamp(22px,3vw,32px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px' }}>
                Especialistas que hacen la <span style={{ color: P }}>magia</span>
              </h2>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: colsColab, gap: isMobile ? '16px' : '24px' }}>
              {colaboradores.map((m, i) => <MemberCard key={m._id ?? m.nombre} m={m} index={i} />)}
            </div>
          </>
        )}

        {/* ── Valores ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          style={{
            marginTop: isMobile ? '52px' : '80px',
            background: '#fff', borderRadius: '24px',
            border: '1px solid #E5E7EB',
            padding: isMobile ? '28px 20px' : '40px 48px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '20px' : '32px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
          }}
        >
          {/* Texto */}
          <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: P, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              Lo que nos mueve
            </p>
            <h3 style={{ fontSize: isMobile ? '22px' : 'clamp(20px,2.5vw,26px)', fontWeight: 900, color: '#111827', marginBottom: '10px', lineHeight: 1.2 }}>
              Un equipo con propósito
            </h3>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.7 }}>
              No somos intermediarios. Somos un equipo multidisciplinar que se involucra de corazón en cada proyecto, con dedicación real y comunicación directa.
            </p>
          </div>

          {/* Pills */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '8px',
            justifyContent: isMobile ? 'center' : 'flex-end',
            width: isMobile ? '100%' : '340px',
            flexShrink: 0,
          }}>
            {[
              '🎯 Resultados reales',
              '💬 Comunicación directa',
              '❤️ Trabajo con propósito',
              '🚀 Entrega a tiempo',
              '🔍 Atención al detalle',
            ].map(v => (
              <span key={v} style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: '#F5F3FF', border: '1px solid #DDD6FE',
                borderRadius: '20px', padding: '8px 14px',
                fontSize: '13px', fontWeight: 600, color: '#374151',
                whiteSpace: 'nowrap',
              }}>
                {v}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Footer CTA ── */}
      <div style={{ background: '#111827', padding: '60px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
            ¿Quieres que este equipo trabaje por ti?
          </p>
          <p style={{ fontSize: '15px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '28px' }}>
            Cuéntanos tu proyecto y te asignamos el equipo ideal para llevarlo al siguiente nivel.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={waLink} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: P, color: '#fff', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', transition: 'background 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.background = PD)}
              onMouseLeave={e => (e.currentTarget.style.background = P)}
            >
              Iniciar proyecto →
            </a>
            <Link
              to="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.08)', color: '#fff', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, fontSize: '15px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'background 0.2s ease' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              Ver nuestros servicios
            </Link>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '48px auto 0', borderTop: '1px solid #1F2937', paddingTop: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: P, padding: '4px 10px', borderRadius: '8px', display: 'inline-flex' }}>
              <img src="/alma-logo.png" alt="Alma" style={{ height: '28px', width: 'auto' }} />
            </div>
            <span style={{ color: '#6B7280', fontSize: '13px' }}>
              © {new Date().getFullYear()} Alma Agencia Creativa · Manizales
            </span>
          </div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/"          style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>Inicio</Link>
            <Link to="/portafolio" style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>Portafolio</Link>
            <Link to="/blog"       style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }} onMouseEnter={e => (e.currentTarget.style.color = '#fff')} onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}>Blog</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

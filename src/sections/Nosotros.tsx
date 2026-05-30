import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getEquipo, getContactoInfo } from '../lib/db'
import { equipoEstatico } from '../data/contenido'
import { contactoDefault } from '../data/config'
import type { EquipoMember } from '../data/contenido'


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
        background: m.foto ? 'transparent' : m.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '20px', flexShrink: 0,
        overflow: 'hidden',
        boxShadow: hovered ? '0 12px 32px rgba(107,33,168,0.25)' : '0 4px 16px rgba(0,0,0,0.12)',
        transition: 'box-shadow 0.3s ease',
        position: 'relative',
        border: m.foto ? `3px solid ${hovered ? P : '#E5E7EB'}` : 'none',
      }}>
        {m.foto
          ? <img src={m.foto} alt={m.nombre} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <>
              <span style={{ fontSize: '28px' }}>{m.emoji}</span>
              <div style={{
                position: 'absolute', bottom: '-2px', right: '-2px',
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#fff', border: `2px solid ${hovered ? P : '#E5E7EB'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: 900, color: P,
                transition: 'border-color 0.3s ease',
              }}>
                {m.iniciales[0]}
              </div>
            </>
        }
      </div>

      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>{m.nombre}</h3>
      <p style={{ fontSize: '12px', fontWeight: 700, color: P, marginBottom: '12px', letterSpacing: '0.5px' }}>{m.rol}</p>
      <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#6B7280' }}>{m.desc}</p>
    </motion.div>
  )
}

export default function Nosotros() {
  const isMobile = useIsMobile()
  const [equipo,  setEquipo]  = useState<EquipoMember[]>(equipoEstatico)
  const [waLink,  setWaLink]  = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20Alma`
  )

  useEffect(() => {
    getEquipo().then(setEquipo)
    getContactoInfo().then(c =>
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20conocer%20m%C3%A1s%20sobre%20Alma`)
    )
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
              href={waLink}
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
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', marginTop: '6px', fontWeight: 600, lineHeight: 1.3 }}>{s.label}</p>
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
          {/* Solo los 2 fundadores */}
          {equipo.slice(0, 2).map((m, i) => <TeamCard key={m._id ?? m.nombre} m={m} index={i} />)}

          {/* Tarjeta-enlace al equipo completo */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/equipo"
              style={{ textDecoration: 'none', display: 'block', height: '100%' }}
            >
              <div style={{
                background: `linear-gradient(135deg, ${P}, #9333EA)`,
                border: '1.5px solid transparent',
                borderRadius: '20px',
                padding: '28px 24px',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', textAlign: 'center',
                height: '100%', minHeight: '240px',
                justifyContent: 'center', gap: '16px',
                boxShadow: '0 8px 32px rgba(107,33,168,0.2)',
                cursor: 'pointer',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 20px 52px rgba(107,33,168,0.3)'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(107,33,168,0.2)'
                }}
              >
                {/* Avatares mini apilados */}
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
                  {[
                    { iniciales: 'AN', bg: 'linear-gradient(135deg,#EC4899,#F43F5E)' },
                    { iniciales: 'AM', bg: 'linear-gradient(135deg,#D97706,#FBBF24)' },
                    { iniciales: 'MA', bg: 'linear-gradient(135deg,#0891B2,#67E8F9)' },
                    { iniciales: 'DR', bg: 'linear-gradient(135deg,#7C3AED,#A78BFA)' },
                    { iniciales: 'RF', bg: 'linear-gradient(135deg,#059669,#34D399)'  },
                  ].map((a, i) => (
                    <div key={a.iniciales} style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: a.bg,
                      border: '2px solid rgba(255,255,255,0.4)',
                      marginLeft: i > 0 ? '-8px' : '0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '12px', fontWeight: 800, color: '#fff',
                      position: 'relative', zIndex: 5 - i,
                    }}>
                      {a.iniciales}
                    </div>
                  ))}
                </div>

                <div>
                  <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', marginBottom: '6px' }}>
                    +5 personas más
                  </p>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    Diseñadores, estrategas, creadores y programadores listos para tu proyecto.
                  </p>
                </div>

                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  background: Y, color: '#111',
                  padding: '9px 20px', borderRadius: '10px',
                  fontWeight: 700, fontSize: '13px',
                  marginTop: '4px',
                }}>
                  Ver equipo completo →
                </div>
              </div>
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  )
}

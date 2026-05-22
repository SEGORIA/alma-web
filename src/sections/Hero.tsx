import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { P, PL, Y, YD, WA_PROYECTO as WA_URL } from '../tokens'

const previewCards = [
  { titulo: 'Prr Love', cat: 'Branding', g: 'linear-gradient(135deg,#F5D0FE,#A855F7)' },
  { titulo: 'Malasaña Store', cat: 'E-commerce', g: 'linear-gradient(135deg,#DDD6FE,#7C3AED)' },
  { titulo: 'Magic All Stars', cat: 'Marketing', g: 'linear-gradient(135deg,#FDE68A,#F59E0B)' },
]

export default function Hero() {
  const [cardIdx, setCardIdx] = useState(0)
  const [btnHover, setBtnHover] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setCardIdx(i => (i + 1) % previewCards.length), 2400)
    return () => clearInterval(t)
  }, [])

  const card = previewCards[cardIdx]

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      padding: '140px 24px 80px',
      background: 'linear-gradient(135deg,#ffffff 55%,rgba(147,51,234,0.06) 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '700px', height: '700px',
        background: 'radial-gradient(ellipse,rgba(147,51,234,0.1) 0%,transparent 65%)',
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1200px', margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap',
      }}>
        {/* Left 60% */}
        <div style={{ flex: '1 1 380px', maxWidth: '600px' }}>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: Y, color: '#111',
              fontSize: '12px', fontWeight: 700,
              padding: '6px 14px', borderRadius: '20px', marginBottom: '28px',
            }}
          >
            📍 Estrategia & Diseño desde Manizales
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{
              fontSize: 'clamp(38px,5.5vw,64px)', fontWeight: 900,
              lineHeight: 1.06, letterSpacing: '-2px', color: '#111827',
              marginBottom: '20px',
            }}
          >
            Convertimos tu{' '}
            <span style={{ color: P }}>visión</span>
            {' '}en{' '}
            <span style={{ color: P }}>realidad</span>
            {' '}digital
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ fontSize: '18px', lineHeight: 1.65, color: '#4B5563', marginBottom: '40px', maxWidth: '480px' }}
          >
            Diseñamos marcas, sitios web y estrategias digitales que conectan con tu audiencia
            y generan resultados medibles.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}
          >
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: btnHover ? YD : Y,
                color: '#111', padding: '16px 32px', borderRadius: '10px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                boxShadow: btnHover ? '0 8px 24px rgba(234,179,8,0.35)' : '0 4px 14px rgba(250,204,21,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              Empezar mi proyecto hoy →
            </a>
            <a
              href="#servicios"
              style={{ color: P, fontSize: '15px', fontWeight: 600, textDecoration: 'none', padding: '16px 8px' }}
            >
              Ver tarifas
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            style={{
              marginTop: '56px',
              paddingTop: '32px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex', gap: '0', flexWrap: 'wrap',
            }}
          >
            {[
              { n: '150+', label: 'Proyectos entregados' },
              { n: '6',    label: 'Años de experiencia' },
              { n: '98%',  label: 'Clientes satisfechos' },
            ].map((s, i) => (
              <div
                key={s.label}
                style={{
                  flex: '1 1 80px',
                  paddingRight: '32px',
                  borderRight: i < 2 ? '1px solid #E5E7EB' : 'none',
                  marginRight: i < 2 ? '32px' : 0,
                }}
              >
                <p style={{ fontSize: '32px', fontWeight: 900, color: P, lineHeight: 1 }}>{s.n}</p>
                <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '6px', fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right 40% — browser mockup */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: '1 1 320px', maxWidth: '460px', position: 'relative' }}
        >
          {/* Pill flotante superior */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute', top: '-18px', right: '20px', zIndex: 2,
              background: '#fff',
              boxShadow: '0 8px 28px rgba(107,33,168,0.15)',
              borderRadius: '20px', padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(107,33,168,0.1)',
            }}
          >
            <span style={{ fontSize: '16px' }}>🚀</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: P }}>Proyecto lanzado</span>
          </motion.div>

          {/* Pill flotante inferior */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{
              position: 'absolute', bottom: '-18px', left: '20px', zIndex: 2,
              background: '#fff',
              boxShadow: '0 8px 28px rgba(107,33,168,0.15)',
              borderRadius: '20px', padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: '8px',
              border: '1px solid rgba(107,33,168,0.1)',
            }}
          >
            <span style={{ fontSize: '16px' }}>⭐</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#374151' }}>Cliente satisfecho</span>
          </motion.div>

          <div style={{
            background: '#fff', borderRadius: '20px',
            boxShadow: '0 40px 100px rgba(107,33,168,0.18)',
            overflow: 'hidden', border: '1px solid #E5E7EB',
          }}>
            {/* Chrome */}
            <div style={{
              background: '#F9FAFB', padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: '6px',
              borderBottom: '1px solid #E5E7EB',
            }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FC5C65' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#FED330' }} />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#26de81' }} />
              <div style={{
                flex: 1, background: '#fff', borderRadius: '6px',
                padding: '4px 12px', fontSize: '11px', color: '#9CA3AF',
                marginLeft: '8px', border: '1px solid #E5E7EB',
              }}>
                almaagenciacreativa.com
              </div>
            </div>

            {/* Content */}
            <div style={{
              background: 'linear-gradient(135deg,#F5F3FF,#EDE9FE)',
              padding: '28px 20px', minHeight: '320px',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              {/* Simulated nav */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ width: 60, height: 10, background: P, borderRadius: 4 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  {[40, 50, 40].map((w, i) => (
                    <div key={i} style={{ width: w, height: 8, background: '#D8B4FE', borderRadius: 4 }} />
                  ))}
                </div>
              </div>

              {/* Rotating project card */}
              <motion.div
                key={cardIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{
                  background: '#fff', borderRadius: '14px', padding: '16px',
                  border: '1px solid rgba(107,33,168,0.1)', flex: 1,
                }}
              >
                <div style={{ width: '100%', height: 130, background: card.g, borderRadius: '10px', marginBottom: '12px' }} />
                <p style={{ fontWeight: 700, color: '#111', fontSize: '14px' }}>{card.titulo}</p>
                <p style={{ fontSize: '12px', color: PL, marginTop: '4px', fontWeight: 600 }}>{card.cat}</p>
              </motion.div>

              {/* Bottom color row */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[P, '#9333EA', '#C026D3'].map((c, i) => (
                  <div key={i} style={{
                    flex: 1, height: 44, borderRadius: '10px',
                    background: c, opacity: 0.3 + i * 0.35,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

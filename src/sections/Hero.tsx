import { motion, useInView } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { P, Y, YD } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getHeroContent, getContactoInfo } from '../lib/db'
import { heroStatsDefault, heroSubtituloDefault, contactoDefault } from '../data/config'
import type { HeroStat } from '../data/config'

const headline = [
  { word: 'Convertimos', colored: false },
  { word: 'tu',          colored: false },
  { word: 'visión',      colored: true  },
  { word: 'en',          colored: false },
  { word: 'realidad',    colored: true  },
  { word: 'digital',     colored: false },
]

function Counter({ target, suffix = '', label }: { target: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0)
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  useEffect(() => {
    if (!inView) return
    let frame: number
    const start    = performance.now()
    const duration = 1600
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const eased    = 1 - (1 - progress) * (1 - progress)
      setCount(Math.floor(eased * target))
      if (progress < 1) frame = requestAnimationFrame(tick)
      else setCount(target)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, target])

  return (
    <div ref={ref}>
      <p style={{ fontSize: '28px', fontWeight: 900, color: P, lineHeight: 1 }}>{count}{suffix}</p>
      <p style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px', fontWeight: 500 }}>{label}</p>
    </div>
  )
}

export default function Hero() {
  const isMobile               = useIsMobile()
  const [btnHover, setBtnHover] = useState(false)
  const [scrollY,  setScrollY]  = useState(0)
  const [stats,    setStats]    = useState<HeroStat[]>(heroStatsDefault)
  const [subtitulo,setSubtitulo]= useState(heroSubtituloDefault)
  const [waLink,   setWaLink]   = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`
  )

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    getHeroContent().then(({ stats: s, subtitulo: sub }) => {
      setStats(s); setSubtitulo(sub)
    })
    getContactoInfo().then(c =>
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`)
    )
  }, [])

  return (
    <section style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center',
      padding: isMobile ? '96px 20px 52px' : '140px 24px 80px',
      background: 'linear-gradient(135deg,#ffffff 55%,rgba(147,51,234,0.06) 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glow blobs */}
      <div style={{
        position: 'absolute', top: '-200px', right: '-200px',
        width: '700px', height: '700px',
        background: 'radial-gradient(ellipse,rgba(147,51,234,0.1) 0%,transparent 65%)',
        pointerEvents: 'none',
        transform: `translateY(${scrollY * 0.18}px)`,
        transition: 'transform 0.1s linear',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(ellipse,rgba(250,204,21,0.07) 0%,transparent 65%)',
        pointerEvents: 'none',
        transform: `translateY(${scrollY * -0.1}px)`,
        transition: 'transform 0.1s linear',
      }} />

      <div style={{
        maxWidth: '1200px', margin: '0 auto', width: '100%',
        display: 'flex', alignItems: 'center',
        gap: isMobile ? '0' : '64px',
        flexWrap: 'wrap',
      }}>

        {/* ── Left ── */}
        <div style={{ flex: '1 1 300px', maxWidth: isMobile ? '100%' : '600px', width: '100%' }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: Y, color: '#111',
              fontSize: '12px', fontWeight: 700,
              padding: '6px 14px', borderRadius: '20px',
              marginBottom: isMobile ? '20px' : '28px',
            }}
          >
            📍 Estrategia & Diseño desde Manizales
          </motion.div>

          {/* Headline */}
          <h1 style={{
            fontSize: isMobile ? 'clamp(34px,9vw,46px)' : 'clamp(38px,5.5vw,64px)',
            fontWeight: 900, lineHeight: 1.08, letterSpacing: '-2px',
            marginBottom: isMobile ? '14px' : '20px',
          }}>
            {headline.map((item, i) => (
              <motion.span
                key={item.word}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: 'inline-block', color: item.colored ? P : '#111827', marginRight: '0.27em' }}
              >
                {item.word}
              </motion.span>
            ))}
          </h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.58 }}
            style={{
              fontSize: isMobile ? '15px' : '18px',
              lineHeight: 1.65, color: '#4B5563',
              marginBottom: isMobile ? '28px' : '40px',
              maxWidth: '480px',
            }}
          >
            {subtitulo}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '10px' : '16px',
              alignItems: isMobile ? 'stretch' : 'center',
            }}
          >
            <a
              href={waLink} target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => setBtnHover(true)}
              onMouseLeave={() => setBtnHover(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: btnHover ? YD : Y,
                color: '#111', padding: '15px 32px', borderRadius: '10px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                boxShadow: btnHover ? '0 8px 24px rgba(234,179,8,0.35)' : '0 4px 14px rgba(250,204,21,0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              Empezar mi proyecto hoy →
            </a>
            <a
              href="#servicios"
              style={{
                color: P, fontSize: '15px', fontWeight: 600, textDecoration: 'none',
                padding: isMobile ? '10px 0' : '16px 8px',
                textAlign: isMobile ? 'center' : 'left',
              }}
            >
              Ver tarifas
            </a>
          </motion.div>

          {/* Contadores */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            style={{
              marginTop: isMobile ? '32px' : '56px',
              paddingTop: isMobile ? '20px' : '32px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex', gap: '0', flexWrap: 'wrap',
            }}
          >
            {stats.map((s, i) => (
              <div key={s.label} style={{
                flex: '1 1 70px',
                paddingRight: i < 2 ? (isMobile ? '16px' : '32px') : 0,
                borderRight:  i < 2 ? '1px solid #E5E7EB' : 'none',
                marginRight:  i < 2 ? (isMobile ? '16px' : '32px') : 0,
              }}>
                <Counter target={s.target} suffix={s.suffix} label={s.label} />
              </div>
            ))}
          </motion.div>
        </div>

        {/* ── Right: floating cards (desktop only) ── */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: '1 1 320px', maxWidth: '460px', position: 'relative', minHeight: '440px', paddingBottom: '40px' }}
          >
            {/* Metrics pill */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: '-8px', right: '-8px', zIndex: 3,
                background: '#fff', boxShadow: '0 12px 36px rgba(107,33,168,0.18)',
                borderRadius: '16px', padding: '12px 16px',
                display: 'flex', alignItems: 'center', gap: '10px',
                border: '1px solid rgba(107,33,168,0.08)', minWidth: '175px',
              }}
            >
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg,#D1FAE5,#059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '18px', fontWeight: 900, color: '#fff',
              }}>↑</div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>+127% Engagement</p>
                <p style={{ fontSize: '10px', color: '#9CA3AF', marginTop: '2px', fontWeight: 500 }}>vs. mes anterior</p>
              </div>
            </motion.div>

            {/* Main brand identity card */}
            <div style={{
              background: '#fff', borderRadius: '24px',
              boxShadow: '0 40px 100px rgba(107,33,168,0.18)',
              overflow: 'hidden', border: '1px solid #E5E7EB',
              transform: 'rotate(-1.5deg)', marginTop: '36px',
            }}>
              <div style={{ background: `linear-gradient(135deg, ${P}, #9333EA)`, padding: '22px 24px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div>
                    <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Brand Identity</p>
                    <p style={{ fontSize: '17px', fontWeight: 800, color: '#fff', marginTop: '3px' }}>Prr Love Studio</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.18)', borderRadius: '8px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: '#fff' }}>2024</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['#fff', '#FECDD3', '#FCA5A5', '#F87171', '#EF4444'].map((c, i) => (
                    <div key={i} style={{ width: '30px', height: '30px', borderRadius: '8px', background: c, boxShadow: '0 2px 8px rgba(0,0,0,0.18)' }} />
                  ))}
                </div>
              </div>

              <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '50px', height: '50px', borderRadius: '12px', flexShrink: 0,
                    background: `linear-gradient(135deg,${P}18,#9333EA18)`, border: `1px solid ${P}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: '21px', fontWeight: 900, color: P }}>Aa</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>Tipografía Principal</p>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '2px' }}>Playfair Display · Bold</p>
                  </div>
                  <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#ECFDF5', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#059669' }}>✓</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  {[
                    { label: 'Logo',   g: `linear-gradient(135deg,${P},#9333EA)`,   icon: '✦' },
                    { label: 'Icono',  g: 'linear-gradient(135deg,#FECDD3,#E11D48)', icon: '♥' },
                    { label: 'Patrón', g: 'linear-gradient(135deg,#FDE68A,#F59E0B)', icon: '◈' },
                  ].map(el => (
                    <div key={el.label} style={{ borderRadius: '12px', background: el.g, height: '62px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '18px', color: '#fff' }}>{el.icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{el.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #F3F4F6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>Entregado al cliente</span>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: P }}>Ver caso →</span>
                </div>
              </div>
            </div>

            {/* Social card */}
            <motion.div
              animate={{ y: [0, 7, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
              style={{
                position: 'absolute', bottom: '0px', left: '-8px', zIndex: 3,
                background: '#fff', boxShadow: '0 12px 36px rgba(107,33,168,0.15)',
                borderRadius: '16px', padding: '12px 16px',
                border: '1px solid rgba(107,33,168,0.08)', minWidth: '210px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg,${P},#9333EA)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff' }}>A</div>
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 700, color: '#111827' }}>@almaagencia</p>
                  <p style={{ fontSize: '10px', color: '#9CA3AF' }}>Instagram · Hoy</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                {['linear-gradient(135deg,#F5D0FE,#A855F7)', 'linear-gradient(135deg,#DDD6FE,#7C3AED)', 'linear-gradient(135deg,#FDE68A,#F59E0B)'].map((g, i) => (
                  <div key={i} style={{ flex: 1, height: '42px', borderRadius: '8px', background: g }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '14px' }}>
                {[['❤️', '2.4k'], ['💬', '184'], ['↗️', '891']].map(([icon, val]) => (
                  <span key={icon} style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600 }}>{icon} {val}</span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

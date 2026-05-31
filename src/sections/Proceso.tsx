import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { P, PL, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getPasos } from '../lib/db'
import { pasosEstaticos } from '../data/contenido'
import type { PasoItem } from '../data/contenido'

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`

/* ── Step accent colors (by 0-based index) ─────────────────── */
const STEP_COLORS = [
  { from: '#6B21A8', to: '#9333EA', glow: 'rgba(107,33,168,0.4)'  },
  { from: '#7C3AED', to: '#A78BFA', glow: 'rgba(124,58,237,0.4)'  },
  { from: '#DB2777', to: '#F472B6', glow: 'rgba(219,39,119,0.4)'  },
  { from: '#D97706', to: '#FCD34D', glow: 'rgba(217,119,6,0.4)'   },
  { from: '#9D174D', to: '#FDA4AF', glow: 'rgba(157,23,77,0.4)'   },
  { from: '#4C1D95', to: '#818CF8', glow: 'rgba(76,29,149,0.4)'   },
]

/* ── SVG icons by step index ───────────────────────────────── */
function StepIcon({ index, size = 22 }: { index: number; size?: number }) {
  const icons = [
    /* 0 Escuchamos — headphones */
    <svg key={0} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3 18v-6a9 9 0 0118 0v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5z" stroke="white" strokeWidth="2"/>
      <path d="M3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" stroke="white" strokeWidth="2"/>
    </svg>,
    /* 1 Ideamos — lightbulb */
    <svg key={1} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2H10a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
      <path d="M9 21h6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>,
    /* 2 Atraemos — target */
    <svg key={2} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
      <circle cx="12" cy="12" r="6"  stroke="white" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2"  fill="white"/>
    </svg>,
    /* 3 Convertimos — zap / lightning */
    <svg key={3} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
    /* 4 Fidelizamos — heart */
    <svg key={4} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
    </svg>,
    /* 5 Evidenciamos — bar chart */
    <svg key={5} width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M18 20V10M12 20V4M6 20v-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
  ]
  return icons[index % icons.length]
}

/* ── Stat icons ────────────────────────────────────────────── */
const StatIcons = {
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2"/>
      <path d="M12 6v6l4 2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  refresh: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M23 4v6h-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  whatsapp: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M9 11l3 3L22 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

/* ── Card ──────────────────────────────────────────────────── */
function PasoCard({ paso, index, isMobile }: { paso: PasoItem; index: number; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false)
  const col = STEP_COLORS[index % STEP_COLORS.length]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? col.from + '66' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '20px',
        padding: isMobile ? '18px 16px' : '22px 20px',
        position: 'relative', overflow: 'hidden',
        boxShadow: hovered ? `0 20px 48px ${col.glow}` : '0 2px 16px rgba(0,0,0,0.25)',
        transition: 'all 0.3s ease',
        cursor: 'default',
      }}
    >
      {/* Background step number */}
      <p style={{
        fontSize: isMobile ? '60px' : '76px', fontWeight: 900, lineHeight: 1,
        color: hovered ? col.from + '18' : 'rgba(255,255,255,0.04)',
        position: 'absolute', top: '6px', right: '12px',
        transition: 'color 0.3s ease', userSelect: 'none', letterSpacing: '-3px',
        pointerEvents: 'none',
      }}>{paso.n}</p>

      {/* Glow blob on hover */}
      {hovered && (
        <div style={{
          position: 'absolute', top: '-30px', left: '-30px',
          width: '120px', height: '120px',
          background: `radial-gradient(ellipse, ${col.from}22 0%, transparent 70%)`,
          pointerEvents: 'none', borderRadius: '50%',
        }} />
      )}

      {/* Icon */}
      <div style={{
        width: isMobile ? '40px' : '46px', height: isMobile ? '40px' : '46px',
        borderRadius: '13px',
        background: hovered
          ? `linear-gradient(135deg, ${col.from}, ${col.to})`
          : 'rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: isMobile ? '12px' : '14px',
        transition: 'all 0.3s ease',
        boxShadow: hovered ? `0 6px 18px ${col.glow}` : 'none',
        position: 'relative', zIndex: 1,
      }}>
        <StepIcon index={index} size={isMobile ? 18 : 21} />
      </div>

      {/* Step badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center',
        background: hovered ? col.from + '22' : 'rgba(255,255,255,0.06)',
        border: `1px solid ${hovered ? col.from + '55' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: '20px', padding: '2px 10px', marginBottom: '8px',
        transition: 'all 0.3s ease', position: 'relative', zIndex: 1,
      }}>
        <span style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
          color: hovered ? col.to : 'rgba(255,255,255,0.35)',
          transition: 'color 0.3s ease',
        }}>
          Paso {paso.n}
        </span>
      </div>

      <h3 style={{
        fontSize: isMobile ? '15px' : '17px', fontWeight: 800,
        color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
        marginBottom: '6px', transition: 'color 0.3s ease',
        position: 'relative', zIndex: 1,
      }}>{paso.titulo}</h3>

      <p style={{
        fontSize: '12.5px', lineHeight: 1.6,
        color: hovered ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.38)',
        transition: 'color 0.3s ease',
        position: 'relative', zIndex: 1,
      }}>{paso.desc}</p>
    </motion.div>
  )
}

/* ── Main ──────────────────────────────────────────────────── */
export default function Proceso() {
  const isMobile = useIsMobile()
  const [pasos, setPasos] = useState<PasoItem[]>(pasosEstaticos)

  useEffect(() => { getPasos().then(setPasos) }, [])

  const stats = [
    { icon: StatIcons.clock,   value: '3–6 semanas',  label: 'Tiempo promedio de entrega'         },
    { icon: StatIcons.refresh, value: '2 rondas',     label: 'Revisiones incluidas por etapa'     },
    { icon: StatIcons.whatsapp,value: 'WhatsApp 24/7',label: 'Comunicación directa con tu asesor' },
    { icon: StatIcons.star,    value: '98%',          label: 'Clientes satisfechos con el proceso' },
  ]

  return (
    <section style={{
      background: 'linear-gradient(160deg,#0D0220 0%,#1A0535 55%,#0A0118 100%)',
      padding: isMobile ? '52px 20px' : '80px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grain */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: NOISE, backgroundRepeat: 'repeat', backgroundSize: '250px 250px',
        opacity: 0.04, pointerEvents: 'none', zIndex: 0,
      }} />
      {/* Glow center */}
      <div style={{
        position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '700px', height: '400px',
        background: `radial-gradient(ellipse, ${P}28 0%, transparent 65%)`,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: isMobile ? '28px' : '44px' }}
        >
          <p style={{ color: Y, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            ¿Cómo trabajamos?
          </p>
          <h2 style={{ fontSize: 'clamp(24px,4vw,42px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '12px' }}>
            Un método probado para{' '}
            <span className="gradient-text">resultados reales</span>
          </h2>
          {!isMobile && (
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '15px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.65 }}>
              Cada proyecto sigue etapas que garantizan claridad, calidad y resultados medibles desde el primer día.
            </p>
          )}
        </motion.div>

        {/* Step connector row — desktop only */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px', gap: 0,
            }}
          >
            {pasos.map((p, i) => {
              const col = STEP_COLORS[i % STEP_COLORS.length]
              return (
                <div key={p.n} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{
                    width: '28px', height: '28px', borderRadius: '50%',
                    background: `linear-gradient(135deg, ${col.from}, ${col.to})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: 800, color: '#fff',
                    boxShadow: `0 0 0 3px ${col.from}22, 0 4px 12px ${col.glow}`,
                    flexShrink: 0,
                  }}>{p.n}</div>
                  {i < pasos.length - 1 && (
                    <div style={{
                      width: '80px', height: '1px',
                      background: `linear-gradient(90deg, ${col.to}60, ${STEP_COLORS[(i+1) % STEP_COLORS.length].from}60)`,
                    }} />
                  )}
                </div>
              )
            })}
          </motion.div>
        )}

        {/* Cards grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? '10px' : '14px',
        }}>
          {pasos.map((paso, i) => (
            <PasoCard key={paso._id ?? paso.n} paso={paso} index={i} isMobile={isMobile} />
          ))}
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            marginTop: isMobile ? '20px' : '20px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '20px', padding: isMobile ? '18px 16px' : '22px 36px',
            backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '16px' : '0',
          }}
        >
          {stats.map((s, i) => (
            <div key={s.label} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              paddingRight: !isMobile && i < 3 ? '24px' : '0',
              borderRight: !isMobile && i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              paddingLeft: !isMobile && i > 0 ? '24px' : '0',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: `linear-gradient(135deg, ${STEP_COLORS[i*1+1 % 6].from}, ${STEP_COLORS[i*1+1 % 6].to})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 12px ${STEP_COLORS[i*1+1 % 6].glow}`,
              }}>
                {s.icon}
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.2 }}>{s.value}</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.38)', marginTop: '2px', fontWeight: 500 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: isMobile ? '24px' : '28px' }}
        >
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '13px', marginBottom: '12px' }}>
            ¿Listo para comenzar? El primer paso es tuyo.
          </p>
          <motion.a
            href="#contacto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: `linear-gradient(135deg, ${P}, ${PL})`,
              color: '#fff', padding: '12px 28px', borderRadius: '12px',
              fontWeight: 700, fontSize: '14px', textDecoration: 'none',
              boxShadow: `0 6px 22px ${P}55`,
              transition: 'box-shadow 0.25s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = `0 10px 32px ${P}77`)}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = `0 6px 22px ${P}55`)}
          >
            Agendar reunión inicial
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.a>
        </motion.div>
      </div>
    </section>
  )
}

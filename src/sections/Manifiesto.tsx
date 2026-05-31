import { motion } from 'framer-motion'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'

const principios = [
  { n: '01', titulo: 'Humanización',  desc: 'Mensajes con alma que generan conexiones reales y duraderas.' },
  { n: '02', titulo: 'Estrategia',    desc: 'Cada acción tiene un propósito medible desde el inicio.'       },
  { n: '03', titulo: 'Creatividad',   desc: 'Diseño que inspira, diferencia e impacta en cada contacto.'    },
  { n: '04', titulo: 'Resultados',    desc: 'Decisiones basadas en datos para escalar de forma sostenible.' },
  { n: '05', titulo: 'Autenticidad',  desc: 'Comunicación coherente y alineada con la esencia de tu marca.' },
  { n: '06', titulo: 'Impacto',       desc: 'Convertimos atención en conversiones y relaciones de valor.'   },
]

export default function Manifiesto() {
  const isMobile = useIsMobile()

  return (
    <section style={{
      background: '#0F0A1A',
      padding: isMobile ? '56px 20px' : '80px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Grain texture overlay — profundidad premium */}
      <div aria-hidden="true" style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '250px 250px',
        opacity: 0.04,
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Glow decorativo */}
      <div style={{
        position: 'absolute', top: '-120px', left: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: `radial-gradient(ellipse, ${P}22 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', right: '-80px',
        width: '320px', height: '320px', borderRadius: '50%',
        background: `radial-gradient(ellipse, ${Y}11 0%, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div style={{
        maxWidth: '1100px', margin: '0 auto', position: 'relative',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '40px' : '80px',
        alignItems: isMobile ? 'flex-start' : 'center',
      }}>

        {/* ── Columna izquierda: declaración ── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{ flex: '0 0 auto', width: isMobile ? '100%' : '300px' }}
        >
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            marginBottom: '20px',
          }}>
            <div style={{ width: '24px', height: '2px', background: Y }} />
            <span style={{
              fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px',
              textTransform: 'uppercase', color: Y,
            }}>
              El Manifiesto
            </span>
          </div>

          <h2 style={{
            fontSize: isMobile ? '28px' : 'clamp(28px, 3vw, 38px)',
            fontWeight: 900, lineHeight: 1.1, letterSpacing: '-1px',
            color: '#fff', marginBottom: '16px',
          }}>
            Lo que nos<br />
            <span className="gradient-text-gold">mueve</span> cada día
          </h2>

          <p style={{
            fontSize: '14px', lineHeight: 1.7,
            color: 'rgba(255,255,255,0.45)',
            maxWidth: '260px',
          }}>
            Seis principios que guían cada decisión, cada diseño y cada conversación con nuestros clientes.
          </p>

          {/* Badge */}
          <div style={{
            marginTop: '28px',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            border: `1px solid ${Y}44`,
            borderRadius: '20px', padding: '7px 16px',
          }}>
            <span style={{ fontSize: '14px' }}>✦</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: Y }}>Alma Agencia Creativa</span>
          </div>
        </motion.div>

        {/* ── Columna derecha: lista de principios ── */}
        <div style={{ flex: 1, width: '100%' }}>
          {principios.map((p, i) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, x: 16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              style={{
                display: 'flex',
                alignItems: isMobile ? 'flex-start' : 'center',
                gap: isMobile ? '16px' : '24px',
                padding: isMobile ? '16px 0' : '18px 0',
                borderBottom: i < principios.length - 1
                  ? '1px solid rgba(255,255,255,0.07)'
                  : 'none',
              }}
            >
              {/* Número */}
              <span style={{
                fontSize: '12px', fontWeight: 700,
                color: `${Y}88`,
                letterSpacing: '1px',
                flexShrink: 0,
                width: '24px',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {p.n}
              </span>

              {/* Título */}
              <span style={{
                fontSize: isMobile ? '15px' : '16px',
                fontWeight: 800,
                color: '#fff',
                flexShrink: 0,
                width: isMobile ? '110px' : '140px',
                letterSpacing: '-0.3px',
              }}>
                {p.titulo}
              </span>

              {/* Separador */}
              {!isMobile && (
                <div style={{
                  width: '1px', height: '16px',
                  background: 'rgba(255,255,255,0.15)',
                  flexShrink: 0,
                }} />
              )}

              {/* Descripción */}
              <span style={{
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.45)',
                flex: 1,
              }}>
                {p.desc}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

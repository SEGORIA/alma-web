import { motion } from 'framer-motion'
import { Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { AnimatedCounter } from '../components/AnimatedCounter'
import type { CounterFormat } from '../components/AnimatedCounter'

const stats: { num: number; prefix: string; suffix: string; format: CounterFormat; label: string }[] = [
  { num: 1200, prefix: '+', suffix: '',  format: 'thousands', label: 'estudiantes activos'  },
  { num: 30,   prefix: '',  suffix: '+', format: 'integer',   label: 'recursos descargables' },
  { num: 4.9,  prefix: '',  suffix: '★', format: 'float1',    label: 'valoración promedio'   },
]

export default function Academia() {
  const isMobile = useIsMobile()

  return (
    <section style={{ background: 'linear-gradient(160deg, #0D0220 0%, #1A0535 55%, #0A0118 100%)', padding: isMobile ? '60px 20px' : '100px 24px', overflow: 'hidden', position: 'relative' }}>
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
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        gap: isMobile ? '40px' : '72px',
        position: 'relative', zIndex: 1,
      }}>

        {/* ── Imagen ── */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            flex: '0 0 auto',
            width: isMobile ? '100%' : '480px',
            position: 'relative',
          }}
        >
          {/* Glow de fondo */}
          <div style={{
            position: 'absolute', inset: '-20px',
            background: `radial-gradient(ellipse at 50% 60%, rgba(147,51,234,0.45) 0%, transparent 70%)`,
            borderRadius: '50%',
            pointerEvents: 'none',
            filter: 'blur(32px)',
            zIndex: 0,
          }} />

          {/* Marco decorativo */}
          <div style={{
            position: 'absolute', top: 16, left: 16, right: -16, bottom: -16,
            border: `2px solid ${Y}`,
            borderRadius: '24px',
            opacity: 0.35,
            zIndex: 0,
          }} />

          {/* Foto real */}
          <img
            src="/academia-hero.jpg"
            alt="Aprende diseño y marketing con Alma"
            loading="lazy"
            style={{
              width: '100%',
              height: isMobile ? '280px' : '420px',
              objectFit: 'cover',
              objectPosition: 'center top',
              borderRadius: '20px',
              display: 'block',
              position: 'relative',
              zIndex: 1,
              boxShadow: '0 32px 80px rgba(0,0,0,0.45)',
            }}
          />

          {/* Badge flotante — amarillo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 12 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              position: 'absolute',
              bottom: isMobile ? '-18px' : '-22px',
              left: isMobile ? '16px' : '24px',
              zIndex: 2,
              background: Y,
              borderRadius: '14px',
              padding: '12px 18px',
              display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '22px', lineHeight: 1 }}>🎓</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 900, color: '#111', margin: 0, lineHeight: 1.2 }}>
                Academia Alma
              </p>
              <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.55)', margin: 0 }}>
                Recursos para marcas creativas
              </p>
            </div>
          </motion.div>

          {/* Badge flotante — morado */}
          {!isMobile && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -12 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.55 }}
              style={{
                position: 'absolute',
                top: '-18px',
                right: '-12px',
                zIndex: 2,
                background: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(14px)',
                border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: '14px',
                padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              <span style={{ fontSize: '18px', lineHeight: 1 }}>✨</span>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#fff', margin: 0 }}>
                Nuevo contenido cada semana
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* ── Texto ── */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          style={{
            flex: 1,
            paddingTop: isMobile ? '36px' : 0,
          }}
        >
          <p style={{
            color: Y, fontSize: '12px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Academia Alma
          </p>
          <h2 style={{
            fontSize: isMobile ? 'clamp(24px,6vw,36px)' : 'clamp(28px,3.5vw,44px)',
            fontWeight: 900, color: '#fff',
            letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '18px',
          }}>
            Aprende a construir<br />
            <span className="gradient-text-gold">marcas que perduran</span>
          </h2>
          <p style={{
            fontSize: isMobile ? '15px' : '16px',
            color: 'rgba(255,255,255,0.72)',
            lineHeight: 1.75, marginBottom: '32px',
          }}>
            Guías prácticas, plantillas profesionales y formación estratégica para que tu marca crezca con intención, creatividad y resultados reales.
          </p>

          {/* Stats */}
          <div style={{
            display: 'flex', gap: isMobile ? '16px' : '24px',
            marginBottom: '36px', flexWrap: 'wrap',
          }}>
            {stats.map(s => (
              <div key={s.label}>
                <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1 }}>
                  <AnimatedCounter value={s.num} prefix={s.prefix} suffix={s.suffix} format={s.format} duration={1.8} />
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', fontWeight: 500 }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="https://edu.almaagenciacreativa.com"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: Y, color: '#111',
                padding: isMobile ? '14px 24px' : '15px 32px',
                borderRadius: '12px', fontWeight: 800, fontSize: '15px',
                textDecoration: 'none', transition: 'all 0.2s ease',
                flex: isMobile ? 1 : 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(250,204,21,0.35)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#EAB308'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = Y; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Explorar la Academia →
            </a>
            <a
              href="https://edu.almaagenciacreativa.com"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.08)',
                border: '1.5px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.85)',
                padding: isMobile ? '14px 20px' : '15px 24px',
                borderRadius: '12px', fontWeight: 700, fontSize: '14px',
                textDecoration: 'none', transition: 'all 0.2s ease',
                flex: isMobile ? 1 : 'none',
                justifyContent: 'center',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              Ver recursos gratis
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

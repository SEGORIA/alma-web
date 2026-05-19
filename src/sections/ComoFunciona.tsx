import { motion } from 'framer-motion'

const GRAD = `linear-gradient(135deg,#8B35E8,#C026D3)`

const pasos = [
  { n: '1', titulo: 'Importa', desc: 'Carga tu base de datos de forma rápida y segura.' },
  { n: '2', titulo: 'Segmenta', desc: 'Crea audiencias inteligentes y precisas.' },
  { n: '3', titulo: 'Comunica', desc: 'Envía campañas personalizadas y efectivas.' },
  { n: '4', titulo: 'Interactúa', desc: 'Gestiona respuestas desde la bandeja central.' },
  { n: '5', titulo: 'Mide', desc: 'Analiza resultados y optimiza tus acciones.' },
  { n: '6', titulo: 'Convierte', desc: 'Genera relaciones, fidelización y ventas.' },
]

const porQue = [
  { titulo: 'Estratégico', desc: 'No solo enviamos mensajes, diseñamos estrategias que generan impacto.', icon: '🎯' },
  { titulo: 'Creativo', desc: 'Combinamos creatividad, tecnología y automatización para experiencias únicas.', icon: '💡' },
  { titulo: 'Auténtico', desc: 'Mensajes que conectan de verdad, con propósito y coherencia.', icon: '❤️' },
  { titulo: 'Orientado a resultados', desc: 'Decisiones basadas en datos para crecer de forma sostenible y medible.', icon: '📈' },
]

export default function ComoFunciona() {
  return (
    <>
      {/* Cómo funciona */}
      <section style={{
        position: 'relative', zIndex: 1, padding: '100px 24px',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <p style={{
              color: '#A855F7', fontSize: '12px', fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px',
            }}>Cómo funciona</p>
            <h2 style={{
              fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900,
              letterSpacing: '-1px', lineHeight: 1.1,
            }}>
              De cero a resultados{' '}
              <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                en 6 pasos
              </span>
            </h2>
          </motion.div>

          {/* Steps */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {pasos.map((p, i) => (
              <motion.div
                key={p.titulo}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                style={{
                  display: 'flex', gap: '16px', alignItems: 'flex-start',
                  background: '#13132a',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px', padding: '24px',
                }}
              >
                <span style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: GRAD, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 900, fontSize: '16px', flexShrink: 0,
                }}>
                  {p.n}
                </span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>{p.titulo}</h3>
                  <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Por qué Alma */}
      <section style={{ position: 'relative', zIndex: 1, padding: '100px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '56px' }}
          >
            <p style={{
              color: '#A855F7', fontSize: '12px', fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px',
            }}>Por qué Alma</p>
            <h2 style={{
              fontSize: 'clamp(28px,5vw,48px)', fontWeight: 900, letterSpacing: '-1px',
            }}>
              Más que una{' '}
              <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                herramienta
              </span>
            </h2>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {porQue.map((item, i) => (
              <motion.div
                key={item.titulo}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                style={{
                  background: 'rgba(139,53,232,0.08)',
                  border: '1px solid rgba(139,53,232,0.2)',
                  borderRadius: '18px', padding: '28px 24px', textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '14px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '10px' }}>{item.titulo}</h3>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

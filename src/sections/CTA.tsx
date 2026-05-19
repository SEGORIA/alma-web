import { motion } from 'framer-motion'

const GRAD = `linear-gradient(135deg,#8B35E8,#C026D3)`
const WA_URL = 'https://wa.me/573013369325?text=Hola%2C%20quiero%20agendar%20una%20asesor%C3%ADa%20con%20Alma%20Agencia%20Creativa'

export default function CTA() {
  return (
    <section style={{
      position: 'relative', zIndex: 1, padding: '80px 24px 120px',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{
          maxWidth: '760px', margin: '0 auto',
          background: 'linear-gradient(135deg,rgba(139,53,232,0.22),rgba(192,38,211,0.14))',
          border: '1px solid rgba(139,53,232,0.3)',
          borderRadius: '28px', padding: '64px 40px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '300px',
          background: 'radial-gradient(ellipse,rgba(139,53,232,0.3) 0%,transparent 70%)',
          pointerEvents: 'none',
        }} />

        <p style={{
          color: '#A855F7', fontSize: '12px', fontWeight: 700,
          letterSpacing: '2px', textTransform: 'uppercase',
          marginBottom: '16px', position: 'relative',
        }}>
          Alma Agencia Creativa
        </p>

        <h2 style={{
          fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900,
          lineHeight: 1.1, letterSpacing: '-1px',
          marginBottom: '16px', position: 'relative',
        }}>
          Lleva tu comunicación al{' '}
          <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            siguiente nivel
          </span>
        </h2>

        <p style={{
          color: 'rgba(255,255,255,0.55)', fontSize: '16px', lineHeight: 1.65,
          maxWidth: '460px', margin: '0 auto 36px', position: 'relative',
        }}>
          Hablemos y construyamos juntos la estrategia que tu negocio necesita para crecer a través de WhatsApp.
        </p>

        <motion.a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: '#25D366', color: '#fff',
            padding: '16px 36px', borderRadius: '14px',
            fontWeight: 700, fontSize: '16px', textDecoration: 'none',
            boxShadow: '0 0 40px rgba(37,211,102,0.35)',
            position: 'relative',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Hablemos por WhatsApp
        </motion.a>

        {/* Contacto */}
        <div style={{
          display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap',
          marginTop: '36px', position: 'relative',
        }}>
          {[
            { icon: '📞', text: '+57 301 336 9325' },
            { icon: '✉️', text: 'hola@almaagenciacreativa.com' },
            { icon: '📱', text: '@almaagenciacreativa' },
          ].map(c => (
            <span key={c.text} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'rgba(255,255,255,0.4)',
            }}>
              {c.icon} {c.text}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

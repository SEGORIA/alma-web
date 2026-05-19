import { motion } from 'framer-motion'

const V = '#8B35E8'
const VL = '#A855F7'
const GRAD = `linear-gradient(135deg,${V},#C026D3)`
const WA_URL = 'https://wa.me/573013369325?text=Hola%2C%20quiero%20agendar%20una%20asesor%C3%ADa%20con%20Alma%20Agencia%20Creativa'

export default function Hero() {
  return (
    <section style={{
      position: 'relative', zIndex: 1, minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px', textAlign: 'center',
    }}>
      {/* Glow */}
      <div style={{
        position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '600px',
        background: 'radial-gradient(ellipse,rgba(139,53,232,0.22) 0%,transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <motion.img
        src="/alma-logo.png"
        alt="Alma Agencia Creativa"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ height: '100px', width: 'auto', marginBottom: '40px', position: 'relative' }}
      />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(139,53,232,0.15)', border: '1px solid rgba(139,53,232,0.3)',
          color: VL, fontSize: '12px', fontWeight: 600,
          padding: '6px 16px', borderRadius: '20px', marginBottom: '28px',
          letterSpacing: '1px', textTransform: 'uppercase',
        }}
      >
        Agencia Creativa · WhatsApp Marketing
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: 'clamp(40px,7vw,72px)', fontWeight: 900,
          lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '12px',
        }}
      >
        Conecta.{' '}
        <span style={{ background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Comunica.
        </span>
        {' '}Convierte.
      </motion.h1>

      {/* Sub */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.55 }}
        style={{
          maxWidth: '560px', fontSize: '18px', lineHeight: 1.65,
          color: 'rgba(255,255,255,0.55)', marginBottom: '44px',
        }}
      >
        Soluciones de comunicación conversacional para relaciones más cercanas,
        experiencias memorables y resultados reales.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}
      >
        <motion.a
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '10px',
            background: '#25D366', color: '#fff',
            padding: '16px 32px', borderRadius: '14px',
            fontWeight: 700, fontSize: '15px', textDecoration: 'none',
            boxShadow: '0 0 32px rgba(37,211,102,0.3)',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Agenda tu asesoría gratis
        </motion.a>

        <motion.a
          href="#servicios"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(139,53,232,0.15)', border: '1px solid rgba(139,53,232,0.35)',
            color: '#fff', padding: '16px 32px', borderRadius: '14px',
            fontWeight: 600, fontSize: '15px', textDecoration: 'none',
          }}
        >
          Ver servicios
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </motion.a>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.9 }}
        style={{
          display: 'flex', gap: '48px', marginTop: '72px', flexWrap: 'wrap', justifyContent: 'center',
        }}
      >
        {[
          { n: '12.5K+', label: 'Mensajes enviados' },
          { n: '98%', label: 'Tasa de entrega' },
          { n: '3x', label: 'Más conversiones' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '32px', fontWeight: 900, lineHeight: 1,
              background: GRAD, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>{s.n}</p>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginTop: '6px' }}>{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  )
}

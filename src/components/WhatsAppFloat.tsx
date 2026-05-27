import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '../hooks/useIsMobile'
import { getContactoInfo } from '../lib/db'
import { contactoDefault } from '../data/config'

const WA_GREEN      = '#25D366'
const WA_GREEN_DARK = '#1DAF59'

const WaIcon = ({ size = 26 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
)

export default function WhatsAppFloat() {
  const isMobile              = useIsMobile()
  const [hovered, setHovered] = useState(false)
  const [visible, setVisible] = useState(false)
  const [wa,      setWa]      = useState(`https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    getContactoInfo().then(c =>
      setWa(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`)
    )
  }, [])

  if (!visible) return null

  /* ── Mobile: barra sticky completa ── */
  if (isMobile) {
    return (
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200, willChange: 'transform' }}
      >
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contactar por WhatsApp"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
            background: WA_GREEN, color: '#fff',
            padding: '14px 24px',
            fontWeight: 700, fontSize: '15px', textDecoration: 'none',
            boxShadow: '0 -6px 24px rgba(37,211,102,0.25)',
            paddingBottom: 'calc(14px + env(safe-area-inset-bottom))',
          }}
        >
          <WaIcon size={22} />
          Habla con nosotros por WhatsApp →
        </a>
      </motion.div>
    )
  }

  /* ── Desktop: botón flotante con pulse ── */
  return (
    <div style={{ position: 'fixed', bottom: '28px', right: '28px', zIndex: 200 }}>

      {/* Anillos de pulso */}
      <motion.div
        animate={{ scale: [1, 1.75], opacity: [0.4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: WA_GREEN, pointerEvents: 'none' }}
      />
      <motion.div
        animate={{ scale: [1, 1.42], opacity: [0.3, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.35 }}
        style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: WA_GREEN, pointerEvents: 'none' }}
      />

      {/* Tooltip */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0,  scale: 1    }}
            exit={{ opacity: 0,  x: 10,  scale: 0.95 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', right: '72px', top: '50%', transform: 'translateY(-50%)',
              background: '#111827', color: '#fff',
              padding: '9px 14px', borderRadius: '10px',
              fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              pointerEvents: 'none',
            }}
          >
            ¡Chateemos ahora!
            {/* Arrow */}
            <span style={{
              position: 'absolute', right: '-6px', top: '50%', transform: 'translateY(-50%)',
              width: 0, height: 0,
              borderTop: '5px solid transparent', borderBottom: '5px solid transparent',
              borderLeft: '6px solid #111827',
            }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón */}
      <motion.a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        title="Chatea con Alma"
        style={{
          position: 'relative',
          width: '58px', height: '58px', borderRadius: '50%',
          background: hovered ? WA_GREEN_DARK : WA_GREEN,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: hovered
            ? '0 8px 32px rgba(37,211,102,0.5)'
            : '0 6px 24px rgba(37,211,102,0.35)',
          textDecoration: 'none',
          transform: hovered ? 'scale(1.1)' : 'scale(1)',
          transition: 'background 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease',
        }}
      >
        <WaIcon size={28} />
      </motion.a>
    </div>
  )
}

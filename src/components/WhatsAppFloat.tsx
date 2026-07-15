import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '../hooks/useIsMobile'
import { getContactoInfo } from '../lib/db'
import { contactoDefault } from '../data/config'
import WaIcon from './WhatsAppIcon'

const WA_GREEN      = '#25D366'
const WA_GREEN_DARK = '#1DAF59'

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

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { P } from '../tokens'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Volver al inicio"
          title="Volver al inicio"
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '28px',
            zIndex: 190,
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: '#fff',
            border: `2px solid ${P}28`,
            boxShadow: '0 4px 20px rgba(107,33,168,0.18)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: P,
            lineHeight: 1,
            transition: 'background 0.2s, color 0.2s, box-shadow 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => {
            const b = e.currentTarget
            b.style.background = P
            b.style.color = '#fff'
            b.style.boxShadow = '0 6px 24px rgba(107,33,168,0.35)'
            b.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={e => {
            const b = e.currentTarget
            b.style.background = '#fff'
            b.style.color = P
            b.style.boxShadow = '0 4px 20px rgba(107,33,168,0.18)'
            b.style.transform = 'translateY(0)'
          }}
        >
          ↑
        </motion.button>
      )}
    </AnimatePresence>
  )
}

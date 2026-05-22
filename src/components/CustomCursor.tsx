import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { P, Y } from '../tokens'

export default function CustomCursor() {
  const [hovering, setHovering] = useState(false)
  const [visible, setVisible]   = useState(false)

  const mx = useMotionValue(-100)
  const my = useMotionValue(-100)

  // Dot: follows precisely
  const dotX = useSpring(mx, { stiffness: 600, damping: 40 })
  const dotY = useSpring(my, { stiffness: 600, damping: 40 })

  // Ring: trails with lag
  const ringX = useSpring(mx, { stiffness: 180, damping: 28 })
  const ringY = useSpring(my, { stiffness: 180, damping: 28 })

  useEffect(() => {
    // Don't show on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return

    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX)
      my.set(e.clientY)
      setVisible(true)
    }

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement
      setHovering(!!t.closest('a, button, [role="button"], input, textarea, select'))
    }

    const onLeave = () => setVisible(false)

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseover', onOver)
    document.addEventListener('mouseleave', onLeave)

    return () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseover', onOver)
      document.removeEventListener('mouseleave', onLeave)
    }
  }, [mx, my])

  // Hide native cursor
  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return
    const style = document.createElement('style')
    style.innerHTML = `* { cursor: none !important; } input, textarea, select { cursor: text !important; }`
    document.head.appendChild(style)
    return () => { document.head.removeChild(style) }
  }, [])

  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return null

  const DOT  = 8
  const RING = 38

  return (
    <>
      {/* Ring */}
      <motion.div
        style={{
          position: 'fixed',
          left: -(RING / 2),
          top: -(RING / 2),
          x: ringX,
          y: ringY,
          width: RING,
          height: RING,
          border: `1.5px solid ${hovering ? Y : P}`,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: visible ? (hovering ? 0.7 : 0.4) : 0,
          transition: 'border-color 0.2s ease, opacity 0.3s ease',
        }}
        animate={{ scale: hovering ? 1.5 : 1 }}
        transition={{ scale: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } }}
      />

      {/* Dot */}
      <motion.div
        style={{
          position: 'fixed',
          left: -(DOT / 2),
          top: -(DOT / 2),
          x: dotX,
          y: dotY,
          width: DOT,
          height: DOT,
          background: hovering ? Y : P,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          opacity: visible ? 1 : 0,
          transition: 'background 0.2s ease, opacity 0.3s ease',
        }}
        animate={{ scale: hovering ? 0.6 : 1 }}
        transition={{ scale: { duration: 0.2 } }}
      />
    </>
  )
}

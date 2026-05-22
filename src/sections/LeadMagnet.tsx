import { useState } from 'react'
import { motion } from 'framer-motion'
import { P, Y, PHONE } from '../tokens'

export default function LeadMagnet() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    const texto = `Hola, quiero recibir la guía de Instagram con IA. Mi correo es: ${email.trim()}`
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(texto)}`, '_blank')
    setSent(true)
  }

  return (
    <section style={{ background: '#fff', padding: '80px 24px' }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        style={{
          maxWidth: '640px', margin: '0 auto', textAlign: 'center',
          border: '2px solid #E5E7EB', borderRadius: '24px',
          padding: '56px 40px',
          boxShadow: '0 8px 40px rgba(107,33,168,0.07)',
        }}
      >
        <div style={{ fontSize: '40px', marginBottom: '20px' }}>🎁</div>
        <h2 style={{ fontSize: 'clamp(22px,3.5vw,34px)', fontWeight: 900, color: '#111827', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          ¿Quieres optimizar tu ecosistema digital hoy?
        </h2>
        <p style={{ fontSize: '16px', color: '#6B7280', lineHeight: 1.65, marginBottom: '32px' }}>
          Descarga gratis nuestra guía de Instagram con inteligencia artificial y lleva tu marca al siguiente nivel.
        </p>

        {sent ? (
          <div style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: '14px', padding: '20px', color: '#166534', fontWeight: 600 }}>
            ¡Listo! Revisa tu correo — te enviamos la guía 📩
          </div>
        ) : (
          <form onSubmit={handle} style={{ display: 'flex', maxWidth: '480px', margin: '0 auto' }}>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              style={{
                flex: 1, padding: '14px 18px',
                border: '2px solid #E5E7EB', borderRight: 'none',
                borderRadius: '12px 0 0 12px',
                fontSize: '15px', color: '#111', outline: 'none',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = Y)}
              onBlur={e => (e.currentTarget.style.borderColor = '#E5E7EB')}
            />
            <button
              type="submit"
              style={{
                background: P, color: '#fff',
                padding: '14px 24px',
                borderRadius: '0 12px 12px 0',
                border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#581C87')}
              onMouseLeave={e => (e.currentTarget.style.background = P)}
            >
              Descargar Gratis
            </button>
          </form>
        )}
      </motion.div>
    </section>
  )
}

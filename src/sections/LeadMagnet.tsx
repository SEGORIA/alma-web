import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { P, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getContactoInfo } from '../lib/db'
import { contactoDefault } from '../data/config'

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="17" r="1" fill="currentColor"/>
  </svg>
)
const BrushIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
)
const ChartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const StarIcon = ({ size = 14, color = '#6B21A8' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
)
const CelebrationIcon = ({ size = 32 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2l2.4 4.8 5.4.8-3.9 3.8.9 5.4L12 14.5l-4.8 2.3.9-5.4L4.2 7.6l5.4-.8L12 2z" stroke="#166534" strokeWidth="1.5" strokeLinejoin="round" fill="rgba(22,101,52,0.15)"/>
    <path d="M5 3l1 3M19 3l-1 3M3 12H1M23 12h-2M5.5 18.5l-1.5 1.5M18.5 18.5l1.5 1.5" stroke="#166534" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)
const GiftIcon = ({ size = 22, color = 'white' }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20 12v10H4V12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 7H2v5h20V7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 22V7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const recursos: { icon: React.ReactNode; texto: string }[] = [
  { icon: <PhoneIcon />, texto: '7 hacks de Instagram con IA' },
  { icon: <BrushIcon />, texto: 'Plantillas de contenido editables' },
  { icon: <ChartIcon />, texto: 'Guía de métricas clave para marcas' },
]

export default function LeadMagnet() {
  const isMobile              = useIsMobile()
  const [email, setEmail]     = useState('')
  const [focused, setFocused] = useState(false)
  const [sent, setSent]       = useState(false)
  const [phone, setPhone]     = useState(contactoDefault.whatsapp)

  useEffect(() => {
    getContactoInfo().then(c => setPhone(c.whatsapp))
  }, [])

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    const texto = `Hola, quiero recibir el kit gratuito de Alma. Mi correo es: ${email.trim()}`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(texto)}`, '_blank')
    setSent(true)
  }

  return (
    <section style={{
      background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 50%, #F5F3FF 100%)',
      padding: isMobile ? '60px 20px' : '100px 24px',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Blobs */}
      <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(107,33,168,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(250,204,21,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '32px' : '64px',
      }}>

        {/* Visual mockup — hidden on mobile */}
        {!isMobile && (
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: '1 1 300px', display: 'flex', justifyContent: 'center' }}
          >
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', boxShadow: '0 24px 80px rgba(107,33,168,0.14)', border: '1px solid rgba(107,33,168,0.08)' }}>
                <div style={{ background: `linear-gradient(135deg, ${P}, #9333EA)`, borderRadius: '12px', padding: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><GiftIcon size={22} color="white" /></div>
                  <div>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: 600, marginBottom: '3px' }}>KIT GRATUITO</p>
                    <p style={{ color: '#fff', fontSize: '14px', fontWeight: 800, lineHeight: 1.2 }}>Crece tu marca digital</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recursos.map((r, i) => (
                    <motion.div
                      key={r.texto}
                      initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', borderRadius: '10px', background: '#F9FAFB', border: '1px solid #F3F4F6' }}
                    >
                      <span style={{ fontSize: '18px' }}>{r.icon}</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{r.texto}</span>
                      <span style={{ marginLeft: 'auto', color: '#10B981', fontWeight: 700, fontSize: '14px' }}>✓</span>
                    </motion.div>
                  ))}
                </div>
                <div style={{ marginTop: '20px', padding: '10px 16px', borderRadius: '10px', background: Y, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>Valor total</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#92400E', textDecoration: 'line-through', fontWeight: 500 }}>$150.000</span>
                    <span style={{ fontSize: '15px', fontWeight: 900, color: '#111' }}>GRATIS</span>
                  </div>
                </div>
              </div>
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', top: '-16px', right: '-16px', background: '#fff', boxShadow: '0 8px 24px rgba(107,33,168,0.15)', borderRadius: '20px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(107,33,168,0.1)' }}
              >
                <StarIcon size={14} color="#6B21A8" />
                <span style={{ fontSize: '12px', fontWeight: 700, color: P }}>+500 descargas</span>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Text + form */}
        <motion.div
          initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ flex: '1 1 300px', maxWidth: isMobile ? '100%' : '480px' }}
        >
          {/* Mobile: mini kit summary */}
          {isMobile && (
            <div style={{ background: '#fff', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', border: '1px solid rgba(107,33,168,0.1)', boxShadow: '0 4px 20px rgba(107,33,168,0.08)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg,${P},#9333EA)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><GiftIcon size={18} color="white" /></div>
                <div>
                  <p style={{ fontSize: '12px', color: P, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Kit gratuito incluye</p>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {recursos.map(r => (
                  <div key={r.texto} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#374151', fontWeight: 500 }}>
                    <span>{r.icon}</span><span>{r.texto}</span>
                    <span style={{ marginLeft: 'auto', color: '#10B981', fontWeight: 700 }}>✓</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Recurso gratuito
          </p>
          <h2 style={{ fontSize: isMobile ? 'clamp(22px,6vw,32px)' : 'clamp(26px,3.5vw,40px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '14px' }}>
            Descarga el kit que necesita{' '}
            <span style={{ color: P }}>tu marca digital</span>
          </h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#4B5563', lineHeight: 1.7, marginBottom: '24px' }}>
            Herramientas prácticas con IA para que gestiones tus redes, crees contenido y hagas crecer tu marca — sin agencia, sin estrés.
          </p>

          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              style={{ background: '#F0FDF4', border: '2px solid #86EFAC', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
            >
              <CelebrationIcon size={40} />
              <p style={{ color: '#166534', fontWeight: 700, fontSize: '16px', textAlign: 'center' }}>¡Te lo enviamos por WhatsApp ahora mismo!</p>
            </motion.div>
          ) : (
            <form onSubmit={handle}>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                borderRadius: isMobile ? '14px' : '14px',
                overflow: 'hidden',
                boxShadow: focused ? '0 0 0 3px rgba(107,33,168,0.2)' : '0 4px 16px rgba(0,0,0,0.06)',
                transition: 'box-shadow 0.2s ease',
                border: `2px solid ${focused ? P : '#E5E7EB'}`,
                gap: isMobile ? '0' : '0',
              }}>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                  placeholder="tu@correo.com"
                  style={{ flex: 1, padding: '15px 18px', border: 'none', outline: 'none', fontSize: '15px', color: '#111', background: '#fff' }}
                />
                <button
                  type="submit"
                  style={{
                    background: P, color: '#fff',
                    padding: isMobile ? '15px' : '15px 24px',
                    border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '14px',
                    whiteSpace: 'nowrap', transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#581C87')}
                  onMouseLeave={e => (e.currentTarget.style.background = P)}
                >
                  Quiero el kit →
                </button>
              </div>
              <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '10px', textAlign: 'center' }}>Sin spam. Solo recursos que realmente sirven.</p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { P, PL, PD, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'
import { getContactoInfo } from '../lib/db'
import { contactoDefault } from '../data/config'
import type { ContactoInfo } from '../data/config'

/* EmailJS env vars */
const EJ_SERVICE  = import.meta.env.VITE_EMAILJS_SERVICE_ID  as string | undefined
const EJ_TEMPLATE = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string | undefined
const EJ_KEY      = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  as string | undefined
const EMAILJS_OK  = !!(EJ_SERVICE && EJ_TEMPLATE && EJ_KEY)

const NOISE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)'/%3E%3C/svg%3E")`

const SERVICES = [
  { id: 'Desarrollo Web',     icon: '💻' },
  { id: 'Branding',           icon: '🎨' },
  { id: 'Marketing Digital',  icon: '📱' },
  { id: 'Foto & Video',       icon: '📸' },
  { id: 'Estrategia Digital', icon: '🎯' },
]

/* ── Contact info card ──────────────────────────────────────── */
function ContactCard({
  iconBg, icon, label, value, href, delay,
}: {
  iconBg: string; icon: React.ReactNode; label: string; value: string; href?: string; delay: number
}) {
  const [hovered, setHovered] = useState(false)
  const content = (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ x: 6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        background: hovered ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: '16px', padding: '14px 18px',
        transition: 'all 0.25s ease',
        cursor: href ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
    >
      <div style={{
        width: '42px', height: '42px', borderRadius: '12px',
        background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.35)' : '0 3px 10px rgba(0,0,0,0.25)',
        transition: 'box-shadow 0.25s ease',
      }}>
        {icon}
      </div>
      <div>
        <p style={{
          fontSize: '10px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.38)', marginBottom: '3px',
        }}>{label}</p>
        <p style={{ fontSize: '14px', fontWeight: 700, color: '#fff', margin: 0 }}>{value}</p>
      </div>
      {href && (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginLeft: 'auto', opacity: hovered ? 0.7 : 0.25, transition: 'opacity 0.2s' }}>
          <path d="M7 17L17 7M17 7H7M17 7V17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', display: 'block' }}>
        {content}
      </a>
    )
  }
  return content
}

/* ── Premium Field ──────────────────────────────────────────── */
function PremiumField({ label, type = 'text', name, placeholder, multiline = false, required = false, onChange }: {
  label: string; type?: string; name: string; placeholder: string
  multiline?: boolean; required?: boolean; onChange?: (v: string) => void
}) {
  const [focused,  setFocused]  = useState(false)
  const [charLen,  setCharLen]  = useState(0)
  const MAX_CHARS = multiline ? 500 : undefined
  const fieldId = `contact-${name}`
  const base: React.CSSProperties = {
    width: '100%', padding: '13px 16px',
    background: focused ? 'rgba(107,33,168,0.1)' : 'rgba(255,255,255,0.05)',
    border: `1.5px solid ${focused ? P + 'BB' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none',
    transition: 'all 0.25s ease', boxSizing: 'border-box' as const,
    boxShadow: focused ? `0 0 0 3px ${P}22, 0 4px 20px ${P}11` : 'none',
  }
  const handleChange = (v: string) => {
    setCharLen(v.length)
    onChange?.(v)
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
        <label htmlFor={fieldId} style={{
          fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
          color: focused ? Y : 'rgba(255,255,255,0.45)',
          transition: 'color 0.2s ease',
        }}>
          {label}{required && <span style={{ color: Y, marginLeft: '3px' }}>*</span>}
        </label>
        {MAX_CHARS !== undefined && (
          <span style={{ fontSize: '11px', color: charLen > MAX_CHARS * 0.85 ? Y : 'rgba(255,255,255,0.28)', fontWeight: 600 }}>
            {charLen}/{MAX_CHARS}
          </span>
        )}
      </div>
      {multiline
        ? <textarea id={fieldId} name={name} placeholder={placeholder} rows={4} required={required}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={e => handleChange(e.target.value)}
            style={{ ...base, resize: 'vertical' }} />
        : <input id={fieldId} type={type} name={name} placeholder={placeholder} required={required}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            onChange={e => handleChange(e.target.value)}
            style={base} />
      }
    </div>
  )
}

/* ── Service chips ──────────────────────────────────────────── */
function ServiceChips({ selected, onSelect }: { selected: string; onSelect: (s: string) => void }) {
  return (
    <div>
      <p style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)', marginBottom: '10px',
      }}>
        Servicio de interés <span style={{ color: Y }}>*</span>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {SERVICES.map((s, i) => {
          const active = selected === s.id
          return (
            <motion.button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 13px', borderRadius: '10px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600,
                background: active ? `linear-gradient(135deg, ${P}, ${PL})` : 'rgba(255,255,255,0.06)',
                color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                border: `1.5px solid ${active ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                boxShadow: active ? `0 4px 18px ${P}55` : 'none',
                transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              }}
            >
              <span style={{ fontSize: '14px' }}>{s.icon}</span>
              {s.id}
              <AnimatePresence>
                {active && (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, scale: 0.5, width: 0 }}
                    animate={{ opacity: 1, scale: 1, width: 'auto' }}
                    exit={{ opacity: 0, scale: 0.5, width: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ overflow: 'hidden', display: 'inline-flex', color: Y }}
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function Contacto() {
  const isMobile = useIsMobile()
  const [sent,       setSent]       = useState(false)
  const [sending,    setSending]    = useState(false)
  const [error,      setError]      = useState('')
  const [contacto,   setContacto]   = useState<ContactoInfo>(contactoDefault)
  const [servicio,   setServicio]   = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => { getContactoInfo().then(setContacto) }, [])

  const WA    = `https://wa.me/${contacto.whatsapp}?text=Hola%2C%20quiero%20iniciar%20un%20proyecto%20con%20Alma`
  const PHONE = contacto.whatsapp

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const form     = e.currentTarget as HTMLFormElement
    const nombre   = (form.elements.namedItem('nombre')   as HTMLInputElement).value.trim()
    const email    = (form.elements.namedItem('email')    as HTMLInputElement).value.trim()
    const mensaje  = (form.elements.namedItem('mensaje')  as HTMLTextAreaElement).value.trim()

    if (!nombre || !email || !servicio || !mensaje) {
      setError('Por favor completa todos los campos obligatorios (*).')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Por favor ingresa un correo electrónico válido.')
      return
    }

    if (EMAILJS_OK && formRef.current) {
      setSending(true)
      try {
        await emailjs.sendForm(EJ_SERVICE!, EJ_TEMPLATE!, formRef.current, { publicKey: EJ_KEY! })
        setSent(true)
      } catch (err) {
        console.error('EmailJS error:', err)
        setError('No pudimos enviar el correo. Por favor escríbenos directo por WhatsApp.')
        window.open(
          `https://wa.me/${PHONE}?text=${encodeURIComponent(`Hola, soy ${nombre}. Me interesa: ${servicio}. ${mensaje}`)}`,
          '_blank'
        )
      } finally {
        setSending(false)
      }
    } else {
      window.open(
        `https://wa.me/${PHONE}?text=${encodeURIComponent(`Hola, soy ${nombre}. Me interesa: ${servicio}. ${mensaje}`)}`,
        '_blank'
      )
      setSent(true)
    }
  }

  const infoCards = [
    {
      label: 'WhatsApp', href: WA,
      value: '+57 ' + contacto.whatsapp.replace(/^57/, ''),
      iconBg: 'linear-gradient(135deg, #25D366, #128C7E)',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      ),
    },
    {
      label: 'Teléfono', href: `tel:+${contacto.whatsapp}`,
      value: contacto.telefono,
      iconBg: `linear-gradient(135deg, ${P}, ${PL})`,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
        </svg>
      ),
    },
    {
      label: 'Email', href: `mailto:${contacto.email}`,
      value: contacto.email,
      iconBg: 'linear-gradient(135deg, #DB2777, #EC4899)',
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
          <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
        </svg>
      ),
    },
    {
      label: 'Ubicación', href: undefined,
      value: contacto.ubicacion,
      iconBg: `linear-gradient(135deg, ${Y}, #F59E0B)`,
      icon: (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      ),
    },
  ]

  return (
    <>
      <section style={{
        background: 'linear-gradient(155deg, #1E0B3B 0%, #2D1060 45%, #150829 100%)',
        padding: isMobile ? '60px 20px' : '100px 24px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Grain */}
        <div aria-hidden="true" style={{
          position: 'absolute', inset: 0,
          backgroundImage: NOISE, backgroundRepeat: 'repeat', backgroundSize: '250px 250px',
          opacity: 0.04, pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Glow top-left */}
        <div style={{
          position: 'absolute', top: '-180px', left: '-100px',
          width: '600px', height: '500px',
          background: `radial-gradient(ellipse, ${P}30 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />
        {/* Glow bottom-right */}
        <div style={{
          position: 'absolute', bottom: '-100px', right: '-80px',
          width: '400px', height: '400px',
          background: `radial-gradient(ellipse, ${Y}18 0%, transparent 65%)`,
          pointerEvents: 'none', zIndex: 0,
        }} />

        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1.1fr',
          gap: isMobile ? '48px' : '72px',
          position: 'relative', zIndex: 1,
        }}>

          {/* ── Left column ── */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            {/* Status badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
                borderRadius: '20px', padding: '6px 14px',
                marginBottom: '24px', alignSelf: 'flex-start',
              }}
            >
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%', background: '#10B981',
                boxShadow: '0 0 0 3px rgba(16,185,129,0.2)',
                display: 'block', flexShrink: 0,
                animation: 'pulse-ring 1.4s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#34D399' }}>
                Disponibles · Respondemos en &lt;24h
              </span>
            </motion.div>

            {/* Eyebrow */}
            <p style={{ color: Y, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '14px' }}>
              Contacto
            </p>

            {/* Heading */}
            <h2 style={{
              fontSize: isMobile ? 'clamp(26px,7vw,38px)' : 'clamp(30px,3.5vw,46px)',
              fontWeight: 900, color: '#fff',
              letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: '16px',
            }}>
              Hablemos y<br />
              <span className="gradient-text">empecemos a crear</span>
            </h2>

            <p style={{
              fontSize: '15px', color: 'rgba(255,255,255,0.58)', lineHeight: 1.75,
              marginBottom: isMobile ? '28px' : '36px', maxWidth: '380px',
            }}>
              Cuéntanos tu proyecto. Estamos listos para acompañarte desde la idea hasta el resultado final.
            </p>

            {/* Contact cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {infoCards.map((c, i) => (
                <ContactCard key={c.label} {...c} delay={i * 0.08} />
              ))}
            </div>

            {/* WhatsApp CTA */}
            <a
              href={WA} target="_blank" rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                background: 'linear-gradient(135deg, #25D366, #128C7E)',
                color: '#fff', padding: '15px 28px', borderRadius: '14px',
                fontWeight: 800, fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 8px 28px rgba(37,211,102,0.3)',
                transition: 'all 0.25s ease',
                alignSelf: 'flex-start',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(37,211,102,0.42)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.3)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chatear por WhatsApp
            </a>
          </motion.div>

          {/* ── Right column — form card ── */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '28px',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              padding: isMobile ? '28px 22px' : '40px 44px',
              boxShadow: '0 40px 100px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}>
              <AnimatePresence mode="wait">
                {sent ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      justifyContent: 'center', textAlign: 'center',
                      gap: '20px', padding: '40px 20px',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.5, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 220, damping: 16 }}
                      style={{
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: `linear-gradient(135deg, ${P}, ${PL})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 0 0 14px ${P}22, 0 16px 48px ${P}55`,
                        fontSize: '36px',
                      }}
                    >
                      ✓
                    </motion.div>
                    <div>
                      <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
                        ¡Mensaje recibido!
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '300px' }}>
                        Te contactaremos en menos de 24 horas. También puedes escribirnos directamente por WhatsApp.
                      </p>
                    </div>
                    {[
                      { label: '¡Escríbenos ahora!', href: WA, bg: 'linear-gradient(135deg, #25D366, #128C7E)', shadow: 'rgba(37,211,102,0.35)' },
                    ].map(btn => (
                      <a
                        key={btn.label}
                        href={btn.href} target="_blank" rel="noopener noreferrer"
                        style={{
                          background: btn.bg, color: '#fff',
                          padding: '14px 32px', borderRadius: '12px',
                          fontWeight: 700, textDecoration: 'none', fontSize: '15px',
                          boxShadow: `0 6px 22px ${btn.shadow}`,
                          transition: 'transform 0.2s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                      >
                        {btn.label}
                      </a>
                    ))}
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.form
                    key="form"
                    ref={formRef}
                    onSubmit={handle}
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
                  >
                    {/* Form header */}
                    <div style={{ marginBottom: '4px' }}>
                      <p style={{ fontSize: '18px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
                        Cuéntanos tu proyecto
                      </p>
                      <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.38)' }}>
                        Los campos con <span style={{ color: Y }}>*</span> son obligatorios.
                      </p>
                    </div>

                    {/* Name + Company */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                      <PremiumField label="Nombre" name="nombre" placeholder="Tu nombre" required />
                      <PremiumField label="Empresa" name="empresa" placeholder="Tu empresa (opcional)" />
                    </div>

                    {/* Email */}
                    <PremiumField label="Email" type="email" name="email" placeholder="tu@correo.com" required />

                    {/* Hidden servicio for EmailJS */}
                    <input type="hidden" name="servicio" value={servicio} />

                    {/* Service chips */}
                    <ServiceChips selected={servicio} onSelect={setServicio} />

                    {/* Message */}
                    <PremiumField
                      label="Cuéntanos tu proyecto" name="mensaje"
                      placeholder="¿En qué podemos ayudarte? Compártenos todos los detalles..."
                      multiline required
                    />

                    {/* Error message */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{
                            fontSize: '13px', color: '#FCA5A5',
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.2)',
                            padding: '10px 14px', borderRadius: '10px', margin: 0,
                          }}
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileHover={sending ? {} : { scale: 1.01 }}
                      whileTap={sending ? {} : { scale: 0.98 }}
                      style={{
                        background: sending
                          ? 'rgba(107,33,168,0.5)'
                          : `linear-gradient(135deg, ${P} 0%, ${PL} 50%, #A855F7 100%)`,
                        color: '#fff', padding: '16px', borderRadius: '14px', border: 'none',
                        cursor: sending ? 'not-allowed' : 'pointer',
                        fontWeight: 800, fontSize: '16px',
                        boxShadow: sending ? 'none' : `0 8px 28px ${P}55`,
                        transition: 'background 0.3s ease, box-shadow 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        letterSpacing: '-0.3px',
                      }}
                    >
                      {sending ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5"/>
                            <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                          Enviando…
                        </>
                      ) : (
                        <>
                          {EMAILJS_OK ? 'Enviar mensaje' : 'Enviar por WhatsApp'}
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M5 12h14M13 6l6 6-6 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </>
                      )}
                    </motion.button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: PD, borderTop: '1px solid rgba(255,255,255,0.07)', padding: '22px 24px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '10px',
          fontSize: '12px', color: 'rgba(255,255,255,0.3)',
        }}>
          <span>© {new Date().getFullYear()} Alma Agencia Creativa · Manizales, Colombia</span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href={contacto.academia} style={{ color: 'rgba(250,204,21,0.6)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = Y)}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(250,204,21,0.6)')}
            >Academia →</a>
            <a href={`mailto:${contacto.email}`} style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
            >{contacto.email}</a>
            <Link to="/admin/login" style={{ color: 'rgba(255,255,255,0.15)', textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.45)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.15)')}
            >🔐 Equipo</Link>
          </div>
        </div>
      </footer>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

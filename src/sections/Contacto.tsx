import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PD, Y, WA_CONTACTO as WA, PHONE } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'

function Field({ label, type = 'text', name, placeholder, multiline = false }: {
  label: string; type?: string; name: string; placeholder: string; multiline?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const base: React.CSSProperties = {
    width: '100%', padding: '13px 15px',
    background: 'rgba(255,255,255,0.08)',
    border: `2px solid ${focused ? Y : 'rgba(255,255,255,0.15)'}`,
    borderRadius: '12px', color: '#fff', fontSize: '15px', outline: 'none',
    transition: 'border-color 0.2s ease', boxSizing: 'border-box',
  }
  return (
    <div>
      <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.65)', marginBottom: '7px' }}>{label}</label>
      {multiline
        ? <textarea name={name} placeholder={placeholder} rows={4} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={{ ...base, resize: 'vertical' }} />
        : <input type={type} name={name} placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={base} />
      }
    </div>
  )
}

export default function Contacto() {
  const isMobile        = useIsMobile()
  const [sent, setSent] = useState(false)

  const handle = (e: React.FormEvent) => {
    e.preventDefault()
    const form    = e.currentTarget as HTMLFormElement
    const nombre   = (form.elements.namedItem('nombre')   as HTMLInputElement).value.trim()
    const servicio = (form.elements.namedItem('servicio') as HTMLInputElement).value.trim()
    const mensaje  = (form.elements.namedItem('mensaje')  as HTMLTextAreaElement).value.trim()
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(`Hola, soy ${nombre}. Me interesa: ${servicio}. ${mensaje}`)}`, '_blank')
    setSent(true)
  }

  const info = [
    { icon: '📱', label: 'WhatsApp',  value: '+57 318 800 6436',        href: WA },
    { icon: '📞', label: 'Teléfono',  value: '301 336 9325',            href: 'tel:+573013369325' },
    { icon: '✉️', label: 'Email',     value: 'alma.directivo@gmail.com', href: 'mailto:alma.directivo@gmail.com' },
    { icon: '📍', label: 'Ubicación', value: 'Manizales, Colombia',      href: undefined },
  ]

  const social = [
    { label: 'Instagram', icon: '📷', href: 'https://instagram.com/almaagenciacreativa' },
    { label: 'WhatsApp',  icon: '💬', href: WA },
  ]

  return (
    <>
      <section style={{ background: PD, padding: isMobile ? '60px 20px' : '100px 24px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: isMobile ? '40px' : '64px',
        }}>
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            <p style={{ color: Y, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px' }}>Contacto</p>
            <h2 style={{ fontSize: isMobile ? 'clamp(24px,6vw,36px)' : 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '16px' }}>
              Hablemos y empecemos a crear
            </h2>
            <p style={{ fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '32px' }}>
              Cuéntanos tu proyecto. Estamos listos para acompañarte desde la idea hasta el resultado.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '20px' }}>
              {info.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', fontWeight: 600, marginBottom: '2px' }}>{c.label}</p>
                    {c.href
                      ? <a href={c.href} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontSize: '14px', fontWeight: 600, textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={e => (e.currentTarget.style.color = Y)} onMouseLeave={e => (e.currentTarget.style.color = '#fff')}>{c.value}</a>
                      : <p style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>{c.value}</p>
                    }
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              {social.map(s => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" title={s.label}
                  style={{ width: 44, height: 44, borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.background = Y)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Right: form */}
          <motion.div
            initial={{ opacity: 0, x: isMobile ? 0 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7 }}
          >
            {sent ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', gap: '16px', paddingTop: isMobile ? '0' : '40px' }}>
                <div style={{ fontSize: '56px' }}>🎉</div>
                <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: 800 }}>¡Mensaje recibido!</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, maxWidth: '320px' }}>
                  Te contactaremos en menos de 24 horas. También puedes escribirnos directamente por WhatsApp.
                </p>
                <a href={WA} target="_blank" rel="noopener noreferrer" style={{ background: Y, color: '#111', padding: '14px 28px', borderRadius: '12px', fontWeight: 700, textDecoration: 'none' }}>
                  Escribir por WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Name/Company — stack on mobile */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                  <Field label="Nombre" name="nombre" placeholder="Tu nombre" />
                  <Field label="Empresa" name="empresa" placeholder="Tu empresa" />
                </div>
                <Field label="Email" type="email" name="email" placeholder="tu@correo.com" />
                <Field label="Servicio de interés" name="servicio" placeholder="Ej: Página web, Branding..." />
                <Field label="Cuéntanos tu proyecto" name="mensaje" placeholder="¿En qué podemos ayudarte?" multiline />
                <button
                  type="submit"
                  style={{ background: Y, color: '#111', padding: '15px', borderRadius: '12px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '15px', transition: 'background 0.2s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#EAB308')}
                  onMouseLeave={e => (e.currentTarget.style.background = Y)}
                >
                  Enviar y empezar a crear →
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#3B0764', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px' }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          flexWrap: 'wrap', gap: '10px',
          fontSize: '12px', color: 'rgba(255,255,255,0.35)',
        }}>
          <span>© {new Date().getFullYear()} Alma Agencia Creativa · Manizales, Colombia</span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <a href="https://edu.almaagenciacreativa.com" style={{ color: 'rgba(250,204,21,0.65)', textDecoration: 'none' }}>Academia →</a>
            <a href="mailto:alma.directivo@gmail.com" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}>alma.directivo@gmail.com</a>
            <Link to="/admin/login" style={{ color: 'rgba(255,255,255,0.18)', textDecoration: 'none', fontSize: '11px' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.18)')}
            >
              🔐 Equipo
            </Link>
          </div>
        </div>
      </footer>
    </>
  )
}

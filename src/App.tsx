import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import Hero        from './sections/Hero'
import Clientes    from './sections/Clientes'
import Manifiesto  from './sections/Manifiesto'
import Proceso     from './sections/Proceso'
import ServiciosTabs from './sections/ServiciosTabs'
import Academia    from './sections/Academia'
import LeadMagnet  from './sections/LeadMagnet'
import Portafolio  from './sections/Portafolio'
import Testimonios from './sections/Testimonios'
import FAQ         from './sections/FAQ'
import Contacto    from './sections/Contacto'
import WhatsAppFloat from './components/WhatsAppFloat'
import { P, PD, Y, WA_PROYECTO } from './tokens'

const NAV_LINKS = [
  { label: 'Inicio',     href: '#inicio',    id: 'inicio'    },
  { label: 'Agencia',    href: '#agencia',   id: 'agencia'   },
  { label: 'Servicios',  href: '#servicios', id: 'servicios' },
  { label: 'Academia',   href: '#academia',  id: 'academia'  },
  { label: 'Portafolio', href: '#portafolio',id: 'portafolio'},
]

/* ── Desktop NavLink ─────────────────────────────────────── */
function NavLink({ label, href, onClick, active }: {
  label: string; href: string; onClick?: () => void; active?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const lit = active || hovered

  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        color: lit ? P : '#374151',
        fontSize: '14px', fontWeight: lit ? 600 : 500,
        textDecoration: 'none', padding: '6px 12px', borderRadius: '8px',
        transition: 'color 0.2s ease, font-weight 0.2s ease',
        position: 'relative', display: 'inline-block',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <span style={{
        position: 'absolute', bottom: 2, left: '12px', right: '12px',
        height: '2px', background: Y, borderRadius: '2px',
        opacity: lit ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }} />
    </a>
  )
}

/* ── Hamburger ───────────────────────────────────────────── */
function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '8px', borderRadius: '8px',
        display: 'flex', flexDirection: 'column',
        gap: '5px', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {[
        open ? 'translateY(7px) rotate(45deg)'  : 'none',
        undefined,
        open ? 'translateY(-7px) rotate(-45deg)' : 'none',
      ].map((transform, i) => (
        i === 1 ? (
          <span key={i} style={{
            display: 'block', width: '22px', height: '2px',
            background: P, borderRadius: '2px',
            transition: 'all 0.3s ease',
            opacity: open ? 0 : 1,
          }} />
        ) : (
          <span key={i} style={{
            display: 'block', width: '22px', height: '2px',
            background: P, borderRadius: '2px',
            transition: 'all 0.3s ease',
            transform: transform ?? undefined,
          }} />
        )
      ))}
    </button>
  )
}

/* ── App ─────────────────────────────────────────────────── */
export default function App() {
  const [scrolled,       setScrolled]       = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 768)
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [activeSection,  setActiveSection]  = useState('inicio')

  /* Scroll + resize */
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const total = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
    }
    const onResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  /* Sección activa via IntersectionObserver */
  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.id)
    const observers = ids.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id) },
        { threshold: 0.35 }
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach(obs => obs?.disconnect())
  }, [])

  /* Bloquear scroll con menú abierto */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div style={{ background: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Scroll progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 300, height: '3px', pointerEvents: 'none',
      }}>
        <div style={{
          height: '100%',
          background: `linear-gradient(90deg, ${P}, #9333EA, ${Y})`,
          width: `${scrollProgress}%`,
          transition: 'width 0.08s linear',
          borderRadius: '0 2px 2px 0',
        }} />
      </div>

      {/* ── Navbar ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.95)',
        borderBottom: '1px solid rgba(107,33,168,0.1)',
        boxShadow: scrolled ? '0 2px 20px rgba(107,33,168,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
          height: scrolled ? '68px' : '84px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'height 0.3s ease',
        }}>

          {/* Logo */}
          <a href="#inicio" onClick={closeMenu} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: P,
              padding: scrolled ? '5px 12px' : '6px 14px',
              borderRadius: '10px',
              display: 'inline-flex', alignItems: 'center',
              transition: 'all 0.3s ease',
            }}>
              <img
                src="/alma-logo.png"
                alt="Alma Agencia Creativa"
                style={{ height: scrolled ? '56px' : '72px', width: 'auto', transition: 'height 0.3s ease' }}
              />
            </div>
          </a>

          {/* Desktop links + CTA */}
          {!isMobile && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {NAV_LINKS.map(link => (
                  <NavLink
                    key={link.href}
                    label={link.label}
                    href={link.href}
                    active={activeSection === link.id}
                  />
                ))}
              </div>
              <a
                href={WA_PROYECTO}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: P, color: '#fff',
                  padding: '10px 22px', borderRadius: '10px',
                  fontWeight: 600, fontSize: '14px', textDecoration: 'none',
                  transition: 'background 0.2s ease', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = PD)}
                onMouseLeave={e => (e.currentTarget.style.background = P)}
              >
                Iniciar Proyecto
              </a>
            </>
          )}

          {/* Mobile hamburger */}
          {isMobile && <Hamburger open={menuOpen} onClick={() => setMenuOpen(o => !o)} />}
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobile && menuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden', borderTop: '1px solid rgba(107,33,168,0.08)' }}
            >
              <div style={{
                background: '#fff',
                padding: '16px 24px 24px',
                display: 'flex', flexDirection: 'column', gap: '4px',
              }}>
                {NAV_LINKS.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    style={{
                      color: activeSection === link.id ? P : '#111827',
                      fontSize: '16px', fontWeight: 600,
                      textDecoration: 'none', padding: '12px 8px',
                      borderBottom: '1px solid #F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = P)}
                    onMouseLeave={e => (e.currentTarget.style.color = activeSection === link.id ? P : '#111827')}
                  >
                    {link.label}
                    <span style={{ color: Y, fontWeight: 900, fontSize: '18px' }}>›</span>
                  </motion.a>
                ))}
                <motion.a
                  href={WA_PROYECTO}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.05 + 0.05, duration: 0.25 }}
                  style={{
                    marginTop: '12px', display: 'block', textAlign: 'center',
                    background: P, color: '#fff',
                    padding: '14px', borderRadius: '12px',
                    fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                  }}
                >
                  Iniciar Proyecto →
                </motion.a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── Secciones ── */}
      <div id="inicio"><Hero /></div>
      <Clientes />
      <div id="agencia"><Manifiesto /></div>
      <Proceso />
      <div id="servicios"><ServiciosTabs /></div>
      <div id="academia"><Academia /></div>
      <LeadMagnet />
      <div id="portafolio"><Portafolio /></div>
      <Testimonios />
      <FAQ />
      <div id="contacto"><Contacto /></div>
      <WhatsAppFloat />
    </div>
  )
}

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './index.css'
import Hero from './sections/Hero'
import Manifiesto from './sections/Manifiesto'
import ServiciosTabs from './sections/ServiciosTabs'
import Academia from './sections/Academia'
import LeadMagnet from './sections/LeadMagnet'
import Portafolio from './sections/Portafolio'
import FAQ from './sections/FAQ'
import Contacto from './sections/Contacto'
import WhatsAppFloat from './components/WhatsAppFloat'
import { P, PD, Y, WA_PROYECTO } from './tokens'

const NAV_LINKS = [
  { label: 'Inicio',     href: '#inicio' },
  { label: 'Agencia',    href: '#agencia' },
  { label: 'Servicios',  href: '#servicios' },
  { label: 'Academia',   href: '#academia' },
  { label: 'Portafolio', href: '#portafolio' },
]

/* ── Desktop NavLink ─────────────────────────────────────────────────── */
function NavLink({ label, href, onClick }: { label: string; href: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
      onClick={onClick}
      style={{
        color: hovered ? P : '#374151',
        fontSize: '14px', fontWeight: 500,
        textDecoration: 'none', padding: '6px 12px', borderRadius: '8px',
        transition: 'color 0.2s ease', position: 'relative', display: 'inline-block',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      <span style={{
        position: 'absolute', bottom: 2, left: '12px', right: '12px',
        height: '2px', background: Y, borderRadius: '2px',
        opacity: hovered ? 1 : 0, transition: 'opacity 0.2s ease',
      }} />
    </a>
  )
}

/* ── Hamburger icon ──────────────────────────────────────────────────── */
function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '8px', borderRadius: '8px', display: 'flex',
        flexDirection: 'column', gap: '5px', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <span style={{
        display: 'block', width: '22px', height: '2px', background: P, borderRadius: '2px',
        transition: 'all 0.3s ease',
        transform: open ? 'translateY(7px) rotate(45deg)' : 'none',
      }} />
      <span style={{
        display: 'block', width: '22px', height: '2px', background: P, borderRadius: '2px',
        transition: 'all 0.3s ease',
        opacity: open ? 0 : 1,
      }} />
      <span style={{
        display: 'block', width: '22px', height: '2px', background: P, borderRadius: '2px',
        transition: 'all 0.3s ease',
        transform: open ? 'translateY(-7px) rotate(-45deg)' : 'none',
      }} />
    </button>
  )
}

/* ── App ─────────────────────────────────────────────────────────────── */
export default function App() {
  const [scrolled,  setScrolled]  = useState(false)
  const [isMobile,  setIsMobile]  = useState(window.innerWidth < 768)
  const [menuOpen,  setMenuOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
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

  // Bloquear scroll del body cuando el menú móvil está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  const logoHeight = scrolled ? '56px' : '72px'

  return (
    <div style={{ background: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>

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
                style={{ height: logoHeight, width: 'auto', transition: 'height 0.3s ease' }}
              />
            </div>
          </a>

          {/* Desktop: links + CTA */}
          {!isMobile && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {NAV_LINKS.map(link => <NavLink key={link.href} {...link} />)}
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

          {/* Mobile: hamburger */}
          {isMobile && <Hamburger open={menuOpen} onClick={() => setMenuOpen(o => !o)} />}
        </div>

        {/* ── Mobile menu (slide down) ── */}
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
                      color: '#111827', fontSize: '16px', fontWeight: 600,
                      textDecoration: 'none', padding: '12px 8px',
                      borderBottom: '1px solid #F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = P)}
                    onMouseLeave={e => (e.currentTarget.style.color = '#111827')}
                  >
                    {link.label}
                    <span style={{ color: Y, fontWeight: 900, fontSize: '18px' }}>›</span>
                  </motion.a>
                ))}

                {/* CTA móvil */}
                <motion.a
                  href={WA_PROYECTO}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: NAV_LINKS.length * 0.05 + 0.05, duration: 0.25 }}
                  style={{
                    marginTop: '12px',
                    display: 'block', textAlign: 'center',
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

      <div id="inicio"><Hero /></div>
      <div id="agencia"><Manifiesto /></div>
      <div id="servicios"><ServiciosTabs /></div>
      <div id="academia"><Academia /></div>
      <LeadMagnet />
      <div id="portafolio"><Portafolio /></div>
      <FAQ />
      <Contacto />
      <WhatsAppFloat />
    </div>
  )
}

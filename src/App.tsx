import { useState, useEffect } from 'react'
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

const P = '#6B21A8'
const PD = '#581C87'
const Y = '#FACC15'

function NavLink({ label, href }: { label: string; href: string }) {
  const [hovered, setHovered] = useState(false)
  return (
    <a
      href={href}
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

export default function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(20px)',
        background: 'rgba(255,255,255,0.88)',
        borderBottom: '1px solid rgba(107,33,168,0.1)',
        boxShadow: scrolled ? '0 2px 20px rgba(107,33,168,0.08)' : 'none',
        transition: 'box-shadow 0.3s ease',
      }}>
        <div style={{
          maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
          height: scrolled ? '90px' : '120px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'height 0.3s ease',
        }}>
          {/* Logo */}
          <a href="#inicio" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <div style={{
              background: P,
              padding: scrolled ? '6px 14px' : '8px 16px',
              borderRadius: '10px',
              display: 'inline-flex', alignItems: 'center',
              transition: 'all 0.3s ease',
            }}>
              <img
                src="/alma-logo.png"
                alt="Alma Agencia Creativa"
                style={{ height: scrolled ? '72px' : '96px', width: 'auto', transition: 'height 0.3s ease' }}
              />
            </div>
          </a>

          {/* Links — hidden on small screens via JS-free approach */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {[
              { label: 'Inicio', href: '#inicio' },
              { label: 'Agencia', href: '#agencia' },
              { label: 'Servicios', href: '#servicios' },
              { label: 'Academia', href: '#academia' },
              { label: 'Portafolio', href: '#portafolio' },
            ].map(link => <NavLink key={link.href} {...link} />)}
          </div>

          {/* CTA */}
          <a
            href="https://wa.me/573013369325?text=Hola%2C%20quiero%20iniciar%20un%20proyecto%20con%20Alma"
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
        </div>
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

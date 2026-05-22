import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { P, PD, Y, WA_PROYECTO } from '../tokens'

// Links que apuntan a secciones de la landing desde páginas internas
const LINKS = [
  { label: 'Inicio',     href: '/#inicio'     },
  { label: 'Nosotros',   href: '/#nosotros'   },
  { label: 'Servicios',  href: '/#servicios'  },
  { label: 'Academia',   href: '/#academia'   },
  { label: 'Portafolio', href: '/#portafolio' },
  { label: 'Blog',       to:   '/blog'        },   // ruta interna
]

export default function SiteNav({ activePath }: { activePath?: string }) {
  const [scrolled,   setScrolled]   = useState(false)
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 768)
  const [menuOpen,   setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    const onResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setMenuOpen(false)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const linkStyle = (active: boolean): React.CSSProperties => ({
    color:          active ? P : '#374151',
    fontSize:       '14px',
    fontWeight:     active ? 600 : 500,
    textDecoration: 'none',
    padding:        '6px 12px',
    borderRadius:   '8px',
    position:       'relative',
    display:        'inline-block',
    transition:     'color 0.2s ease',
  })

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backdropFilter: 'blur(20px)',
      background: 'rgba(255,255,255,0.96)',
      borderBottom: '1px solid rgba(107,33,168,0.1)',
      boxShadow: scrolled ? '0 2px 20px rgba(107,33,168,0.08)' : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>
      <div style={{
        maxWidth: '1200px', margin: '0 auto', padding: '0 24px',
        height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo → home */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <div style={{
            background: P, padding: '5px 12px', borderRadius: '10px', display: 'inline-flex',
          }}>
            <img src="/alma-logo.png" alt="Alma Agencia Creativa" style={{ height: '48px', width: 'auto' }} />
          </div>
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              {LINKS.map(l => {
                const isActive = l.to ? activePath === l.to : false
                if (l.to) {
                  return (
                    <Link key={l.to} to={l.to} style={linkStyle(isActive)}
                      onMouseEnter={e => (e.currentTarget.style.color = P)}
                      onMouseLeave={e => (e.currentTarget.style.color = isActive ? P : '#374151')}
                    >
                      {l.label}
                      <span style={{
                        position: 'absolute', bottom: 2, left: '12px', right: '12px',
                        height: '2px', background: Y, borderRadius: '2px',
                        opacity: isActive ? 1 : 0, transition: 'opacity 0.2s ease',
                      }} />
                    </Link>
                  )
                }
                return (
                  <a key={l.href} href={l.href!} style={linkStyle(false)}
                    onMouseEnter={e => (e.currentTarget.style.color = P)}
                    onMouseLeave={e => (e.currentTarget.style.color = '#374151')}
                  >
                    {l.label}
                  </a>
                )
              })}
            </div>
            <a
              href={WA_PROYECTO} target="_blank" rel="noopener noreferrer"
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
        {isMobile && (
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', display: 'flex', flexDirection: 'column',
              gap: '5px', alignItems: 'center',
            }}
          >
            {[
              menuOpen ? 'translateY(7px) rotate(45deg)' : 'none',
              undefined,
              menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none',
            ].map((t, i) => (
              i === 1
                ? <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: P, borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'all 0.3s ease' }} />
                : <span key={i} style={{ display: 'block', width: '22px', height: '2px', background: P, borderRadius: '2px', transform: t ?? undefined, transition: 'all 0.3s ease' }} />
            ))}
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{
          background: '#fff', borderTop: '1px solid rgba(107,33,168,0.08)',
          padding: '12px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: '2px',
        }}>
          {LINKS.map(l => {
            const sharedMobile: React.CSSProperties = {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 8px', borderBottom: '1px solid #F3F4F6',
              textDecoration: 'none', fontSize: '16px', fontWeight: 600,
              color: '#111827',
            }
            const arrow = <span style={{ color: Y, fontWeight: 900, fontSize: '18px' }}>›</span>
            if (l.to) return (
              <Link key={l.to} to={l.to} style={sharedMobile} onClick={() => setMenuOpen(false)}>
                {l.label}{arrow}
              </Link>
            )
            return (
              <a key={l.href} href={l.href!} style={sharedMobile} onClick={() => setMenuOpen(false)}>
                {l.label}{arrow}
              </a>
            )
          })}
          <a
            href={WA_PROYECTO} target="_blank" rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            style={{
              marginTop: '12px', display: 'block', textAlign: 'center',
              background: P, color: '#fff', padding: '14px', borderRadius: '12px',
              fontWeight: 700, fontSize: '15px', textDecoration: 'none',
            }}
          >
            Iniciar Proyecto →
          </a>
        </div>
      )}
    </nav>
  )
}

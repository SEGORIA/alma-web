import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Link as RouterLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import './index.css'
import Hero          from './sections/Hero'
import Clientes      from './sections/Clientes'
import Manifiesto    from './sections/Manifiesto'
import Proceso       from './sections/Proceso'
import ServiciosTabs from './sections/ServiciosTabs'
import Academia      from './sections/Academia'
import LeadMagnet    from './sections/LeadMagnet'
import Portafolio    from './sections/Portafolio'
import Testimonios   from './sections/Testimonios'
import FAQ           from './sections/FAQ'
import Contacto      from './sections/Contacto'
import Nosotros      from './sections/Nosotros'
import Blog          from './sections/Blog'
import Calculadora   from './sections/Calculadora'
import WhatsAppFloat from './components/WhatsAppFloat'
import BlogPage      from './pages/BlogPage'
import ArticuloPage  from './pages/ArticuloPage'
import { getConfig, getContactoInfo } from './lib/db'
import { seccionesDefault, contactoDefault } from './data/config'
import type { SeccionesConfig } from './data/config'
import { useAuth }  from './hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { P, PD, Y } from './tokens'

/* ── Admin pages — lazy loaded (no se cargan hasta /admin) ── */
const AdminLogin      = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'))
const BlogAdmin       = lazy(() => import('./pages/admin/BlogAdmin'))
const BlogEditor      = lazy(() => import('./pages/admin/BlogEditor'))
const PortafolioAdmin = lazy(() => import('./pages/admin/PortafolioAdmin'))
const PortafolioEditor = lazy(() => import('./pages/admin/PortafolioEditor'))
const PreciosAdmin    = lazy(() => import('./pages/admin/PreciosAdmin'))
const ConfigAdmin     = lazy(() => import('./pages/admin/ConfigAdmin'))
const ContenidoAdmin  = lazy(() => import('./pages/admin/ContenidoAdmin'))

const NAV_LINKS = [
  { label: 'Inicio',     href: '#inicio',    id: 'inicio'    },
  { label: 'Nosotros',   href: '#nosotros',  id: 'nosotros'  },
  { label: 'Servicios',  href: '#servicios', id: 'servicios' },
  { label: 'Academia',   href: '#academia',  id: 'academia'  },
  { label: 'Portafolio', href: '#portafolio',id: 'portafolio'},
  { label: 'Blog',       href: '/blog',      id: 'blog'      },
]

/* ── Desktop NavLink ─────────────────────────────────────── */
function NavLink({ label, href, onClick, active }: {
  label: string; href: string; onClick?: () => void; active?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const lit     = active || hovered
  const isRoute = href.startsWith('/')

  const sharedStyle: React.CSSProperties = {
    color: lit ? P : '#374151',
    fontSize: '14px', fontWeight: lit ? 600 : 500,
    textDecoration: 'none', padding: '6px 12px', borderRadius: '8px',
    transition: 'color 0.2s ease, font-weight 0.2s ease',
    position: 'relative', display: 'inline-block',
  }

  const underline = (
    <span style={{
      position: 'absolute', bottom: 2, left: '12px', right: '12px',
      height: '2px', background: Y, borderRadius: '2px',
      opacity: lit ? 1 : 0,
      transition: 'opacity 0.2s ease',
    }} />
  )

  if (isRoute) {
    return (
      <RouterLink
        to={href}
        onClick={onClick}
        style={sharedStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {label}
        {underline}
      </RouterLink>
    )
  }

  return (
    <a
      href={href}
      onClick={onClick}
      style={sharedStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {label}
      {underline}
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

/* ── Landing Page ────────────────────────────────────────── */
function Landing() {
  const [scrolled,       setScrolled]       = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isMobile,       setIsMobile]       = useState(window.innerWidth < 768)
  const [menuOpen,       setMenuOpen]       = useState(false)
  const [activeSection,  setActiveSection]  = useState('inicio')
  const [sec,            setSec]            = useState<SeccionesConfig>(seccionesDefault)
  const [waLink,         setWaLink]         = useState(`https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`)

  useEffect(() => {
    getConfig().then(cfg => setSec(cfg.secciones))
    getContactoInfo().then(c =>
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`)
    )
  }, [])

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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <div style={{ background: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <Helmet>
        <title>Alma Agencia Creativa | Diseño web, branding y marketing digital en Manizales</title>
        <meta name="description" content="Agencia creativa en Manizales, Colombia. Diseñamos sitios web, identidades de marca y estrategias de marketing digital que generan resultados reales." />
        <meta property="og:title" content="Alma Agencia Creativa" />
        <meta property="og:description" content="Diseñamos marcas, sitios web y estrategias digitales que conectan con tu audiencia." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_CO" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://almaagenciacreativa.com" />
      </Helmet>

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
                href={waLink}
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
                {NAV_LINKS.map((link, i) => {
                  const mobileStyle: React.CSSProperties = {
                    color: activeSection === link.id ? P : '#111827',
                    fontSize: '16px', fontWeight: 600,
                    textDecoration: 'none', padding: '12px 8px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }
                  const icon = <span style={{ color: Y, fontWeight: 900, fontSize: '18px' }}>›</span>

                  if (link.href.startsWith('/')) {
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                      >
                        <RouterLink to={link.href} onClick={closeMenu} style={mobileStyle}>
                          {link.label}
                          {icon}
                        </RouterLink>
                      </motion.div>
                    )
                  }

                  return (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      onClick={closeMenu}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.25 }}
                      style={mobileStyle}
                      onMouseEnter={e => (e.currentTarget.style.color = P)}
                      onMouseLeave={e => (e.currentTarget.style.color = activeSection === link.id ? P : '#111827')}
                    >
                      {link.label}
                      {icon}
                    </motion.a>
                  )
                })}
                <motion.a
                  href={waLink}
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
      {sec.clientes    && <Clientes />}
      {sec.nosotros    && <div id="nosotros"><Nosotros /></div>}
      {sec.manifiesto  && <div id="agencia"><Manifiesto /></div>}
      {sec.proceso     && <Proceso />}
      {sec.servicios   && <div id="servicios"><ServiciosTabs /></div>}
      {sec.academia    && <div id="academia"><Academia /></div>}
      {sec.leadMagnet  && <LeadMagnet />}
      {sec.portafolio  && <div id="portafolio"><Portafolio /></div>}
      {sec.calculadora && <Calculadora />}
      {sec.testimonios && <Testimonios />}
      {sec.blog        && <Blog />}
      {sec.faq         && <FAQ />}
      <div id="contacto"><Contacto /></div>
      <WhatsAppFloat />
    </div>
  )
}

/* ── Loading fallback ────────────────────────────────────── */
function PageLoader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F9FAFB' }}>
      <p style={{ color: '#6B7280', fontSize: '15px' }}>Cargando…</p>
    </div>
  )
}

/* ── Protected route ─────────────────────────────────────── */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  return user ? <>{children}</> : <Navigate to="/admin/login" replace />
}

/* ── App Router ──────────────────────────────────────────── */
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Público */}
        <Route path="/"           element={<Landing />} />
        <Route path="/blog"       element={<BlogPage />} />
        <Route path="/blog/:slug" element={<ArticuloPage />} />

        {/* Admin — lazy */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/blog" element={<RequireAuth><BlogAdmin /></RequireAuth>} />
        <Route path="/admin/blog/:id" element={<RequireAuth><BlogEditor /></RequireAuth>} />
        <Route path="/admin/portafolio" element={<RequireAuth><PortafolioAdmin /></RequireAuth>} />
        <Route path="/admin/portafolio/:id" element={<RequireAuth><PortafolioEditor /></RequireAuth>} />
        <Route path="/admin/precios"   element={<RequireAuth><PreciosAdmin /></RequireAuth>} />
        <Route path="/admin/contenido" element={<RequireAuth><ContenidoAdmin /></RequireAuth>} />
        <Route path="/admin/config"    element={<RequireAuth><ConfigAdmin /></RequireAuth>} />
      </Routes>
    </Suspense>
  )
}

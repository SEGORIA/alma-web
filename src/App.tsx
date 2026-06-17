import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { Routes, Route, Link as RouterLink, useLocation } from 'react-router-dom'
import { trackPageView, trackEvent } from './lib/analytics'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import './index.css'

/* ── Above-the-fold: carga inmediata ── */
import Hero          from './sections/Hero'
import Clientes      from './sections/Clientes'
import Nosotros      from './sections/Nosotros'
import WhatsAppFloat from './components/WhatsAppFloat'
import BackToTop      from './components/BackToTop'

/* ── Below-the-fold: lazy para reducir TTI ── */
const Manifiesto    = lazy(() => import('./sections/Manifiesto'))
const Proceso       = lazy(() => import('./sections/Proceso'))
const ServiciosTabs = lazy(() => import('./sections/ServiciosTabs'))
const Academia      = lazy(() => import('./sections/Academia'))
const LeadMagnet    = lazy(() => import('./sections/LeadMagnet'))
const Portafolio    = lazy(() => import('./sections/Portafolio'))
const Testimonios   = lazy(() => import('./sections/Testimonios'))
const FAQ           = lazy(() => import('./sections/FAQ'))
const Contacto      = lazy(() => import('./sections/Contacto'))
const Blog          = lazy(() => import('./sections/Blog'))
const Calculadora   = lazy(() => import('./sections/Calculadora'))
import BlogPage        from './pages/BlogPage'
import ArticuloPage    from './pages/ArticuloPage'
import PortafolioPage  from './pages/PortafolioPage'
import EquipoPage      from './pages/EquipoPage'
import NotFoundPage    from './pages/NotFoundPage'
import BriefPageDirect   from './pages/BriefPage'
import ClientePortalPage from './pages/ClientePortal'
import { getConfig, getContactoInfo } from './lib/db'
import { seccionesDefault, contactoDefault } from './data/config'
import type { SeccionesConfig } from './data/config'
import { useAuth }  from './hooks/useAuth'
import { useIsMobile } from './hooks/useIsMobile'
import { Navigate } from 'react-router-dom'
import { P, PD, Y } from './tokens'

/* Bajo este ancho la navegación usa menú hamburguesa: con 7 enlaces + logo +
   CTA, el nav horizontal no cabe en teléfonos (incluido landscape ~915px),
   foldables, tablets pequeñas ni en pantalla dividida de Android. */
const NAV_MOBILE_BREAKPOINT = 1024

/* ── Admin pages — lazy loaded (no se cargan hasta /admin) ── */
const AdminLogin       = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard   = lazy(() => import('./pages/admin/AdminDashboard'))
const BlogAdmin        = lazy(() => import('./pages/admin/BlogAdmin'))
const BlogEditor       = lazy(() => import('./pages/admin/BlogEditor'))
const PortafolioAdmin  = lazy(() => import('./pages/admin/PortafolioAdmin'))
const PortafolioEditor = lazy(() => import('./pages/admin/PortafolioEditor'))
const PreciosAdmin     = lazy(() => import('./pages/admin/PreciosAdmin'))
const ConfigAdmin      = lazy(() => import('./pages/admin/ConfigAdmin'))
const ContenidoAdmin   = lazy(() => import('./pages/admin/ContenidoAdmin'))
const LeadsAdmin       = lazy(() => import('./pages/admin/LeadsAdmin'))
/* ── Módulos de negocio ── */
const BriefAdmin       = lazy(() => import('./pages/admin/BriefAdmin'))
const FinanzasAdmin    = lazy(() => import('./pages/admin/FinanzasAdmin'))
const ContratosAdmin   = lazy(() => import('./pages/admin/ContratosAdmin'))
const ClientesAdmin       = lazy(() => import('./pages/admin/ClientesAdmin'))
const CotizacionesAdmin   = lazy(() => import('./pages/admin/CotizacionesAdmin'))
const CuentasCobroAdmin   = lazy(() => import('./pages/admin/CuentasCobroAdmin'))
const AcademiaAdmin       = lazy(() => import('./pages/admin/AcademiaAdmin'))
const TareasAdmin         = lazy(() => import('./pages/admin/TareasAdmin'))
const EquipoPortalPage    = lazy(() => import('./pages/EquipoPortal'))

const NAV_LINKS = [
  { label: 'Inicio',     href: '#inicio',    id: 'inicio'    },
  { label: 'Nosotros',   href: '#nosotros',  id: 'nosotros'  },
  { label: 'Servicios',  href: '#servicios', id: 'servicios' },
  { label: 'Academia',   href: '#academia',  id: 'academia'  },
  { label: 'Portafolio', href: '/portafolio', id: 'portafolio'},
  { label: 'Equipo',     href: '/equipo',    id: 'equipo'    },
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
      aria-expanded={open}
      aria-controls="mobile-menu"
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

/* ── SplashScreen ────────────────────────────────────────── */
function SplashScreen({ onDone }: { onDone: () => void }) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Bloquear scroll del body mientras el splash está activo
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    timerRef.current = setTimeout(onDone, 4500)
    return () => {
      document.body.style.overflow = ''
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onDone])

  const handleEnd = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setTimeout(onDone, 300)
  }

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        width: '100vw', height: '100vh',
        zIndex: 9999,
        background: '#080818',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '24px',
        overflow: 'hidden',
      }}
    >
      {/* Radial glow */}
      <div style={{
        position: 'absolute',
        top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '500px',
        background: `radial-gradient(ellipse, ${P}44 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      {/* Logo video */}
      <motion.video
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        autoPlay
        muted
        playsInline
        onEnded={handleEnd}
        style={{
          width: 'min(340px, 70vw)',
          height: 'auto',
          position: 'relative', zIndex: 1,
          mixBlendMode: 'screen',
        }}
      >
        <source src="/alma-logo.webm" type="video/webm" />
        <source src="/alma-logo.mp4"  type="video/mp4" />
        <img src="/alma-logo.png" alt="Alma" style={{ width: '100%' }} />
      </motion.video>

      {/* Barra de progreso */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 3.8, ease: 'linear' }}
        style={{
          position: 'relative', zIndex: 1,
          width: '120px', height: '2px',
          background: `linear-gradient(90deg, ${P}, #9333EA, ${Y})`,
          borderRadius: '2px',
          transformOrigin: 'left',
        }}
      />
    </motion.div>
  )
}

/* ── Landing Page ────────────────────────────────────────── */
function Landing() {
  const [splashDone, setSplashDone] = useState(
    () => sessionStorage.getItem('alma_splash') === '1'
  )
  const handleSplashDone = () => {
    sessionStorage.setItem('alma_splash', '1')
    setSplashDone(true)
  }

  const [scrolled,  setScrolled]  = useState(false)
  const isMobile = useIsMobile(NAV_MOBILE_BREAKPOINT)
  const progressRef = useRef<HTMLDivElement>(null)
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
      if (progressRef.current) {
        const total = document.documentElement.scrollHeight - window.innerHeight
        const pct   = total > 0 ? Math.min(100, (window.scrollY / total) * 100) : 0
        progressRef.current.style.width = `${pct}%`
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // Cierra el menú móvil al pasar a viewport de escritorio
  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  useEffect(() => {
    const ids = NAV_LINKS.map(l => l.id)
    const firedSections = new Set<string>()
    const TRACKED = ['academia', 'servicios', 'portafolio']
    const observers = ids.map(id => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id)
            if (TRACKED.includes(id) && !firedSections.has(id)) {
              firedSections.add(id)
              trackEvent('section_view', { section: id })
            }
          }
        },
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
    <>
      <AnimatePresence>
        {!splashDone && <SplashScreen onDone={handleSplashDone} />}
      </AnimatePresence>

    <div style={{ background: '#fff', minHeight: '100vh', overflowX: 'hidden' }}>
      <Helmet>
        <title>Alma Agencia Creativa | Diseño web, branding y marketing digital en Manizales</title>
        <meta name="description" content="Agencia creativa en Manizales, Colombia. Diseñamos sitios web, identidades de marca y estrategias de marketing digital que generan resultados reales." />
        <meta property="og:title" content="Alma Agencia Creativa | Diseño Web, Branding & Marketing Digital" />
        <meta property="og:description" content="Convertimos tu visión en realidad digital. Diseñamos marcas, sitios web y estrategias en Manizales, Colombia. +150 proyectos · 98% satisfacción." />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_CO" />
        <meta property="og:url" content="https://almaagenciacreativa.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://almaagenciacreativa.com" />
      </Helmet>

      {/* Scroll progress bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 300, height: '3px', pointerEvents: 'none',
      }}>
        <div ref={progressRef} style={{
          height: '100%',
          background: `linear-gradient(90deg, ${P}, #9333EA, ${Y})`,
          width: '0%',
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

          {/* Mobile: WhatsApp icon + hamburger */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href={waLink} target="_blank" rel="noopener noreferrer"
                aria-label="Contactar por WhatsApp"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#25D366', color: '#fff', textDecoration: 'none',
                  fontSize: '20px', flexShrink: 0,
                  boxShadow: '0 2px 10px rgba(37,211,102,0.35)',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <Hamburger open={menuOpen} onClick={() => setMenuOpen(o => !o)} />
            </div>
          )}
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobile && menuOpen && (
            <motion.div
              key="mobile-menu"
              id="mobile-menu"
              role="dialog"
              aria-label="Menú de navegación"
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

      {/* Secciones below-the-fold en Suspense (lazy loaded) */}
      <Suspense fallback={null}>
        {sec.manifiesto  && <div id="agencia"><Manifiesto /></div>}
        {sec.proceso     && <Proceso />}
        {sec.servicios   && <div id="servicios"><ServiciosTabs /></div>}
        {sec.academia    && <div id="academia"><Academia /></div>}
        {sec.leadMagnet  && <LeadMagnet />}
        {sec.portafolio  && <div id="portafolio"><Portafolio /></div>}
        {sec.calculadora && <div id="calculadora"><Calculadora /></div>}
        {sec.testimonios && <Testimonios />}
        {sec.blog        && <Blog />}
        {sec.faq         && <FAQ />}
        <div id="contacto"><Contacto /></div>
      </Suspense>
      <WhatsAppFloat />
    </div>
    </>
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

/* ── Brief subdomain wrapper: registra page_view en GA4 ─── */
function BriefSubdomain() {
  useEffect(() => { trackPageView('/brief', 'Brief de Proyecto') }, [])
  return <BriefPageDirect />
}

/* ── Route tracker: registra page_view en GA4 ───────────── */
function RouteTracker() {
  const location = useLocation()
  useEffect(() => {
    trackPageView(location.pathname)
  }, [location.pathname])
  return null
}

/* ── App Router ──────────────────────────────────────────── */
export default function App() {
  // Subdominio brief → mostrar solo el formulario, sin landing ni nav
  if (window.location.hostname === 'brief.almaagenciacreativa.com') {
    return (
      <Suspense fallback={<PageLoader />}>
        <BriefSubdomain />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <RouteTracker />
      <BackToTop />
      <Routes>
        {/* Público */}
        <Route path="/"              element={<Landing />} />
        <Route path="/brief"         element={<BriefPageDirect />} />
        <Route path="/blog"          element={<BlogPage />} />
        <Route path="/blog/:slug"    element={<ArticuloPage />} />
        <Route path="/portafolio"    element={<PortafolioPage />} />
        <Route path="/equipo"          element={<EquipoPage />} />
        <Route path="/cliente/:token" element={<ClientePortalPage />} />
        <Route path="/equipo-portal" element={<EquipoPortalPage />} />
        <Route path="/equipo-portal/:pin" element={<EquipoPortalPage />} />
        <Route path="*"              element={<NotFoundPage />} />

        {/* Admin — lazy */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<RequireAuth><AdminDashboard /></RequireAuth>} />
        <Route path="/admin/blog" element={<RequireAuth><BlogAdmin /></RequireAuth>} />
        <Route path="/admin/blog/:id" element={<RequireAuth><BlogEditor /></RequireAuth>} />
        <Route path="/admin/portafolio" element={<RequireAuth><PortafolioAdmin /></RequireAuth>} />
        <Route path="/admin/portafolio/:id" element={<RequireAuth><PortafolioEditor /></RequireAuth>} />
        <Route path="/admin/precios"    element={<RequireAuth><PreciosAdmin /></RequireAuth>} />
        <Route path="/admin/contenido"  element={<RequireAuth><ContenidoAdmin /></RequireAuth>} />
        <Route path="/admin/config"     element={<RequireAuth><ConfigAdmin /></RequireAuth>} />
        <Route path="/admin/leads"      element={<RequireAuth><LeadsAdmin /></RequireAuth>} />
        {/* ── Módulos de negocio ── */}
        <Route path="/admin/brief"      element={<RequireAuth><BriefAdmin /></RequireAuth>} />
        <Route path="/admin/finanzas"   element={<RequireAuth><FinanzasAdmin /></RequireAuth>} />
        <Route path="/admin/contratos"  element={<RequireAuth><ContratosAdmin /></RequireAuth>} />
        <Route path="/admin/clientes"      element={<RequireAuth><ClientesAdmin /></RequireAuth>} />
        <Route path="/admin/cotizaciones" element={<RequireAuth><CotizacionesAdmin /></RequireAuth>} />
        <Route path="/admin/cuentas-cobro" element={<RequireAuth><CuentasCobroAdmin /></RequireAuth>} />
        <Route path="/admin/academia"      element={<RequireAuth><AcademiaAdmin /></RequireAuth>} />
        <Route path="/admin/tareas"        element={<RequireAuth><TareasAdmin /></RequireAuth>} />
      </Routes>
    </Suspense>
  )
}

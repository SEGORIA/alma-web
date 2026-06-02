import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { P } from '../../tokens'

/* ── Nav data ─────────────────────────────────────────────── */
const PAGINA_WEB = [
  { label: '🎯 Leads',         to: '/admin/leads' },
  { label: '✍️ Blog',          to: '/admin/blog' },
  { label: '🖼️ Portafolio',    to: '/admin/portafolio' },
  { label: '💰 Precios',       to: '/admin/precios' },
  { label: '📄 Contenido',     to: '/admin/contenido' },
  { label: '⚙️ Config',        to: '/admin/config' },
]

const NEGOCIO = [
  { label: '📋 Brief',              to: '/admin/brief' },
  { label: '💼 Finanzas',           to: '/admin/finanzas' },
  { label: '📑 Contratos',          to: '/admin/contratos' },
  { label: '👥 Clientes',           to: '/admin/clientes' },
  { label: '📊 Cotizaciones',       to: '/admin/cotizaciones' },
  { label: '💳 Cuentas de Cobro',   to: '/admin/cuentas-cobro' },
  { label: '🎓 Academia',           to: '/admin/academia' },
]

const WEB_PREFIXES = PAGINA_WEB.map(i => i.to)

/* ── Helpers ──────────────────────────────────────────────── */
function SectionLabel({ text }: { text: string }) {
  return (
    <div style={{ padding: '16px 4px 6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        fontSize: '9.5px', fontWeight: 800, color: '#4B5563',
        letterSpacing: '1.5px', textTransform: 'uppercase', flexShrink: 0,
      }}>
        {text}
      </span>
      <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }} />
    </div>
  )
}

/* ── Layout ───────────────────────────────────────────────── */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user }   = useAuth()
  const location           = useLocation()
  const navigate           = useNavigate()
  const isMobile           = useIsMobile()
  const [open, setOpen]    = useState(false)

  const onWebRoute = WEB_PREFIXES.some(p => location.pathname.startsWith(p))
  const [webOpen, setWebOpen] = useState(onWebRoute)

  // Auto-expand grupo web al navegar a una ruta hija
  useEffect(() => {
    if (onWebRoute) setWebOpen(true)
  }, [location.pathname, onWebRoute])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  /* ── NavLink individual ── */
  const NavItem = ({ label, to }: { label: string; to: string }) => {
    const isExact = to === '/admin'
    const active  = isExact
      ? location.pathname === '/admin'
      : location.pathname.startsWith(to)

    return (
      <Link
        to={to}
        onClick={() => setOpen(false)}
        style={{
          display: 'block', padding: '9px 13px', borderRadius: '10px',
          textDecoration: 'none', fontSize: '13.5px', fontWeight: active ? 700 : 500,
          color: active ? '#fff' : '#9CA3AF',
          background: active ? P : 'transparent',
          transition: 'all 0.15s ease',
        }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        {label}
      </Link>
    )
  }

  /* ── Contenido del sidebar ── */
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              background: 'transparent', border: 'none', color: '#6B7280',
              fontSize: '22px', cursor: 'pointer', lineHeight: 1,
            }}
            aria-label="Cerrar menú"
          >✕</button>
        )}
        <div style={{
          background: P, padding: '6px 12px', borderRadius: '10px',
          display: 'inline-flex', marginBottom: '12px',
        }}>
          <img src="/alma-logo.png" alt="Alma" style={{ height: '36px', width: 'auto' }} />
        </div>
        <p style={{
          fontSize: '11px', color: '#4B5563', fontWeight: 700,
          letterSpacing: '1.2px', textTransform: 'uppercase', margin: 0,
        }}>
          Panel Admin
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '1px', overflowY: 'auto' }}>

        {/* Dashboard */}
        <NavItem label="📊 Dashboard" to="/admin" />

        {/* ── Página Web ── */}
        <SectionLabel text="Página Web" />

        {/* Grupo colapsable */}
        <button
          onClick={() => setWebOpen(o => !o)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', padding: '9px 13px',
            borderRadius: '10px', border: 'none', cursor: 'pointer',
            fontSize: '13.5px', fontWeight: 600,
            background: onWebRoute && !webOpen ? `${P}30` : 'transparent',
            color: onWebRoute ? '#C4B5FD' : '#9CA3AF',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
          onMouseLeave={e => {
            e.currentTarget.style.background = onWebRoute && !webOpen ? `${P}30` : 'transparent'
          }}
        >
          <span>🌐 Sitio web</span>
          <span style={{
            fontSize: '15px', lineHeight: 1, opacity: 0.5,
            transform: webOpen ? 'rotate(90deg)' : 'rotate(0)',
            transition: 'transform 0.22s ease',
            display: 'inline-block',
          }}>›</span>
        </button>

        {webOpen && (
          <div style={{ paddingLeft: '8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {PAGINA_WEB.map(item => (
              <NavItem key={item.to} label={item.label} to={item.to} />
            ))}
          </div>
        )}

        {/* ── Negocio ── */}
        <SectionLabel text="Negocio" />

        {NEGOCIO.map(item => (
          <NavItem key={item.to} label={item.label} to={item.to} />
        ))}

      </nav>

      {/* Usuario + logout */}
      <div style={{ padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
        <p style={{
          fontSize: '11.5px', color: '#4B5563', marginBottom: '8px',
          padding: '0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {user?.email}
        </p>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '9px 14px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.1)', color: '#F87171',
            border: '1px solid rgba(239,68,68,0.18)',
            fontWeight: 700, fontSize: '12.5px', cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
        >
          Cerrar sesión
        </button>
        <a
          href="/"
          target="_blank"
          style={{
            display: 'block', marginTop: '6px', textAlign: 'center',
            fontSize: '11.5px', color: '#4B5563', textDecoration: 'none', padding: '5px',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#9CA3AF')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4B5563')}
        >
          Ver sitio web →
        </a>
      </div>
    </>
  )

  /* ── Mobile ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F4FF' }}>
        {/* Top bar */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'linear-gradient(180deg, #0D0220 0%, #1A0535 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => setOpen(true)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}
              aria-label="Abrir menú"
            >☰</button>
            <div style={{ background: P, padding: '4px 10px', borderRadius: '8px', display: 'inline-flex' }}>
              <img src="/alma-logo.png" alt="Alma" style={{ height: '28px', width: 'auto' }} />
            </div>
          </div>
          <a href="/" target="_blank" style={{ fontSize: '12px', color: '#6B7280', textDecoration: 'none' }}>
            Ver sitio →
          </a>
        </div>

        {/* Overlay */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              zIndex: 60, backdropFilter: 'blur(3px)',
            }}
          />
        )}

        {/* Drawer */}
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '264px',
          background: 'linear-gradient(180deg, #0D0220 0%, #1A0535 100%)',
          zIndex: 70,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}>
          <SidebarContent />
        </aside>

        <main style={{ flex: 1 }}>{children}</main>
      </div>
    )
  }

  /* ── Desktop ── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F4FF' }}>
      <aside style={{
        width: '244px', flexShrink: 0,
        background: 'linear-gradient(180deg, #0D0220 0%, #1A0535 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50, overflowY: 'auto',
      }}>
        <SidebarContent />
      </aside>
      <main style={{ marginLeft: '244px', flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

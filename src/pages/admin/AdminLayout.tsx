import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { P } from '../../tokens'

const NAV = [
  { label: '📊 Dashboard',      to: '/admin' },
  { label: '🎯 Leads',          to: '/admin/leads' },
  { label: '✍️ Blog',           to: '/admin/blog' },
  { label: '🖼️ Portafolio',     to: '/admin/portafolio' },
  { label: '💰 Precios',        to: '/admin/precios' },
  { label: '📄 Contenido',      to: '/admin/contenido' },
  { label: '⚙️ Configuración',  to: '/admin/config' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user }   = useAuth()
  const location           = useLocation()
  const navigate           = useNavigate()
  const isMobile           = useIsMobile()
  const [open, setOpen]    = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        {isMobile && (
          <button
            onClick={() => setOpen(false)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#9CA3AF', fontSize: '22px', cursor: 'pointer', lineHeight: 1 }}
            aria-label="Cerrar menú"
          >✕</button>
        )}
        <div style={{
          background: P, padding: '6px 12px', borderRadius: '10px',
          display: 'inline-flex', marginBottom: '12px',
        }}>
          <img src="/alma-logo.png" alt="Alma" style={{ height: '36px', width: 'auto' }} />
        </div>
        <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
          Panel Admin
        </p>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV.map(item => {
          const active = item.to === '/admin'
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.to)
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', padding: '10px 14px', borderRadius: '10px',
                textDecoration: 'none', fontSize: '14px', fontWeight: 600,
                color: active ? '#fff' : '#9CA3AF',
                background: active ? P : 'transparent',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: '12px', color: '#6B7280', marginBottom: '10px', padding: '0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user?.email}
        </p>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '9px 14px', borderRadius: '10px',
            background: 'rgba(239,68,68,0.12)', color: '#EF4444',
            border: '1px solid rgba(239,68,68,0.2)',
            fontWeight: 600, fontSize: '13px', cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.22)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.12)')}
        >
          Cerrar sesión
        </button>
        <a
          href="/"
          target="_blank"
          style={{
            display: 'block', marginTop: '8px', textAlign: 'center',
            fontSize: '12px', color: '#4B5563', textDecoration: 'none',
            padding: '6px',
          }}
        >
          Ver sitio web →
        </a>
      </div>
    </>
  )

  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', background: '#F5F4FF' }}>
        {/* Top bar mobile */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 50,
          background: 'linear-gradient(180deg, #0D0220 0%, #1A0535 100%)', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
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
          <a href="/" target="_blank" style={{ fontSize: '12px', color: '#6B7280', textDecoration: 'none' }}>Ver sitio →</a>
        </div>

        {/* Overlay */}
        {open && (
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              zIndex: 60, backdropFilter: 'blur(2px)',
            }}
          />
        )}

        {/* Drawer */}
        <aside style={{
          position: 'fixed', top: 0, left: 0, bottom: 0,
          width: '260px', background: 'linear-gradient(180deg, #0D0220 0%, #1A0535 100%)',
          zIndex: 70,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          overflowY: 'auto',
        }}>
          <SidebarContent />
        </aside>

        {/* Content */}
        <main style={{ flex: 1 }}>{children}</main>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F5F4FF' }}>
      {/* ── Sidebar desktop ── */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: 'linear-gradient(180deg, #0D0220 0%, #1A0535 100%)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50,
      }}>
        <SidebarContent />
      </aside>

      {/* ── Main content ── */}
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

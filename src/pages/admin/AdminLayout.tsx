import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { P } from '../../tokens'

const NAV = [
  { label: '📊 Dashboard',   to: '/admin' },
  { label: '✍️ Blog',        to: '/admin/blog' },
  { label: '🖼️ Portafolio',  to: '/admin/portafolio' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { logout, user }   = useAuth()
  const location           = useLocation()
  const navigate           = useNavigate()
  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F9FAFB' }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: '240px', flexShrink: 0,
        background: '#111827',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50,
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            background: P, padding: '6px 12px', borderRadius: '10px',
            display: 'inline-flex', marginBottom: '12px',
          }}>
            <img src="/alma-logo.png" alt="Alma" style={{ height: '36px', width: 'auto' }} />
          </div>
          <p style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>
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
      </aside>

      {/* ── Main content ── */}
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}

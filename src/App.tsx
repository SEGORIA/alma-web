import './index.css'
import ParticlesCanvas from './components/ParticlesCanvas'
import Hero from './sections/Hero'
import Servicios from './sections/Servicios'
import ParaQuien from './sections/ParaQuien'
import ComoFunciona from './sections/ComoFunciona'
import CTA from './sections/CTA'

export default function App() {
  return (
    <div style={{ background: '#080818', minHeight: '100vh', overflowX: 'hidden' }}>
      <ParticlesCanvas />

      {/* Fixed top glow */}
      <div style={{
        position: 'fixed', top: '-200px', left: '50%', transform: 'translateX(-50%)',
        width: '800px', height: '500px',
        background: 'radial-gradient(ellipse,rgba(139,53,232,0.18) 0%,transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backdropFilter: 'blur(16px)',
        background: 'rgba(8,8,24,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '0 24px', height: '68px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <img src="/alma-logo.png" alt="Alma" style={{ height: '52px', width: 'auto' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            {[
              { label: 'Servicios', href: '#servicios' },
              { label: 'Cómo funciona', href: '#como-funciona' },
            ].map(link => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: 'rgba(255,255,255,0.6)', fontSize: '14px', fontWeight: 500,
                  textDecoration: 'none', transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              >
                {link.label}
              </a>
            ))}

            <a
              href="https://wa.me/573013369325"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'linear-gradient(135deg,#8B35E8,#C026D3)',
                color: '#fff', padding: '10px 20px',
                borderRadius: '10px', fontWeight: 600,
                fontSize: '14px', textDecoration: 'none',
              }}
            >
              Contáctanos
            </a>
          </div>
        </div>
      </nav>

      <Hero />
      <Servicios />
      <ParaQuien />
      <ComoFunciona />
      <CTA />

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.3)',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px',
          fontSize: '13px', color: 'rgba(255,255,255,0.25)',
        }}>
          <span>© 2025 Alma Agencia Creativa · Creative Intelligence Studio</span>
          <a
            href="https://edu.almaagenciacreativa.com"
            style={{ color: 'rgba(168,85,247,0.6)', textDecoration: 'none', fontSize: '13px' }}
          >
            Recursos educativos →
          </a>
        </div>
      </footer>
    </div>
  )
}

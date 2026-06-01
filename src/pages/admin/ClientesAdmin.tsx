import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'

const FEATURES = [
  { icon: '🔐', title: 'Portal privado por cliente', desc: 'Cada cliente tiene su propio acceso con email y contraseña para ver su información.' },
  { icon: '🗂️', title: 'Proyectos y entregables', desc: 'Agrégales los links a los materiales: Figma, Drive, videos, redes, etc.' },
  { icon: '📊', title: 'Métricas del servicio', desc: 'Muestra avances, estadísticas e hitos cumplidos directamente al cliente.' },
  { icon: '📑', title: 'Descarga de contratos', desc: 'El cliente puede descargar su contrato de servicio desde el portal.' },
  { icon: '💬', title: 'Canal de comunicación', desc: 'Envía actualizaciones y notificaciones directamente al portal del cliente.' },
  { icon: '📅', title: 'Línea de tiempo', desc: 'Historial visual de todo lo que se ha hecho en el proyecto.' },
]

export default function ClientesAdmin() {
  const isMobile = useIsMobile()

  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '24px 16px' : '40px 32px' }}>

        {/* ── Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #9A3412 0%, #EA580C 60%, #FB923C 100%)',
          borderRadius: '20px',
          padding: isMobile ? '24px 20px' : '36px 40px',
          marginBottom: '32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-20px', right: '-10px',
            fontSize: '130px', opacity: 0.08, lineHeight: 1,
            userSelect: 'none', pointerEvents: 'none',
          }}>👥</div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              borderRadius: '20px', padding: '4px 14px', marginBottom: '16px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FBBF24', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Próximamente
              </span>
            </div>

            <h1 style={{ fontSize: isMobile ? '22px' : '30px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              👥 Portal de Clientes
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', maxWidth: '560px', lineHeight: 1.6 }}>
              Cada cliente de Alma tiene su propio espacio privado donde puede ver el avance de su proyecto, descargar materiales y revisar sus métricas en tiempo real.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                disabled
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.6)',
                  padding: '10px 20px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 800,
                  border: '1.5px solid rgba(255,255,255,0.2)',
                  cursor: 'not-allowed',
                }}
              >
                + Nuevo cliente (disponible pronto)
              </button>
            </div>
          </div>
        </div>

        {/* ── En desarrollo ── */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
          border: '1.5px solid #FED7AA',
          borderRadius: '16px', padding: isMobile ? '20px 18px' : '24px 28px',
          marginBottom: '28px',
          display: 'flex', alignItems: 'flex-start', gap: '16px',
        }}>
          <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>🛠️</span>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#C2410C', margin: '0 0 6px' }}>
              En desarrollo
            </h2>
            <p style={{ fontSize: '13px', color: '#EA580C', margin: 0, lineHeight: 1.6 }}>
              El portal de clientes se desarrollará junto al módulo de contratos. Cada cliente creado en el sistema tendrá acceso a su propio espacio en <strong>clientes.almaagenciacreativa.com</strong> con su información, avances y materiales del proyecto.
            </p>
          </div>
        </div>

        {/* ── Estadísticas placeholder ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px', marginBottom: '28px',
        }}>
          {[
            { label: 'Clientes activos', value: '—', icon: '👤', color: '#EA580C' },
            { label: 'Proyectos activos', value: '—', icon: '🗂️', color: '#2563EB' },
            { label: 'Entregables', value: '—', icon: '📦', color: '#9333EA' },
            { label: 'Satisfacción', value: '—', icon: '⭐', color: '#D97706' },
          ].map(m => (
            <div key={m.label} style={{
              background: '#fff', borderRadius: '14px', padding: '18px',
              border: '1px solid #E5E7EB',
            }}>
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{m.icon}</span>
              <p style={{ fontSize: '22px', fontWeight: 900, color: m.color, margin: '0 0 3px' }}>{m.value}</p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, fontWeight: 600 }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* ── Features ── */}
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Qué incluirá este módulo
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
            Funcionalidades que estarán disponibles para ti y para tus clientes.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
          marginBottom: '32px',
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: '#fff', borderRadius: '14px', padding: '18px 20px',
              border: '1px solid #E5E7EB', display: 'flex', gap: '14px', alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: '22px', flexShrink: 0, width: '40px', height: '40px',
                background: '#FFF7ED', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{f.title}</p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── URL del portal ── */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: isMobile ? '18px' : '24px 28px',
          border: '1px solid #E5E7EB',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>
            ⚙️ Acceso del cliente
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            {[
              { label: 'URL del portal', value: 'clientes.almaagenciacreativa.com' },
              { label: 'Autenticación', value: 'Firebase Auth (email + contraseña)' },
              { label: 'Ruta interna', value: '/cliente' },
              { label: 'Creación de acceso', value: 'El admin crea la cuenta del cliente' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: '#F9FAFB', borderRadius: '10px' }}>
                <span style={{ color: '#9CA3AF', fontWeight: 600, minWidth: '140px' }}>{row.label}</span>
                <span style={{ color: '#374151', fontWeight: 700, fontFamily: 'monospace' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

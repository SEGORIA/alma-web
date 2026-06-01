import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'

const FEATURES = [
  { icon: '📥', title: 'Recepción automática', desc: 'Cada brief llenado en brief.almaagenciacreativa.com llega aquí al instante.' },
  { icon: '📊', title: 'Google Sheets sync', desc: 'Se registra automáticamente en tu hoja de cálculo de seguimiento.' },
  { icon: '📬', title: 'Notificación por email', desc: 'Recibes un correo con toda la información del cliente al ser enviado.' },
  { icon: '🔗', title: 'Conectado a Contratos', desc: 'Desde el brief puedes generar directamente el contrato de servicio.' },
  { icon: '👤', title: 'Crear cliente', desc: 'Convierte un brief aprobado en un cliente activo con un solo clic.' },
  { icon: '🏷️', title: 'Estados y seguimiento', desc: 'Marca cada brief como nuevo, en revisión, aprobado o archivado.' },
]

export default function BriefAdmin() {
  const isMobile = useIsMobile()

  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '24px 16px' : '40px 32px' }}>

        {/* ── Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%)',
          borderRadius: '20px',
          padding: isMobile ? '24px 20px' : '36px 40px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decoración de fondo */}
          <div style={{
            position: 'absolute', top: '-30px', right: '-20px',
            fontSize: '130px', opacity: 0.08, lineHeight: 1,
            userSelect: 'none', pointerEvents: 'none',
          }}>📋</div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              borderRadius: '20px', padding: '4px 14px', marginBottom: '16px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Módulo Brief
              </span>
            </div>

            <h1 style={{ fontSize: isMobile ? '22px' : '30px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              📋 Brief de Clientes
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', maxWidth: '520px', lineHeight: 1.6 }}>
              Sistema centralizado para recibir, revisar y gestionar los briefs creativos de tus clientes. Conectado con Google Sheets, email y el portal de clientes.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="https://brief.almaagenciacreativa.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: '#fff', color: '#0369A1',
                  padding: '10px 20px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 800, textDecoration: 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
                }}
              >
                🌐 Ver formulario público
              </a>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                padding: '10px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              }}>
                📥 Briefs recibidos: —
              </span>
            </div>
          </div>
        </div>

        {/* ── En integración ── */}
        <div style={{
          background: 'linear-gradient(135deg, #F0F9FF, #E0F2FE)',
          border: '1.5px solid #BAE6FD',
          borderRadius: '16px', padding: isMobile ? '20px 18px' : '24px 28px',
          marginBottom: '28px',
          display: 'flex', alignItems: 'flex-start', gap: '16px',
        }}>
          <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>🔄</span>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#0369A1', margin: '0 0 6px' }}>
              Integración en proceso
            </h2>
            <p style={{ fontSize: '13px', color: '#0284C7', margin: 0, lineHeight: 1.6 }}>
              Comparte el archivo HTML de tu brief y lo integramos al sistema. Una vez conectado, podrás ver todos los envíos aquí, filtrarlos por estado y convertirlos en clientes o contratos.
            </p>
          </div>
        </div>

        {/* ── Features ── */}
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Funcionalidades incluidas
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
            Todo lo que tendrá este módulo al estar completamente activo.
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
                background: '#F0F9FF', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>
                  {f.title}
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ── URL del subdominio ── */}
        <div style={{
          background: '#fff', borderRadius: '16px', padding: isMobile ? '18px' : '24px 28px',
          border: '1px solid #E5E7EB',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>
            ⚙️ Configuración de dominio
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            {[
              { label: 'URL pública', value: 'brief.almaagenciacreativa.com' },
              { label: 'Ruta interna', value: '/brief' },
              { label: 'Destino email', value: 'alma.directivo@gmail.com' },
              { label: 'Google Sheets', value: 'Por configurar (Apps Script)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: '12px', padding: '10px 14px', background: '#F9FAFB', borderRadius: '10px' }}>
                <span style={{ color: '#9CA3AF', fontWeight: 600, minWidth: '120px' }}>{row.label}</span>
                <span style={{ color: '#374151', fontWeight: 700, fontFamily: 'monospace' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

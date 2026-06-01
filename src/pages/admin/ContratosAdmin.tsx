import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'

const FEATURES = [
  { icon: '✏️', title: 'Crear orden de servicio', desc: 'Rellena los datos del servicio contratado y genera el documento al instante.' },
  { icon: '🎨', title: 'Plantilla con tu marca', desc: 'El contrato usa los colores, tipografía y logo de Alma Agencia Creativa.' },
  { icon: '📄', title: 'Descarga como PDF', desc: 'Genera un PDF profesional directamente desde el navegador, sin apps externas.' },
  { icon: '🔗', title: 'Vinculado al cliente', desc: 'Cada contrato queda asociado al cliente para acceso desde el portal.' },
  { icon: '📬', title: 'Envío por email', desc: 'Envía el contrato directamente al email del cliente con un clic.' },
  { icon: '📊', title: 'Historial de contratos', desc: 'Consulta todos los contratos emitidos, su estado y fechas de inicio.' },
]

export default function ContratosAdmin() {
  const isMobile = useIsMobile()

  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '24px 16px' : '40px 32px' }}>

        {/* ── Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1E3A8A 0%, #2563EB 60%, #60A5FA 100%)',
          borderRadius: '20px',
          padding: isMobile ? '24px 20px' : '36px 40px',
          marginBottom: '32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-20px', right: '-10px',
            fontSize: '130px', opacity: 0.08, lineHeight: 1,
            userSelect: 'none', pointerEvents: 'none',
          }}>📑</div>

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
              📑 Contratos & Órdenes de Servicio
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', maxWidth: '560px', lineHeight: 1.6 }}>
              Genera contratos profesionales de servicio en segundos. Define qué se entrega, en qué plazo y a qué precio. El cliente recibe su copia y queda todo por escrito.
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
                + Nuevo contrato (disponible pronto)
              </button>
            </div>
          </div>
        </div>

        {/* ── Próximamente ── */}
        <div style={{
          background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
          border: '1.5px solid #BFDBFE',
          borderRadius: '16px', padding: isMobile ? '20px 18px' : '24px 28px',
          marginBottom: '28px',
          display: 'flex', alignItems: 'flex-start', gap: '16px',
        }}>
          <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>🛠️</span>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#1D4ED8', margin: '0 0 6px' }}>
              En desarrollo
            </h2>
            <p style={{ fontSize: '13px', color: '#2563EB', margin: 0, lineHeight: 1.6 }}>
              Este módulo está en desarrollo. Una vez activo, podrás crear órdenes de servicio desde el formulario del admin, generar PDFs con tu branding y enviarlas al cliente. Los contratos quedarán vinculados al portal del cliente para descarga.
            </p>
          </div>
        </div>

        {/* ── Features grid ── */}
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Qué incluirá este módulo
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
            Todo lo que estará disponible cuando esté activo.
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
                background: '#EFF6FF', borderRadius: '10px',
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

        {/* ── Preview del contrato ── */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: isMobile ? '20px' : '28px', border: '1px solid #E5E7EB' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
            📄 Preview del formato de contrato
          </h3>
          <div style={{
            border: '2px dashed #E5E7EB', borderRadius: '12px', padding: '32px',
            textAlign: 'center', color: '#9CA3AF', fontSize: '13px',
          }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>📋</span>
            <p style={{ fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>
              Plantilla de contrato próximamente
            </p>
            <p style={{ margin: 0, fontSize: '12px' }}>
              El contrato se generará con el logo y colores de Alma, campos del servicio, cláusulas y firma del cliente.
            </p>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

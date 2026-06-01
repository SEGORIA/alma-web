import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'

const FEATURES = [
  { icon: '💵', title: 'Ingresos y gastos', desc: 'Registra cada movimiento y categorízalo por proyecto o categoría.' },
  { icon: '📈', title: 'Dashboard financiero', desc: 'Visualiza ingresos mensuales, utilidades y flujo de caja en tiempo real.' },
  { icon: '🧾', title: 'Cotizaciones y facturas', desc: 'Crea y envía cotizaciones. Convierte en factura con un clic.' },
  { icon: '📁', title: 'Rentabilidad por proyecto', desc: 'Compara lo presupuestado vs lo real en cada proyecto.' },
  { icon: '📅', title: 'Pagos y vencimientos', desc: 'Calendario de cobros pendientes y alertas de vencimiento.' },
  { icon: '📤', title: 'Exportar reportes', desc: 'Descarga resúmenes mensuales en Excel o PDF para contabilidad.' },
]

export default function FinanzasAdmin() {
  const isMobile = useIsMobile()

  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '24px 16px' : '40px 32px' }}>

        {/* ── Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #14532D 0%, #16A34A 60%, #4ADE80 100%)',
          borderRadius: '20px',
          padding: isMobile ? '24px 20px' : '36px 40px',
          marginBottom: '32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-20px', right: '-10px',
            fontSize: '130px', opacity: 0.08, lineHeight: 1,
            userSelect: 'none', pointerEvents: 'none',
          }}>💼</div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              borderRadius: '20px', padding: '4px 14px', marginBottom: '16px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Módulo Finanzas
              </span>
            </div>

            <h1 style={{ fontSize: isMobile ? '22px' : '30px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              💼 Finanzas Internas
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', maxWidth: '520px', lineHeight: 1.6 }}>
              Control financiero completo de la agencia. Ingresos, gastos, rentabilidad por proyecto y reportes para tomar decisiones con datos reales.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.2)', color: '#fff',
                padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              }}>
                🔄 Integrando sistema existente
              </span>
            </div>
          </div>
        </div>

        {/* ── En integración ── */}
        <div style={{
          background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)',
          border: '1.5px solid #BBF7D0',
          borderRadius: '16px', padding: isMobile ? '20px 18px' : '24px 28px',
          marginBottom: '28px',
          display: 'flex', alignItems: 'flex-start', gap: '16px',
        }}>
          <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>🔄</span>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#15803D', margin: '0 0 6px' }}>
              Integración en proceso
            </h2>
            <p style={{ fontSize: '13px', color: '#16A34A', margin: 0, lineHeight: 1.6 }}>
              Comparte el archivo HTML de tu sistema de finanzas y lo adaptamos para que use la misma base de datos y visual del panel. Toda la nomenclatura y estructura se alineará con el sistema actual.
            </p>
          </div>
        </div>

        {/* ── Métricas placeholder ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px', marginBottom: '28px',
        }}>
          {[
            { label: 'Ingresos mes', value: '$ —', icon: '💵', color: '#16A34A' },
            { label: 'Gastos mes',   value: '$ —', icon: '📤', color: '#DC2626' },
            { label: 'Utilidad',     value: '$ —', icon: '📈', color: '#2563EB' },
            { label: 'Proyectos activos', value: '—', icon: '🗂️', color: '#9333EA' },
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
            Funcionalidades incluidas
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
            Todo lo que tendrá este módulo al estar completamente integrado.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: '#fff', borderRadius: '14px', padding: '18px 20px',
              border: '1px solid #E5E7EB', display: 'flex', gap: '14px', alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: '22px', flexShrink: 0, width: '40px', height: '40px',
                background: '#F0FDF4', borderRadius: '10px',
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

      </div>
    </AdminLayout>
  )
}

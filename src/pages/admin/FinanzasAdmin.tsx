import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'

/* ── Paleta ─────────────────────────────────────────────── */
const BK  = '#08080B'
const BDR = '#2A2A33'
const MUT = '#606080'
const WHT = '#F1E8DA'

export default function FinanzasAdmin() {
  const isMobile = useIsMobile()

  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BK }}>

        {/* ── Header premium ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '16px 16px' : '20px 36px',
          borderBottom: `0.5px solid ${BDR}`,
          flexWrap: 'wrap', gap: '12px', flexShrink: 0,
        }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>
              ALMA · AGENCIA CREATIVA
            </p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>
              Finanzas
            </h1>
          </div>
        </div>

        {/* ── Dashboard iframe ── */}
        <iframe
          src="/finanzas.html"
          title="Dashboard de Finanzas"
          style={{ flex: 1, width: '100%', border: 'none', display: 'block' }}
          allow="clipboard-write"
        />
      </div>
    </AdminLayout>
  )
}

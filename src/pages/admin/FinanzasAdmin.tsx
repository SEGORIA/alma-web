import { useState } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'

export default function FinanzasAdmin() {
  const isMobile = useIsMobile()
  const [expanded, setExpanded] = useState(false)

  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '16px' : '24px 32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* ── Banner compacto ── */}
        {!expanded && (
          <div style={{
            background: 'linear-gradient(135deg, #14532D 0%, #16A34A 60%, #4ADE80 100%)',
            borderRadius: '16px',
            padding: isMobile ? '20px' : '24px 28px',
            position: 'relative', overflow: 'hidden',
            flexShrink: 0,
          }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '100px', opacity: 0.08, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>💼</div>
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>
                  💼 Finanzas Internas
                </h1>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
                  Dashboard financiero completo de Alma Agencia Creativa
                </p>
              </div>
              <button
                onClick={() => setExpanded(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: '#fff', color: '#16A34A',
                  padding: '10px 20px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 800, border: 'none',
                  cursor: 'pointer', flexShrink: 0,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
              >
                ⛶ Pantalla completa
              </button>
            </div>
          </div>
        )}

        {/* ── Iframe wrapper ── */}
        <div style={{
          flex: 1,
          borderRadius: expanded ? '0' : '16px',
          overflow: 'hidden',
          border: '1px solid #E5E7EB',
          background: '#08080B',
          position: expanded ? 'fixed' : 'relative',
          inset: expanded ? '0' : undefined,
          zIndex: expanded ? 100 : undefined,
          height: expanded ? '100vh' : isMobile ? '80vh' : 'calc(100vh - 220px)',
          minHeight: '600px',
        }}>
          {expanded && (
            <button
              onClick={() => setExpanded(false)}
              style={{
                position: 'absolute', top: '12px', right: '12px', zIndex: 10,
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff', borderRadius: '8px', padding: '6px 14px',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                backdropFilter: 'blur(8px)',
              }}
            >
              ✕ Cerrar
            </button>
          )}
          <iframe
            src="/finanzas.html"
            title="Dashboard de Finanzas"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="clipboard-write"
          />
        </div>

      </div>
    </AdminLayout>
  )
}

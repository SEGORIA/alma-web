import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getBriefs, updateBriefEstado, deleteBrief } from '../../lib/db'
import type { Brief } from '../../data/briefs'
import { BRIEF_ESTADOS } from '../../data/briefs'

/* ── helpers ── */
function fmtDate(ts: unknown): string {
  if (!ts) return '—'
  try {
    const d = (ts as { toDate?: () => Date }).toDate?.()
    if (d) return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    return new Date(ts as string).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })
  } catch { return '—' }
}

function truncate(s: string | undefined, max = 60): string {
  if (!s || s === '—') return '—'
  return s.length > max ? s.slice(0, max) + '…' : s
}

/* ── Estado badge ── */
function EstadoBadge({ estado, onChange }: {
  estado: Brief['estado']
  onChange: (e: Brief['estado']) => void
}) {
  const [open, setOpen] = useState(false)
  const current = BRIEF_ESTADOS.find(e => e.value === estado) ?? BRIEF_ESTADOS[0]

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: current.bg, color: current.color,
          border: `1.5px solid ${current.color}30`,
          borderRadius: '20px', padding: '4px 12px',
          fontSize: '11px', fontWeight: 700, cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        {current.label} ▾
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 20,
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: '130px',
          }}>
            {BRIEF_ESTADOS.map(e => (
              <button
                key={e.value}
                onClick={() => { onChange(e.value); setOpen(false) }}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '9px 14px', fontSize: '12px', fontWeight: 700,
                  color: e.color, background: estado === e.value ? e.bg : 'transparent',
                  border: 'none', cursor: 'pointer',
                }}
              >
                {e.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Detail modal ── */
function BriefModal({ brief, onClose, onEstado }: {
  brief: Brief
  onClose: () => void
  onEstado: (e: Brief['estado']) => void
}) {
  const isMobile = useIsMobile()

  function Row({ label, value }: { label: string; value?: string }) {
    if (!value || value === '—') return null
    return (
      <div style={{ marginBottom: '14px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{label}</p>
        <p style={{ fontSize: '13px', color: '#374151', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{value}</p>
      </div>
    )
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201, background: '#fff', borderRadius: '20px',
        width: isMobile ? '96vw' : '720px',
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0369A1, #0EA5E9, #38BDF8)', borderRadius: '20px 20px 0 0', padding: '24px 28px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>📋 {brief.marca}</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: '0 0 12px' }}>{brief.nombre} · {brief.email_direccion}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <EstadoBadge estado={brief.estado} onChange={onEstado} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{fmtDate(brief.createdAt)}</span>
            {brief.telefono && brief.telefono !== '—' && (
              <a href={`https://wa.me/${brief.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
            )}
            <a href={`mailto:${brief.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
              ✉️ Email
            </a>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Datos personales</h3>
              <Row label="Nombre"        value={brief.nombre} />
              <Row label="Email"         value={brief.email_direccion} />
              <Row label="Email empresa" value={brief.email} />
              <Row label="Teléfono"      value={brief.telefono} />
              <Row label="Documento"     value={brief.documento} />
            </div>
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Marca</h3>
              <Row label="Marca"          value={brief.marca} />
              <Row label="Nacimiento"     value={brief.nacimiento_marca} />
              <Row label="Logo"           value={brief.tiene_logo} />
              <Row label="Slogan"         value={brief.slogan} />
              <Row label="Fecha inicio"   value={brief.fecha_inicio} />
            </div>
          </div>

          <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>ADN de Marca</h3>
              <Row label="Personalidad" value={brief.personalidad} />
              <Row label="Valores"      value={brief.valores_marca} />
              <Row label="Colores"      value={brief.colores_marca} />
            </div>
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Propuesta de Valor</h3>
              <Row label="Clientes potenciales" value={brief.clientes_potenciales} />
              <Row label="Problema"             value={brief.problema_resuelve} />
              <Row label="Propuesta"            value={brief.propuesta_valor} />
              <Row label="Beneficios"           value={brief.beneficios} />
            </div>
          </div>

          <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Emocional</h3>
              <Row label="Experiencia emocional" value={brief.experiencia_emocional} />
              <Row label="Emociones"             value={brief.emociones} />
            </div>
            <div>
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Competencia</h3>
              <Row label="Competidores" value={brief.competidores} />
              <Row label="Referencias"  value={brief.referencias} />
            </div>
          </div>

          {(brief.presencia_redes || brief.credenciales_redes || brief.credenciales_plataformas) && (
            <>
              <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Presencia Digital y Accesos</h3>
              <Row label="Presencia en redes"       value={brief.presencia_redes} />
              <Row label="Credenciales redes"       value={brief.credenciales_redes} />
              <Row label="Credenciales plataformas" value={brief.credenciales_plataformas} />
            </>
          )}

          {(brief.archivos || brief.link_archivos || brief.notas_adicionales) && (
            <>
              <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />
              <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Archivos y Cierre</h3>
              <Row label="Archivos"          value={brief.archivos} />
              <Row label="Link archivos"     value={brief.link_archivos} />
              <Row label="Notas adicionales" value={brief.notas_adicionales} />
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ── Main page ── */
export default function BriefAdmin() {
  const isMobile = useIsMobile()
  const [briefs, setBriefs]     = useState<Brief[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Brief | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter]     = useState<Brief['estado'] | 'todos'>('todos')

  useEffect(() => {
    getBriefs().then(data => { setBriefs(data); setLoading(false) })
  }, [])

  async function handleEstado(id: string, estado: Brief['estado']) {
    await updateBriefEstado(id, estado)
    setBriefs(prev => prev.map(b => b._id === id ? { ...b, estado } : b))
    if (selected?._id === id) setSelected(prev => prev ? { ...prev, estado } : null)
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este briefing? Esta acción no se puede deshacer.')) return
    setDeleting(id)
    await deleteBrief(id)
    setBriefs(prev => prev.filter(b => b._id !== id))
    if (selected?._id === id) setSelected(null)
    setDeleting(null)
  }

  const displayed = filter === 'todos' ? briefs : briefs.filter(b => b.estado === filter)
  const counts = BRIEF_ESTADOS.reduce((acc, e) => {
    acc[e.value] = briefs.filter(b => b.estado === e.value).length
    return acc
  }, {} as Record<string, number>)

  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '24px 16px' : '40px 32px' }}>

        {/* ── Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 60%, #38BDF8 100%)',
          borderRadius: '20px',
          padding: isMobile ? '24px 20px' : '32px 36px',
          marginBottom: '28px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '130px', opacity: 0.08, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>📋</div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', borderRadius: '20px', padding: '4px 14px', marginBottom: '12px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>En línea</span>
            </div>
            <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 900, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
              📋 Briefings de Clientes
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '14px', color: 'rgba(255,255,255,0.85)', margin: '0 0 16px', maxWidth: '540px', lineHeight: 1.5 }}>
              Fichas de briefing enviadas desde{' '}
              <strong>brief.almaagenciacreativa.com</strong>. Guardadas en Firestore y sincronizadas con Google Sheets.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="/brief"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: '#fff', color: '#0369A1', padding: '8px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 800, textDecoration: 'none' }}
              >
                🌐 Ver formulario
              </a>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '8px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 700 }}>
                📋 {briefs.length} {briefs.length === 1 ? 'briefing' : 'briefings'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Métricas por estado ── */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: '12px', marginBottom: '24px' }}>
          {BRIEF_ESTADOS.map(e => (
            <button
              key={e.value}
              onClick={() => setFilter(f => f === e.value ? 'todos' : e.value)}
              style={{
                background: filter === e.value ? e.bg : '#fff',
                borderRadius: '14px', padding: '16px',
                border: `1.5px solid ${filter === e.value ? e.color : '#E5E7EB'}`,
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}
            >
              <p style={{ fontSize: '22px', fontWeight: 900, color: e.color, margin: '0 0 3px' }}>
                {counts[e.value] ?? 0}
              </p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, fontWeight: 600 }}>{e.label}</p>
            </button>
          ))}
        </div>

        {/* ── Lista de briefings ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#9CA3AF' }}>
            Cargando briefings…
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '16px', padding: '48px', textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>📭</span>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#374151', margin: '0 0 6px' }}>
              {filter === 'todos'
                ? 'Aún no hay briefings'
                : `No hay briefings con estado "${BRIEF_ESTADOS.find(e => e.value === filter)?.label}"`}
            </p>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
              Comparte el link <strong>brief.almaagenciacreativa.com</strong> con tus clientes.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {displayed.map(b => {
              const estado = BRIEF_ESTADOS.find(e => e.value === b.estado) ?? BRIEF_ESTADOS[0]
              return (
                <div
                  key={b._id}
                  style={{
                    background: '#fff', borderRadius: '14px', padding: '16px 20px',
                    border: '1px solid #E5E7EB',
                    display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                    gap: '16px', flexWrap: 'wrap',
                    cursor: 'pointer', transition: 'box-shadow 0.15s',
                  }}
                  onClick={() => setSelected(b)}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #0EA5E9, #0369A1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 900, fontSize: '16px', flexShrink: 0,
                  }}>
                    {b.nombre?.charAt(0).toUpperCase() ?? '?'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', margin: 0 }}>{b.nombre}</p>
                      <span style={{ fontSize: '12px', color: '#6B7280' }}>·</span>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#0EA5E9', margin: 0 }}>{b.marca}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.email_direccion}
                      {b.propuesta_valor && b.propuesta_valor !== '—' ? ` · ${truncate(b.propuesta_valor)}` : ''}
                    </p>
                  </div>

                  {/* Fecha */}
                  {!isMobile && (
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>
                      {fmtDate(b.createdAt)}
                    </p>
                  )}

                  {/* Estado */}
                  <div onClick={e => e.stopPropagation()}>
                    <EstadoBadge
                      estado={b.estado}
                      onChange={newEstado => handleEstado(b._id!, newEstado)}
                    />
                  </div>

                  {/* Eliminar */}
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(b._id!) }}
                    disabled={deleting === b._id}
                    title="Eliminar briefing"
                    style={{
                      background: 'none', border: 'none', color: '#9CA3AF',
                      cursor: 'pointer', fontSize: '18px', padding: '4px',
                      borderRadius: '6px', flexShrink: 0, transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    {deleting === b._id ? '…' : '🗑️'}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Config info ── */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: isMobile ? '18px' : '24px 28px', border: '1px solid #E5E7EB', marginTop: '28px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 800, color: '#111827', marginBottom: '14px' }}>⚙️ Integración del módulo</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            {[
              { label: 'URL formulario',  value: 'brief.almaagenciacreativa.com → /brief' },
              { label: 'Base de datos',   value: 'Firestore — colección: briefs' },
              { label: 'Email admin',     value: 'Gmail SMTP → alma.directivo@gmail.com' },
              { label: 'Google Sheets',   value: 'Apps Script (sync automático al enviar)' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', gap: '12px', padding: '9px 14px', background: '#F9FAFB', borderRadius: '8px' }}>
                <span style={{ color: '#9CA3AF', fontWeight: 600, minWidth: '140px' }}>{row.label}</span>
                <span style={{ color: '#374151', fontWeight: 700, fontFamily: 'monospace' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Modal de detalle ── */}
      {selected && (
        <BriefModal
          brief={selected}
          onClose={() => setSelected(null)}
          onEstado={e => handleEstado(selected._id!, e)}
        />
      )}
    </AdminLayout>
  )
}

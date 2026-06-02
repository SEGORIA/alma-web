import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPortalByToken, addSolicitudToPortal } from '../lib/db'
import type { Cliente, Solicitud } from '../data/clientes'
import {
  ENTREGABLE_CATEGORIAS, PARRILLA_ESTADOS,
  SOLICITUD_TIPOS, SOLICITUD_ESTADOS, CLIENTE_ESTADOS,
} from '../data/clientes'

/* ── Brand tokens ───────────────────────────────────────── */
const P  = '#6B21A8'
const PL = 'rgba(107,33,168,0.10)'

/* ── Helpers ─────────────────────────────────────────────── */
function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

type PortalData = Partial<Cliente> & { clienteId?: string }

/* ── Loader ──────────────────────────────────────────────── */
function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F4FF', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `4px solid ${P}30`, borderTopColor: P, animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Cargando tu portal…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

/* ── Not found ───────────────────────────────────────────── */
function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F4FF', gap: '16px', textAlign: 'center', padding: '40px' }}>
      <p style={{ fontSize: '60px', margin: 0 }}>🔒</p>
      <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0 }}>Acceso no encontrado</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '360px', lineHeight: 1.6 }}>
        Este enlace no es válido o ha expirado. Contacta a Alma Agencia Creativa para obtener tu acceso.
      </p>
      <a href="https://wa.me/573001234567" style={{ padding: '11px 24px', borderRadius: '12px', background: P, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
        Contactar Alma
      </a>
    </div>
  )
}

/* ── Main Component ──────────────────────────────────────── */
export default function ClientePortal() {
  const { token } = useParams<{ token: string }>()
  const [data,    setData]    = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'inicio' | 'entregables' | 'parrilla' | 'solicitudes'>('inicio')
  const [showSolForm, setShowSolForm] = useState(false)
  const [solTipo,     setSolTipo]     = useState<Solicitud['tipo']>('cambio')
  const [solDesc,     setSolDesc]     = useState('')
  const [solRef,      setSolRef]      = useState('')
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    getPortalByToken(token).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [token])

  if (loading) return <Loader />
  if (!data || !token) return <NotFound />

  const estadoInfo = CLIENTE_ESTADOS.find(e => e.value === data.estado)

  async function submitSolicitud() {
    if (!solDesc.trim() || !data?.clienteId) return
    setSending(true)
    const solicitud: Solicitud = {
      id:          newId(),
      tipo:        solTipo,
      descripcion: solDesc.trim(),
      material_ref: solRef.trim() || undefined,
      estado:      'pendiente',
      createdAt:   new Date().toISOString(),
    }
    try {
      await addSolicitudToPortal(token!, data.clienteId, solicitud)
      // Notify via API
      await fetch('/api/send-solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_cliente: data.nombre,
          marca:          data.marca,
          email_cliente:  data.email,
          tipo:           SOLICITUD_TIPOS.find(t => t.value === solTipo)?.label ?? solTipo,
          descripcion:    solDesc,
          material_ref:   solRef || undefined,
          token,
        }),
      })
      // Update local state
      setData(d => d ? { ...d, solicitudes: [...(d.solicitudes ?? []), solicitud] } : d)
      setSolDesc(''); setSolRef(''); setSent(true)
      setTimeout(() => { setSent(false); setShowSolForm(false) }, 2500)
    } catch { /* silencioso */ }
    finally { setSending(false) }
  }

  const TABS = [
    { key: 'inicio',      label: '🏠 Inicio' },
    { key: 'entregables', label: `📦 Materiales (${(data.entregables ?? []).length})` },
    { key: 'parrilla',    label: `📅 Parrilla (${(data.parrilla ?? []).length})` },
    { key: 'solicitudes', label: `💬 Solicitudes (${(data.solicitudes ?? []).length})` },
  ] as const

  return (
    <div style={{ minHeight: '100vh', background: '#F5F4FF', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        background: `linear-gradient(135deg, #3B0764, ${P}, #9333EA)`,
        padding: '0',
      }}>
        {/* Top bar */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '8px', padding: '5px 12px' }}>
            <img src="/alma-logo.png" alt="Alma" style={{ height: '28px', width: 'auto', display: 'block' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Portal de cliente</span>
        </div>

        {/* Brand info */}
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '8px 20px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <h1 style={{ margin: 0, color: '#fff', fontSize: '26px', fontWeight: 900 }}>{data.marca}</h1>
            {estadoInfo && (
              <span style={{ padding: '3px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '11.5px', fontWeight: 700 }}>
                {estadoInfo.icon} {estadoInfo.label}
              </span>
            )}
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '14px' }}>Bienvenido/a, {data.nombre}</p>

          {/* Services chips */}
          {(data.servicios ?? []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
              {(data.servicios ?? []).map(s => (
                <span key={s} style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: '12px', fontWeight: 600 }}>{s}</span>
              ))}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '12px 18px', border: 'none', cursor: 'pointer',
                background: tab === t.key ? '#fff' : 'transparent',
                color: tab === t.key ? P : 'rgba(255,255,255,0.7)',
                fontSize: '13px', fontWeight: tab === t.key ? 800 : 500,
                borderRadius: tab === t.key ? '12px 12px 0 0' : '0',
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 20px' }}>

        {/* ── INICIO ── */}
        {tab === 'inicio' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Materiales', value: (data.entregables ?? []).length, icon: '📦' },
                { label: 'En parrilla', value: (data.parrilla ?? []).length, icon: '📅' },
                { label: 'Solicitudes', value: (data.solicitudes ?? []).length, icon: '💬' },
              ].map(m => (
                <div key={m.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                  <p style={{ fontSize: '28px', margin: '0 0 6px' }}>{m.icon}</p>
                  <p style={{ fontSize: '26px', fontWeight: 900, color: P, margin: '0 0 3px' }}>{m.value}</p>
                  <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, fontWeight: 600 }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Inicio fecha */}
            {data.fecha_inicio && (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inicio del proyecto</p>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#374151', margin: 0 }}>{data.fecha_inicio}</p>
              </div>
            )}

            {/* Contrato */}
            {data.contrato_url && (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📑 Contrato de servicios</p>
                  <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Tu contrato está disponible para descargar.</p>
                </div>
                <a
                  href={data.contrato_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ padding: '10px 22px', borderRadius: '10px', background: P, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}
                >
                  Descargar contrato
                </a>
              </div>
            )}

            {/* Solicitud rápida */}
            <div style={{ background: `linear-gradient(135deg, #F5F3FF, #EDE9FE)`, borderRadius: '14px', padding: '20px', border: `1.5px solid #DDD6FE`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: P, margin: '0 0 4px' }}>¿Tienes una solicitud?</p>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Pide cambios, mejoras o consulta algo sobre tus materiales.</p>
              </div>
              <button
                onClick={() => setShowSolForm(true)}
                style={{ padding: '10px 22px', borderRadius: '10px', background: P, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}
              >
                + Nueva solicitud
              </button>
            </div>
          </div>
        )}

        {/* ── ENTREGABLES ── */}
        {tab === 'entregables' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {(data.entregables ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📦</p>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>Aún no hay materiales disponibles.<br />El equipo de Alma los irá subiendo aquí.</p>
              </div>
            ) : (
              <>
                {/* Group by category */}
                {ENTREGABLE_CATEGORIAS.map(cat => {
                  const items = (data.entregables ?? []).filter(e => e.categoria === cat.key)
                  if (items.length === 0) return null
                  return (
                    <div key={cat.key} style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 18px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>{cat.icon}</span>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: cat.color }}>{cat.label}</p>
                        <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9CA3AF' }}>{items.length} archivo{items.length > 1 ? 's' : ''}</span>
                      </div>
                      {items.map(e => (
                        <div key={e.id} style={{ padding: '14px 18px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: '0 0 3px', fontSize: '14px', fontWeight: 700, color: '#111' }}>{e.nombre}</p>
                            {e.descripcion && <p style={{ margin: 0, fontSize: '12.5px', color: '#6B7280' }}>{e.descripcion}</p>}
                          </div>
                          <a
                            href={e.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ padding: '7px 16px', borderRadius: '8px', background: PL, color: P, textDecoration: 'none', fontWeight: 700, fontSize: '12.5px', flexShrink: 0 }}
                          >
                            Ver material →
                          </a>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        )}

        {/* ── PARRILLA ── */}
        {tab === 'parrilla' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(data.parrilla ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📅</p>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>La parrilla de contenido de este mes estará disponible aquí.<br />El equipo de Alma la completará pronto.</p>
              </div>
            ) : (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#F9FAFB' }}>
                        {['Fecha', 'Red', 'Tipo', 'Descripción', 'Estado'].map(h => (
                          <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11.5px', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(data.parrilla ?? []).map(p => {
                        const est = PARRILLA_ESTADOS.find(x => x.value === p.estado)
                        return (
                          <tr key={p.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', whiteSpace: 'nowrap' }}>{p.fecha}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{p.red}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151' }}>{p.tipo}</td>
                            <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', maxWidth: '240px' }}>
                              {p.link ? <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: P, textDecoration: 'none', fontWeight: 600 }}>{p.descripcion}</a> : p.descripcion}
                            </td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '20px', background: est?.bg ?? '#F3F4F6', color: est?.color ?? '#6B7280', fontSize: '11.5px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {est?.label ?? p.estado}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── SOLICITUDES ── */}
        {tab === 'solicitudes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowSolForm(true)}
                style={{ padding: '10px 22px', borderRadius: '10px', background: P, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
              >
                + Nueva solicitud
              </button>
            </div>

            {(data.solicitudes ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ fontSize: '36px', margin: '0 0 10px' }}>💬</p>
                <p style={{ color: '#6B7280', fontSize: '14px' }}>Aún no tienes solicitudes.<br />Usa el botón de arriba para enviar una.</p>
              </div>
            ) : (
              [...(data.solicitudes ?? [])].reverse().map(s => {
                const tipo = SOLICITUD_TIPOS.find(t => t.value === s.tipo)
                const est  = SOLICITUD_ESTADOS.find(x => x.value === s.estado)
                return (
                  <div key={s.id} style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: `1.5px solid ${est?.color ?? '#E5E7EB'}20` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', background: (tipo?.color ?? '#6B7280') + '20', color: tipo?.color ?? '#6B7280', fontSize: '12px', fontWeight: 700 }}>{tipo?.label ?? s.tipo}</span>
                        <span style={{ padding: '3px 10px', borderRadius: '20px', background: est?.bg ?? '#F3F4F6', color: est?.color ?? '#6B7280', fontSize: '12px', fontWeight: 700 }}>{est?.label ?? s.estado}</span>
                      </div>
                      {!!s.createdAt && <span style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{String(s.createdAt).slice(0, 10)}</span>}
                    </div>
                    <p style={{ fontSize: '14px', color: '#374151', margin: '0 0 8px' }}>{s.descripcion}</p>
                    {s.material_ref && <p style={{ fontSize: '12.5px', color: '#9CA3AF', margin: '0 0 8px' }}>Ref: {s.material_ref}</p>}
                    {s.respuesta && (
                      <div style={{ marginTop: '12px', padding: '12px', background: '#F5F3FF', borderRadius: '10px', borderLeft: `3px solid ${P}` }}>
                        <p style={{ fontSize: '11.5px', fontWeight: 800, color: P, margin: '0 0 5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Respuesta del equipo</p>
                        <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>{s.respuesta}</p>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', padding: '32px 20px', color: '#9CA3AF', fontSize: '12.5px' }}>
        Portal de clientes · <strong style={{ color: P }}>Alma Agencia Creativa</strong> · Manizales, Colombia
      </div>

      {/* ══ MODAL solicitud ════════════════════════════════════ */}
      {showSolForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{
            background: '#fff', borderRadius: '20px 20px 0 0',
            padding: '28px 24px 36px',
            width: '100%', maxWidth: '540px',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#111' }}>Nueva solicitud</h3>
              <button onClick={() => setShowSolForm(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>✕</button>
            </div>

            {sent ? (
              <div style={{ textAlign: 'center', padding: '28px 0' }}>
                <p style={{ fontSize: '48px', margin: '0 0 12px' }}>✅</p>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#059669', margin: '0 0 6px' }}>¡Solicitud enviada!</p>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>El equipo de Alma revisará tu solicitud y te responderá pronto.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={pLabelStyle}>
                  Tipo de solicitud
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {SOLICITUD_TIPOS.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setSolTipo(t.value)}
                        style={{
                          padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                          border: `1.5px solid ${solTipo === t.value ? t.color : '#E5E7EB'}`,
                          background: solTipo === t.value ? t.color + '20' : '#fff',
                          color: solTipo === t.value ? t.color : '#6B7280',
                          fontSize: '13px', fontWeight: solTipo === t.value ? 700 : 500,
                          transition: 'all 0.15s',
                        }}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </label>

                <label style={pLabelStyle}>
                  Descripción *
                  <textarea
                    value={solDesc}
                    onChange={e => setSolDesc(e.target.value)}
                    rows={4}
                    placeholder="Describe detalladamente tu solicitud, qué cambio necesitas o qué dudas tienes…"
                    style={{ ...pInputStyle, resize: 'vertical', marginTop: '6px' }}
                  />
                </label>

                <label style={pLabelStyle}>
                  Material de referencia (opcional)
                  <input
                    value={solRef}
                    onChange={e => setSolRef(e.target.value)}
                    placeholder="Ej: Post del 15 de mayo, logo versión 2, landing page…"
                    style={{ ...pInputStyle, marginTop: '6px' }}
                  />
                </label>

                <button
                  onClick={submitSolicitud}
                  disabled={sending || !solDesc.trim()}
                  style={{
                    padding: '13px', borderRadius: '12px', border: 'none',
                    background: sending || !solDesc.trim() ? '#9CA3AF' : P,
                    color: '#fff', cursor: sending || !solDesc.trim() ? 'default' : 'pointer',
                    fontWeight: 800, fontSize: '15px', marginTop: '4px',
                  }}
                >
                  {sending ? 'Enviando…' : 'Enviar solicitud'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────────── */
const pLabelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column',
  fontSize: '13px', fontWeight: 700, color: '#374151',
}

const pInputStyle: React.CSSProperties = {
  padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB',
  fontSize: '14px', color: '#111', background: '#fff', outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

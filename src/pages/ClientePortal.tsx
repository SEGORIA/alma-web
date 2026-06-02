import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPortalByToken, addSolicitudToPortal, updateEntregableEnPortal } from '../lib/db'
import type { Cliente, Solicitud, ParrillaItem, ComentarioContenido } from '../data/clientes'
import {
  ENTREGABLE_CATEGORIAS, PARRILLA_ESTADOS, PILARES_CONTENIDO,
  SOLICITUD_TIPOS, SOLICITUD_ESTADOS, CLIENTE_ESTADOS,
  ENTREGABLE_REVISION_ESTADOS,
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
  // Parrilla
  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const [activeMes,    setActiveMes]    = useState<string>('all')
  const [copiedId,     setCopiedId]     = useState<string | null>(null)
  // Contenido (revisión)
  const [reviewingId,   setReviewingId]   = useState<string | null>(null)
  const [reviewType,    setReviewType]    = useState<'aprobacion' | 'ajuste'>('aprobacion')
  const [reviewText,    setReviewText]    = useState('')
  const [reviewSending, setReviewSending] = useState(false)

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

  async function submitComentario(entregableId: string) {
    if (!data?.clienteId || !token) return
    if (reviewType === 'ajuste' && !reviewText.trim()) return
    const comentario: ComentarioContenido = {
      id:        newId(),
      tipo:      reviewType,
      texto:     reviewText.trim() || (reviewType === 'aprobacion' ? '¡Perfecto! Aprobado.' : ''),
      autor:     'cliente',
      createdAt: new Date().toISOString(),
    }
    const target    = (data.entregables ?? []).find(e => e.id === entregableId)
    if (!target) return
    const estado_revision = reviewType === 'aprobacion' ? 'aprobado' : 'con_ajustes'
    const comentarios     = [...(target.comentarios ?? []), comentario]
    setReviewSending(true)
    try {
      await updateEntregableEnPortal(token, data.clienteId, entregableId, {
        estado_revision: estado_revision as import('../data/clientes').EntregableRevision,
        comentarios,
      })
      setData(d => d ? {
        ...d,
        entregables: (d.entregables ?? []).map(e =>
          e.id === entregableId ? { ...e, estado_revision, comentarios } : e
        ),
      } : d)
      setReviewingId(null); setReviewText('')
    } catch { /* silencioso */ }
    finally { setReviewSending(false) }
  }

  const TABS = [
    { key: 'inicio',      label: '🏠 Inicio' },
    { key: 'entregables', label: `📋 Contenido (${(data.entregables ?? []).length})` },
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
        {tab === 'inicio' && (() => {
          const parrilla    = data.parrilla ?? []
          const publicados  = parrilla.filter(p => p.estado === 'publicado')
          const conMetricas = publicados.filter(p => p.metricas && Object.values(p.metricas).some(v => v != null && v > 0))
          const totalAlcance    = conMetricas.reduce((s, p) => s + (p.metricas?.alcance ?? 0), 0)
          const totalLikes      = conMetricas.reduce((s, p) => s + (p.metricas?.likes ?? 0), 0)
          const totalGuardados  = conMetricas.reduce((s, p) => s + (p.metricas?.guardados ?? 0), 0)
          const avgEngagement   = conMetricas.length > 0
            ? conMetricas.reduce((s, p) => s + (p.metricas?.engagement ?? 0), 0) / conMetricas.length
            : 0

          // Posts con mejor alcance (top 3)
          const topPosts = [...conMetricas].sort((a, b) => (b.metricas?.alcance ?? 0) - (a.metricas?.alcance ?? 0)).slice(0, 3)

          // Meses con publicaciones
          const mesesPublicados = [...new Set(publicados.map(p => p.fecha?.slice(0, 7)).filter(Boolean))].sort().reverse()

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

              {/* Resumen del proyecto */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Contenidos',   value: (data.entregables ?? []).length, icon: '📋', color: '#6B21A8' },
                  { label: 'En parrilla',  value: parrilla.length,                 icon: '📅', color: '#0EA5E9' },
                  { label: 'Publicados',   value: publicados.length,               icon: '✅', color: '#059669' },
                  { label: 'Solicitudes',  value: (data.solicitudes ?? []).length, icon: '💬', color: '#D97706' },
                ].map(m => (
                  <div key={m.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px 14px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                    <p style={{ fontSize: '26px', margin: '0 0 5px' }}>{m.icon}</p>
                    <p style={{ fontSize: '24px', fontWeight: 900, color: m.color, margin: '0 0 3px' }}>{m.value}</p>
                    <p style={{ fontSize: '11.5px', color: '#6B7280', margin: 0, fontWeight: 600 }}>{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Dashboard de métricas */}
              {conMetricas.length > 0 && (
                <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #F3F4F6' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Métricas acumuladas</p>
                    <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#9CA3AF' }}>{conMetricas.length} posts con datos registrados</p>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0', padding: '0' }}>
                    {[
                      { label: 'Alcance total',   value: totalAlcance.toLocaleString(),   icon: '👁️',  color: P },
                      { label: 'Likes totales',    value: totalLikes.toLocaleString(),     icon: '❤️',  color: '#EF4444' },
                      { label: 'Guardados',        value: totalGuardados.toLocaleString(), icon: '🔖',  color: '#F59E0B' },
                      { label: 'Eng. promedio',    value: `${avgEngagement.toFixed(1)}%`,  icon: '📈',  color: '#059669' },
                    ].map((m, i) => (
                      <div key={m.label} style={{
                        padding: '18px 16px', textAlign: 'center',
                        borderRight: i < 3 ? '1px solid #F3F4F6' : 'none',
                        borderBottom: '0',
                      }}>
                        <p style={{ fontSize: '22px', margin: '0 0 4px' }}>{m.icon}</p>
                        <p style={{ fontSize: '20px', fontWeight: 900, color: m.color, margin: '0 0 3px' }}>{m.value}</p>
                        <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0, fontWeight: 600 }}>{m.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top posts */}
              {topPosts.length > 0 && (
                <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F3F4F6' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🏆 Mejores posts por alcance</p>
                  </div>
                  {topPosts.map((p, i) => {
                    const maxAlc = topPosts[0].metricas?.alcance ?? 1
                    const pct    = Math.round(((p.metricas?.alcance ?? 0) / maxAlc) * 100)
                    const pilarI = PILARES_CONTENIDO.find(x => x.value === p.pilar)
                    return (
                      <div key={p.id} style={{ padding: '14px 20px', borderBottom: i < topPosts.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                          <span style={{ width: '24px', height: '24px', borderRadius: '6px', background: ['#F59E0B', '#9CA3AF', '#CD7C2F'][i] + '22', color: ['#F59E0B', '#9CA3AF', '#CD7C2F'][i], fontSize: '12px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {i + 1}
                          </span>
                          <p style={{ flex: 1, margin: 0, fontSize: '13px', fontWeight: 700, color: '#111', lineClamp: 1 }}>{p.descripcion}</p>
                          {pilarI && <span style={{ padding: '2px 8px', borderRadius: '6px', background: pilarI.bg, color: pilarI.color, fontSize: '11px', fontWeight: 700 }}>{pilarI.label}</span>}
                          <span style={{ fontSize: '12px', fontWeight: 800, color: P }}>{(p.metricas?.alcance ?? 0).toLocaleString()} alcance</span>
                        </div>
                        {/* Barra de alcance */}
                        <div style={{ height: '4px', background: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${P}, #9333EA)`, borderRadius: '2px', transition: 'width 0.5s ease' }} />
                        </div>
                        {/* Sub-métricas */}
                        <div style={{ display: 'flex', gap: '14px', marginTop: '6px' }}>
                          {p.metricas?.likes      ? <span style={{ fontSize: '11px', color: '#9CA3AF' }}>❤️ {p.metricas.likes.toLocaleString()}</span> : null}
                          {p.metricas?.guardados  ? <span style={{ fontSize: '11px', color: '#9CA3AF' }}>🔖 {p.metricas.guardados.toLocaleString()}</span> : null}
                          {p.metricas?.comentarios ? <span style={{ fontSize: '11px', color: '#9CA3AF' }}>💬 {p.metricas.comentarios.toLocaleString()}</span> : null}
                          {p.metricas?.engagement ? <span style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>📈 {p.metricas.engagement}%</span> : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Histórico por meses */}
              {mesesPublicados.length > 0 && (
                <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                  <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #F3F4F6' }}>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🗂️ Historial por mes</p>
                  </div>
                  {mesesPublicados.map(mes => {
                    const posts = publicados.filter(p => p.fecha?.startsWith(mes))
                    const [y, m] = mes.split('-')
                    const mesLabel = new Date(+y, +m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
                    const alcMes  = posts.reduce((s, p) => s + (p.metricas?.alcance ?? 0), 0)
                    return (
                      <div key={mes} style={{ padding: '14px 20px', borderBottom: '1px solid #F9FAFB', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 700, color: '#111', textTransform: 'capitalize' }}>{mesLabel}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>{posts.length} post{posts.length !== 1 ? 's' : ''} publicados</p>
                        </div>
                        {alcMes > 0 && <span style={{ fontSize: '13px', fontWeight: 700, color: P }}>👁️ {alcMes.toLocaleString()}</span>}
                        <button
                          onClick={() => { setTab('parrilla'); setActiveMes(mes) }}
                          style={{ padding: '6px 14px', borderRadius: '8px', background: 'rgba(107,33,168,0.08)', color: P, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}
                        >
                          Ver parrilla →
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Inicio fecha */}
              {data.fecha_inicio && (
                <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E5E7EB', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '28px' }}>📆</span>
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Inicio del proyecto</p>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#374151', margin: 0 }}>{data.fecha_inicio}</p>
                  </div>
                </div>
              )}

              {/* Contrato */}
              {data.contrato_url && (
                <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#9CA3AF', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📑 Contrato de servicios</p>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>Tu contrato está disponible para descargar.</p>
                  </div>
                  <a href={data.contrato_url} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 22px', borderRadius: '10px', background: P, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
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
                <button onClick={() => setShowSolForm(true)} style={{ padding: '10px 22px', borderRadius: '10px', background: P, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '13px', flexShrink: 0 }}>
                  + Nueva solicitud
                </button>
              </div>
            </div>
          )
        })()}

        {/* ── CONTENIDO (antes Entregables) ── */}
        {tab === 'entregables' && (
          <div>
            {(data.entregables ?? []).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📋</p>
                <p style={{ color: '#6B7280', fontSize: '15px' }}>Aún no hay contenidos disponibles.<br />El equipo de Alma los irá subiendo aquí.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(272px, 1fr))', gap: '16px' }}>
                {(data.entregables ?? []).map(e => {
                  const cat     = ENTREGABLE_CATEGORIAS.find(c => c.key === e.categoria)
                  const revEst  = ENTREGABLE_REVISION_ESTADOS.find(x => x.value === (e.estado_revision ?? 'pendiente_revision'))
                  const isRev   = reviewingId === e.id
                  const comentarios = e.comentarios ?? []

                  return (
                    <div key={e.id} style={{
                      background: '#fff',
                      borderRadius: '14px',
                      border: '1px solid #E5E7EB',
                      borderTop: `4px solid ${cat?.color ?? '#E5E7EB'}`,
                      display: 'flex', flexDirection: 'column',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      overflow: 'hidden',
                    }}>

                      {/* ── Header de la tarjeta ── */}
                      <div style={{ padding: '16px 16px 12px', flex: 1 }}>
                        {/* Categoría + estado */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: cat?.color ?? '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                            {cat?.icon} {cat?.label}
                          </span>
                          <span style={{ padding: '3px 9px', borderRadius: '20px', background: revEst?.bg ?? '#F3F4F6', color: revEst?.color ?? '#6B7280', fontSize: '10.5px', fontWeight: 800 }}>
                            {revEst?.icon} {revEst?.label}
                          </span>
                        </div>

                        {/* Título */}
                        <p style={{ margin: '0 0 5px', fontSize: '15px', fontWeight: 800, color: '#111', lineHeight: 1.3 }}>{e.nombre}</p>
                        {e.descripcion && <p style={{ margin: '0 0 14px', fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>{e.descripcion}</p>}

                        {/* Ver contenido */}
                        <a
                          href={e.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '5px',
                            padding: '8px 14px', borderRadius: '8px',
                            background: PL, color: P,
                            textDecoration: 'none', fontWeight: 700, fontSize: '13px',
                          }}
                        >
                          Ver contenido →
                        </a>
                      </div>

                      {/* ── Historial de comentarios ── */}
                      {comentarios.length > 0 && (
                        <div style={{ padding: '10px 16px 0', borderTop: '1px solid #F3F4F6' }}>
                          <p style={{ margin: '0 0 8px', fontSize: '10.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            💬 Comentarios ({comentarios.length})
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                            {comentarios.map(c => {
                              const isAprov = c.tipo === 'aprobacion'
                              return (
                                <div key={c.id} style={{
                                  padding: '8px 10px', borderRadius: '8px',
                                  background: isAprov ? '#F0FDF4' : '#FFF1F2',
                                  border: `1px solid ${isAprov ? '#BBF7D0' : '#FECDD3'}`,
                                }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 800, color: isAprov ? '#059669' : '#DC2626' }}>
                                      {isAprov ? '✅ Aprobación' : '🔄 Ajuste'} · {c.autor === 'cliente' ? 'Tú' : 'Alma'}
                                    </span>
                                    {c.createdAt && (
                                      <span style={{ fontSize: '10px', color: '#9CA3AF' }}>
                                        {new Date(c.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                                      </span>
                                    )}
                                  </div>
                                  <p style={{ margin: 0, fontSize: '12px', color: '#374151', lineHeight: 1.4 }}>{c.texto}</p>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* ── Acciones ── */}
                      <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6', marginTop: '12px' }}>
                        {!isRev ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              onClick={() => { setReviewingId(e.id); setReviewType('aprobacion'); setReviewText('') }}
                              style={{
                                flex: 1, padding: '8px 0', borderRadius: '8px',
                                border: e.estado_revision === 'aprobado' ? '1.5px solid #BBF7D0' : '1.5px solid #059669',
                                background: e.estado_revision === 'aprobado' ? '#F0FDF4' : '#fff',
                                color: '#059669', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                              }}
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              onClick={() => { setReviewingId(e.id); setReviewType('ajuste'); setReviewText('') }}
                              style={{
                                flex: 1, padding: '8px 0', borderRadius: '8px',
                                border: '1.5px solid #E5E7EB',
                                background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                              }}
                            >
                              🔄 Pedir ajuste
                            </button>
                          </div>
                        ) : (
                          <div>
                            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                              <button onClick={() => setReviewType('aprobacion')} style={{ flex: 1, padding: '6px 0', borderRadius: '7px', border: `1.5px solid ${reviewType === 'aprobacion' ? '#059669' : '#E5E7EB'}`, background: reviewType === 'aprobacion' ? '#F0FDF4' : '#fff', color: reviewType === 'aprobacion' ? '#059669' : '#6B7280', cursor: 'pointer', fontWeight: 700, fontSize: '11.5px' }}>
                                ✅ Aprobar
                              </button>
                              <button onClick={() => setReviewType('ajuste')} style={{ flex: 1, padding: '6px 0', borderRadius: '7px', border: `1.5px solid ${reviewType === 'ajuste' ? '#DC2626' : '#E5E7EB'}`, background: reviewType === 'ajuste' ? '#FFF1F2' : '#fff', color: reviewType === 'ajuste' ? '#DC2626' : '#6B7280', cursor: 'pointer', fontWeight: 700, fontSize: '11.5px' }}>
                                🔄 Ajuste
                              </button>
                            </div>
                            <textarea
                              value={reviewText}
                              onChange={ev => setReviewText(ev.target.value)}
                              rows={3}
                              placeholder={reviewType === 'aprobacion'
                                ? 'Agrega un comentario (opcional)…'
                                : 'Describe qué necesitas ajustar… *'}
                              style={{
                                width: '100%', padding: '9px 11px', borderRadius: '8px',
                                border: `1.5px solid ${reviewType === 'ajuste' && !reviewText.trim() ? '#FECDD3' : '#E5E7EB'}`,
                                fontSize: '13px', resize: 'vertical', outline: 'none',
                                fontFamily: 'inherit', boxSizing: 'border-box',
                              }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button
                                onClick={() => submitComentario(e.id)}
                                disabled={reviewSending || (reviewType === 'ajuste' && !reviewText.trim())}
                                style={{
                                  flex: 1, padding: '9px 0', borderRadius: '8px', border: 'none',
                                  background: reviewSending ? '#9CA3AF' : (reviewType === 'aprobacion' ? '#059669' : '#DC2626'),
                                  color: '#fff', cursor: reviewSending ? 'default' : 'pointer',
                                  fontWeight: 800, fontSize: '13px',
                                }}
                              >
                                {reviewSending ? 'Guardando…' : 'Confirmar'}
                              </button>
                              <button
                                onClick={() => { setReviewingId(null); setReviewText('') }}
                                style={{ padding: '9px 16px', borderRadius: '8px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── PARRILLA ── */}
        {tab === 'parrilla' && (() => {
          const allItems = [...(data.parrilla ?? [])].sort((a, b) => {
            if (a.dia_num && b.dia_num) return a.dia_num - b.dia_num
            return (a.fecha ?? '').localeCompare(b.fecha ?? '')
          })

          // Meses disponibles
          const meses = [...new Set(allItems.map(p => p.fecha?.slice(0, 7)).filter(Boolean))].sort()
          const currentMes = activeMes === 'all' ? null : activeMes
          const items = currentMes ? allItems.filter(p => p.fecha?.startsWith(currentMes)) : allItems

          // Agrupar por semanas
          const semanas = [...new Set(items.map(p => p.semana ?? 0))]

          function copyCaption(p: ParrillaItem) {
            const text = [p.caption, p.hashtags].filter(Boolean).join('\n\n')
            if (text) {
              navigator.clipboard.writeText(text)
              setCopiedId(p.id)
              setTimeout(() => setCopiedId(null), 2000)
            }
          }

          if (allItems.length === 0) return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📅</p>
              <p style={{ color: '#6B7280', fontSize: '15px' }}>La parrilla de contenido estará disponible aquí.<br />El equipo de Alma la completará pronto.</p>
            </div>
          )

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

              {/* ── Encabezado editorial ── */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Plan editorial · {allItems.length} días
                </p>
                <h2 style={{ margin: '0 0 2px', fontSize: '28px', fontWeight: 900, color: '#111', lineHeight: 1.15 }}>
                  El Calendario <em style={{ color: '#D97706', fontStyle: 'italic', fontWeight: 800 }}>Exacto</em>
                </h2>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: '#111', lineHeight: 1.15 }}>Día por Día</h2>
              </div>

              {/* ── Filtro por mes ── */}
              {meses.length > 1 && (
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  <button onClick={() => setActiveMes('all')} style={{ padding: '6px 14px', borderRadius: '20px', border: `1.5px solid ${activeMes === 'all' ? P : '#E5E7EB'}`, background: activeMes === 'all' ? P : '#fff', color: activeMes === 'all' ? '#fff' : '#6B7280', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                    Todos
                  </button>
                  {meses.map(mes => {
                    const [y, m] = mes.split('-')
                    const label = new Date(+y, +m - 1, 1).toLocaleDateString('es-CO', { month: 'short', year: 'numeric' })
                    return (
                      <button key={mes} onClick={() => setActiveMes(mes)} style={{ padding: '6px 14px', borderRadius: '20px', border: `1.5px solid ${activeMes === mes ? P : '#E5E7EB'}`, background: activeMes === mes ? P : '#fff', color: activeMes === mes ? '#fff' : '#6B7280', fontSize: '12px', fontWeight: 700, cursor: 'pointer', textTransform: 'capitalize' }}>
                        {label}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* ── Tabla de headers ── */}
              <div style={{ background: '#111', borderRadius: '12px 12px 0 0', padding: '10px 16px', display: 'grid', gridTemplateColumns: '52px 1fr 120px 160px', gap: '0', alignItems: 'center' }}>
                {['DÍA', 'CONTENIDO', 'PILAR', 'CTA / KEYWORD'].map(h => (
                  <span key={h} style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.55)', letterSpacing: '1px', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>

              {/* ── Ítems por semana ── */}
              <div style={{ border: '1px solid #E5E7EB', borderTop: 'none', borderRadius: '0 0 16px 16px', overflow: 'hidden' }}>
                {semanas.map((sem, si) => {
                  const semItems = sem === 0 ? items.filter(p => !p.semana) : items.filter(p => p.semana === sem)
                  if (semItems.length === 0) return null
                  const diasRange = semItems.filter(p => p.dia_num).map(p => p.dia_num!)
                  const dMin = diasRange.length ? Math.min(...diasRange) : null
                  const dMax = diasRange.length ? Math.max(...diasRange) : null

                  return (
                    <div key={`sem-${sem}-${si}`}>
                      {/* Separador de semana */}
                      {sem > 0 && (
                        <div style={{ background: '#111', padding: '12px 16px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                          <span style={{ background: '#fff', color: '#111', borderRadius: '4px', padding: '1px 7px', fontSize: '11px', fontWeight: 900 }}>S{sem}</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>SEMANA {sem}</span>
                          {dMin && dMax && (
                            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginLeft: '4px' }}>· DÍAS {dMin}–{dMax}</span>
                          )}
                        </div>
                      )}

                      {/* Posts de la semana */}
                      {semItems.map((p, idx) => {
                        const isExpanded = expandedId === p.id
                        const pilarI = PILARES_CONTENIDO.find(x => x.value === p.pilar)
                        const est    = PARRILLA_ESTADOS.find(x => x.value === p.estado)
                        const instrLines = (p.instrucciones ?? '').split('\n').filter(Boolean)
                        const hasCopy = !!(p.caption || p.hashtags)

                        return (
                          <div key={p.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                            {/* ── Fila principal ── */}
                            <div
                              onClick={() => setExpandedId(isExpanded ? null : p.id)}
                              style={{
                                display: 'grid', gridTemplateColumns: '52px 1fr 120px 160px',
                                gap: '0', alignItems: 'center',
                                padding: '14px 16px',
                                background: isExpanded ? '#F9FAFB' : idx % 2 === 0 ? '#fff' : '#FAFAFA',
                                cursor: 'pointer',
                                transition: 'background 0.1s',
                              }}
                            >
                              {/* Día # */}
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 900, color: '#111', lineHeight: 1 }}>
                                  {p.dia_num ? String(p.dia_num).padStart(2, '0') : '—'}
                                </span>
                                {est && (
                                  <span style={{ padding: '1px 5px', borderRadius: '4px', background: est.bg, color: est.color, fontSize: '9px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                    {est.label}
                                  </span>
                                )}
                              </div>

                              {/* Contenido */}
                              <div style={{ paddingRight: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                  <span style={{ padding: '2px 7px', borderRadius: '4px', background: '#111', color: '#fff', fontSize: '10px', fontWeight: 800, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                                    {p.tipo.toUpperCase()}{p.duracion ? ` · ${p.duracion.toUpperCase()}` : ''}
                                  </span>
                                  <span style={{ fontSize: '10px', color: '#9CA3AF' }}>{p.red}</span>
                                  {p.link && (
                                    <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: '10px', color: P, fontWeight: 700, textDecoration: 'none' }}>🔗 Ver post</a>
                                  )}
                                </div>
                                <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: '#111', lineHeight: 1.3 }}>{p.descripcion}</p>
                                {p.subtitulo && <p style={{ margin: 0, fontSize: '12px', color: '#9CA3AF' }}>{p.subtitulo}</p>}
                              </div>

                              {/* Pilar */}
                              <div>
                                {pilarI ? (
                                  <span style={{ padding: '3px 9px', borderRadius: '6px', background: pilarI.bg, color: pilarI.color, fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                    {pilarI.label.toUpperCase()}
                                  </span>
                                ) : <span style={{ fontSize: '11px', color: '#E5E7EB' }}>—</span>}
                              </div>

                              {/* CTA */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {p.cta ? (
                                  <span style={{ padding: '5px 12px', borderRadius: '8px', background: '#D97706', color: '#fff', fontSize: '11.5px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                    {p.cta} ▶
                                  </span>
                                ) : <span style={{ fontSize: '11px', color: '#E5E7EB' }}>—</span>}
                                <span style={{ marginLeft: 'auto', fontSize: '14px', color: '#9CA3AF', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>▾</span>
                              </div>
                            </div>

                            {/* ── Panel expandido ── */}
                            {isExpanded && (
                              <div style={{ background: '#FAFAFA', borderTop: '1px solid #F0F0F0', borderBottom: '1px solid #E5E7EB' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0' }}>

                                  {/* Concepto visual */}
                                  <div style={{ padding: '20px', borderRight: '1px solid #E5E7EB' }}>
                                    <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Concepto visual</p>
                                    {p.concepto_visual ? (
                                      <p style={{ margin: 0, fontSize: '13px', color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.concepto_visual}</p>
                                    ) : (
                                      <p style={{ margin: 0, fontSize: '12px', color: '#D1D5DB' }}>Sin concepto visual aún.</p>
                                    )}
                                  </div>

                                  {/* Caption */}
                                  <div style={{ padding: '20px', borderRight: '1px solid #E5E7EB' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                      <p style={{ margin: 0, fontSize: '10px', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Caption completo</p>
                                      {hasCopy && (
                                        <button
                                          onClick={e => { e.stopPropagation(); copyCaption(p) }}
                                          style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid #E5E7EB', background: copiedId === p.id ? '#059669' : '#fff', color: copiedId === p.id ? '#fff' : '#374151', fontSize: '11px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}
                                        >
                                          {copiedId === p.id ? '✓ Copiado' : '📋 Copiar'}
                                        </button>
                                      )}
                                    </div>
                                    {p.caption ? (
                                      <div style={{ background: '#111', borderRadius: '10px', padding: '14px 16px' }}>
                                        <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#E5E7EB', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{p.caption}</p>
                                        {p.hashtags && (
                                          <p style={{ margin: 0, fontSize: '12px', color: '#6B7280', lineHeight: 1.6 }}>{p.hashtags}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <p style={{ margin: 0, fontSize: '12px', color: '#D1D5DB' }}>Caption pendiente.</p>
                                    )}
                                  </div>

                                  {/* Instrucciones */}
                                  <div style={{ padding: '20px' }}>
                                    <p style={{ margin: '0 0 12px', fontSize: '10px', fontWeight: 900, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px' }}>Instrucciones de publicación</p>
                                    {instrLines.length > 0 ? (
                                      <ul style={{ margin: '0 0 12px', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {instrLines.map((line, i) => (
                                          <li key={i} style={{ fontSize: '12.5px', color: '#374151', lineHeight: 1.5 }}>{line}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <p style={{ margin: '0 0 12px', fontSize: '12px', color: '#D1D5DB' }}>Sin instrucciones aún.</p>
                                    )}
                                    {p.story_del_dia && (
                                      <div style={{ background: '#FEF9C3', borderRadius: '8px', padding: '10px 12px', marginTop: '8px' }}>
                                        <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📱 Story del día</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#78350F', lineHeight: 1.5 }}>{p.story_del_dia}</p>
                                      </div>
                                    )}
                                    {/* Métricas inline si están publicado */}
                                    {p.estado === 'publicado' && p.metricas && Object.values(p.metricas).some(v => v != null && v > 0) && (
                                      <div style={{ background: 'rgba(107,33,168,0.06)', borderRadius: '8px', padding: '10px 12px', marginTop: '10px' }}>
                                        <p style={{ margin: '0 0 6px', fontSize: '10px', fontWeight: 800, color: P, textTransform: 'uppercase', letterSpacing: '0.5px' }}>📊 Métricas</p>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                          {p.metricas.alcance    ? <span style={{ fontSize: '12px' }}>👁️ {p.metricas.alcance.toLocaleString()}</span> : null}
                                          {p.metricas.likes      ? <span style={{ fontSize: '12px' }}>❤️ {p.metricas.likes.toLocaleString()}</span> : null}
                                          {p.metricas.comentarios ? <span style={{ fontSize: '12px' }}>💬 {p.metricas.comentarios.toLocaleString()}</span> : null}
                                          {p.metricas.guardados  ? <span style={{ fontSize: '12px' }}>🔖 {p.metricas.guardados.toLocaleString()}</span> : null}
                                          {p.metricas.engagement ? <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>📈 {p.metricas.engagement}%</span> : null}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Story del día como fila separada si no hay instrucciones */}
                              </div>
                            )}

                            {/* ── Story del día (fila separada) ── */}
                            {p.story_del_dia && !isExpanded && (
                              <div style={{ background: '#FFFBEB', borderTop: '1px dashed #FDE68A', padding: '9px 16px 9px 68px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>📱 Story del día {p.dia_num ?? ''}:</span>
                                <span style={{ fontSize: '12px', color: '#78350F', fontStyle: 'italic' }}>{p.story_del_dia}</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

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

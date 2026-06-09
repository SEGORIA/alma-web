import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPortalByToken, addSolicitudToPortal, updateEntregableEnPortal } from '../lib/db'
import { trackPortalVisit } from '../lib/analytics'
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

/* ── Logo injection into HTML parrilla ───────────────────── */
function injectLogo(html: string, logoUrl: string, marca: string): string {
  if (!logoUrl) return html
  const navImg  = `<img src="${logoUrl}" alt="${marca}" class="logo-nav"  style="width:30px;height:30px;object-fit:contain;border-radius:4px;">`
  const heroImg = `<img src="${logoUrl}" alt="${marca}" class="logo-hero" style="width:130px;height:130px;object-fit:contain;">`
  return html
    .replace(/<svg[^>]*class="logo-nav"[^>]*>[\s\S]*?<\/svg>/g,  navImg)
    .replace(/<svg[^>]*class="logo-hero"[^>]*>[\s\S]*?<\/svg>/g, heroImg)
}

/* ── Main Component ──────────────────────────────────────── */
export default function ClientePortal() {
  const { token } = useParams<{ token: string }>()
  const [data,    setData]    = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'inicio' | 'entregables' | 'parrilla' | 'plan' | 'marca' | 'solicitudes' | 'accesos'>('inicio')
  const [showSolForm, setShowSolForm] = useState(false)
  const [solTipo,     setSolTipo]     = useState<Solicitud['tipo']>('cambio')
  const [solDesc,     setSolDesc]     = useState('')
  const [solRef,      setSolRef]      = useState('')
  const [sending,     setSending]     = useState(false)
  const [sent,        setSent]        = useState(false)
  // Parrilla
  const [activeHtmlId,        setActiveHtmlId]        = useState<string | null>(null)
  const [activeParrillaMesId, setActiveParrillaMesId] = useState<string | null>(null)
  const [visiblePasswords,    setVisiblePasswords]    = useState<Set<string>>(new Set())
  const [expandedId,          setExpandedId]          = useState<string | null>(null)
  const [activeMes,           setActiveMes]           = useState<string>('all')
  const [copiedId,            setCopiedId]            = useState<string | null>(null)
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
      if (d) trackPortalVisit(token)
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

  type PortalTab = 'inicio' | 'entregables' | 'parrilla' | 'plan' | 'marca' | 'solicitudes' | 'accesos'
  const TABS: { key: PortalTab; label: string }[] = [
    { key: 'inicio',      label: '🏠 Inicio' },
    { key: 'entregables', label: `📋 Contenido (${(data.entregables ?? []).length})` },
    { key: 'parrilla',    label: `📅 Parrilla` },
    { key: 'plan',        label: '📦 Plan del mes' },
    { key: 'marca',       label: '🎨 Análisis' },
    { key: 'solicitudes', label: `💬 Solicitudes (${(data.solicitudes ?? []).length})` },
    ...((data.accesos ?? []).length > 0 ? [{ key: 'accesos' as PortalTab, label: '🔐 Accesos' }] : []),
  ]

  // Compact header when parrilla tab has Trello board OR legacy HTML active
  const isHtmlParrilla = tab === 'parrilla' && (
    (data.parrilla_meses ?? []).length > 0 ||
    (data.parrilla_htmls ?? []).length > 0
  )

  return (
    <div style={{ minHeight: '100vh', background: '#F2F0FA', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:translateY(0) } }
        @keyframes barGrow { from { width:0 } to { width:var(--bar-w,0%) } }
        .portal-tab-btn:hover { background: rgba(255,255,255,0.12) !important }
        .portal-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(107,33,168,0.15) !important; }
        .portal-action-btn:hover { opacity:0.88; transform:scale(0.98) }
      `}</style>

      {/* ══ HEADER ══ */}
      {isHtmlParrilla ? (
        /* ── Compact banner cuando hay parrilla HTML activa ── */
        <div style={{
          background: 'linear-gradient(140deg, #0A0118 0%, #1E0547 35%, #3B0C87 65%, #6D28D9 100%)',
        }}>
          <div style={{ maxWidth: '920px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
            {/* Slim identity bar */}
            <div style={{ padding: '10px 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Alma logo */}
              <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '7px', padding: '4px 9px', backdropFilter: 'blur(8px)', flexShrink: 0 }}>
                <img src="/alma-logo.png" alt="Alma" style={{ height: '19px', width: 'auto', display: 'block' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', flexShrink: 0 }}>·</span>
              {/* Brand avatar (small) */}
              {data.logo_url ? (
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', padding: '2px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={data.logo_url} alt={data.marca} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
              ) : (
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(109,40,217,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900, color: '#fff', flexShrink: 0 }}>
                  {(data.marca ?? '?')[0].toUpperCase()}
                </div>
              )}
              {/* Brand name */}
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', flex: 1, letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.marca}</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase', flexShrink: 0 }}>Portal</span>
            </div>
            {/* Tabs */}
            <div style={{ display: 'flex', overflowX: 'auto', paddingLeft: '8px', marginTop: '2px' }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="portal-tab-btn"
                  style={{
                    padding: '10px 18px', border: 'none', cursor: 'pointer', flexShrink: 0,
                    background: tab === t.key ? 'rgba(255,255,255,1)' : 'transparent',
                    color: tab === t.key ? P : 'rgba(255,255,255,0.65)',
                    fontSize: '12.5px', fontWeight: tab === t.key ? 800 : 500,
                    borderRadius: tab === t.key ? '12px 12px 0 0' : '0',
                    whiteSpace: 'nowrap', transition: 'all 0.2s',
                    borderBottom: tab === t.key ? 'none' : '0',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── Full header (resto de tabs) ── */
        <div style={{
          background: 'linear-gradient(140deg, #0A0118 0%, #1E0547 35%, #3B0C87 65%, #6D28D9 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative blobs */}
          <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', bottom:'-30px', left:'5%', width:'200px', height:'200px', borderRadius:'50%', background:'radial-gradient(circle, rgba(167,139,250,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
          <div style={{ position:'absolute', top:'40%', left:'50%', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(109,40,217,0.1) 0%, transparent 70%)', pointerEvents:'none', transform:'translate(-50%,-50%)' }} />

          <div style={{ maxWidth:'920px', margin:'0 auto', position:'relative', zIndex:1 }}>

            {/* Top bar */}
            <div style={{ padding:'16px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ background:'rgba(255,255,255,0.1)', borderRadius:'8px', padding:'5px 12px', backdropFilter:'blur(8px)' }}>
                <img src="/alma-logo.png" alt="Alma" style={{ height:'26px', width:'auto', display:'block' }} />
              </div>
              <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', fontWeight:600, letterSpacing:'0.5px', textTransform:'uppercase' }}>Portal de cliente</span>
            </div>

            {/* Brand hero */}
            <div style={{ padding:'12px 24px 28px', display:'flex', alignItems:'flex-start', gap:'20px', flexWrap:'wrap' }}>
              {/* Logo */}
              {data.logo_url ? (
                <div style={{ width:'80px', height:'80px', borderRadius:'18px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', padding:'8px', flexShrink:0, backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src={data.logo_url} alt={data.marca} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:'10px' }} />
                </div>
              ) : (
                <div style={{ width:'80px', height:'80px', borderRadius:'18px', background:'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(109,40,217,0.6))', border:'1px solid rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'32px', fontWeight:900, color:'#fff', flexShrink:0, backdropFilter:'blur(8px)', letterSpacing:'-1px' }}>
                  {(data.marca ?? '?')[0].toUpperCase()}
                </div>
              )}

              {/* Nombre + Estado */}
              <div style={{ flex:1, minWidth:'180px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'6px' }}>
                  <h1 style={{ margin:0, color:'#fff', fontSize:'28px', fontWeight:900, letterSpacing:'-0.5px', lineHeight:1.1 }}>{data.marca}</h1>
                  {estadoInfo && (
                    <span style={{ padding:'4px 12px', borderRadius:'20px', background:'rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.9)', fontSize:'11.5px', fontWeight:700, border:'1px solid rgba(255,255,255,0.15)', backdropFilter:'blur(8px)' }}>
                      {estadoInfo.icon} {estadoInfo.label}
                    </span>
                  )}
                </div>
                <p style={{ margin:'0 0 14px', color:'rgba(255,255,255,0.6)', fontSize:'14px' }}>Bienvenido/a, <strong style={{ color:'rgba(255,255,255,0.88)', fontWeight:700 }}>{data.nombre}</strong></p>
                {/* Services */}
                {(data.servicios ?? []).length > 0 && (
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {(data.servicios ?? []).map(s => (
                      <span key={s} style={{ padding:'4px 11px', borderRadius:'20px', background:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.75)', fontSize:'12px', fontWeight:600, border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(4px)' }}>{s}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Plan contratado (derecha) ── */}
              {(data.plan_mes?.nombre || (data.plan_mes?.incluye ?? []).length > 0 || data.valor_contrato) && (
                <div style={{
                  flexShrink:0,
                  background:'linear-gradient(135deg, rgba(250,204,21,0.10) 0%, rgba(250,204,21,0.05) 100%)',
                  border:'1px solid rgba(250,204,21,0.28)',
                  borderRadius:'16px',
                  padding:'14px 18px',
                  backdropFilter:'blur(10px)',
                  minWidth:'180px',
                  maxWidth:'260px',
                }}>
                  {/* Encabezado del plan */}
                  <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'10px' }}>
                    <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'rgba(250,204,21,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', flexShrink:0 }}>⭐</div>
                    <div>
                      {data.plan_mes?.nombre && (
                        <p style={{ margin:0, fontSize:'13px', fontWeight:800, color:'rgba(250,204,21,0.95)', lineHeight:1.2 }}>{data.plan_mes.nombre}</p>
                      )}
                      {data.valor_contrato && (
                        <p style={{ margin:0, fontSize:'11px', fontWeight:600, color:'rgba(255,255,255,0.45)' }}>{data.valor_contrato}{data.moneda ? ` ${data.moneda}` : ''}</p>
                      )}
                    </div>
                  </div>

                  {/* Items del plan */}
                  {(data.plan_mes?.incluye ?? []).length > 0 && (
                    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                      {(data.plan_mes!.incluye ?? []).slice(0, 5).map((item, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'6px' }}>
                          <span style={{ color:'rgba(250,204,21,0.7)', fontSize:'10px', marginTop:'2px', flexShrink:0, lineHeight:1.4 }}>✦</span>
                          <span style={{ fontSize:'11.5px', color:'rgba(255,255,255,0.65)', lineHeight:1.4, fontWeight:500 }}>{item}</span>
                        </div>
                      ))}
                      {(data.plan_mes?.incluye ?? []).length > 5 && (
                        <p style={{ margin:'2px 0 0', fontSize:'10.5px', color:'rgba(255,255,255,0.3)', fontWeight:500 }}>+{(data.plan_mes!.incluye ?? []).length - 5} más incluidos</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation tabs */}
            <div style={{ display:'flex', overflowX:'auto', paddingLeft:'8px' }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className="portal-tab-btn"
                  style={{
                    padding:'13px 20px', border:'none', cursor:'pointer', flexShrink:0,
                    background: tab === t.key ? 'rgba(255,255,255,1)' : 'transparent',
                    color: tab === t.key ? P : 'rgba(255,255,255,0.65)',
                    fontSize:'13px', fontWeight: tab === t.key ? 800 : 500,
                    borderRadius: tab === t.key ? '14px 14px 0 0' : '0',
                    whiteSpace:'nowrap', transition:'all 0.2s',
                    borderBottom: tab === t.key ? 'none' : '0',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div style={{ maxWidth:'920px', margin:'0 auto', padding:'28px 20px' }}>

        {/* ── INICIO ── */}
        {tab === 'inicio' && (() => {
          const parrilla   = data.parrilla ?? []
          const publicados = parrilla.filter(p => p.estado === 'publicado')
          const conMet     = publicados.filter(p => p.metricas && Object.values(p.metricas).some(v => v != null && (v as number) > 0))
          const contenidos = data.entregables ?? []
          const aprobados  = contenidos.filter(e => e.estado_revision === 'aprobado').length
          const pendSol    = (data.solicitudes ?? []).filter(s => s.estado === 'pendiente').length

          // Métricas agregadas desde metricas_historico (admin) o derivadas de parrilla
          const histAdmin = [...(data.metricas_historico ?? [])].sort((a, b) => b.mes.localeCompare(a.mes))
          const mesActual = histAdmin[0]

          // Derivadas de parrilla
          const alcanceTotal  = conMet.reduce((s, p) => s + (p.metricas?.alcance ?? 0), 0)
          const likesTotal    = conMet.reduce((s, p) => s + (p.metricas?.likes ?? 0), 0)
          const guardadosTotal= conMet.reduce((s, p) => s + (p.metricas?.guardados ?? 0), 0)
          const avgEng        = conMet.length > 0
            ? (conMet.reduce((s, p) => s + (p.metricas?.engagement ?? 0), 0) / conMet.length)
            : 0

          // Top posts
          const topPosts = [...conMet].sort((a, b) => (b.metricas?.alcance ?? 0) - (a.metricas?.alcance ?? 0)).slice(0, 3)

          // Chart data: preferir histAdmin, fallback a derivado de parrilla
          const chartData = histAdmin.length >= 2 ? histAdmin.slice(0, 6).reverse() : []
          const maxAlcChart = chartData.reduce((m, d) => Math.max(m, d.alcance ?? 0), 1)

          return (
            <div style={{ display:'flex', flexDirection:'column', gap:'22px', animation:'fadeUp 0.35s ease' }}>

              {/* ══ 4 STAT CARDS GRANDES ══ */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(196px,1fr))', gap:'14px' }}>
                {([
                  {
                    label:'Posts publicados', value: String(publicados.length),
                    sub: `de ${parrilla.length} en parrilla`,
                    grad:'linear-gradient(135deg, #0F0520, #2D0A5E)',
                    icon:'📅', accent:'#A78BFA',
                  },
                  {
                    label:'Alcance acumulado',
                    value: mesActual?.alcance ? mesActual.alcance.toLocaleString() : alcanceTotal > 0 ? alcanceTotal.toLocaleString() : '—',
                    sub: mesActual ? 'según métricas del mes' : conMet.length > 0 ? `${conMet.length} posts` : 'sin datos aún',
                    grad:'linear-gradient(135deg, #0C2340, #1E40AF)',
                    icon:'👁️', accent:'#93C5FD',
                  },
                  {
                    label:'Engagement',
                    value: mesActual?.engagement ? `${mesActual.engagement}%` : avgEng > 0 ? `${avgEng.toFixed(1)}%` : '—',
                    sub: 'promedio del período',
                    grad:'linear-gradient(135deg, #052E16, #065F46)',
                    icon:'📈', accent:'#6EE7B7',
                  },
                  {
                    label:'Contenido aprobado',
                    value: `${aprobados}/${contenidos.length}`,
                    sub: pendSol > 0 ? `${pendSol} solicitud${pendSol > 1 ? 'es' : ''} pendiente` : 'sin pendientes',
                    grad:'linear-gradient(135deg, #431407, #92400E)',
                    icon:'✅', accent:'#FCD34D',
                  },
                ] as { label:string; value:string; sub:string; grad:string; icon:string; accent:string }[]).map(card => (
                  <div key={card.label} className="portal-card" style={{
                    background:card.grad, borderRadius:'18px', padding:'22px 20px',
                    transition:'transform 0.2s, box-shadow 0.2s',
                    cursor:'default',
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'14px' }}>
                      <p style={{ margin:0, fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.8px' }}>{card.label}</p>
                      <span style={{ fontSize:'20px', lineHeight:1 }}>{card.icon}</span>
                    </div>
                    <p style={{ margin:'0 0 6px', fontSize:'32px', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'-1px' }}>{card.value}</p>
                    <p style={{ margin:0, fontSize:'12px', color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{card.sub}</p>
                    <div style={{ marginTop:'14px', height:'2px', background:`rgba(255,255,255,0.08)`, borderRadius:'1px' }}>
                      <div style={{ height:'100%', width:'60%', background:card.accent, borderRadius:'1px', opacity:0.7 }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* ══ GRÁFICO HISTÓRICO ══ */}
              {chartData.length >= 2 && (
                <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ padding:'20px 24px 16px', display:'flex', justifyContent:'space-between', alignItems:'flex-start', borderBottom:'1px solid #F3F4F6' }}>
                    <div>
                      <p style={{ margin:'0 0 3px', fontSize:'15px', fontWeight:800, color:'#111' }}>Evolución del alcance</p>
                      <p style={{ margin:0, fontSize:'12px', color:'#9CA3AF' }}>Últimos {chartData.length} meses · datos del admin</p>
                    </div>
                    <span style={{ padding:'4px 12px', borderRadius:'20px', background:'rgba(107,33,168,0.08)', color:P, fontSize:'12px', fontWeight:700 }}>
                      📊 Histórico
                    </span>
                  </div>
                  <div style={{ padding:'20px 24px' }}>
                    {chartData.map((m, i) => {
                      const [y, mo] = m.mes.split('-')
                      const label = new Date(+y, +mo - 1, 1).toLocaleDateString('es-CO', { month: 'short', year: '2-digit' })
                      const pct   = Math.max(4, Math.round(((m.alcance ?? 0) / maxAlcChart) * 100))
                      const isLast = i === chartData.length - 1
                      return (
                        <div key={m.mes} style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom: i < chartData.length - 1 ? '12px' : '0' }}>
                          <span style={{ fontSize:'12px', color:'#9CA3AF', fontWeight:600, minWidth:'60px', textTransform:'capitalize' }}>{label}</span>
                          <div style={{ flex:1, height:'28px', background:'#F9FAFB', borderRadius:'6px', overflow:'hidden', position:'relative' }}>
                            <div style={{
                              height:'100%',
                              width:`${pct}%`,
                              background: isLast
                                ? `linear-gradient(90deg, ${P}, #9333EA)`
                                : `linear-gradient(90deg, rgba(107,33,168,0.4), rgba(147,51,234,0.6))`,
                              borderRadius:'6px',
                              transition:'width 0.6s ease',
                              display:'flex', alignItems:'center', justifyContent:'flex-end', paddingRight:'8px',
                            }}>
                              {pct > 20 && <span style={{ fontSize:'10px', fontWeight:800, color:'#fff', opacity:0.9 }}>{(m.alcance ?? 0).toLocaleString()}</span>}
                            </div>
                            {pct <= 20 && <span style={{ position:'absolute', left:`${pct}%`, top:'50%', transform:'translateY(-50%)', marginLeft:'6px', fontSize:'11px', fontWeight:700, color:'#374151' }}>{(m.alcance ?? 0).toLocaleString()}</span>}
                          </div>
                          {m.engagement ? (
                            <span style={{ fontSize:'11px', fontWeight:700, color:'#059669', minWidth:'38px', textAlign:'right' }}>{m.engagement}%</span>
                          ) : null}
                          {m.seguidores ? (
                            <span style={{ fontSize:'11px', color:'#9CA3AF', minWidth:'40px', textAlign:'right' }}>+{m.seguidores}</span>
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                  {/* Mini stats del mes más reciente */}
                  {mesActual && (
                    <div style={{ padding:'14px 24px 20px', borderTop:'1px solid #F3F4F6', display:'flex', flexWrap:'wrap', gap:'20px' }}>
                      {[
                        { v: mesActual.likes,      label:'Likes',      icon:'❤️' },
                        { v: mesActual.comentarios, label:'Comentarios', icon:'💬' },
                        { v: mesActual.guardados,   label:'Guardados',   icon:'🔖' },
                        { v: mesActual.compartidos, label:'Compartidos', icon:'↗️' },
                        { v: mesActual.seguidores,  label:'Nuevos segs.', icon:'👥' },
                        { v: mesActual.posts_publicados, label:'Posts', icon:'✅' },
                      ].filter(x => x.v != null && (x.v as number) > 0).map(x => (
                        <div key={x.label} style={{ textAlign:'center' }}>
                          <p style={{ margin:'0 0 2px', fontSize:'16px', fontWeight:900, color:'#111' }}>{(x.v as number).toLocaleString()}</p>
                          <p style={{ margin:0, fontSize:'11px', color:'#9CA3AF' }}>{x.icon} {x.label}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══ MÉTRICAS ACUMULADAS (parrilla) si no hay histAdmin ══ */}
              {histAdmin.length < 2 && conMet.length > 0 && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:'12px' }}>
                  {[
                    { label:'Alcance total', v:alcanceTotal.toLocaleString(), icon:'👁️', c:'#6B21A8' },
                    { label:'Likes', v:likesTotal.toLocaleString(), icon:'❤️', c:'#EF4444' },
                    { label:'Guardados', v:guardadosTotal.toLocaleString(), icon:'🔖', c:'#D97706' },
                    { label:'Engagement', v:`${avgEng.toFixed(1)}%`, icon:'📈', c:'#059669' },
                  ].map(m => (
                    <div key={m.label} style={{ background:'#fff', borderRadius:'14px', padding:'16px', border:'1px solid #E5E7EB', textAlign:'center' }}>
                      <p style={{ fontSize:'22px', margin:'0 0 4px' }}>{m.icon}</p>
                      <p style={{ fontSize:'20px', fontWeight:900, color:m.c, margin:'0 0 3px' }}>{m.v}</p>
                      <p style={{ fontSize:'11px', color:'#9CA3AF', margin:0, fontWeight:600 }}>{m.label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ══ TOP POSTS ══ */}
              {topPosts.length > 0 && (
                <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #F3F4F6' }}>
                    <p style={{ margin:0, fontSize:'15px', fontWeight:800, color:'#111' }}>🏆 Mejores posts</p>
                    <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#9CA3AF' }}>Por alcance acumulado</p>
                  </div>
                  {topPosts.map((p, i) => {
                    const maxAlc = topPosts[0].metricas?.alcance ?? 1
                    const pct    = Math.max(8, Math.round(((p.metricas?.alcance ?? 0) / maxAlc) * 100))
                    const pilarI = PILARES_CONTENIDO.find(x => x.value === p.pilar)
                    const medals = ['🥇','🥈','🥉']
                    return (
                      <div key={p.id} style={{ padding:'14px 22px', borderBottom: i < topPosts.length - 1 ? '1px solid #F9FAFB' : 'none' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px', flexWrap:'wrap' }}>
                          <span style={{ fontSize:'18px' }}>{medals[i]}</span>
                          <p style={{ flex:1, margin:0, fontSize:'13px', fontWeight:700, color:'#111' }}>{p.descripcion}</p>
                          {pilarI && <span style={{ padding:'2px 8px', borderRadius:'6px', background:pilarI.bg, color:pilarI.color, fontSize:'11px', fontWeight:700 }}>{pilarI.label}</span>}
                          <span style={{ fontSize:'13px', fontWeight:800, color:P }}>{(p.metricas?.alcance ?? 0).toLocaleString()}</span>
                        </div>
                        <div style={{ height:'6px', background:'#F3F4F6', borderRadius:'3px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:`linear-gradient(90deg, ${P}, #9333EA)`, borderRadius:'3px', transition:'width 0.6s ease' }} />
                        </div>
                        <div style={{ display:'flex', gap:'14px', marginTop:'7px' }}>
                          {p.metricas?.likes       ? <span style={{ fontSize:'11px', color:'#9CA3AF' }}>❤️ {p.metricas.likes.toLocaleString()}</span> : null}
                          {p.metricas?.guardados   ? <span style={{ fontSize:'11px', color:'#9CA3AF' }}>🔖 {p.metricas.guardados.toLocaleString()}</span> : null}
                          {p.metricas?.comentarios ? <span style={{ fontSize:'11px', color:'#9CA3AF' }}>💬 {p.metricas.comentarios.toLocaleString()}</span> : null}
                          {p.metricas?.engagement  ? <span style={{ fontSize:'11px', color:'#059669', fontWeight:700 }}>📈 {p.metricas.engagement}%</span> : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ══ INFO PROYECTO + CTA ══ */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'14px' }}>
                {/* Inicio del proyecto */}
                {data.fecha_inicio && (
                  <div style={{ background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #E5E7EB', display:'flex', gap:'14px', alignItems:'center' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(107,33,168,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>📆</div>
                    <div>
                      <p style={{ fontSize:'11px', fontWeight:700, color:'#9CA3AF', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Inicio del proyecto</p>
                      <p style={{ fontSize:'15px', fontWeight:800, color:'#111', margin:0 }}>{data.fecha_inicio}</p>
                    </div>
                  </div>
                )}
                {/* Plan contratado */}
                {(data.plan_mes?.nombre || data.valor_contrato) && (
                  <div style={{ background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #E5E7EB', display:'flex', gap:'14px', alignItems:'center' }}>
                    <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(107,33,168,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>📦</div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:'11px', fontWeight:700, color:'#9CA3AF', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Plan contratado</p>
                      {data.plan_mes?.nombre && (
                        <p style={{ fontSize:'15px', fontWeight:800, color:'#111', margin:'0 0 1px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{data.plan_mes.nombre}</p>
                      )}
                      {data.valor_contrato && (
                        <p style={{ fontSize:'13px', fontWeight:700, color:P, margin:0 }}>{data.valor_contrato}{data.moneda ? ` ${data.moneda}` : ''}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Contrato */}
                {data.contrato_url && (
                  <div style={{ background:'#fff', borderRadius:'16px', padding:'20px', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
                    <div style={{ display:'flex', gap:'14px', alignItems:'center' }}>
                      <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(5,150,105,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'22px', flexShrink:0 }}>📑</div>
                      <div>
                        <p style={{ fontSize:'11px', fontWeight:700, color:'#9CA3AF', margin:'0 0 3px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Contrato</p>
                        <p style={{ fontSize:'13px', color:'#6B7280', margin:0 }}>Disponible para descargar</p>
                      </div>
                    </div>
                    <a href={data.contrato_url} target="_blank" rel="noopener noreferrer" style={{ padding:'8px 16px', borderRadius:'10px', background:'#059669', color:'#fff', textDecoration:'none', fontWeight:700, fontSize:'12.5px', flexShrink:0 }}>
                      Descargar →
                    </a>
                  </div>
                )}
              </div>

              {/* CTA Solicitud */}
              <div style={{
                background:'linear-gradient(135deg, #1E0547, #3B0C87)',
                borderRadius:'20px', padding:'24px 26px',
                display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px',
                position:'relative', overflow:'hidden',
              }}>
                <div style={{ position:'absolute', right:'-20px', top:'-20px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
                <div style={{ position:'relative', zIndex:1 }}>
                  <p style={{ fontSize:'16px', fontWeight:900, color:'#fff', margin:'0 0 5px' }}>¿Tienes una solicitud?</p>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.6)', margin:0 }}>Pide cambios, mejoras o consulta sobre tus materiales.</p>
                </div>
                <button
                  onClick={() => setShowSolForm(true)}
                  className="portal-action-btn"
                  style={{
                    padding:'12px 24px', borderRadius:'12px',
                    background:'rgba(255,255,255,0.95)', color:P,
                    border:'none', cursor:'pointer', fontWeight:800, fontSize:'14px',
                    transition:'opacity 0.2s, transform 0.15s', flexShrink:0, position:'relative', zIndex:1,
                  }}
                >
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
          const parrillaMeses = [...(data.parrilla_meses ?? [])].sort((a, b) => a.mes.localeCompare(b.mes))
          const htmlsLegacy   = [...(data.parrilla_htmls  ?? [])].sort((a, b) => b.mes.localeCompare(a.mes))

          // ── Fullscreen HTML (tablero Trello — clic en card estrategia) ──
          if (activeParrillaMesId) {
            const mes = parrillaMeses.find(m => m.id === activeParrillaMesId)
            if (mes?.html_contenido) {
              const injected = data.logo_url
                ? injectLogo(mes.html_contenido, data.logo_url, data.marca ?? '')
                : mes.html_contenido
              return (
                <div style={{ width:'100vw', marginLeft:'calc(50% - 50vw - 20px)', marginTop:'-28px' }}>
                  {/* Barra de retorno */}
                  <div style={{ background:'rgba(0,0,0,0.25)', backdropFilter:'blur(8px)', padding:'9px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                    <button
                      onClick={() => setActiveParrillaMesId(null)}
                      style={{ padding:'6px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.22)', background:'rgba(255,255,255,0.08)', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'12px', transition:'all 0.15s' }}
                    >
                      ← Tablero
                    </button>
                    <span style={{ fontSize:'13px', fontWeight:700, color:'rgba(255,255,255,0.8)' }}>
                      {mes.html_titulo ?? mes.label}
                    </span>
                  </div>
                  <iframe
                    key={mes.id}
                    srcDoc={injected}
                    style={{ width:'100%', height:'calc(100vh - 96px)', minHeight:'700px', border:'none', display:'block' }}
                    title={mes.label}
                    sandbox="allow-scripts"
                  />
                </div>
              )
            }
            // No tiene HTML, volver al tablero silenciosamente
            return (
              <div style={{ textAlign:'center', padding:'60px 20px' }}>
                <p style={{ fontSize:'40px', margin:'0 0 12px' }}>📋</p>
                <p style={{ color:'#6B7280', fontSize:'14px', marginBottom:'16px' }}>No hay HTML de estrategia para este mes.</p>
                <button onClick={() => setActiveParrillaMesId(null)} style={{ padding:'9px 20px', borderRadius:'10px', background:P, color:'#fff', border:'none', cursor:'pointer', fontWeight:700, fontSize:'13px' }}>
                  ← Volver al tablero
                </button>
              </div>
            )
          }

          // ── Vista HTML legacy (parrilla_htmls) si no hay tablero nuevo ──
          if (parrillaMeses.length === 0 && htmlsLegacy.length > 0) {
            const current = htmlsLegacy.find(h => h.id === activeHtmlId) ?? htmlsLegacy[0]
            const injected = data.logo_url
              ? injectLogo(current.contenido, data.logo_url, data.marca ?? '')
              : current.contenido
            return (
              <div style={{ width:'100vw', marginLeft:'calc(50% - 50vw - 20px)', marginTop:'-28px', animation:'fadeUp 0.35s ease' }}>
                {htmlsLegacy.length > 1 && (
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', padding:'16px 20px 12px' }}>
                    {htmlsLegacy.map(h => (
                      <button key={h.id} onClick={() => setActiveHtmlId(h.id)}
                        style={{ padding:'7px 18px', borderRadius:'20px', cursor:'pointer', border:`1.5px solid ${current.id === h.id ? P : '#E5E7EB'}`, background: current.id === h.id ? P : '#fff', color: current.id === h.id ? '#fff' : '#6B7280', fontSize:'12.5px', fontWeight:700, transition:'all 0.15s' }}>
                        {h.label}
                      </button>
                    ))}
                  </div>
                )}
                <iframe key={current.id} srcDoc={injected} style={{ width:'100%', height:'calc(100vh - 96px)', minHeight:'700px', border:'none', display:'block' }} title={current.label} sandbox="allow-scripts" />
              </div>
            )
          }

          // ── Tablero Trello (siempre visible — placeholders si no hay meses) ──
          if (parrillaMeses.length > 0 || htmlsLegacy.length === 0) {
            const boardIsPlaceholder = parrillaMeses.length === 0
            const now = new Date()
            const placeholderCols: typeof parrillaMeses = boardIsPlaceholder
              ? Array.from({ length: 3 }, (_, i) => {
                  const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
                  const mesStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                  const label  = d.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
                  return { id: `ph-${mesStr}`, mes: mesStr, label: label.charAt(0).toUpperCase() + label.slice(1) }
                })
              : []
            const columnas = boardIsPlaceholder ? placeholderCols : parrillaMeses

            return (
              <div style={{
                width:'100vw', marginLeft:'calc(50% - 50vw - 20px)', marginTop:'-28px',
                background:'linear-gradient(160deg, #0E0322 0%, #1A0640 55%, #2D0C72 100%)',
                minHeight:'calc(100vh - 96px)',
                padding:'20px 24px 32px',
                animation:'fadeUp 0.35s ease',
              }}>
                {/* Título del tablero */}
                <div style={{ marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px' }}>
                  <p style={{ margin:0, fontSize:'12px', fontWeight:800, color:'rgba(255,255,255,0.35)', textTransform:'uppercase', letterSpacing:'1.5px' }}>
                    Tablero de contenido
                  </p>
                  <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }} />
                  {parrillaMeses.length === 0 && (
                    <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,193,7,0.7)', background:'rgba(255,193,7,0.1)', border:'1px solid rgba(255,193,7,0.2)', borderRadius:'20px', padding:'3px 10px', whiteSpace:'nowrap' }}>
                      ✦ En preparación
                    </span>
                  )}
                </div>

                {/* Columnas */}
                <div style={{ display:'flex', gap:'16px', overflowX:'auto', alignItems:'flex-start', paddingBottom:'16px' }}>
                  {columnas.map(mes => {
                    const isPlaceholder = boardIsPlaceholder
                    const hasHtml   = !!mes.html_contenido
                    const hasDrive  = !!(mes.drive_links?.post || mes.drive_links?.carrusel || mes.drive_links?.reels)
                    const hasExtras = (mes.extras ?? []).length > 0
                    const [y, mo]   = mes.mes.split('-')
                    const mesNombre = new Date(+y, +mo - 1, 1).toLocaleDateString('es-CO', { month:'long', year:'numeric' })

                    return (
                      <div key={mes.id} style={{ minWidth:'272px', maxWidth:'272px', display:'flex', flexDirection:'column', gap:'10px', flexShrink:0 }}>
                        {/* Cabecera de columna */}
                        <div style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(10px)', borderRadius:'10px', padding:'12px 14px', border:'1px solid rgba(255,255,255,0.1)' }}>
                          <p style={{ margin:0, fontSize:'14px', fontWeight:900, color:'#fff', letterSpacing:'-0.2px' }}>{mes.label}</p>
                          <p style={{ margin:'2px 0 0', fontSize:'11px', color:'rgba(255,255,255,0.4)', textTransform:'capitalize' }}>{mesNombre}</p>
                        </div>

                        {/* Card 1: Estrategia HTML */}
                        {hasHtml && (
                          <div
                            onClick={() => setActiveParrillaMesId(mes.id)}
                            className="portal-card"
                            style={{ background:'#fff', borderRadius:'10px', padding:'14px 14px 12px', border:'1px solid #E5E7EB', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', transition:'transform 0.15s, box-shadow 0.15s' }}
                          >
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                              <div style={{ width:'26px', height:'26px', borderRadius:'6px', background:PL, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'13px' }}>📋</div>
                              <p style={{ margin:0, fontSize:'10px', fontWeight:800, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Estrategia del mes</p>
                            </div>
                            {mes.html_titulo && (
                              <p style={{ margin:'0 0 8px', fontSize:'13.5px', color:'#111', fontWeight:700, lineHeight:1.3 }}>{mes.html_titulo}</p>
                            )}
                            <span style={{ fontSize:'12px', color:P, fontWeight:700 }}>Ver estrategia completa →</span>
                          </div>
                        )}

                        {/* Card 2: Accesos Drive */}
                        {hasDrive && (
                          <div style={{ background:'#fff', borderRadius:'10px', padding:'14px', border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                              <div style={{ width:'26px', height:'26px', borderRadius:'6px', background:'rgba(5,150,105,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'13px' }}>🗂️</div>
                              <p style={{ margin:0, fontSize:'10px', fontWeight:800, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Accesos Drive</p>
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                              {mes.drive_links?.post && (
                                <a href={mes.drive_links.post} target="_blank" rel="noopener noreferrer"
                                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px', borderRadius:'8px', background:'#F0FDF4', border:'1px solid #BBF7D0', textDecoration:'none' }}
                                  onClick={e => e.stopPropagation()}>
                                  <span style={{ fontSize:'15px' }}>📄</span>
                                  <span style={{ fontSize:'13px', fontWeight:700, color:'#065F46', flex:1 }}>POST</span>
                                  <span style={{ fontSize:'11px', color:'#6EE7B7' }}>↗</span>
                                </a>
                              )}
                              {mes.drive_links?.carrusel && (
                                <a href={mes.drive_links.carrusel} target="_blank" rel="noopener noreferrer"
                                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px', borderRadius:'8px', background:'#EFF6FF', border:'1px solid #BFDBFE', textDecoration:'none' }}
                                  onClick={e => e.stopPropagation()}>
                                  <span style={{ fontSize:'15px' }}>🎠</span>
                                  <span style={{ fontSize:'13px', fontWeight:700, color:'#1E40AF', flex:1 }}>CARRUSEL</span>
                                  <span style={{ fontSize:'11px', color:'#93C5FD' }}>↗</span>
                                </a>
                              )}
                              {mes.drive_links?.reels && (
                                <a href={mes.drive_links.reels} target="_blank" rel="noopener noreferrer"
                                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px', borderRadius:'8px', background:'#FDF4FF', border:'1px solid #E9D5FF', textDecoration:'none' }}
                                  onClick={e => e.stopPropagation()}>
                                  <span style={{ fontSize:'15px' }}>🎬</span>
                                  <span style={{ fontSize:'13px', fontWeight:700, color:'#7E22CE', flex:1 }}>REELS</span>
                                  <span style={{ fontSize:'11px', color:'#D8B4FE' }}>↗</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Card 3: Extras */}
                        {hasExtras && (
                          <div style={{ background:'#fff', borderRadius:'10px', padding:'14px', border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.08)' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px' }}>
                              <div style={{ width:'26px', height:'26px', borderRadius:'6px', background:'rgba(217,119,6,0.08)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'13px' }}>📦</div>
                              <p style={{ margin:0, fontSize:'10px', fontWeight:800, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Extras / Otros</p>
                            </div>
                            <div style={{ display:'flex', flexDirection:'column', gap:'7px' }}>
                              {(mes.extras ?? []).map(ex => (
                                <div key={ex.id} style={{ padding:'9px 12px', borderRadius:'8px', background:'#FAFAFA', border:'1px solid #F3F4F6' }}>
                                  {ex.url ? (
                                    <a href={ex.url} target="_blank" rel="noopener noreferrer"
                                      style={{ display:'flex', alignItems:'center', gap:'6px', textDecoration:'none' }}
                                      onClick={e => e.stopPropagation()}>
                                      <span style={{ fontSize:'13px', fontWeight:700, color:P, flex:1 }}>{ex.label}</span>
                                      <span style={{ fontSize:'11px', color:P }}>↗</span>
                                    </a>
                                  ) : (
                                    <p style={{ margin:0, fontSize:'13px', fontWeight:700, color:'#374151' }}>{ex.label}</p>
                                  )}
                                  {ex.nota && <p style={{ margin:'3px 0 0', fontSize:'11.5px', color:'#9CA3AF', lineHeight:1.4 }}>{ex.nota}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Empty column */}
                        {!hasHtml && !hasDrive && !hasExtras && (
                          isPlaceholder ? (
                            <div style={{ padding:'24px 14px', borderRadius:'10px', border:'1px dashed rgba(255,255,255,0.15)', textAlign:'center', display:'flex', flexDirection:'column', gap:'8px', alignItems:'center' }}>
                              <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>📝</div>
                              <p style={{ fontSize:'11.5px', color:'rgba(255,255,255,0.25)', margin:0, lineHeight:1.5 }}>Tu estrategia de<br/>contenido estará aquí</p>
                            </div>
                          ) : (
                            <div style={{ padding:'20px 14px', background:'rgba(255,255,255,0.04)', borderRadius:'10px', border:'1px dashed rgba(255,255,255,0.12)', textAlign:'center' }}>
                              <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', margin:0 }}>Sin contenido aún</p>
                            </div>
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }

          // ── Vista tabla (parrilla clásica — fallback) ──
          const allItems = [...(data.parrilla ?? [])].sort((a, b) => {
            if (a.dia_num && b.dia_num) return a.dia_num - b.dia_num
            return (a.fecha ?? '').localeCompare(b.fecha ?? '')
          })

          const mesesFiltro = [...new Set(allItems.map(p => p.fecha?.slice(0, 7)).filter(Boolean))].sort()
          const currentMes  = activeMes === 'all' ? null : activeMes
          const items       = currentMes ? allItems.filter(p => p.fecha?.startsWith(currentMes)) : allItems
          const semanas     = [...new Set(items.map(p => p.semana ?? 0))]

          function copyCaption(p: ParrillaItem) {
            const text = [p.caption, p.hashtags].filter(Boolean).join('\n\n')
            if (text) {
              navigator.clipboard.writeText(text)
              setCopiedId(p.id)
              setTimeout(() => setCopiedId(null), 2000)
            }
          }

          if (allItems.length === 0) return (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <p style={{ fontSize:'40px', margin:'0 0 12px' }}>📅</p>
              <p style={{ color:'#6B7280', fontSize:'15px' }}>La parrilla de contenido estará disponible aquí.<br />El equipo de Alma la completará pronto.</p>
            </div>
          )

          return (
            <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
              <div style={{ marginBottom:'24px' }}>
                <p style={{ margin:'0 0 4px', fontSize:'11px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px' }}>Plan editorial · {allItems.length} días</p>
                <h2 style={{ margin:'0 0 2px', fontSize:'28px', fontWeight:900, color:'#111', lineHeight:1.15 }}>El Calendario <em style={{ color:'#D97706', fontStyle:'italic', fontWeight:800 }}>Exacto</em></h2>
                <h2 style={{ margin:0, fontSize:'28px', fontWeight:900, color:'#111', lineHeight:1.15 }}>Día por Día</h2>
              </div>

              {mesesFiltro.length > 1 && (
                <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'20px' }}>
                  <button onClick={() => setActiveMes('all')} style={{ padding:'6px 14px', borderRadius:'20px', border:`1.5px solid ${activeMes === 'all' ? P : '#E5E7EB'}`, background: activeMes === 'all' ? P : '#fff', color: activeMes === 'all' ? '#fff' : '#6B7280', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>Todos</button>
                  {mesesFiltro.map(mes => {
                    const [y, m] = mes.split('-')
                    const label = new Date(+y, +m - 1, 1).toLocaleDateString('es-CO', { month:'short', year:'numeric' })
                    return (
                      <button key={mes} onClick={() => setActiveMes(mes)} style={{ padding:'6px 14px', borderRadius:'20px', border:`1.5px solid ${activeMes === mes ? P : '#E5E7EB'}`, background: activeMes === mes ? P : '#fff', color: activeMes === mes ? '#fff' : '#6B7280', fontSize:'12px', fontWeight:700, cursor:'pointer', textTransform:'capitalize' }}>{label}</button>
                    )
                  })}
                </div>
              )}

              <div style={{ background:'#111', borderRadius:'12px 12px 0 0', padding:'10px 16px', display:'grid', gridTemplateColumns:'52px 1fr 120px 160px', gap:'0', alignItems:'center' }}>
                {['DÍA', 'CONTENIDO', 'PILAR', 'CTA / KEYWORD'].map(h => (
                  <span key={h} style={{ fontSize:'10px', fontWeight:800, color:'rgba(255,255,255,0.55)', letterSpacing:'1px', textTransform:'uppercase' }}>{h}</span>
                ))}
              </div>

              <div style={{ border:'1px solid #E5E7EB', borderTop:'none', borderRadius:'0 0 16px 16px', overflow:'hidden' }}>
                {semanas.map((sem, si) => {
                  const semItems = sem === 0 ? items.filter(p => !p.semana) : items.filter(p => p.semana === sem)
                  if (semItems.length === 0) return null
                  const diasRange = semItems.filter(p => p.dia_num).map(p => p.dia_num!)
                  const dMin = diasRange.length ? Math.min(...diasRange) : null
                  const dMax = diasRange.length ? Math.max(...diasRange) : null
                  return (
                    <div key={`sem-${sem}-${si}`}>
                      {sem > 0 && (
                        <div style={{ background:'#111', padding:'12px 16px', display:'flex', alignItems:'baseline', gap:'10px' }}>
                          <span style={{ background:'#fff', color:'#111', borderRadius:'4px', padding:'1px 7px', fontSize:'11px', fontWeight:900 }}>S{sem}</span>
                          <span style={{ fontSize:'13px', fontWeight:800, color:'#fff' }}>SEMANA {sem}</span>
                          {dMin && dMax && <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', marginLeft:'4px' }}>· DÍAS {dMin}–{dMax}</span>}
                        </div>
                      )}
                      {semItems.map((p, idx) => {
                        const isExpanded = expandedId === p.id
                        const pilarI = PILARES_CONTENIDO.find(x => x.value === p.pilar)
                        const est    = PARRILLA_ESTADOS.find(x => x.value === p.estado)
                        const instrLines = (p.instrucciones ?? '').split('\n').filter(Boolean)
                        const hasCopy = !!(p.caption || p.hashtags)
                        return (
                          <div key={p.id} style={{ borderBottom:'1px solid #F3F4F6' }}>
                            <div onClick={() => setExpandedId(isExpanded ? null : p.id)}
                              style={{ display:'grid', gridTemplateColumns:'52px 1fr 120px 160px', gap:'0', alignItems:'center', padding:'14px 16px', background: isExpanded ? '#F9FAFB' : idx % 2 === 0 ? '#fff' : '#FAFAFA', cursor:'pointer', transition:'background 0.1s' }}>
                              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:'4px' }}>
                                <span style={{ fontSize:'18px', fontWeight:900, color:'#111', lineHeight:1 }}>{p.dia_num ? String(p.dia_num).padStart(2,'0') : '—'}</span>
                                {est && <span style={{ padding:'1px 5px', borderRadius:'4px', background:est.bg, color:est.color, fontSize:'9px', fontWeight:700, whiteSpace:'nowrap' }}>{est.label}</span>}
                              </div>
                              <div style={{ paddingRight:'12px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom:'4px', flexWrap:'wrap' }}>
                                  <span style={{ padding:'2px 7px', borderRadius:'4px', background:'#111', color:'#fff', fontSize:'10px', fontWeight:800, letterSpacing:'0.3px', whiteSpace:'nowrap' }}>{p.tipo.toUpperCase()}{p.duracion ? ` · ${p.duracion.toUpperCase()}` : ''}</span>
                                  <span style={{ fontSize:'10px', color:'#9CA3AF' }}>{p.red}</span>
                                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize:'10px', color:P, fontWeight:700, textDecoration:'none' }}>🔗 Ver post</a>}
                                </div>
                                <p style={{ margin:'0 0 2px', fontSize:'14px', fontWeight:800, color:'#111', lineHeight:1.3 }}>{p.descripcion}</p>
                                {p.subtitulo && <p style={{ margin:0, fontSize:'12px', color:'#9CA3AF' }}>{p.subtitulo}</p>}
                              </div>
                              <div>{pilarI ? <span style={{ padding:'3px 9px', borderRadius:'6px', background:pilarI.bg, color:pilarI.color, fontSize:'11px', fontWeight:800, whiteSpace:'nowrap' }}>{pilarI.label.toUpperCase()}</span> : <span style={{ fontSize:'11px', color:'#E5E7EB' }}>—</span>}</div>
                              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                {p.cta ? <span style={{ padding:'5px 12px', borderRadius:'8px', background:'#D97706', color:'#fff', fontSize:'11.5px', fontWeight:800, whiteSpace:'nowrap' }}>{p.cta} ▶</span> : <span style={{ fontSize:'11px', color:'#E5E7EB' }}>—</span>}
                                <span style={{ marginLeft:'auto', fontSize:'14px', color:'#9CA3AF', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s' }}>▾</span>
                              </div>
                            </div>
                            {isExpanded && (
                              <div style={{ background:'#FAFAFA', borderTop:'1px solid #F0F0F0', borderBottom:'1px solid #E5E7EB' }}>
                                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0' }}>
                                  <div style={{ padding:'20px', borderRight:'1px solid #E5E7EB' }}>
                                    <p style={{ margin:'0 0 12px', fontSize:'10px', fontWeight:900, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px' }}>Concepto visual</p>
                                    {p.concepto_visual ? <p style={{ margin:0, fontSize:'13px', color:'#374151', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{p.concepto_visual}</p> : <p style={{ margin:0, fontSize:'12px', color:'#D1D5DB' }}>Sin concepto visual aún.</p>}
                                  </div>
                                  <div style={{ padding:'20px', borderRight:'1px solid #E5E7EB' }}>
                                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                                      <p style={{ margin:0, fontSize:'10px', fontWeight:900, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px' }}>Caption completo</p>
                                      {hasCopy && <button onClick={e => { e.stopPropagation(); copyCaption(p) }} style={{ padding:'4px 10px', borderRadius:'6px', border:'1px solid #E5E7EB', background: copiedId === p.id ? '#059669' : '#fff', color: copiedId === p.id ? '#fff' : '#374151', fontSize:'11px', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}>{copiedId === p.id ? '✓ Copiado' : '📋 Copiar'}</button>}
                                    </div>
                                    {p.caption ? (
                                      <div style={{ background:'#111', borderRadius:'10px', padding:'14px 16px' }}>
                                        <p style={{ margin:'0 0 10px', fontSize:'13px', color:'#E5E7EB', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{p.caption}</p>
                                        {p.hashtags && <p style={{ margin:0, fontSize:'12px', color:'#6B7280', lineHeight:1.6 }}>{p.hashtags}</p>}
                                      </div>
                                    ) : <p style={{ margin:0, fontSize:'12px', color:'#D1D5DB' }}>Caption pendiente.</p>}
                                  </div>
                                  <div style={{ padding:'20px' }}>
                                    <p style={{ margin:'0 0 12px', fontSize:'10px', fontWeight:900, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px' }}>Instrucciones de publicación</p>
                                    {instrLines.length > 0 ? (
                                      <ul style={{ margin:'0 0 12px', paddingLeft:'16px', display:'flex', flexDirection:'column', gap:'6px' }}>
                                        {instrLines.map((line, i) => <li key={i} style={{ fontSize:'12.5px', color:'#374151', lineHeight:1.5 }}>{line}</li>)}
                                      </ul>
                                    ) : <p style={{ margin:'0 0 12px', fontSize:'12px', color:'#D1D5DB' }}>Sin instrucciones aún.</p>}
                                    {p.story_del_dia && (
                                      <div style={{ background:'#FEF9C3', borderRadius:'8px', padding:'10px 12px', marginTop:'8px' }}>
                                        <p style={{ margin:'0 0 4px', fontSize:'10px', fontWeight:800, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.5px' }}>📱 Story del día</p>
                                        <p style={{ margin:0, fontSize:'12px', color:'#78350F', lineHeight:1.5 }}>{p.story_del_dia}</p>
                                      </div>
                                    )}
                                    {p.estado === 'publicado' && p.metricas && Object.values(p.metricas).some(v => v != null && v > 0) && (
                                      <div style={{ background:'rgba(107,33,168,0.06)', borderRadius:'8px', padding:'10px 12px', marginTop:'10px' }}>
                                        <p style={{ margin:'0 0 6px', fontSize:'10px', fontWeight:800, color:P, textTransform:'uppercase', letterSpacing:'0.5px' }}>📊 Métricas</p>
                                        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                                          {p.metricas.alcance     ? <span style={{ fontSize:'12px' }}>👁️ {p.metricas.alcance.toLocaleString()}</span>     : null}
                                          {p.metricas.likes       ? <span style={{ fontSize:'12px' }}>❤️ {p.metricas.likes.toLocaleString()}</span>       : null}
                                          {p.metricas.comentarios ? <span style={{ fontSize:'12px' }}>💬 {p.metricas.comentarios.toLocaleString()}</span>  : null}
                                          {p.metricas.guardados   ? <span style={{ fontSize:'12px' }}>🔖 {p.metricas.guardados.toLocaleString()}</span>    : null}
                                          {p.metricas.engagement  ? <span style={{ fontSize:'12px', color:'#059669', fontWeight:700 }}>📈 {p.metricas.engagement}%</span> : null}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                            {p.story_del_dia && !isExpanded && (
                              <div style={{ background:'#FFFBEB', borderTop:'1px dashed #FDE68A', padding:'9px 16px 9px 68px', display:'flex', gap:'8px', alignItems:'center' }}>
                                <span style={{ fontSize:'11px', fontWeight:800, color:'#92400E', textTransform:'uppercase', letterSpacing:'0.5px', flexShrink:0 }}>📱 Story del día {p.dia_num ?? ''}:</span>
                                <span style={{ fontSize:'12px', color:'#78350F', fontStyle:'italic' }}>{p.story_del_dia}</span>
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

        {/* ── ACCESOS ── */}
        {tab === 'accesos' && (() => {
          const accesos = data.accesos ?? []

          // Mapa de plataformas → color + emoji
          const PLAT: Record<string, { color: string; bg: string; icon: string }> = {
            instagram:  { color: '#E1306C', bg: 'rgba(225,48,108,0.1)',  icon: '📸' },
            facebook:   { color: '#1877F2', bg: 'rgba(24,119,242,0.1)',  icon: '👥' },
            tiktok:     { color: '#010101', bg: 'rgba(0,0,0,0.08)',      icon: '🎵' },
            youtube:    { color: '#FF0000', bg: 'rgba(255,0,0,0.1)',     icon: '▶️' },
            twitter:    { color: '#1DA1F2', bg: 'rgba(29,161,242,0.1)',  icon: '🐦' },
            x:          { color: '#000',    bg: 'rgba(0,0,0,0.08)',      icon: '✖️' },
            linkedin:   { color: '#0A66C2', bg: 'rgba(10,102,194,0.1)', icon: '💼' },
            google:     { color: '#4285F4', bg: 'rgba(66,133,244,0.1)', icon: '🔍' },
            gmail:      { color: '#EA4335', bg: 'rgba(234,67,53,0.1)',  icon: '📧' },
            canva:      { color: '#00C4CC', bg: 'rgba(0,196,204,0.1)',  icon: '🎨' },
            wordpress:  { color: '#21759B', bg: 'rgba(33,117,155,0.1)', icon: '🌐' },
            shopify:    { color: '#96BF48', bg: 'rgba(150,191,72,0.1)', icon: '🛒' },
            mailchimp:  { color: '#FFE01B', bg: 'rgba(255,224,27,0.12)',icon: '📨' },
            whatsapp:   { color: '#25D366', bg: 'rgba(37,211,102,0.1)', icon: '💬' },
            pinterest:  { color: '#E60023', bg: 'rgba(230,0,35,0.1)',   icon: '📌' },
          }
          function getPlatStyle(nombre: string) {
            const key = nombre.toLowerCase().replace(/\s/g, '')
            return PLAT[key] ?? { color: P, bg: 'rgba(107,33,168,0.1)', icon: '🔑' }
          }

          if (accesos.length === 0) return (
            <div style={{ textAlign:'center', padding:'60px 20px' }}>
              <p style={{ fontSize:'40px', margin:'0 0 12px' }}>🔐</p>
              <p style={{ color:'#6B7280', fontSize:'15px' }}>No hay accesos configurados aún.</p>
            </div>
          )

          return (
            <div>
              <div style={{ marginBottom:'24px' }}>
                <p style={{ margin:'0 0 4px', fontSize:'11px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px' }}>Credenciales seguras</p>
                <h2 style={{ margin:0, fontSize:'24px', fontWeight:900, color:'#111', letterSpacing:'-0.5px' }}>Tus accesos 🔐</h2>
                <p style={{ margin:'6px 0 0', fontSize:'13px', color:'#6B7280' }}>Usa el botón 👁 para revelar la contraseña. Mantén esta información confidencial.</p>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'14px' }}>
                {accesos.map(acc => {
                  const plat   = getPlatStyle(acc.plataforma)
                  const visible = visiblePasswords.has(acc.id)
                  const togglePwd = () => setVisiblePasswords(prev => {
                    const next = new Set(prev)
                    if (next.has(acc.id)) next.delete(acc.id)
                    else next.add(acc.id)
                    return next
                  })

                  return (
                    <div key={acc.id} style={{ background:'#fff', borderRadius:'16px', border:`1px solid #E5E7EB`, boxShadow:'0 2px 10px rgba(0,0,0,0.06)', overflow:'hidden' }}>
                      {/* Header plataforma */}
                      <div style={{ padding:'14px 16px', background: plat.bg, borderBottom:'1px solid rgba(0,0,0,0.05)', display:'flex', alignItems:'center', gap:'10px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.1)' }}>
                          {plat.icon}
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:'14px', fontWeight:800, color: plat.color, lineHeight:1.2 }}>{acc.plataforma}</p>
                          {acc.url && (
                            <a href={acc.url} target="_blank" rel="noopener noreferrer" style={{ fontSize:'11px', color:'#6B7280', textDecoration:'none', display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {acc.url.replace(/^https?:\/\//, '')} ↗
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:'10px' }}>
                        {/* Usuario */}
                        <div>
                          <p style={{ margin:'0 0 3px', fontSize:'10px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Usuario / Email</p>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#F9FAFB', borderRadius:'8px', padding:'8px 12px' }}>
                            <span style={{ fontSize:'13px', fontWeight:600, color:'#374151', flex:1, wordBreak:'break-all' }}>{acc.usuario}</span>
                            <button
                              onClick={() => navigator.clipboard.writeText(acc.usuario)}
                              title="Copiar usuario"
                              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'13px', opacity:0.5, flexShrink:0, padding:'0 2px', lineHeight:1 }}
                            >📋</button>
                          </div>
                        </div>

                        {/* Contraseña */}
                        <div>
                          <p style={{ margin:'0 0 3px', fontSize:'10px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Contraseña</p>
                          <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#F9FAFB', borderRadius:'8px', padding:'8px 12px', border: visible ? `1px solid ${plat.color}40` : '1px solid transparent' }}>
                            <span style={{ fontSize: visible ? '13px' : '16px', fontWeight:600, color: visible ? '#374151' : '#9CA3AF', flex:1, letterSpacing: visible ? 'normal' : '3px', wordBreak:'break-all', lineHeight:1.4 }}>
                              {visible ? acc.password : '••••••••••'}
                            </span>
                            {visible && (
                              <button
                                onClick={() => navigator.clipboard.writeText(acc.password)}
                                title="Copiar contraseña"
                                style={{ background:'none', border:'none', cursor:'pointer', fontSize:'13px', opacity:0.5, flexShrink:0, padding:'0 2px', lineHeight:1 }}
                              >📋</button>
                            )}
                            <button
                              onClick={togglePwd}
                              title={visible ? 'Ocultar' : 'Mostrar contraseña'}
                              style={{ background: visible ? plat.bg : '#F0F0F0', border:'none', cursor:'pointer', fontSize:'14px', borderRadius:'6px', padding:'4px 7px', flexShrink:0, lineHeight:1, transition:'all 0.15s' }}
                            >
                              {visible ? '🙈' : '👁'}
                            </button>
                          </div>
                        </div>

                        {/* Notas */}
                        {acc.notas && (
                          <p style={{ margin:0, fontSize:'12px', color:'#6B7280', background:'#FFFBEB', borderRadius:'7px', padding:'7px 10px', border:'1px solid #FDE68A', lineHeight:1.5 }}>
                            💡 {acc.notas}
                          </p>
                        )}
                      </div>
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

        {/* ── PLAN DEL MES ── */}
        {tab === 'plan' && (() => {
          const plan = data.plan_mes
          if (!plan) return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📦</p>
              <p style={{ color: '#6B7280', fontSize: '15px' }}>El plan del mes estará disponible aquí muy pronto.</p>
            </div>
          )
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', animation: 'fadeUp 0.35s ease' }}>

              {/* Header del plan */}
              <div style={{ background: 'linear-gradient(135deg, #1E0547, #3B0C87)', borderRadius: '20px', padding: '28px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-20px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />
                <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>Plan contratado</p>
                {plan.nombre && <h2 style={{ margin: '0 0 10px', fontSize: '26px', fontWeight: 900, color: '#fff', lineHeight: 1.15 }}>{plan.nombre}</h2>}
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {plan.periodo && <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>📅 {plan.periodo}</span>}
                  {plan.valor   && <span style={{ fontSize: '14px', color: '#A78BFA', fontWeight: 800 }}>💰 {plan.valor}</span>}
                </div>
              </div>

              {/* Qué incluye */}
              {(plan.incluye ?? []).length > 0 && (
                <div style={{ background: '#fff', borderRadius: '18px', padding: '24px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '14px', fontWeight: 900, color: '#111' }}>📋 Qué incluye tu plan</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(plan.incluye ?? []).map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `rgba(107,33,168,0.1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                          <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke={P} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.55 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {plan.notas && (
                <div style={{ background: '#FFF7ED', borderRadius: '16px', padding: '18px', border: '1.5px solid #FED7AA' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📝 Notas</p>
                  <p style={{ margin: 0, fontSize: '14px', color: '#78350F', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{plan.notas}</p>
                </div>
              )}
            </div>
          )
        })()}

        {/* ── ANÁLISIS DE MARCA ── */}
        {tab === 'marca' && (() => {
          const am = data.analisis_marca
          if (!am) return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '40px', margin: '0 0 12px' }}>🎨</p>
              <p style={{ color: '#6B7280', fontSize: '15px' }}>El análisis de marca estará disponible aquí muy pronto.</p>
            </div>
          )

          const sections: { field: keyof typeof am; icon: string; title: string }[] = [
            { field: 'resumen',      icon: '📋', title: 'Resumen de la marca' },
            { field: 'colores',      icon: '🎨', title: 'Colores corporativos' },
            { field: 'tipografias',  icon: '✍️', title: 'Tipografías' },
            { field: 'voz_si',       icon: '✅', title: 'Voz de la marca — Cómo SÍ hablamos' },
            { field: 'voz_no',       icon: '🚫', title: 'Voz de la marca — Cómo NO hablamos' },
            { field: 'fortalezas',   icon: '💪', title: 'Fortalezas' },
            { field: 'brechas',      icon: '🔍', title: 'Brechas y oportunidades' },
            { field: 'bio_actual',   icon: '📱', title: 'Bio actual' },
            { field: 'bio_propuesta',icon: '✨', title: 'Bio propuesta' },
          ]

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'fadeUp 0.35s ease' }}>
              {sections.map(s => {
                const val = am[s.field]
                if (!val) return null
                return (
                  <div key={s.field} style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                    <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.icon} {s.title}</p>
                    <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>{val}</p>
                  </div>
                )
              })}
            </div>
          )
        })()}

      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: 'center', padding: '32px 20px', color: '#9CA3AF', fontSize: '12.5px' }}>
        Portal de clientes · <strong style={{ color: P }}>Alma Agencia Creativa</strong> · Manizales, Colombia
      </div>

      {/* ══ MODAL solicitud ════════════════════════════════════ */}
      {showSolForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            padding: '28px 24px 32px',
            width: '100%', maxWidth: '520px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 24px 64px rgba(0,0,0,0.22)',
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

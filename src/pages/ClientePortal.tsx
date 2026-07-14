import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getPortalByToken, addSolicitudToPortal } from '../lib/db'
import { trackPortalVisit } from '../lib/analytics'
import type { Cliente, Solicitud, ParrillaItem } from '../data/clientes'
import {
  PILARES_CONTENIDO,
  SOLICITUD_TIPOS, SOLICITUD_ESTADOS, CLIENTE_ESTADOS,
} from '../data/clientes'
import { contactoDefault } from '../data/config'
import { useIsMobile } from '../hooks/useIsMobile'

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
      <a href={`https://wa.me/${contactoDefault.whatsapp}`} style={{ padding: '11px 24px', borderRadius: '12px', background: P, color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
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

/* ── Sangría + scrollbar premium para el HTML de estrategia embebido ── */
const RESPONSIVE_IFRAME_CSS = `
<style id="alma-responsive-fix">
  html { scrollbar-width: thin; scrollbar-color: rgba(0,0,0,0.18) transparent; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.18); border-radius: 10px; }
  ::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.3); }
  @media (max-width: 640px) {
    body { padding-left: 20px !important; padding-right: 20px !important; box-sizing: border-box !important; }
  }
</style>
`
function injectResponsiveFixes(html: string): string {
  // Sin <meta viewport> el layout viewport por defecto es ancho (~980px) y
  // el @media de RESPONSIVE_IFRAME_CSS nunca se activa dentro del iframe.
  const viewportMeta = /name=["']viewport["']/.test(html) ? '' : '<meta name="viewport" content="width=device-width, initial-scale=1">'
  const injection = viewportMeta + RESPONSIVE_IFRAME_CSS
  return html.includes('</head>')
    ? html.replace('</head>', `${injection}</head>`)
    : `${injection}${html}`
}

/* ── Main Component ──────────────────────────────────────── */
export default function ClientePortal() {
  const { token } = useParams<{ token: string }>()
  const isMobile  = useIsMobile()
  const [data,    setData]    = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState<'inicio' | 'parrilla' | 'plan' | 'marca' | 'solicitudes' | 'accesos'>('inicio')
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
  const [copiedKey,           setCopiedKey]           = useState<string | null>(null)
  // Calendario editorial
  const [parrillaView,  setParrillaView]  = useState<'tablero' | 'calendario'>('tablero')
  const [calMes,        setCalMes]        = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() } })
  const [calModalPosts, setCalModalPosts] = useState<ParrillaItem[] | null>(null)

  function copyToClipboard(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(k => (k === key ? null : k)), 1500)
    }).catch(() => {})
  }

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

  type PortalTab = 'inicio' | 'parrilla' | 'plan' | 'marca' | 'solicitudes' | 'accesos'
  const TABS: { key: PortalTab; label: string }[] = [
    { key: 'inicio',      label: '🏠 Inicio' },
    { key: 'parrilla',    label: `📅 Parrilla` },
    { key: 'plan',        label: '📦 Plan del mes' },
    { key: 'marca',       label: '🎨 Marca' },
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
              <span style={{ fontSize: '14px', fontWeight: 800, color: '#fff', flex: 1, minWidth: 0, letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.marca}</span>
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
            <div style={{ padding: isMobile ? '10px 16px 20px' : '12px 24px 28px', display:'flex', alignItems:'flex-start', gap: isMobile ? '12px' : '20px', flexWrap:'wrap' }}>
              {/* Logo */}
              {data.logo_url ? (
                <div style={{ width: isMobile ? '52px' : '80px', height: isMobile ? '52px' : '80px', borderRadius:'18px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.18)', padding:'8px', flexShrink:0, backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <img src={data.logo_url} alt={data.marca} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:'10px' }} />
                </div>
              ) : (
                <div style={{ width: isMobile ? '52px' : '80px', height: isMobile ? '52px' : '80px', borderRadius:'18px', background:'linear-gradient(135deg, rgba(139,92,246,0.4), rgba(109,40,217,0.6))', border:'1px solid rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', fontSize: isMobile ? '20px' : '32px', fontWeight:900, color:'#fff', flexShrink:0, backdropFilter:'blur(8px)', letterSpacing:'-1px' }}>
                  {(data.marca ?? '?')[0].toUpperCase()}
                </div>
              )}

              {/* Nombre + Estado */}
              <div style={{ flex:1, minWidth: isMobile ? '160px' : '180px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'6px' }}>
                  <h1 style={{ margin:0, color:'#fff', fontSize: isMobile ? '20px' : '28px', fontWeight:900, letterSpacing:'-0.5px', lineHeight:1.15 }}>{data.marca}</h1>
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
                  padding: isMobile ? '11px 14px' : '14px 18px',
                  backdropFilter:'blur(10px)',
                  minWidth: isMobile ? '0' : '180px',
                  maxWidth: isMobile ? '100%' : '260px',
                  width: isMobile ? '100%' : 'auto',
                }}>
                  {/* Encabezado del plan */}
                  <div style={{ display:'flex', alignItems:'center', gap:'7px', marginBottom: isMobile ? '6px' : '10px' }}>
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
                      {(data.plan_mes!.incluye ?? []).slice(0, isMobile ? 2 : 5).map((item, i) => (
                        <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:'6px' }}>
                          <span style={{ color:'rgba(250,204,21,0.7)', fontSize:'10px', marginTop:'2px', flexShrink:0, lineHeight:1.4 }}>✦</span>
                          <span style={{ fontSize:'11.5px', color:'rgba(255,255,255,0.65)', lineHeight:1.4, fontWeight:500 }}>{item}</span>
                        </div>
                      ))}
                      {(data.plan_mes?.incluye ?? []).length > (isMobile ? 2 : 5) && (
                        <p style={{ margin:'2px 0 0', fontSize:'10.5px', color:'rgba(255,255,255,0.3)', fontWeight:500 }}>+{(data.plan_mes!.incluye ?? []).length - (isMobile ? 2 : 5)} más incluidos</p>
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

          // Parrilla del mes actual (tablero Trello) — para el acceso directo
          const today           = new Date()
          const mesActualStr    = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
          const parrillaMeses   = data.parrilla_meses ?? []
          const htmlsLegacy     = data.parrilla_htmls ?? []
          const tieneParrilla   = parrillaMeses.length > 0 || htmlsLegacy.length > 0
          const mesBoardActual  = parrillaMeses.find(m => m.mes === mesActualStr)
          const tituloMesActual = mesBoardActual?.html_titulo
            ?? htmlsLegacy.find(h => h.mes === mesActualStr)?.titulo
            ?? mesBoardActual?.label

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

              {/* ══ TU PARRILLA DE CONTENIDO — acceso directo al tablero ══ */}
              <div
                onClick={() => setTab('parrilla')}
                style={{
                  background:'linear-gradient(135deg, #1E0547, #3B0C87)',
                  borderRadius:'20px', padding:'22px 26px',
                  display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px',
                  position:'relative', overflow:'hidden', cursor:'pointer',
                }}
              >
                <div style={{ position:'absolute', right:'-20px', top:'-20px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.04)' }} />
                <div style={{ display:'flex', alignItems:'center', gap:'14px', position:'relative', zIndex:1, minWidth:0 }}>
                  <div style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0 }}>📅</div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 4px' }}>Tu parrilla de contenido</p>
                    <p style={{ fontSize:'15px', fontWeight:900, color:'#fff', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {tieneParrilla
                        ? (tituloMesActual ?? 'Estrategia y materiales del mes listos')
                        : 'Tu equipo está preparando tu primer mes'}
                    </p>
                  </div>
                </div>
                <span
                  className="portal-action-btn"
                  style={{
                    padding:'12px 24px', borderRadius:'12px',
                    background:'rgba(255,255,255,0.95)', color:P,
                    fontWeight:800, fontSize:'14px',
                    transition:'opacity 0.2s, transform 0.15s', flexShrink:0, position:'relative', zIndex:1,
                  }}
                >
                  Ver tablero →
                </span>
              </div>

              {/* ══ STAT CARDS GRANDES ══ */}
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(auto-fill,minmax(196px,1fr))', gap: isMobile ? '10px' : '14px' }}>
                {([
                  {
                    label:'Posts publicados',
                    value: mesActual?.posts_publicados != null ? String(mesActual.posts_publicados) : String(publicados.length),
                    sub: mesActual?.posts_publicados != null ? 'según métricas del mes' : `de ${parrilla.length} en parrilla`,
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
                    label:'Seguidores',
                    value: mesActual?.seguidores_total ? mesActual.seguidores_total.toLocaleString() : '—',
                    sub: mesActual?.seguidores ? `+${mesActual.seguidores} este mes` : 'sin variación registrada',
                    grad:'linear-gradient(135deg, #4C0519, #9D174D)',
                    icon:'👤', accent:'#FB7185',
                  },
                ] as { label:string; value:string; sub:string; grad:string; icon:string; accent:string }[]).map(card => (
                  <div key={card.label} className="portal-card" style={{
                    background:card.grad, borderRadius: isMobile ? '14px' : '18px', padding: isMobile ? '14px 12px' : '22px 20px',
                    transition:'transform 0.2s, box-shadow 0.2s',
                    cursor:'default', minWidth:0,
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: isMobile ? '8px' : '14px' }}>
                      <p style={{ margin:0, fontSize: isMobile ? '9.5px' : '11px', fontWeight:700, color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.8px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{card.label}</p>
                      <span style={{ fontSize: isMobile ? '16px' : '20px', lineHeight:1, flexShrink:0, marginLeft:'6px' }}>{card.icon}</span>
                    </div>
                    <p style={{ margin:'0 0 4px', fontSize: isMobile ? '22px' : '32px', fontWeight:900, color:'#fff', lineHeight:1, letterSpacing:'-1px' }}>{card.value}</p>
                    <p style={{ margin:0, fontSize: isMobile ? '10.5px' : '12px', color:'rgba(255,255,255,0.45)', fontWeight:500 }}>{card.sub}</p>
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

              {/* ══ AUDIENCIA DEL MES ══ */}
              {mesActual && (mesActual.pct_mujeres != null || mesActual.pct_hombres != null || !!mesActual.edad_principal || !!mesActual.ciudad_top || mesActual.pct_historias != null || mesActual.pct_publicaciones != null || mesActual.pct_reels != null || mesActual.visitas_perfil != null || mesActual.clics_enlace != null) && (
                <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid #E5E7EB', overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div style={{ padding:'18px 22px 14px', borderBottom:'1px solid #F3F4F6' }}>
                    <p style={{ margin:0, fontSize:'15px', fontWeight:800, color:'#111' }}>👥 Audiencia del mes</p>
                    <p style={{ margin:'2px 0 0', fontSize:'12px', color:'#9CA3AF' }}>
                      {(() => { const [y,mo] = mesActual.mes.split('-'); return new Date(+y, +mo-1, 1).toLocaleDateString('es-CO',{month:'long', year:'numeric'}) })()} · Instagram Insights
                    </p>
                  </div>
                  <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:'18px' }}>

                    {/* Género */}
                    {(mesActual.pct_mujeres != null || mesActual.pct_hombres != null) && (
                      <div>
                        <p style={{ margin:'0 0 8px', fontSize:'11px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Género</p>
                        <div style={{ display:'flex', gap:'8px', marginBottom:'8px', flexWrap:'wrap' }}>
                          {mesActual.pct_mujeres != null && <span style={{ background:'rgba(236,72,153,0.12)', color:'#BE185D', padding:'5px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:800 }}>♀ Mujeres {mesActual.pct_mujeres}%</span>}
                          {mesActual.pct_hombres != null && <span style={{ background:'rgba(59,130,246,0.12)', color:'#1D4ED8', padding:'5px 14px', borderRadius:'8px', fontSize:'13px', fontWeight:800 }}>♂ Hombres {mesActual.pct_hombres}%</span>}
                        </div>
                        {mesActual.pct_mujeres != null && mesActual.pct_hombres != null && (
                          <div style={{ height:'8px', borderRadius:'4px', overflow:'hidden', display:'flex' }}>
                            <div style={{ width:`${mesActual.pct_mujeres}%`, background:'linear-gradient(90deg,#EC4899,#F472B6)', transition:'width 0.6s ease' }} />
                            <div style={{ flex:1, background:'linear-gradient(90deg,#60A5FA,#3B82F6)' }} />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Edad + Ciudad */}
                    {(mesActual.edad_principal || mesActual.ciudad_top) && (
                      <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                        {mesActual.edad_principal && (
                          <div style={{ flex:1, minWidth:'130px', background:'rgba(107,33,168,0.06)', borderRadius:'12px', padding:'14px 16px' }}>
                            <p style={{ margin:'0 0 3px', fontSize:'11px', color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Edad principal</p>
                            <p style={{ margin:0, fontSize:'22px', fontWeight:900, color:P }}>{mesActual.edad_principal} <span style={{ fontSize:'13px', fontWeight:600, color:'#9CA3AF' }}>años</span></p>
                          </div>
                        )}
                        {mesActual.ciudad_top && (
                          <div style={{ flex:1, minWidth:'130px', background:'rgba(5,150,105,0.06)', borderRadius:'12px', padding:'14px 16px' }}>
                            <p style={{ margin:'0 0 3px', fontSize:'11px', color:'#9CA3AF', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px' }}>Ciudad principal</p>
                            <p style={{ margin:0, fontSize:'22px', fontWeight:900, color:'#059669' }}>{mesActual.ciudad_top}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Distribución por tipo */}
                    {(mesActual.pct_historias != null || mesActual.pct_publicaciones != null || mesActual.pct_reels != null) && (
                      <div>
                        <p style={{ margin:'0 0 10px', fontSize:'11px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Visualizaciones por formato</p>
                        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                          {([
                            { label:'Historias',     pct: mesActual.pct_historias,     color:'#8B5CF6' },
                            { label:'Publicaciones', pct: mesActual.pct_publicaciones, color:'#EC4899' },
                            { label:'Reels',         pct: mesActual.pct_reels,         color:'#F59E0B' },
                          ] as { label: string; pct: number | undefined; color: string }[]).filter(x => x.pct != null).map(x => (
                            <div key={x.label} style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                              <span style={{ fontSize:'12px', color:'#6B7280', minWidth:'95px', fontWeight:600 }}>{x.label}</span>
                              <div style={{ flex:1, height:'22px', background:'#F9FAFB', borderRadius:'6px', overflow:'hidden', position:'relative' }}>
                                <div style={{ height:'100%', width:`${x.pct}%`, background: x.color, borderRadius:'6px', display:'flex', alignItems:'center', paddingLeft:'8px', transition:'width 0.6s ease' }}>
                                  {(x.pct ?? 0) > 18 && <span style={{ fontSize:'11px', fontWeight:800, color:'#fff' }}>{x.pct}%</span>}
                                </div>
                                {(x.pct ?? 0) <= 18 && <span style={{ position:'absolute', left:`${(x.pct ?? 0) + 1}%`, top:'50%', transform:'translateY(-50%)', marginLeft:'4px', fontSize:'11px', fontWeight:700, color: x.color }}>{x.pct}%</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actividad del perfil */}
                    {(mesActual.visitas_perfil != null || mesActual.clics_enlace != null) && (
                      <div style={{ display:'flex', gap:'16px', flexWrap:'wrap', paddingTop:'4px', borderTop:'1px solid #F9FAFB' }}>
                        {mesActual.visitas_perfil != null && (
                          <div style={{ textAlign:'center', flex:1, minWidth:'100px' }}>
                            <p style={{ margin:'0 0 2px', fontSize:'22px', fontWeight:900, color:'#111' }}>{mesActual.visitas_perfil.toLocaleString()}</p>
                            <p style={{ margin:0, fontSize:'12px', color:'#9CA3AF' }}>🔍 Visitas al perfil</p>
                          </div>
                        )}
                        {mesActual.clics_enlace != null && (
                          <div style={{ textAlign:'center', flex:1, minWidth:'100px' }}>
                            <p style={{ margin:'0 0 2px', fontSize:'22px', fontWeight:900, color:'#111' }}>{mesActual.clics_enlace.toLocaleString()}</p>
                            <p style={{ margin:0, fontSize:'12px', color:'#9CA3AF' }}>🔗 Clics en enlace</p>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
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

        {/* ── PARRILLA ── */}
        {tab === 'parrilla' && (() => {
          const parrillaMeses = [...(data.parrilla_meses ?? [])].sort((a, b) => a.mes.localeCompare(b.mes))
          const htmlsLegacy   = [...(data.parrilla_htmls  ?? [])].sort((a, b) => b.mes.localeCompare(a.mes))

          // ── Fullscreen HTML (tablero Trello — clic en card estrategia) ──
          if (activeParrillaMesId) {
            const mes = parrillaMeses.find(m => m.id === activeParrillaMesId)
            if (mes?.html_contenido) {
              const injected = injectResponsiveFixes(data.logo_url
                ? injectLogo(mes.html_contenido, data.logo_url, data.marca ?? '')
                : mes.html_contenido)
              return (
                <div style={{ width:'100vw', marginLeft:'calc(50% - 50vw - 20px)', marginTop:'-28px', marginBottom:'-28px' }}>
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

          // ── Vista HTML legacy (accedida vía botón desde el tablero) ──
          if (activeHtmlId && htmlsLegacy.length > 0) {
            const current = htmlsLegacy.find(h => h.id === activeHtmlId) ?? htmlsLegacy[0]
            const injected = injectResponsiveFixes(data.logo_url
              ? injectLogo(current.contenido, data.logo_url, data.marca ?? '')
              : current.contenido)
            return (
              <div style={{ width:'100vw', marginLeft:'calc(50% - 50vw - 20px)', marginTop:'-28px', marginBottom:'-28px', animation:'fadeUp 0.35s ease' }}>
                <div style={{ background:'rgba(0,0,0,0.25)', backdropFilter:'blur(8px)', padding:'9px 20px', display:'flex', alignItems:'center', gap:'12px', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>
                  <button onClick={() => setActiveHtmlId(null)}
                    style={{ padding:'6px 14px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.22)', background:'rgba(255,255,255,0.08)', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'12px' }}>
                    ← Tablero
                  </button>
                  {htmlsLegacy.length > 1 && htmlsLegacy.map(h => (
                    <button key={h.id} onClick={() => setActiveHtmlId(h.id)}
                      style={{ padding:'5px 14px', borderRadius:'20px', cursor:'pointer', border:`1.5px solid ${current.id === h.id ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`, background: current.id === h.id ? 'rgba(255,255,255,0.15)' : 'transparent', color:'rgba(255,255,255,0.7)', fontSize:'12px', fontWeight:700 }}>
                      {h.label}
                    </button>
                  ))}
                </div>
                <iframe key={current.id} srcDoc={injected} style={{ width:'100%', height:'calc(100vh - 96px)', minHeight:'700px', border:'none', display:'block' }} title={current.label} sandbox="allow-scripts" />
              </div>
            )
          }

          // ── Calendario editorial ──
          if (parrillaView === 'calendario') {
            const parrilla = data.parrilla ?? []
            const { year, month } = calMes
            const firstDay = new Date(year, month, 1).getDay()
            const daysInMonth = new Date(year, month + 1, 0).getDate()
            const cells: (number | null)[] = []
            for (let i = 0; i < firstDay; i++) cells.push(null)
            for (let d = 1; d <= daysInMonth; d++) cells.push(d)
            while (cells.length % 7 !== 0) cells.push(null)
            const postsByDay: Record<number, ParrillaItem[]> = {}
            parrilla.forEach(p => {
              if (!p.fecha) return
              const [y, m, d] = p.fecha.split('-').map(Number)
              if (y === year && m === month + 1) {
                if (!postsByDay[d]) postsByDay[d] = []
                postsByDay[d].push(p)
              }
            })
            const RED_COLOR: Record<string, string> = {
              'Instagram':'#E1306C','TikTok':'#010101','Facebook':'#1877F2',
              'YouTube':'#FF0000','LinkedIn':'#0A66C2','X':'#1DA1F2',
            }
            const monthLabel = new Date(year, month, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
            const todayD = new Date()
            const prevM = () => setCalMes(({ year:y, month:m }) => m === 0 ? { year:y-1, month:11 } : { year:y, month:m-1 })
            const nextM = () => setCalMes(({ year:y, month:m }) => m === 11 ? { year:y+1, month:0 } : { year:y, month:m+1 })

            return (
              <div style={{ width:'100vw', marginLeft:'calc(50% - 50vw - 20px)', marginTop:'-28px', marginBottom:'-28px', background:'linear-gradient(160deg,#0E0322 0%,#1A0640 55%,#2D0C72 100%)', minHeight:'calc(100vh - 96px)', padding: isMobile ? '14px 8px 24px' : '24px 28px 40px', animation:'fadeUp 0.35s ease' }}>

                {/* Header: toggle + navegación mes */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: isMobile ? '14px' : '24px', flexWrap:'wrap', gap:'10px' }}>
                  <div style={{ display:'flex', gap:'4px', background:'rgba(255,255,255,0.07)', borderRadius:'12px', padding:'3px' }}>
                    <button onClick={() => setParrillaView('tablero')} style={{ padding: isMobile ? '6px 12px' : '7px 16px', borderRadius:'9px', background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>📋 Tablero</button>
                    <button style={{ padding: isMobile ? '6px 12px' : '7px 16px', borderRadius:'9px', background:'rgba(255,255,255,0.14)', border:'none', color:'#fff', fontSize:'12px', fontWeight:800, cursor:'default' }}>📅 Calendario</button>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap: isMobile ? '8px' : '14px' }}>
                    <button onClick={prevM} style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'none', color:'#fff', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>‹</button>
                    <span style={{ fontSize: isMobile ? '12.5px' : '14px', fontWeight:800, color:'#fff', textTransform:'capitalize', minWidth: isMobile ? '110px' : '160px', textAlign:'center' }}>{monthLabel}</span>
                    <button onClick={nextM} style={{ width:'30px', height:'30px', borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'none', color:'#fff', fontSize:'16px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>›</button>
                  </div>
                </div>

                {/* Nombres de días */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap: isMobile ? '2px' : '4px', marginBottom:'4px' }}>
                  {(isMobile ? ['D','L','M','X','J','V','S'] : ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']).map((d, i) => (
                    <div key={i} style={{ textAlign:'center', fontSize: isMobile ? '9px' : '10px', fontWeight:800, color:'rgba(255,255,255,0.3)', padding:'4px 0', textTransform:'uppercase', letterSpacing:'0.5px' }}>{d}</div>
                  ))}
                </div>

                {/* Grid de días */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap: isMobile ? '2px' : '4px' }}>
                  {cells.map((day, i) => {
                    const posts = day ? (postsByDay[day] ?? []) : []
                    const isToday = day !== null && todayD.getFullYear() === year && todayD.getMonth() === month && todayD.getDate() === day
                    const hasPosts = posts.length > 0
                    return (
                      <div
                        key={i}
                        onClick={() => hasPosts && setCalModalPosts(posts)}
                        style={{
                          minHeight: isMobile ? '44px' : '72px', background: day ? (hasPosts ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)') : 'transparent',
                          borderRadius: isMobile ? '7px' : '10px', padding: isMobile ? '3px 2px 2px' : '6px 5px 5px',
                          cursor: hasPosts ? 'pointer' : 'default',
                          border: isToday ? '1.5px solid rgba(167,139,250,0.5)' : '1.5px solid transparent',
                          transition:'background 0.15s',
                          minWidth:0, overflow:'hidden',
                          ...(hasPosts ? { ':hover': { background:'rgba(255,255,255,0.12)' } } : {}),
                        }}
                      >
                        {day !== null && (
                          <>
                            <p style={{ margin:'0 0 3px', fontSize: isMobile ? '9.5px' : '11px', fontWeight: isToday ? 900 : 500, color: isToday ? '#A78BFA' : 'rgba(255,255,255,0.45)', textAlign:'right', lineHeight:1 }}>{day}</p>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:'3px', justifyContent: isMobile ? 'center' : 'flex-start' }}>
                              {posts.slice(0, 3).map(p => (
                                <div key={p.id} title={`${p.red} · ${p.tipo}`} style={{ width:'9px', height:'9px', borderRadius:'50%', background: RED_COLOR[p.red] ?? '#6B7280', flexShrink:0 }} />
                              ))}
                              {posts.length > 3 && <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.4)', lineHeight:'9px', marginLeft:'1px' }}>+{posts.length-3}</span>}
                            </div>
                            {!isMobile && posts.length > 0 && (
                              <p style={{ margin:'4px 0 0', fontSize:'9px', color:'rgba(255,255,255,0.35)', lineHeight:1.2, overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>
                                {posts[0].tipo}{posts.length > 1 ? ` +${posts.length-1}` : ''}
                              </p>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Leyenda redes */}
                <div style={{ marginTop:'20px', display:'flex', gap:'14px', flexWrap:'wrap' }}>
                  {Object.entries(RED_COLOR).map(([red, color]) => {
                    if (!parrilla.some(p => p.red === red)) return null
                    return (
                      <div key={red} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:color }} />
                        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:600 }}>{red}</span>
                      </div>
                    )
                  })}
                </div>

                {/* Modal detalle del día */}
                {calModalPosts && (
                  <div onClick={e => { if (e.target === e.currentTarget) setCalModalPosts(null) }} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.72)', zIndex:300, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(6px)' }}>
                    <div style={{ background:'linear-gradient(160deg,#1A0640,#2D0C72)', borderRadius:'22px', padding:'24px', maxWidth:'540px', width:'100%', maxHeight:'88vh', overflowY:'auto', border:'1px solid rgba(255,255,255,0.12)', boxShadow:'0 24px 60px rgba(0,0,0,0.7)' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                        <p style={{ margin:0, fontSize:'16px', fontWeight:900, color:'#fff' }}>
                          📅 {calModalPosts[0]?.fecha}{calModalPosts[0]?.hora ? ` · ${calModalPosts[0].hora}` : ''}
                        </p>
                        <button onClick={() => setCalModalPosts(null)} style={{ background:'rgba(255,255,255,0.1)', border:'none', color:'rgba(255,255,255,0.7)', borderRadius:'9px', padding:'6px 14px', cursor:'pointer', fontSize:'13px', fontWeight:700 }}>✕</button>
                      </div>
                      {calModalPosts.map(post => {
                        const estColor = post.estado === 'publicado' ? {bg:'#D1FAE5',color:'#065F46',label:'✅ Publicado'} : post.estado === 'aprobado' ? {bg:'#DBEAFE',color:'#1E40AF',label:'👍 Aprobado'} : post.estado === 'pendiente_aprobacion' ? {bg:'#FEF3C7',color:'#92400E',label:'⏳ Pendiente'} : {bg:'#F3F4F6',color:'#6B7280',label:'📝 Borrador'}
                        return (
                          <div key={post.id} style={{ background:'rgba(255,255,255,0.05)', borderRadius:'16px', padding:'18px', marginBottom:'12px', border:'1px solid rgba(255,255,255,0.08)' }}>
                            <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'12px', flexWrap:'wrap' }}>
                              <div style={{ width:'10px', height:'10px', borderRadius:'50%', background: RED_COLOR[post.red] ?? '#6B7280', flexShrink:0 }} />
                              <span style={{ fontSize:'13px', fontWeight:800, color:'#fff' }}>{post.red}</span>
                              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>·</span>
                              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{post.tipo}</span>
                              {post.hora && <span style={{ fontSize:'12px', color:'#A78BFA', fontWeight:700 }}>🕐 {post.hora}</span>}
                              <span style={{ marginLeft:'auto', fontSize:'11px', fontWeight:700, padding:'3px 9px', borderRadius:'20px', background:estColor.bg, color:estColor.color }}>{estColor.label}</span>
                            </div>
                            <p style={{ margin:'0 0 6px', fontSize:'15px', fontWeight:900, color:'#fff', lineHeight:1.4 }}>{post.descripcion}</p>
                            {post.subtitulo && <p style={{ margin:'0 0 10px', fontSize:'13px', color:'rgba(255,255,255,0.45)' }}>{post.subtitulo}</p>}
                            {post.caption && (
                              <div style={{ marginBottom:'10px' }}>
                                <p style={{ margin:'0 0 4px', fontSize:'10px', fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Caption</p>
                                <div style={{ background:'rgba(0,0,0,0.35)', borderRadius:'10px', padding:'12px 14px' }}>
                                  <p style={{ margin:'0 0 8px', fontSize:'12px', color:'rgba(255,255,255,0.7)', whiteSpace:'pre-wrap', lineHeight:1.55 }}>{post.caption}</p>
                                  <button onClick={() => navigator.clipboard.writeText(post.caption!)} style={{ background:'rgba(167,139,250,0.15)', border:'1px solid rgba(167,139,250,0.3)', color:'#A78BFA', borderRadius:'7px', padding:'5px 12px', fontSize:'11px', fontWeight:800, cursor:'pointer' }}>
                                    Copiar caption
                                  </button>
                                </div>
                              </div>
                            )}
                            {post.hashtags && <p style={{ margin:'0 0 8px', fontSize:'12px', color:'#A78BFA', fontFamily:'monospace', lineHeight:1.5 }}>{post.hashtags}</p>}
                            {post.cta && <p style={{ margin:'0 0 8px', fontSize:'12px', fontWeight:700, color:'#FCD34D' }}>CTA: {post.cta}</p>}
                            {post.instrucciones && (
                              <div style={{ marginTop:'8px' }}>
                                <p style={{ margin:'0 0 4px', fontSize:'10px', fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px' }}>Instrucciones de publicación</p>
                                {post.instrucciones.split('\n').filter(Boolean).map((line, li) => (
                                  <p key={li} style={{ margin:'0 0 2px', fontSize:'12px', color:'rgba(255,255,255,0.55)' }}>• {line}</p>
                                ))}
                              </div>
                            )}
                            {post.link_drive && (
                              <a href={post.link_drive} target="_blank" rel="noopener noreferrer" style={{ display:'inline-flex', alignItems:'center', gap:'7px', marginTop:'10px', marginRight:'10px', padding:'8px 16px', borderRadius:'9px', background:'rgba(16,185,129,0.14)', border:'1px solid rgba(16,185,129,0.3)', color:'#34D399', fontSize:'12.5px', fontWeight:800, textDecoration:'none' }}>
                                🗂️ Ver material en Drive
                              </a>
                            )}
                            {post.link && <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ display:'inline-block', marginTop:'10px', fontSize:'12px', color:'#60A5FA', fontWeight:700 }}>Ver publicación →</a>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )
          }

          // ── Tablero Trello (siempre visible — placeholders si no hay meses) ──
          {
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
                width:'100vw', marginLeft:'calc(50% - 50vw - 20px)', marginTop:'-28px', marginBottom:'-28px',
                background:'linear-gradient(160deg, #0E0322 0%, #1A0640 55%, #2D0C72 100%)',
                minHeight:'calc(100vh - 96px)',
                padding: isMobile ? '16px 14px 24px' : '24px 40px 40px',
                animation:'fadeUp 0.35s ease',
              }}>
                {/* Título del tablero + toggle calendario */}
                <div style={{ marginBottom:'20px', display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', gap:'4px', background:'rgba(255,255,255,0.07)', borderRadius:'12px', padding:'3px', flexShrink:0 }}>
                    <button style={{ padding:'7px 16px', borderRadius:'9px', background:'rgba(255,255,255,0.14)', border:'none', color:'#fff', fontSize:'12px', fontWeight:800, cursor:'default' }}>📋 Tablero</button>
                    <button onClick={() => setParrillaView('calendario')} style={{ padding:'7px 16px', borderRadius:'9px', background:'transparent', border:'none', color:'rgba(255,255,255,0.5)', fontSize:'12px', fontWeight:700, cursor:'pointer' }}>📅 Calendario</button>
                  </div>
                  <div style={{ flex:1, height:'1px', background:'rgba(255,255,255,0.07)' }} />
                  {parrillaMeses.length === 0 && (
                    <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,193,7,0.7)', background:'rgba(255,193,7,0.1)', border:'1px solid rgba(255,193,7,0.2)', borderRadius:'20px', padding:'3px 10px', whiteSpace:'nowrap' }}>
                      ✦ En preparación
                    </span>
                  )}
                  {htmlsLegacy.length > 0 && (
                    <button onClick={() => setActiveHtmlId(htmlsLegacy[0].id)}
                      style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.4)', background:'transparent', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'20px', padding:'3px 10px', cursor:'pointer', whiteSpace:'nowrap' }}>
                      Ver parrilla del mes actual →
                    </button>
                  )}
                </div>

                {/* Columnas */}
                <div style={{ display:'flex', gap:'16px', overflowX:'auto', alignItems:'flex-start', paddingBottom:'16px' }}>
                  {columnas.map(mes => {
                    const isPlaceholder = boardIsPlaceholder
                    const hasHtml   = !!mes.html_contenido
                    const hasExtras = (mes.extras ?? []).length > 0
                    // Para columnas placeholder, buscar si hay HTML legacy del mismo mes
                    const matchingHtml = isPlaceholder ? htmlsLegacy.find(h => h.mes === mes.mes) : null
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

                        {/* Estrategia legacy en columna placeholder */}
                        {isPlaceholder && matchingHtml && (
                          <div
                            onClick={() => setActiveHtmlId(matchingHtml.id)}
                            className="portal-card"
                            style={{ background:'#fff', borderRadius:'10px', padding:'14px 14px 12px', border:'1px solid #E5E7EB', cursor:'pointer', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', transition:'transform 0.15s, box-shadow 0.15s' }}
                          >
                            <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'8px' }}>
                              <div style={{ width:'26px', height:'26px', borderRadius:'6px', background:PL, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'13px' }}>📋</div>
                              <p style={{ margin:0, fontSize:'10px', fontWeight:800, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Estrategia del mes</p>
                            </div>
                            {matchingHtml.titulo && (
                              <p style={{ margin:'0 0 8px', fontSize:'13.5px', color:'#111', fontWeight:700, lineHeight:1.3 }}>{matchingHtml.titulo}</p>
                            )}
                            <span style={{ fontSize:'12px', color:P, fontWeight:700 }}>Ver estrategia completa →</span>
                          </div>
                        )}

                        {/* Tarjetas de contenido: Post · Reels · Historias */}
                        {(!isPlaceholder || matchingHtml) && [
                          { key:'post',      label:'Post',      emoji:'📄', url: mes.drive_links?.post,      activeBg:'#F0FDF4', activeBorder:'#BBF7D0', activeColor:'#065F46' },
                          { key:'reels',     label:'Reels',     emoji:'🎬', url: mes.drive_links?.reels,     activeBg:'#FDF4FF', activeBorder:'#E9D5FF', activeColor:'#7E22CE' },
                          { key:'historias', label:'Historias', emoji:'📱', url: mes.drive_links?.historias, activeBg:'#EFF6FF', activeBorder:'#BFDBFE', activeColor:'#1E40AF' },
                        ].map(ct => ct.url ? (
                          <a key={ct.key} href={ct.url} target="_blank" rel="noopener noreferrer"
                            style={{ display:'flex', alignItems:'center', gap:'10px', background:'#fff', borderRadius:'10px', padding:'13px 14px', border:'1px solid #E5E7EB', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', textDecoration:'none' }}
                            onClick={e => e.stopPropagation()}>
                            <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:ct.activeBg, border:`1px solid ${ct.activeBorder}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'14px' }}>{ct.emoji}</div>
                            <span style={{ fontSize:'13px', fontWeight:800, color:ct.activeColor, flex:1 }}>{ct.label}</span>
                            <span style={{ fontSize:'11px', color:ct.activeColor, fontWeight:700 }}>Abrir ↗</span>
                          </a>
                        ) : (
                          <div key={ct.key} style={{ display:'flex', alignItems:'center', gap:'10px', background:'rgba(255,255,255,0.04)', borderRadius:'10px', padding:'13px 14px', border:'1px dashed rgba(255,255,255,0.12)' }}>
                            <div style={{ width:'28px', height:'28px', borderRadius:'7px', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:'14px', opacity:0.5 }}>{ct.emoji}</div>
                            <span style={{ fontSize:'13px', fontWeight:600, color:'rgba(255,255,255,0.25)', flex:1 }}>{ct.label}</span>
                            <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.18)' }}>Próximamente</span>
                          </div>
                        ))}

                        {/* Sin datos — columna placeholder pura */}
                        {isPlaceholder && !matchingHtml && (
                          <div style={{ padding:'24px 14px', borderRadius:'10px', border:'1px dashed rgba(255,255,255,0.15)', textAlign:'center', display:'flex', flexDirection:'column', gap:'8px', alignItems:'center' }}>
                            <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px' }}>📝</div>
                            <p style={{ fontSize:'11.5px', color:'rgba(255,255,255,0.25)', margin:0, lineHeight:1.5 }}>Tu estrategia de<br/>contenido estará aquí</p>
                          </div>
                        )}

                        {/* Extras (si existen) */}
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
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          }


          return null
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
                <p style={{ margin:'6px 0 0', fontSize:'13px', color:'#6B7280' }}>Usa el botón 👁 para revelar la contraseña y 📋 para copiarla. Solo tú y el equipo de Alma pueden ver esta información.</p>
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
                              onClick={() => copyToClipboard(`${acc.id}-user`, acc.usuario)}
                              title="Copiar usuario"
                              style={{ background:'none', border:'none', cursor:'pointer', fontSize:'13px', opacity: copiedKey === `${acc.id}-user` ? 1 : 0.5, flexShrink:0, padding:'0 2px', lineHeight:1 }}
                            >{copiedKey === `${acc.id}-user` ? '✅' : '📋'}</button>
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
                                onClick={() => copyToClipboard(`${acc.id}-pwd`, acc.password)}
                                title="Copiar contraseña"
                                style={{ background:'none', border:'none', cursor:'pointer', fontSize:'13px', opacity: copiedKey === `${acc.id}-pwd` ? 1 : 0.5, flexShrink:0, padding:'0 2px', lineHeight:1 }}
                              >{copiedKey === `${acc.id}-pwd` ? '✅' : '📋'}</button>
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
        <div
          onClick={() => { if (!sending) setShowSolForm(false) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
        >
          <div onClick={e => e.stopPropagation()} style={{
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

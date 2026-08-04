import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import {
  getArticulos, getProyectos, getPlanes, getExtras,
  getTestimonios, getFaqs, getPasos, getEquipo, getLeads,
} from '../../lib/db'
import { db } from '../../lib/firebase'
import { collection, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore'
import type { Cliente } from '../../data/clientes'
import { Y } from '../../tokens'
import { useIsMobile } from '../../hooks/useIsMobile'
import { ADM } from '../../lib/adminTheme'

const { BK, DIM, BDR, BDR2, MUT, WHT, INPUT_BG } = ADM
const P  = ADM.C1
const PL = ADM.ACC2

/* ── Paleta del dashboard ───────────────────────────────── */
const DARK   = '#0D0220'
const DARK2  = '#1A0535'
const DARK3  = '#2D0B6F'

/* ── Helpers ────────────────────────────────────────────── */
function GradientBar() {
  return (
    <div style={{
      height: '3px',
      background: `linear-gradient(90deg, ${P}, ${PL}, ${Y})`,
      borderRadius: '2px',
      flexShrink: 0,
    }} />
  )
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
      <span style={{
        background: `linear-gradient(135deg, ${P}, ${PL})`,
        color: '#fff',
        fontSize: '10px', fontWeight: 900,
        padding: '4px 12px 4px 8px', borderRadius: '20px',
        letterSpacing: '0.8px', textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: '5px',
      }}>
        <span style={{ fontSize: '13px' }}>{icon}</span>{label}
      </span>
      <div style={{ flex: 1, height: '1px', background: `linear-gradient(90deg, rgba(107,33,168,0.25), transparent)` }} />
    </div>
  )
}

/* ── Stat Card ──────────────────────────────────────────── */
interface StatCard {
  label:      string
  value:      string | number
  icon:       string
  color:      string
  to:         string
  action:     string
  highlight?: boolean
  tag?:       string
}

function StatCardComp({ c, isMobile }: { c: StatCard; isMobile: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: DIM,
        borderRadius: '16px',
        padding: isMobile ? '16px 14px' : '20px 22px',
        border: c.highlight
          ? `2px solid ${c.color}`
          : `1px solid ${hovered ? `${c.color}40` : BDR}`,
        boxShadow: c.highlight
          ? `0 4px 24px ${c.color}28`
          : hovered
            ? `0 8px 28px rgba(107,33,168,0.12)`
            : `0 2px 8px rgba(107,33,168,0.05)`,
        display: 'flex', flexDirection: 'column', gap: 0,
        transition: 'all 0.2s ease',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Accent bar top */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: c.highlight
          ? `linear-gradient(90deg, ${c.color}, ${Y})`
          : hovered ? `linear-gradient(90deg, ${c.color}60, transparent)` : 'transparent',
        transition: 'all 0.2s',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '8px' : '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: `${c.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: isMobile ? '18px' : '22px',
          flexShrink: 0,
        }}>
          {c.icon}
        </div>
        {c.tag && (
          <span style={{
            background: c.highlight ? `${c.color}18` : BK,
            color: c.highlight ? c.color : PL,
            fontSize: '10px', fontWeight: 800,
            padding: '3px 9px', borderRadius: '20px',
            letterSpacing: '0.4px', textTransform: 'uppercase',
          }}>
            {c.tag}
          </span>
        )}
      </div>

      <p style={{
        fontSize: isMobile ? '28px' : '34px',
        fontWeight: 900, color: WHT,
        margin: '0 0 3px', lineHeight: 1,
        letterSpacing: '-1px',
      }}>
        {c.value}
      </p>
      <p style={{
        fontSize: isMobile ? '11px' : '12px',
        color: MUT, margin: '0 0 16px', lineHeight: 1.4,
      }}>
        {c.label}
      </p>

      <Link
        to={c.to}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: isMobile ? '7px 12px' : '8px 16px',
          background: `linear-gradient(135deg, ${c.color}, ${c.color}CC)`,
          color: '#fff',
          borderRadius: '9px', textDecoration: 'none',
          fontSize: isMobile ? '11px' : '12px', fontWeight: 700,
          marginTop: 'auto', alignSelf: 'flex-start',
          boxShadow: `0 2px 10px ${c.color}30`,
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {c.action} →
      </Link>
    </div>
  )
}

/* ── Biz Card ────────────────────────────────────────────── */
interface BizCard {
  icon:  string
  title: string
  desc:  string
  color: string
  to:    string
  cta:   string
  badge: string
}

/* Orden según el flujo comercial: brief → cotización → contrato
   → cliente → cobro → finanzas (mismo orden que el sidebar). */
const BIZ_MODULES: BizCard[] = [
  { icon:'📋', title:'Brief',            desc:'Recibe y gestiona los briefs de tus clientes en un solo lugar.',     color:'#0EA5E9', to:'/admin/brief',         cta:'Abrir Brief',       badge:'Activo' },
  { icon:'📊', title:'Cotizaciones',     desc:'Crea y envía cotizaciones profesionales con PDF listo para imprimir.', color:'#7C3AED', to:'/admin/cotizaciones',  cta:'Ver Cotizaciones',  badge:'Activo' },
  { icon:'📑', title:'Contratos',        desc:'Genera órdenes de servicio y contratos firmados digitalmente.',      color:'#2563EB', to:'/admin/contratos',     cta:'Ver Contratos',     badge:'Activo' },
  { icon:'👥', title:'Clientes',         desc:'Portal privado: avances, entregables y métricas por cliente.',      color:'#EA580C', to:'/admin/clientes',      cta:'Ver Clientes',      badge:'Activo' },
  { icon:'💳', title:'Cuentas de Cobro', desc:'Emite cuentas de cobro y haz seguimiento de pagos pendientes.',      color:'#0D9488', to:'/admin/cuentas-cobro', cta:'Ver Cuentas',       badge:'Activo' },
  { icon:'💼', title:'Finanzas',         desc:'Controla ingresos, gastos y rentabilidad de cada proyecto.',         color:'#16A34A', to:'/admin/finanzas',      cta:'Ver Finanzas',      badge:'Activo' },
  { icon:'🎓', title:'Academia',         desc:'Cursos y contenido educativo en edu.almaagenciacreativa.com.',      color:'#DB2777', to:'/admin/academia',      cta:'Ver Academia',      badge:'Activo' },
]

/* ── Dashboard ───────────────────────────────────────────── */
export default function AdminDashboard() {
  const [nArticulos,      setNArticulos]      = useState<number | null>(null)
  const [nProyectos,      setNProyectos]      = useState<number | null>(null)
  const [nPlanes,         setNPlanes]         = useState<number | null>(null)
  const [nExtras,         setNExtras]         = useState<number | null>(null)
  const [nTestimonios,    setNTestimonios]    = useState<number | null>(null)
  const [nFaqs,           setNFaqs]           = useState<number | null>(null)
  const [nPasos,          setNPasos]          = useState<number | null>(null)
  const [nEquipo,         setNEquipo]         = useState<number | null>(null)
  const [nLeads,          setNLeads]          = useState<number | null>(null)
  const [nLeadsNuevos,    setNLeadsNuevos]    = useState<number | null>(null)
  // Analytics — clientes
  const [nClientesActivos,  setNClientesActivos]  = useState<number | null>(null)
  const [nPortalesActivos,  setNPortalesActivos]  = useState<number | null>(null)
  const [nSolicitudesPend,  setNSolicitudesPend]  = useState<number | null>(null)
  const [nLeadsThisMonth,   setNLeadsThisMonth]   = useState<number | null>(null)
  // Looker Studio URL — persiste en Firestore config/site
  const LOOKER_ENV = import.meta.env.VITE_LOOKER_STUDIO_URL as string | undefined
  const [lookerUrl,     setLookerUrl]     = useState(LOOKER_ENV ?? '')
  const [editingLooker, setEditingLooker] = useState(false)
  const [lookerInput,   setLookerInput]   = useState(LOOKER_ENV ?? '')
  const [savingLooker,  setSavingLooker]  = useState(false)
  const [guideOpen,     setGuideOpen]     = useState(false)

  const isMobile = useIsMobile()

  useEffect(() => {
    getArticulos().then(a => setNArticulos(a.length))
    getProyectos().then(p => setNProyectos(p.length))
    getPlanes().then(p => setNPlanes(p.length))
    getExtras().then(e => setNExtras(e.length))
    getTestimonios().then(t => setNTestimonios(t.length))
    getFaqs().then(f => setNFaqs(f.length))
    getPasos().then(p => setNPasos(p.length))
    getEquipo().then(e => setNEquipo(e.length))
    getLeads().then(leads => {
      setNLeads(leads.length)
      setNLeadsNuevos(leads.filter(l => l.estado === 'nuevo').length)
      // Leads del mes actual
      const now = new Date()
      const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      setNLeadsThisMonth(leads.filter(l => {
        const ts = l.createdAt as { seconds?: number } | string | null
        if (!ts) return false
        const date = typeof ts === 'string' ? new Date(ts)
          : ts.seconds ? new Date(ts.seconds * 1000) : null
        if (!date) return false
        const mes = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
        return mes === mesActual
      }).length)
    })
    // Clientes desde Firestore
    if (db) {
      getDocs(collection(db, 'clientes')).then(snap => {
        const clientes = snap.docs.map(d => d.data() as Cliente)
        setNClientesActivos(clientes.filter(c => c.estado === 'activo').length)
        setNPortalesActivos(clientes.filter(c => !!c.access_token).length)
        setNSolicitudesPend(clientes.reduce((sum, c) =>
          sum + (c.solicitudes ?? []).filter(s => s.estado === 'pendiente').length, 0
        ))
      }).catch(() => {})

      // Looker Studio URL guardada en Firestore (solo si no viene del env)
      if (!LOOKER_ENV) {
        getDoc(doc(db, 'config', 'site')).then(snap => {
          const url = snap.data()?.looker_studio_url as string | undefined
          if (url) { setLookerUrl(url); setLookerInput(url) }
        }).catch(() => {})
      }
    }
    // LOOKER_ENV es una constante de build (import.meta.env): nunca cambia entre
    // renders, así que declararla aquí no provoca re-ejecuciones.
  }, [LOOKER_ENV])

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'
  const fecha  = new Date().toLocaleDateString('es-CO', { weekday:'long', day:'numeric', month:'long' })

  const webCards: StatCard[] = [
    {
      label:     nLeadsNuevos ? `${nLeadsNuevos} nuevo${nLeadsNuevos !== 1 ? 's' : ''} · Kit Gratuito` : 'Kit Gratuito · Leads',
      value:     nLeads ?? '…',
      icon:      '🎯',
      color:     P,
      to:        '/admin/leads',
      action:    'Ver leads',
      highlight: (nLeadsNuevos ?? 0) > 0,
      tag:       (nLeadsNuevos ?? 0) > 0 ? `${nLeadsNuevos} nuevos` : 'Activo',
    },
    { label:'Artículos del blog',     value:nArticulos ?? '…', icon:'✍️',  color:PL,       to:'/admin/blog',       action:'Gestionar blog',  tag:'Activo' },
    { label:'Proyectos en portafolio',value:nProyectos ?? '…', icon:'🖼️',  color:'#7C3AED', to:'/admin/portafolio', action:'Portafolio',       tag:'Activo' },
    { label:`Planes (${nPlanes ?? '…'}) + Extras (${nExtras ?? '…'})`, value:nPlanes !== null && nExtras !== null ? nPlanes + nExtras : '…', icon:'💰', color:'#D97706', to:'/admin/precios', action:'Precios', tag:'Activo' },
    { label:`Proceso (${nPasos ?? '…'}) · Equipo (${nEquipo ?? '…'})`, value:nPasos !== null && nEquipo !== null ? nPasos + nEquipo : '…', icon:'📄', color:'#4A0E8F', to:'/admin/contenido', action:'Contenido', tag:'Activo' },
    { label:`Testimonios (${nTestimonios ?? '…'}) · FAQ (${nFaqs ?? '…'})`, value:nTestimonios !== null && nFaqs !== null ? nTestimonios + nFaqs : '…', icon:'⚙️', color:'#7C3AED', to:'/admin/config', action:'Config', tag:'Activo' },
  ]

  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh' }}>

        {/* ══ HERO BANNER ══════════════════════════════════════════ */}
        <div style={{
          background: `linear-gradient(135deg, ${DARK} 0%, ${DARK2} 50%, ${DARK3} 100%)`,
          padding: isMobile ? '28px 20px 32px' : '36px 40px 40px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Radial glow 1 */}
          <div style={{
            position:'absolute', top:'-80px', right:'-80px',
            width:'400px', height:'400px', pointerEvents:'none',
            background:`radial-gradient(ellipse, ${P}44 0%, transparent 65%)`,
          }} />
          {/* Radial glow 2 */}
          <div style={{
            position:'absolute', bottom:'-100px', left:'10%',
            width:'300px', height:'300px', pointerEvents:'none',
            background:`radial-gradient(ellipse, rgba(250,204,21,0.08) 0%, transparent 65%)`,
          }} />
          {/* Dot pattern */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none', opacity:0.04,
            backgroundImage:`radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize:'28px 28px',
          }} />

          <div style={{ position:'relative', zIndex:1, maxWidth:'1100px' }}>
            {/* Top row: saludo + fecha */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px', marginBottom:'20px' }}>
              <div>
                <p style={{ margin:'0 0 3px', fontSize:'12px', fontWeight:700, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'1.5px' }}>
                  {saludo}
                </p>
                <h1 style={{
                  margin:0, fontSize: isMobile ? '22px' : '28px',
                  fontWeight:900, color:'#fff', letterSpacing:'-0.5px', lineHeight:1.2,
                }}>
                  Panel Admin
                  <span style={{ background:`linear-gradient(90deg, ${Y}, #FDE68A)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginLeft:'10px' }}>
                    Alma
                  </span>
                </h1>
              </div>
              <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)', textTransform:'capitalize', flexShrink:0 }}>
                {fecha}
              </span>
            </div>

            {/* Quick stats chips */}
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {[
                { label:'Leads totales',  value: nLeads       ?? '…', color: P,        alert: (nLeadsNuevos ?? 0) > 0 },
                { label:'Nuevos leads',   value: nLeadsNuevos ?? '…', color: '#D97706', alert: (nLeadsNuevos ?? 0) > 0 },
                { label:'Artículos',      value: nArticulos   ?? '…', color: PL,        alert: false },
                { label:'Proyectos',      value: nProyectos   ?? '…', color: '#7C3AED', alert: false },
              ].map(chip => (
                <div key={chip.label} style={{
                  background: chip.alert ? `${chip.color}22` : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${chip.alert ? `${chip.color}55` : 'rgba(255,255,255,0.10)'}`,
                  borderRadius:'10px', padding:'8px 16px',
                  display:'flex', alignItems:'center', gap:'8px',
                  backdropFilter:'blur(8px)',
                }}>
                  <span style={{ fontSize:'16px', fontWeight:900, color: chip.alert ? chip.color : '#fff', lineHeight:1 }}>
                    {chip.value}
                  </span>
                  <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', fontWeight:600 }}>{chip.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient separator */}
          <div style={{ marginTop:'28px', position:'relative', zIndex:1 }}>
            <GradientBar />
          </div>
        </div>

        {/* ══ CONTENIDO ════════════════════════════════════════════ */}
        <div style={{ padding: isMobile ? '24px 16px' : '32px 40px', maxWidth:'1200px' }}>

          {/* ══ ANALYTICS ════════════════════════════════════════ */}
          <SectionTitle icon="📈" label="Analytics del Sitio" />

          {/* Quick internal stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? '10px' : '14px',
            marginBottom: '20px',
          }}>
            {[
              { icon:'👥', label:'Clientes activos',      value: nClientesActivos,  color:'#10B981', sub:'En servicio' },
              { icon:'🔑', label:'Portales activos',      value: nPortalesActivos,  color: PL,       sub:'Con acceso al portal' },
              { icon:'🎯', label:'Leads este mes',         value: nLeadsThisMonth,   color: P,        sub:'Nuevos registros' },
              { icon:'📩', label:'Solicitudes pendientes', value: nSolicitudesPend,  color:'#F59E0B', sub:'Sin respuesta' },
            ].map(k => (
              <div key={k.label} style={{
                background: DIM, borderRadius: '14px',
                border: `1px solid ${BDR}`,
                padding: isMobile ? '14px' : '18px 20px',
                boxShadow: '0 2px 8px rgba(107,33,168,0.05)',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background: `linear-gradient(90deg, ${k.color}, ${k.color}80)` }} />
                <div style={{ fontSize: isMobile ? '22px' : '26px', marginBottom:'6px' }}>{k.icon}</div>
                <p style={{ margin:'0 0 2px', fontSize: isMobile ? '26px' : '32px', fontWeight:900, color:WHT, lineHeight:1, letterSpacing:'-1px' }}>
                  {k.value ?? '…'}
                </p>
                <p style={{ margin:0, fontSize:'11px', color:MUT, lineHeight:1.3 }}>{k.label}</p>
                <p style={{ margin:'2px 0 0', fontSize:'10px', color: k.color, fontWeight:700 }}>{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Looker Studio / GA4 embed */}
          <div style={{
            background: DIM, borderRadius:'16px',
            border:`1px solid ${BDR}`,
            boxShadow:'0 2px 12px rgba(107,33,168,0.07)',
            overflow:'hidden', marginBottom:'36px',
          }}>
            {/* Header del panel */}
            <div style={{
              padding: isMobile ? '14px 16px' : '16px 24px',
              borderBottom:`1px solid ${BDR}`,
              display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'10px',
            }}>
              <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                <div style={{ width:'32px', height:'32px', borderRadius:'8px', background: BK, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'17px' }}>📊</div>
                <div>
                  <p style={{ margin:0, fontSize:'13px', fontWeight:800, color:WHT }}>Google Analytics 4 / Looker Studio</p>
                  <p style={{ margin:0, fontSize:'11px', color:MUT }}>
                    {lookerUrl ? 'Dashboard de tráfico embebido' : 'Pendiente de configuración'}
                  </p>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                {lookerUrl && !editingLooker && (
                  <a
                    href={lookerUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize:'11px', color: PL, fontWeight:700, textDecoration:'none', padding:'5px 12px', border:`1px solid ${PL}40`, borderRadius:'7px' }}
                  >
                    ↗ Abrir en nueva pestaña
                  </a>
                )}
                <button
                  onClick={() => { setEditingLooker(e => !e); setLookerInput(lookerUrl) }}
                  style={{
                    fontSize:'11px', fontWeight:700, cursor:'pointer',
                    padding:'5px 12px', borderRadius:'7px', border:'none',
                    background: editingLooker ? INPUT_BG : `${P}15`, color: editingLooker ? MUT : P,
                  }}
                >
                  {editingLooker ? '✕ Cancelar' : '✎ Configurar URL'}
                </button>
              </div>
            </div>

            {/* URL editor */}
            {editingLooker && (
              <div style={{ padding:'16px 24px', borderBottom:`1px solid ${BDR}`, background:INPUT_BG, display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
                <input
                  value={lookerInput}
                  onChange={e => setLookerInput(e.target.value)}
                  placeholder="https://lookerstudio.google.com/embed/reporting/..."
                  style={{
                    flex:1, minWidth:'280px', padding:'8px 12px',
                    border:`1px solid ${BDR2}`, borderRadius:'8px',
                    fontSize:'12px', outline:'none', color:WHT,
                    background: DIM,
                  }}
                />
                <button
                  disabled={savingLooker}
                  onClick={async () => {
                    setSavingLooker(true)
                    setLookerUrl(lookerInput)
                    try {
                      if (db) await updateDoc(doc(db, 'config', 'site'), { looker_studio_url: lookerInput })
                    } catch { /* silencioso */ }
                    setSavingLooker(false)
                    setEditingLooker(false)
                  }}
                  style={{
                    padding:'8px 18px', borderRadius:'8px', border:'none',
                    background:`linear-gradient(135deg,${P},${PL})`,
                    color:'#fff', fontWeight:700, fontSize:'12px', cursor:'pointer',
                    opacity: savingLooker ? 0.6 : 1,
                  }}
                >
                  {savingLooker ? 'Guardando...' : 'Guardar'}
                </button>
                <p style={{ width:'100%', margin:0, fontSize:'10px', color:MUT, lineHeight:1.5 }}>
                  💡 Para URL permanente agrega <code style={{ background:INPUT_BG, padding:'1px 5px', borderRadius:'4px', fontSize:'10px' }}>VITE_LOOKER_STUDIO_URL</code> en Vercel.
                </p>
              </div>
            )}

            {/* Iframe o setup guide */}
            {lookerUrl ? (
              <iframe
                src={lookerUrl}
                title="Analytics Dashboard"
                style={{ width:'100%', height: isMobile ? '420px' : '600px', border:'none', display:'block' }}
                allowFullScreen
              />
            ) : !guideOpen ? (
              /* Estado compacto: no ocupar media pantalla con la guía */
              <div style={{ padding: isMobile ? '20px' : '22px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'12px' }}>
                <p style={{ margin:0, fontSize:'13px', color:MUT, lineHeight:1.6, flex:1, minWidth:'220px' }}>
                  El tracking ya está activo en el código. Conecta tu informe de Looker Studio para ver el tráfico aquí.
                </p>
                <button
                  onClick={() => setGuideOpen(true)}
                  style={{
                    padding:'9px 18px', borderRadius:'10px', border:`1px solid ${P}30`,
                    background:`${P}10`, color:P, fontWeight:700, fontSize:'12.5px', cursor:'pointer',
                    flexShrink:0,
                  }}
                >
                  Ver guía de configuración →
                </button>
              </div>
            ) : (
              <div style={{ padding: isMobile ? '28px 20px' : '40px 32px' }}>
                <div style={{ maxWidth:'560px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:'10px' }}>
                    <p style={{ margin:'0 0 6px', fontSize:'15px', fontWeight:800, color:WHT }}>
                      Conecta Google Analytics 4 en 4 pasos
                    </p>
                    <button
                      onClick={() => setGuideOpen(false)}
                      style={{ background:'none', border:'none', color:MUT, fontSize:'18px', cursor:'pointer', lineHeight:1, padding:'2px' }}
                      aria-label="Cerrar guía"
                    >✕</button>
                  </div>
                  <p style={{ margin:'0 0 20px', fontSize:'13px', color:MUT, lineHeight:1.6 }}>
                    El tracking ya está activo en el código — solo necesitas crear el informe y pegar el enlace aquí.
                  </p>
                  {[
                    { n:'1', title:'Activa Analytics en Firebase Console', desc:'Firebase Console → tu proyecto → Analytics → "Comenzar" → esto crea una propiedad GA4 automáticamente.' },
                    { n:'2', title:'Agrega el Measurement ID', desc:'En GA4 → Admin → Flujos de datos → copia el ID (G-XXXXXXXXXX) → ponlo en Vercel como VITE_FIREBASE_MEASUREMENT_ID.' },
                    { n:'3', title:'Crea el informe en Looker Studio', desc:'Ve a lookerstudio.google.com → nuevo informe → conecta tu propiedad GA4.' },
                    { n:'4', title:'Copia el enlace de embed y pégalo arriba', desc:'Looker Studio → Archivo → Incorporar informe → habilitar → copiar URL.' },
                  ].map(step => (
                    <div key={step.n} style={{ display:'flex', gap:'12px', marginBottom:'14px', alignItems:'flex-start' }}>
                      <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:`${P}15`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900, color: P, flexShrink:0, marginTop:'1px' }}>
                        {step.n}
                      </div>
                      <div>
                        <p style={{ margin:'0 0 2px', fontSize:'13px', fontWeight:700, color:WHT }}>{step.title}</p>
                        <p style={{ margin:0, fontSize:'12px', color:MUT, lineHeight:1.5 }}>{step.desc}</p>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditingLooker(true)}
                    style={{
                      marginTop:'8px', padding:'10px 24px', borderRadius:'10px', border:'none',
                      background:`linear-gradient(135deg,${P},${PL})`,
                      color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer',
                      boxShadow:`0 3px 12px ${P}30`,
                    }}
                  >
                    Tengo el enlace → Configurar ahora
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Sección Página Web ── */}
          <SectionTitle icon="🌐" label="Página Web" />
          <div style={{
            display:'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: isMobile ? '10px' : '16px',
            marginBottom:'36px',
          }}>
            {webCards.map(c => <StatCardComp key={c.to} c={c} isMobile={isMobile} />)}
          </div>

          {/* ── Módulos de Negocio ── */}
          <SectionTitle icon="💼" label="Módulos de Negocio" />
          <div style={{
            display:'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: isMobile ? '10px' : '16px',
            marginBottom:'36px',
          }}>
            {BIZ_MODULES.map(m => {
              const isActive = m.badge === 'Activo'
              return (
                <div key={m.to} style={{
                  background: isActive ? DIM : 'rgba(255,255,255,0.55)',
                  borderRadius:'16px',
                  padding: isMobile ? '18px' : '22px',
                  border:`1px solid ${isActive ? BDR : BDR}`,
                  boxShadow: isActive ? '0 2px 12px rgba(107,33,168,0.07)' : 'none',
                  display:'flex', flexDirection:'column', gap:0,
                  opacity: isActive ? 1 : 0.65,
                }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
                    <div style={{
                      width:'44px', height:'44px', borderRadius:'12px',
                      background: isActive ? `${m.color}12` : INPUT_BG,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'22px',
                    }}>{m.icon}</div>
                    <span style={{
                      background: isActive ? `${m.color}15` : INPUT_BG,
                      color: isActive ? m.color : MUT,
                      fontSize:'10px', fontWeight:800,
                      padding:'3px 9px', borderRadius:'20px',
                      letterSpacing:'0.5px', textTransform:'uppercase',
                      border: isActive ? 'none' : `1px solid ${BDR}`,
                    }}>{m.badge}</span>
                  </div>
                  <p style={{ fontSize:'15px', fontWeight:800, color: isActive ? WHT : MUT, margin:'0 0 5px' }}>{m.title}</p>
                  <p style={{ fontSize:'12px', color:MUT, margin:'0 0 18px', lineHeight:1.55, flex:1 }}>{m.desc}</p>
                  <Link
                    to={m.to}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:'5px',
                      padding:'8px 16px',
                      background: isActive ? `linear-gradient(135deg, ${m.color}, ${m.color}CC)` : INPUT_BG,
                      color: isActive ? '#fff' : MUT,
                      borderRadius:'9px', textDecoration:'none',
                      fontSize:'12px', fontWeight:700,
                      alignSelf:'flex-start',
                      boxShadow: isActive ? `0 2px 10px ${m.color}30` : 'none',
                      transition:'opacity 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = '0.88')}
                    onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {m.cta} →
                  </Link>
                </div>
              )
            })}
          </div>

          {/* ── Acciones rápidas ── */}
          <SectionTitle icon="⚡" label="Acciones Rápidas" />
          <div style={{
            background:`linear-gradient(135deg, ${DARK} 0%, ${DARK2} 100%)`,
            borderRadius:'20px',
            padding: isMobile ? '20px 18px' : '26px 32px',
            border:`1px solid rgba(107,33,168,0.25)`,
            boxShadow:'0 4px 24px rgba(13,2,32,0.15)',
            position:'relative', overflow:'hidden',
          }}>
            {/* Glow */}
            <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'200px', height:'200px', background:`radial-gradient(ellipse, ${P}30 0%, transparent 65%)`, pointerEvents:'none' }} />

            <div style={{ position:'relative', zIndex:1 }}>
              <p style={{ fontSize:isMobile ? '14px' : '15px', fontWeight:800, color:'#fff', margin:'0 0 4px' }}>
                Publicar nuevo contenido
              </p>
              <p style={{ fontSize:'12.5px', color:'rgba(255,255,255,0.45)', margin:'0 0 20px' }}>
                Accesos rápidos para crear contenido.
              </p>
              <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
                <Link to="/admin/blog/nuevo" style={{
                  display:'inline-flex', alignItems:'center', gap:'6px',
                  background:`linear-gradient(135deg, ${P}, ${PL})`,
                  color:'#fff', padding:'10px 20px', borderRadius:'10px',
                  textDecoration:'none', fontWeight:700, fontSize:'13px',
                  boxShadow:`0 3px 12px ${P}40`,
                }}>
                  ✍️ Nuevo artículo
                </Link>
                <Link to="/admin/portafolio/nuevo" style={{
                  display:'inline-flex', alignItems:'center', gap:'6px',
                  background:`linear-gradient(135deg, #7C3AED, #A855F7)`,
                  color:'#fff', padding:'10px 20px', borderRadius:'10px',
                  textDecoration:'none', fontWeight:700, fontSize:'13px',
                  boxShadow:'0 3px 12px rgba(124,58,237,0.35)',
                }}>
                  🖼️ Nuevo proyecto
                </Link>
              </div>
            </div>
          </div>

          {/* Espacio final */}
          <div style={{ height:'40px' }} />
        </div>

      </div>
    </AdminLayout>
  )
}

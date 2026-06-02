import { useState, useEffect, useRef } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getClientes, updateCliente, getLegalDocsUrls, saveLegalDocsUrls } from '../../lib/db'
import type { LegalDocUrl } from '../../lib/db'
import type { Cliente } from '../../data/clientes'
import { CLIENTE_ESTADOS } from '../../data/clientes'

/* ── Paleta oscura ───────────────────────────────────────── */
const C1   = '#8A3FFC'
const BK   = '#08080B'
const DIM  = '#18181E'
const BDR  = '#2A2A33'
const BDR2 = '#3A3A44'
const MUT  = '#606080'
const WHT  = '#F1E8DA'
const ACC2 = '#A855F7'
const AMB  = '#FFB865'
const ROSE = '#FF4D8D'
const TEAL = '#2DD4BF'

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '4px', border: `0.5px solid ${BDR2}`,
  fontSize: '13px', color: WHT, background: '#1A1A22', outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '5px',
  fontSize: '10px', fontWeight: 700, color: MUT,
  textTransform: 'uppercase', letterSpacing: '0.5px',
}

/* ── Catálogo de documentos legales ─────────────────────── */
const LEGAL_DOCS: { key: string; num: string; titulo: string; desc: string; icon: string; color: string }[] = [
  { key: 'acuerdo_marco',   num: 'I',    icon: '📋', color: ACC2,  titulo: 'Acuerdo Marco de Servicios Digitales',      desc: 'Regula la relación comercial, operativa y jurídica entre ALMA y el cliente.' },
  { key: 'condiciones_gral',num: 'II',   icon: '📜', color: TEAL,  titulo: 'Condiciones Generales de Contratación',     desc: 'Cláusulas de alcance, revisiones, modificaciones y actualización de políticas.' },
  { key: 'datos_personales',num: 'III',  icon: '🔒', color: '#60A5FA', titulo: 'Política de Tratamiento de Datos Personales', desc: 'Conforme a Ley 1581 de 2012. Habeas Data, finalidades y medidas de seguridad.' },
  { key: 'cookies',         num: 'IV',   icon: '🍪', color: AMB,   titulo: 'Política de Cookies y Tecnologías de Rastreo', desc: 'Tipos de cookies, bases legales y gestión del consentimiento.' },
  { key: 'nda',             num: 'V',    icon: '🤫', color: ROSE,  titulo: 'Acuerdo de Confidencialidad (NDA)',          desc: 'NDA unilateral y bilateral para protección de información confidencial.' },
  { key: 'clausulas_esp',   num: 'VI',   icon: '⚡', color: '#F472B6', titulo: 'Cláusulas Especiales por Línea de Servicio', desc: 'Pauta, branding, diseño web, fotografía, IA y automatización.' },
  { key: 'propiedad_int',   num: 'VII',  icon: '©️',  color: '#34D399', titulo: 'Régimen de Propiedad Intelectual',           desc: 'Titularidad, cesión patrimonial, licencias y uso publicitario de ALMA.' },
  { key: 'firma_elect',     num: 'VIII', icon: '✍️',  color: '#A78BFA', titulo: 'Firma Electrónica y Mensajes de Datos',      desc: 'Validez jurídica conforme a Ley 527 de 1999. Formatos de aceptación digital.' },
  { key: 'anexo_a',         num: 'A',    icon: '📝', color: ACC2,  titulo: 'Anexo A — Orden de Servicio',                desc: 'Formato oficial para contratar proyectos: alcance, entregables y valor.' },
  { key: 'anexo_b',         num: 'B',    icon: '🔄', color: AMB,   titulo: 'Anexo B — Solicitud de Cambio (CR)',         desc: 'Formato para gestionar cambios de alcance durante la ejecución.' },
  { key: 'anexo_c',         num: 'C',    icon: '✅', color: TEAL,  titulo: 'Anexo C — Acta de Entrega',                  desc: 'Registro formal de entrega y recibo a satisfacción de los entregables.' },
]

/* ── Tipos para Orden de Servicio ───────────────────────── */
type Entregable = { descripcion: string; fecha: string; responsable: string }

const EMPTY_ORDEN = {
  numero: '',
  fecha: new Date().toISOString().split('T')[0],
  cliente_id: '',
  nombre_cliente: '',
  nit_cc: '',
  contacto: '',
  cargo: '',
  tipo_servicios: [] as string[],
  descripcion: '',
  entregables: [{ descripcion: '', fecha: '', responsable: 'ALMA' }] as Entregable[],
  valor: '',
  anticipo: '',
  saldo: '',
  notas: '',
  ciudad: 'Manizales',
}

type TabMain = 'contratos' | 'documentos' | 'orden'

/* ════════════════════════════════════════════════════════════ */
export default function ContratosAdmin() {
  const isMobile = useIsMobile()

  /* tabs principales */
  const [tab, setTab] = useState<TabMain>('contratos')

  /* ── CLIENTES ── */
  const [clientes,   setClientes]  = useState<Cliente[]>([])
  const [loading,    setLoading]   = useState(true)
  const [search,     setSearch]    = useState('')
  const [filterTab,  setFilterTab] = useState<'todos' | 'con' | 'sin'>('todos')
  const [editingId,  setEditingId] = useState<string | null>(null)
  const [editUrl,    setEditUrl]   = useState('')
  const [saving,     setSaving]    = useState(false)

  /* ── DOCUMENTOS ── */
  const [docUrls,     setDocUrls]    = useState<Record<string, string>>({})
  const [editingDoc,  setEditingDoc] = useState<string | null>(null)
  const [editDocUrl,  setEditDocUrl] = useState('')
  const [savingDoc,   setSavingDoc]  = useState(false)

  /* ── ORDEN ── */
  const [orden, setOrden] = useState({ ...EMPTY_ORDEN })
  const printRef = useRef<HTMLDivElement>(null)

  /* load */
  useEffect(() => {
    getClientes().then(d => { setClientes(d); setLoading(false) })
    getLegalDocsUrls().then(arr => {
      const map: Record<string, string> = {}
      arr.forEach(d => { map[d.key] = d.url })
      setDocUrls(map)
    })
  }, [])

  /* ── Pre-fill orden desde cliente ── */
  function selectClienteOrden(id: string) {
    const c = clientes.find(x => x._id === id)
    if (!c) { setOrden(o => ({ ...o, cliente_id: id })); return }
    setOrden(o => ({
      ...o,
      cliente_id:     id,
      nombre_cliente: c.nombre,
      contacto:       c.nombre,
      tipo_servicios: c.servicios ?? [],
      valor:          c.valor_contrato ?? '',
    }))
  }

  /* ── Stats contratos ── */
  const activos     = clientes.filter(c => c.estado === 'activo')
  const conContrato = clientes.filter(c => c.contrato_url?.trim())
  const sinContrato = clientes.filter(c => !c.contrato_url?.trim() && c.estado !== 'finalizado')

  const filtered = clientes.filter(c => {
    const ms = !search || c.nombre.toLowerCase().includes(search.toLowerCase()) || c.marca.toLowerCase().includes(search.toLowerCase())
    const mt = filterTab === 'todos' ? true : filterTab === 'con' ? !!c.contrato_url?.trim() : !c.contrato_url?.trim() && c.estado !== 'finalizado'
    return ms && mt
  })

  async function saveContratoUrl(c: Cliente) {
    if (!c._id) return
    setSaving(true)
    await updateCliente(c._id, { contrato_url: editUrl.trim() || undefined })
    setClientes(prev => prev.map(x => x._id === c._id ? { ...x, contrato_url: editUrl.trim() || undefined } : x))
    setEditingId(null); setSaving(false)
  }

  async function saveDocUrl(key: string) {
    setSavingDoc(true)
    const updated = { ...docUrls, [key]: editDocUrl.trim() }
    setDocUrls(updated)
    const arr: LegalDocUrl[] = Object.entries(updated).filter(([, v]) => v).map(([k, v]) => ({ key: k, url: v }))
    await saveLegalDocsUrls(arr)
    setEditingDoc(null); setSavingDoc(false)
  }

  /* ── Print orden ── */
  function printOrden() {
    const printContent = printRef.current?.innerHTML
    if (!printContent) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Orden de Servicio ${orden.numero}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Arial', sans-serif; font-size: 12px; color: #111; padding: 40px; }
        .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 20px; }
        .header h1 { font-size: 18px; font-weight: 900; letter-spacing: 2px; }
        .header p { font-size: 11px; color: #555; margin-top: 4px; }
        .os-title { font-size: 15px; font-weight: 700; text-align: center; margin-bottom: 20px; letter-spacing: 1px; border: 1.5px solid #111; padding: 8px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
        .field { border: 0.5px solid #ccc; padding: 7px 10px; border-radius: 2px; }
        .field label { font-size: 9px; text-transform: uppercase; letter-spacing: 0.8px; color: #888; display: block; margin-bottom: 2px; }
        .field span { font-size: 12px; font-weight: 600; color: #111; }
        .section-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #555; margin: 18px 0 8px; border-bottom: 0.5px solid #ccc; padding-bottom: 4px; }
        .desc-box { border: 0.5px solid #ccc; padding: 10px; min-height: 60px; border-radius: 2px; font-size: 12px; line-height: 1.6; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        th { background: #f5f5f5; text-align: left; padding: 6px 8px; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; border: 0.5px solid #ccc; }
        td { padding: 6px 8px; border: 0.5px solid #ccc; }
        .firma-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
        .firma-box { border-top: 1.5px solid #111; padding-top: 8px; }
        .firma-box p { font-size: 11px; color: #555; }
        .chips { display: flex; flex-wrap: wrap; gap: 4px; }
        .chip { background: #f0f0f0; padding: 2px 8px; border-radius: 3px; font-size: 10px; }
        .pago-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      </style>
      </head><body>${printContent}</body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  /* ════════════════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh', padding: isMobile ? '20px 16px' : '32px 36px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: `0.5px solid ${BDR}`, marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>Contratos</h1>
          </div>
          {tab === 'orden' && (
            <button onClick={printOrden} style={{ padding: '10px 22px', borderRadius: '4px', border: 'none', background: 'linear-gradient(135deg,#6E2DFF,#A855F7)', color: WHT, fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px' }}>
              🖨️ Imprimir / Guardar PDF
            </button>
          )}
        </div>

        {/* ── Main tabs ── */}
        <div style={{ display: 'flex', borderBottom: `0.5px solid ${BDR}`, marginBottom: '28px', gap: '0', overflowX: 'auto' }}>
          {([
            { key: 'contratos',  label: '📑 Contratos' },
            { key: 'documentos', label: `📚 Documentos (${LEGAL_DOCS.length})` },
            { key: 'orden',      label: '✍️ Nueva Orden' },
          ] as { key: TabMain; label: string }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '11px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? ACC2 : MUT,
              borderBottom: tab === t.key ? `1.5px solid ${ACC2}` : '1.5px solid transparent',
              whiteSpace: 'nowrap', letterSpacing: '0.05em', marginBottom: '-0.5px',
              transition: 'color 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ════════════ TAB: CONTRATOS ════════════ */}
        {tab === 'contratos' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
              {([
                { lbl: 'Total',        val: clientes.length,    sub: 'registrados',             col: WHT,  ico: '◈' },
                { lbl: 'Activos',      val: activos.length,     sub: 'en curso',                col: '#7ec8a0', ico: '✦' },
                { lbl: 'Con contrato', val: conContrato.length, sub: 'URL cargada',             col: ACC2, ico: '📑' },
                { lbl: 'Sin contrato', val: sinContrato.length, sub: 'pendiente',               col: sinContrato.length > 0 ? AMB : MUT, ico: '!' },
              ] as { lbl: string; val: number; sub: string; col: string; ico: string }[]).map(m => (
                <div key={m.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>{m.lbl}</p>
                  <p style={{ fontSize: '28px', fontWeight: 300, color: m.col, margin: '0 0 5px', lineHeight: 1 }}>{m.val}</p>
                  <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>{m.sub}</p>
                  <span style={{ position: 'absolute', bottom: 0, right: '10px', fontSize: '44px', color: '#1A1A22', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{m.ico}</span>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" style={{ flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, fontSize: '13px', outline: 'none', background: DIM, color: WHT }} />
              {(['todos', 'con', 'sin'] as const).map(t => (
                <button key={t} onClick={() => setFilterTab(t)} style={{ padding: '8px 16px', borderRadius: '4px', border: `0.5px solid ${filterTab === t ? C1 : BDR2}`, background: filterTab === t ? 'rgba(138,63,252,.15)' : 'transparent', color: filterTab === t ? ACC2 : MUT, fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {t === 'todos' ? 'Todos' : t === 'con' ? '✓ Con URL' : '⚠ Sin URL'}
                </button>
              ))}
            </div>

            {/* Lista */}
            {loading ? (
              <p style={{ color: MUT, textAlign: 'center', padding: '60px 0', fontSize: '13px' }}>Cargando…</p>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: '36px', color: BDR, marginBottom: '12px' }}>✦</div>
                <p style={{ color: MUT, fontSize: '13px' }}>Sin resultados.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {filtered.map(c => {
                  const isEditing = editingId === c._id
                  const hasUrl = !!c.contrato_url?.trim()
                  const est = CLIENTE_ESTADOS.find(x => x.value === c.estado)
                  return (
                    <div key={c._id} style={{ background: DIM, border: `0.5px solid ${isEditing ? C1 : BDR}`, borderLeft: `3px solid ${hasUrl ? ACC2 : ROSE}`, borderRadius: '6px', padding: '13px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', transition: 'border-color .2s' }}>
                      {/* Avatar */}
                      <div style={{ width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: hasUrl ? 'rgba(168,85,247,.12)' : 'rgba(255,77,141,.08)', border: `0.5px solid ${hasUrl ? '#6E2DFF' : ROSE}30`, fontSize: '13px', fontWeight: 600, color: hasUrl ? ACC2 : ROSE, overflow: 'hidden' }}>
                        {c.logo_url ? <img src={c.logo_url} alt={c.marca} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '3px' }} /> : c.marca.charAt(0).toUpperCase()}
                      </div>
                      {/* Info */}
                      <div style={{ minWidth: 0, flex: '0 0 auto', width: isMobile ? '100%' : '190px' }}>
                        <p style={{ margin: 0, fontSize: '13px', color: WHT, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.marca}</p>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '3px', alignItems: 'center' }}>
                          <span style={{ fontSize: '8px', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '2px', background: est?.bg ?? DIM, color: est?.color ?? MUT, border: `0.5px solid ${est?.color ?? BDR}22` }}>{est?.label ?? c.estado}</span>
                          {c.valor_contrato && <span style={{ fontSize: '10px', color: AMB, fontFamily: 'monospace' }}>{c.valor_contrato} {c.moneda ?? 'COP'}</span>}
                        </div>
                      </div>
                      {/* URL */}
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        {isEditing ? (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input autoFocus value={editUrl} onChange={e => setEditUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveContratoUrl(c); if (e.key === 'Escape') setEditingId(null) }} placeholder="https://drive.google.com/…" style={{ ...inputStyle, flex: 1 }} />
                            <button onClick={() => saveContratoUrl(c)} disabled={saving} style={{ padding: '8px 13px', borderRadius: '4px', border: 'none', background: C1, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>{saving ? '…' : '✓'}</button>
                            <button onClick={() => setEditingId(null)} style={{ padding: '8px 10px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}>✕</button>
                          </div>
                        ) : hasUrl ? (
                          <a href={c.contrato_url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: ACC2, textDecoration: 'none', wordBreak: 'break-all' }} onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                            {c.contrato_url!.length > 55 ? c.contrato_url!.slice(0, 52) + '…' : c.contrato_url}
                          </a>
                        ) : (
                          <span style={{ fontSize: '11px', color: MUT, fontStyle: 'italic' }}>Sin URL de contrato</span>
                        )}
                      </div>
                      {/* Acciones */}
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                        {hasUrl && !isEditing && (
                          <a href={c.contrato_url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', borderRadius: '3px', border: `0.5px solid #6E2DFF`, background: '#1a0d36', color: ACC2, fontSize: '10px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>📑 Ver</a>
                        )}
                        <button onClick={() => { setEditingId(c._id!); setEditUrl(c.contrato_url ?? '') }} style={{ padding: '6px 12px', borderRadius: '3px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all .15s' }} onMouseEnter={e => { e.currentTarget.style.borderColor = ACC2; e.currentTarget.style.color = ACC2 }} onMouseLeave={e => { e.currentTarget.style.borderColor = BDR2; e.currentTarget.style.color = MUT }}>
                          {hasUrl ? 'Editar' : '+ URL'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ════════════ TAB: DOCUMENTOS LEGALES ════════════ */}
        {tab === 'documentos' && (
          <div>
            <p style={{ fontSize: '12px', color: MUT, marginBottom: '24px', lineHeight: 1.6 }}>
              Paquete Jurídico Corporativo · Versión 1.0 · 2026 · Redacción jurídica colombiana.<br />
              Carga la URL de cada documento (Google Drive, Notion, web) para acceder rápidamente desde el panel.
            </p>

            {/* Sección principal */}
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUT, marginBottom: '12px' }}>Documentos principales</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px,1fr))', gap: '10px', marginBottom: '28px' }}>
              {LEGAL_DOCS.slice(0, 8).map(d => <DocCard key={d.key} doc={d} url={docUrls[d.key] ?? ''} isEditing={editingDoc === d.key} editUrl={editDocUrl} saving={savingDoc} onEdit={() => { setEditingDoc(d.key); setEditDocUrl(docUrls[d.key] ?? '') }} onSave={() => saveDocUrl(d.key)} onCancel={() => setEditingDoc(null)} onEditUrlChange={setEditDocUrl} />)}
            </div>

            {/* Anexos */}
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUT, marginBottom: '12px' }}>Anexos y formatos</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '10px' }}>
              {LEGAL_DOCS.slice(8).map(d => <DocCard key={d.key} doc={d} url={docUrls[d.key] ?? ''} isEditing={editingDoc === d.key} editUrl={editDocUrl} saving={savingDoc} onEdit={() => { setEditingDoc(d.key); setEditDocUrl(docUrls[d.key] ?? '') }} onSave={() => saveDocUrl(d.key)} onCancel={() => setEditingDoc(null)} onEditUrlChange={setEditDocUrl} />)}
            </div>
          </div>
        )}

        {/* ════════════ TAB: ORDEN DE SERVICIO ════════════ */}
        {tab === 'orden' && (
          <div>
            <p style={{ fontSize: '12px', color: MUT, marginBottom: '24px', lineHeight: 1.6 }}>
              Completa los campos y haz clic en <strong style={{ color: WHT }}>Imprimir / Guardar PDF</strong> para generar la Orden de Servicio.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>

              {/* ── Formulario izquierda ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMB, margin: '0 0 14px' }}>Datos de la orden</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={labelStyle}>No. de Orden<input value={orden.numero} onChange={e => setOrden(o => ({ ...o, numero: e.target.value }))} style={inputStyle} placeholder="001" /></label>
                    <label style={labelStyle}>Fecha<input type="date" value={orden.fecha} onChange={e => setOrden(o => ({ ...o, fecha: e.target.value }))} style={inputStyle} /></label>
                    <label style={{ ...labelStyle, gridColumn: '1 / -1' }}>
                      Cliente (opcional)
                      <select value={orden.cliente_id} onChange={e => selectClienteOrden(e.target.value)} style={inputStyle}>
                        <option value="">— Sin vincular —</option>
                        {clientes.map(c => <option key={c._id} value={c._id}>{c.marca} — {c.nombre}</option>)}
                      </select>
                    </label>
                  </div>
                </div>

                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEAL, margin: '0 0 14px' }}>Datos del cliente</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <label style={labelStyle}>Nombre / Empresa<input value={orden.nombre_cliente} onChange={e => setOrden(o => ({ ...o, nombre_cliente: e.target.value }))} style={inputStyle} placeholder="Nombre del cliente" /></label>
                      <label style={labelStyle}>NIT / CC<input value={orden.nit_cc} onChange={e => setOrden(o => ({ ...o, nit_cc: e.target.value }))} style={inputStyle} placeholder="900.000.000-0" /></label>
                      <label style={labelStyle}>Contacto<input value={orden.contacto} onChange={e => setOrden(o => ({ ...o, contacto: e.target.value }))} style={inputStyle} placeholder="Nombre contacto" /></label>
                      <label style={labelStyle}>Cargo<input value={orden.cargo} onChange={e => setOrden(o => ({ ...o, cargo: e.target.value }))} style={inputStyle} placeholder="Gerente / Fundador" /></label>
                    </div>
                  </div>
                </div>

                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACC2, margin: '0 0 14px' }}>Tipo de servicio</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {['Marketing', 'Branding', 'Web', 'IA / Automatización', 'Diseño', 'Fotografía', 'Video', 'Otro'].map(s => {
                      const active = orden.tipo_servicios.includes(s)
                      return (
                        <button key={s} onClick={() => setOrden(o => ({ ...o, tipo_servicios: active ? o.tipo_servicios.filter(x => x !== s) : [...o.tipo_servicios, s] }))} style={{ padding: '5px 11px', borderRadius: '20px', border: `1.5px solid ${active ? C1 : BDR2}`, background: active ? 'rgba(138,63,252,.15)' : 'transparent', color: active ? ACC2 : MUT, fontSize: '11px', fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'all .15s' }}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#60A5FA', margin: '0 0 14px' }}>Descripción del proyecto</p>
                  <textarea value={orden.descripcion} onChange={e => setOrden(o => ({ ...o, descripcion: e.target.value }))} rows={5} placeholder="Describe el alcance, objetivos y particularidades del proyecto…" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMB, margin: '0 0 14px' }}>Valor y forma de pago</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <label style={labelStyle}>Valor total<input value={orden.valor} onChange={e => setOrden(o => ({ ...o, valor: e.target.value }))} style={inputStyle} placeholder="$0 COP" /></label>
                    <label style={labelStyle}>Anticipo (50%)<input value={orden.anticipo} onChange={e => setOrden(o => ({ ...o, anticipo: e.target.value }))} style={inputStyle} placeholder="$0 COP" /></label>
                    <label style={labelStyle}>Saldo<input value={orden.saldo} onChange={e => setOrden(o => ({ ...o, saldo: e.target.value }))} style={inputStyle} placeholder="$0 COP" /></label>
                  </div>
                </div>
              </div>

              {/* ── Entregables + notas derecha ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEAL, margin: 0 }}>Cronograma de entregables</p>
                    <button onClick={() => setOrden(o => ({ ...o, entregables: [...o.entregables, { descripcion: '', fecha: '', responsable: 'ALMA' }] }))} style={{ padding: '4px 10px', borderRadius: '3px', border: `0.5px solid ${TEAL}`, background: 'transparent', color: TEAL, cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>+ Agregar</button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {orden.entregables.map((e, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '8px', alignItems: 'center' }}>
                        <input value={e.descripcion} onChange={ev => setOrden(o => ({ ...o, entregables: o.entregables.map((x, j) => j === i ? { ...x, descripcion: ev.target.value } : x) }))} style={{ ...inputStyle }} placeholder={`Entregable ${i + 1}`} />
                        <input type="date" value={e.fecha} onChange={ev => setOrden(o => ({ ...o, entregables: o.entregables.map((x, j) => j === i ? { ...x, fecha: ev.target.value } : x) }))} style={{ ...inputStyle, width: '130px' }} />
                        <input value={e.responsable} onChange={ev => setOrden(o => ({ ...o, entregables: o.entregables.map((x, j) => j === i ? { ...x, responsable: ev.target.value } : x) }))} style={{ ...inputStyle, width: '80px' }} placeholder="Resp." />
                        {orden.entregables.length > 1 && (
                          <button onClick={() => setOrden(o => ({ ...o, entregables: o.entregables.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: ROSE, cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '4px' }}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>Notas / Cláusulas adicionales</p>
                  <textarea value={orden.notas} onChange={e => setOrden(o => ({ ...o, notas: e.target.value }))} rows={4} placeholder="Condiciones especiales, restricciones, acuerdos adicionales…" style={{ ...inputStyle, resize: 'vertical' }} />
                </div>

                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>Ciudad</p>
                  <input value={orden.ciudad} onChange={e => setOrden(o => ({ ...o, ciudad: e.target.value }))} style={{ ...inputStyle, maxWidth: '200px' }} />
                </div>

                <button onClick={() => setOrden({ ...EMPTY_ORDEN })} style={{ padding: '10px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  🗑 Limpiar formulario
                </button>
              </div>
            </div>

            {/* ── Vista previa imprimible (oculta) ── */}
            <div ref={printRef} style={{ display: 'none' }}>
              <div className="header">
                <h1>ALMA AGENCIA CREATIVA S.A.S.</h1>
                <p>Manizales, Caldas, Colombia · contacto@almaagenciacreativa.com</p>
              </div>
              <div className="os-title">ORDEN DE SERVICIO No. {orden.numero || '___'}</div>
              <div className="grid2">
                <div className="field"><label>Fecha</label><span>{orden.fecha || '___'}</span></div>
                <div className="field"><label>Ciudad</label><span>{orden.ciudad}</span></div>
                <div className="field"><label>Cliente / Empresa</label><span>{orden.nombre_cliente || '___'}</span></div>
                <div className="field"><label>NIT / CC</label><span>{orden.nit_cc || '___'}</span></div>
                <div className="field"><label>Contacto</label><span>{orden.contacto || '___'}</span></div>
                <div className="field"><label>Cargo</label><span>{orden.cargo || '___'}</span></div>
              </div>
              <div className="field" style={{ marginBottom: '12px' }}>
                <label>Tipo de servicio</label>
                <div className="chips" style={{ marginTop: '4px' }}>
                  {orden.tipo_servicios.length > 0 ? orden.tipo_servicios.map(s => <span key={s} className="chip">{s}</span>) : <span style={{ fontSize: '11px', color: '#888' }}>—</span>}
                </div>
              </div>
              <p className="section-title">Descripción del proyecto y alcance</p>
              <div className="desc-box">{orden.descripcion || '—'}</div>
              <p className="section-title">Cronograma de entregables</p>
              <table>
                <thead><tr><th>#</th><th>Entregable</th><th>Fecha estimada</th><th>Responsable</th></tr></thead>
                <tbody>
                  {orden.entregables.map((e, i) => (
                    <tr key={i}><td>{i + 1}</td><td>{e.descripcion || '—'}</td><td>{e.fecha || '—'}</td><td>{e.responsable}</td></tr>
                  ))}
                </tbody>
              </table>
              <p className="section-title">Valor y forma de pago</p>
              <div className="pago-grid">
                <div className="field"><label>Valor total del proyecto</label><span>{orden.valor || '___'}</span></div>
                <div className="field"><label>Anticipo (50%) — al inicio</label><span>{orden.anticipo || '___'}</span></div>
                <div className="field"><label>Saldo — contra entrega</label><span>{orden.saldo || '___'}</span></div>
              </div>
              {orden.notas && (<><p className="section-title">Notas y cláusulas adicionales</p><div className="desc-box">{orden.notas}</div></>)}
              <div className="firma-grid">
                <div className="firma-box"><p><strong>ALMA AGENCIA CREATIVA S.A.S.</strong></p><p style={{ marginTop: '32px' }}>_________________________________</p><p>Firma autorizada</p><p>C.C. / NIT: ___________________________</p><p>Cargo: ________________________________</p><p>Ciudad y fecha: {orden.ciudad}, {orden.fecha}</p></div>
                <div className="firma-box"><p><strong>EL CLIENTE</strong></p><p style={{ marginTop: '32px' }}>_________________________________</p><p>Firma del cliente</p><p>C.C. / NIT: {orden.nit_cc || '___'}</p><p>Cargo: {orden.cargo || '___'}</p><p>Ciudad y fecha: {orden.ciudad}, {orden.fecha}</p></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

/* ── DocCard ─────────────────────────────────────────────── */
function DocCard({ doc, url, isEditing, editUrl, saving, onEdit, onSave, onCancel, onEditUrlChange }: {
  doc: typeof LEGAL_DOCS[0]
  url: string
  isEditing: boolean
  editUrl: string
  saving: boolean
  onEdit: () => void
  onSave: () => void
  onCancel: () => void
  onEditUrlChange: (v: string) => void
}) {
  return (
    <div style={{ background: DIM, border: `0.5px solid ${isEditing ? doc.color : BDR}`, borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'border-color .2s' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: `${doc.color}18`, border: `0.5px solid ${doc.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>
          {doc.icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, color: doc.color, letterSpacing: '0.15em' }}>{doc.num}</span>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: WHT }}>{doc.titulo}</p>
          </div>
          <p style={{ margin: 0, fontSize: '11px', color: MUT, lineHeight: 1.5 }}>{doc.desc}</p>
        </div>
      </div>
      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px' }}>
          <input autoFocus value={editUrl} onChange={e => onEditUrlChange(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel() }} placeholder="https://drive.google.com/…" style={{ ...inputStyleLocal, flex: 1 }} />
          <button onClick={onSave} disabled={saving} style={{ padding: '7px 12px', borderRadius: '4px', border: 'none', background: doc.color, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>{saving ? '…' : '✓'}</button>
          <button onClick={onCancel} style={{ padding: '7px 9px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '13px', flexShrink: 0 }}>✕</button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {url ? (
            <>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, fontSize: '11px', color: doc.color, textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')} onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}>
                {url.length > 45 ? url.slice(0, 42) + '…' : url}
              </a>
              <button onClick={onEdit} style={{ padding: '5px 10px', borderRadius: '3px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', flexShrink: 0 }}>Editar</button>
            </>
          ) : (
            <button onClick={onEdit} style={{ padding: '6px 14px', borderRadius: '3px', border: `0.5px solid ${doc.color}60`, background: 'transparent', color: doc.color, cursor: 'pointer', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>+ Cargar URL</button>
          )}
        </div>
      )}
    </div>
  )
}

const inputStyleLocal: React.CSSProperties = {
  padding: '8px 11px', borderRadius: '4px', border: `0.5px solid ${BDR2}`,
  fontSize: '12px', color: WHT, background: '#1A1A22', outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

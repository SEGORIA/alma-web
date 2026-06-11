import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getClientes, updateCliente, getLegalDocsUrls, saveLegalDocsUrls } from '../../lib/db'
import type { LegalDocUrl } from '../../lib/db'
import type { Cliente } from '../../data/clientes'
import { CLIENTE_ESTADOS } from '../../data/clientes'
import { ListSkeleton } from '../../components/admin/Loading'
import { ADM } from '../../lib/adminTheme'

const { BK, DIM, BDR, BDR2, MUT, WHT, C1, C1_BG, ACC2, ROSE, AMB, TEAL, GRN, BLUE, INPUT_BG, GHOST, SOFT } = ADM

/* ── Paleta oscura ───────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '4px', border: `0.5px solid ${BDR2}`,
  fontSize: '13px', color: WHT, background: INPUT_BG, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

/* ── Catálogo de documentos legales ─────────────────────── */
const LEGAL_DOCS: { key: string; num: string; titulo: string; desc: string; icon: string; color: string }[] = [
  { key: 'acuerdo_marco',   num: 'I',    icon: '📋', color: ACC2,  titulo: 'Acuerdo Marco de Servicios Digitales',      desc: 'Regula la relación comercial, operativa y jurídica entre ALMA y el cliente.' },
  { key: 'condiciones_gral',num: 'II',   icon: '📜', color: TEAL,  titulo: 'Condiciones Generales de Contratación',     desc: 'Cláusulas de alcance, revisiones, modificaciones y actualización de políticas.' },
  { key: 'datos_personales',num: 'III',  icon: '🔒', color: BLUE, titulo: 'Política de Tratamiento de Datos Personales', desc: 'Conforme a Ley 1581 de 2012. Habeas Data, finalidades y medidas de seguridad.' },
  { key: 'cookies',         num: 'IV',   icon: '🍪', color: AMB,   titulo: 'Política de Cookies y Tecnologías de Rastreo', desc: 'Tipos de cookies, bases legales y gestión del consentimiento.' },
  { key: 'nda',             num: 'V',    icon: '🤫', color: ROSE,  titulo: 'Acuerdo de Confidencialidad (NDA)',          desc: 'NDA unilateral y bilateral para protección de información confidencial.' },
  { key: 'clausulas_esp',   num: 'VI',   icon: '⚡', color: '#DB2777', titulo: 'Cláusulas Especiales por Línea de Servicio', desc: 'Pauta, branding, diseño web, fotografía, IA y automatización.' },
  { key: 'propiedad_int',   num: 'VII',  icon: '©️',  color: '#059669', titulo: 'Régimen de Propiedad Intelectual',           desc: 'Titularidad, cesión patrimonial, licencias y uso publicitario de ALMA.' },
  { key: 'firma_elect',     num: 'VIII', icon: '✍️',  color: C1, titulo: 'Firma Electrónica y Mensajes de Datos',      desc: 'Validez jurídica conforme a Ley 527 de 1999. Formatos de aceptación digital.' },
  { key: 'anexo_a',         num: 'A',    icon: '📝', color: ACC2,  titulo: 'Anexo A — Orden de Servicio',                desc: 'Formato oficial para contratar proyectos: alcance, entregables y valor.' },
  { key: 'anexo_b',         num: 'B',    icon: '🔄', color: AMB,   titulo: 'Anexo B — Solicitud de Cambio (CR)',         desc: 'Formato para gestionar cambios de alcance durante la ejecución.' },
  { key: 'anexo_c',         num: 'C',    icon: '✅', color: TEAL,  titulo: 'Anexo C — Acta de Entrega',                  desc: 'Registro formal de entrega y recibo a satisfacción de los entregables.' },
]

type TabMain = 'contratos' | 'documentos'

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

  /* load */
  useEffect(() => {
    getClientes().then(d => { setClientes(d); setLoading(false) })
    getLegalDocsUrls().then(arr => {
      const map: Record<string, string> = {}
      arr.forEach(d => { map[d.key] = d.url })
      setDocUrls(map)
    })
  }, [])

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
        </div>

        {/* ── Main tabs ── */}
        <div style={{ display: 'flex', borderBottom: `0.5px solid ${BDR}`, marginBottom: '28px', gap: '0', overflowX: 'auto' }}>
          {([
            { key: 'contratos',  label: '📑 Contratos' },
            { key: 'documentos', label: `📚 Documentos (${LEGAL_DOCS.length})` },
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
                { lbl: 'Activos',      val: activos.length,     sub: 'en curso',                col: GRN, ico: '✦' },
                { lbl: 'Con contrato', val: conContrato.length, sub: 'URL cargada',             col: ACC2, ico: '📑' },
                { lbl: 'Sin contrato', val: sinContrato.length, sub: 'pendiente',               col: sinContrato.length > 0 ? AMB : MUT, ico: '!' },
              ] as { lbl: string; val: number; sub: string; col: string; ico: string }[]).map(m => (
                <div key={m.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>{m.lbl}</p>
                  <p style={{ fontSize: '28px', fontWeight: 300, color: m.col, margin: '0 0 5px', lineHeight: 1 }}>{m.val}</p>
                  <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>{m.sub}</p>
                  <span style={{ position: 'absolute', bottom: 0, right: '10px', fontSize: '44px', color: GHOST, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{m.ico}</span>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…" style={{ flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, fontSize: '13px', outline: 'none', background: DIM, color: WHT }} />
              {(['todos', 'con', 'sin'] as const).map(t => (
                <button key={t} onClick={() => setFilterTab(t)} style={{ padding: '8px 16px', borderRadius: '4px', border: `0.5px solid ${filterTab === t ? C1 : BDR2}`, background: filterTab === t ? C1_BG : 'transparent', color: filterTab === t ? ACC2 : MUT, fontSize: '11px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  {t === 'todos' ? 'Todos' : t === 'con' ? '✓ Con URL' : '⚠ Sin URL'}
                </button>
              ))}
            </div>

            {/* Lista */}
            {loading ? (
              <ListSkeleton rows={5} />
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
                          <a href={c.contrato_url} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', borderRadius: '3px', border: `0.5px solid #6E2DFF`, background: SOFT, color: ACC2, fontSize: '10px', fontWeight: 700, textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>📑 Ver</a>
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
  fontSize: '12px', color: WHT, background: INPUT_BG, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

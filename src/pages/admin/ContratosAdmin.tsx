import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getClientes, updateCliente } from '../../lib/db'
import type { Cliente } from '../../data/clientes'
import { CLIENTE_ESTADOS } from '../../data/clientes'

/* ── Paleta oscura (igual que ClientesAdmin) ─────────────── */
const C1    = '#8A3FFC'
const BK    = '#08080B'
const DIM   = '#18181E'
const BDR   = '#2A2A33'
const BDR2  = '#3A3A44'
const MUT   = '#606080'
const WHT   = '#F1E8DA'
const ACC2  = '#A855F7'
const AMB   = '#FFB865'
const ROSE  = '#FF4D8D'

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '4px', border: `0.5px solid ${BDR2}`,
  fontSize: '13px', color: WHT, background: '#1A1A22', outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

/* ── Helpers ─────────────────────────────────────────────── */
function estadoChip(estado: Cliente['estado']) {
  const e = CLIENTE_ESTADOS.find(x => x.value === estado)
  return (
    <span style={{
      fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase',
      padding: '2px 7px', borderRadius: '2px',
      background: e?.bg ?? '#18181E', color: e?.color ?? MUT,
      border: `0.5px solid ${e?.color ?? BDR}22`,
      flexShrink: 0,
    }}>
      {e?.label ?? estado}
    </span>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function ContratosAdmin() {
  const isMobile = useIsMobile()

  const [clientes,    setClientes]   = useState<Cliente[]>([])
  const [loading,     setLoading]    = useState(true)
  const [search,      setSearch]     = useState('')
  const [filterTab,   setFilterTab]  = useState<'todos' | 'con' | 'sin'>('todos')

  /* edición inline de URL */
  const [editingId,   setEditingId]  = useState<string | null>(null)
  const [editUrl,     setEditUrl]    = useState('')
  const [saving,      setSaving]     = useState(false)

  useEffect(() => {
    getClientes().then(d => { setClientes(d); setLoading(false) })
  }, [])

  /* ── stats ── */
  const activos    = clientes.filter(c => c.estado === 'activo')
  const conContrato= clientes.filter(c => c.contrato_url?.trim())
  const sinContrato= clientes.filter(c => !c.contrato_url?.trim() && c.estado !== 'finalizado')

  /* ── filtro ── */
  const filtered = clientes.filter(c => {
    const matchSearch = !search ||
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.marca.toLowerCase().includes(search.toLowerCase())
    const matchTab =
      filterTab === 'todos' ? true :
      filterTab === 'con'   ? !!c.contrato_url?.trim() :
      /* sin */               !c.contrato_url?.trim() && c.estado !== 'finalizado'
    return matchSearch && matchTab
  })

  /* ── save inline ── */
  async function saveUrl(c: Cliente) {
    if (!c._id) return
    setSaving(true)
    await updateCliente(c._id, { contrato_url: editUrl.trim() || undefined })
    setClientes(prev => prev.map(x => x._id === c._id ? { ...x, contrato_url: editUrl.trim() || undefined } : x))
    setEditingId(null)
    setSaving(false)
  }

  /* ══ RENDER ═══════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh', padding: isMobile ? '20px 16px' : '32px 36px' }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '20px', borderBottom: `0.5px solid ${BDR}`, marginBottom: '28px',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>
              ALMA · AGENCIA CREATIVA
            </p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>
              Contratos
            </h1>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
          {([
            { lbl: 'Total clientes',  val: clientes.length,    sub: 'registrados',              col: WHT,  ico: '◈' },
            { lbl: 'Activos',         val: activos.length,     sub: 'en curso',                 col: '#7ec8a0', ico: '✦' },
            { lbl: 'Con contrato',    val: conContrato.length, sub: 'URL de contrato cargada',  col: ACC2, ico: '📑' },
            { lbl: 'Sin contrato',    val: sinContrato.length, sub: 'pendiente de agregar',     col: sinContrato.length > 0 ? AMB : MUT, ico: '!' },
          ] as { lbl: string; val: number; sub: string; col: string; ico: string }[]).map(m => (
            <div key={m.lbl} style={{
              background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px',
              padding: '18px 18px 14px', position: 'relative', overflow: 'hidden',
            }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>
                {m.lbl}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 300, color: m.col, margin: '0 0 5px', lineHeight: 1 }}>
                {m.val}
              </p>
              <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>{m.sub}</p>
              <span style={{ position: 'absolute', bottom: 0, right: '10px', fontSize: '44px', color: '#1A1A22', lineHeight: 1, fontWeight: 300, userSelect: 'none', pointerEvents: 'none' }}>
                {m.ico}
              </span>
            </div>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o marca…"
            style={{ flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, fontSize: '13px', outline: 'none', background: DIM, color: WHT }}
          />
          {(['todos', 'con', 'sin'] as const).map(t => (
            <button key={t} onClick={() => setFilterTab(t)} style={{
              padding: '8px 18px', borderRadius: '4px', border: `0.5px solid ${filterTab === t ? C1 : BDR2}`,
              background: filterTab === t ? 'rgba(138,63,252,0.15)' : 'transparent',
              color: filterTab === t ? ACC2 : MUT,
              fontSize: '11px', fontWeight: 700, cursor: 'pointer',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {t === 'todos' ? 'Todos' : t === 'con' ? '✓ Con contrato' : '⚠ Sin contrato'}
            </button>
          ))}
        </div>

        {/* ── Lista ── */}
        {loading ? (
          <p style={{ color: MUT, fontSize: '13px', textAlign: 'center', padding: '60px 0' }}>Cargando…</p>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px', color: BDR }}>✦</div>
            <p style={{ color: MUT, fontSize: '13px' }}>Sin resultados.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {filtered.map(c => {
              const isEditing = editingId === c._id
              const hasUrl    = !!c.contrato_url?.trim()

              return (
                <div key={c._id} style={{
                  background: DIM,
                  border: `0.5px solid ${isEditing ? C1 : hasUrl ? BDR : BDR}`,
                  borderLeft: `3px solid ${hasUrl ? ACC2 : ROSE}`,
                  borderRadius: '6px',
                  padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
                  transition: 'border-color 0.2s',
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: hasUrl ? 'rgba(168,85,247,0.15)' : 'rgba(255,77,141,0.1)',
                    border: `0.5px solid ${hasUrl ? '#6E2DFF' : ROSE}30`,
                    fontSize: '15px', fontWeight: 600, color: hasUrl ? ACC2 : ROSE,
                    overflow: 'hidden',
                  }}>
                    {c.logo_url
                      ? <img src={c.logo_url} alt={c.marca} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }} />
                      : c.marca.charAt(0).toUpperCase()
                    }
                  </div>

                  {/* Nombre + estado */}
                  <div style={{ minWidth: 0, flex: '0 0 auto', width: isMobile ? '100%' : '200px' }}>
                    <p style={{ margin: 0, fontSize: '13px', color: WHT, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {c.marca}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      {estadoChip(c.estado)}
                      {c.valor_contrato && (
                        <span style={{ fontSize: '10px', color: AMB, fontFamily: 'monospace' }}>
                          {c.valor_contrato} {c.moneda ?? 'COP'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* URL / editor */}
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input
                          autoFocus
                          value={editUrl}
                          onChange={e => setEditUrl(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveUrl(c); if (e.key === 'Escape') setEditingId(null) }}
                          placeholder="https://drive.google.com/…"
                          style={{ ...inputStyle, flex: 1 }}
                        />
                        <button
                          onClick={() => saveUrl(c)}
                          disabled={saving}
                          style={{ padding: '8px 14px', borderRadius: '4px', border: 'none', background: C1, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}
                        >
                          {saving ? '…' : '✓'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{ padding: '8px 10px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '14px', flexShrink: 0 }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : hasUrl ? (
                      <a
                        href={c.contrato_url} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '12px', color: ACC2, textDecoration: 'none', wordBreak: 'break-all', display: 'block' }}
                        onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                      >
                        {c.contrato_url!.length > 60 ? c.contrato_url!.slice(0, 57) + '…' : c.contrato_url}
                      </a>
                    ) : (
                      <span style={{ fontSize: '11px', color: MUT, fontStyle: 'italic' }}>Sin URL de contrato</span>
                    )}
                  </div>

                  {/* Acciones */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    {hasUrl && !isEditing && (
                      <a
                        href={c.contrato_url} target="_blank" rel="noopener noreferrer"
                        style={{
                          padding: '6px 12px', borderRadius: '3px',
                          border: `0.5px solid #6E2DFF`, background: '#1a0d36',
                          color: ACC2, fontSize: '10px', fontWeight: 700,
                          textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase',
                          display: 'flex', alignItems: 'center', gap: '4px',
                        }}
                      >
                        📑 Ver
                      </a>
                    )}
                    <button
                      onClick={() => { setEditingId(c._id!); setEditUrl(c.contrato_url ?? '') }}
                      style={{
                        padding: '6px 12px', borderRadius: '3px',
                        border: `0.5px solid ${BDR2}`, background: 'transparent',
                        color: isEditing ? ACC2 : MUT, cursor: 'pointer',
                        fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = ACC2; e.currentTarget.style.color = ACC2 }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = BDR2; e.currentTarget.style.color = MUT }}
                    >
                      {hasUrl ? 'Editar' : '+ Agregar'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

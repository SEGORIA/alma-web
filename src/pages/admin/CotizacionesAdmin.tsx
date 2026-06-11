import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  getClientes, getCotizaciones, saveCotizacion, updateCotizacion, deleteCotizacion,
} from '../../lib/db'
import type { Cotizacion, CotizacionItem } from '../../lib/db'
import type { Cliente } from '../../data/clientes'
import { confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import { ADM } from '../../lib/adminTheme'

const { BK, DIM, BDR, BDR2, MUT, WHT, C1, ACC2, ROSE, AMB, TEAL, GRN, INPUT_BG, GHOST } = ADM

/* ── Paleta ─────────────────────────────────────────────── */

/* ── Helpers ────────────────────────────────────────────── */
const fmtCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const today = () => new Date().toISOString().split('T')[0]
const in30   = () => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString().split('T')[0] }
const uid    = () => Math.random().toString(36).slice(2, 9)

const ESTADOS: { key: Cotizacion['estado']; label: string; color: string }[] = [
  { key: 'borrador',  label: 'Borrador',  color: MUT   },
  { key: 'enviada',   label: 'Enviada',   color: AMB   },
  { key: 'aprobada',  label: 'Aprobada',  color: GRN   },
  { key: 'rechazada', label: 'Rechazada', color: ROSE  },
  { key: 'vencida',   label: 'Vencida',   color: '#64748B' },
]

const estadoColor = (e: Cotizacion['estado']) => ESTADOS.find(x => x.key === e)?.color ?? MUT
const estadoLabel = (e: Cotizacion['estado']) => ESTADOS.find(x => x.key === e)?.label ?? e

const iStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '4px', border: `0.5px solid ${BDR2}`,
  fontSize: '13px', color: WHT, background: INPUT_BG, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
const lbStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '5px',
  fontSize: '10px', fontWeight: 700, color: MUT,
  textTransform: 'uppercase', letterSpacing: '0.5px',
}

/* ── Vacío ──────────────────────────────────────────────── */
const EMPTY_COT = (): Omit<Cotizacion, '_id'> => ({
  numero:          `COT-${new Date().getFullYear()}-`,
  clienteId:       '',
  clienteNombre:   '',
  clienteEmail:    '',
  clienteEmpresa:  '',
  clienteNit:      '',
  fecha:           today(),
  validaHasta:     in30(),
  estado:          'borrador',
  items:           [{ id: uid(), descripcion: '', cantidad: 1, precioUnit: 0, subtotal: 0 }],
  iva:             false,
  ivaPct:          19,
  subtotal:        0,
  total:           0,
  notas:           '',
})

/* ════════════════════════════════════════════════════════ */
export default function CotizacionesAdmin() {
  const isMobile = useIsMobile()

  const [view,     setView]     = useState<'list' | 'form'>('list')
  const [editId,   setEditId]   = useState<string | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cots,     setCots]     = useState<Cotizacion[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [filter,   setFilter]   = useState<Cotizacion['estado'] | 'todos'>('todos')
  const [search,   setSearch]   = useState('')
  const [form,     setForm]     = useState<Omit<Cotizacion, '_id'>>(EMPTY_COT())

  useEffect(() => {
    Promise.all([getClientes(), getCotizaciones()]).then(([cl, co]) => {
      setClientes(cl)
      setCots(co)
      setLoading(false)
    })
  }, [])

  /* ── Calcular totales al cambiar items / iva ── */
  useEffect(() => {
    const sub = form.items.reduce((s, i) => s + i.subtotal, 0)
    const tot = form.iva ? sub + sub * (form.ivaPct / 100) : sub
    setForm(f => ({ ...f, subtotal: sub, total: tot }))
  }, [form.items, form.iva, form.ivaPct]) // eslint-disable-line

  /* ── Seleccionar cliente ── */
  function selectCliente(id: string) {
    const c = clientes.find(x => x._id === id)
    if (!c) return
    setForm(f => ({
      ...f,
      clienteId:      id,
      clienteNombre:  c.nombre,
      clienteEmail:   c.email ?? '',
      clienteEmpresa: c.empresa ?? c.marca,
    }))
  }

  /* ── Manejar item ── */
  function updateItem(idx: number, field: keyof CotizacionItem, val: string | number) {
    setForm(f => {
      const items = f.items.map((it, i) => {
        if (i !== idx) return it
        const updated = { ...it, [field]: val }
        updated.subtotal = (updated.cantidad ?? 0) * (updated.precioUnit ?? 0)
        return updated
      })
      return { ...f, items }
    })
  }

  function addItem() {
    setForm(f => ({ ...f, items: [...f.items, { id: uid(), descripcion: '', cantidad: 1, precioUnit: 0, subtotal: 0 }] }))
  }

  function removeItem(idx: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }))
  }

  /* ── Guardar ── */
  async function handleSave() {
    if (!form.clienteNombre.trim() || !form.numero.trim()) return
    setSaving(true)
    try {
      if (editId) {
        await updateCotizacion(editId, form)
        setCots(prev => prev.map(c => c._id === editId ? { ...form, _id: editId } : c))
      } else {
        const id = await saveCotizacion(form)
        setCots(prev => [{ ...form, _id: id }, ...prev])
      }
      setView('list'); setEditId(null); setForm(EMPTY_COT())
    } finally {
      setSaving(false)
    }
  }

  /* ── Editar ── */
  function openEdit(c: Cotizacion) {
    const { _id, ...rest } = c
    setForm(rest)
    setEditId(_id ?? null)
    setView('form')
  }

  /* ── Eliminar ── */
  async function handleDelete(id: string) {
    if (!(await confirmar('¿Eliminar esta cotización?'))) return
    await deleteCotizacion(id)
    setCots(prev => prev.filter(c => c._id !== id))
  }

  /* ── Cambiar estado ── */
  async function changeEstado(id: string, estado: Cotizacion['estado']) {
    await updateCotizacion(id, { estado })
    setCots(prev => prev.map(c => c._id === id ? { ...c, estado } : c))
  }

  /* ── PDF ── */
  function printCot(c: Cotizacion) {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Cotización ${c.numero}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 36px 48px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 14px; margin-bottom: 22px; }
        .brand h1 { font-size: 20px; font-weight: 900; letter-spacing: 2px; }
        .brand p { font-size: 10px; color: #666; margin-top: 3px; }
        .doc-info { text-align: right; }
        .doc-info .num { font-size: 18px; font-weight: 700; color: #5B21B6; }
        .doc-info p { font-size: 10px; color: #666; margin-top: 2px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 22px; }
        .box { border: 0.5px solid #ddd; border-radius: 4px; padding: 10px 14px; }
        .box .lbl { font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.8px; color: #888; margin-bottom: 4px; }
        .box .val { font-size: 12.5px; font-weight: 600; }
        .sec { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #555; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 0.5px solid #eee; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f5f5f7; padding: 7px 10px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; border: 0.5px solid #ddd; }
        td { padding: 7px 10px; border: 0.5px solid #ddd; font-size: 11.5px; }
        td.num { text-align: right; }
        .totals { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; margin-top: 14px; }
        .tot-row { display: flex; gap: 24px; font-size: 11px; }
        .tot-row.grand { font-size: 14px; font-weight: 900; color: #5B21B6; border-top: 1.5px solid #111; padding-top: 6px; margin-top: 2px; }
        .notes { border: 0.5px solid #ddd; border-radius: 4px; padding: 10px 14px; font-size: 11px; line-height: 1.6; margin-top: 22px; }
        .footer { margin-top: 36px; font-size: 10px; color: #888; text-align: center; border-top: 0.5px solid #eee; padding-top: 10px; }
        .valid { background: #F0FDF4; border: 0.5px solid #86EFAC; border-radius: 4px; padding: 8px 14px; font-size: 10.5px; color: #166534; margin-bottom: 22px; }
        @media print { body { padding: 20px 30px; } }
      </style></head><body>
      <div class="header">
        <div class="brand"><h1>ALMA</h1><p>Agencia Creativa · Manizales, Colombia</p><p>contacto@almaagenciacreativa.com</p></div>
        <div class="doc-info"><div class="num">COTIZACIÓN</div><p>No. ${c.numero}</p><p>Fecha: ${c.fecha}</p></div>
      </div>
      <div class="grid2">
        <div class="box"><div class="lbl">Cliente</div><div class="val">${c.clienteNombre}</div>${c.clienteEmpresa ? `<div style="font-size:11px;color:#555;margin-top:2px">${c.clienteEmpresa}</div>` : ''}${c.clienteNit ? `<div style="font-size:10px;color:#888">NIT/CC: ${c.clienteNit}</div>` : ''}</div>
        <div class="box"><div class="lbl">Validez</div><div class="val">Hasta: ${c.validaHasta}</div><div style="font-size:10px;color:#888;margin-top:2px">Emitida: ${c.fecha}</div></div>
      </div>
      <p class="sec">Detalle de servicios</p>
      <table>
        <thead><tr><th>#</th><th>Descripción</th><th>Cant.</th><th>Precio unitario</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${c.items.map((it, i) => `<tr><td>${i + 1}</td><td>${it.descripcion || '—'}</td><td class="num">${it.cantidad}</td><td class="num">${fmtCOP(it.precioUnit)}</td><td class="num">${fmtCOP(it.subtotal)}</td></tr>`).join('')}
        </tbody>
      </table>
      <div class="totals">
        <div class="tot-row"><span>Subtotal</span><span>${fmtCOP(c.subtotal)}</span></div>
        ${c.iva ? `<div class="tot-row"><span>IVA (${c.ivaPct}%)</span><span>${fmtCOP(c.subtotal * c.ivaPct / 100)}</span></div>` : ''}
        <div class="tot-row grand"><span>TOTAL</span><span>${fmtCOP(c.total)}</span></div>
      </div>
      ${c.notas ? `<p class="sec">Notas y condiciones</p><div class="notes">${c.notas}</div>` : ''}
      <div class="footer">Esta cotización tiene validez hasta el ${c.validaHasta}. Precios en pesos colombianos (COP). ALMA Agencia Creativa.</div>
      </body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  /* ── Stats ── */
  const aprobadas  = cots.filter(c => c.estado === 'aprobada')
  const pendientes = cots.filter(c => c.estado === 'enviada')
  const valAprobado = aprobadas.reduce((s, c) => s + c.total, 0)

  /* ── Filtered ── */
  const filtered = cots.filter(c => {
    const ms = !search || c.clienteNombre.toLowerCase().includes(search.toLowerCase()) || c.numero.toLowerCase().includes(search.toLowerCase())
    const mf = filter === 'todos' || c.estado === filter
    return ms && mf
  })

  /* ═══════════════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh', padding: isMobile ? '20px 16px' : '32px 36px' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: `0.5px solid ${BDR}`, marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>Cotizaciones</h1>
          </div>
          {view === 'list' ? (
            <button onClick={() => { setForm(EMPTY_COT()); setEditId(null); setView('form') }} style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', background: `linear-gradient(135deg,${C1},${ACC2})`, color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              + Nueva cotización
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setView('list'); setEditId(null) }} style={{ padding: '9px 18px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                ← Volver
              </button>
              <button onClick={() => printCot({ ...form, _id: editId ?? '' } as Cotizacion)} style={{ padding: '9px 18px', borderRadius: '4px', border: `0.5px solid ${TEAL}`, background: 'transparent', color: TEAL, fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                🖨️ Vista previa PDF
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 22px', borderRadius: '4px', border: 'none', background: `linear-gradient(135deg,${C1},${ACC2})`, color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                {saving ? 'Guardando…' : editId ? '✓ Actualizar' : '✓ Guardar'}
              </button>
            </div>
          )}
        </div>

        {/* ══════════ VISTA LISTA ══════════ */}
        {view === 'list' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
              {([
                { lbl: 'Total',      val: cots.length,     sub: 'cotizaciones',    col: WHT,  ico: '◈' },
                { lbl: 'Aprobadas',  val: aprobadas.length,  sub: 'confirmadas',   col: GRN,  ico: '✓' },
                { lbl: 'Enviadas',   val: pendientes.length, sub: 'por responder', col: AMB,  ico: '⏳' },
                { lbl: 'Val. aprobado', val: fmtCOP(valAprobado), sub: 'facturación estimada', col: ACC2, ico: '$' },
              ] as { lbl: string; val: number | string; sub: string; col: string; ico: string }[]).map(m => (
                <div key={m.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>{m.lbl}</p>
                  <p style={{ fontSize: typeof m.val === 'string' ? '16px' : '28px', fontWeight: 300, color: m.col, margin: '0 0 5px', lineHeight: 1 }}>{m.val}</p>
                  <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>{m.sub}</p>
                  <span style={{ position: 'absolute', bottom: 0, right: '10px', fontSize: '44px', color: GHOST, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{m.ico}</span>
                </div>
              ))}
            </div>

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente o número…" style={{ flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, fontSize: '13px', outline: 'none', background: DIM, color: WHT }} />
              {(['todos', ...ESTADOS.map(e => e.key)] as (Cotizacion['estado'] | 'todos')[]).map(t => (
                <button key={t} onClick={() => setFilter(t)} style={{ padding: '8px 14px', borderRadius: '4px', border: `0.5px solid ${filter === t ? (t === 'todos' ? C1 : estadoColor(t as Cotizacion['estado'])) : BDR2}`, background: filter === t ? `rgba(138,63,252,.12)` : 'transparent', color: filter === t ? (t === 'todos' ? ACC2 : estadoColor(t as Cotizacion['estado'])) : MUT, fontSize: '10px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {t === 'todos' ? 'Todas' : estadoLabel(t as Cotizacion['estado'])}
                </button>
              ))}
            </div>

            {/* Lista */}
            {loading ? (
              <ListSkeleton rows={5} />
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>📄</p>
                <p style={{ color: MUT, fontSize: '13px' }}>No hay cotizaciones aquí todavía</p>
                <button onClick={() => { setForm(EMPTY_COT()); setEditId(null); setView('form') }} style={{ marginTop: '16px', padding: '9px 20px', borderRadius: '4px', border: `0.5px solid ${C1}`, background: 'transparent', color: ACC2, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Crear la primera</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(c => {
                  const col = estadoColor(c.estado)
                  return (
                    <div key={c._id} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', borderLeft: `2.5px solid ${col}` }}>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: col, letterSpacing: '0.1em' }}>{c.numero}</span>
                          <span style={{ fontSize: '9px', background: `${col}1A`, color: col, padding: '1px 6px', borderRadius: '3px', fontWeight: 700 }}>{estadoLabel(c.estado)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: WHT }}>{c.clienteNombre}</p>
                        {c.clienteEmpresa && <p style={{ margin: 0, fontSize: '10.5px', color: MUT }}>{c.clienteEmpresa}</p>}
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '110px' }}>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: 300, color: c.estado === 'aprobada' ? GRN : WHT }}>{fmtCOP(c.total)}</p>
                        <p style={{ margin: 0, fontSize: '10px', color: MUT }}>Vence: {c.validaHasta}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                        <select value={c.estado} onChange={e => changeEstado(c._id!, e.target.value as Cotizacion['estado'])} style={{ padding: '5px 8px', borderRadius: '3px', border: `0.5px solid ${BDR2}`, background: INPUT_BG, color: MUT, fontSize: '10px', cursor: 'pointer', outline: 'none' }}>
                          {ESTADOS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                        </select>
                        <button onClick={() => printCot(c)} title="PDF" style={{ padding: '5px 10px', borderRadius: '3px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: TEAL, cursor: 'pointer', fontSize: '12px' }}>🖨️</button>
                        <button onClick={() => openEdit(c)} title="Editar" style={{ padding: '5px 10px', borderRadius: '3px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>✎</button>
                        <button onClick={() => handleDelete(c._id!)} title="Eliminar" style={{ padding: '5px 10px', borderRadius: '3px', border: `0.5px solid ${ROSE}22`, background: 'transparent', color: ROSE, cursor: 'pointer', fontSize: '13px' }}>×</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════ VISTA FORMULARIO ══════════ */}
        {view === 'form' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>

            {/* Columna izquierda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Datos generales */}
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMB, margin: '0 0 14px' }}>Datos de la cotización</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={lbStyle}>No. cotización
                    <input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} style={iStyle} placeholder={`COT-${new Date().getFullYear()}-001`} />
                  </label>
                  <label style={lbStyle}>Estado
                    <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Cotizacion['estado'] }))} style={iStyle}>
                      {ESTADOS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                    </select>
                  </label>
                  <label style={lbStyle}>Fecha de emisión
                    <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} style={iStyle} />
                  </label>
                  <label style={lbStyle}>Válida hasta
                    <input type="date" value={form.validaHasta} onChange={e => setForm(f => ({ ...f, validaHasta: e.target.value }))} style={iStyle} />
                  </label>
                </div>
              </div>

              {/* Datos cliente */}
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: TEAL, margin: '0 0 14px' }}>Datos del cliente</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={lbStyle}>Vincular cliente registrado
                    <select value={form.clienteId} onChange={e => selectCliente(e.target.value)} style={iStyle}>
                      <option value="">— Ingreso manual —</option>
                      {clientes.map(c => <option key={c._id} value={c._id}>{c.marca} — {c.nombre}</option>)}
                    </select>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <label style={lbStyle}>Nombre / contacto
                      <input value={form.clienteNombre} onChange={e => setForm(f => ({ ...f, clienteNombre: e.target.value }))} style={iStyle} placeholder="Nombre" />
                    </label>
                    <label style={lbStyle}>Empresa
                      <input value={form.clienteEmpresa ?? ''} onChange={e => setForm(f => ({ ...f, clienteEmpresa: e.target.value }))} style={iStyle} placeholder="Razón social" />
                    </label>
                    <label style={lbStyle}>NIT / CC
                      <input value={form.clienteNit ?? ''} onChange={e => setForm(f => ({ ...f, clienteNit: e.target.value }))} style={iStyle} placeholder="900.000.000-0" />
                    </label>
                    <label style={lbStyle}>Email
                      <input type="email" value={form.clienteEmail ?? ''} onChange={e => setForm(f => ({ ...f, clienteEmail: e.target.value }))} style={iStyle} placeholder="email@empresa.com" />
                    </label>
                  </div>
                </div>
              </div>

              {/* IVA */}
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div onClick={() => setForm(f => ({ ...f, iva: !f.iva }))} style={{ width: '38px', height: '20px', borderRadius: '10px', background: form.iva ? C1 : BDR2, position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
                    <div style={{ position: 'absolute', top: '2px', left: form.iva ? '20px' : '2px', width: '16px', height: '16px', borderRadius: '50%', background: '#fff', transition: 'left .2s' }} />
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: WHT }}>Aplicar IVA</p>
                    {form.iva && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span style={{ fontSize: '10px', color: MUT }}>Porcentaje:</span>
                        <input type="number" value={form.ivaPct} onChange={e => setForm(f => ({ ...f, ivaPct: Number(e.target.value) }))} style={{ ...iStyle, width: '60px', padding: '4px 8px', fontSize: '12px' }} min="0" max="100" />
                        <span style={{ fontSize: '10px', color: MUT }}>%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notas */}
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>Notas y condiciones</p>
                <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={4} placeholder="Condiciones de pago, vigencia, restricciones…" style={{ ...iStyle, resize: 'vertical' }} />
              </div>
            </div>

            {/* Columna derecha — Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACC2, margin: 0 }}>Servicios / ítems</p>
                  <button onClick={addItem} style={{ padding: '5px 12px', borderRadius: '3px', border: `0.5px solid ${ACC2}`, background: 'transparent', color: ACC2, cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>+ Agregar ítem</button>
                </div>

                {/* Headers */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 56px 90px 90px 22px', gap: '6px', marginBottom: '6px' }}>
                  {['Descripción', 'Cant.', 'P. Unitario', 'Subtotal', ''].map((h, i) => (
                    <span key={i} style={{ fontSize: '8.5px', fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {form.items.map((it, idx) => (
                    <div key={it.id} style={{ display: 'grid', gridTemplateColumns: '1fr 56px 90px 90px 22px', gap: '6px', alignItems: 'center' }}>
                      <input value={it.descripcion} onChange={e => updateItem(idx, 'descripcion', e.target.value)} style={{ ...iStyle, padding: '7px 9px', fontSize: '12px' }} placeholder={`Servicio ${idx + 1}`} />
                      <input type="number" value={it.cantidad} onChange={e => updateItem(idx, 'cantidad', Number(e.target.value))} style={{ ...iStyle, padding: '7px 6px', fontSize: '12px', textAlign: 'right' }} min="1" />
                      <input type="number" value={it.precioUnit || ''} onChange={e => updateItem(idx, 'precioUnit', Number(e.target.value))} style={{ ...iStyle, padding: '7px 6px', fontSize: '12px', textAlign: 'right' }} placeholder="0" />
                      <div style={{ padding: '7px 9px', background: '#111117', borderRadius: '4px', border: `0.5px solid ${BDR}`, fontSize: '11.5px', color: ACC2, textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                        {fmtCOP(it.subtotal)}
                      </div>
                      {form.items.length > 1 ? (
                        <button onClick={() => removeItem(idx)} style={{ background: 'none', border: 'none', color: ROSE, cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '2px' }}>×</button>
                      ) : <span />}
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: `0.5px solid ${BDR}` }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                      <span style={{ fontSize: '11px', color: MUT }}>Subtotal</span>
                      <span style={{ fontSize: '11px', color: WHT, fontWeight: 600 }}>{fmtCOP(form.subtotal)}</span>
                    </div>
                    {form.iva && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px' }}>
                        <span style={{ fontSize: '11px', color: MUT }}>IVA ({form.ivaPct}%)</span>
                        <span style={{ fontSize: '11px', color: WHT, fontWeight: 600 }}>{fmtCOP(form.subtotal * form.ivaPct / 100)}</span>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '220px', paddingTop: '8px', borderTop: `1.5px solid ${BDR2}` }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: WHT }}>Total</span>
                      <span style={{ fontSize: '16px', fontWeight: 300, color: ACC2 }}>{fmtCOP(form.total)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <button onClick={() => { setForm(EMPTY_COT()); setEditId(null) }} style={{ padding: '10px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                🗑 Limpiar formulario
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

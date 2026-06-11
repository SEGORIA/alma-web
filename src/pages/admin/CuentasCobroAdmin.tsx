import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  getClientes, getCuentasCobro, saveCuentaCobro, updateCuentaCobro, deleteCuentaCobro,
} from '../../lib/db'
import type { CuentaCobro, CuentaConcepto } from '../../lib/db'
import type { Cliente } from '../../data/clientes'
import { confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'

/* ── Paleta ─────────────────────────────────────────────── */
const C1   = '#7C3AED'
const BK   = '#F7F5FC'
const DIM  = '#FFFFFF'
const BDR  = '#EAE5F4'
const BDR2 = '#D9D1EA'
const MUT  = '#756E8C'
const WHT  = '#221636'
const ACC2 = '#9333EA'
const AMB  = '#D97706'
const ROSE = '#E11D48'
const TEAL = '#0D9488'
const GRN  = '#16A34A'

/* ── Helpers ────────────────────────────────────────────── */
const fmtCOP = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)

const today = () => new Date().toISOString().split('T')[0]
const in15  = () => { const d = new Date(); d.setDate(d.getDate() + 15); return d.toISOString().split('T')[0] }
const uid   = () => Math.random().toString(36).slice(2, 9)

const ESTADOS: { key: CuentaCobro['estado']; label: string; color: string }[] = [
  { key: 'pendiente', label: 'Pendiente', color: AMB   },
  { key: 'enviada',   label: 'Enviada',   color: '#2563EB' },
  { key: 'pagada',    label: 'Pagada',    color: GRN   },
  { key: 'vencida',   label: 'Vencida',   color: ROSE  },
]

const estadoColor = (e: CuentaCobro['estado']) => ESTADOS.find(x => x.key === e)?.color ?? MUT
const estadoLabel = (e: CuentaCobro['estado']) => ESTADOS.find(x => x.key === e)?.label ?? e

const iStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '4px', border: `0.5px solid ${BDR2}`,
  fontSize: '13px', color: WHT, background: '#FFFFFF', outline: 'none',
  width: '100%', boxSizing: 'border-box',
}
const lbStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '5px',
  fontSize: '10px', fontWeight: 700, color: MUT,
  textTransform: 'uppercase', letterSpacing: '0.5px',
}

/* ── Vacío ──────────────────────────────────────────────── */
const EMPTY_CC = (): Omit<CuentaCobro, '_id'> => ({
  numero:          `CC-${new Date().getFullYear()}-`,
  clienteId:       '',
  clienteNombre:   '',
  clienteEmpresa:  '',
  clienteNit:      '',
  fecha:           today(),
  vencimiento:     in15(),
  estado:          'pendiente',
  conceptos:       [{ id: uid(), descripcion: '', valor: 0 }],
  total:           0,
  datosBancarios:  '',
  notas:           '',
})

/* ═══════════════════════════════════════════════════════════ */
export default function CuentasCobroAdmin() {
  const isMobile = useIsMobile()

  const [view,     setView]     = useState<'list' | 'form'>('list')
  const [editId,   setEditId]   = useState<string | null>(null)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [cuentas,  setCuentas]  = useState<CuentaCobro[]>([])
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [filter,   setFilter]   = useState<CuentaCobro['estado'] | 'todos'>('todos')
  const [search,   setSearch]   = useState('')
  const [form,     setForm]     = useState<Omit<CuentaCobro, '_id'>>(EMPTY_CC())

  useEffect(() => {
    Promise.all([getClientes(), getCuentasCobro()]).then(([cl, cc]) => {
      setClientes(cl)
      setCuentas(cc)
      setLoading(false)
    })
  }, [])

  /* ── Recalcular total ── */
  useEffect(() => {
    const tot = form.conceptos.reduce((s, c) => s + c.valor, 0)
    setForm(f => ({ ...f, total: tot }))
  }, [form.conceptos]) // eslint-disable-line

  /* ── Seleccionar cliente ── */
  function selectCliente(id: string) {
    const c = clientes.find(x => x._id === id)
    if (!c) return
    setForm(f => ({
      ...f,
      clienteId:      id,
      clienteNombre:  c.nombre,
      clienteEmpresa: c.empresa ?? c.marca,
    }))
  }

  /* ── Conceptos ── */
  function updateConcepto(idx: number, field: keyof CuentaConcepto, val: string | number) {
    setForm(f => ({
      ...f,
      conceptos: f.conceptos.map((c, i) => i === idx ? { ...c, [field]: val } : c),
    }))
  }
  function addConcepto() {
    setForm(f => ({ ...f, conceptos: [...f.conceptos, { id: uid(), descripcion: '', valor: 0 }] }))
  }
  function removeConcepto(idx: number) {
    setForm(f => ({ ...f, conceptos: f.conceptos.filter((_, i) => i !== idx) }))
  }

  /* ── Guardar ── */
  async function handleSave() {
    if (!form.clienteNombre.trim() || !form.numero.trim()) return
    setSaving(true)
    try {
      if (editId) {
        await updateCuentaCobro(editId, form)
        setCuentas(prev => prev.map(c => c._id === editId ? { ...form, _id: editId } : c))
      } else {
        const id = await saveCuentaCobro(form)
        setCuentas(prev => [{ ...form, _id: id }, ...prev])
      }
      setView('list'); setEditId(null); setForm(EMPTY_CC())
    } finally {
      setSaving(false)
    }
  }

  /* ── Editar ── */
  function openEdit(c: CuentaCobro) {
    const { _id, ...rest } = c
    setForm(rest)
    setEditId(_id ?? null)
    setView('form')
  }

  /* ── Eliminar ── */
  async function handleDelete(id: string) {
    if (!(await confirmar('¿Eliminar esta cuenta de cobro?'))) return
    await deleteCuentaCobro(id)
    setCuentas(prev => prev.filter(c => c._id !== id))
  }

  /* ── Cambiar estado ── */
  async function changeEstado(id: string, estado: CuentaCobro['estado']) {
    await updateCuentaCobro(id, { estado })
    setCuentas(prev => prev.map(c => c._id === id ? { ...c, estado } : c))
  }

  /* ── PDF (formato formal cuenta de cobro colombiana) ── */
  function printCuenta(c: CuentaCobro) {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html><html><head>
      <meta charset="UTF-8">
      <title>Cuenta de Cobro ${c.numero}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 40px 52px; }
        .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2.5px solid #111; padding-bottom: 16px; margin-bottom: 24px; }
        .brand h1 { font-size: 22px; font-weight: 900; letter-spacing: 3px; }
        .brand p { font-size: 10px; color: #666; margin-top: 3px; }
        .doc-badge { text-align: right; }
        .doc-badge .title { font-size: 16px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #5B21B6; }
        .doc-badge p { font-size: 10px; color: #666; margin-top: 3px; }
        .section-title { font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.5px; color: #777; margin: 22px 0 10px; padding-bottom: 5px; border-bottom: 0.5px solid #ddd; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 10px; }
        .field { border: 0.5px solid #e0e0e0; border-radius: 3px; padding: 8px 12px; }
        .field .lbl { font-size: 8px; text-transform: uppercase; letter-spacing: 0.8px; color: #999; margin-bottom: 3px; }
        .field .val { font-size: 12.5px; font-weight: 600; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
        th { background: #f5f5f7; padding: 7px 12px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; border: 0.5px solid #ddd; color: #555; }
        td { padding: 8px 12px; border: 0.5px solid #ddd; vertical-align: top; }
        .total-row td { font-weight: 900; font-size: 14px; color: #5B21B6; background: #F5F3FF; border-top: 2px solid #5B21B6; }
        .total-row td:last-child { text-align: right; }
        .bank-box { background: #F9FAFB; border: 0.5px solid #e0e0e0; border-radius: 4px; padding: 12px 16px; margin-top: 22px; font-size: 11.5px; line-height: 1.8; }
        .bank-box .lbl { font-size: 8.5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 6px; }
        .notes-box { border: 0.5px solid #e0e0e0; border-radius: 4px; padding: 12px 16px; margin-top: 16px; font-size: 11.5px; line-height: 1.7; color: #444; }
        .firma-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; margin-top: 50px; }
        .firma-box { border-top: 1.5px solid #111; padding-top: 8px; }
        .firma-box p { font-size: 10.5px; color: #555; margin-top: 3px; }
        .footer { margin-top: 30px; font-size: 9.5px; color: #aaa; text-align: center; padding-top: 10px; border-top: 0.5px solid #eee; }
        @media print { body { padding: 20px 32px; } }
      </style></head><body>
      <div class="top">
        <div class="brand"><h1>ALMA</h1><p>Agencia Creativa S.A.S.</p><p>NIT: _________________</p><p>Manizales, Caldas — contacto@almaagenciacreativa.com</p></div>
        <div class="doc-badge"><div class="title">Cuenta de Cobro</div><p>No. ${c.numero}</p><p>Fecha: ${c.fecha}</p><p>Vence: ${c.vencimiento}</p></div>
      </div>

      <p class="section-title">Señores</p>
      <div class="grid2">
        <div class="field"><div class="lbl">Empresa / Cliente</div><div class="val">${c.clienteEmpresa || c.clienteNombre}</div></div>
        <div class="field"><div class="lbl">NIT / CC</div><div class="val">${c.clienteNit || '—'}</div></div>
        <div class="field" style="grid-column: 1 / -1"><div class="lbl">Contacto</div><div class="val">${c.clienteNombre}</div></div>
      </div>

      <p class="section-title">Conceptos cobrados</p>
      <table>
        <thead><tr><th>#</th><th>Descripción del servicio</th><th style="text-align:right">Valor</th></tr></thead>
        <tbody>
          ${c.conceptos.map((cn, i) => `<tr><td style="width:30px">${i + 1}</td><td>${cn.descripcion || '—'}</td><td style="text-align:right;white-space:nowrap">${fmtCOP(cn.valor)}</td></tr>`).join('')}
        </tbody>
        <tfoot><tr class="total-row"><td colspan="2"><strong>TOTAL A PAGAR</strong></td><td><strong>${fmtCOP(c.total)}</strong></td></tr></tfoot>
      </table>

      ${c.datosBancarios ? `
      <div class="bank-box">
        <div class="lbl">Datos para pago</div>
        ${c.datosBancarios.replace(/\n/g, '<br>')}
      </div>` : ''}

      ${c.notas ? `
      <p class="section-title">Observaciones</p>
      <div class="notes-box">${c.notas}</div>` : ''}

      <div class="firma-grid">
        <div class="firma-box">
          <p><strong>ALMA AGENCIA CREATIVA S.A.S.</strong></p>
          <p style="margin-top:32px">_________________________________</p>
          <p>Firma del prestador del servicio</p>
          <p>NIT: _____________________________</p>
          <p>Ciudad y fecha: Manizales, ${c.fecha}</p>
        </div>
        <div class="firma-box">
          <p><strong>EL CLIENTE</strong></p>
          <p style="margin-top:32px">_________________________________</p>
          <p>Firma de recibido</p>
          <p>C.C. / NIT: ${c.clienteNit || '____________________'}</p>
          <p>Ciudad y fecha: ________, ${c.fecha}</p>
        </div>
      </div>

      <div class="footer">Cuenta de cobro generada por ALMA Agencia Creativa · ${c.numero} · ${c.fecha}</div>
      </body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  /* ── Stats ── */
  const pagadas   = cuentas.filter(c => c.estado === 'pagada')
  const pendientes = cuentas.filter(c => c.estado === 'pendiente' || c.estado === 'enviada')
  const vencidas  = cuentas.filter(c => c.estado === 'vencida')
  const valPendiente = pendientes.reduce((s, c) => s + c.total, 0)

  /* ── Filtered ── */
  const filtered = cuentas.filter(c => {
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
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>Cuentas de Cobro</h1>
          </div>
          {view === 'list' ? (
            <button onClick={() => { setForm(EMPTY_CC()); setEditId(null); setView('form') }} style={{ padding: '10px 20px', borderRadius: '4px', border: 'none', background: `linear-gradient(135deg,${C1},${ACC2})`, color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
              + Nueva cuenta de cobro
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { setView('list'); setEditId(null) }} style={{ padding: '9px 18px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                ← Volver
              </button>
              <button onClick={() => printCuenta({ ...form, _id: editId ?? '' } as CuentaCobro)} style={{ padding: '9px 18px', borderRadius: '4px', border: `0.5px solid ${TEAL}`, background: 'transparent', color: TEAL, fontWeight: 700, fontSize: '11px', cursor: 'pointer' }}>
                🖨️ Vista previa PDF
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: '10px 22px', borderRadius: '4px', border: 'none', background: `linear-gradient(135deg,${C1},${ACC2})`, color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>
                {saving ? 'Guardando…' : editId ? '✓ Actualizar' : '✓ Guardar'}
              </button>
            </div>
          )}
        </div>

        {/* ══════════ LISTA ══════════ */}
        {view === 'list' && (
          <>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '14px', marginBottom: '24px' }}>
              {([
                { lbl: 'Total',      val: cuentas.length,      sub: 'cuentas emitidas', col: WHT,  ico: '◈' },
                { lbl: 'Pagadas',    val: pagadas.length,      sub: 'recibido',          col: GRN,  ico: '✓' },
                { lbl: 'Pendientes', val: pendientes.length,   sub: 'por cobrar',        col: AMB,  ico: '⏳' },
                { lbl: 'Por cobrar', val: fmtCOP(valPendiente),sub: 'valor pendiente',   col: ROSE, ico: '$' },
              ] as { lbl: string; val: number | string; sub: string; col: string; ico: string }[]).map(m => (
                <div key={m.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>{m.lbl}</p>
                  <p style={{ fontSize: typeof m.val === 'string' ? '15px' : '28px', fontWeight: 300, color: m.col, margin: '0 0 5px', lineHeight: 1 }}>{m.val}</p>
                  <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>{m.sub}</p>
                  <span style={{ position: 'absolute', bottom: 0, right: '10px', fontSize: '44px', color: '#F1ECFA', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{m.ico}</span>
                </div>
              ))}
            </div>

            {/* Alerta vencidas */}
            {vencidas.length > 0 && (
              <div style={{ background: `${ROSE}12`, border: `0.5px solid ${ROSE}40`, borderRadius: '6px', padding: '10px 16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px' }}>⚠️</span>
                <p style={{ margin: 0, fontSize: '12px', color: ROSE }}><strong>{vencidas.length}</strong> cuenta{vencidas.length > 1 ? 's' : ''} vencida{vencidas.length > 1 ? 's' : ''} sin pago registrado</p>
              </div>
            )}

            {/* Filtros */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente o número…" style={{ flex: 1, minWidth: '200px', padding: '9px 14px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, fontSize: '13px', outline: 'none', background: DIM, color: WHT }} />
              {(['todos', ...ESTADOS.map(e => e.key)] as (CuentaCobro['estado'] | 'todos')[]).map(t => (
                <button key={t} onClick={() => setFilter(t)} style={{ padding: '8px 14px', borderRadius: '4px', border: `0.5px solid ${filter === t ? (t === 'todos' ? C1 : estadoColor(t as CuentaCobro['estado'])) : BDR2}`, background: filter === t ? 'rgba(138,63,252,.12)' : 'transparent', color: filter === t ? (t === 'todos' ? ACC2 : estadoColor(t as CuentaCobro['estado'])) : MUT, fontSize: '10px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {t === 'todos' ? 'Todas' : estadoLabel(t as CuentaCobro['estado'])}
                </button>
              ))}
            </div>

            {/* Lista */}
            {loading ? (
              <ListSkeleton rows={5} />
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontSize: '32px', marginBottom: '12px' }}>💰</p>
                <p style={{ color: MUT, fontSize: '13px' }}>No hay cuentas de cobro todavía</p>
                <button onClick={() => { setForm(EMPTY_CC()); setEditId(null); setView('form') }} style={{ marginTop: '16px', padding: '9px 20px', borderRadius: '4px', border: `0.5px solid ${C1}`, background: 'transparent', color: ACC2, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Crear la primera</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filtered.map(c => {
                  const col = estadoColor(c.estado)
                  const isVencida = c.estado === 'vencida'
                  return (
                    <div key={c._id} style={{ background: DIM, border: `0.5px solid ${isVencida ? ROSE : BDR}`, borderRadius: '6px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', borderLeft: `2.5px solid ${col}` }}>
                      <div style={{ flex: 1, minWidth: '180px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 700, color: col, letterSpacing: '0.1em' }}>{c.numero}</span>
                          <span style={{ fontSize: '9px', background: `${col}1A`, color: col, padding: '1px 6px', borderRadius: '3px', fontWeight: 700 }}>{estadoLabel(c.estado)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: WHT }}>{c.clienteNombre}</p>
                        {c.clienteEmpresa && <p style={{ margin: 0, fontSize: '10.5px', color: MUT }}>{c.clienteEmpresa}</p>}
                      </div>
                      <div style={{ textAlign: 'right', minWidth: '110px' }}>
                        <p style={{ margin: 0, fontSize: '15px', fontWeight: 300, color: c.estado === 'pagada' ? GRN : c.estado === 'vencida' ? ROSE : WHT }}>{fmtCOP(c.total)}</p>
                        <p style={{ margin: 0, fontSize: '10px', color: isVencida ? ROSE : MUT }}>Vence: {c.vencimiento}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
                        <select value={c.estado} onChange={e => changeEstado(c._id!, e.target.value as CuentaCobro['estado'])} style={{ padding: '5px 8px', borderRadius: '3px', border: `0.5px solid ${BDR2}`, background: '#FFFFFF', color: MUT, fontSize: '10px', cursor: 'pointer', outline: 'none' }}>
                          {ESTADOS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                        </select>
                        <button onClick={() => printCuenta(c)} title="PDF" style={{ padding: '5px 10px', borderRadius: '3px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: TEAL, cursor: 'pointer', fontSize: '12px' }}>🖨️</button>
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

        {/* ══════════ FORMULARIO ══════════ */}
        {view === 'form' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>

            {/* Columna izquierda */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Datos */}
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMB, margin: '0 0 14px' }}>Datos del documento</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={lbStyle}>No. cuenta de cobro
                    <input value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} style={iStyle} placeholder={`CC-${new Date().getFullYear()}-001`} />
                  </label>
                  <label style={lbStyle}>Estado
                    <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as CuentaCobro['estado'] }))} style={iStyle}>
                      {ESTADOS.map(e => <option key={e.key} value={e.key}>{e.label}</option>)}
                    </select>
                  </label>
                  <label style={lbStyle}>Fecha de emisión
                    <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} style={iStyle} />
                  </label>
                  <label style={lbStyle}>Fecha de vencimiento
                    <input type="date" value={form.vencimiento} onChange={e => setForm(f => ({ ...f, vencimiento: e.target.value }))} style={iStyle} />
                  </label>
                </div>
              </div>

              {/* Cliente */}
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
                    <label style={{ ...lbStyle, gridColumn: '1 / -1' }}>NIT / CC
                      <input value={form.clienteNit ?? ''} onChange={e => setForm(f => ({ ...f, clienteNit: e.target.value }))} style={iStyle} placeholder="900.000.000-0" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Datos bancarios */}
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: GRN, margin: '0 0 10px' }}>Datos bancarios para pago</p>
                <textarea value={form.datosBancarios} onChange={e => setForm(f => ({ ...f, datosBancarios: e.target.value }))} rows={4} placeholder={'Banco: Bancolombia\nTipo: Ahorros\nNo: 123-456789-00\nTitular: ALMA Agencia Creativa\nNIT: 900.000.000-0'} style={{ ...iStyle, resize: 'vertical', fontSize: '12px', lineHeight: '1.7' }} />
              </div>

              {/* Notas */}
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>Observaciones</p>
                <textarea value={form.notas} onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} rows={3} placeholder="Condiciones especiales, instrucciones de pago…" style={{ ...iStyle, resize: 'vertical' }} />
              </div>
            </div>

            {/* Columna derecha — Conceptos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACC2, margin: 0 }}>Conceptos cobrados</p>
                  <button onClick={addConcepto} style={{ padding: '5px 12px', borderRadius: '3px', border: `0.5px solid ${ACC2}`, background: 'transparent', color: ACC2, cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>+ Agregar</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 110px 22px', gap: '6px', marginBottom: '6px' }}>
                  {['Descripción del servicio', 'Valor', ''].map((h, i) => (
                    <span key={i} style={{ fontSize: '8.5px', fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {form.conceptos.map((cn, idx) => (
                    <div key={cn.id} style={{ display: 'grid', gridTemplateColumns: '1fr 110px 22px', gap: '6px', alignItems: 'center' }}>
                      <input value={cn.descripcion} onChange={e => updateConcepto(idx, 'descripcion', e.target.value)} style={{ ...iStyle, padding: '7px 9px', fontSize: '12px' }} placeholder={`Concepto ${idx + 1}`} />
                      <input type="number" value={cn.valor || ''} onChange={e => updateConcepto(idx, 'valor', Number(e.target.value))} style={{ ...iStyle, padding: '7px 8px', fontSize: '12px', textAlign: 'right' }} placeholder="0" />
                      {form.conceptos.length > 1 ? (
                        <button onClick={() => removeConcepto(idx)} style={{ background: 'none', border: 'none', color: ROSE, cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: '2px' }}>×</button>
                      ) : <span />}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: `0.5px solid ${BDR}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: WHT }}>Total a cobrar</span>
                    <span style={{ fontSize: '20px', fontWeight: 300, color: ACC2 }}>{fmtCOP(form.total)}</span>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <button onClick={() => { setForm(EMPTY_CC()); setEditId(null) }} style={{ padding: '10px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                🗑 Limpiar formulario
              </button>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

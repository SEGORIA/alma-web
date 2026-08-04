import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import { db } from '../../lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import type { Cliente, MetricaMes } from '../../data/clientes'
import {
  getMovimientos, saveMovimiento, deleteMovimiento, getCuentasCobro, stripUndefined,
  type Movimiento, type MovimientoTipo, type CuentaCobro,
} from '../../lib/db'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import { ADM, getAdminThemeMode } from '../../lib/adminTheme'

const { BK, DIM, BDR, BDR2, MUT, WHT, C1, ACC2, ROSE, AMB, TEAL, GRN, BLUE, INPUT_BG, GHOST, ZEBRA } = ADM
const CS = getAdminThemeMode()

/* ── Paleta ─────────────────────────────────────────────── */

/* ── Plataformas ─────────────────────────────────────────── */
const PLATFORMS = [
  { id: 'ig',  label: 'Instagram',  color: '#e1306c' },
  { id: 'fb',  label: 'Facebook',   color: '#4267b2' },
  { id: 'tk',  label: 'TikTok',     color: '#ff0050' },
  { id: 'tw',  label: 'Twitter/X',  color: '#1da1f2' },
  { id: 'li',  label: 'LinkedIn',   color: '#0077b5' },
  { id: 'yt',  label: 'YouTube',    color: '#ff0000' },
]

/* ── Campos de métricas ──────────────────────────────────── */
const MET_FIELDS: { key: keyof MetricaMes; label: string; icon: string; step?: number }[] = [
  { key: 'alcance',          label: 'Alcance',          icon: '👁️' },
  { key: 'impresiones',      label: 'Impresiones',      icon: '📡' },
  { key: 'likes',            label: 'Likes',            icon: '❤️' },
  { key: 'comentarios',      label: 'Comentarios',      icon: '💬' },
  { key: 'guardados',        label: 'Guardados',        icon: '🔖' },
  { key: 'compartidos',      label: 'Compartidos',      icon: '↗️' },
  { key: 'seguidores',       label: 'Nuevos seguidores',icon: '👥' },
  { key: 'engagement',       label: 'Engagement %',     icon: '📈', step: 0.1 },
  { key: 'posts_publicados', label: 'Posts publicados', icon: '✅' },
]

/* ── Estados de cliente ──────────────────────────────────── */
const ESTADO_META: Record<string, { label: string; color: string; bg: string }> = {
  activo:     { label: 'Activo',     color: '#10B981', bg: 'rgba(16,185,129,0.12)' },
  pausado:    { label: 'Pausado',    color: AMB,       bg: 'rgba(251,191,36,0.12)' },
  finalizado: { label: 'Finalizado', color: MUT,       bg: 'rgba(96,96,128,0.12)'  },
  prospecto:  { label: 'Prospecto',  color: BLUE, bg: 'rgba(96,165,250,0.12)' },
}

type FinTab = 'finanzas' | 'clientes' | 'metricas'

/* ── Movimientos: tipos y categorías ─────────────────────── */
const TIPO_META: Record<MovimientoTipo, { label: string; short: string; color: string; sign: 1 | -1 }> = {
  ingreso:         { label: 'Ingreso',         short: 'ING', color: GRN,  sign:  1 },
  gasto_operativo: { label: 'Gasto operativo', short: 'OPE', color: ROSE, sign: -1 },
  gasto_personal:  { label: 'Gasto personal',  short: 'PER', color: AMB,  sign: -1 },
}

const CATS: Record<MovimientoTipo, string[]> = {
  ingreso:         ['Mensualidad', 'Proyecto puntual', 'Adicional', 'Otro'],
  gasto_operativo: ['Nómina', 'Software y herramientas', 'Publicidad', 'Equipos', 'Servicios', 'Transporte', 'Impuestos', 'Otro'],
  gasto_personal:  ['Retiro socios', 'Personal', 'Otro'],
}

/* Datos del dashboard anterior (public/finanzas.html → localStorage) */
type LegacyItem  = { id: number; nombre: string; monto: number; tipo?: string; categoria?: string; socio?: string }
type LegacyMonth = { ingresos?: LegacyItem[]; operativos?: LegacyItem[]; personales?: LegacyItem[] }

function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
function shiftMonth(mes: string, delta: number) {
  const [y, m] = mes.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 15)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const inputSt: React.CSSProperties = {
  width: '100%', background: INPUT_BG, border: `1px solid ${BDR2}`,
  borderRadius: '8px', color: WHT, fontSize: '13px',
  padding: '8px 10px', outline: 'none', fontFamily: 'inherit',
}
const labelSt: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '5px',
  fontSize: '10px', color: MUT, fontWeight: 700, letterSpacing: '0.4px', textTransform: 'uppercase',
}

function mesLabel(mes: string) {
  const [y, m] = mes.split('-')
  return new Date(+y, +m - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
}
function getPlatform(id: string) { return PLATFORMS.find(p => p.id === id) }

/** Parsea "1.500.000" o "$1,500,000" → número */
function parseValor(v?: string): number {
  if (!v) return 0
  const clean = v.replace(/[^0-9]/g, '')
  return clean ? parseInt(clean, 10) : 0
}

/** Formatea número como moneda colombiana */
function fmtCOP(n: number) {
  return '$' + n.toLocaleString('es-CO')
}

/* ════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════════════ */
export default function FinanzasAdmin() {
  const isMobile = useIsMobile()
  const [tab, setTab] = useState<FinTab>('finanzas')

  /* ── Clientes state (compartido entre tabs) ──────────── */
  const [clientes, setClientes]     = useState<Cliente[]>([])
  const [loadingCl, setLoadingCl]   = useState(false)

  /* ── Finanzas state ──────────────────────────────────── */
  const [movs,       setMovs]       = useState<Movimiento[]>([])
  const [cuentas,    setCuentas]    = useState<CuentaCobro[]>([])
  const [finLoaded,  setFinLoaded]  = useState(false)
  const [loadingFin, setLoadingFin] = useState(false)
  const [finMes,     setFinMes]     = useState(currentMonthKey())
  // form nuevo movimiento
  const [fTipo,  setFTipo]  = useState<MovimientoTipo>('ingreso')
  const [fFecha, setFFecha] = useState(() => new Date().toISOString().slice(0, 10))
  const [fCat,   setFCat]   = useState(CATS.ingreso[0])
  const [fDesc,  setFDesc]  = useState('')
  const [fMonto, setFMonto] = useState('')
  const [savingMov, setSavingMov] = useState(false)
  // migración del dashboard anterior (localStorage)
  const [legacy, setLegacy] = useState<{ data: Record<string, LegacyMonth>; n: number } | null>(() => {
    try {
      if (localStorage.getItem('alma_fin_migrado')) return null
      const raw = localStorage.getItem('alma_data')
      if (!raw) return null
      const data = JSON.parse(raw) as Record<string, LegacyMonth>
      let n = 0
      for (const m of Object.values(data)) {
        n += (m.ingresos ?? []).length + (m.operativos ?? []).length + (m.personales ?? []).length
      }
      return n > 0 ? { data, n } : null
    } catch { return null }
  })
  const [importing, setImporting] = useState(false)

  /* ── Métricas state ──────────────────────────────────── */
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [platform, setPlatform]     = useState('ig')
  const [mesValue, setMesValue]     = useState<string>(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [form, setForm]       = useState<Partial<MetricaMes>>({})
  const [editKey, setEditKey] = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)
  const [searchQ, setSearchQ] = useState('')

  /* ── Clientes tab state ──────────────────────────────── */
  const [clSearch, setClSearch]         = useState('')
  const [clEstado, setClEstado]         = useState<string>('todos')
  const [clSort, setClSort]             = useState<'marca' | 'valor' | 'estado'>('marca')

  const selectedClient   = clientes.find(c => c._id === selectedId)
  const filteredMClients = clientes.filter(c =>
    (c.marca || c.nombre || '').toLowerCase().includes(searchQ.toLowerCase())
  )

  /* ── Load clients ────────────────────────────────────── */
  async function loadFin() {
    setLoadingFin(true)
    try {
      const [m, cc] = await Promise.all([getMovimientos(), getCuentasCobro()])
      setMovs(m)
      setCuentas(cc)
      setFinLoaded(true)
    } catch (e) { console.error(e) }
    finally { setLoadingFin(false) }
  }

  async function loadClients() {
    if (!db) return
    setLoadingCl(true)
    try {
      const snap = await getDocs(collection(db, 'clientes'))
      const list: Cliente[] = []
      snap.forEach(d => list.push({ _id: d.id, ...d.data() } as Cliente))
      list.sort((a, b) => (a.marca || a.nombre).localeCompare(b.marca || b.nombre))
      setClientes(list)
    } catch (e) { console.error(e) }
    finally { setLoadingCl(false) }
  }

  // Las dos cargas van declaradas arriba a propósito: el analizador de hooks no
  // acepta el hoisting de `function` y exige declararlas antes de usarlas aquí.
  // Los guardas internos hacen que re-ejecutar el efecto sea idempotente.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    if (clientes.length === 0) loadClients()
    if (tab === 'finanzas' && !finLoaded) loadFin()
  }, [tab, clientes.length, finLoaded])

  /* ── Métricas helpers ────────────────────────────────── */
  function loadExistingEntry(cl: Cliente, mes: string, plat: string) {
    const existing = (cl.metricas_historico ?? []).find(
      m => m.mes === mes && m.plataforma === plat
    )
    if (existing) {
      const { mes: _m, plataforma: _p, ...rest } = existing
      setForm(rest)
      setEditKey(`${mes}|${plat}`)
    } else { setForm({}); setEditKey(null) }
  }
  function selectMetricClient(id: string) {
    setSelectedId(id)
    const cl = clientes.find(c => c._id === id)
    if (cl) loadExistingEntry(cl, mesValue, platform)
  }
  function onPlatformChange(pid: string) {
    setPlatform(pid)
    if (selectedClient) loadExistingEntry(selectedClient, mesValue, pid)
    else { setForm({}); setEditKey(null) }
  }
  function onMesChange(v: string) {
    setMesValue(v)
    if (selectedClient) loadExistingEntry(selectedClient, v, platform)
    else { setForm({}); setEditKey(null) }
  }
  async function saveMetric() {
    if (!selectedId || !selectedClient || !db) return
    setSaving(true)
    try {
      const hist = [...(selectedClient.metricas_historico ?? [])]
      const idx  = hist.findIndex(m => m.mes === mesValue && m.plataforma === platform)
      const entry = stripUndefined({ mes: mesValue, plataforma: platform, ...form }) as MetricaMes
      if (idx >= 0) hist[idx] = entry; else hist.push(entry)
      await updateDoc(doc(db, 'clientes', selectedId), { metricas_historico: hist, updatedAt: new Date().toISOString() })
      setClientes(cs => cs.map(c => c._id === selectedId ? { ...c, metricas_historico: hist } : c))
      setEditKey(`${mesValue}|${platform}`)
    } catch (e) { console.error(e) }
    finally { setSaving(false) }
  }
  async function deleteMetric(mes: string, plat: string) {
    if (!selectedId || !selectedClient || !db) return
    if (!(await confirmar('¿Eliminar métricas de este mes para esta plataforma?'))) return
    const hist = (selectedClient.metricas_historico ?? []).filter(m => !(m.mes === mes && m.plataforma === plat))
    await updateDoc(doc(db, 'clientes', selectedId), { metricas_historico: hist, updatedAt: new Date().toISOString() })
    setClientes(cs => cs.map(c => c._id === selectedId ? { ...c, metricas_historico: hist } : c))
    if (editKey === `${mes}|${plat}`) { setEditKey(null); setForm({}) }
  }
  /* ── Finanzas: derivadas del mes seleccionado ────────── */
  const hoyStr        = new Date().toISOString().slice(0, 10)
  const movsMes       = movs.filter(m => m.fecha.startsWith(finMes))
  const cxcPagadasMes = cuentas.filter(c => c.estado === 'pagada' && (c.fecha ?? '').startsWith(finMes))
  const ingresosMov   = movsMes.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
  const ingresosCxc   = cxcPagadasMes.reduce((s, c) => s + (c.total ?? 0), 0)
  const ingresosTotal = ingresosMov + ingresosCxc
  const gastosOp      = movsMes.filter(m => m.tipo === 'gasto_operativo').reduce((s, m) => s + m.monto, 0)
  const gastosPer     = movsMes.filter(m => m.tipo === 'gasto_personal').reduce((s, m) => s + m.monto, 0)
  const gastosTotal   = gastosOp + gastosPer
  const utilidad      = ingresosTotal - gastosTotal
  const margen        = ingresosTotal > 0 ? Math.round((utilidad / ingresosTotal) * 100) : 0
  // Cuentas por cobrar (global, no solo el mes)
  const cxcVencidas   = cuentas.filter(c => c.estado === 'vencida' || (c.estado !== 'pagada' && (c.vencimiento ?? '') !== '' && c.vencimiento < hoyStr))
  const cxcPendientes = cuentas.filter(c => (c.estado === 'pendiente' || c.estado === 'enviada') && !cxcVencidas.includes(c))
  const cxcPendTotal  = cxcPendientes.reduce((s, c) => s + (c.total ?? 0), 0)
  const cxcVencTotal  = cxcVencidas.reduce((s, c) => s + (c.total ?? 0), 0)
  // Flujo de los últimos 6 meses (ingresos vs gastos)
  const serie6 = Array.from({ length: 6 }, (_, i) => {
    const mes = shiftMonth(currentMonthKey(), i - 5)
    const ing = movs.filter(m => m.tipo === 'ingreso' && m.fecha.startsWith(mes)).reduce((s, m) => s + m.monto, 0)
      + cuentas.filter(c => c.estado === 'pagada' && (c.fecha ?? '').startsWith(mes)).reduce((s, c) => s + (c.total ?? 0), 0)
    const gas = movs.filter(m => m.tipo !== 'ingreso' && m.fecha.startsWith(mes)).reduce((s, m) => s + m.monto, 0)
    return { mes, ing, gas }
  })
  const maxSerie = Math.max(1, ...serie6.flatMap(s => [s.ing, s.gas]))

  /* ── Finanzas: handlers ──────────────────────────────── */
  async function addMovimiento() {
    const monto = parseFloat(fMonto)
    if (!fDesc.trim() || !monto || monto <= 0) { toast.err('Completa la descripción y un monto válido'); return }
    setSavingMov(true)
    try {
      const data: Omit<Movimiento, '_id'> = { fecha: fFecha, tipo: fTipo, categoria: fCat, descripcion: fDesc.trim(), monto }
      const id = await saveMovimiento(data)
      setMovs(prev => [{ ...data, _id: id }, ...prev])
      setFDesc(''); setFMonto('')
      toast.ok('Movimiento registrado')
    } catch (e) { toast.err('Error al guardar: ' + e) }
    finally { setSavingMov(false) }
  }

  async function removeMovimiento(m: Movimiento) {
    if (!m._id) return
    if (!(await confirmar(`¿Eliminar "${m.descripcion}" (${fmtCOP(m.monto)})?`))) return
    try {
      await deleteMovimiento(m._id)
      setMovs(prev => prev.filter(x => x._id !== m._id))
      toast.ok('Movimiento eliminado')
    } catch (e) { toast.err('Error: ' + e) }
  }

  function exportCsv() {
    const rows: string[][] = [['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Monto']]
    cxcPagadasMes.forEach(c => rows.push([c.fecha, 'Ingreso (CxC)', 'Cuenta de cobro', `${c.numero} · ${c.clienteNombre}`, String(c.total ?? 0)]))
    movsMes.forEach(m => rows.push([m.fecha, TIPO_META[m.tipo].label, m.categoria, m.descripcion, String(TIPO_META[m.tipo].sign * m.monto)]))
    const csv = '﻿' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `finanzas-${finMes}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function importLegacy() {
    if (!legacy) return
    const ok = await confirmar({
      titulo:  'Importar dashboard anterior',
      mensaje: `Se importarán ${legacy.n} movimientos guardados en este navegador a Firestore, quedando sincronizados para todo el equipo. Cada registro se asigna al día 1 de su mes.`,
      accion:  'Importar todo',
      peligro: false,
    })
    if (!ok) return
    setImporting(true)
    try {
      const nuevos: Movimiento[] = []
      for (const [mes, bucket] of Object.entries(legacy.data)) {
        const fecha = `${mes}-01`
        for (const it of bucket.ingresos   ?? []) nuevos.push({ fecha, tipo: 'ingreso',         categoria: it.tipo || 'Otro',                                  descripcion: it.nombre, monto: it.monto })
        for (const it of bucket.operativos ?? []) nuevos.push({ fecha, tipo: 'gasto_operativo', categoria: it.categoria || 'Otro',                             descripcion: it.nombre, monto: it.monto })
        for (const it of bucket.personales ?? []) nuevos.push({ fecha, tipo: 'gasto_personal',  categoria: it.socio ? `Socio: ${it.socio}` : 'Personal',       descripcion: it.nombre, monto: it.monto })
      }
      for (const n of nuevos) { n._id = await saveMovimiento(n) }
      setMovs(prev => [...nuevos, ...prev])
      localStorage.setItem('alma_fin_migrado', '1')
      setLegacy(null)
      toast.ok(`${nuevos.length} movimientos importados correctamente`)
    } catch (e) { toast.err('Error al importar: ' + e) }
    finally { setImporting(false) }
  }

  const platHistory = (selectedClient?.metricas_historico ?? [])
    .filter(m => m.plataforma === platform)
    .sort((a, b) => b.mes.localeCompare(a.mes))

  /* ── Clientes tab derivadas ──────────────────────────── */
  const activos    = clientes.filter(c => c.estado === 'activo')
  const pausados   = clientes.filter(c => c.estado === 'pausado')
  const prospectos = clientes.filter(c => c.estado === 'prospecto')
  const facturacion = activos.reduce((s, c) => s + parseValor(c.valor_contrato), 0)
  const ticketProm  = activos.length ? Math.round(facturacion / activos.length) : 0

  const clFiltered = clientes
    .filter(c => {
      const q = clSearch.toLowerCase()
      const matchQ = !q || (c.marca || c.nombre || '').toLowerCase().includes(q) || (c.email || '').toLowerCase().includes(q)
      const matchE  = clEstado === 'todos' || c.estado === clEstado
      return matchQ && matchE
    })
    .sort((a, b) => {
      if (clSort === 'valor') return parseValor(b.valor_contrato) - parseValor(a.valor_contrato)
      if (clSort === 'estado') return (a.estado || '').localeCompare(b.estado || '')
      return (a.marca || a.nombre).localeCompare(b.marca || b.nombre)
    })

  /* ════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: BK }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '14px 16px' : '18px 32px',
          borderBottom: `0.5px solid ${BDR}`,
          flexWrap: 'wrap', gap: '10px', flexShrink: 0,
        }}>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>
              ALMA · AGENCIA CREATIVA
            </p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '18px' : '22px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>
              Finanzas
            </h1>
          </div>

          {/* Tab pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {([
              { key: 'finanzas', label: '💰 Dashboard' },
              { key: 'clientes', label: '💼 Clientes' },
              { key: 'metricas', label: '📊 Métricas Redes' },
            ] as { key: FinTab; label: string }[]).map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: '7px 16px', borderRadius: '20px', border: 'none',
                background: tab === t.key ? C1 : DIM,
                color:      tab === t.key ? '#fff' : MUT,
                fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                transition: 'all .2s',
                boxShadow: tab === t.key ? `0 0 14px ${C1}55` : 'none',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════
            TAB: DASHBOARD FINANCIERO
        ════════════════════════════════════════════════ */}
        {tab === 'finanzas' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px 32px' }}>
            {loadingFin && !finLoaded ? (
              <ListSkeleton rows={6} />
            ) : (
              <>
                {/* ─ Selector de mes + acciones ─ */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '10px', padding: '4px' }}>
                    <button onClick={() => setFinMes(shiftMonth(finMes, -1))} style={{ border: 'none', background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '14px', padding: '4px 10px' }}>◀</button>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: WHT, minWidth: '130px', textAlign: 'center', textTransform: 'capitalize' }}>{mesLabel(finMes)}</span>
                    <button onClick={() => setFinMes(shiftMonth(finMes, 1))} style={{ border: 'none', background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '14px', padding: '4px 10px' }}>▶</button>
                  </div>
                  {finMes !== currentMonthKey() && (
                    <button onClick={() => setFinMes(currentMonthKey())} style={{ border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '11px', fontWeight: 700, padding: '7px 14px', borderRadius: '8px' }}>
                      Hoy
                    </button>
                  )}
                  <div style={{ flex: 1 }} />
                  {legacy && (
                    <button onClick={importLegacy} disabled={importing} style={{ border: `0.5px solid ${AMB}55`, background: `${AMB}12`, color: AMB, cursor: importing ? 'wait' : 'pointer', fontSize: '11px', fontWeight: 700, padding: '8px 14px', borderRadius: '8px' }}>
                      {importing ? 'Importando…' : `⬆ Importar dashboard anterior (${legacy.n})`}
                    </button>
                  )}
                  <button onClick={exportCsv} style={{ border: `0.5px solid ${BDR2}`, background: DIM, color: WHT, cursor: 'pointer', fontSize: '11px', fontWeight: 700, padding: '8px 14px', borderRadius: '8px' }}>
                    ⬇ Exportar CSV
                  </button>
                </div>

                {/* ─ KPIs del mes ─ */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '12px' }}>
                  {[
                    { lbl: 'Ingresos del mes', val: fmtCOP(ingresosTotal), sub: ingresosCxc > 0 ? `${fmtCOP(ingresosCxc)} de cuentas de cobro` : 'Manuales + cuentas pagadas', col: GRN,  ico: '↑' },
                    { lbl: 'Gastos del mes',   val: fmtCOP(gastosTotal),   sub: `Operativos ${fmtCOP(gastosOp)} · Pers. ${fmtCOP(gastosPer)}`,                                  col: ROSE, ico: '↓' },
                    { lbl: 'Utilidad',         val: fmtCOP(utilidad),      sub: utilidad >= 0 ? 'Resultado del mes' : 'Pérdida del mes',                                          col: utilidad >= 0 ? TEAL : ROSE, ico: '◆' },
                    { lbl: 'Margen',           val: `${margen}%`,          sub: 'Utilidad / ingresos',                                                                            col: ACC2, ico: '%' },
                  ].map(k => (
                    <div key={k.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '16px 18px 13px', position: 'relative', overflow: 'hidden' }}>
                      <p style={{ margin: '0 0 8px', fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: MUT }}>{k.lbl}</p>
                      <p style={{ margin: '0 0 3px', fontSize: '22px', fontWeight: 300, color: k.col, lineHeight: 1, fontFamily: 'Georgia, serif' }}>{k.val}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: MUT }}>{k.sub}</p>
                      <span style={{ position: 'absolute', bottom: 0, right: '10px', fontSize: '40px', color: GHOST, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{k.ico}</span>
                    </div>
                  ))}
                </div>

                {/* ─ KPIs del negocio ─ */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { lbl: 'MRR contratos activos', val: fmtCOP(facturacion),  sub: `${activos.length} cliente${activos.length !== 1 ? 's' : ''} activo${activos.length !== 1 ? 's' : ''}`, col: AMB },
                    { lbl: 'Por cobrar',            val: fmtCOP(cxcPendTotal), sub: `${cxcPendientes.length} cuenta${cxcPendientes.length !== 1 ? 's' : ''} pendiente${cxcPendientes.length !== 1 ? 's' : ''}`, col: BLUE },
                    { lbl: 'Cuentas vencidas',      val: fmtCOP(cxcVencTotal), sub: cxcVencidas.length > 0 ? `${cxcVencidas.length} requieren gestión` : 'Sin cuentas vencidas', col: cxcVencidas.length > 0 ? ROSE : MUT },
                  ].map(k => (
                    <div key={k.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '14px 18px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: k.col, opacity: 0.6 }} />
                      <p style={{ margin: '0 0 6px', fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: MUT }}>{k.lbl}</p>
                      <p style={{ margin: '0 0 3px', fontSize: '19px', fontWeight: 300, color: k.col, lineHeight: 1, fontFamily: 'Georgia, serif' }}>{k.val}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: MUT }}>{k.sub}</p>
                    </div>
                  ))}
                </div>

                {/* ─ Registrar movimiento + Flujo 6 meses ─ */}
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '24px' }}>

                  {/* Form nuevo movimiento */}
                  <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '18px' }}>
                    <p style={{ margin: '0 0 14px', fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: MUT }}>Registrar movimiento</p>
                    {/* Tipo pills */}
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                      {(Object.keys(TIPO_META) as MovimientoTipo[]).map(t => (
                        <button key={t} onClick={() => { setFTipo(t); setFCat(CATS[t][0]) }} style={{
                          padding: '6px 13px', borderRadius: '20px', cursor: 'pointer', fontSize: '11px', fontWeight: 700,
                          border: `1px solid ${fTipo === t ? TIPO_META[t].color : BDR2}`,
                          background: fTipo === t ? `${TIPO_META[t].color}15` : 'transparent',
                          color: fTipo === t ? TIPO_META[t].color : MUT,
                        }}>
                          {TIPO_META[t].label}
                        </button>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <label style={labelSt}>Fecha
                        <input type="date" value={fFecha} onChange={e => setFFecha(e.target.value)} style={inputSt} />
                      </label>
                      <label style={labelSt}>Categoría
                        <select value={fCat} onChange={e => setFCat(e.target.value)} style={inputSt}>
                          {CATS[fTipo].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '14px' }}>
                      <label style={labelSt}>Descripción
                        <input value={fDesc} onChange={e => setFDesc(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addMovimiento() }} placeholder="Ej: Mensualidad Casa Mama" style={inputSt} />
                      </label>
                      <label style={labelSt}>Monto (COP)
                        <input type="number" min="0" value={fMonto} onChange={e => setFMonto(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addMovimiento() }} placeholder="0" style={inputSt} />
                      </label>
                    </div>
                    <button onClick={addMovimiento} disabled={savingMov} style={{
                      width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: savingMov ? 'wait' : 'pointer',
                      background: `linear-gradient(135deg,${C1},${ACC2})`, color: '#fff', fontWeight: 800, fontSize: '12px', letterSpacing: '0.5px',
                    }}>
                      {savingMov ? 'Guardando…' : '+ Registrar'}
                    </button>
                  </div>

                  {/* Flujo 6 meses */}
                  <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <p style={{ margin: 0, fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: MUT }}>Flujo últimos 6 meses</p>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ fontSize: '10px', color: GRN, fontWeight: 700 }}>● Ingresos</span>
                        <span style={{ fontSize: '10px', color: ROSE, fontWeight: 700 }}>● Gastos</span>
                      </div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: isMobile ? '6px' : '12px', minHeight: '130px' }}>
                      {serie6.map(s => (
                        <div key={s.mes} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '110px', width: '100%', justifyContent: 'center' }}>
                            <div title={`Ingresos: ${fmtCOP(s.ing)}`} style={{ width: '38%', maxWidth: '22px', height: `${Math.max(2, (s.ing / maxSerie) * 100)}%`, background: `linear-gradient(180deg, ${GRN}, ${GRN}66)`, borderRadius: '3px 3px 0 0' }} />
                            <div title={`Gastos: ${fmtCOP(s.gas)}`} style={{ width: '38%', maxWidth: '22px', height: `${Math.max(2, (s.gas / maxSerie) * 100)}%`, background: `linear-gradient(180deg, ${ROSE}, ${ROSE}66)`, borderRadius: '3px 3px 0 0' }} />
                          </div>
                          <span style={{ fontSize: '9px', color: s.mes === finMes ? WHT : MUT, fontWeight: s.mes === finMes ? 800 : 600, textTransform: 'capitalize' }}>
                            {new Date(s.mes + '-15T12:00:00').toLocaleDateString('es-CO', { month: 'short' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ─ Movimientos del mes ─ */}
                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 18px', borderBottom: `0.5px solid ${BDR}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ margin: 0, fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: MUT }}>
                      Movimientos · <span style={{ textTransform: 'capitalize' }}>{mesLabel(finMes)}</span>
                    </p>
                    <span style={{ fontSize: '10px', color: MUT }}>{movsMes.length + cxcPagadasMes.length} registros</span>
                  </div>

                  {movsMes.length === 0 && cxcPagadasMes.length === 0 ? (
                    <p style={{ padding: '36px', textAlign: 'center', color: MUT, fontSize: '13px' }}>
                      Sin movimientos en {mesLabel(finMes)}. Registra el primero con el formulario de arriba.
                    </p>
                  ) : (
                    <>
                      {/* Cuentas de cobro pagadas (ingresos automáticos) */}
                      {cxcPagadasMes.map((c, i) => (
                        <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 18px', borderBottom: `0.5px solid ${BDR}`, background: i % 2 === 0 ? 'transparent' : ZEBRA, flexWrap: 'wrap' }}>
                          <span style={{ flexShrink: 0, fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '4px', background: `${TEAL}15`, color: TEAL, border: `0.5px solid ${TEAL}40` }}>CXC</span>
                          <span style={{ fontSize: '11px', color: MUT, flexShrink: 0, width: '74px' }}>{c.fecha}</span>
                          <span style={{ fontSize: '12px', color: WHT, fontWeight: 600, flex: 1, minWidth: '140px' }}>{c.numero} · {c.clienteNombre}</span>
                          <span style={{ fontSize: '10px', color: MUT, flexShrink: 0 }}>Cuenta de cobro pagada</span>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: GRN, fontFamily: 'Georgia, serif', flexShrink: 0, width: '110px', textAlign: 'right' }}>+{fmtCOP(c.total ?? 0)}</span>
                          <span style={{ width: '28px', flexShrink: 0 }} />
                        </div>
                      ))}
                      {/* Movimientos manuales */}
                      {movsMes.map((m, i) => {
                        const meta = TIPO_META[m.tipo]
                        return (
                          <div key={m._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 18px', borderBottom: `0.5px solid ${BDR}`, background: (cxcPagadasMes.length + i) % 2 === 0 ? 'transparent' : ZEBRA, flexWrap: 'wrap' }}>
                            <span style={{ flexShrink: 0, fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px', padding: '3px 8px', borderRadius: '4px', background: `${meta.color}15`, color: meta.color, border: `0.5px solid ${meta.color}40` }}>{meta.short}</span>
                            <span style={{ fontSize: '11px', color: MUT, flexShrink: 0, width: '74px' }}>{m.fecha}</span>
                            <span style={{ fontSize: '12px', color: WHT, fontWeight: 600, flex: 1, minWidth: '140px' }}>{m.descripcion}</span>
                            <span style={{ fontSize: '10px', color: MUT, flexShrink: 0 }}>{m.categoria}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: meta.sign > 0 ? GRN : ROSE, fontFamily: 'Georgia, serif', flexShrink: 0, width: '110px', textAlign: 'right' }}>
                              {meta.sign > 0 ? '+' : '−'}{fmtCOP(m.monto)}
                            </span>
                            <button onClick={() => removeMovimiento(m)} title="Eliminar" style={{ width: '28px', flexShrink: 0, border: 'none', background: 'transparent', color: MUT, cursor: 'pointer', fontSize: '13px', padding: '2px' }}>🗑</button>
                          </div>
                        )
                      })}
                    </>
                  )}
                </div>

                <p style={{ margin: '12px 0 0', fontSize: '10.5px', color: MUT }}>
                  💡 Los ingresos combinan movimientos manuales y cuentas de cobro <strong style={{ color: TEAL }}>pagadas</strong> (según su fecha de emisión). Gestiona las cuentas en el módulo Cuentas de Cobro.
                </p>
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            TAB: CLIENTES (Firestore)
        ════════════════════════════════════════════════ */}
        {tab === 'clientes' && (
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px 32px' }}>

            {loadingCl ? (
              <ListSkeleton rows={5} />
            ) : (
              <>
                {/* ─ KPI cards ─ */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                  {[
                    { label: 'Facturación activa',  value: fmtCOP(facturacion),      sub: `${activos.length} clientes`,    color: ACC2 },
                    { label: 'Ticket promedio',      value: fmtCOP(ticketProm),       sub: 'Clientes activos',              color: AMB  },
                    { label: 'Clientes activos',     value: String(activos.length),   sub: 'En servicio ahora',             color: '#10B981' },
                    { label: 'Pausados',             value: String(pausados.length),  sub: 'Sin facturación activa',        color: AMB  },
                    { label: 'Prospectos',           value: String(prospectos.length),sub: 'En proceso de cierre',          color: BLUE },
                  ].map(k => (
                    <div key={k.label} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: k.color, opacity: 0.6 }} />
                      <p style={{ margin: '0 0 6px', fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: MUT }}>{k.label}</p>
                      <p style={{ margin: '0 0 3px', fontSize: '24px', fontWeight: 300, color: k.color, lineHeight: 1, fontFamily: 'Georgia, serif' }}>{k.value}</p>
                      <p style={{ margin: 0, fontSize: '10px', color: MUT }}>{k.sub}</p>
                    </div>
                  ))}
                </div>

                {/* ─ Filters ─ */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    placeholder="Buscar marca o email..."
                    value={clSearch}
                    onChange={e => setClSearch(e.target.value)}
                    style={{ ...inputSt, width: '220px', fontSize: '12px', padding: '7px 10px' }}
                  />
                  <select
                    value={clEstado}
                    onChange={e => setClEstado(e.target.value)}
                    style={{ ...inputSt, width: 'auto', colorScheme: CS, fontSize: '12px', padding: '7px 10px' }}
                  >
                    <option value="todos">Todos los estados</option>
                    <option value="activo">Activos</option>
                    <option value="pausado">Pausados</option>
                    <option value="prospecto">Prospectos</option>
                    <option value="finalizado">Finalizados</option>
                  </select>
                  <select
                    value={clSort}
                    onChange={e => setClSort(e.target.value as 'marca' | 'valor' | 'estado')}
                    style={{ ...inputSt, width: 'auto', colorScheme: CS, fontSize: '12px', padding: '7px 10px' }}
                  >
                    <option value="marca">Ordenar: Marca A-Z</option>
                    <option value="valor">Ordenar: Mayor valor</option>
                    <option value="estado">Ordenar: Estado</option>
                  </select>
                  <span style={{ fontSize: '11px', color: MUT, marginLeft: 'auto' }}>{clFiltered.length} clientes</span>
                </div>

                {/* ─ Table ─ */}
                <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr', gap: '0', borderBottom: `0.5px solid ${BDR}`, padding: '10px 18px' }}>
                    {['Cliente / Marca', 'Estado', 'Plan', 'Valor / mes', 'Inicio'].map(h => (
                      <span key={h} style={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: MUT }}>{h}</span>
                    ))}
                  </div>
                  {clFiltered.length === 0 ? (
                    <p style={{ padding: '32px', textAlign: 'center', color: MUT, fontSize: '13px' }}>Sin resultados</p>
                  ) : clFiltered.map((c, i) => {
                    const estado = ESTADO_META[c.estado] ?? ESTADO_META['finalizado']
                    const valor  = parseValor(c.valor_contrato)
                    return (
                      <div key={c._id} style={{
                        display: 'grid', gridTemplateColumns: '2fr 1fr 1.2fr 1fr 1fr',
                        gap: '0', padding: '12px 18px',
                        borderBottom: i < clFiltered.length - 1 ? `0.5px solid ${BDR}` : 'none',
                        background: i % 2 === 0 ? 'transparent' : ZEBRA,
                        alignItems: 'center',
                      }}>
                        {/* Marca */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                          {c.logo_url ? (
                            <img src={c.logo_url} alt="" style={{ width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: `linear-gradient(135deg,${C1},${ACC2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                              {(c.marca || c.nombre).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: '13px', color: WHT, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.marca || c.nombre}</p>
                            <p style={{ margin: 0, fontSize: '10px', color: MUT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
                          </div>
                        </div>

                        {/* Estado */}
                        <div>
                          <span style={{ background: estado.bg, color: estado.color, borderRadius: '6px', padding: '3px 9px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.3px' }}>
                            {estado.label}
                          </span>
                        </div>

                        {/* Plan */}
                        <div>
                          {c.plan_mes?.nombre ? (
                            <span style={{ color: ACC2, fontSize: '12px', fontWeight: 600 }}>{c.plan_mes.nombre}</span>
                          ) : (
                            <span style={{ color: BDR2, fontSize: '11px' }}>—</span>
                          )}
                        </div>

                        {/* Valor */}
                        <div>
                          {valor > 0 ? (
                            <span style={{ fontSize: '14px', fontWeight: 300, color: c.estado === 'activo' ? AMB : MUT, fontFamily: 'Georgia, serif' }}>
                              {fmtCOP(valor)}
                              {c.moneda === 'USD' && <span style={{ fontSize: '9px', color: MUT, marginLeft: '4px' }}>USD</span>}
                            </span>
                          ) : (
                            <span style={{ color: BDR2, fontSize: '11px' }}>—</span>
                          )}
                        </div>

                        {/* Fecha inicio */}
                        <div style={{ fontSize: '11px', color: MUT }}>
                          {c.fecha_inicio
                            ? new Date(c.fecha_inicio + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* ─ Totales activos ─ */}
                {activos.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end', gap: '4px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: MUT, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                      Total facturación activos:
                    </span>
                    <span style={{ fontSize: '18px', fontWeight: 300, color: AMB, fontFamily: 'Georgia, serif' }}>
                      {fmtCOP(facturacion)}
                    </span>
                    <span style={{ fontSize: '10px', color: MUT }}>COP / mes</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ════════════════════════════════════════════════
            TAB: MÉTRICAS REDES
        ════════════════════════════════════════════════ */}
        {tab === 'metricas' && (
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

            {/* ─ Sidebar clientes ─ */}
            <div style={{ width: '240px', flexShrink: 0, borderRight: `0.5px solid ${BDR}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '12px 14px', borderBottom: `0.5px solid ${BDR}` }}>
                <p style={{ margin: '0 0 7px', fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: MUT }}>
                  Clientes
                </p>
                <input
                  placeholder="Buscar marca..."
                  value={searchQ}
                  onChange={e => setSearchQ(e.target.value)}
                  style={{ ...inputSt, fontSize: '12px', padding: '7px 10px' }}
                />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
                {loadingCl ? (
                  <ListSkeleton rows={3} />
                ) : filteredMClients.length === 0 ? (
                  <p style={{ padding: '20px', color: MUT, fontSize: '12px', textAlign: 'center' }}>Sin resultados</p>
                ) : filteredMClients.map(c => {
                  const hasData = (c.metricas_historico ?? []).some(m => m.plataforma)
                  const isActive = selectedId === c._id
                  return (
                    <button key={c._id} onClick={() => selectMetricClient(c._id!)} style={{
                      width: '100%', textAlign: 'left', padding: '9px 14px',
                      background: isActive ? 'rgba(138,63,252,0.13)' : 'transparent',
                      border: 'none',
                      borderLeft: isActive ? `3px solid ${C1}` : '3px solid transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px',
                      transition: 'background .15s',
                    }}>
                      {c.logo_url ? (
                        <img src={c.logo_url} alt="" style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: `linear-gradient(135deg,${C1},${ACC2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>
                          {(c.marca || c.nombre).charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '12px', color: isActive ? WHT : '#C4B8D4', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.marca || c.nombre}
                        </p>
                        {hasData && (
                          <p style={{ margin: 0, fontSize: '9px', color: ACC2, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>✦ con datos</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ─ Main panel métricas ─ */}
            {!selectedClient ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '52px', opacity: 0.08 }}>📊</div>
                <p style={{ color: MUT, fontSize: '14px', margin: 0 }}>Selecciona un cliente para ingresar métricas</p>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                {/* Client header */}
                <div style={{ padding: '14px 22px', borderBottom: `0.5px solid ${BDR}`, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flexShrink: 0 }}>
                  {selectedClient.logo_url && (
                    <img src={selectedClient.logo_url} alt="" style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover' }} />
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: '15px', color: WHT }}>{selectedClient.marca || selectedClient.nombre}</p>
                    <p style={{ margin: 0, fontSize: '11px', color: MUT }}>{selectedClient.email}</p>
                  </div>
                  {selectedClient.valor_contrato && (
                    <div style={{ marginLeft: 'auto', background: 'rgba(251,191,36,0.1)', border: `1px solid rgba(251,191,36,0.2)`, borderRadius: '8px', padding: '6px 12px' }}>
                      <p style={{ margin: '0 0 1px', fontSize: '9px', color: MUT, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>Contrato</p>
                      <p style={{ margin: 0, fontSize: '14px', color: AMB, fontWeight: 300, fontFamily: 'Georgia, serif' }}>{selectedClient.valor_contrato}</p>
                    </div>
                  )}
                </div>

                {/* Platform tabs */}
                <div style={{ display: 'flex', borderBottom: `0.5px solid ${BDR}`, overflowX: 'auto', flexShrink: 0 }}>
                  {PLATFORMS.map(p => {
                    const count = (selectedClient.metricas_historico ?? []).filter(m => m.plataforma === p.id).length
                    const isActive = platform === p.id
                    return (
                      <button key={p.id} onClick={() => onPlatformChange(p.id)} style={{
                        padding: '11px 16px', background: 'transparent', border: 'none',
                        borderBottom: isActive ? `2px solid ${p.color}` : '2px solid transparent',
                        color: isActive ? p.color : MUT,
                        cursor: 'pointer', fontWeight: 700, fontSize: '11px',
                        letterSpacing: '0.3px', whiteSpace: 'nowrap',
                        transition: 'all .2s', marginBottom: '-0.5px',
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: p.color, flexShrink: 0 }} />
                        {p.label}
                        {count > 0 && (
                          <span style={{ background: 'rgba(168,85,247,0.15)', color: ACC2, borderRadius: '10px', padding: '1px 6px', fontSize: '9px', fontWeight: 800 }}>
                            {count}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                  {/* Form panel */}
                  <div style={{ background: DIM, borderRadius: '12px', border: `1px solid ${BDR}` }}>
                    <div style={{ padding: '12px 16px', borderBottom: `0.5px solid ${BDR}`, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: getPlatform(platform)?.color ?? C1 }} />
                        <span style={{ fontWeight: 800, fontSize: '13px', color: WHT }}>{getPlatform(platform)?.label}</span>
                        {editKey === `${mesValue}|${platform}` && (
                          <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981', borderRadius: '6px', padding: '2px 8px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase' }}>✎ editando</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                        <span style={{ fontSize: '10px', color: MUT, fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Período:</span>
                        <input type="month" value={mesValue} onChange={e => onMesChange(e.target.value)}
                          style={{ ...inputSt, width: 'auto', colorScheme: CS, fontSize: '12px', padding: '6px 10px' }} />
                      </div>
                    </div>
                    <div style={{ padding: '16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                        {MET_FIELDS.map(f => (
                          <label key={String(f.key)} style={labelSt}>
                            {f.icon} {f.label}
                            <input type="number" min={0} step={f.step ?? 1} placeholder="—"
                              value={(form[f.key] as number | undefined) ?? ''}
                              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value !== '' ? +e.target.value : undefined }))}
                              style={inputSt} />
                          </label>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={saveMetric} disabled={saving} style={{
                          padding: '9px 22px', borderRadius: '9px', border: 'none',
                          background: `linear-gradient(135deg, ${C1}, ${ACC2})`,
                          color: '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer',
                          opacity: saving ? 0.6 : 1,
                        }}>
                          {saving ? 'Guardando...' : editKey === `${mesValue}|${platform}` ? '✓ Actualizar' : '+ Guardar métricas'}
                        </button>
                        {Object.values(form).some(v => v !== undefined) && (
                          <button onClick={() => { setForm({}); setEditKey(null) }} style={{
                            padding: '9px 16px', borderRadius: '9px', border: `1px solid ${BDR2}`,
                            background: 'transparent', color: MUT, fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                          }}>Limpiar</button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* History */}
                  <div>
                    <p style={{ margin: '0 0 10px', fontSize: '9px', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase', color: MUT }}>
                      Historial · {getPlatform(platform)?.label}
                    </p>
                    {platHistory.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', border: `0.5px dashed ${BDR2}`, borderRadius: '10px' }}>
                        <p style={{ color: MUT, fontSize: '13px', margin: 0 }}>Sin datos para {getPlatform(platform)?.label}. Usa el formulario de arriba para agregar el primer mes.</p>
                      </div>
                    ) : platHistory.map(m => {
                      const pColor = getPlatform(m.plataforma ?? '')?.color ?? C1
                      const isActive = editKey === `${m.mes}|${m.plataforma}`
                      return (
                        <div key={`${m.mes}|${m.plataforma}`} style={{ background: DIM, borderRadius: '10px', border: `1px solid ${isActive ? C1 : BDR}`, marginBottom: '8px' }}>
                          <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: pColor, flexShrink: 0 }} />
                            <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: WHT, textTransform: 'capitalize', minWidth: '110px' }}>{mesLabel(m.mes)}</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                              {m.alcance          != null && <span style={{ fontSize: '11px', color: MUT }}>👁️ {m.alcance.toLocaleString()}</span>}
                              {m.impresiones      != null && <span style={{ fontSize: '11px', color: MUT }}>📡 {m.impresiones.toLocaleString()}</span>}
                              {m.likes            != null && <span style={{ fontSize: '11px', color: MUT }}>❤️ {m.likes.toLocaleString()}</span>}
                              {m.comentarios      != null && <span style={{ fontSize: '11px', color: MUT }}>💬 {m.comentarios.toLocaleString()}</span>}
                              {m.seguidores       != null && <span style={{ fontSize: '11px', color: MUT }}>👥 +{m.seguidores}</span>}
                              {m.engagement       != null && <span style={{ fontSize: '11px', color: '#10B981', fontWeight: 700 }}>📈 {m.engagement}%</span>}
                              {m.posts_publicados != null && <span style={{ fontSize: '11px', color: MUT }}>✅ {m.posts_publicados} posts</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                              <button onClick={() => { if (m.plataforma) onPlatformChange(m.plataforma); onMesChange(m.mes) }} style={{
                                padding: '4px 10px', borderRadius: '6px', border: `1.5px solid ${C1}`,
                                background: isActive ? C1 : 'transparent', color: isActive ? '#fff' : C1,
                                cursor: 'pointer', fontWeight: 700, fontSize: '11px',
                              }}>✏️ Editar</button>
                              <button onClick={() => deleteMetric(m.mes, m.plataforma ?? '')} style={{
                                padding: '4px 8px', borderRadius: '6px', border: `1.5px solid rgba(255,77,141,0.3)`,
                                background: 'transparent', color: ROSE, cursor: 'pointer', fontWeight: 700, fontSize: '11px',
                              }}>×</button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

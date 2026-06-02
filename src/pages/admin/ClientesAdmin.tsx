import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  getClientes, saveCliente, updateCliente, deleteCliente,
  updateSolicitudEnCliente, marcaToSlug,
} from '../../lib/db'
import type { Cliente, Entregable, ParrillaItem, Solicitud, MetricaMes } from '../../data/clientes'
import {
  CLIENTE_ESTADOS, SERVICIOS_DISPONIBLES, ENTREGABLE_CATEGORIAS,
  PARRILLA_ESTADOS, SOLICITUD_TIPOS, SOLICITUD_ESTADOS, PILARES_CONTENIDO,
  ENTREGABLE_REVISION_ESTADOS,
} from '../../data/clientes'

/* ── Colores del módulo ──────────────────────────────────── */
const C1     = '#059669'
const C1_BG  = 'rgba(5,150,105,0.10)'

/* ── Helpers ─────────────────────────────────────────────── */
type ModalTab = 'perfil' | 'entregables' | 'parrilla' | 'solicitudes' | 'metricas' | 'portal'

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const EMPTY_FORM: Omit<Cliente, '_id'> = {
  nombre: '', email: '', marca: '',
  servicios: [], estado: 'activo',
  entregables: [], parrilla: [], solicitudes: [],
}

const REDES_OPCIONES = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter/X', 'Pinterest', 'Otro']
const TIPO_POST_OPCIONES = ['Reel', 'Carrusel', 'Post', 'Story', 'Video', 'Blog', 'Email', 'Otro']
const DURACION_OPCIONES  = ['', '15 seg', '20 seg', '30 seg', '45 seg', '1 min', '2 min', '3 slides', '5 slides', '7 slides', '10 slides']

/* ── Sub-componentes ─────────────────────────────────────── */
function EstadoBadge({ estado }: { estado: string }) {
  const e = CLIENTE_ESTADOS.find(x => x.value === estado)
  if (!e) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '20px',
      background: e.bg, color: e.color,
      fontSize: '11.5px', fontWeight: 700,
    }}>
      {e.icon} {e.label}
    </span>
  )
}

/* ── Main component ──────────────────────────────────────── */
export default function ClientesAdmin() {
  const isMobile = useIsMobile()

  /* list */
  const [clientes,     setClientes]    = useState<Cliente[]>([])
  const [loading,      setLoading]     = useState(true)
  const [search,       setSearch]      = useState('')
  const [filterEstado, setFilterEstado]= useState('all')

  /* modal */
  const [showModal,  setShowModal]  = useState(false)
  const [editId,     setEditId]     = useState<string | null>(null)
  const [tab,        setTab]        = useState<ModalTab>('perfil')
  const [form,       setForm]       = useState<Omit<Cliente, '_id'>>({ ...EMPTY_FORM })
  const [saving,     setSaving]     = useState(false)
  const [saveMsg,    setSaveMsg]    = useState('')

  /* sub-forms */
  const [newE, setNewE] = useState<Partial<Entregable>>({ categoria: 'branding', nombre: '', url: '' })
  const [newP, setNewP] = useState<Partial<ParrillaItem>>({ fecha: '', red: 'Instagram', tipo: 'Reel', descripcion: '', estado: 'borrador' })
  const [editingParrillaId, setEditingParrillaId] = useState<string | null>(null)
  const [newMes, setNewMes] = useState<Partial<MetricaMes>>({ mes: '' })
  const [editMes, setEditMes] = useState<string | null>(null)
  const [editingParrillaData, setEditingParrillaData] = useState<Partial<ParrillaItem>>({})
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})

  /* confirm delete */
  const [confirmId, setConfirmId] = useState<string | null>(null)

  /* load */
  useEffect(() => {
    getClientes().then(data => { setClientes(data); setLoading(false) })
  }, [])

  /* ── handlers ── */
  function handleNew() {
    setForm({ ...EMPTY_FORM })   // sin token; se genera desde la marca al guardar
    setEditId(null); setTab('perfil'); setSaveMsg(''); setShowModal(true)
  }

  function handleEdit(c: Cliente) {
    setForm({ ...c })
    setEditId(c._id!)
    setTab('perfil'); setSaveMsg(''); setShowModal(true)
    // pre-fill respuestas
    const r: Record<string, string> = {}
    c.solicitudes.forEach(s => { if (s.respuesta) r[s.id] = s.respuesta })
    setRespuestas(r)
  }

  async function handleSave() {
    if (!form.nombre.trim() || !form.email.trim() || !form.marca.trim()) {
      setSaveMsg('Nombre, email y marca son obligatorios.')
      return
    }
    setSaving(true); setSaveMsg('')
    try {
      if (editId) {
        await updateCliente(editId, form)
        setClientes(prev => prev.map(c => c._id === editId ? { ...form, _id: editId } : c))
      } else {
        // saveCliente genera el slug desde la marca y retorna { id, slug }
        const { id, slug } = await saveCliente(form)
        setClientes(prev => [{ ...form, access_token: slug, _id: id }, ...prev])
      }
      setShowModal(false)
    } catch (e) {
      setSaveMsg('Error al guardar: ' + String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    await deleteCliente(id)
    setClientes(prev => prev.filter(c => c._id !== id))
    setConfirmId(null)
  }

  function addEntregable() {
    if (!newE.nombre?.trim() || !newE.url?.trim()) return
    const item: Entregable = {
      id: newId(),
      categoria: newE.categoria ?? 'otro',
      nombre: newE.nombre.trim(),
      url: newE.url.trim(),
      descripcion: newE.descripcion?.trim(),
    }
    setForm(f => ({ ...f, entregables: [...f.entregables, item] }))
    setNewE({ categoria: 'branding', nombre: '', url: '' })
  }

  function removeEntregable(id: string) {
    setForm(f => ({ ...f, entregables: f.entregables.filter(e => e.id !== id) }))
  }

  function addParrillaItem() {
    if (!newP.fecha?.trim() || !newP.descripcion?.trim()) return
    const item: ParrillaItem = {
      id:          newId(),
      dia_num:     newP.dia_num,
      semana:      newP.semana,
      fecha:       newP.fecha,
      red:         newP.red ?? 'Instagram',
      tipo:        newP.tipo ?? 'Reel',
      duracion:    newP.duracion || undefined,
      descripcion: newP.descripcion.trim(),
      subtitulo:   newP.subtitulo?.trim() || undefined,
      pilar:       newP.pilar || undefined,
      cta:         newP.cta?.trim() || undefined,
      estado:      newP.estado ?? 'borrador',
      link:        newP.link?.trim() || undefined,
    }
    setForm(f => ({ ...f, parrilla: [...f.parrilla, item] }))
    setNewP({ fecha: '', red: 'Instagram', tipo: 'Reel', descripcion: '', estado: 'borrador' })
  }

  function removeParrillaItem(id: string) {
    setForm(f => ({ ...f, parrilla: f.parrilla.filter(p => p.id !== id) }))
    if (editingParrillaId === id) setEditingParrillaId(null)
  }

  function updateParrillaEstado(id: string, estado: ParrillaItem['estado']) {
    setForm(f => ({
      ...f,
      parrilla: f.parrilla.map(p => p.id === id ? { ...p, estado } : p),
    }))
    if (editingParrillaId === id) setEditingParrillaData(d => ({ ...d, estado }))
  }

  function openEditParrilla(item: ParrillaItem) {
    setEditingParrillaId(item.id)
    setEditingParrillaData({ ...item })
  }

  function saveEditParrilla() {
    if (!editingParrillaId) return
    setForm(f => ({
      ...f,
      parrilla: f.parrilla.map(p => p.id === editingParrillaId ? { ...p, ...editingParrillaData } : p),
    }))
    setEditingParrillaId(null)
    setEditingParrillaData({})
  }

  function upsertMetricaMes() {
    if (!newMes.mes) return
    setForm(f => {
      const hist = f.metricas_historico ?? []
      const exists = hist.find(m => m.mes === newMes.mes)
      return {
        ...f,
        metricas_historico: exists
          ? hist.map(m => m.mes === newMes.mes ? { ...m, ...newMes } : m)
          : [...hist, newMes as MetricaMes].sort((a, b) => a.mes.localeCompare(b.mes)),
      }
    })
    setNewMes({ mes: '' })
    setEditMes(null)
  }

  function removeMetricaMes(mes: string) {
    setForm(f => ({ ...f, metricas_historico: (f.metricas_historico ?? []).filter(m => m.mes !== mes) }))
  }

  function startEditMes(m: MetricaMes) {
    setEditMes(m.mes)
    setNewMes({ ...m })
  }

  async function saveSolicitudRespuesta(s: Solicitud) {
    if (!editId) return
    const token = form.access_token ?? ''
    const changes: Partial<Solicitud> = {
      estado:    s.estado,
      respuesta: respuestas[s.id] ?? s.respuesta,
    }
    await updateSolicitudEnCliente(editId, token, s.id, changes)
    setForm(f => ({
      ...f,
      solicitudes: f.solicitudes.map(x => x.id === s.id ? { ...x, ...changes } : x),
    }))
  }

  /* ── filtered list ── */
  const visible = clientes.filter(c => {
    const matchSearch = !search ||
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.marca.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filterEstado === 'all' || c.estado === filterEstado
    return matchSearch && matchEstado
  })

  /* ── stats ── */
  const total    = clientes.length
  const activos  = clientes.filter(c => c.estado === 'activo').length
  const pendSol  = clientes.reduce((n, c) => n + c.solicitudes.filter(s => s.estado === 'pendiente').length, 0)
  const conPortal= clientes.filter(c => c.access_token).length

  /* ── Portal URL helper ── */
  const PORTAL_BASE = 'https://almaagenciacreativa.com/cliente/'

  /* ══ RENDER ═══════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '20px 14px' : '36px 32px', maxWidth: '1400px' }}>

        {/* ── Header ── */}
        <div style={{
          background: `linear-gradient(135deg, #064E3B, ${C1}, #34D399)`,
          borderRadius: '20px', padding: isMobile ? '22px 18px' : '32px 36px',
          marginBottom: '28px', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '120px', opacity: 0.07, userSelect: 'none' }}>👥</div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.7)', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase' }}>ALMA AGENCIA CREATIVA</p>
              <h1 style={{ margin: '0 0 6px', color: '#fff', fontSize: isMobile ? '22px' : '28px', fontWeight: 900 }}>👥 Portal de Clientes</h1>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>Gestiona fichas, entregables, parrilla y solicitudes</p>
            </div>
            <button
              onClick={handleNew}
              style={{
                background: '#fff', color: C1, border: 'none', cursor: 'pointer',
                padding: '11px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '13px',
                display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0,
              }}
            >
              + Nuevo cliente
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Total clientes', value: total, icon: '👤', color: '#374151' },
            { label: 'Activos',        value: activos, icon: '🟢', color: C1 },
            { label: 'Con portal',     value: conPortal, icon: '🔗', color: '#6B21A8' },
            { label: 'Solicitudes pendientes', value: pendSol, icon: '🔔', color: pendSol > 0 ? '#EF4444' : '#9CA3AF' },
          ].map(m => (
            <div key={m.label} style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB' }}>
              <span style={{ fontSize: '22px', display: 'block', marginBottom: '8px' }}>{m.icon}</span>
              <p style={{ fontSize: '24px', fontWeight: 900, color: m.color, margin: '0 0 3px' }}>{m.value}</p>
              <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, fontWeight: 600 }}>{m.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filtros ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca o email…"
            style={{
              flex: 1, minWidth: '220px', padding: '9px 14px', borderRadius: '10px',
              border: '1.5px solid #E5E7EB', fontSize: '13px', outline: 'none',
            }}
          />
          <select
            value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '10px', border: '1.5px solid #E5E7EB', fontSize: '13px', background: '#fff' }}
          >
            <option value="all">Todos los estados</option>
            {CLIENTE_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.icon} {e.label}</option>)}
          </select>
        </div>

        {/* ── Lista ── */}
        {loading ? (
          <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', padding: '40px 0' }}>Cargando…</p>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <p style={{ fontSize: '40px', margin: '0 0 12px' }}>👥</p>
            <p style={{ color: '#6B7280', fontSize: '15px' }}>
              {clientes.length === 0 ? 'Aún no tienes clientes. ¡Crea el primero!' : 'Sin resultados para ese filtro.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '14px',
          }}>
            {visible.map(c => (
              <ClienteCard
                key={c._id}
                cliente={c}
                onEdit={() => handleEdit(c)}
                onDelete={() => setConfirmId(c._id!)}
                portalBase={PORTAL_BASE}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Confirm delete ── */}
      {confirmId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px 32px', maxWidth: '380px', width: '90%', textAlign: 'center' }}>
            <p style={{ fontSize: '36px', margin: '0 0 12px' }}>⚠️</p>
            <p style={{ fontWeight: 800, fontSize: '16px', color: '#111', margin: '0 0 8px' }}>¿Eliminar cliente?</p>
            <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 24px' }}>Esta acción eliminará también el acceso al portal. No se puede deshacer.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setConfirmId(null)} style={{ padding: '10px 22px', borderRadius: '10px', border: '1.5px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Cancelar</button>
              <button onClick={() => handleDelete(confirmId)} style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#EF4444', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px' }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ═════════════════════════════════════════════ */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 300, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
        }}>
          <div style={{
            background: '#F9FAFB', width: isMobile ? '100%' : '720px',
            maxWidth: '100%', display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
            overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{
              background: '#fff', padding: '18px 24px',
              borderBottom: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
            }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#111' }}>
                {editId ? `✏️ ${form.marca || 'Cliente'}` : '+ Nuevo cliente'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: '#9CA3AF', lineHeight: 1 }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', background: '#fff',
              borderBottom: '2px solid #E5E7EB',
              overflowX: 'auto', flexShrink: 0,
            }}>
              {([
                { key: 'perfil',      label: '👤 Perfil' },
                { key: 'entregables', label: `📋 Contenido (${form.entregables.length})` },
                { key: 'parrilla',    label: `📅 Parrilla (${form.parrilla.length})` },
                { key: 'solicitudes', label: `💬 Solicitudes (${form.solicitudes.length})` },
                { key: 'metricas',    label: `📊 Métricas (${(form.metricas_historico ?? []).length})` },
                { key: 'portal',      label: '🔗 Portal' },
              ] as { key: ModalTab; label: string }[]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: '12px 16px', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: '12.5px', fontWeight: tab === t.key ? 800 : 500,
                    color: tab === t.key ? C1 : '#6B7280',
                    borderBottom: tab === t.key ? `2.5px solid ${C1}` : '2.5px solid transparent',
                    whiteSpace: 'nowrap', transition: 'color 0.15s',
                    marginBottom: '-2px',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>

              {/* ─ PERFIL ─ */}
              {tab === 'perfil' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label style={labelStyle}>
                      Nombre <span style={{ color: '#EF4444' }}>*</span>
                      <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={inputStyle} placeholder="Nombre completo" />
                    </label>
                    <label style={labelStyle}>
                      Marca / Proyecto <span style={{ color: '#EF4444' }}>*</span>
                      <input value={form.marca} onChange={e => setForm(f => ({ ...f, marca: e.target.value }))} style={inputStyle} placeholder="Ej: Studio Alma" />
                    </label>
                    <label style={labelStyle}>
                      Email <span style={{ color: '#EF4444' }}>*</span>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="correo@ejemplo.com" />
                    </label>
                    <label style={labelStyle}>
                      Teléfono
                      <input value={form.telefono ?? ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} style={inputStyle} placeholder="+57 300 000 0000" />
                    </label>
                    <label style={labelStyle}>
                      Empresa
                      <input value={form.empresa ?? ''} onChange={e => setForm(f => ({ ...f, empresa: e.target.value }))} style={inputStyle} placeholder="Nombre de la empresa" />
                    </label>
                    <label style={labelStyle}>
                      Estado
                      <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Cliente['estado'] }))} style={inputStyle}>
                        {CLIENTE_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.icon} {e.label}</option>)}
                      </select>
                    </label>
                    <label style={labelStyle}>
                      Fecha de inicio
                      <input type="date" value={form.fecha_inicio ?? ''} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} style={inputStyle} />
                    </label>
                    <label style={labelStyle}>
                      Fecha de fin
                      <input type="date" value={form.fecha_fin ?? ''} onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} style={inputStyle} />
                    </label>
                    <label style={labelStyle}>
                      Valor del contrato
                      <input value={form.valor_contrato ?? ''} onChange={e => setForm(f => ({ ...f, valor_contrato: e.target.value }))} style={inputStyle} placeholder="Ej: 3.500.000" />
                    </label>
                    <label style={labelStyle}>
                      Moneda
                      <select value={form.moneda ?? 'COP'} onChange={e => setForm(f => ({ ...f, moneda: e.target.value as 'COP' | 'USD' }))} style={inputStyle}>
                        <option value="COP">COP</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label style={labelStyle}>
                      Logo de la marca (URL)
                      <input value={form.logo_url ?? ''} onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))} style={inputStyle} placeholder="https://i.imgur.com/…logo.png" />
                    </label>
                    <label style={labelStyle}>
                      URL del contrato
                      <input value={form.contrato_url ?? ''} onChange={e => setForm(f => ({ ...f, contrato_url: e.target.value }))} style={inputStyle} placeholder="https://drive.google.com/…" />
                    </label>
                  </div>
                  {form.logo_url && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                      <img src={form.logo_url} alt="Logo" style={{ height: '44px', width: '44px', objectFit: 'contain', borderRadius: '8px', background: '#fff', padding: '4px', border: '1px solid #E5E7EB' }} />
                      <div>
                        <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: 700, color: '#374151' }}>Vista previa del logo</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>Se muestra en el portal del cliente</p>
                      </div>
                    </div>
                  )}

                  {/* Servicios */}
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Servicios contratados</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                      {SERVICIOS_DISPONIBLES.map(s => {
                        const active = form.servicios.includes(s)
                        return (
                          <button key={s} onClick={() => setForm(f => ({
                            ...f,
                            servicios: active ? f.servicios.filter(x => x !== s) : [...f.servicios, s],
                          }))} style={{
                            padding: '5px 12px', borderRadius: '20px', border: '1.5px solid',
                            borderColor: active ? C1 : '#E5E7EB',
                            background: active ? C1_BG : '#fff',
                            color: active ? C1 : '#6B7280',
                            fontSize: '12px', fontWeight: active ? 700 : 500,
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Notas internas */}
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📝 Notas internas</p>
                    <textarea
                      value={form.notas ?? ''}
                      onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                      rows={3}
                      placeholder="Solo visible para el equipo de Alma…"
                      style={{ ...inputStyle, resize: 'vertical', background: '#FEFCE8', borderColor: '#FDE68A' }}
                    />
                  </div>
                </div>
              )}

              {/* ─ CONTENIDO ─ */}
              {tab === 'entregables' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {form.entregables.length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>Sin contenidos aún. Agrega el primero abajo.</p>
                  ) : (
                    form.entregables.map(e => {
                      const cat    = ENTREGABLE_CATEGORIAS.find(c => c.key === e.categoria)
                      const revEst = ENTREGABLE_REVISION_ESTADOS.find(x => x.value === (e.estado_revision ?? 'pendiente_revision'))
                      const comentarios = e.comentarios ?? []
                      return (
                        <div key={e.id} style={{
                          background: '#fff', borderRadius: '12px',
                          border: '1px solid #E5E7EB',
                          borderLeft: `4px solid ${cat?.color ?? '#E5E7EB'}`,
                          overflow: 'hidden',
                        }}>
                          {/* Fila principal */}
                          <div style={{ padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                            <span style={{
                              width: '36px', height: '36px', borderRadius: '10px',
                              background: (cat?.color ?? '#6B7280') + '20',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '18px', flexShrink: 0,
                            }}>{cat?.icon ?? '📦'}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#111' }}>{e.nombre}</p>
                                <span style={{ padding: '2px 8px', borderRadius: '20px', background: revEst?.bg ?? '#F3F4F6', color: revEst?.color ?? '#6B7280', fontSize: '10.5px', fontWeight: 800 }}>
                                  {revEst?.icon} {revEst?.label}
                                </span>
                                {comentarios.length > 0 && (
                                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>💬 {comentarios.length}</span>
                                )}
                              </div>
                              {e.descripcion && <p style={{ margin: '0 0 3px', fontSize: '12px', color: '#6B7280' }}>{e.descripcion}</p>}
                              <a href={e.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#6B21A8', wordBreak: 'break-all' }}>{e.url}</a>
                            </div>
                            <button onClick={() => removeEntregable(e.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '18px', flexShrink: 0, lineHeight: 1 }}>×</button>
                          </div>

                          {/* Comentarios del cliente */}
                          {comentarios.length > 0 && (
                            <div style={{ padding: '10px 16px 14px', background: '#FAFAFA', borderTop: '1px solid #F3F4F6' }}>
                              <p style={{ margin: '0 0 8px', fontSize: '10.5px', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Comentarios del cliente
                              </p>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {comentarios.map(c => {
                                  const isAprov = c.tipo === 'aprobacion'
                                  return (
                                    <div key={c.id} style={{
                                      padding: '8px 10px', borderRadius: '8px',
                                      background: isAprov ? '#F0FDF4' : '#FFF1F2',
                                      border: `1px solid ${isAprov ? '#BBF7D0' : '#FECDD3'}`,
                                      display: 'flex', gap: '8px', alignItems: 'flex-start',
                                    }}>
                                      <span style={{ fontSize: '13px', flexShrink: 0 }}>{isAprov ? '✅' : '🔄'}</span>
                                      <div style={{ flex: 1 }}>
                                        <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 800, color: isAprov ? '#059669' : '#DC2626' }}>
                                          {isAprov ? 'Aprobación' : 'Ajuste solicitado'} · {c.autor === 'cliente' ? 'Cliente' : 'Alma'}
                                          {c.createdAt ? ` · ${new Date(c.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}` : ''}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '12.5px', color: '#374151' }}>{c.texto}</p>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}

                  {/* Formulario agregar contenido */}
                  <div style={{ background: '#F0FDF4', border: '1.5px dashed #86EFAC', borderRadius: '14px', padding: '18px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: C1, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>+ Subir contenido</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <label style={labelStyle}>
                        Categoría
                        <select value={newE.categoria} onChange={e => setNewE(n => ({ ...n, categoria: e.target.value as Entregable['categoria'] }))} style={inputStyle}>
                          {ENTREGABLE_CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Nombre del contenido *
                        <input value={newE.nombre ?? ''} onChange={e => setNewE(n => ({ ...n, nombre: e.target.value }))} style={inputStyle} placeholder="Ej: Logo principal" />
                      </label>
                    </div>
                    <label style={{ ...labelStyle, marginBottom: '10px' }}>
                      URL del archivo / link *
                      <input value={newE.url ?? ''} onChange={e => setNewE(n => ({ ...n, url: e.target.value }))} style={inputStyle} placeholder="https://drive.google.com/…" />
                    </label>
                    <label style={{ ...labelStyle, marginBottom: '12px' }}>
                      Descripción (opcional)
                      <input value={newE.descripcion ?? ''} onChange={e => setNewE(n => ({ ...n, descripcion: e.target.value }))} style={inputStyle} placeholder="Contexto breve para el cliente" />
                    </label>
                    <button onClick={addEntregable} style={{
                      background: C1, color: '#fff', border: 'none', cursor: 'pointer',
                      padding: '9px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                    }}>
                      Subir contenido
                    </button>
                  </div>
                </div>
              )}

              {/* ─ PARRILLA ─ */}
              {tab === 'parrilla' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  {/* ── Editor de ítem activo ── */}
                  {editingParrillaId && (() => {
                    const ep = editingParrillaData
                    const pilarInfo = PILARES_CONTENIDO.find(x => x.value === ep.pilar)
                    return (
                      <div style={{ background: '#fff', border: `2px solid ${C1}`, borderRadius: '16px', padding: '20px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <p style={{ margin: 0, fontWeight: 900, fontSize: '14px', color: C1 }}>
                            ✏️ Editando ítem {ep.dia_num ? `#${ep.dia_num}` : ''}
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveEditParrilla} style={{ padding: '7px 18px', borderRadius: '8px', background: C1, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Guardar cambios</button>
                            <button onClick={() => setEditingParrillaId(null)} style={{ padding: '7px 14px', borderRadius: '8px', background: '#F3F4F6', color: '#6B7280', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Cancelar</button>
                          </div>
                        </div>

                        {/* Fila 1: Día, Semana, Fecha, Red, Tipo, Duración */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '12px' }}>
                          <label style={labelStyle}>
                            Día #
                            <input type="number" value={ep.dia_num ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, dia_num: e.target.value ? +e.target.value : undefined }))} style={inputStyle} placeholder="1" min={1} />
                          </label>
                          <label style={labelStyle}>
                            Semana
                            <input type="number" value={ep.semana ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, semana: e.target.value ? +e.target.value : undefined }))} style={inputStyle} placeholder="1" min={1} />
                          </label>
                          <label style={labelStyle}>
                            Fecha *
                            <input type="date" value={ep.fecha ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, fecha: e.target.value }))} style={inputStyle} />
                          </label>
                          <label style={labelStyle}>
                            Red
                            <select value={ep.red ?? 'Instagram'} onChange={e => setEditingParrillaData(d => ({ ...d, red: e.target.value }))} style={inputStyle}>
                              {REDES_OPCIONES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>
                            Tipo
                            <select value={ep.tipo ?? 'Reel'} onChange={e => setEditingParrillaData(d => ({ ...d, tipo: e.target.value }))} style={inputStyle}>
                              {TIPO_POST_OPCIONES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>
                            Duración
                            <select value={ep.duracion ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, duracion: e.target.value || undefined }))} style={inputStyle}>
                              {DURACION_OPCIONES.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                            </select>
                          </label>
                        </div>

                        {/* Fila 2: Hook, Subtítulo, Pilar, CTA */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                          <label style={labelStyle}>
                            Hook / Título *
                            <input value={ep.descripcion ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, descripcion: e.target.value }))} style={inputStyle} placeholder="El gancho principal del post" />
                          </label>
                          <label style={labelStyle}>
                            Subtítulo
                            <input value={ep.subtitulo ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, subtitulo: e.target.value }))} style={inputStyle} placeholder="Descripción adicional…" />
                          </label>
                          <label style={labelStyle}>
                            Pilar
                            <select value={ep.pilar ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, pilar: e.target.value || undefined }))} style={{ ...inputStyle, borderColor: pilarInfo?.color ?? '#E5E7EB', background: pilarInfo?.bg ?? '#fff' }}>
                              <option value="">Sin pilar</option>
                              {PILARES_CONTENIDO.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>
                            CTA
                            <input value={ep.cta ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, cta: e.target.value }))} style={inputStyle} placeholder='DM "HOLA"' />
                          </label>
                        </div>

                        {/* Fila 3: Estado, Link */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px', marginBottom: '16px' }}>
                          <label style={labelStyle}>
                            Estado
                            <select value={ep.estado ?? 'borrador'} onChange={e => setEditingParrillaData(d => ({ ...d, estado: e.target.value as ParrillaItem['estado'] }))} style={inputStyle}>
                              {PARRILLA_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>
                            Link publicado
                            <input value={ep.link ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, link: e.target.value }))} style={inputStyle} placeholder="https://instagram.com/p/…" />
                          </label>
                        </div>

                        {/* Contenido detallado */}
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contenido detallado para el portal</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <label style={labelStyle}>
                            Concepto visual + guión
                            <textarea value={ep.concepto_visual ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, concepto_visual: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Describe el concepto visual y el guión del video…\n\n"Hola, soy Sandra Poli…"'} />
                          </label>
                          <label style={labelStyle}>
                            Caption completo
                            <textarea value={ep.caption ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, caption: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Caption listo para copiar y pegar…\n\n#hashtag1 #hashtag2'} />
                          </label>
                          <label style={labelStyle}>
                            Instrucciones de publicación
                            <textarea value={ep.instrucciones ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, instrucciones: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Una instrucción por línea:\nPublicar: Martes, 10–11am\nPinear en el perfil\nLocation tag: Bogotá'} />
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                          <label style={labelStyle}>
                            Story del día
                            <textarea value={ep.story_del_dia ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, story_del_dia: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Contenido de la story de hoy…\nEncuesta: "¿Has pensado en…?"'} />
                          </label>
                          <label style={labelStyle}>
                            Hashtags
                            <textarea value={ep.hashtags ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, hashtags: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} placeholder="#hashtag1 #hashtag2 #hashtag3" />
                          </label>
                        </div>

                        {/* Métricas */}
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Métricas post-publicación</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                          {([
                            { key: 'alcance',     label: 'Alcance' },
                            { key: 'impresiones', label: 'Impresiones' },
                            { key: 'likes',       label: 'Likes' },
                            { key: 'comentarios', label: 'Comentarios' },
                            { key: 'guardados',   label: 'Guardados' },
                            { key: 'compartidos', label: 'Compartidos' },
                            { key: 'clics',       label: 'Clics' },
                            { key: 'engagement',  label: 'Engagement %' },
                          ] as { key: keyof NonNullable<ParrillaItem['metricas']>; label: string }[]).map(m => (
                            <label key={m.key} style={labelStyle}>
                              {m.label}
                              <input
                                type="number" min={0} step={m.key === 'engagement' ? 0.1 : 1}
                                value={ep.metricas?.[m.key] ?? ''}
                                onChange={e => setEditingParrillaData(d => ({
                                  ...d,
                                  metricas: { ...(d.metricas ?? {}), [m.key]: e.target.value ? +e.target.value : undefined },
                                }))}
                                style={inputStyle}
                                placeholder="0"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* ── Lista de ítems ── */}
                  {form.parrilla.length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>Sin ítems en la parrilla. Agrega el primero abajo.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[...form.parrilla].sort((a, b) => {
                        if (a.dia_num && b.dia_num) return a.dia_num - b.dia_num
                        return (a.fecha ?? '').localeCompare(b.fecha ?? '')
                      }).map(p => {
                        const est      = PARRILLA_ESTADOS.find(x => x.value === p.estado)
                        const pilarInf = PILARES_CONTENIDO.find(x => x.value === p.pilar)
                        const isEdit   = editingParrillaId === p.id
                        return (
                          <div key={p.id} style={{
                            background: isEdit ? '#F0FDF4' : '#fff',
                            borderRadius: '12px', padding: '12px 14px',
                            border: `1.5px solid ${isEdit ? C1 : '#E5E7EB'}`,
                            display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                          }}>
                            {/* Día # */}
                            {p.dia_num && (
                              <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, flexShrink: 0 }}>
                                {String(p.dia_num).padStart(2, '0')}
                              </span>
                            )}
                            {/* Formato */}
                            <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F3F4F6', color: '#374151', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {p.tipo}{p.duracion ? ` · ${p.duracion}` : ''}
                            </span>
                            {/* Hook */}
                            <p style={{ flex: 1, margin: 0, fontSize: '13px', fontWeight: 700, color: '#111', minWidth: '120px' }}>{p.descripcion}</p>
                            {/* Pilar */}
                            {pilarInf && (
                              <span style={{ padding: '2px 8px', borderRadius: '6px', background: pilarInf.bg, color: pilarInf.color, fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {pilarInf.label}
                              </span>
                            )}
                            {/* Estado */}
                            <select
                              value={p.estado}
                              onChange={e => updateParrillaEstado(p.id, e.target.value as ParrillaItem['estado'])}
                              style={{ fontSize: '11px', padding: '3px 7px', borderRadius: '7px', border: `1.5px solid ${est?.color ?? '#E5E7EB'}`, background: est?.bg ?? '#F9FAFB', color: est?.color ?? '#374151', cursor: 'pointer', flexShrink: 0 }}
                            >
                              {PARRILLA_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                            </select>
                            {/* Acciones */}
                            <button onClick={() => isEdit ? setEditingParrillaId(null) : openEditParrilla(p)} style={{ padding: '5px 12px', borderRadius: '7px', border: `1.5px solid ${C1}`, background: isEdit ? C1 : '#fff', color: isEdit ? '#fff' : C1, cursor: 'pointer', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
                              {isEdit ? '✓ Editando' : '✏️ Editar'}
                            </button>
                            <button onClick={() => removeParrillaItem(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '18px', flexShrink: 0, lineHeight: 1 }}>×</button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* ── Formulario agregar nuevo ── */}
                  <div style={{ background: '#F0FDF4', border: '1.5px dashed #86EFAC', borderRadius: '14px', padding: '18px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: C1, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>+ Agregar a la parrilla</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '10px', marginBottom: '10px' }}>
                      <label style={labelStyle}>
                        Día #
                        <input type="number" value={newP.dia_num ?? ''} onChange={e => setNewP(n => ({ ...n, dia_num: e.target.value ? +e.target.value : undefined }))} style={inputStyle} placeholder="1" min={1} />
                      </label>
                      <label style={labelStyle}>
                        Semana
                        <input type="number" value={newP.semana ?? ''} onChange={e => setNewP(n => ({ ...n, semana: e.target.value ? +e.target.value : undefined }))} style={inputStyle} placeholder="1" min={1} />
                      </label>
                      <label style={labelStyle}>
                        Fecha *
                        <input type="date" value={newP.fecha ?? ''} onChange={e => setNewP(n => ({ ...n, fecha: e.target.value }))} style={inputStyle} />
                      </label>
                      <label style={labelStyle}>
                        Red
                        <select value={newP.red ?? 'Instagram'} onChange={e => setNewP(n => ({ ...n, red: e.target.value }))} style={inputStyle}>
                          {REDES_OPCIONES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Tipo
                        <select value={newP.tipo ?? 'Reel'} onChange={e => setNewP(n => ({ ...n, tipo: e.target.value }))} style={inputStyle}>
                          {TIPO_POST_OPCIONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Duración
                        <select value={newP.duracion ?? ''} onChange={e => setNewP(n => ({ ...n, duracion: e.target.value || undefined }))} style={inputStyle}>
                          {DURACION_OPCIONES.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                        </select>
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      <label style={labelStyle}>
                        Hook / Título *
                        <input value={newP.descripcion ?? ''} onChange={e => setNewP(n => ({ ...n, descripcion: e.target.value }))} style={inputStyle} placeholder="El gancho principal del post" />
                      </label>
                      <label style={labelStyle}>
                        Pilar
                        <select value={newP.pilar ?? ''} onChange={e => setNewP(n => ({ ...n, pilar: e.target.value || undefined }))} style={inputStyle}>
                          <option value="">Sin pilar</option>
                          {PILARES_CONTENIDO.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Estado
                        <select value={newP.estado ?? 'borrador'} onChange={e => setNewP(n => ({ ...n, estado: e.target.value as ParrillaItem['estado'] }))} style={inputStyle}>
                          {PARRILLA_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </label>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 10px' }}>
                      💡 Después de agregar, haz clic en <strong>✏️ Editar</strong> para rellenar el caption, concepto visual, instrucciones y métricas.
                    </p>
                    <button onClick={addParrillaItem} style={{
                      background: C1, color: '#fff', border: 'none', cursor: 'pointer',
                      padding: '9px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                    }}>
                      Agregar ítem
                    </button>
                  </div>
                </div>
              )}

              {/* ─ SOLICITUDES ─ */}
              {tab === 'solicitudes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {form.solicitudes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <p style={{ fontSize: '32px', margin: '0 0 10px' }}>💬</p>
                      <p style={{ color: '#9CA3AF', fontSize: '13px' }}>El cliente aún no ha enviado solicitudes.<br />Aparecerán aquí cuando lo haga desde su portal.</p>
                    </div>
                  ) : (
                    form.solicitudes.map(s => {
                      const tipo = SOLICITUD_TIPOS.find(t => t.value === s.tipo)
                      const est  = SOLICITUD_ESTADOS.find(x => x.value === s.estado)
                      return (
                        <div key={s.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: `1.5px solid ${est?.color ?? '#E5E7EB'}20` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '20px', background: (tipo?.color ?? '#6B7280') + '20', color: tipo?.color ?? '#6B7280', fontSize: '11.5px', fontWeight: 700 }}>{tipo?.label ?? s.tipo}</span>
                              <select
                                value={s.estado}
                                onChange={e => {
                                  const newEst = e.target.value as Solicitud['estado']
                                  setForm(f => ({
                                    ...f,
                                    solicitudes: f.solicitudes.map(x => x.id === s.id ? { ...x, estado: newEst } : x),
                                  }))
                                }}
                                style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '8px', border: `1.5px solid ${est?.color ?? '#E5E7EB'}`, background: est?.bg ?? '#F9FAFB', color: est?.color ?? '#374151', cursor: 'pointer' }}
                              >
                                {SOLICITUD_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                              </select>
                            </div>
                            {!!s.createdAt && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{String(s.createdAt).slice(0, 10)}</span>}
                          </div>
                          <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 8px' }}>{s.descripcion}</p>
                          {s.material_ref && <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 10px' }}>Ref: {s.material_ref}</p>}
                          <textarea
                            value={respuestas[s.id] ?? s.respuesta ?? ''}
                            onChange={e => setRespuestas(r => ({ ...r, [s.id]: e.target.value }))}
                            placeholder="Respuesta del equipo Alma…"
                            rows={2}
                            style={{ ...inputStyle, resize: 'vertical', marginBottom: '8px' }}
                          />
                          <button onClick={() => saveSolicitudRespuesta(s)} style={{
                            padding: '6px 16px', borderRadius: '8px', border: 'none',
                            background: C1, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
                          }}>
                            Guardar respuesta
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* ─ MÉTRICAS MENSUALES ─ */}
              {tab === 'metricas' && (() => {
                const hist = [...(form.metricas_historico ?? [])].sort((a, b) => b.mes.localeCompare(a.mes))
                const metKeys: { key: keyof MetricaMes; label: string; icon: string }[] = [
                  { key: 'alcance',          label: 'Alcance',      icon: '👁️' },
                  { key: 'impresiones',      label: 'Impresiones',  icon: '📡' },
                  { key: 'likes',            label: 'Likes',        icon: '❤️' },
                  { key: 'comentarios',      label: 'Comentarios',  icon: '💬' },
                  { key: 'guardados',        label: 'Guardados',    icon: '🔖' },
                  { key: 'compartidos',      label: 'Compartidos',  icon: '↗️' },
                  { key: 'seguidores',       label: 'Nuevos segs.', icon: '👥' },
                  { key: 'engagement',       label: 'Engagement %', icon: '📈' },
                  { key: 'posts_publicados', label: 'Posts pub.',   icon: '✅' },
                ]
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Tabla de meses */}
                    {hist.length === 0 ? (
                      <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Sin métricas aún. Agrega el primero abajo.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {hist.map(m => {
                          const [y, mo] = m.mes.split('-')
                          const label = new Date(+y, +mo - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
                          const isEditing = editMes === m.mes
                          return (
                            <div key={m.mes} style={{ background: '#fff', borderRadius: '12px', border: `1.5px solid ${isEditing ? C1 : '#E5E7EB'}`, overflow: 'hidden' }}>
                              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#111', textTransform: 'capitalize', minWidth: '130px' }}>{label}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                                  {m.alcance     ? <span style={{ fontSize: '12px', color: '#6B7280' }}>👁️ {m.alcance.toLocaleString()}</span> : null}
                                  {m.likes       ? <span style={{ fontSize: '12px', color: '#6B7280' }}>❤️ {m.likes.toLocaleString()}</span> : null}
                                  {m.seguidores  ? <span style={{ fontSize: '12px', color: '#6B7280' }}>👥 +{m.seguidores}</span> : null}
                                  {m.engagement  ? <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>📈 {m.engagement}%</span> : null}
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button onClick={() => startEditMes(m)} style={{ padding: '4px 10px', borderRadius: '7px', border: `1.5px solid ${C1}`, background: isEditing ? C1 : '#fff', color: isEditing ? '#fff' : C1, cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>✏️ Editar</button>
                                  <button onClick={() => removeMetricaMes(m.mes)} style={{ padding: '4px 8px', borderRadius: '7px', border: '1.5px solid #FEE2E2', background: '#fff', color: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>×</button>
                                </div>
                              </div>
                              {isEditing && (
                                <div style={{ padding: '14px', borderTop: '1px solid #F3F4F6', background: '#F9FAFB' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '10px' }}>
                                    {metKeys.map(k => (
                                      <label key={String(k.key)} style={labelStyle}>
                                        {k.icon} {k.label}
                                        <input
                                          type="number" min={0} step={k.key === 'engagement' ? 0.1 : 1}
                                          value={(newMes[k.key] as number | undefined) ?? ''}
                                          onChange={e => setNewMes(n => ({ ...n, [k.key]: e.target.value ? +e.target.value : undefined }))}
                                          style={inputStyle} placeholder="0"
                                        />
                                      </label>
                                    ))}
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={upsertMetricaMes} style={{ padding: '8px 18px', borderRadius: '9px', background: C1, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px' }}>Guardar cambios</button>
                                    <button onClick={() => { setEditMes(null); setNewMes({ mes: '' }) }} style={{ padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px' }}>Cancelar</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Formulario agregar nuevo mes */}
                    {!editMes && (
                      <div style={{ background: '#F0FDF4', border: '1.5px dashed #86EFAC', borderRadius: '14px', padding: '18px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: C1, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>+ Agregar mes</p>
                        <label style={{ ...labelStyle, marginBottom: '12px' }}>
                          Mes *
                          <input type="month" value={newMes.mes ?? ''} onChange={e => setNewMes(n => ({ ...n, mes: e.target.value }))} style={inputStyle} />
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '12px' }}>
                          {metKeys.map(k => (
                            <label key={String(k.key)} style={labelStyle}>
                              {k.icon} {k.label}
                              <input
                                type="number" min={0} step={k.key === 'engagement' ? 0.1 : 1}
                                value={(newMes[k.key] as number | undefined) ?? ''}
                                onChange={e => setNewMes(n => ({ ...n, [k.key]: e.target.value ? +e.target.value : undefined }))}
                                style={inputStyle} placeholder="0"
                              />
                            </label>
                          ))}
                        </div>
                        <button onClick={upsertMetricaMes} disabled={!newMes.mes} style={{ background: newMes.mes ? C1 : '#9CA3AF', color: '#fff', border: 'none', cursor: newMes.mes ? 'pointer' : 'default', padding: '9px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}>
                          Agregar mes
                        </button>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ─ PORTAL ─ */}
              {tab === 'portal' && (() => {
                const slug        = form.access_token || (form.marca ? marcaToSlug(form.marca) : '')
                const portalUrl   = slug ? `${PORTAL_BASE}${slug}` : ''
                const isExistente = !!form.access_token
                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* URL */}
                  <div style={{ background: '#F0FDF4', borderRadius: '14px', padding: '20px', border: '1.5px solid #86EFAC' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: C1, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔗 Enlace del portal del cliente</p>
                    {slug ? (
                      <>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <code style={{
                            flex: 1, background: '#fff', border: '1px solid #D1FAE5',
                            borderRadius: '8px', padding: '9px 12px', fontSize: '13px',
                            color: '#065F46', wordBreak: 'break-all', fontWeight: 700,
                          }}>
                            {portalUrl}
                          </code>
                          {isExistente && (
                            <button
                              onClick={() => navigator.clipboard.writeText(portalUrl)}
                              style={{ padding: '9px 14px', borderRadius: '8px', border: `1.5px solid ${C1}`, background: '#fff', color: C1, cursor: 'pointer', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}
                            >
                              📋 Copiar
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>
                          {isExistente
                            ? 'Comparte este enlace con tu cliente. Solo quien tenga el enlace puede acceder.'
                            : '⚡ Vista previa — la URL se creará al guardar el cliente.'}
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Llena el nombre de la marca en Perfil para ver la URL del portal.</p>
                    )}
                  </div>

                  {/* Editar slug manualmente */}
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#374151', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ✏️ {isExistente ? 'URL actual del portal' : 'Personalizar URL (opcional)'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#9CA3AF', flexShrink: 0 }}>almaagenciacreativa.com/cliente/</span>
                      <input
                        value={form.access_token || marcaToSlug(form.marca)}
                        onChange={e => setForm(f => ({ ...f, access_token: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-') }))}
                        placeholder={marcaToSlug(form.marca) || 'slug-del-cliente'}
                        style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '13px' }}
                      />
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#9CA3AF', margin: '8px 0 0' }}>
                      Solo letras minúsculas, números y guiones. Se genera automáticamente de la marca.
                    </p>
                  </div>

                  {isExistente && (
                    <div style={{ background: '#FFF7ED', borderRadius: '14px', padding: '18px', border: '1.5px solid #FED7AA' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠️ Cambiar URL</p>
                      <p style={{ fontSize: '12.5px', color: '#B45309', margin: 0 }}>
                        Si cambias la URL, el enlace anterior dejará de funcionar. El cliente necesitará el nuevo enlace.
                      </p>
                    </div>
                  )}

                  {/* Resumen del cliente */}
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resumen</p>
                    {[
                      { label: 'Nombre', value: form.nombre || '—' },
                      { label: 'Marca', value: form.marca || '—' },
                      { label: 'Email', value: form.email || '—' },
                      { label: 'Estado', value: CLIENTE_ESTADOS.find(e => e.value === form.estado)?.label ?? form.estado },
                      { label: 'Servicios', value: form.servicios.length > 0 ? form.servicios.join(', ') : '—' },
                      { label: 'Entregables', value: String(form.entregables.length) },
                      { label: 'Items en parrilla', value: String(form.parrilla.length) },
                      { label: 'Solicitudes', value: String(form.solicitudes.length) },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', gap: '12px', padding: '7px 0', borderBottom: '1px solid #F9FAFB' }}>
                        <span style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 600, minWidth: '120px', flexShrink: 0 }}>{row.label}</span>
                        <span style={{ color: '#374151', fontSize: '12.5px' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )})()}
            </div>

            {/* Modal footer */}
            <div style={{
              background: '#fff', padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', bottom: 0, zIndex: 10, flexShrink: 0, flexWrap: 'wrap', gap: '10px',
            }}>
              {saveMsg ? (
                <p style={{ fontSize: '12.5px', color: '#EF4444', margin: 0, flex: 1 }}>{saveMsg}</p>
              ) : <div style={{ flex: 1 }} />}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{
                  padding: '10px 22px', borderRadius: '10px', border: '1.5px solid #E5E7EB',
                  background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: '#374151',
                }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: '10px 26px', borderRadius: '10px', border: 'none',
                  background: saving ? '#9CA3AF' : C1, color: '#fff',
                  cursor: saving ? 'default' : 'pointer', fontWeight: 800, fontSize: '13px',
                }}>
                  {saving ? 'Guardando…' : editId ? 'Actualizar cliente' : 'Crear cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

/* ── ClienteCard ─────────────────────────────────────────── */
function ClienteCard({ cliente, onEdit, onDelete, portalBase }: {
  cliente: Cliente
  onEdit: () => void
  onDelete: () => void
  portalBase: string
}) {
  const pendSol = cliente.solicitudes.filter(s => s.estado === 'pendiente').length

  return (
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '18px 20px',
      border: '1px solid #E5E7EB',
      boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
      transition: 'box-shadow 0.2s ease',
    }}
      onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 6px rgba(0,0,0,0.04)')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 900, color: '#111', margin: '0 0 3px' }}>{cliente.marca}</p>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>{cliente.nombre}</p>
        </div>
        <EstadoBadge estado={cliente.estado} />
      </div>

      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 10px' }}>{cliente.email}</p>

      {cliente.servicios.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
          {cliente.servicios.slice(0, 3).map(s => (
            <span key={s} style={{ padding: '2px 8px', borderRadius: '10px', background: '#F3F4F6', fontSize: '11px', color: '#374151', fontWeight: 600 }}>{s}</span>
          ))}
          {cliente.servicios.length > 3 && (
            <span style={{ padding: '2px 8px', borderRadius: '10px', background: '#F3F4F6', fontSize: '11px', color: '#9CA3AF' }}>+{cliente.servicios.length - 3}</span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '14px', fontSize: '12px', color: '#6B7280' }}>
        <span>📦 {cliente.entregables.length}</span>
        <span>📅 {cliente.parrilla.length}</span>
        {pendSol > 0 && <span style={{ color: '#EF4444', fontWeight: 700 }}>🔔 {pendSol} pendiente{pendSol > 1 ? 's' : ''}</span>}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={onEdit} style={{
          flex: 1, padding: '8px 0', borderRadius: '10px', border: '1.5px solid #E5E7EB',
          background: '#fff', cursor: 'pointer', fontSize: '12.5px', fontWeight: 700, color: '#374151',
        }}>
          ✏️ Editar
        </button>
        {cliente.access_token && (
          <a
            href={`${portalBase}${cliente.access_token}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1, padding: '8px 0', borderRadius: '10px', border: `1.5px solid ${C1}`,
              background: C1_BG, cursor: 'pointer', fontSize: '12.5px', fontWeight: 700, color: C1,
              textDecoration: 'none', textAlign: 'center', display: 'block',
            }}
          >
            🔗 Portal
          </a>
        )}
        <button onClick={onDelete} style={{
          padding: '8px 10px', borderRadius: '10px', border: '1.5px solid #FEE2E2',
          background: '#FFF1F2', cursor: 'pointer', fontSize: '14px', color: '#EF4444',
        }}>
          🗑
        </button>
      </div>
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '5px',
  fontSize: '12px', fontWeight: 700, color: '#374151',
  textTransform: 'uppercase', letterSpacing: '0.4px',
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #E5E7EB',
  fontSize: '13px', color: '#111', background: '#fff', outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

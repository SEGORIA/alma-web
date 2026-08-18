import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { getClientes, updateCliente, getRedColores } from '../../lib/db'
import type { Cliente, ParrillaItem } from '../../data/clientes'
import { getRedesItem, TIPO_POST_OPCIONES, DURACION_OPCIONES, PARRILLA_ESTADOS } from '../../data/clientes'
import { redColoresDefault } from '../../data/config'
import { toast } from '../../components/admin/Feedback'
import RedesMultiSelect from '../../components/admin/RedesMultiSelect'
import { ADM } from '../../lib/adminTheme'

const { BK, DIM, BDR, MUT, WHT, C1, C1_BG, INPUT_BG } = ADM

/* ── Paleta de colores por cliente (cíclica) ────────────────── */
const CLIENT_COLORS = [
  '#6B21A8','#0EA5E9','#D97706','#059669','#DC2626',
  '#7C3AED','#0284C7','#B45309','#047857','#B91C1C',
  '#9333EA','#0369A1','#92400E','#065F46','#991B1B',
]

/* ── Tipos internos ──────────────────────────────────────────── */
type PostConCliente = ParrillaItem & { clienteNombre: string; clienteColor: string; clienteId: string }

/* ── Helpers del calendario ──────────────────────────────────── */
function getCalCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

/* ── Componente principal ────────────────────────────────────── */
export default function CalendarioAdmin() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading,  setLoading]  = useState(true)
  const [mes,      setMes]      = useState(() => {
    const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [modalPosts, setModalPosts] = useState<PostConCliente[] | null>(null)
  // Confirmación visual del botón "Copiar": sin esto el clic no da ninguna señal
  // y no se sabe si el caption quedó en el portapapeles.
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function copiarCaption(post: PostConCliente) {
    const texto = [post.caption, post.hashtags].filter(Boolean).join('\n\n')
    navigator.clipboard.writeText(texto).then(() => {
      setCopiedId(post.id)
      setTimeout(() => setCopiedId(id => (id === post.id ? null : id)), 1800)
    }).catch(() => {})
  }
  const [filtroCliente, setFiltroCliente] = useState<string>('') // '' = todos
  const [RED_COLOR, setRedColor] = useState<Record<string, string>>(redColoresDefault)

  // Arrastrar publicación entre días
  const [dragging,   setDragging]   = useState<{ postId: string; clienteId: string; fromFecha: string } | null>(null)
  const [dragOverDay, setDragOverDay] = useState<number | null>(null)

  // Edición inline dentro del modal de día
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editDraft,     setEditDraft]     = useState<Partial<ParrillaItem>>({})
  const [savingEdit,    setSavingEdit]    = useState(false)

  useEffect(() => {
    getClientes().then(list => { setClientes(list); setLoading(false) })
    getRedColores().then(setRedColor)
  }, [])

  function startEdit(post: PostConCliente) {
    setEditingPostId(post.id)
    setEditDraft({ ...post })
  }

  function cancelEdit() {
    setEditingPostId(null)
    setEditDraft({})
  }

  async function saveEdit(post: PostConCliente) {
    const cliente = clientes.find(c => c._id === post.clienteId)
    if (!cliente) return
    setSavingEdit(true)
    const anteriorParrilla = cliente.parrilla ?? []
    const cambios: Partial<ParrillaItem> = {
      ...editDraft,
      red: editDraft.redes?.[0] ?? editDraft.red ?? post.red,
    }
    const nuevaParrilla = anteriorParrilla.map(p => p.id === post.id ? { ...p, ...cambios } : p)
    setClientes(prev => prev.map(c => c._id === post.clienteId ? { ...c, parrilla: nuevaParrilla } : c))
    setModalPosts(prev => prev ? prev.map(p => p.id === post.id ? { ...p, ...cambios } as PostConCliente : p) : prev)
    setEditingPostId(null)
    try {
      await updateCliente(post.clienteId, { parrilla: nuevaParrilla })
      toast.ok('Publicación actualizada')
    } catch (err) {
      setClientes(prev => prev.map(c => c._id === post.clienteId ? { ...c, parrilla: anteriorParrilla } : c))
      setModalPosts(prev => prev ? prev.map(p => p.id === post.id ? { ...post } : p) : prev)
      toast.err('No se pudo guardar los cambios: ' + err)
    } finally {
      setSavingEdit(false)
    }
  }

  async function moverPost(clienteId: string, postId: string, nuevaFecha: string) {
    const cliente = clientes.find(c => c._id === clienteId)
    if (!cliente) return
    const anteriorParrilla = cliente.parrilla ?? []
    const nuevaParrilla = anteriorParrilla.map(p => p.id === postId ? { ...p, fecha: nuevaFecha } : p)
    setClientes(prev => prev.map(c => c._id === clienteId ? { ...c, parrilla: nuevaParrilla } : c))
    try {
      await updateCliente(clienteId, { parrilla: nuevaParrilla })
      toast.ok('Publicación movida de fecha')
    } catch (err) {
      setClientes(prev => prev.map(c => c._id === clienteId ? { ...c, parrilla: anteriorParrilla } : c))
      toast.err('No se pudo mover la publicación: ' + err)
    }
  }

  function handleDayDrop(day: number, year: number, month: number) {
    if (!dragging) return
    const info = dragging
    setDragging(null)
    setDragOverDay(null)
    const nuevaFecha = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    if (nuevaFecha === info.fromFecha) return
    moverPost(info.clienteId, info.postId, nuevaFecha)
  }

  const { year, month } = mes
  const cells = getCalCells(year, month)
  const monthLabel = new Date(year, month, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
  const todayD = new Date()

  /* Aplanar todos los posts del mes con su cliente */
  const postsByDay: Record<number, PostConCliente[]> = {}
  clientes.forEach((cl, idx) => {
    if (filtroCliente && cl._id !== filtroCliente) return
    const color = CLIENT_COLORS[idx % CLIENT_COLORS.length]
    ;(cl.parrilla ?? []).forEach(p => {
      if (!p.fecha) return
      const [y, m, d] = p.fecha.split('-').map(Number)
      if (y === year && m === month + 1) {
        if (!postsByDay[d]) postsByDay[d] = []
        postsByDay[d].push({ ...p, clienteNombre: cl.marca || cl.nombre, clienteColor: color, clienteId: cl._id ?? '' })
      }
    })
  })

  /* Total posts visibles en el mes */
  const totalPosts = Object.values(postsByDay).reduce((s, arr) => s + arr.length, 0)

  const prevM = () => setMes(({ year: y, month: m }) => m === 0 ? { year: y-1, month: 11 } : { year: y, month: m-1 })
  const nextM = () => setMes(({ year: y, month: m }) => m === 11 ? { year: y+1, month: 0 } : { year: y, month: m+1 })

  /* ── Estilos ── */
  const labelStyle: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.5px',
    display: 'flex', flexDirection: 'column', gap: '4px',
  }
  const inputStyle: React.CSSProperties = {
    padding: '8px 10px', borderRadius: '8px', border: `1.5px solid ${BDR}`,
    background: INPUT_BG, color: WHT, fontSize: '13px', fontWeight: 500, outline: 'none',
  }

  return (
    <AdminLayout>
      <div style={{ padding: '28px 28px', background: BK, minHeight: '100vh' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 900, color: WHT }}>📅 Calendario editorial</h1>
          <p style={{ margin: 0, fontSize: '13px', color: MUT }}>Vista global de publicaciones por día · todos los clientes</p>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          {/* Filtro cliente */}
          <label style={labelStyle}>
            Cliente
            <select
              value={filtroCliente}
              onChange={e => setFiltroCliente(e.target.value)}
              style={{ ...inputStyle, minWidth: '180px' }}
            >
              <option value="">Todos los clientes</option>
              {clientes.map(cl => (
                <option key={cl._id} value={cl._id}>{cl.marca || cl.nombre}</option>
              ))}
            </select>
          </label>

          {/* Navegación mes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
            <button onClick={prevM} style={{ width: '34px', height: '34px', borderRadius: '50%', background: DIM, border: `1.5px solid ${BDR}`, color: WHT, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <span style={{ fontSize: '16px', fontWeight: 800, color: WHT, textTransform: 'capitalize', minWidth: '180px', textAlign: 'center' }}>{monthLabel}</span>
            <button onClick={nextM} style={{ width: '34px', height: '34px', borderRadius: '50%', background: DIM, border: `1.5px solid ${BDR}`, color: WHT, fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>

          {/* Badge total */}
          <div style={{ padding: '6px 16px', borderRadius: '20px', background: C1_BG, border: `1.5px solid ${C1}20`, color: C1, fontSize: '13px', fontWeight: 800 }}>
            {totalPosts} post{totalPosts !== 1 ? 's' : ''} este mes
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: MUT, fontSize: '14px' }}>Cargando clientes…</div>
        ) : (
          <div style={{ background: DIM, borderRadius: '18px', border: `1.5px solid ${BDR}`, overflow: 'hidden' }}>

            {/* Cabecera días semana */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: `1.5px solid ${BDR}` }}>
              {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
                <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: '11px', fontWeight: 800, color: MUT, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
              ))}
            </div>

            {/* Grid días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
              {cells.map((day, i) => {
                const posts = day ? (postsByDay[day] ?? []) : []
                const isToday = day !== null && todayD.getFullYear() === year && todayD.getMonth() === month && todayD.getDate() === day
                const hasPosts = posts.length > 0
                const borderRight = (i + 1) % 7 !== 0 ? `1px solid ${BDR}` : 'none'
                const borderBottom = i < cells.length - 7 ? `1px solid ${BDR}` : 'none'

                const isDropTarget = day !== null && dragging !== null
                const isDragOver = isDropTarget && dragOverDay === day

                return (
                  <div
                    key={i}
                    onClick={() => hasPosts && setModalPosts(posts)}
                    onDragOver={e => { if (isDropTarget) { e.preventDefault(); if (dragOverDay !== day) setDragOverDay(day) } }}
                    onDragLeave={() => { if (dragOverDay === day) setDragOverDay(null) }}
                    onDrop={e => { if (isDropTarget && day !== null) { e.preventDefault(); handleDayDrop(day, year, month) } }}
                    style={{
                      minHeight: '110px', padding: '8px', position: 'relative',
                      background: isDragOver ? `${C1}22` : day ? (hasPosts ? `${C1}06` : 'transparent') : `${BDR}30`,
                      cursor: hasPosts ? 'pointer' : 'default',
                      borderRight, borderBottom,
                      outline: isDragOver ? `2px dashed ${C1}` : isToday ? `2px solid ${C1}40` : 'none',
                      outlineOffset: '-2px',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => { if (hasPosts && !dragging) e.currentTarget.style.background = `${C1}12` }}
                    onMouseLeave={e => { if (!isDragOver) e.currentTarget.style.background = day ? (hasPosts ? `${C1}06` : 'transparent') : `${BDR}30` }}
                  >
                    {day !== null && (
                      <>
                        {/* Número del día */}
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: isToday ? C1 : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: '6px',
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: isToday ? 900 : 500, color: isToday ? '#fff' : MUT }}>
                            {day}
                          </span>
                        </div>

                        {/* Chips de posts */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {posts.slice(0, 3).map(p => (
                            <div
                              key={p.id}
                              draggable
                              title="Arrastra para cambiar de fecha"
                              onDragStart={e => { e.stopPropagation(); setDragging({ postId: p.id, clienteId: p.clienteId, fromFecha: p.fecha }) }}
                              onDragEnd={() => { setDragging(null); setDragOverDay(null) }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '4px',
                                background: p.clienteColor + '18',
                                border: `1px solid ${p.clienteColor}40`,
                                borderRadius: '5px', padding: '2px 6px',
                                overflow: 'hidden', cursor: 'grab',
                                opacity: dragging?.postId === p.id ? 0.4 : 1,
                              }}
                            >
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: RED_COLOR[getRedesItem(p)[0]] ?? p.clienteColor, flexShrink: 0 }} />
                              <span style={{ fontSize: '10px', fontWeight: 700, color: p.clienteColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%' }}>
                                {p.clienteNombre}
                              </span>
                            </div>
                          ))}
                          {posts.length > 3 && (
                            <span style={{ fontSize: '10px', color: MUT, paddingLeft: '2px' }}>+{posts.length - 3} más</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Leyenda clientes */}
        {!loading && clientes.length > 0 && (
          <div style={{ marginTop: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {clientes.map((cl, idx) => {
              if (filtroCliente && cl._id !== filtroCliente) return null
              const hasPosts = (cl.parrilla ?? []).some(p => {
                const [y, m] = (p.fecha ?? '').split('-').map(Number)
                return y === year && m === month + 1
              })
              if (!hasPosts) return null
              return (
                <div
                  key={cl._id}
                  onClick={() => setFiltroCliente(f => f === cl._id ? '' : (cl._id ?? ''))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '20px',
                    background: filtroCliente === cl._id ? CLIENT_COLORS[idx % CLIENT_COLORS.length] + '22' : DIM,
                    border: `1.5px solid ${CLIENT_COLORS[idx % CLIENT_COLORS.length]}40`,
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: CLIENT_COLORS[idx % CLIENT_COLORS.length] }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: filtroCliente === cl._id ? CLIENT_COLORS[idx % CLIENT_COLORS.length] : MUT }}>
                    {cl.marca || cl.nombre}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal detalle */}
      {modalPosts && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setModalPosts(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}
        >
          <div style={{ background: DIM, borderRadius: '20px', padding: '24px', maxWidth: '540px', width: '100%', maxHeight: '85vh', overflowY: 'auto', border: `1.5px solid ${BDR}`, boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: WHT }}>
                📅 {modalPosts[0]?.fecha}
              </p>
              <button onClick={() => setModalPosts(null)} style={{ background: BK, border: `1.5px solid ${BDR}`, color: MUT, borderRadius: '9px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>✕ Cerrar</button>
            </div>
            {modalPosts.map(post => {
              const isEditing = editingPostId === post.id
              const ep = editDraft
              if (isEditing) {
                return (
                  <div key={post.id} style={{ background: BK, borderRadius: '14px', padding: '16px', marginBottom: '10px', border: `2px solid ${C1}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: post.clienteColor }}>{post.clienteNombre}</span>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => saveEdit(post)} disabled={savingEdit} style={{ padding: '6px 14px', borderRadius: '7px', background: C1, color: '#fff', border: 'none', cursor: savingEdit ? 'default' : 'pointer', fontWeight: 700, fontSize: '11px', opacity: savingEdit ? 0.6 : 1 }}>
                          {savingEdit ? 'Guardando…' : '💾 Guardar'}
                        </button>
                        <button onClick={cancelEdit} disabled={savingEdit} style={{ padding: '6px 14px', borderRadius: '7px', background: 'transparent', border: `1.5px solid ${BDR}`, color: MUT, cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginBottom: '10px' }}>
                      <label style={labelStyle}>
                        Fecha
                        <input type="date" value={ep.fecha ?? ''} onChange={e => setEditDraft(d => ({ ...d, fecha: e.target.value }))} style={inputStyle} />
                      </label>
                      <label style={labelStyle}>
                        Hora
                        <input type="time" value={ep.hora ?? ''} onChange={e => setEditDraft(d => ({ ...d, hora: e.target.value || undefined }))} style={inputStyle} />
                      </label>
                      <label style={labelStyle}>
                        Redes
                        <RedesMultiSelect
                          value={ep.redes && ep.redes.length > 0 ? ep.redes : (ep.red ? [ep.red] : ['Instagram'])}
                          onChange={redes => setEditDraft(d => ({ ...d, redes }))}
                          style={inputStyle}
                        />
                      </label>
                      <label style={labelStyle}>
                        Tipo
                        <select value={ep.tipo ?? 'Reel'} onChange={e => setEditDraft(d => ({ ...d, tipo: e.target.value }))} style={inputStyle}>
                          {TIPO_POST_OPCIONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Duración
                        <select value={ep.duracion ?? ''} onChange={e => setEditDraft(d => ({ ...d, duracion: e.target.value || undefined }))} style={inputStyle}>
                          {DURACION_OPCIONES.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Estado
                        <select value={ep.estado ?? 'borrador'} onChange={e => setEditDraft(d => ({ ...d, estado: e.target.value as ParrillaItem['estado'] }))} style={inputStyle}>
                          {PARRILLA_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                      <label style={labelStyle}>
                        Hook / Título
                        <input value={ep.descripcion ?? ''} onChange={e => setEditDraft(d => ({ ...d, descripcion: e.target.value }))} style={inputStyle} />
                      </label>
                      <label style={labelStyle}>
                        Subtítulo
                        <input value={ep.subtitulo ?? ''} onChange={e => setEditDraft(d => ({ ...d, subtitulo: e.target.value || undefined }))} style={inputStyle} />
                      </label>
                      <label style={labelStyle}>
                        Caption
                        <textarea value={ep.caption ?? ''} onChange={e => setEditDraft(d => ({ ...d, caption: e.target.value || undefined }))} style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} />
                      </label>
                      <label style={labelStyle}>
                        Hashtags
                        <input value={ep.hashtags ?? ''} onChange={e => setEditDraft(d => ({ ...d, hashtags: e.target.value || undefined }))} style={inputStyle} />
                      </label>
                      <label style={labelStyle}>
                        Link publicado
                        <input value={ep.link ?? ''} onChange={e => setEditDraft(d => ({ ...d, link: e.target.value || undefined }))} style={inputStyle} placeholder="https://…" />
                      </label>
                    </div>
                  </div>
                )
              }
              return (
              <div key={post.id} style={{ background: BK, borderRadius: '14px', padding: '16px', marginBottom: '10px', border: `1.5px solid ${post.clienteColor}30` }}>
                {/* Cliente + red */}
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: post.clienteColor, background: post.clienteColor + '15', padding: '2px 9px', borderRadius: '20px', border: `1px solid ${post.clienteColor}30` }}>
                    {post.clienteNombre}
                  </span>
                  {getRedesItem(post).map(r => (
                    <div key={r} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: RED_COLOR[r] ?? '#6B7280' }} />
                      <span style={{ fontSize: '12px', fontWeight: 700, color: WHT }}>{r}</span>
                    </div>
                  ))}
                  <span style={{ fontSize: '12px', color: MUT }}>· {post.tipo}</span>
                  {post.hora && <span style={{ fontSize: '12px', color: C1, fontWeight: 700 }}>🕐 {post.hora}</span>}
                  <button
                    onClick={() => startEdit(post)}
                    style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: '7px', background: C1_BG, border: `1px solid ${C1}40`, color: C1, cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}
                  >
                    ✏️ Editar
                  </button>
                </div>
                <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 800, color: WHT }}>{post.descripcion}</p>
                {post.subtitulo && <p style={{ margin: 0, fontSize: '12px', color: MUT }}>{post.subtitulo}</p>}
                {(post.caption || post.hashtags) && (
                  <div style={{ marginTop: '8px', background: INPUT_BG, borderRadius: '8px', padding: '10px 12px' }}>
                    {post.caption && (
                      <p style={{ margin: '0 0 6px', fontSize: '12px', color: MUT, whiteSpace: 'pre-wrap', lineHeight: 1.5, maxHeight: '260px', overflowY: 'auto' }}>
                        {post.caption}
                      </p>
                    )}
                    {post.hashtags && (
                      <p style={{ margin: '0 0 6px', fontSize: '11.5px', color: C1, fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {post.hashtags}
                      </p>
                    )}
                    <button
                      onClick={() => copiarCaption(post)}
                      style={{
                        background: copiedId === post.id ? '#10B98122' : C1_BG,
                        border: `1px solid ${copiedId === post.id ? '#10B98155' : C1 + '40'}`,
                        color: copiedId === post.id ? '#10B981' : C1,
                        borderRadius: '7px', padding: '4px 10px', fontSize: '11px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      {copiedId === post.id ? '✓ Copiado' : `Copiar${post.hashtags ? ' caption + hashtags' : ' caption'}`}
                    </button>
                  </div>
                )}
                {post.link && <a href={post.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '8px', fontSize: '12px', color: '#60A5FA', fontWeight: 700 }}>Ver publicación →</a>}
              </div>
              )
            })}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

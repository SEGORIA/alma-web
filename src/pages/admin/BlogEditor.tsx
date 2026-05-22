import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getArticulos, createArticulo, updateArticulo } from '../../lib/db'
import { P } from '../../tokens'
import type { Bloque } from '../../data/articulos'
import { categorias } from '../../data/articulos'

const GRADIENTS = [
  { label: 'Morado',   value: 'linear-gradient(135deg, #6B21A8 0%, #9333EA 100%)' },
  { label: 'Azul',     value: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)' },
  { label: 'Rosa',     value: 'linear-gradient(135deg, #E11D48 0%, #F43F5E 100%)' },
  { label: 'Verde',    value: 'linear-gradient(135deg, #059669 0%, #34D399 100%)' },
  { label: 'Ámbar',    value: 'linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)' },
  { label: 'Violeta',  value: 'linear-gradient(135deg, #9333EA 0%, #C084FC 100%)' },
]

const CATS = categorias.filter(c => c !== 'Todos')

const EMOJIS = ['🎨','💻','📱','🚀','🔍','📖','🎯','✨','💡','🏆','📊','🌟']

/* ── Bloque editor ───────────────────────────────────────── */
function BloqueEditor({
  b, index, onChange, onDelete, onMove, total,
}: {
  b: Bloque; index: number
  onChange: (b: Bloque) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
  total: number
}) {
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1.5px solid #E5E7EB', fontSize: '14px',
    outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const renderEditor = () => {
    if (b.tipo === 'separador') {
      return (
        <div style={{ textAlign: 'center', color: '#9CA3AF', fontSize: '13px', padding: '8px 0' }}>
          ─── separador ───
        </div>
      )
    }
    if (b.tipo === 'p') return (
      <textarea rows={3} value={b.texto} style={inputStyle}
        onChange={e => onChange({ ...b, texto: e.target.value })} />
    )
    if (b.tipo === 'h2') return (
      <input type="text" value={b.texto} style={inputStyle}
        onChange={e => onChange({ ...b, texto: e.target.value })}
        placeholder="Título H2…" />
    )
    if (b.tipo === 'h3') return (
      <input type="text" value={b.texto} style={inputStyle}
        onChange={e => onChange({ ...b, texto: e.target.value })}
        placeholder="Título H3…" />
    )
    if (b.tipo === 'destacado') return (
      <textarea rows={2} value={b.texto} style={{ ...inputStyle, borderColor: `${P}44`, background: `${P}06` }}
        onChange={e => onChange({ ...b, texto: e.target.value })}
        placeholder="Texto destacado / cita…" />
    )
    if (b.tipo === 'tip') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <input type="text" value={b.titulo} style={{ ...inputStyle, borderColor: '#FBBF24' }}
          onChange={e => onChange({ ...b, titulo: e.target.value })}
          placeholder="Título del tip…" />
        <textarea rows={2} value={b.texto} style={inputStyle}
          onChange={e => onChange({ ...b, texto: e.target.value })}
          placeholder="Contenido del tip…" />
      </div>
    )
    if (b.tipo === 'lista') return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {b.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: P, fontWeight: 800, flexShrink: 0 }}>•</span>
            <input
              type="text" value={item} style={{ ...inputStyle, flex: 1 }}
              onChange={e => {
                const items = [...b.items]
                items[i] = e.target.value
                onChange({ ...b, items })
              }}
              placeholder={`Ítem ${i + 1}…`}
            />
            <button
              onClick={() => onChange({ ...b, items: b.items.filter((_, j) => j !== i) })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '18px', flexShrink: 0 }}
            >×</button>
          </div>
        ))}
        <button
          onClick={() => onChange({ ...b, items: [...b.items, ''] })}
          style={{
            background: 'none', border: `1px dashed ${P}`, color: P,
            padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, marginTop: '4px',
          }}
        >
          + Agregar ítem
        </button>
      </div>
    )
    return null
  }

  const tipoLabel: Record<string, string> = {
    p: 'Párrafo', h2: 'Título H2', h3: 'Título H3',
    lista: 'Lista', destacado: 'Destacado', tip: 'Tip', separador: 'Separador',
  }

  return (
    <div style={{
      background: '#fff', borderRadius: '12px',
      border: '1.5px solid #E5E7EB', overflow: 'hidden',
    }}>
      {/* Header del bloque */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', background: '#F9FAFB',
        borderBottom: '1px solid #E5E7EB',
      }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {tipoLabel[b.tipo] ?? b.tipo}
        </span>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => onMove(-1)} disabled={index === 0}
            style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px', color: '#374151', opacity: index === 0 ? 0.3 : 1 }}>↑</button>
          <button onClick={() => onMove(1)} disabled={index === total - 1}
            style={{ background: 'none', border: '1px solid #E5E7EB', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px', color: '#374151', opacity: index === total - 1 ? 0.3 : 1 }}>↓</button>
          <button onClick={onDelete}
            style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', padding: '3px 8px', cursor: 'pointer', fontSize: '12px', color: '#EF4444', fontWeight: 700 }}>× Eliminar</button>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: '14px' }}>
        {renderEditor()}
      </div>
    </div>
  )
}

/* ── BlogEditor page ─────────────────────────────────────── */
export default function BlogEditor() {
  const { id }    = useParams<{ id: string }>()
  const navigate  = useNavigate()
  const isNew     = id === 'nuevo'

  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(!isNew)

  const [titulo,    setTitulo]    = useState('')
  const [slug,      setSlug]      = useState('')
  const [cat,       setCat]       = useState(CATS[0])
  const [excerpt,   setExcerpt]   = useState('')
  const [minutos,   setMinutos]   = useState(3)
  const [fecha,     setFecha]     = useState(() => {
    const d = new Date()
    return d.toLocaleString('es-CO', { month: 'short', year: 'numeric' })
  })
  const [emoji,     setEmoji]     = useState('🎨')
  const [gradient,  setGradient]  = useState(GRADIENTS[0].value)
  const [destacado, setDestacado] = useState(false)
  const [bloques,   setBloques]   = useState<Bloque[]>([{ tipo: 'p', texto: '' }])
  const [docId,     setDocId]     = useState<string | null>(null)

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    getArticulos().then(arts => {
      const found = arts.find(a => a._id === id || a.slug === id)
      if (found) {
        setTitulo(found.titulo)
        setSlug(found.slug)
        setCat(found.cat)
        setExcerpt(found.excerpt)
        setMinutos(found.minutos)
        setFecha(found.fecha)
        setEmoji(found.emoji)
        setGradient(found.gradient)
        setDestacado(!!found.destacado)
        setBloques(found.contenido)
        setDocId(found._id ?? null)
      }
      setLoading(false)
    })
  }, [id, isNew])

  // Auto-slug from title
  const handleTitulo = (v: string) => {
    setTitulo(v)
    if (isNew) {
      setSlug(v.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''))
    }
  }

  const addBloque = (tipo: Bloque['tipo']) => {
    const defaults: Record<string, Bloque> = {
      p:          { tipo: 'p', texto: '' },
      h2:         { tipo: 'h2', texto: '' },
      h3:         { tipo: 'h3', texto: '' },
      lista:      { tipo: 'lista', items: [''] },
      destacado:  { tipo: 'destacado', texto: '' },
      tip:        { tipo: 'tip', titulo: '', texto: '' },
      separador:  { tipo: 'separador' },
    }
    setBloques(prev => [...prev, defaults[tipo]])
  }

  const updateBloque = (i: number, b: Bloque) => {
    setBloques(prev => prev.map((x, j) => j === i ? b : x))
  }

  const deleteBloque = (i: number) => {
    setBloques(prev => prev.filter((_, j) => j !== i))
  }

  const moveBloque = (i: number, dir: -1 | 1) => {
    setBloques(prev => {
      const arr = [...prev]
      const j = i + dir
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }

  const handleSave = async () => {
    if (!titulo.trim() || !slug.trim()) {
      alert('El título y el slug son obligatorios')
      return
    }
    setSaving(true)
    try {
      const data = { titulo, slug, cat, excerpt, minutos, fecha, emoji, gradient, destacado, contenido: bloques }
      if (isNew || !docId) {
        await createArticulo(data)
      } else {
        await updateArticulo(docId, data)
      }
      navigate('/admin/blog')
    } catch (err) {
      alert('Error al guardar: ' + err)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1.5px solid #E5E7EB', fontSize: '14px',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  if (loading) return (
    <AdminLayout>
      <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>Cargando…</div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div style={{ padding: '32px', maxWidth: '860px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', marginBottom: '4px' }}>
              {isNew ? '+ Nuevo artículo' : 'Editar artículo'}
            </h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
              {isNew ? 'Completa los campos y guarda para publicar' : `Editando: ${titulo}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/admin/blog')}
              style={{
                padding: '10px 20px', borderRadius: '10px',
                border: '1.5px solid #E5E7EB', background: '#fff',
                color: '#374151', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 24px', borderRadius: '10px',
                background: saving ? '#9CA3AF' : P,
                color: '#fff', border: 'none',
                fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Guardando…' : '✓ Guardar artículo'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Metadatos */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Información del artículo
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Título *</label>
                <input type="text" value={titulo} onChange={e => handleTitulo(e.target.value)} style={inputStyle} placeholder="Título del artículo…" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Slug (URL) *
                </label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace', background: '#F9FAFB' }} placeholder="url-del-articulo" />
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                  Se accederá en: /blog/{slug || 'url-del-articulo'}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Categoría</label>
                <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Fecha</label>
                <input type="text" value={fecha} onChange={e => setFecha(e.target.value)} style={inputStyle} placeholder="May 2026" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Minutos de lectura</label>
                <input type="number" min={1} max={30} value={minutos} onChange={e => setMinutos(+e.target.value)} style={{ ...inputStyle, width: '80px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>¿Artículo destacado?</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={destacado} onChange={e => setDestacado(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: P }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Mostrar como destacado en la landing</span>
                </label>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Extracto (resumen breve)</label>
                <textarea rows={2} value={excerpt} onChange={e => setExcerpt(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Descripción corta que aparece en las tarjetas del blog…" />
              </div>
            </div>
          </div>

          {/* Visual */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Apariencia visual
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Emoji representativo</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)}
                      style={{
                        fontSize: '22px', padding: '8px', borderRadius: '10px', cursor: 'pointer',
                        border: `2px solid ${emoji === e ? P : '#E5E7EB'}`,
                        background: emoji === e ? `${P}15` : '#fff',
                        transition: 'all 0.15s ease',
                      }}>
                      {e}
                    </button>
                  ))}
                </div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', margin: '16px 0 8px' }}>Color de fondo</label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {GRADIENTS.map(g => (
                    <button key={g.value} onClick={() => setGradient(g.value)}
                      style={{
                        width: '48px', height: '48px', borderRadius: '12px',
                        background: g.value, cursor: 'pointer',
                        border: `3px solid ${gradient === g.value ? P : 'transparent'}`,
                        boxShadow: gradient === g.value ? `0 0 0 2px ${P}` : 'none',
                        transition: 'all 0.15s ease',
                      }}
                      title={g.label}
                    />
                  ))}
                </div>
              </div>
              {/* Preview */}
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Preview</p>
                <div style={{
                  width: '120px', height: '120px', borderRadius: '16px',
                  background: gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '48px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}>
                  {emoji}
                </div>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                Contenido del artículo
              </h2>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {(['p','h2','h3','lista','destacado','tip','separador'] as Bloque['tipo'][]).map(tipo => (
                  <button key={tipo} onClick={() => addBloque(tipo)}
                    style={{
                      padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                      border: '1px solid #E5E7EB', background: '#F9FAFB',
                      color: '#374151', fontSize: '12px', fontWeight: 600,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${P}15`; e.currentTarget.style.borderColor = P; e.currentTarget.style.color = P }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.color = '#374151' }}
                  >
                    + {tipo === 'p' ? 'párrafo' : tipo === 'h2' ? 'H2' : tipo === 'h3' ? 'H3' : tipo}
                  </button>
                ))}
              </div>
            </div>

            {bloques.length === 0 && (
              <p style={{ color: '#9CA3AF', fontSize: '14px', textAlign: 'center', padding: '32px' }}>
                Agrega bloques de contenido usando los botones de arriba.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {bloques.map((b, i) => (
                <BloqueEditor
                  key={i} b={b} index={i} total={bloques.length}
                  onChange={nb => updateBloque(i, nb)}
                  onDelete={() => deleteBloque(i)}
                  onMove={dir => moveBloque(i, dir)}
                />
              ))}
            </div>
          </div>

          {/* Guardar bottom */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => navigate('/admin/blog')}
              style={{
                padding: '12px 24px', borderRadius: '12px',
                border: '1.5px solid #E5E7EB', background: '#fff',
                color: '#374151', fontWeight: 600, fontSize: '14px', cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '12px 28px', borderRadius: '12px',
                background: saving ? '#9CA3AF' : P,
                color: '#fff', border: 'none',
                fontWeight: 700, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Guardando…' : '✓ Guardar artículo'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

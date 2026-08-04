import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getCurso, createCurso, updateCurso } from '../../lib/db'
import type { Curso, CursoCategoria, CursoNivel, Modulo, Leccion, LeccionTipo } from '../../data/academia'
import { CURSO_CATEGORIAS } from '../../data/academia'
import ImageUploader from '../../components/ImageUploader'
import { toast } from '../../components/admin/Feedback'
import { ADM } from '../../lib/adminTheme'

const { DIM, BDR, MUT, WHT, C1, INPUT_BG } = ADM

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: '10px',
  border: `1.5px solid ${BDR}`, fontSize: '14px',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
  background: INPUT_BG, color: WHT,
}

/* ── Editor de una lección ────────────────────────────────── */
function LeccionEditor({ leccion, onChange, onDelete, onMove, isFirst, isLast }: {
  leccion: Leccion
  onChange: (l: Leccion) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
  isFirst: boolean
  isLast: boolean
}) {
  return (
    <div style={{ background: INPUT_BG, borderRadius: '10px', border: `1px solid ${BDR}`, padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          value={leccion.titulo}
          onChange={e => onChange({ ...leccion, titulo: e.target.value })}
          placeholder="Título de la lección…"
          style={{ ...inputStyle, flex: 1 }}
        />
        <select
          value={leccion.tipo}
          onChange={e => onChange({ ...leccion, tipo: e.target.value as LeccionTipo })}
          style={{ ...inputStyle, width: '110px', cursor: 'pointer' }}
        >
          <option value="video">🎬 Video</option>
          <option value="texto">📝 Texto</option>
        </select>
        <input
          type="number" min={0}
          value={leccion.duracion_min ?? ''}
          onChange={e => onChange({ ...leccion, duracion_min: e.target.value ? +e.target.value : undefined })}
          placeholder="min"
          style={{ ...inputStyle, width: '64px' }}
        />
        <button onClick={() => onMove(-1)} disabled={isFirst} style={{ background: 'none', border: `1px solid ${BDR}`, borderRadius: '6px', padding: '6px 9px', cursor: isFirst ? 'default' : 'pointer', color: WHT, opacity: isFirst ? 0.3 : 1 }}>↑</button>
        <button onClick={() => onMove(1)} disabled={isLast} style={{ background: 'none', border: `1px solid ${BDR}`, borderRadius: '6px', padding: '6px 9px', cursor: isLast ? 'default' : 'pointer', color: WHT, opacity: isLast ? 0.3 : 1 }}>↓</button>
        <button onClick={onDelete} style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '6px', padding: '6px 9px', cursor: 'pointer', color: '#EF4444', fontWeight: 700 }}>×</button>
      </div>
      {leccion.tipo === 'video' ? (
        <input
          value={leccion.video_url ?? ''}
          onChange={e => onChange({ ...leccion, video_url: e.target.value })}
          placeholder="URL de embed de YouTube/Vimeo (no listado)…"
          style={inputStyle}
        />
      ) : (
        <textarea
          rows={4}
          value={leccion.contenido_html ?? ''}
          onChange={e => onChange({ ...leccion, contenido_html: e.target.value })}
          placeholder="Contenido de la lección (texto/HTML)…"
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      )}
    </div>
  )
}

/* ── Editor de un módulo ──────────────────────────────────── */
function ModuloEditor({ modulo, onChange, onDelete, onMove, isFirst, isLast }: {
  modulo: Modulo
  onChange: (m: Modulo) => void
  onDelete: () => void
  onMove: (dir: -1 | 1) => void
  isFirst: boolean
  isLast: boolean
}) {
  const addLeccion = () => {
    const l: Leccion = { id: newId(), titulo: '', tipo: 'video', orden: modulo.lecciones.length }
    onChange({ ...modulo, lecciones: [...modulo.lecciones, l] })
  }
  const updateLeccion = (i: number, l: Leccion) => {
    onChange({ ...modulo, lecciones: modulo.lecciones.map((x, j) => j === i ? l : x) })
  }
  const deleteLeccion = (i: number) => {
    onChange({ ...modulo, lecciones: modulo.lecciones.filter((_, j) => j !== i) })
  }
  const moveLeccion = (i: number, dir: -1 | 1) => {
    const arr = [...modulo.lecciones]
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    onChange({ ...modulo, lecciones: arr })
  }

  return (
    <div style={{ background: DIM, borderRadius: '14px', border: `1.5px solid ${BDR}`, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', borderBottom: `1px solid ${BDR}` }}>
        <input
          value={modulo.titulo}
          onChange={e => onChange({ ...modulo, titulo: e.target.value })}
          placeholder="Título del módulo…"
          style={{ ...inputStyle, flex: 1, fontWeight: 700 }}
        />
        <button onClick={() => onMove(-1)} disabled={isFirst} style={{ background: 'none', border: `1px solid ${BDR}`, borderRadius: '6px', padding: '6px 9px', cursor: isFirst ? 'default' : 'pointer', color: WHT, opacity: isFirst ? 0.3 : 1 }}>↑</button>
        <button onClick={() => onMove(1)} disabled={isLast} style={{ background: 'none', border: `1px solid ${BDR}`, borderRadius: '6px', padding: '6px 9px', cursor: isLast ? 'default' : 'pointer', color: WHT, opacity: isLast ? 0.3 : 1 }}>↓</button>
        <button onClick={onDelete} style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', color: '#EF4444', fontWeight: 700, fontSize: '12px', whiteSpace: 'nowrap' }}>
            Eliminar módulo
        </button>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {modulo.lecciones.length === 0 && (
          <p style={{ fontSize: '13px', color: MUT, margin: 0, textAlign: 'center', padding: '12px' }}>Sin lecciones aún.</p>
        )}
        {modulo.lecciones.map((l, i) => (
          <LeccionEditor
            key={l.id} leccion={l}
            onChange={nl => updateLeccion(i, nl)}
            onDelete={() => deleteLeccion(i)}
            onMove={dir => moveLeccion(i, dir)}
            isFirst={i === 0} isLast={i === modulo.lecciones.length - 1}
          />
        ))}
        <button
          onClick={addLeccion}
          style={{ alignSelf: 'flex-start', background: 'none', border: `1px dashed ${C1}`, color: C1, padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
        >
          + Agregar lección
        </button>
      </div>
    </div>
  )
}

/* ── AcademiaCursoEditor page ─────────────────────────────── */
export default function AcademiaCursoEditor() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew    = id === 'nuevo'

  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [docId,   setDocId]   = useState<string | null>(null)

  const [titulo, setTitulo]             = useState('')
  const [slug, setSlug]                 = useState('')
  const [descripcion, setDescripcion]   = useState('')
  const [categoria, setCategoria]       = useState<CursoCategoria>('marketing_digital')
  const [imagenPortada, setImagenPortada] = useState('')
  const [instructor, setInstructor]     = useState('')
  const [nivel, setNivel]               = useState<CursoNivel>('principiante')
  const [estado, setEstado]             = useState<Curso['estado']>('borrador')
  const [modulos, setModulos]           = useState<Modulo[]>([])

  useEffect(() => {
    if (isNew || !id) return   // `loading` ya arranca en !isNew
    getCurso(id).then(c => {
      if (c) {
        setTitulo(c.titulo)
        setSlug(c.slug)
        setDescripcion(c.descripcion)
        setCategoria(c.categoria)
        setImagenPortada(c.imagen_portada ?? '')
        setInstructor(c.instructor ?? '')
        setNivel(c.nivel ?? 'principiante')
        setEstado(c.estado)
        setModulos(c.modulos)
        setDocId(c._id ?? null)
      }
      setLoading(false)
    })
  }, [id, isNew])

  const handleTitulo = (v: string) => {
    setTitulo(v)
    if (isNew) {
      setSlug(v.toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''))
    }
  }

  const addModulo = () => {
    const m: Modulo = { id: newId(), titulo: '', lecciones: [], orden: modulos.length }
    setModulos(prev => [...prev, m])
  }
  const updateModulo = (i: number, m: Modulo) => setModulos(prev => prev.map((x, j) => j === i ? m : x))
  const deleteModulo  = (i: number) => setModulos(prev => prev.filter((_, j) => j !== i))
  const moveModulo = (i: number, dir: -1 | 1) => {
    setModulos(prev => {
      const arr = [...prev]
      const j = i + dir
      if (j < 0 || j >= arr.length) return arr
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
      return arr
    })
  }

  const handleSave = async () => {
    if (!titulo.trim() || !slug.trim()) {
      toast.err('El título y el slug son obligatorios')
      return
    }
    setSaving(true)
    try {
      const data = {
        titulo, slug, descripcion, categoria,
        imagen_portada: imagenPortada || undefined,
        instructor: instructor || undefined,
        nivel, estado, modulos,
      }
      if (isNew || !docId) {
        await createCurso(data)
      } else {
        await updateCurso(docId, data)
      }
      toast.ok('Curso guardado')
      navigate('/admin/academia')
    } catch (err) {
      toast.err('Error al guardar: ' + err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <AdminLayout>
      <div style={{ padding: '40px', textAlign: 'center', color: MUT }}>Cargando…</div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div style={{ padding: '32px', maxWidth: '900px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '22px', fontWeight: 900, color: WHT, marginBottom: '4px' }}>
              {isNew ? '+ Nuevo curso' : 'Editar curso'}
            </h1>
            <p style={{ fontSize: '13px', color: MUT }}>
              {isNew ? 'Completa los campos y agrega módulos y lecciones' : `Editando: ${titulo}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => navigate('/admin/academia')} style={{ padding: '10px 20px', borderRadius: '10px', border: `1.5px solid ${BDR}`, background: DIM, color: WHT, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '10px 24px', borderRadius: '10px', background: saving ? MUT : C1, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Guardando…' : '✓ Guardar curso'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Metadatos */}
          <div style={{ background: DIM, borderRadius: '16px', padding: '24px', border: `1px solid ${BDR}` }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: WHT, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Información del curso
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: WHT, marginBottom: '6px' }}>Título *</label>
                <input value={titulo} onChange={e => handleTitulo(e.target.value)} style={inputStyle} placeholder="Título del curso…" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: WHT, marginBottom: '6px' }}>Slug (URL) *</label>
                <input value={slug} onChange={e => setSlug(e.target.value)} style={{ ...inputStyle, fontFamily: 'monospace' }} placeholder="url-del-curso" />
                <p style={{ fontSize: '12px', color: MUT, marginTop: '4px' }}>Se accederá en: edu.almaagenciacreativa.com/curso/{slug || 'url-del-curso'}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: WHT, marginBottom: '6px' }}>Categoría</label>
                <select value={categoria} onChange={e => setCategoria(e.target.value as CursoCategoria)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CURSO_CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: WHT, marginBottom: '6px' }}>Nivel</label>
                <select value={nivel} onChange={e => setNivel(e.target.value as CursoNivel)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="principiante">Principiante</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: WHT, marginBottom: '6px' }}>Instructor</label>
                <input value={instructor} onChange={e => setInstructor(e.target.value)} style={inputStyle} placeholder="Nombre del instructor…" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: WHT, marginBottom: '6px' }}>Estado</label>
                <select value={estado} onChange={e => setEstado(e.target.value as Curso['estado'])} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="borrador">Borrador</option>
                  <option value="publicado">Publicado</option>
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: WHT, marginBottom: '6px' }}>Descripción</label>
                <textarea rows={3} value={descripcion} onChange={e => setDescripcion(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Descripción que aparece en el catálogo y en el detalle del curso…" />
              </div>
            </div>
          </div>

          {/* Imagen de portada */}
          <div style={{ background: DIM, borderRadius: '16px', padding: '24px', border: `1px solid ${BDR}` }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: WHT, marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Imagen de portada
            </h2>
            <ImageUploader currentUrl={imagenPortada} onUploaded={setImagenPortada} height={160} />
          </div>

          {/* Módulos y lecciones */}
          <div style={{ background: DIM, borderRadius: '16px', padding: '24px', border: `1px solid ${BDR}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 800, color: WHT, textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                Módulos y lecciones
              </h2>
              <button onClick={addModulo} style={{ padding: '7px 16px', borderRadius: '8px', border: `1px dashed ${C1}`, background: 'none', color: C1, fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                + Agregar módulo
              </button>
            </div>

            {modulos.length === 0 && (
              <p style={{ color: MUT, fontSize: '14px', textAlign: 'center', padding: '32px' }}>
                Agrega el primer módulo para empezar a construir el temario.
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {modulos.map((m, i) => (
                <ModuloEditor
                  key={m.id} modulo={m}
                  onChange={nm => updateModulo(i, nm)}
                  onDelete={() => deleteModulo(i)}
                  onMove={dir => moveModulo(i, dir)}
                  isFirst={i === 0} isLast={i === modulos.length - 1}
                />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => navigate('/admin/academia')} style={{ padding: '12px 24px', borderRadius: '12px', border: `1.5px solid ${BDR}`, background: DIM, color: WHT, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} style={{ padding: '12px 28px', borderRadius: '12px', background: saving ? MUT : C1, color: '#fff', border: 'none', fontWeight: 700, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Guardando…' : '✓ Guardar curso'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

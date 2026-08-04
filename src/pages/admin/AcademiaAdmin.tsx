import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import { ADM } from '../../lib/adminTheme'
import {
  getCursos, deleteCurso,
  getRecursos, createRecurso, updateRecurso, deleteRecurso, seedRecursosHacksIG,
} from '../../lib/db'
import type { Curso } from '../../data/academia'
import { CURSO_CATEGORIAS, RECURSO_TIPOS } from '../../data/academia'
import type { Recurso, RecursoTipo } from '../../data/academia'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import { AdminEmptyState } from '../../components/admin/AdminListPage'

const { BK, DIM, BDR, BDR2, MUT, WHT, C1, ACC2, INPUT_BG } = ADM

type Tab = 'cursos' | 'recursos'

/* ── Formulario de recurso (alta/edición inline) ─────────────── */
function RecursoForm({ initial, onSave, onCancel }: {
  initial: Recurso | null
  onSave: (data: Omit<Recurso, '_id'>) => void
  onCancel: () => void
}) {
  const [titulo, setTitulo]           = useState(initial?.titulo ?? '')
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? '')
  const [tipo, setTipo]               = useState<RecursoTipo>(initial?.tipo ?? 'prompt')
  const [contenido, setContenido]     = useState(initial?.contenido ?? '')
  const [url, setUrl]                 = useState(initial?.url ?? '')
  const [estado, setEstado]           = useState<Recurso['estado']>(initial?.estado ?? 'publicado')

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: `1.5px solid ${BDR}`, fontSize: '14px', outline: 'none',
    boxSizing: 'border-box', fontFamily: 'inherit', background: INPUT_BG, color: WHT,
  }

  const handleSave = () => {
    if (!titulo.trim()) { toast.err('El título es obligatorio'); return }
    onSave({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      tipo,
      contenido: contenido.trim() || undefined,
      url: url.trim() || undefined,
      orden: initial?.orden ?? 0,
      estado,
    })
  }

  return (
    <div style={{ background: DIM, border: `1.5px solid ${C1}44`, borderRadius: '14px', padding: '20px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUT, marginBottom: '5px' }}>Título *</label>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} style={inputStyle} placeholder="Ej: Estrategia de contenido mensual" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUT, marginBottom: '5px' }}>Tipo</label>
          <select value={tipo} onChange={e => setTipo(e.target.value as RecursoTipo)} style={{ ...inputStyle, cursor: 'pointer' }}>
            {RECURSO_TIPOS.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUT, marginBottom: '5px' }}>Descripción corta</label>
        <input value={descripcion} onChange={e => setDescripcion(e.target.value)} style={inputStyle} placeholder="Lo que ve el estudiante antes de abrirlo" />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUT, marginBottom: '5px' }}>Contenido (texto/prompt para copiar)</label>
        <textarea rows={5} value={contenido} onChange={e => setContenido(e.target.value)} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '13px' }} placeholder="Texto completo que el estudiante podrá copiar…" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUT, marginBottom: '5px' }}>URL externa (archivo/plantilla, opcional)</label>
          <input value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} placeholder="https://…" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: MUT, marginBottom: '5px' }}>Estado</label>
          <select value={estado} onChange={e => setEstado(e.target.value as Recurso['estado'])} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: '10px', border: `1.5px solid ${BDR}`, background: 'transparent', color: WHT, fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
          Cancelar
        </button>
        <button onClick={handleSave} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: C1, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          ✓ Guardar recurso
        </button>
      </div>
    </div>
  )
}

export default function AcademiaAdmin() {
  const isMobile = useIsMobile()
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: Tab = searchParams.get('tab') === 'recursos' ? 'recursos' : 'cursos'
  const setTab = (t: Tab) => setSearchParams(t === 'recursos' ? { tab: 'recursos' } : {}, { replace: true })

  const [cursos, setCursos]   = useState<Curso[]>([])
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRecurso, setEditingRecurso] = useState<Recurso | null | 'new'>(null)
  const [seeding, setSeeding] = useState(false)

  const load = async () => {
    setLoading(true)
    const [c, r] = await Promise.all([getCursos(), getRecursos()])
    setCursos(c)
    setRecursos(r)
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
  useEffect(() => { load() }, [])

  const handleDeleteCurso = async (id: string, titulo: string) => {
    if (!(await confirmar(`¿Eliminar el curso "${titulo}"? Esta acción no se puede deshacer.`))) return
    await deleteCurso(id)
    toast.ok('Curso eliminado')
    load()
  }

  const handleSaveRecurso = async (data: Omit<Recurso, '_id'>) => {
    try {
      if (editingRecurso && editingRecurso !== 'new' && editingRecurso._id) {
        await updateRecurso(editingRecurso._id, data)
        toast.ok('Recurso actualizado')
      } else {
        await createRecurso({ ...data, orden: recursos.length })
        toast.ok('Recurso creado')
      }
      setEditingRecurso(null)
      load()
    } catch (err) {
      toast.err('Error al guardar: ' + err)
    }
  }

  const handleDeleteRecurso = async (id: string, titulo: string) => {
    if (!(await confirmar(`¿Eliminar el recurso "${titulo}"?`))) return
    await deleteRecurso(id)
    toast.ok('Recurso eliminado')
    load()
  }

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedRecursosHacksIG()
      toast.ok('Se cargaron los 7 Hacks de Instagram')
      load()
    } catch (err) {
      toast.err('Error al cargar: ' + err)
    } finally {
      setSeeding(false)
    }
  }

  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh', padding: isMobile ? '20px 16px' : '32px 36px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: `0.5px solid ${BDR}`, marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>🎓 Academia</h1>
          </div>
          <a
            href="https://edu.almaagenciacreativa.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg,${C1},${ACC2})`, color: '#fff', padding: '9px 18px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            🌐 Ver edu.almaagenciacreativa.com
          </a>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {([
            { key: 'cursos' as Tab,   label: `📚 Cursos (${cursos.length})` },
            { key: 'recursos' as Tab, label: `🎁 Recursos gratis (${recursos.length})` },
          ]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: '9px 18px', borderRadius: '10px', cursor: 'pointer',
                border: `1.5px solid ${tab === t.key ? C1 : BDR}`,
                background: tab === t.key ? `${C1}15` : 'transparent',
                color: tab === t.key ? C1 : MUT,
                fontWeight: 700, fontSize: '13px',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? <ListSkeleton rows={4} /> : tab === 'cursos' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', color: MUT, margin: 0 }}>
                {cursos.length} curso{cursos.length !== 1 ? 's' : ''}
              </p>
              <Link to="/admin/academia/nuevo" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: C1, color: '#fff', padding: '9px 20px', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px' }}>
                + Nuevo curso
              </Link>
            </div>
            {cursos.length === 0 ? (
              <AdminEmptyState
                icon="📚" title="No hay cursos aún"
                subtitle="Crea el primer curso de la Academia — módulos, lecciones en video o texto, y recursos descargables."
                ctaLabel="+ Crear primer curso →" ctaTo="/admin/academia/nuevo" color={C1}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {cursos.map(c => {
                  const cat = CURSO_CATEGORIAS.find(x => x.value === c.categoria)
                  const totalLecciones = c.modulos.reduce((n, m) => n + m.lecciones.length, 0)
                  return (
                    <div key={c._id} style={{ background: DIM, borderRadius: '16px', padding: '18px 22px', border: `1px solid ${BDR}`, display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '12px', flexShrink: 0,
                        background: c.imagen_portada ? `url(${c.imagen_portada}) center/cover` : `${C1}18`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
                      }}>
                        {!c.imagen_portada && (cat?.icon ?? '📚')}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '15px', fontWeight: 800, color: WHT, margin: 0 }}>{c.titulo}</h3>
                          <span style={{
                            fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                            color: c.estado === 'publicado' ? ADM.GRN : ADM.AMB,
                            background: c.estado === 'publicado' ? `${ADM.GRN}18` : `${ADM.AMB}18`,
                          }}>
                            {c.estado === 'publicado' ? 'Publicado' : 'Borrador'}
                          </span>
                        </div>
                        <p style={{ fontSize: '12px', color: MUT, margin: 0 }}>
                          {cat?.label ?? c.categoria} · {c.modulos.length} módulo{c.modulos.length !== 1 ? 's' : ''} · {totalLecciones} lección{totalLecciones !== 1 ? 'es' : ''}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <Link to={`/admin/academia/${c._id}`} style={{ padding: '7px 14px', borderRadius: '8px', background: `${C1}15`, color: C1, textDecoration: 'none', fontSize: '12px', fontWeight: 700, border: `1px solid ${C1}30` }}>
                          Editar
                        </Link>
                        <button onClick={() => handleDeleteCurso(c._id!, c.titulo)} style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.35)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <p style={{ fontSize: '13px', color: MUT, margin: 0 }}>
                Se muestran en la home de edu.almaagenciacreativa.com, ordenados de arriba hacia abajo.
              </p>
              <div style={{ display: 'flex', gap: '10px' }}>
                {recursos.length === 0 && (
                  <button onClick={handleSeed} disabled={seeding} style={{ padding: '9px 16px', borderRadius: '10px', border: `1.5px solid ${BDR2}`, background: 'transparent', color: WHT, fontWeight: 700, fontSize: '12.5px', cursor: seeding ? 'not-allowed' : 'pointer' }}>
                    {seeding ? 'Cargando…' : '📦 Cargar los 7 Hacks iniciales'}
                  </button>
                )}
                <button onClick={() => setEditingRecurso('new')} style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', background: C1, color: '#fff', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
                  + Nuevo recurso
                </button>
              </div>
            </div>

            {editingRecurso && (
              <RecursoForm
                initial={editingRecurso === 'new' ? null : editingRecurso}
                onSave={handleSaveRecurso}
                onCancel={() => setEditingRecurso(null)}
              />
            )}

            {recursos.length === 0 && !editingRecurso ? (
              <div style={{ background: DIM, borderRadius: '16px', padding: '48px', textAlign: 'center', border: `1px solid ${BDR}` }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🎁</span>
                <p style={{ fontSize: '16px', fontWeight: 700, color: WHT, marginBottom: '8px' }}>No hay recursos gratis aún</p>
                <p style={{ fontSize: '14px', color: MUT, marginBottom: '24px' }}>
                  Agrega el primero, o carga los 7 Hacks de Instagram que ya existen en el sitio.
                </p>
                <button onClick={() => setEditingRecurso('new')} style={{ background: 'none', border: 'none', color: C1, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                  + Crear primer recurso →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {recursos.map(r => {
                  const t = RECURSO_TIPOS.find(x => x.value === r.tipo)
                  return (
                    <div key={r._id} style={{ background: DIM, borderRadius: '14px', padding: '16px 20px', border: `1px solid ${BDR}`, display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ fontSize: '22px', flexShrink: 0 }}>{t?.icon ?? '🎁'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                          <h3 style={{ fontSize: '14px', fontWeight: 800, color: WHT, margin: 0 }}>{r.titulo}</h3>
                          {r.estado === 'borrador' && (
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', color: ADM.AMB, background: `${ADM.AMB}18` }}>Borrador</span>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: MUT, margin: 0 }}>{r.descripcion || '—'}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => setEditingRecurso(r)} style={{ padding: '7px 14px', borderRadius: '8px', background: `${C1}15`, color: C1, border: `1px solid ${C1}30`, fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          Editar
                        </button>
                        <button onClick={() => handleDeleteRecurso(r._id!, r.titulo)} style={{ padding: '7px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.35)', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

      </div>
    </AdminLayout>
  )
}

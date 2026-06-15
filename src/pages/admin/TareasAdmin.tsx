import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  getTareas, createTarea, updateTarea, deleteTarea,
  getEquipo, createEquipoMember, updateEquipoMember, deleteEquipoMember,
} from '../../lib/db'
import {
  TAREA_ESTADOS, TAREA_FRECUENCIAS, TAREA_PRIORIDADES,
  type Tarea, type TareaEstado, type TareaFrecuencia, type TareaPrioridad,
} from '../../data/tareas'
import { EQUIPO_GRADIENTES, type EquipoMember } from '../../data/contenido'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import { ADM } from '../../lib/adminTheme'

const { BK, DIM, BDR, BDR2, MUT, WHT, C1, ROSE, AMB, BLUE, GRN, INPUT_BG, GHOST } = ADM

/* ── helpers de estilo ──────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: '100%', background: INPUT_BG, border: `1px solid ${BDR2}`,
  borderRadius: '8px', color: WHT, fontSize: '13px',
  padding: '8px 10px', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  fontSize: '10px', color: MUT, fontWeight: 700,
  letterSpacing: '0.5px', textTransform: 'uppercase',
  display: 'block', marginBottom: '5px',
}
const actionBtn = (label: string, onClick: () => void, danger = false): React.JSX.Element => (
  <button onClick={onClick} style={{
    background: danger ? 'rgba(239,68,68,0.08)' : `${C1}15`,
    color: danger ? '#EF4444' : C1,
    border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : `${C1}30`}`,
    padding: '4px 9px', borderRadius: '7px',
    fontWeight: 600, fontSize: '12px', cursor: 'pointer',
  }}>{label}</button>
)

const PRIORIDAD_META: Record<TareaPrioridad, { label: string; color: string }> = {
  alta:  { label: 'Alta',  color: ROSE },
  media: { label: 'Media', color: AMB },
  baja:  { label: 'Baja',  color: BLUE },
}

const FRECUENCIA_LABEL: Record<TareaFrecuencia, string> = Object.fromEntries(
  TAREA_FRECUENCIAS.map(f => [f.value, f.label])
) as Record<TareaFrecuencia, string>

const ESTADO_META: Record<TareaEstado, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: MUT },
  en_curso:  { label: 'En curso',  color: BLUE },
  hecho:     { label: 'Hecho',     color: '#16A34A' },
}

type TareaForm = Omit<Tarea, '_id' | 'createdAt' | 'updatedAt'>

const emptyForm = (equipo: EquipoMember[]): TareaForm => ({
  titulo: '',
  descripcion: '',
  responsableId: equipo[0]?._id ?? '',
  responsableNombre: equipo[0]?.nombre ?? '',
  frecuencia: 'semanal',
  prioridad: 'media',
  estado: 'pendiente',
  fechaLimite: '',
})

type MiembroForm = Pick<EquipoMember, 'nombre' | 'rol' | 'iniciales' | 'emoji' | 'color' | 'pin' | 'desc'>

const emptyMiembro = (): MiembroForm => ({
  nombre: '', rol: '', iniciales: '', emoji: '✨', color: EQUIPO_GRADIENTES[0], pin: '', desc: '',
})

/* ══ Modal de tarea (crear/editar) ══════════════════════════════ */
function TareaModal({ initial, equipo, onSave, onCancel, saving }: {
  initial: TareaForm
  equipo: EquipoMember[]
  onSave: (d: TareaForm) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<TareaForm>(initial)
  const set = <K extends keyof TareaForm>(k: K, v: TareaForm[K]) => setForm(f => ({ ...f, [k]: v }))

  function onResponsableChange(id: string) {
    const m = equipo.find(e => e._id === id)
    setForm(f => ({ ...f, responsableId: id, responsableNombre: m?.nombre ?? '' }))
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: DIM, borderRadius: '14px', border: `1px solid ${BDR}`,
        padding: '22px', maxWidth: '480px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: WHT }}>
          {initial.titulo ? 'Editar tarea' : 'Nueva tarea'}
        </h3>

        <div style={{ marginBottom: '10px' }}>
          <label style={lbl}>Título</label>
          <input value={form.titulo} onChange={e => set('titulo', e.target.value)} style={inp} placeholder="Ej: Publicar reel de Casa Mama" />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={lbl}>Descripción (opcional)</label>
          <textarea value={form.descripcion ?? ''} onChange={e => set('descripcion', e.target.value)} rows={2}
            style={{ ...inp, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={lbl}>Responsable</label>
          <select value={form.responsableId} onChange={e => onResponsableChange(e.target.value)} style={inp}>
            <option value="">— Sin asignar —</option>
            {equipo.filter(m => !!m._id).map(m => (
              <option key={m._id} value={m._id}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div>
            <label style={lbl}>Frecuencia</label>
            <select value={form.frecuencia} onChange={e => set('frecuencia', e.target.value as TareaFrecuencia)} style={inp}>
              {TAREA_FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Prioridad</label>
            <select value={form.prioridad} onChange={e => set('prioridad', e.target.value as TareaPrioridad)} style={inp}>
              {TAREA_PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={lbl}>Fecha límite (opcional)</label>
          <input type="date" value={form.fechaLimite ?? ''} onChange={e => set('fechaLimite', e.target.value)} style={inp} />
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.titulo.trim()}
            style={{
              background: saving ? BDR : C1, color: saving ? MUT : '#fff',
              padding: '10px 22px', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px', border: 'none',
              cursor: saving || !form.titulo.trim() ? 'not-allowed' : 'pointer',
            }}
          >{saving ? 'Guardando…' : '💾 Guardar'}</button>
          <button onClick={onCancel} style={{ background: INPUT_BG, color: WHT, padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', border: `1px solid ${BDR2}`, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══ Modal de miembro (crear/editar) ════════════════════════════ */
function MiembroModal({ initial, onSave, onCancel, saving }: {
  initial: MiembroForm
  onSave: (d: MiembroForm) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<MiembroForm>(initial)
  const set = <K extends keyof MiembroForm>(k: K, v: MiembroForm[K]) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px',
    }} onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} style={{
        background: DIM, borderRadius: '14px', border: `1px solid ${BDR}`,
        padding: '22px', maxWidth: '460px', width: '100%',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 800, color: WHT }}>
          {initial.nombre ? 'Editar miembro' : 'Nuevo miembro'}
        </h3>

        {/* Preview avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: form.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#fff', fontWeight: 800, flexShrink: 0 }}>
            {form.emoji || form.iniciales || '✨'}
          </div>
          <div>
            <p style={{ margin: '0 0 2px', fontSize: '14px', fontWeight: 800, color: WHT }}>{form.nombre || 'Nombre'}</p>
            <p style={{ margin: 0, fontSize: '12px', color: C1, fontWeight: 600 }}>{form.rol || 'Rol'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
          <div><label style={lbl}>Nombre completo</label><input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Rol / Cargo</label><input value={form.rol} onChange={e => set('rol', e.target.value)} style={inp} /></div>
          <div><label style={lbl}>Iniciales (2)</label><input value={form.iniciales} onChange={e => set('iniciales', e.target.value.toUpperCase())} style={inp} maxLength={2} /></div>
          <div><label style={lbl}>Emoji</label><input value={form.emoji} onChange={e => set('emoji', e.target.value)} style={{ ...inp, fontSize: '18px' }} maxLength={4} /></div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={lbl}>Color de avatar</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
            {EQUIPO_GRADIENTES.map(g => (
              <div key={g} onClick={() => set('color', g)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', background: g, cursor: 'pointer', border: form.color === g ? `3px solid ${C1}` : '3px solid transparent', boxSizing: 'border-box' }} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={lbl}>PIN de acceso al portal (4 dígitos)</label>
          <input value={form.pin ?? ''} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))} style={{ ...inp, maxWidth: '130px', letterSpacing: '4px', fontWeight: 800 }} maxLength={4} placeholder="••••" />
          <p style={{ fontSize: '11px', color: MUT, marginTop: '4px' }}>
            Con este PIN el miembro entra a su portal personal de tareas.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.nombre.trim()}
            style={{
              background: saving ? BDR : C1, color: saving ? MUT : '#fff',
              padding: '10px 22px', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px', border: 'none',
              cursor: saving || !form.nombre.trim() ? 'not-allowed' : 'pointer',
            }}
          >{saving ? 'Guardando…' : '💾 Guardar'}</button>
          <button onClick={onCancel} style={{ background: INPUT_BG, color: WHT, padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', border: `1px solid ${BDR2}`, cursor: 'pointer' }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══ Tarjeta de miembro (tab Equipo) ════════════════════════════ */
function MiembroCard({ m, tareas, onEdit, onDelete }: {
  m: EquipoMember
  tareas: Tarea[]
  onEdit: () => void
  onDelete: () => void
}) {
  const mias = tareas.filter(t => t.responsableId === m._id)
  const total = mias.length
  const hechas = mias.filter(t => t.estado === 'hecho').length
  const enCurso = mias.filter(t => t.estado === 'en_curso').length
  const pend = mias.filter(t => t.estado === 'pendiente').length
  const pct = total ? Math.round((hechas / total) * 100) : 0
  const portalUrl = m.pin ? `${window.location.origin}/equipo-portal/${m.pin}` : ''

  return (
    <div style={{ background: DIM, borderRadius: '14px', border: `1px solid ${BDR}`, padding: '16px 18px' }}>
      {/* Cabecera */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: '#fff', fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>
          {m.foto ? <img src={m.foto} alt={m.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (m.emoji || m.iniciales)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 1px', fontSize: '14px', fontWeight: 800, color: WHT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nombre}</p>
          <p style={{ margin: 0, fontSize: '12px', color: C1, fontWeight: 600 }}>{m.rol}</p>
        </div>
        <div style={{ display: 'flex', gap: '5px', flexShrink: 0 }}>
          {actionBtn('✏️', onEdit)}
          {actionBtn('🗑', onDelete, true)}
        </div>
      </div>

      {/* Progreso */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '5px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: MUT }}>Ejecución</span>
          <span style={{ fontSize: '18px', fontWeight: 900, color: pct === 100 && total > 0 ? GRN : C1, lineHeight: 1 }}>{pct}%</span>
        </div>
        <div style={{ height: '8px', background: GHOST, borderRadius: '6px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 && total > 0 ? GRN : C1, borderRadius: '6px', transition: 'width 0.4s ease' }} />
        </div>
        <p style={{ margin: '6px 0 0', fontSize: '11px', color: MUT }}>
          {total === 0 ? 'Sin tareas asignadas' : `${hechas} de ${total} completadas`}
        </p>
      </div>

      {/* Conteo por estado */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
        {[
          { lbl: 'Pendiente', v: pend, c: ESTADO_META.pendiente.color },
          { lbl: 'En curso',  v: enCurso, c: ESTADO_META.en_curso.color },
          { lbl: 'Hecho',     v: hechas, c: ESTADO_META.hecho.color },
        ].map(s => (
          <div key={s.lbl} style={{ flex: 1, textAlign: 'center', background: BK, border: `1px solid ${BDR}`, borderRadius: '9px', padding: '7px 4px' }}>
            <p style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
            <p style={{ margin: 0, fontSize: '9px', color: MUT, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.3px' }}>{s.lbl}</p>
          </div>
        ))}
      </div>

      {/* PIN + portal */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        {m.pin ? (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: `${C1}12`, color: C1, borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: 800, letterSpacing: '2px' }}>
              🔑 {m.pin}
            </span>
            <button onClick={() => { navigator.clipboard.writeText(portalUrl); toast.ok('Link del portal copiado') }}
              style={{ background: 'transparent', border: `1px solid ${BDR2}`, color: WHT, borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              🔗 Copiar link
            </button>
            <a href={portalUrl} target="_blank" rel="noopener noreferrer"
              style={{ background: 'transparent', border: `1px solid ${BDR2}`, color: WHT, borderRadius: '8px', padding: '5px 10px', fontSize: '12px', fontWeight: 600, textDecoration: 'none' }}>
              ↗ Abrir
            </a>
          </>
        ) : (
          <button onClick={onEdit} style={{ background: 'transparent', border: `1px dashed ${BDR2}`, color: MUT, borderRadius: '8px', padding: '5px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
            + Asignar PIN de acceso
          </button>
        )}
      </div>
    </div>
  )
}

/* ══ Tarjeta de tarea en el tablero ══════════════════════════════ */
function TareaCard({ t, miembro, onMove, onEdit, onDelete }: {
  t: Tarea
  miembro?: EquipoMember
  onMove: (dir: -1 | 1) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const idx = TAREA_ESTADOS.findIndex(e => e.value === t.estado)
  const prio = PRIORIDAD_META[t.prioridad]

  return (
    <div style={{ background: DIM, borderRadius: '12px', border: `1px solid ${BDR}`, padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: WHT, lineHeight: 1.35 }}>{t.titulo}</p>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          {actionBtn('✏️', onEdit)}
          {actionBtn('🗑', onDelete, true)}
        </div>
      </div>

      {t.descripcion && (
        <p style={{ margin: '0 0 8px', fontSize: '12px', color: MUT, lineHeight: 1.5 }}>{t.descripcion}</p>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
        {miembro && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', background: BK, border: `1px solid ${BDR}`, borderRadius: '20px', padding: '2px 8px 2px 2px', fontSize: '11px', color: WHT, fontWeight: 600 }}>
            <span style={{ width: '18px', height: '18px', borderRadius: '50%', background: miembro.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#fff', fontWeight: 800 }}>{miembro.iniciales}</span>
            {miembro.nombre}
          </span>
        )}
        <span style={{ background: `${prio.color}15`, color: prio.color, borderRadius: '20px', padding: '3px 9px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {prio.label}
        </span>
        <span style={{ background: GHOST, color: MUT, borderRadius: '20px', padding: '3px 9px', fontSize: '10px', fontWeight: 700 }}>
          {FRECUENCIA_LABEL[t.frecuencia]}
        </span>
        {t.fechaLimite && (
          <span style={{ background: GHOST, color: MUT, borderRadius: '20px', padding: '3px 9px', fontSize: '10px', fontWeight: 700 }}>
            📅 {t.fechaLimite}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={() => onMove(-1)} disabled={idx === 0} style={{
          flex: 1, border: `1px solid ${BDR2}`, background: 'transparent', borderRadius: '8px',
          color: idx === 0 ? BDR2 : WHT, fontSize: '12px', fontWeight: 700, padding: '6px',
          cursor: idx === 0 ? 'not-allowed' : 'pointer',
        }}>◀ {idx > 0 ? ESTADO_META[TAREA_ESTADOS[idx - 1].value].label : ''}</button>
        <button onClick={() => onMove(1)} disabled={idx === TAREA_ESTADOS.length - 1} style={{
          flex: 1, border: `1px solid ${BDR2}`, background: 'transparent', borderRadius: '8px',
          color: idx === TAREA_ESTADOS.length - 1 ? BDR2 : WHT, fontSize: '12px', fontWeight: 700, padding: '6px',
          cursor: idx === TAREA_ESTADOS.length - 1 ? 'not-allowed' : 'pointer',
        }}>{idx < TAREA_ESTADOS.length - 1 ? ESTADO_META[TAREA_ESTADOS[idx + 1].value].label : ''} ▶</button>
      </div>
    </div>
  )
}

/* ══ Página ══════════════════════════════════════════════════════ */
export default function TareasAdmin() {
  const isMobile = useIsMobile()
  const [tareas, setTareas] = useState<Tarea[]>([])
  const [equipo, setEquipo] = useState<EquipoMember[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modal, setModal] = useState<{ tarea: Tarea | null } | null>(null)
  const [miembroModal, setMiembroModal] = useState<{ miembro: EquipoMember | null } | null>(null)

  const [tab, setTab] = useState<'tablero' | 'equipo'>('tablero')
  const [fResponsable, setFResponsable] = useState('todos')
  const [fFrecuencia, setFFrecuencia] = useState('todas')
  const [fPrioridad, setFPrioridad] = useState('todas')

  async function reload() {
    const [t, e] = await Promise.all([getTareas(), getEquipo()])
    setTareas(t); setEquipo(e)
  }

  useEffect(() => { reload().finally(() => setLoading(false)) }, [])

  const filtered = tareas.filter(t =>
    (fResponsable === 'todos' || t.responsableId === fResponsable) &&
    (fFrecuencia === 'todas' || t.frecuencia === fFrecuencia) &&
    (fPrioridad === 'todas' || t.prioridad === fPrioridad)
  )

  const stats = {
    total: filtered.length,
    pendiente: filtered.filter(t => t.estado === 'pendiente').length,
    en_curso: filtered.filter(t => t.estado === 'en_curso').length,
    hecho: filtered.filter(t => t.estado === 'hecho').length,
  }

  async function handleSave(data: TareaForm) {
    setSaving(true)
    try {
      if (modal?.tarea?._id) {
        await updateTarea(modal.tarea._id, data)
        setTareas(prev => prev.map(t => t._id === modal.tarea?._id ? { ...t, ...data } : t))
      } else {
        const id = await createTarea(data)
        setTareas(prev => [{ ...data, _id: id }, ...prev])
      }
      setModal(null)
      toast.ok('Tarea guardada')
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  async function handleDelete(t: Tarea) {
    if (!t._id || !(await confirmar(`¿Eliminar la tarea "${t.titulo}"?`))) return
    try {
      await deleteTarea(t._id)
      setTareas(prev => prev.filter(x => x._id !== t._id))
      toast.ok('Tarea eliminada')
    } catch (err) { toast.err('Error: ' + err) }
  }

  async function handleMove(t: Tarea, dir: -1 | 1) {
    const idx = TAREA_ESTADOS.findIndex(e => e.value === t.estado)
    const next = TAREA_ESTADOS[idx + dir]
    if (!next || !t._id) return
    setTareas(prev => prev.map(x => x._id === t._id ? { ...x, estado: next.value } : x))
    try { await updateTarea(t._id, { estado: next.value }) } catch (err) { toast.err('Error: ' + err) }
  }

  async function handleSaveMiembro(data: MiembroForm) {
    setSaving(true)
    try {
      if (miembroModal?.miembro?._id) {
        await updateEquipoMember(miembroModal.miembro._id, data)
        // Si cambió el nombre, propagar el desnormalizado a sus tareas
        if (data.nombre !== miembroModal.miembro.nombre) {
          const mid = miembroModal.miembro._id
          setTareas(prev => prev.map(t => t.responsableId === mid ? { ...t, responsableNombre: data.nombre } : t))
        }
      } else {
        await createEquipoMember({ ...data, orden: equipo.length })
      }
      await reload()
      setMiembroModal(null)
      toast.ok('Miembro guardado')
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  async function handleDeleteMiembro(m: EquipoMember) {
    if (!m._id) return
    const mias = tareas.filter(t => t.responsableId === m._id).length
    const aviso = mias > 0
      ? `¿Eliminar a "${m.nombre}"? Tiene ${mias} tarea${mias !== 1 ? 's' : ''} asignada${mias !== 1 ? 's' : ''} que quedarán sin responsable.`
      : `¿Eliminar a "${m.nombre}"?`
    if (!(await confirmar(aviso))) return
    try {
      await deleteEquipoMember(m._id)
      await reload()
      toast.ok('Miembro eliminado')
    } catch (err) { toast.err('Error: ' + err) }
  }

  const selectSt = inp

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
              Tareas del equipo
            </h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {/* Tab pills */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {([
                { key: 'tablero', label: '📋 Tablero' },
                { key: 'equipo',  label: '👥 Equipo' },
              ] as { key: typeof tab; label: string }[]).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)} style={{
                  padding: '8px 16px', borderRadius: '20px', border: 'none',
                  background: tab === t.key ? C1 : DIM,
                  color:      tab === t.key ? '#fff' : MUT,
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                  boxShadow: tab === t.key ? `0 0 14px ${C1}55` : 'none',
                }}>
                  {t.label}
                </button>
              ))}
            </div>
            <button onClick={() => tab === 'equipo' ? setMiembroModal({ miembro: null }) : setModal({ tarea: null })} style={{
              background: C1, color: '#fff', border: 'none', padding: '10px 18px',
              borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
            }}>
              {tab === 'equipo' ? '+ Nuevo miembro' : '+ Nueva tarea'}
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '24px 32px' }}>
          {loading ? <ListSkeleton rows={6} /> : tab === 'tablero' ? (
            <>
              {/* ─ Stats ─ */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '16px' }}>
                {[
                  { lbl: 'Total',     val: stats.total,     col: C1 },
                  { lbl: 'Pendiente', val: stats.pendiente, col: ESTADO_META.pendiente.color },
                  { lbl: 'En curso',  val: stats.en_curso,  col: ESTADO_META.en_curso.color },
                  { lbl: 'Hecho',     val: stats.hecho,     col: ESTADO_META.hecho.color },
                ].map(k => (
                  <div key={k.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '14px 18px', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: k.col, opacity: 0.6 }} />
                    <p style={{ margin: '0 0 6px', fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: MUT }}>{k.lbl}</p>
                    <p style={{ margin: 0, fontSize: '24px', fontWeight: 300, color: k.col, lineHeight: 1, fontFamily: 'Georgia, serif' }}>{k.val}</p>
                  </div>
                ))}
              </div>

              {/* ─ Filtros ─ */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '10px', marginBottom: '20px' }}>
                <select value={fResponsable} onChange={e => setFResponsable(e.target.value)} style={selectSt}>
                  <option value="todos">Todos los responsables</option>
                  {equipo.filter(m => !!m._id).map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                </select>
                <select value={fFrecuencia} onChange={e => setFFrecuencia(e.target.value)} style={selectSt}>
                  <option value="todas">Todas las frecuencias</option>
                  {TAREA_FRECUENCIAS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
                <select value={fPrioridad} onChange={e => setFPrioridad(e.target.value)} style={selectSt}>
                  <option value="todas">Todas las prioridades</option>
                  {TAREA_PRIORIDADES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>

              {/* ─ Tablero Kanban ─ */}
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '14px' }}>
                {TAREA_ESTADOS.map(col => {
                  const items = filtered.filter(t => t.estado === col.value)
                  const meta = ESTADO_META[col.value]
                  return (
                    <div key={col.value}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: meta.color }} />
                        <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: WHT }}>{meta.label}</p>
                        <span style={{ background: GHOST, color: MUT, borderRadius: '20px', padding: '1px 8px', fontSize: '11px', fontWeight: 700 }}>{items.length}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {items.length === 0 && (
                          <p style={{ fontSize: '12px', color: MUT, textAlign: 'center', padding: '20px 0' }}>Sin tareas</p>
                        )}
                        {items.map(t => (
                          <TareaCard
                            key={t._id}
                            t={t}
                            miembro={equipo.find(m => m._id === t.responsableId)}
                            onMove={dir => handleMove(t, dir)}
                            onEdit={() => setModal({ tarea: t })}
                            onDelete={() => handleDelete(t)}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          ) : (
            /* ══ TAB EQUIPO ══ */
            <>
              {(() => {
                const conPin = equipo.filter(m => !!m.pin).length
                const totalTareas = tareas.length
                const totalHechas = tareas.filter(t => t.estado === 'hecho').length
                const pctGlobal = totalTareas ? Math.round((totalHechas / totalTareas) * 100) : 0
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '12px', marginBottom: '20px' }}>
                    {[
                      { lbl: 'Miembros',          val: equipo.length,  col: C1 },
                      { lbl: 'Con acceso (PIN)',  val: conPin,         col: BLUE },
                      { lbl: 'Tareas asignadas',  val: totalTareas,    col: AMB },
                      { lbl: 'Avance global',     val: `${pctGlobal}%`, col: GRN },
                    ].map(k => (
                      <div key={k.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '12px', padding: '14px 18px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: k.col, opacity: 0.6 }} />
                        <p style={{ margin: '0 0 6px', fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: MUT }}>{k.lbl}</p>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: 300, color: k.col, lineHeight: 1, fontFamily: 'Georgia, serif' }}>{k.val}</p>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {equipo.length === 0 ? (
                <p style={{ fontSize: '13px', color: MUT, textAlign: 'center', padding: '40px 0' }}>
                  Aún no hay miembros del equipo. Usa “+ Nuevo miembro” para agregar el primero.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
                  {equipo.map(m => (
                    <MiembroCard
                      key={m._id ?? m.nombre}
                      m={m}
                      tareas={tareas}
                      onEdit={() => setMiembroModal({ miembro: m })}
                      onDelete={() => handleDeleteMiembro(m)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modal && (
        <TareaModal
          initial={modal.tarea
            ? { titulo: modal.tarea.titulo, descripcion: modal.tarea.descripcion ?? '', responsableId: modal.tarea.responsableId, responsableNombre: modal.tarea.responsableNombre, frecuencia: modal.tarea.frecuencia, prioridad: modal.tarea.prioridad, estado: modal.tarea.estado, fechaLimite: modal.tarea.fechaLimite ?? '' }
            : emptyForm(equipo)
          }
          equipo={equipo}
          onSave={handleSave}
          onCancel={() => setModal(null)}
          saving={saving}
        />
      )}

      {miembroModal && (
        <MiembroModal
          initial={miembroModal.miembro
            ? { nombre: miembroModal.miembro.nombre, rol: miembroModal.miembro.rol, iniciales: miembroModal.miembro.iniciales, emoji: miembroModal.miembro.emoji, color: miembroModal.miembro.color, pin: miembroModal.miembro.pin ?? '', desc: miembroModal.miembro.desc ?? '' }
            : emptyMiembro()
          }
          onSave={handleSaveMiembro}
          onCancel={() => setMiembroModal(null)}
          saving={saving}
        />
      )}
    </AdminLayout>
  )
}

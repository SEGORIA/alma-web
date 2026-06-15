import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import ImageUploader from '../../components/ImageUploader'
import FileUploader from '../../components/FileUploader'
import {
  getConfig, updateConfig,
  getPasos, createPaso, updatePaso, deletePaso, cleanDuplicatePasos,
  getEquipo, createEquipoMember, updateEquipoMember, deleteEquipoMember, cleanDuplicateEquipo,
  getPrincipios, updatePrincipios,
  getLeadMagnetConfig, updateLeadMagnetConfig,
  getKitArchivos, createKitArchivo, deleteKitArchivo,
  seedConfig,
} from '../../lib/db'
import {
  pasosEstaticos, equipoEstatico, EQUIPO_GRADIENTES,
} from '../../data/contenido'
import {
  contactoDefault, heroStatsDefault, heroSubtituloDefault,
  principiosDefault, leadMagnetDefault,
} from '../../data/config'
import type { PasoItem, EquipoMember } from '../../data/contenido'
import type { ContactoInfo, HeroStat, ManifiestoItem, LeadMagnetConfig } from '../../data/config'
import type { KitArchivo } from '../../data/leads'
import { tipoIcono, formatTamano } from '../../data/leads'
import { Y } from '../../tokens'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ADM } from '../../lib/adminTheme'

const { DIM, BDR, MUT, WHT, C1, INPUT_BG } = ADM
const P  = ADM.C1

/* ── helpers de estilo ──────────────────────────────────────── */
const inp: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: `1px solid ${BDR}`, fontSize: '13px', color: WHT,
  outline: 'none', boxSizing: 'border-box',
}
const lbl: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, color: WHT,
  display: 'block', marginBottom: '5px',
  textTransform: 'uppercase', letterSpacing: '0.5px',
}
const card: React.CSSProperties = {
  background: DIM, borderRadius: '14px',
  border: `1px solid ${BDR}`, padding: '14px 18px',
  display: 'flex', alignItems: 'flex-start',
  justifyContent: 'space-between', gap: '12px',
}
const saved_banner = (
  <div style={{ background: 'rgba(107,33,168,0.10)', color: C1, padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
    ✅ Guardado
  </div>
)

const actionBtn = (label: string, onClick: () => void, danger = false): React.JSX.Element => (
  <button onClick={onClick} style={{
    background: danger ? 'rgba(239,68,68,0.08)' : `${P}15`,
    color: danger ? '#EF4444' : P,
    border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : `${P}30`}`,
    padding: '5px 12px', borderRadius: '8px',
    fontWeight: 600, fontSize: '12px', cursor: 'pointer',
  }}>{label}</button>
)

const saveBtn = (label: string, onClick: () => void, saving: boolean, disabled = false) => (
  <button
    onClick={onClick}
    disabled={saving || disabled}
    style={{
      background: saving ? BDR : P, color: saving ? MUT : '#fff',
      padding: '10px 22px', borderRadius: '10px',
      fontWeight: 700, fontSize: '13px', border: 'none',
      cursor: saving ? 'not-allowed' : 'pointer',
    }}
  >{saving ? 'Guardando…' : label}</button>
)

/* ══ Tab — Hero ════════════════════════════════════════════ */
function TabHero() {
  const [subtitulo, setSubtitulo] = useState(heroSubtituloDefault)
  const [stats,     setStats]     = useState<HeroStat[]>(heroStatsDefault)
  const [saving,    setSaving]    = useState(false)
  const [savedOk,   setSavedOk]   = useState(false)

  useEffect(() => {
    getConfig().then(cfg => {
      setSubtitulo(cfg.heroSubtitulo ?? heroSubtituloDefault)
      setStats(cfg.heroStats ?? heroStatsDefault)
    })
  }, [])

  async function save() {
    setSaving(true); setSavedOk(false)
    try {
      await updateConfig({ heroSubtitulo: subtitulo, heroStats: stats })
      setSavedOk(true); setTimeout(() => setSavedOk(false), 2500)
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  function setStat(i: number, key: keyof HeroStat, val: string | number) {
    setStats(s => s.map((st, idx) => idx === i ? { ...st, [key]: val } : st))
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: MUT, marginBottom: '20px' }}>
        Texto del subtítulo bajo el titular principal, y los 3 contadores animados.
      </p>
      {savedOk && saved_banner}

      <div style={{ marginBottom: '20px' }}>
        <label style={lbl}>Subtítulo</label>
        <textarea
          value={subtitulo} onChange={e => setSubtitulo(e.target.value)}
          rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
        />
      </div>

      <label style={lbl}>Contadores</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 70px 1fr', gap: '10px', alignItems: 'end' }}>
            <div>
              <label style={{ ...lbl, fontSize: '12px' }}>Número</label>
              <input type="number" value={s.target} onChange={e => setStat(i, 'target', Number(e.target.value))} style={inp} />
            </div>
            <div>
              <label style={{ ...lbl, fontSize: '12px' }}>Sufijo</label>
              <input value={s.suffix} onChange={e => setStat(i, 'suffix', e.target.value)} style={inp} maxLength={3} placeholder="+ %" />
            </div>
            <div>
              <label style={{ ...lbl, fontSize: '12px' }}>Etiqueta</label>
              <input value={s.label} onChange={e => setStat(i, 'label', e.target.value)} style={inp} placeholder="Proyectos entregados" />
            </div>
          </div>
        ))}
      </div>

      {saveBtn('💾 Guardar Hero', save, saving)}
    </div>
  )
}

/* ══ Tab — Contacto ════════════════════════════════════════ */
function TabContacto() {
  const [form,    setForm]    = useState<ContactoInfo>(contactoDefault)
  const [saving,  setSaving]  = useState(false)
  const [savedOk, setSavedOk] = useState(false)

  useEffect(() => {
    getConfig().then(cfg => setForm(cfg.contactoInfo ?? contactoDefault))
  }, [])

  const set = (k: keyof ContactoInfo, v: string) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    setSaving(true); setSavedOk(false)
    try {
      await updateConfig({ contactoInfo: form })
      setSavedOk(true); setTimeout(() => setSavedOk(false), 2500)
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  const fields: { key: keyof ContactoInfo; label: string; placeholder: string }[] = [
    { key: 'whatsapp',  label: 'WhatsApp (número puro)',          placeholder: '573188006436' },
    { key: 'telefono',  label: 'Teléfono (texto visible)',        placeholder: '+57 301 336 9325' },
    { key: 'email',     label: 'Email',                           placeholder: 'alma@ejemplo.com' },
    { key: 'ubicacion', label: 'Ubicación',                       placeholder: 'Manizales, Colombia' },
    { key: 'instagram', label: 'Instagram (URL completa)',         placeholder: 'https://instagram.com/...' },
    { key: 'academia',  label: 'Academia (URL del enlace footer)', placeholder: 'https://edu.alma...' },
  ]

  return (
    <div>
      <p style={{ fontSize: '13px', color: MUT, marginBottom: '20px' }}>
        Datos de contacto que aparecen en la sección Contacto y en el footer.
      </p>
      {savedOk && saved_banner}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={lbl}>{f.label}</label>
            <input
              value={form[f.key]} onChange={e => set(f.key, e.target.value)}
              style={inp} placeholder={f.placeholder}
            />
          </div>
        ))}
      </div>
      {saveBtn('💾 Guardar Contacto', save, saving)}
    </div>
  )
}

/* ══ Tab — Proceso ════════════════════════════════════════ */
const PASO_GRADIENTES = [
  'linear-gradient(135deg,#3B0764,#6B21A8)',
  'linear-gradient(135deg,#6B21A8,#9333EA)',
  'linear-gradient(135deg,#7C3AED,#A855F7)',
  'linear-gradient(135deg,#9333EA,#C026D3)',
  'linear-gradient(135deg,#6D28D9,#9333EA)',
  'linear-gradient(135deg,#D97706,#FBBF24)',
]

function PasoForm({ initial, onSave, onCancel, saving }: {
  initial: Omit<PasoItem, '_id'>
  onSave: (d: Omit<PasoItem, '_id'>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<Omit<PasoItem, '_id'>>(initial)
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ background: INPUT_BG, borderRadius: '12px', padding: '20px', border: `1px solid ${BDR}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '60px 60px 1fr', gap: '10px', marginBottom: '10px' }}>
        <div><label style={lbl}>Nro.</label><input value={form.n} onChange={e => set('n', e.target.value)} style={inp} placeholder="01" maxLength={2} /></div>
        <div><label style={lbl}>Emoji</label><input value={form.icon} onChange={e => set('icon', e.target.value)} style={{ ...inp, fontSize: '18px', textAlign: 'center' }} maxLength={4} /></div>
        <div><label style={lbl}>Título</label><input value={form.titulo} onChange={e => set('titulo', e.target.value)} style={inp} placeholder="Escuchamos" /></div>
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={lbl}>Descripción</label>
        <textarea value={form.desc} onChange={e => set('desc', e.target.value)} rows={2}
          style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} placeholder="Descripción del paso..." />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Color de ícono (hover)</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {PASO_GRADIENTES.map(g => (
            <div key={g} onClick={() => set('color', g)}
              style={{ width: '28px', height: '28px', borderRadius: '50%', background: g, cursor: 'pointer', border: form.color === g ? `3px solid ${P}` : '3px solid transparent', boxSizing: 'border-box' }} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        {saveBtn('💾 Guardar', onSave.bind(null, form), saving, !form.n || !form.titulo)}
        <button onClick={onCancel} style={{ background: INPUT_BG, color: WHT, padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

function TabProceso() {
  const [pasos,     setPasos]     = useState<PasoItem[]>(pasosEstaticos)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding,    setAdding]    = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [cleaning,  setCleaning]  = useState(false)
  const isMigrated = pasos.some(p => !!p._id)

  async function reload() { setPasos(await getPasos()) }
  useEffect(() => { reload() }, [])

  async function handleClean() {
    if (!(await confirmar('¿Limpiar pasos duplicados? Se conservará solo una copia de cada paso.'))) return
    setCleaning(true)
    try {
      const deleted = await cleanDuplicatePasos()
      await reload()
      toast.ok(`Limpieza completada. Se eliminaron ${deleted} documento${deleted !== 1 ? 's' : ''} duplicado${deleted !== 1 ? 's' : ''}.`)
    } catch (err) { toast.err('Error: ' + err) }
    setCleaning(false)
  }

  async function handleSave(data: Omit<PasoItem, '_id'>) {
    setSaving(true)
    try {
      if (editingId) await updatePaso(editingId, data)
      else await createPaso({ ...data, orden: pasos.length })
      setEditingId(null); setAdding(false); await reload()
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  async function handleDelete(p: PasoItem) {
    if (!p._id || !(await confirmar(`¿Eliminar el paso "${p.titulo}"?`))) return
    try { await deletePaso(p._id); await reload() } catch (err) { toast.err('Error: ' + err) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontSize: '13px', color: MUT }}>{pasos.length} pasos del proceso de trabajo.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isMigrated && (
            <button onClick={handleClean} disabled={cleaning}
              style={{ background: cleaning ? BDR : 'rgba(239,68,68,0.08)', color: cleaning ? MUT : '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: cleaning ? 'not-allowed' : 'pointer' }}>
              {cleaning ? 'Limpiando…' : '🧹 Limpiar duplicados'}
            </button>
          )}
          {!adding && isMigrated && (
            <button onClick={() => { setAdding(true); setEditingId(null) }}
              style={{ background: P, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              + Nuevo paso
            </button>
          )}
        </div>
      </div>

      {!isMigrated && (
        <div style={{ background: '#FEF9C3', border: '1px solid rgba(250,204,21,0.45)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', fontSize: '13px', color: ADM.AMB }}>
          ⚠️ Migra los datos a Firestore primero para poder editar el proceso.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {pasos.map(paso => (
          <div key={paso._id ?? paso.n}>
            {paso._id && editingId === paso._id ? (
              <PasoForm initial={{ n: paso.n, icon: paso.icon, titulo: paso.titulo, desc: paso.desc, color: paso.color, orden: paso.orden ?? 0 }}
                onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving} />
            ) : (
              <div style={{ ...card, opacity: paso._id ? 1 : 0.65 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: paso.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>{paso.icon}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: WHT }}>Paso {paso.n} · {paso.titulo}</p>
                    <p style={{ fontSize: '12px', color: MUT, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '380px' }}>{paso.desc}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {paso._id && actionBtn('✏️', () => { setEditingId(paso._id!); setAdding(false) })}
                  {paso._id && actionBtn('🗑', () => handleDelete(paso), true)}
                </div>
              </div>
            )}
          </div>
        ))}
        {adding && (
          <PasoForm initial={{ n: String(pasos.length + 1).padStart(2, '0'), icon: '✨', titulo: '', desc: '', color: PASO_GRADIENTES[0], orden: pasos.length }}
            onSave={handleSave} onCancel={() => setAdding(false)} saving={saving} />
        )}
      </div>
    </div>
  )
}

/* ══ Tab — Equipo ═══════════════════════════════════════════ */
function EquipoForm({ initial, onSave, onCancel, saving }: {
  initial: Omit<EquipoMember, '_id'>
  onSave: (d: Omit<EquipoMember, '_id'>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<Omit<EquipoMember, '_id'>>(initial)
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ background: INPUT_BG, borderRadius: '12px', padding: '20px', border: `1px solid ${BDR}` }}>

      {/* Foto */}
      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Foto del miembro</label>
        <p style={{ fontSize: '12px', color: MUT, marginBottom: '10px', marginTop: '2px' }}>
          Si subes una foto se mostrará en lugar del emoji. Ideal cuadrada o de perfil.
        </p>

        {/* Preview del avatar actual */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
            background: form.foto ? 'transparent' : form.color,
            overflow: 'hidden', border: `3px solid ${BDR}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {form.foto
              ? <img src={form.foto} alt={form.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '26px' }}>{form.emoji || form.iniciales}</span>
            }
          </div>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 700, color: WHT, margin: '0 0 2px' }}>{form.nombre || 'Nombre'}</p>
            <p style={{ fontSize: '12px', color: P, margin: 0 }}>{form.rol || 'Rol'}</p>
          </div>
        </div>

        <ImageUploader
          currentUrl={form.foto}
          onUploaded={url => set('foto', url)}
          height={160}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
        <div><label style={lbl}>Nombre completo</label><input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Rol / Cargo</label><input value={form.rol} onChange={e => set('rol', e.target.value)} style={inp} /></div>
        <div><label style={lbl}>Iniciales (2) — se usan si no hay foto</label><input value={form.iniciales} onChange={e => set('iniciales', e.target.value.toUpperCase())} style={inp} maxLength={2} /></div>
        <div><label style={lbl}>Emoji — se usa si no hay foto</label><input value={form.emoji} onChange={e => set('emoji', e.target.value)} style={{ ...inp, fontSize: '18px' }} maxLength={4} /></div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={lbl}>PIN de acceso al portal de tareas (opcional)</label>
        <input value={form.pin ?? ''} onChange={e => set('pin', e.target.value.replace(/\D/g, ''))} style={{ ...inp, maxWidth: '120px' }} maxLength={4} placeholder="Ej: 1234" />
        <p style={{ fontSize: '12px', color: MUT, marginTop: '4px' }}>
          Si lo asignas, este miembro podrá entrar a <code>/equipo-portal/{form.pin || '••••'}</code> para ver y actualizar sus tareas.
        </p>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={lbl}>Descripción</label>
        <textarea value={form.desc} onChange={e => set('desc', e.target.value)} rows={2}
          style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={lbl}>Color de avatar (si no hay foto)</label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
          {EQUIPO_GRADIENTES.map(g => (
            <div key={g} onClick={() => set('color', g)}
              style={{ width: '28px', height: '28px', borderRadius: '50%', background: g, cursor: 'pointer', border: form.color === g ? `3px solid ${P}` : '3px solid transparent', boxSizing: 'border-box' }} />
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {saveBtn('💾 Guardar', onSave.bind(null, form), saving, !form.nombre)}
        <button onClick={onCancel} style={{ background: INPUT_BG, color: WHT, padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

function TabEquipo() {
  const [equipo,    setEquipo]    = useState<EquipoMember[]>(equipoEstatico)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding,    setAdding]    = useState(false)
  const [saving,    setSaving]    = useState(false)
  const [cleaning,  setCleaning]  = useState(false)
  const isMigrated = equipo.some(m => !!m._id)

  async function reload() { setEquipo(await getEquipo()) }
  useEffect(() => { reload() }, [])

  async function handleClean() {
    if (!(await confirmar('¿Limpiar miembros duplicados del equipo? Se conservará solo una copia de cada persona.'))) return
    setCleaning(true)
    try {
      const deleted = await cleanDuplicateEquipo()
      await reload()
      toast.ok(`Limpieza completada. Se eliminaron ${deleted} documento${deleted !== 1 ? 's' : ''} duplicado${deleted !== 1 ? 's' : ''}.`)
    } catch (err) { toast.err('Error: ' + err) }
    setCleaning(false)
  }

  async function handleSave(data: Omit<EquipoMember, '_id'>) {
    setSaving(true)
    try {
      if (editingId) await updateEquipoMember(editingId, data)
      else await createEquipoMember({ ...data, orden: equipo.length })
      setEditingId(null); setAdding(false); await reload()
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  async function handleDelete(m: EquipoMember) {
    if (!m._id || !(await confirmar(`¿Eliminar a "${m.nombre}"?`))) return
    try { await deleteEquipoMember(m._id); await reload() } catch (err) { toast.err('Error: ' + err) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <p style={{ fontSize: '13px', color: MUT }}>{equipo.length} miembro{equipo.length !== 1 ? 's' : ''} del equipo — aparecen en la sección Nosotros.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {isMigrated && (
            <button onClick={handleClean} disabled={cleaning}
              style={{ background: cleaning ? BDR : 'rgba(239,68,68,0.08)', color: cleaning ? MUT : '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 14px', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: cleaning ? 'not-allowed' : 'pointer' }}>
              {cleaning ? 'Limpiando…' : '🧹 Limpiar duplicados'}
            </button>
          )}
          {!adding && isMigrated && (
            <button onClick={() => { setAdding(true); setEditingId(null) }}
              style={{ background: P, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
              + Nuevo miembro
            </button>
          )}
        </div>
      </div>

      {!isMigrated && (
        <div style={{ background: '#FEF9C3', border: '1px solid rgba(250,204,21,0.45)', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', fontSize: '13px', color: ADM.AMB }}>
          ⚠️ Migra los datos a Firestore primero para editar el equipo.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {equipo.map(m => (
          <div key={m._id ?? m.nombre}>
            {m._id && editingId === m._id ? (
              <EquipoForm initial={{ nombre: m.nombre, rol: m.rol, desc: m.desc, iniciales: m.iniciales, emoji: m.emoji, color: m.color, orden: m.orden ?? 0, pin: m.pin ?? '' }}
                onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving} />
            ) : (
              <div style={{ ...card, opacity: m._id ? 1 : 0.65 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: '#fff', fontWeight: 800, flexShrink: 0 }}>{m.iniciales}</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: WHT }}>{m.nombre}</p>
                    <p style={{ fontSize: '12px', color: P, marginTop: '1px', fontWeight: 600 }}>{m.rol}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {m.pin && actionBtn('🔗', () => {
                    navigator.clipboard.writeText(`${window.location.origin}/equipo-portal/${m.pin}`)
                    toast.ok('Link del portal copiado')
                  })}
                  {m._id && actionBtn('✏️', () => { setEditingId(m._id!); setAdding(false) })}
                  {m._id && actionBtn('🗑', () => handleDelete(m), true)}
                </div>
              </div>
            )}
          </div>
        ))}
        {adding && (
          <EquipoForm initial={{ nombre: '', rol: '', desc: '', iniciales: '', emoji: '✨', color: EQUIPO_GRADIENTES[0], orden: equipo.length, pin: '' }}
            onSave={handleSave} onCancel={() => setAdding(false)} saving={saving} />
        )}
      </div>
    </div>
  )
}

/* ══ Tab — Manifiesto ════════════════════════════════════════ */
function TabManifiesto() {
  const [principios, setPrincipios] = useState<ManifiestoItem[]>(principiosDefault)
  const [saving,     setSaving]     = useState(false)
  const [savedOk,    setSavedOk]    = useState(false)

  useEffect(() => {
    getPrincipios().then(setPrincipios).catch(() => setPrincipios(principiosDefault))
  }, [])

  const set = (i: number, key: keyof ManifiestoItem, val: string) =>
    setPrincipios(prev => prev.map((p, idx) => idx === i ? { ...p, [key]: val } : p))

  const addPrincipio = () => {
    const n = String(principios.length + 1).padStart(2, '0')
    setPrincipios(prev => [...prev, { n, titulo: '', desc: '' }])
  }

  const removePrincipio = (i: number) =>
    setPrincipios(prev => prev.filter((_, idx) => idx !== i))

  async function save() {
    setSaving(true); setSavedOk(false)
    try {
      await updatePrincipios(principios)
      setSavedOk(true); setTimeout(() => setSavedOk(false), 2500)
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: MUT, marginBottom: '20px' }}>
        Los 6 principios que aparecen en la sección Manifiesto de la landing page.
      </p>
      {savedOk && saved_banner}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {principios.map((p, i) => (
          <div key={i} style={{ background: INPUT_BG, borderRadius: '12px', padding: '16px', border: `1px solid ${BDR}` }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr auto', gap: '10px', alignItems: 'end', marginBottom: '10px' }}>
              <div>
                <label style={lbl}>Nro.</label>
                <input value={p.n} onChange={e => set(i, 'n', e.target.value)} style={inp} maxLength={2} placeholder="01" />
              </div>
              <div>
                <label style={lbl}>Título</label>
                <input value={p.titulo} onChange={e => set(i, 'titulo', e.target.value)} style={inp} placeholder="Humanización" />
              </div>
              <button
                onClick={() => removePrincipio(i)}
                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', alignSelf: 'flex-end' }}>
                🗑
              </button>
            </div>
            <div>
              <label style={lbl}>Descripción</label>
              <textarea value={p.desc} onChange={e => set(i, 'desc', e.target.value)} rows={2}
                style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                placeholder="Descripción breve del principio..." />
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={addPrincipio}
          style={{ background: `${P}15`, color: P, border: `1px solid ${P}30`, padding: '9px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
          + Agregar principio
        </button>
      </div>

      {saveBtn('💾 Guardar Manifiesto', save, saving)}
    </div>
  )
}

/* ══ Tab — Lead Magnet ═══════════════════════════════════════ */
function TabLeadMagnet() {
  const [form,      setForm]      = useState<LeadMagnetConfig>(leadMagnetDefault)
  const [archivos,  setArchivos]  = useState<KitArchivo[]>([])
  const [saving,    setSaving]    = useState(false)
  const [savedOk,   setSavedOk]   = useState(false)
  const [newNombre, setNewNombre] = useState('')
  const [newDesc,   setNewDesc]   = useState('')

  useEffect(() => {
    getLeadMagnetConfig().then(setForm).catch(() => setForm(leadMagnetDefault))
    getKitArchivos().then(setArchivos).catch(() => setArchivos([]))
  }, [])

  /* ── Texto del kit ─────────────────────────────────── */
  const setRecurso = (i: number, val: string) =>
    setForm(f => ({ ...f, recursos: f.recursos.map((r, idx) => idx === i ? val : r) }))
  const addRecurso    = () => setForm(f => ({ ...f, recursos: [...f.recursos, ''] }))
  const removeRecurso = (i: number) =>
    setForm(f => ({ ...f, recursos: f.recursos.filter((_, idx) => idx !== i) }))

  async function saveTexto() {
    setSaving(true); setSavedOk(false)
    try {
      await updateLeadMagnetConfig(form)
      setSavedOk(true); setTimeout(() => setSavedOk(false), 2500)
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  /* ── Archivos del kit ──────────────────────────────── */
  async function handleUploaded(url: string, nombre: string, tipo: string, tamano: number) {
    const displayName = newNombre.trim() || nombre
    try {
      await createKitArchivo({ nombre: displayName, descripcion: newDesc.trim() || undefined, url, tipo, tamano })
      setNewNombre('')
      setNewDesc('')
      setArchivos(await getKitArchivos())
    } catch (err) { toast.err('Error al guardar el archivo: ' + err) }
  }

  async function handleDeleteArchivo(id: string, nombre: string) {
    if (!(await confirmar(`¿Eliminar "${nombre}" del kit?`))) return
    try {
      await deleteKitArchivo(id)
      setArchivos(prev => prev.filter(a => a._id !== id))
    } catch (err) { toast.err('Error: ' + err) }
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: MUT, marginBottom: '20px' }}>
        El kit gratuito que aparece en la sección de captura de leads.
      </p>

      {/* ── Sección 1: Archivos descargables ── */}
      <div style={{ background: INPUT_BG, borderRadius: '14px', padding: '20px', border: `1px solid ${BDR}`, marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: WHT, margin: '0 0 4px' }}>
              📁 Archivos del Kit
            </h3>
            <p style={{ fontSize: '12px', color: MUT, margin: 0 }}>
              {archivos.length} archivo{archivos.length !== 1 ? 's' : ''} — los usuarios los descargan al pedir el kit
            </p>
          </div>
          <span style={{ background: `${P}15`, color: P, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px' }}>
            DESCARGABLES
          </span>
        </div>

        {/* Lista archivos actuales */}
        {archivos.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {archivos.map(a => (
              <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: DIM, borderRadius: '10px', padding: '10px 14px', border: `1px solid ${BDR}` }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{tipoIcono(a.tipo)}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '13px', color: WHT, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.nombre}</p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px' }}>
                    {a.descripcion && <span style={{ fontSize: '11px', color: MUT }}>{a.descripcion}</span>}
                    {a.tamano && <span style={{ fontSize: '11px', color: MUT }}>{formatTamano(a.tamano)}</span>}
                    <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: P, fontWeight: 600, textDecoration: 'none' }}>Ver →</a>
                  </div>
                </div>
                <button onClick={() => handleDeleteArchivo(a._id!, a.nombre)}
                  style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para nuevo archivo */}
        <div style={{ borderTop: archivos.length > 0 ? `1px solid ${BDR}` : 'none', paddingTop: archivos.length > 0 ? '16px' : 0 }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: WHT, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            + Subir nuevo archivo
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            <div>
              <label style={lbl}>Nombre visible (opcional)</label>
              <input value={newNombre} onChange={e => setNewNombre(e.target.value)} style={inp}
                placeholder="Ej: Guía de Métricas.pdf" />
            </div>
            <div>
              <label style={lbl}>Descripción corta (opcional)</label>
              <input value={newDesc} onChange={e => setNewDesc(e.target.value)} style={inp}
                placeholder="Ej: Para medir tus resultados" />
            </div>
          </div>
          <FileUploader onUploaded={handleUploaded} />
        </div>
      </div>

      {/* ── Sección 2: Texto de la sección ── */}
      <div style={{ background: INPUT_BG, borderRadius: '14px', padding: '20px', border: `1px solid ${BDR}` }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: WHT, margin: '0 0 16px' }}>
          ✏️ Texto de la Sección
        </h3>
        {savedOk && saved_banner}

        <div style={{ marginBottom: '16px' }}>
          <label style={lbl}>Título</label>
          <input value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} style={inp}
            placeholder="Descarga el kit que necesita tu marca digital" />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={lbl}>Subtítulo / descripción</label>
          <textarea value={form.subtitulo} onChange={e => setForm(f => ({ ...f, subtitulo: e.target.value }))} rows={3}
            style={{ ...inp, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
            placeholder="Herramientas prácticas con IA..." />
        </div>

        <label style={lbl}>Beneficios listados en la tarjeta visual</label>
        <p style={{ fontSize: '12px', color: MUT, marginBottom: '10px' }}>
          Se muestran en la tarjeta animada a la izquierda de la sección.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
          {form.recursos.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: MUT, width: '20px', flexShrink: 0 }}>{i + 1}.</span>
              <input value={r} onChange={e => setRecurso(i, e.target.value)} style={{ ...inp, flex: 1 }}
                placeholder="Nombre del beneficio..." />
              <button onClick={() => removeRecurso(i)}
                style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}>
                🗑
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button onClick={addRecurso}
            style={{ background: `${P}15`, color: P, border: `1px solid ${P}30`, padding: '9px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            + Agregar beneficio
          </button>
        </div>

        {saveBtn('💾 Guardar Texto', saveTexto, saving)}
      </div>
    </div>
  )
}

/* ══ Página principal ════════════════════════════════════════ */
const TABS = [
  { id: 'hero',       label: '🏠 Hero' },
  { id: 'contacto',   label: '📞 Contacto' },
  { id: 'proceso',    label: '🔄 Proceso' },
  { id: 'equipo',     label: '👥 Equipo' },
  { id: 'manifiesto', label: '✨ Manifiesto' },
  { id: 'leadmagnet', label: '🎁 Kit Gratuito' },
]

export default function ContenidoAdmin() {
  const [tab,     setTab]     = useState('hero')
  const [seeding, setSeeding] = useState(false)

  async function handleSeed() {
    if (!(await confirmar('¿Migrar todos los datos de contenido a Firestore? (Hero, Contacto, Proceso, Equipo, Testimonios, FAQ, Clientes)'))) return
    setSeeding(true)
    try {
      await seedConfig()
      toast.ok('Contenido migrado correctamente a Firestore')
    } catch (err) { toast.err('Error: ' + err) }
    setSeeding(false)
  }

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)', maxWidth: '860px' }}>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: WHT, marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Contenido
            </h1>
            <p style={{ fontSize: '14px', color: MUT }}>
              Edita el contenido de todas las secciones del sitio.
            </p>
          </div>
          <button
            onClick={handleSeed} disabled={seeding}
            style={{
              background: seeding ? BDR : `${Y}33`,
              color: seeding ? MUT : ADM.AMB,
              border: `1px solid ${seeding ? BDR : Y}`,
              padding: '10px 18px', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px', cursor: seeding ? 'not-allowed' : 'pointer',
            }}
          >
            {seeding ? 'Migrando…' : '🌱 Migrar datos a Firestore'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '9px 18px', borderRadius: '10px',
              fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer',
              background: tab === t.id ? P : INPUT_BG,
              color: tab === t.id ? '#fff' : WHT,
              transition: 'all 0.2s ease',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'hero'       && <TabHero />}
        {tab === 'contacto'   && <TabContacto />}
        {tab === 'proceso'    && <TabProceso />}
        {tab === 'equipo'     && <TabEquipo />}
        {tab === 'manifiesto' && <TabManifiesto />}
        {tab === 'leadmagnet' && <TabLeadMagnet />}

      </div>
    </AdminLayout>
  )
}

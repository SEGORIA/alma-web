import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import {
  getConfig, updateConfig,
  getTestimonios, createTestimonio, updateTestimonio, deleteTestimonio,
  getFaqs, createFaq, updateFaq, deleteFaq,
  seedConfig, seedArticulos, seedPortafolio, seedPrecios,
} from '../../lib/db'
import {
  seccionesInfo, seccionesDefault, clientesEstaticos, testimoniosEstaticos, faqsEstaticos,
} from '../../data/config'
import type { SeccionesConfig, Testimonio, FaqItem } from '../../data/config'
import { P, Y } from '../../tokens'
import { toast, confirmar } from '../../components/admin/Feedback'

/* ── pequeños helpers de estilo ─────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: '8px',
  border: '1px solid #E5E7EB', fontSize: '13px', color: '#111827',
  outline: 'none', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  fontSize: '12px', fontWeight: 700, color: '#374151',
  display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px',
}
const cardStyle: React.CSSProperties = {
  background: '#fff', borderRadius: '14px',
  border: '1px solid #E5E7EB', padding: '14px 18px',
  display: 'flex', alignItems: 'flex-start',
  justifyContent: 'space-between', gap: '12px',
}
const actionBtn = (label: string, onClick: () => void, danger = false): React.JSX.Element => (
  <button onClick={onClick} style={{
    background: danger ? 'rgba(239,68,68,0.08)' : `${P}15`,
    color: danger ? '#EF4444' : P,
    border: `1px solid ${danger ? 'rgba(239,68,68,0.2)' : `${P}30`}`,
    padding: '5px 12px', borderRadius: '8px',
    fontWeight: 600, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap',
  }}>{label}</button>
)

/* ══ Tab 1 — Secciones ══════════════════════════════════════ */
function TabSecciones() {
  const [secciones, setSecciones] = useState<SeccionesConfig>(seccionesDefault)
  const [saving,    setSaving]    = useState(false)
  const [saved,     setSaved]     = useState(false)

  useEffect(() => {
    getConfig().then(cfg => setSecciones(cfg.secciones))
  }, [])

  async function toggle(id: keyof SeccionesConfig) {
    const next = { ...secciones, [id]: !secciones[id] }
    setSecciones(next)
    setSaving(true); setSaved(false)
    try {
      await updateConfig({ secciones: next })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { toast.err('Error al guardar: ' + err) }
    setSaving(false)
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
        Activa o desactiva secciones del sitio web. Los cambios se aplican de inmediato para visitantes nuevos.
        <br />
        <strong style={{ color: '#374151' }}>Hero</strong> y <strong style={{ color: '#374151' }}>Contacto</strong> siempre están visibles.
      </p>

      {saved && (
        <div style={{ background: 'rgba(107,33,168,0.10)', color: '#4B2B82', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
          ✅ Cambios guardados
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {seccionesInfo.map(info => {
          const activa = secciones[info.id]
          return (
            <div key={info.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: '#fff', border: `1px solid ${activa ? '#DDD6FE' : '#E5E7EB'}`,
              borderRadius: '14px', padding: '14px 18px', gap: '16px',
              transition: 'border-color 0.2s ease',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <span style={{ fontSize: '20px' }}>{info.icon}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>{info.label}</p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '1px' }}>{info.desc}</p>
                </div>
              </div>
              {/* Toggle switch */}
              <button
                onClick={() => toggle(info.id)}
                disabled={saving}
                style={{
                  width: '48px', height: '26px', borderRadius: '13px',
                  border: 'none', cursor: saving ? 'not-allowed' : 'pointer',
                  background: activa ? P : '#D1D5DB',
                  position: 'relative', flexShrink: 0,
                  transition: 'background 0.2s ease',
                }}
                title={activa ? 'Desactivar' : 'Activar'}
              >
                <span style={{
                  position: 'absolute', top: '3px',
                  left: activa ? '25px' : '3px',
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                  transition: 'left 0.2s ease',
                }} />
              </button>
              <span style={{
                fontSize: '12px', fontWeight: 700, minWidth: '60px', textAlign: 'center',
                color: activa ? P : '#9CA3AF',
                background: activa ? `${P}15` : '#F3F4F6',
                padding: '3px 10px', borderRadius: '20px',
              }}>
                {activa ? 'VISIBLE' : 'OCULTA'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ══ Tab 2 — Clientes ════════════════════════════════════════ */
function TabClientes() {
  const [clientes, setClientes] = useState<string[]>(clientesEstaticos)
  const [nuevo,    setNuevo]    = useState('')
  const [saving,   setSaving]   = useState(false)
  const [saved,    setSaved]    = useState(false)

  useEffect(() => {
    getConfig().then(cfg => setClientes(cfg.clientes))
  }, [])

  async function save(lista: string[]) {
    setSaving(true); setSaved(false)
    try {
      await updateConfig({ clientes: lista })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { toast.err('Error al guardar: ' + err) }
    setSaving(false)
  }

  function remove(i: number) {
    const next = clientes.filter((_, idx) => idx !== i)
    setClientes(next); save(next)
  }

  function add() {
    const val = nuevo.trim()
    if (!val) return
    const next = [...clientes, val]
    setClientes(next); setNuevo(''); save(next)
  }

  function updateNombre(i: number, val: string) {
    const next = [...clientes]
    next[i] = val
    setClientes(next)
  }

  return (
    <div>
      <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>
        Nombres que aparecen en el marquee "Confían en Alma" bajo el hero.
      </p>

      {saved && (
        <div style={{ background: 'rgba(107,33,168,0.10)', color: '#4B2B82', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
          ✅ Lista guardada
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
        {clientes.map((nombre, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={nombre}
              onChange={e => updateNombre(i, e.target.value)}
              onBlur={() => save(clientes)}
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              onClick={() => remove(i)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontWeight: 700, fontSize: '18px', padding: '4px 8px' }}
              title="Eliminar"
            >×</button>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          value={nuevo} onChange={e => setNuevo(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Nombre del cliente..."
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          onClick={add}
          disabled={!nuevo.trim() || saving}
          style={{
            background: P, color: '#fff', border: 'none',
            padding: '9px 18px', borderRadius: '8px',
            fontWeight: 700, fontSize: '13px', cursor: 'pointer',
          }}
        >
          + Agregar
        </button>
      </div>
    </div>
  )
}

/* ══ Tab 3 — Testimonios ════════════════════════════════════ */

const GRADIENTES = [
  'linear-gradient(135deg,#3B0764,#6B21A8)',
  'linear-gradient(135deg,#6B21A8,#9333EA)',
  'linear-gradient(135deg,#4A0E8F,#7E22CE)',
  'linear-gradient(135deg,#7E22CE,#A855F7)',
  'linear-gradient(135deg,#D97706,#FBBF24)',
  'linear-gradient(135deg,#5B21B6,#9333EA)',
  'linear-gradient(135deg,#581C87,#A855F7)',
  'linear-gradient(135deg,#E11D48,#F43F5E)',
]

function TestimonioForm({ initial, onSave, onCancel, saving }: {
  initial: Omit<Testimonio, '_id'>
  onSave: (d: Omit<Testimonio, '_id'>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<Omit<Testimonio, '_id'>>(initial)
  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  return (
    <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyle}>Nombre</label>
          <input value={form.nombre} onChange={e => set('nombre', e.target.value)} style={inputStyle} placeholder="María García" />
        </div>
        <div>
          <label style={labelStyle}>Empresa</label>
          <input value={form.empresa} onChange={e => set('empresa', e.target.value)} style={inputStyle} placeholder="Mi Empresa" />
        </div>
        <div>
          <label style={labelStyle}>Rol / Cargo</label>
          <input value={form.rol} onChange={e => set('rol', e.target.value)} style={inputStyle} placeholder="CEO" />
        </div>
        <div>
          <label style={labelStyle}>Iniciales (2 letras)</label>
          <input value={form.iniciales} onChange={e => set('iniciales', e.target.value.toUpperCase())} style={inputStyle} maxLength={2} placeholder="MG" />
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Testimonio</label>
        <textarea
          value={form.texto} onChange={e => set('texto', e.target.value)}
          rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
          placeholder="Texto del testimonio..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Fila en el marquee</label>
          <select value={form.fila} onChange={e => set('fila', Number(e.target.value) as 1|2)}
            style={{ ...inputStyle }}>
            <option value={1}>Fila 1 (izquierda → derecha)</option>
            <option value={2}>Fila 2 (derecha → izquierda)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Color de avatar</label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
            {GRADIENTES.map(g => (
              <div
                key={g}
                onClick={() => set('color', g)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%', background: g,
                  cursor: 'pointer', flexShrink: 0,
                  border: form.color === g ? `3px solid ${P}` : '3px solid transparent',
                  boxSizing: 'border-box',
                }}
                title={g}
              />
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.nombre || !form.texto}
          style={{ background: saving ? '#E5E7EB' : P, color: saving ? '#9CA3AF' : '#fff', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
        >{saving ? 'Guardando…' : '💾 Guardar'}</button>
        <button onClick={onCancel} style={{ background: '#F3F4F6', color: '#374151', padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

function TabTestimonios() {
  const [testimonios,  setTestimonios]  = useState<Testimonio[]>(testimoniosEstaticos)
  const [editingId,    setEditingId]    = useState<string | null>(null)
  const [adding,       setAdding]       = useState(false)
  const [saving,       setSaving]       = useState(false)

  async function reload() {
    const t = await getTestimonios(); setTestimonios(t)
  }
  useEffect(() => { reload() }, [])

  async function handleSave(data: Omit<Testimonio, '_id'>) {
    setSaving(true)
    try {
      if (editingId) await updateTestimonio(editingId, data)
      else await createTestimonio({ ...data, orden: testimonios.length })
      setEditingId(null); setAdding(false); await reload()
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  async function handleDelete(t: Testimonio) {
    if (!t._id || !(await confirmar(`¿Eliminar el testimonio de "${t.nombre}"?`))) return
    try { await deleteTestimonio(t._id); await reload() }
    catch (err) { toast.err('Error: ' + err) }
  }

  const emptyTestimonio: Omit<Testimonio, '_id'> = {
    nombre: '', rol: '', empresa: '', texto: '', iniciales: '',
    color: GRADIENTES[0], fila: 1, orden: testimonios.length,
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>
          {testimonios.length} testimonio{testimonios.length !== 1 ? 's' : ''} — aparecen en el marquee animado de la página de inicio.
        </p>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditingId(null) }}
            style={{ background: P, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >+ Nuevo</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {testimonios.map(t => (
          <div key={t._id ?? t.nombre}>
            {editingId === t._id ? (
              <TestimonioForm
                initial={{ nombre: t.nombre, rol: t.rol, empresa: t.empresa, texto: t.texto, iniciales: t.iniciales, color: t.color, fila: t.fila, orden: t.orden ?? 0 }}
                onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving}
              />
            ) : (
              <div style={cardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#fff', flexShrink: 0 }}>{t.iniciales}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '13px', color: '#111827' }}>{t.nombre} · <span style={{ color: '#6B7280', fontWeight: 500 }}>{t.rol}, {t.empresa}</span></p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>"{t.texto}"</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {actionBtn('✏️', () => { setEditingId(t._id ?? null); setAdding(false) })}
                  {actionBtn('🗑', () => handleDelete(t), true)}
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <TestimonioForm initial={emptyTestimonio} onSave={handleSave} onCancel={() => setAdding(false)} saving={saving} />
        )}

        {testimonios.length === 0 && !adding && (
          <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', padding: '24px', background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
            Sin testimonios. Usa "🌱 Migrar datos" para cargar los testimonios iniciales.
          </p>
        )}
      </div>
    </div>
  )
}

/* ══ Tab 4 — FAQ ════════════════════════════════════════════ */
function FaqForm({ initial, onSave, onCancel, saving }: {
  initial: Omit<FaqItem, '_id'>
  onSave: (d: Omit<FaqItem, '_id'>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<Omit<FaqItem, '_id'>>(initial)

  return (
    <div style={{ background: '#F9FAFB', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>Pregunta</label>
        <input value={form.q} onChange={e => setForm(f => ({ ...f, q: e.target.value }))} style={inputStyle} placeholder="¿Cuánto tiempo tarda...?" />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>Respuesta</label>
        <textarea value={form.a} onChange={e => setForm(f => ({ ...f, a: e.target.value }))}
          rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
          placeholder="La respuesta completa..."
        />
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.q || !form.a}
          style={{ background: saving ? '#E5E7EB' : P, color: saving ? '#9CA3AF' : '#fff', padding: '10px 22px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer' }}
        >{saving ? 'Guardando…' : '💾 Guardar'}</button>
        <button onClick={onCancel} style={{ background: '#F3F4F6', color: '#374151', padding: '10px 18px', borderRadius: '10px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}>Cancelar</button>
      </div>
    </div>
  )
}

function TabFaq() {
  const [faqs,      setFaqs]      = useState<FaqItem[]>(faqsEstaticos)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding,    setAdding]    = useState(false)
  const [saving,    setSaving]    = useState(false)

  async function reload() {
    const f = await getFaqs(); setFaqs(f)
  }
  useEffect(() => { reload() }, [])

  async function handleSave(data: Omit<FaqItem, '_id'>) {
    setSaving(true)
    try {
      if (editingId) await updateFaq(editingId, data)
      else await createFaq({ ...data, orden: faqs.length })
      setEditingId(null); setAdding(false); await reload()
    } catch (err) { toast.err('Error: ' + err) }
    setSaving(false)
  }

  async function handleDelete(f: FaqItem) {
    if (!f._id || !(await confirmar(`¿Eliminar la pregunta "${f.q}"?`))) return
    try { await deleteFaq(f._id); await reload() }
    catch (err) { toast.err('Error: ' + err) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '13px', color: '#6B7280' }}>
          {faqs.length} pregunta{faqs.length !== 1 ? 's' : ''} — acordeón de FAQ en el inicio.
        </p>
        {!adding && (
          <button
            onClick={() => { setAdding(true); setEditingId(null) }}
            style={{ background: P, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
          >+ Nueva pregunta</button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {faqs.map((faq, idx) => (
          <div key={faq._id ?? faq.q}>
            {editingId === faq._id ? (
              <FaqForm initial={{ q: faq.q, a: faq.a, orden: faq.orden ?? idx }}
                onSave={handleSave} onCancel={() => setEditingId(null)} saving={saving} />
            ) : (
              <div style={cardStyle}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, fontSize: '13px', color: '#111827', marginBottom: '3px' }}>{faq.q}</p>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{faq.a}</p>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {actionBtn('✏️', () => { setEditingId(faq._id ?? null); setAdding(false) })}
                  {actionBtn('🗑', () => handleDelete(faq), true)}
                </div>
              </div>
            )}
          </div>
        ))}

        {adding && (
          <FaqForm initial={{ q: '', a: '', orden: faqs.length }}
            onSave={handleSave} onCancel={() => setAdding(false)} saving={saving} />
        )}

        {faqs.length === 0 && !adding && (
          <p style={{ fontSize: '13px', color: '#9CA3AF', textAlign: 'center', padding: '24px', background: '#F9FAFB', borderRadius: '12px', border: '1px dashed #E5E7EB' }}>
            Sin preguntas. Usa "🌱 Migrar datos" para cargar las FAQ iniciales.
          </p>
        )}
      </div>
    </div>
  )
}

/* ══ Página principal ════════════════════════════════════════ */
const TABS = [
  { id: 'secciones',    label: '🔲 Secciones' },
  { id: 'clientes',     label: '🏢 Clientes' },
  { id: 'testimonios',  label: '💬 Testimonios' },
  { id: 'faq',          label: '❓ FAQ' },
]

export default function ConfigAdmin() {
  const [tab,     setTab]     = useState<string>('secciones')
  const [seeding, setSeeding] = useState(false)

  async function handleSeed() {
    const ok = await confirmar({
      titulo:  'Migrar datos estáticos',
      mensaje: 'Esto migra blog, portafolio, precios, configuración, testimonios y FAQ a Firestore. Úsalo solo en la configuración inicial del sitio.',
      accion:  'Migrar todo',
      peligro: false,
    })
    if (!ok) return
    setSeeding(true)
    try {
      await seedArticulos()
      await seedPortafolio()
      await seedPrecios()
      await seedConfig()
      toast.ok('Datos migrados correctamente a Firestore')
    } catch (err) { toast.err('Error al migrar: ' + err) }
    setSeeding(false)
  }

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)', maxWidth: '860px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Configuración
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              Visibilidad de secciones · Clientes · Testimonios · FAQ
            </p>
          </div>
          <button
            onClick={handleSeed} disabled={seeding}
            style={{
              background: seeding ? '#E5E7EB' : `${Y}33`,
              color: seeding ? '#9CA3AF' : '#92400E',
              border: `1px solid ${seeding ? '#E5E7EB' : Y}`,
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
            <button
              key={t.id} onClick={() => setTab(t.id)}
              style={{
                padding: '9px 18px', borderRadius: '10px',
                fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer',
                background: tab === t.id ? P : '#F3F4F6',
                color: tab === t.id ? '#fff' : '#374151',
                transition: 'all 0.2s ease',
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'secciones'   && <TabSecciones />}
        {tab === 'clientes'    && <TabClientes />}
        {tab === 'testimonios' && <TabTestimonios />}
        {tab === 'faq'         && <TabFaq />}

      </div>
    </AdminLayout>
  )
}

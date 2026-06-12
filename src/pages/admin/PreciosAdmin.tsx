import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import {
  getPlanes, createPlan, updatePlan, deletePlan,
  getExtras, createExtra, updateExtra, deleteExtra,
  getCategorias, createCategoria, updateCategoria, deleteCategoria,
  seedPrecios,
} from '../../lib/db'
import { categoriasEstaticas, fmtPrecio } from '../../data/precios'
import type { Plan, Extra, ServicioCategoria } from '../../data/precios'
import { Y } from '../../tokens'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import { ADM } from '../../lib/adminTheme'

const { DIM, BDR, BDR2, MUT, WHT, INPUT_BG } = ADM
const P  = ADM.C1

/* ── helpers ────────────────────────────────────────────────── */
const emptyPlan = (tabId: string): Omit<Plan, '_id'> => ({
  tabId, nombre: '', precioNum: 0, periodo: '', destacado: false, items: [''], orden: 0,
})

const emptyExtra = (): Omit<Extra, '_id'> => ({
  emoji: '⭐', label: '', precioNum: 0, orden: 0,
})

/* ── PlanForm ───────────────────────────────────────────────── */
function PlanForm({
  initial, onSave, onCancel, saving,
}: {
  initial: Omit<Plan, '_id'>
  onSave: (data: Omit<Plan, '_id'>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<Omit<Plan, '_id'>>(initial)

  function setField<K extends keyof Omit<Plan, '_id'>>(k: K, v: Omit<Plan, '_id'>[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function setItem(i: number, val: string) {
    setForm(f => {
      const items = [...f.items]
      items[i] = val
      return { ...f, items }
    })
  }
  function addItem()      { setForm(f => ({ ...f, items: [...f.items, ''] })) }
  function removeItem(i: number) {
    setForm(f => ({ ...f, items: f.items.filter((_, idx) => idx !== i) }))
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: `1px solid ${BDR}`, fontSize: '13px', color: WHT,
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: WHT,
    display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px',
  }

  return (
    <div style={{ background: INPUT_BG, borderRadius: '12px', padding: '20px', border: `1px solid ${BDR}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={labelStyle}>Nombre del plan</label>
          <input
            value={form.nombre} onChange={e => setField('nombre', e.target.value)}
            placeholder="Ej: Básico" style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Precio (COP, sin puntos)</label>
          <input
            type="number" value={form.precioNum || ''}
            onChange={e => setField('precioNum', Number(e.target.value))}
            placeholder="Ej: 1580000" style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Periodo (opcional)</label>
          <input
            value={form.periodo ?? ''} onChange={e => setField('periodo', e.target.value)}
            placeholder="Ej: /mes  (dejar vacío si es pago único)" style={inputStyle}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '22px' }}>
          <input
            type="checkbox" id="destacado"
            checked={!!form.destacado}
            onChange={e => setField('destacado', e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: P, cursor: 'pointer' }}
          />
          <label htmlFor="destacado" style={{ fontSize: '13px', fontWeight: 600, color: WHT, cursor: 'pointer' }}>
            Marcar como "Más solicitado"
          </label>
        </div>
      </div>

      {/* Items */}
      <label style={labelStyle}>Características incluidas</label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
        {form.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ color: P, fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>✓</span>
            <input
              value={item} onChange={e => setItem(i, e.target.value)}
              placeholder={`Característica ${i + 1}`}
              style={{ ...inputStyle, flex: 1 }}
            />
            {form.items.length > 1 && (
              <button
                onClick={() => removeItem(i)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#EF4444', fontWeight: 700, fontSize: '16px', flexShrink: 0,
                  padding: '4px 6px', borderRadius: '6px',
                }}
                title="Eliminar"
              >×</button>
            )}
          </div>
        ))}
        <button
          onClick={addItem}
          style={{
            background: 'none', border: `1px dashed ${P}`, color: P,
            padding: '7px 12px', borderRadius: '8px', cursor: 'pointer',
            fontSize: '13px', fontWeight: 600, textAlign: 'left',
          }}
        >
          + Agregar característica
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.nombre || !form.precioNum}
          style={{
            background: saving ? BDR : P, color: saving ? MUT : '#fff',
            padding: '10px 22px', borderRadius: '10px',
            fontWeight: 700, fontSize: '13px', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Guardando…' : '💾 Guardar'}
        </button>
        <button
          onClick={onCancel}
          style={{
            background: INPUT_BG, color: WHT,
            padding: '10px 18px', borderRadius: '10px',
            fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

/* ── ExtraForm ──────────────────────────────────────────────── */
function ExtraForm({
  initial, onSave, onCancel, saving,
}: {
  initial: Omit<Extra, '_id'>
  onSave: (data: Omit<Extra, '_id'>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<Omit<Extra, '_id'>>(initial)

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: `1px solid ${BDR}`, fontSize: '13px', color: WHT,
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '12px', fontWeight: 700, color: WHT,
    display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px',
  }

  return (
    <div style={{ background: INPUT_BG, borderRadius: '12px', padding: '20px', border: `1px solid ${BDR}` }}>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={labelStyle}>Emoji</label>
          <input
            value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
            placeholder="⭐" style={{ ...inputStyle, textAlign: 'center', fontSize: '20px' }}
            maxLength={4}
          />
        </div>
        <div>
          <label style={labelStyle}>Nombre del extra</label>
          <input
            value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
            placeholder="Ej: Fotografía de producto" style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Precio (COP, sin puntos)</label>
          <input
            type="number" value={form.precioNum || ''}
            onChange={e => setForm(f => ({ ...f, precioNum: Number(e.target.value) }))}
            placeholder="Ej: 350000" style={inputStyle}
          />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={() => onSave(form)}
          disabled={saving || !form.label || !form.precioNum}
          style={{
            background: saving ? BDR : P, color: saving ? MUT : '#fff',
            padding: '10px 22px', borderRadius: '10px',
            fontWeight: 700, fontSize: '13px', border: 'none',
            cursor: saving ? 'not-allowed' : 'pointer',
          }}
        >
          {saving ? 'Guardando…' : '💾 Guardar'}
        </button>
        <button
          onClick={onCancel}
          style={{
            background: INPUT_BG, color: WHT,
            padding: '10px 18px', borderRadius: '10px',
            fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer',
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
const emptyCategoria = (): Omit<ServicioCategoria, '_id'> => ({
  id: '', label: '', emoji: '⭐', desc: '', orden: 0,
})

export default function PreciosAdmin() {
  const [planes,        setPlanes]        = useState<Plan[]>([])
  const [extras,        setExtras]        = useState<Extra[]>([])
  const [categorias,    setCategorias]    = useState<ServicioCategoria[]>([])
  const [loading,       setLoading]       = useState(true)

  // plan editing state
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [addingInTab,   setAddingInTab]   = useState<string | null>(null)
  const [savingPlan,    setSavingPlan]    = useState(false)

  // extra editing state
  const [editingExtraId, setEditingExtraId] = useState<string | null>(null)
  const [addingExtra,    setAddingExtra]    = useState(false)
  const [savingExtra,    setSavingExtra]    = useState(false)

  // categoria editing state
  const [editingCatId,  setEditingCatId]  = useState<string | null>(null)
  const [addingCat,     setAddingCat]     = useState(false)
  const [savingCat,     setSavingCat]     = useState(false)
  const [catForm,       setCatForm]       = useState<Omit<ServicioCategoria, '_id'>>(emptyCategoria())

  // seeding
  const [seeding, setSeeding] = useState(false)

  async function reload() {
    setLoading(true)
    const [p, e, c] = await Promise.all([getPlanes(), getExtras(), getCategorias()])
    setPlanes(p); setExtras(e); setCategorias(c)
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  /* ── Plan handlers ── */
  async function handleSavePlan(data: Omit<Plan, '_id'>) {
    setSavingPlan(true)
    try {
      if (editingPlanId) {
        await updatePlan(editingPlanId, data)
      } else {
        await createPlan({ ...data, orden: planes.filter(p => p.tabId === data.tabId).length })
      }
      setEditingPlanId(null); setAddingInTab(null)
      await reload()
    } catch (err) { toast.err('Error al guardar: ' + err) }
    setSavingPlan(false)
  }

  async function handleDeletePlan(plan: Plan) {
    if (!plan._id) return
    if (!(await confirmar(`¿Eliminar el plan "${plan.nombre}"?`))) return
    try {
      await deletePlan(plan._id)
      await reload()
    } catch (err) { toast.err('Error al eliminar: ' + err) }
  }

  /* ── Extra handlers ── */
  async function handleSaveExtra(data: Omit<Extra, '_id'>) {
    setSavingExtra(true)
    try {
      if (editingExtraId) {
        await updateExtra(editingExtraId, data)
      } else {
        await createExtra({ ...data, orden: extras.length })
      }
      setEditingExtraId(null); setAddingExtra(false)
      await reload()
    } catch (err) { toast.err('Error al guardar: ' + err) }
    setSavingExtra(false)
  }

  async function handleDeleteExtra(extra: Extra) {
    if (!extra._id) return
    if (!(await confirmar(`¿Eliminar el extra "${extra.label}"?`))) return
    try {
      await deleteExtra(extra._id)
      await reload()
    } catch (err) { toast.err('Error al eliminar: ' + err) }
  }

  /* ── Categoria handlers ── */
  async function handleSaveCat(data: Omit<ServicioCategoria, '_id'>) {
    setSavingCat(true)
    try {
      if (editingCatId) {
        await updateCategoria(editingCatId, data)
      } else {
        await createCategoria({ ...data, orden: categorias.length })
      }
      setEditingCatId(null); setAddingCat(false)
      await reload()
    } catch (err) { toast.err('Error al guardar: ' + err) }
    setSavingCat(false)
  }

  async function handleDeleteCat(cat: ServicioCategoria) {
    if (!cat._id) return
    if (!(await confirmar(`¿Eliminar la categoría "${cat.label}"? Los planes con tabId="${cat.id}" quedarán huérfanos.`))) return
    try {
      await deleteCategoria(cat._id)
      await reload()
    } catch (err) { toast.err('Error al eliminar: ' + err) }
  }

  /* ── Seed ── */
  async function handleSeed() {
    if (!(await confirmar('¿Migrar los precios estáticos a Firestore? Esto creará los registros iniciales.'))) return
    setSeeding(true)
    try {
      await seedPrecios()
      await reload()
      toast.ok('Precios migrados correctamente a Firestore')
    } catch (err) { toast.err('Error al migrar: ' + err) }
    setSeeding(false)
  }

  /* ── Detección de datos migrados ── */
  const isMigrated = planes.some(p => !!p._id) && extras.some(e => !!e._id)
  const catsMigrated = categorias.some(c => !!c._id)
  const catsList = catsMigrated ? categorias : categoriasEstaticas

  /* ── Render helpers ── */
  const cardStyle: React.CSSProperties = {
    background: DIM, borderRadius: '16px',
    border: `1px solid ${BDR}`, padding: '16px 20px',
    display: 'flex', alignItems: 'flex-start',
    justifyContent: 'space-between', gap: '16px',
  }

  const actionBtn = (label: string, onClick: () => void, danger = false, disabled = false): React.JSX.Element => (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        background: disabled ? INPUT_BG : danger ? 'rgba(239,68,68,0.08)' : `${P}15`,
        color: disabled ? BDR2 : danger ? '#EF4444' : P,
        border: `1px solid ${disabled ? BDR : danger ? 'rgba(239,68,68,0.2)' : `${P}30`}`,
        padding: '5px 12px', borderRadius: '8px',
        fontWeight: 600, fontSize: '12px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        whiteSpace: 'nowrap',
      }}
    >{label}</button>
  )

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)', maxWidth: '900px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: isMigrated ? '32px' : '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ fontSize: '26px', fontWeight: 900, color: WHT, marginBottom: '6px', letterSpacing: '-0.5px' }}>
              Precios & Servicios
            </h1>
            <p style={{ fontSize: '14px', color: MUT }}>
              Gestiona los planes de servicio y los extras de la calculadora.
            </p>
          </div>
          <button
            onClick={handleSeed}
            disabled={seeding}
            style={{
              background: seeding ? BDR : isMigrated ? `${Y}33` : Y,
              color: seeding ? MUT : ADM.AMB,
              border: `1px solid ${seeding ? BDR : Y}`,
              padding: '10px 18px', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px', cursor: seeding ? 'not-allowed' : 'pointer',
            }}
          >
            {seeding ? 'Migrando…' : '🌱 Migrar datos a Firestore'}
          </button>
        </div>

        {/* Banner migración */}
        {!loading && !isMigrated && (
          <div style={{
            background: '#FEF9C3', border: '1px solid rgba(250,204,21,0.45)',
            borderRadius: '14px', padding: '16px 20px', marginBottom: '28px',
            display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <span style={{ fontSize: '22px', flexShrink: 0 }}>⚠️</span>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: ADM.AMB, marginBottom: '4px' }}>
                Estás viendo datos de ejemplo — no se pueden editar aún
              </p>
              <p style={{ fontSize: '13px', color: '#B45309', lineHeight: 1.5 }}>
                Haz clic en <strong>"🌱 Migrar datos a Firestore"</strong> para guardar los precios en la base de datos. Después podrás editarlos, agregarlos y eliminarlos libremente.
              </p>
            </div>
          </div>
        )}


        {loading && (
          <ListSkeleton rows={4} />
        )}

        {!loading && (
          <>
            {/* ── Planes por categoría ── */}
            {catsList.map(cat => {
              const catPlanes = planes.filter(p => p.tabId === cat.id)
              return (
                <section key={cat.id} style={{ marginBottom: '40px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: WHT, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{cat.emoji}</span> {cat.label}
                    </h2>
                    {!addingInTab && isMigrated && (
                      <button
                        onClick={() => { setAddingInTab(cat.id); setEditingPlanId(null) }}
                        style={{
                          background: P, color: '#fff',
                          padding: '8px 16px', borderRadius: '10px',
                          fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer',
                        }}
                      >
                        + Nuevo plan
                      </button>
                    )}
                  </div>

                  {/* Existing plans */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {catPlanes.map(plan => (
                      <div key={plan._id ?? plan.nombre}>
                        {plan._id && editingPlanId === plan._id ? (
                          <PlanForm
                            initial={{ tabId: plan.tabId, nombre: plan.nombre, precioNum: plan.precioNum, periodo: plan.periodo ?? '', destacado: plan.destacado ?? false, items: [...plan.items] }}
                            onSave={handleSavePlan}
                            onCancel={() => setEditingPlanId(null)}
                            saving={savingPlan}
                          />
                        ) : (
                          <div style={{ ...cardStyle, opacity: plan._id ? 1 : 0.65 }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '15px', fontWeight: 800, color: WHT }}>{plan.nombre}</span>
                                <span style={{ fontSize: '16px', fontWeight: 900, color: P }}>{fmtPrecio(plan.precioNum)}{plan.periodo}</span>
                                {plan.destacado && (
                                  <span style={{ background: Y, color: WHT, fontSize: '12px', fontWeight: 800, padding: '2px 10px', borderRadius: '20px' }}>
                                    MÁS SOLICITADO
                                  </span>
                                )}
                              </div>
                              <p style={{ fontSize: '12px', color: MUT, margin: 0 }}>
                                {plan.items.slice(0, 3).join(' · ')}{plan.items.length > 3 ? ` · +${plan.items.length - 3} más` : ''}
                              </p>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                              {actionBtn('✏️ Editar',   () => { setEditingPlanId(plan._id!); setAddingInTab(null) }, false, !plan._id)}
                              {actionBtn('🗑 Eliminar', () => handleDeletePlan(plan), true, !plan._id)}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* New plan form */}
                    {addingInTab === cat.id && (
                      <PlanForm
                        initial={emptyPlan(cat.id)}
                        onSave={handleSavePlan}
                        onCancel={() => setAddingInTab(null)}
                        saving={savingPlan}
                      />
                    )}

                    {catPlanes.length === 0 && addingInTab !== cat.id && (
                      <p style={{ fontSize: '13px', color: MUT, textAlign: 'center', padding: '24px', background: INPUT_BG, borderRadius: '12px', border: `1px dashed ${BDR}` }}>
                        Sin planes todavía. Haz clic en "+ Nuevo plan" o en "🌱 Migrar datos a Firestore" para empezar.
                      </p>
                    )}
                  </div>
                </section>
              )
            })}

            {/* ── Extras ── */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: WHT, marginBottom: '2px' }}>
                    ➕ Extras de la Calculadora
                  </h2>
                  <p style={{ fontSize: '13px', color: MUT, margin: 0 }}>
                    Servicios adicionales que el cliente puede sumar al presupuesto.
                  </p>
                </div>
                {!addingExtra && isMigrated && (
                  <button
                    onClick={() => { setAddingExtra(true); setEditingExtraId(null) }}
                    style={{
                      background: P, color: '#fff',
                      padding: '8px 16px', borderRadius: '10px',
                      fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer',
                    }}
                  >
                    + Nuevo extra
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {extras.map(extra => (
                  <div key={extra._id ?? extra.label}>
                    {extra._id && editingExtraId === extra._id ? (
                      <ExtraForm
                        initial={{ emoji: extra.emoji, label: extra.label, precioNum: extra.precioNum }}
                        onSave={handleSaveExtra}
                        onCancel={() => setEditingExtraId(null)}
                        saving={savingExtra}
                      />
                    ) : (
                      <div style={{ ...cardStyle, opacity: extra._id ? 1 : 0.65 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <span style={{ fontSize: '22px' }}>{extra.emoji}</span>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: WHT }}>{extra.label}</span>
                            <span style={{ marginLeft: '12px', fontSize: '14px', fontWeight: 800, color: P }}>{fmtPrecio(extra.precioNum)}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {actionBtn('✏️ Editar',   () => { setEditingExtraId(extra._id!); setAddingExtra(false) }, false, !extra._id)}
                          {actionBtn('🗑 Eliminar', () => handleDeleteExtra(extra), true, !extra._id)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingExtra && (
                  <ExtraForm
                    initial={emptyExtra()}
                    onSave={handleSaveExtra}
                    onCancel={() => setAddingExtra(false)}
                    saving={savingExtra}
                  />
                )}

                {extras.length === 0 && !addingExtra && (
                  <p style={{ fontSize: '13px', color: MUT, textAlign: 'center', padding: '24px', background: INPUT_BG, borderRadius: '12px', border: `1px dashed ${BDR}` }}>
                    Sin extras todavía. Haz clic en "+ Nuevo extra" o migra los datos a Firestore.
                  </p>
                )}
              </div>
            </section>

            {/* ── Categorías de servicios ── */}
            <section style={{ marginTop: '48px', borderTop: `2px solid ${BDR}`, paddingTop: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: WHT, marginBottom: '2px' }}>
                    🗂 Categorías de Servicios
                  </h2>
                  <p style={{ fontSize: '13px', color: MUT, margin: 0 }}>
                    Los tabs de ServiciosTabs y la Calculadora. El <code>id</code> debe coincidir con el <code>tabId</code> de cada plan.
                  </p>
                </div>
                {catsMigrated && !addingCat && (
                  <button
                    onClick={() => { setAddingCat(true); setEditingCatId(null); setCatForm(emptyCategoria()) }}
                    style={{ background: P, color: '#fff', padding: '8px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}
                  >
                    + Nueva categoría
                  </button>
                )}
              </div>

              {!catsMigrated && (
                <p style={{ fontSize: '13px', color: '#B45309', background: '#FEF9C3', border: '1px solid rgba(250,204,21,0.45)', borderRadius: '10px', padding: '12px 16px', marginBottom: '14px' }}>
                  ⚠️ Migra los datos a Firestore para editar las categorías.
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {catsList.map(cat => (
                  <div key={cat._id ?? cat.id}>
                    {cat._id && editingCatId === cat._id ? (
                      <div style={{ background: INPUT_BG, borderRadius: '12px', padding: '20px', border: `1px solid ${BDR}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          {([['emoji','Emoji', 'Ej: 💻'], ['id','ID (interno)', 'ej: web'], ['label','Nombre visible', 'ej: Desarrollo Web'], ['desc','Descripción corta', 'ej: Landing, corporativo...']] as [keyof Omit<ServicioCategoria,'_id'>, string, string][]).map(([k, lbl, ph]) => (
                            <div key={k}>
                              <label style={{ fontSize: '12px', fontWeight: 700, color: WHT, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</label>
                              <input
                                value={String(catForm[k] ?? '')}
                                onChange={e => setCatForm(f => ({ ...f, [k]: e.target.value }))}
                                placeholder={ph}
                                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${BDR}`, fontSize: '13px', color: WHT, outline: 'none', boxSizing: 'border-box' }}
                              />
                            </div>
                          ))}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => handleSaveCat(catForm)} disabled={savingCat} style={{ background: P, color: '#fff', padding: '9px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                            {savingCat ? 'Guardando…' : '💾 Guardar'}
                          </button>
                          <button onClick={() => setEditingCatId(null)} style={{ background: INPUT_BG, color: MUT, padding: '9px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ ...cardStyle, opacity: cat._id ? 1 : 0.65 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                          <span style={{ fontSize: '24px' }}>{cat.emoji}</span>
                          <div>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: WHT }}>{cat.label}</span>
                            <span style={{ marginLeft: '10px', fontSize: '12px', color: MUT, background: INPUT_BG, padding: '2px 8px', borderRadius: '6px' }}>id: {cat.id}</span>
                            <p style={{ fontSize: '12px', color: MUT, margin: '2px 0 0' }}>{cat.desc}</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                          {actionBtn('✏️ Editar', () => { setEditingCatId(cat._id!); setCatForm({ id: cat.id, label: cat.label, emoji: cat.emoji, desc: cat.desc, orden: cat.orden ?? 0 }) }, false, !cat._id)}
                          {actionBtn('🗑 Eliminar', () => handleDeleteCat(cat), true, !cat._id)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingCat && (
                  <div style={{ background: INPUT_BG, borderRadius: '12px', padding: '20px', border: `1px solid ${BDR}` }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      {([['emoji','Emoji', 'Ej: 💻'], ['id','ID (interno)', 'ej: web'], ['label','Nombre visible', 'ej: Desarrollo Web'], ['desc','Descripción corta', 'ej: Landing, corporativo...']] as [keyof Omit<ServicioCategoria,'_id'>, string, string][]).map(([k, lbl, ph]) => (
                        <div key={k}>
                          <label style={{ fontSize: '12px', fontWeight: 700, color: WHT, display: 'block', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{lbl}</label>
                          <input
                            value={String(catForm[k] ?? '')}
                            onChange={e => setCatForm(f => ({ ...f, [k]: e.target.value }))}
                            placeholder={ph}
                            style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: `1px solid ${BDR}`, fontSize: '13px', color: WHT, outline: 'none', boxSizing: 'border-box' }}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleSaveCat(catForm)} disabled={savingCat} style={{ background: P, color: '#fff', padding: '9px 20px', borderRadius: '8px', fontWeight: 700, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                        {savingCat ? 'Guardando…' : '💾 Guardar categoría'}
                      </button>
                      <button onClick={() => setAddingCat(false)} style={{ background: INPUT_BG, color: MUT, padding: '9px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', border: 'none', cursor: 'pointer' }}>
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </AdminLayout>
  )
}

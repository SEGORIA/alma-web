import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  getBriefs, updateBriefEstado, deleteBrief, updateBrief,
  getBriefFormConfig, saveBriefFormConfig,
} from '../../lib/db'
import type { Brief, BriefFormConfig, BriefFieldDef, BriefSectionDef } from '../../data/briefs'
import { BRIEF_ESTADOS, DEFAULT_BRIEF_CONFIG } from '../../data/briefs'
import { confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import { ADM } from '../../lib/adminTheme'

const { BK, DIM, BDR, BDR2, MUT, WHT, C1, ACC2, AMB, TEAL, GRN, BLUE, GHOST } = ADM

/* ── Paleta oscura ─────────────────────────────────────────── */

/* ── helpers ───────────────────────────────────────────────── */
function fmtDate(ts: unknown): string {
  if (!ts) return '—'
  try {
    const d = (ts as { toDate?: () => Date }).toDate?.()
    if (d) return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
    return new Date(ts as string).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })
  } catch { return '—' }
}

function truncate(s: string | undefined, max = 60): string {
  if (!s || s === '—') return '—'
  return s.length > max ? s.slice(0, max) + '…' : s
}

const TYPE_LABELS: Record<string, string> = {
  text: 'Texto', email: 'Email', tel: 'Teléfono', date: 'Fecha',
  textarea: 'Área texto', select: 'Selección', pills: 'Píldoras',
  'color-pills': 'Colores', file: 'Archivos',
}

/* ── EstadoBadge ───────────────────────────────────────────── */
function EstadoBadge({ estado, onChange }: {
  estado: Brief['estado']
  onChange: (e: Brief['estado']) => void
}) {
  const [open, setOpen] = useState(false)
  const current = BRIEF_ESTADOS.find(e => e.value === estado) ?? BRIEF_ESTADOS[0]
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: current.bg, color: current.color,
        border: `1.5px solid ${current.color}30`,
        borderRadius: '20px', padding: '4px 12px',
        fontSize: '11px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
      }}>
        {current.label} ▾
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 10 }} />
          <div style={{
            position: 'absolute', top: '110%', left: 0, zIndex: 20,
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.12)', overflow: 'hidden', minWidth: '130px',
          }}>
            {BRIEF_ESTADOS.map(e => (
              <button key={e.value} onClick={() => { onChange(e.value); setOpen(false) }} style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 14px', fontSize: '12px', fontWeight: 700,
                color: e.color, background: estado === e.value ? e.bg : 'transparent',
                border: 'none', cursor: 'pointer',
              }}>
                {e.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ── Toggle switch ──────────────────────────────────────────── */
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      style={{
        width: '36px', height: '20px', borderRadius: '10px',
        background: on ? '#6B21A8' : '#D1D5DB',
        border: 'none', cursor: 'pointer', position: 'relative',
        transition: 'background 0.2s', flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px',
        left: on ? '18px' : '3px',
        width: '14px', height: '14px', borderRadius: '50%',
        background: '#fff', transition: 'left 0.2s',
      }} />
    </button>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  if (!value || value === '—') return null
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: '13px', color: '#374151', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{value}</p>
    </div>
  )
}

/* ── BriefModal ─────────────────────────────────────────────── */
function BriefModal({ brief, onClose, onEstado, onUpdate }: {
  brief: Brief
  onClose: () => void
  onEstado: (e: Brief['estado']) => void
  onUpdate: (updated: Brief) => void
}) {
  const isMobile = useIsMobile()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState<Brief>({ ...brief })
  const [saving, setSaving]   = useState(false)

  // Sync draft when brief prop changes (e.g. estado update from outside), pero solo
  // fuera del modo edición: el borrador es estado local que el usuario está tocando,
  // no se puede derivar del prop en render sin pisar lo que lleva escrito.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!editing) setDraft({ ...brief }) }, [brief, editing])

  const EDIT_FIELDS: { key: keyof Brief; label: string; multi?: boolean }[] = [
    { key: 'nombre',                  label: 'Nombre completo' },
    { key: 'email_direccion',         label: 'Correo electrónico' },
    { key: 'email',                   label: 'Correo empresa' },
    { key: 'telefono',                label: 'Teléfono' },
    { key: 'documento',               label: 'Documento' },
    { key: 'marca',                   label: 'Marca' },
    { key: 'nacimiento_marca',        label: 'Nacimiento marca' },
    { key: 'tiene_logo',              label: 'Logo' },
    { key: 'slogan',                  label: 'Slogan' },
    { key: 'presencia_redes',         label: 'Presencia en redes',         multi: true },
    { key: 'credenciales_redes',      label: 'Credenciales redes',         multi: true },
    { key: 'credenciales_plataformas',label: 'Credenciales plataformas',   multi: true },
    { key: 'personalidad',            label: 'Personalidad' },
    { key: 'valores_marca',           label: 'Valores',                    multi: true },
    { key: 'colores_marca',           label: 'Colores' },
    { key: 'clientes_potenciales',    label: 'Clientes potenciales',       multi: true },
    { key: 'problema_resuelve',       label: 'Problema que resuelve',      multi: true },
    { key: 'propuesta_valor',         label: 'Propuesta de valor',         multi: true },
    { key: 'beneficios',              label: 'Beneficios',                 multi: true },
    { key: 'experiencia_emocional',   label: 'Experiencia emocional',      multi: true },
    { key: 'emociones',               label: 'Emociones' },
    { key: 'competidores',            label: 'Competidores',               multi: true },
    { key: 'referencias',             label: 'Referencias',                multi: true },
    { key: 'fecha_inicio',            label: 'Fecha inicio' },
    { key: 'archivos',                label: 'Archivos adjuntos',          multi: true },
    { key: 'link_archivos',           label: 'Link archivos' },
    { key: 'notas_adicionales',       label: 'Notas del cliente',          multi: true },
  ]

  async function handleSave() {
    setSaving(true)
    await updateBrief(brief._id!, draft)
    onUpdate(draft)
    setEditing(false)
    setSaving(false)
  }

  const inp: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    padding: '8px 10px', borderRadius: '8px',
    border: '1px solid #E5E7EB', background: '#F9FAFB',
    fontSize: '13px', color: '#374151',
    fontFamily: 'inherit', outline: 'none',
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201, background: '#fff', borderRadius: '20px',
        width: isMobile ? '96vw' : '740px',
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0369A1, #0EA5E9, #38BDF8)', borderRadius: '20px 20px 0 0', padding: '24px 28px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>📋 {draft.marca}</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: '0 0 12px' }}>{draft.nombre} · {draft.email_direccion}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <EstadoBadge estado={draft.estado} onChange={onEstado} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{fmtDate(brief.createdAt)}</span>
            {draft.telefono && draft.telefono !== '—' && (
              <a href={`https://wa.me/${draft.telefono.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
                💬 WhatsApp
              </a>
            )}
            <a href={`mailto:${draft.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
              ✉️ Email
            </a>
            {!editing ? (
              <button onClick={() => setEditing(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                ✏️ Editar
              </button>
            ) : (
              <>
                <button onClick={handleSave} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#22C55E', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  {saving ? '…' : '💾 Guardar'}
                </button>
                <button onClick={() => { setEditing(false); setDraft({ ...brief }) }} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                  ✕ Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>

          {/* ── Notas admin (siempre visible) ── */}
          <div style={{ marginBottom: '24px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '12px', padding: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>📝 Notas internas (solo admin)</p>
            <textarea
              value={draft.notas_admin ?? ''}
              onChange={e => setDraft(p => ({ ...p, notas_admin: e.target.value }))}
              onBlur={async () => {
                if (draft.notas_admin !== brief.notas_admin) {
                  await updateBrief(brief._id!, { notas_admin: draft.notas_admin })
                  onUpdate({ ...brief, notas_admin: draft.notas_admin })
                }
              }}
              placeholder="Apuntes del equipo, seguimiento, llamadas, observaciones…"
              style={{ ...inp, minHeight: '72px', resize: 'vertical', background: '#fff' }}
            />
            <p style={{ fontSize: '10px', color: '#B45309', margin: '4px 0 0', fontStyle: 'italic' }}>Se guarda automáticamente al salir del campo.</p>
          </div>

          {editing ? (
            /* ── Modo edición ── */
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              {EDIT_FIELDS.map(f => (
                <div key={f.key}>
                  <p style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 5px' }}>{f.label}</p>
                  {f.multi ? (
                    <textarea
                      value={(draft[f.key] as string) ?? ''}
                      onChange={e => setDraft(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ ...inp, minHeight: '80px', resize: 'vertical' }}
                    />
                  ) : (
                    <input
                      type="text"
                      value={(draft[f.key] as string) ?? ''}
                      onChange={e => setDraft(p => ({ ...p, [f.key]: e.target.value }))}
                      style={inp}
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* ── Modo visualización ── */
            <>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Datos personales</h3>
                  <Row label="Nombre"        value={brief.nombre} />
                  <Row label="Email"         value={brief.email_direccion} />
                  <Row label="Email empresa" value={brief.email} />
                  <Row label="Teléfono"      value={brief.telefono} />
                  <Row label="Documento"     value={brief.documento} />
                </div>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Marca</h3>
                  <Row label="Marca"        value={brief.marca} />
                  <Row label="Nacimiento"   value={brief.nacimiento_marca} />
                  <Row label="Logo"         value={brief.tiene_logo} />
                  <Row label="Slogan"       value={brief.slogan} />
                  <Row label="Fecha inicio" value={brief.fecha_inicio} />
                </div>
              </div>

              <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>ADN de Marca</h3>
                  <Row label="Personalidad" value={brief.personalidad} />
                  <Row label="Valores"      value={brief.valores_marca} />
                  <Row label="Colores"      value={brief.colores_marca} />
                </div>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Propuesta de Valor</h3>
                  <Row label="Clientes potenciales" value={brief.clientes_potenciales} />
                  <Row label="Problema"             value={brief.problema_resuelve} />
                  <Row label="Propuesta"            value={brief.propuesta_valor} />
                  <Row label="Beneficios"           value={brief.beneficios} />
                </div>
              </div>

              <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Emocional</h3>
                  <Row label="Experiencia emocional" value={brief.experiencia_emocional} />
                  <Row label="Emociones"             value={brief.emociones} />
                </div>
                <div>
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Competencia</h3>
                  <Row label="Competidores" value={brief.competidores} />
                  <Row label="Referencias"  value={brief.referencias} />
                </div>
              </div>

              {(brief.presencia_redes || brief.credenciales_redes || brief.credenciales_plataformas) && (
                <>
                  <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Presencia Digital y Accesos</h3>
                  <Row label="Presencia en redes"       value={brief.presencia_redes} />
                  <Row label="Credenciales redes"       value={brief.credenciales_redes} />
                  <Row label="Credenciales plataformas" value={brief.credenciales_plataformas} />
                </>
              )}

              {(brief.archivos || brief.link_archivos || brief.notas_adicionales) && (
                <>
                  <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Archivos y Cierre</h3>
                  <Row label="Archivos"          value={brief.archivos} />
                  <Row label="Link archivos"     value={brief.link_archivos} />
                  <Row label="Notas adicionales" value={brief.notas_adicionales} />
                </>
              )}

              {/* Custom fields */}
              {brief.custom_fields && Object.keys(brief.custom_fields).length > 0 && (
                <>
                  <div style={{ height: '1px', background: '#F3F4F6', margin: '20px 0' }} />
                  <h3 style={{ fontSize: '11px', fontWeight: 800, color: '#6B21A8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px', borderBottom: '2px solid #F5F3FF', paddingBottom: '6px' }}>Preguntas personalizadas</h3>
                  {Object.entries(brief.custom_fields).map(([k, v]) => (
                    <Row key={k} label={k.replace(/_/g, ' ')} value={v} />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

/* ── FormBuilder ────────────────────────────────────────────── */
function FormBuilder() {
  const isMobile = useIsMobile()
  const [config, setConfig]           = useState<BriefFormConfig>(DEFAULT_BRIEF_CONFIG)
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [saved, setSaved]             = useState(false)
  const [expandedSec, setExpandedSec] = useState<string | null>('s1')
  const [newField, setNewField]       = useState<{ sectionKey: string; label: string; type: 'text' | 'textarea'; required: boolean } | null>(null)

  useEffect(() => {
    getBriefFormConfig().then(c => { setConfig(c); setLoading(false) })
  }, [])

  function updateSection(key: string, patch: Partial<BriefSectionDef>) {
    setConfig(prev => ({
      ...prev,
      sections: prev.sections.map(s => s.key === key ? { ...s, ...patch } : s),
    }))
  }

  function updateField(fieldKey: string, patch: Partial<BriefFieldDef>) {
    setConfig(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.key === fieldKey ? { ...f, ...patch } : f),
    }))
  }

  function deleteCustomField(fieldKey: string) {
    setConfig(prev => ({ ...prev, fields: prev.fields.filter(f => f.key !== fieldKey) }))
  }

  function addCustomField() {
    if (!newField || !newField.label.trim()) return
    const key = `_custom_${newField.sectionKey}_${Date.now()}`
    const field: BriefFieldDef = {
      key,
      label:      newField.label.trim(),
      sectionKey: newField.sectionKey,
      type:       newField.type,
      active:     true,
      custom:     true,
      required:   newField.required,
    }
    setConfig(prev => ({ ...prev, fields: [...prev.fields, field] }))
    setNewField(null)
  }

  async function handleSave() {
    setSaving(true)
    await saveBriefFormConfig(config)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>Cargando configuración…</div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#111827', margin: '0 0 4px' }}>⚙️ Constructor de formulario</h2>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Activa/desactiva secciones y preguntas, renombra etiquetas, agrega campos personalizados.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <a href="/brief" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#F3F4F6', color: '#374151', padding: '10px 18px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
            🌐 Ver formulario
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: saved ? '#22C55E' : '#6B21A8', color: '#fff',
              padding: '10px 20px', borderRadius: '10px',
              fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {saving ? '…' : saved ? '✓ Guardado' : '💾 Guardar cambios'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '12px', padding: '14px 18px', marginBottom: '24px', fontSize: '13px', color: '#1E40AF' }}>
        ℹ️ Los cambios se aplican en el formulario público en tiempo real al guardar. Las preguntas desactivadas no aparecerán para los clientes.
      </div>

      {/* Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {config.sections.map(section => {
          const sectionFields = config.fields.filter(f => f.sectionKey === section.key)
          const activeCount   = sectionFields.filter(f => f.active).length
          const isExpanded    = expandedSec === section.key

          return (
            <div key={section.key} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              {/* Section header */}
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', cursor: 'pointer', background: isExpanded ? '#FAFAFA' : '#fff' }}
                onClick={() => setExpandedSec(isExpanded ? null : section.key)}
              >
                <Toggle on={section.active} onChange={v => { updateSection(section.key, { active: v }); }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: section.active ? '#111827' : '#9CA3AF', textDecoration: section.active ? 'none' : 'line-through' }}>
                    {section.num} — {section.title}
                  </p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9CA3AF' }}>
                    {activeCount}/{sectionFields.length} preguntas activas
                  </p>
                </div>
                <span style={{ fontSize: '14px', color: '#9CA3AF', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }}>›</span>
              </div>

              {/* Fields */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #F3F4F6', padding: '12px 20px 16px' }}>
                  {sectionFields.length === 0 ? (
                    <p style={{ fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic', margin: '8px 0' }}>Sin preguntas en esta sección.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      {sectionFields.map(field => (
                        <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: '#F9FAFB', borderRadius: '10px', border: '1px solid #F3F4F6' }}>
                          <Toggle on={field.active} onChange={v => updateField(field.key, { active: v })} />
                          <input
                            type="text"
                            value={field.label}
                            onChange={e => updateField(field.key, { label: e.target.value })}
                            style={{
                              flex: 1, padding: '6px 10px', borderRadius: '6px',
                              border: '1px solid #E5E7EB', background: '#fff',
                              fontSize: '13px', color: '#374151', outline: 'none', fontFamily: 'inherit',
                              opacity: field.active ? 1 : 0.5,
                            }}
                          />
                          <span style={{ fontSize: '10px', color: '#9CA3AF', background: '#F3F4F6', padding: '3px 8px', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {TYPE_LABELS[field.type] ?? field.type}
                          </span>
                          <button
                            onClick={() => updateField(field.key, { required: !field.required })}
                            title={field.required ? 'Quitar obligatorio' : 'Marcar como obligatorio'}
                            style={{
                              flexShrink: 0,
                              padding: '3px 8px', borderRadius: '5px', cursor: 'pointer',
                              fontSize: '10px', fontWeight: 700, border: 'none',
                              background: field.required ? '#FEE2E2' : '#F3F4F6',
                              color: field.required ? '#EF4444' : '#9CA3AF',
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = field.required ? '#FECACA' : '#E5E7EB'
                              e.currentTarget.style.color = field.required ? '#DC2626' : '#6B7280'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = field.required ? '#FEE2E2' : '#F3F4F6'
                              e.currentTarget.style.color = field.required ? '#EF4444' : '#9CA3AF'
                            }}
                          >
                            {field.required ? 'REQ ✓' : 'REQ'}
                          </button>
                          {field.custom && (
                            <button
                              onClick={() => deleteCustomField(field.key)}
                              title="Eliminar campo personalizado"
                              style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: '16px', padding: '2px 4px', borderRadius: '4px', flexShrink: 0 }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add custom field */}
                  {newField?.sectionKey === section.key ? (
                    <div style={{ background: '#F9FAFB', border: '1.5px solid #6B21A8', borderRadius: '10px', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
                        <input
                          autoFocus
                          type="text"
                          placeholder="Escribe la pregunta…"
                          value={newField.label}
                          onChange={e => setNewField(p => p ? { ...p, label: e.target.value } : null)}
                          onKeyDown={e => { if (e.key === 'Enter') addCustomField(); if (e.key === 'Escape') setNewField(null) }}
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', fontFamily: 'inherit', background: '#fff' }}
                        />
                        <select
                          value={newField.type}
                          onChange={e => setNewField(p => p ? { ...p, type: e.target.value as 'text' | 'textarea' } : null)}
                          style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px', background: '#fff', cursor: 'pointer', flexShrink: 0 }}
                        >
                          <option value="text">Texto corto</option>
                          <option value="textarea">Texto largo</option>
                          <option value="email">Email</option>
                          <option value="tel">Teléfono</option>
                        </select>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Toggle obligatorio */}
                        <button
                          onClick={() => setNewField(p => p ? { ...p, required: !p.required } : null)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '6px 12px', borderRadius: '7px', cursor: 'pointer',
                            fontSize: '12px', fontWeight: 700, border: 'none',
                            background: newField.required ? '#FEE2E2' : '#F3F4F6',
                            color: newField.required ? '#DC2626' : '#6B7280',
                            transition: 'all 0.15s',
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{newField.required ? '🔴' : '⚪'}</span>
                          {newField.required ? 'Obligatorio' : 'Opcional'}
                        </button>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={addCustomField} disabled={!newField.label.trim()} style={{ background: newField.label.trim() ? '#6B21A8' : '#E5E7EB', color: newField.label.trim() ? '#fff' : '#9CA3AF', border: 'none', borderRadius: '8px', padding: '8px 18px', fontSize: '12px', fontWeight: 700, cursor: newField.label.trim() ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>
                            ＋ Agregar
                          </button>
                          <button onClick={() => setNewField(null)} style={{ background: '#F3F4F6', color: '#6B7280', border: 'none', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setNewField({ sectionKey: section.key, label: '', type: 'text', required: false })}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: '1.5px dashed #D1D5DB', borderRadius: '8px', padding: '7px 14px', fontSize: '12px', color: '#6B7280', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#6B21A8'; e.currentTarget.style.color = '#6B21A8' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#D1D5DB'; e.currentTarget.style.color = '#6B7280' }}
                    >
                      ＋ Agregar pregunta personalizada
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main page ──────────────────────────────────────────────── */
export default function BriefAdmin() {
  const isMobile = useIsMobile()
  const [tab, setTab]           = useState<'inbox' | 'formulario'>('inbox')
  const [briefs, setBriefs]     = useState<Brief[]>([])
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Brief | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [filter, setFilter]     = useState<Brief['estado'] | 'todos'>('todos')

  useEffect(() => {
    getBriefs().then(data => { setBriefs(data); setLoading(false) })
  }, [])

  async function handleEstado(id: string, estado: Brief['estado']) {
    await updateBriefEstado(id, estado)
    setBriefs(prev => prev.map(b => b._id === id ? { ...b, estado } : b))
    if (selected?._id === id) setSelected(prev => prev ? { ...prev, estado } : null)
  }

  async function handleDelete(id: string) {
    if (!(await confirmar('¿Eliminar este briefing? Esta acción no se puede deshacer.'))) return
    setDeleting(id)
    await deleteBrief(id)
    setBriefs(prev => prev.filter(b => b._id !== id))
    if (selected?._id === id) setSelected(null)
    setDeleting(null)
  }

  function handleBriefUpdate(updated: Brief) {
    setBriefs(prev => prev.map(b => b._id === updated._id ? updated : b))
    setSelected(updated)
  }

  const displayed = filter === 'todos' ? briefs : briefs.filter(b => b.estado === filter)
  const counts    = BRIEF_ESTADOS.reduce((acc, e) => {
    acc[e.value] = briefs.filter(b => b.estado === e.value).length
    return acc
  }, {} as Record<string, number>)

  // Stats extra
  const thisWeek = briefs.filter(b => {
    try {
      const d = (b.createdAt as { toDate?: () => Date }).toDate?.() ?? new Date(b.createdAt as string)
      // Contador cosmético "de esta semana": unos ms de desfase entre renders
      // no cambian nada visible.
      // eslint-disable-next-line react-hooks/purity
      return (Date.now() - d.getTime()) < 7 * 24 * 3600 * 1000
    } catch { return false }
  }).length

  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh', padding: isMobile ? '20px 16px' : '32px 36px' }}>

        {/* ── Header premium ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: `0.5px solid ${BDR}`, marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>Brief</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {thisWeek > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: `${GRN}15`, border: `0.5px solid ${GRN}40`, color: GRN, borderRadius: '4px', padding: '5px 10px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em' }}>
                🆕 {thisWeek} esta semana
              </span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: GRN, background: `${GRN}10`, border: `0.5px solid ${GRN}30`, padding: '5px 10px', borderRadius: '4px', fontWeight: 700 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: GRN, display: 'inline-block', boxShadow: `0 0 0 2px ${GRN}30` }} />
              Formulario activo
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', background: DIM, border: `0.5px solid ${BDR2}`, borderRadius: '4px', padding: '7px 12px' }}>
              <span style={{ fontSize: '10px', color: MUT }}>🔗</span>
              <code style={{ fontSize: '11px', color: TEAL, fontWeight: 600, userSelect: 'all' }}>{window.location.origin}/brief</code>
            </div>
            <a href="/brief" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg,${C1},${ACC2})`, color: '#fff', padding: '9px 18px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              🌐 Abrir formulario
            </a>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', borderBottom: `0.5px solid ${BDR}`, marginBottom: '28px', gap: '0', overflowX: 'auto' }}>
          {([
            { key: 'inbox',      label: '📥 Inbox',       count: briefs.length },
            { key: 'formulario', label: '⚙️ Formulario' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: '11px 20px', border: 'none', background: 'none', cursor: 'pointer',
              fontSize: '11px', fontWeight: tab === t.key ? 700 : 500,
              color: tab === t.key ? ACC2 : MUT,
              borderBottom: tab === t.key ? `1.5px solid ${ACC2}` : '1.5px solid transparent',
              whiteSpace: 'nowrap', letterSpacing: '0.05em', marginBottom: '-0.5px',
              display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'color 0.15s',
            }}>
              {t.label}
              {'count' in t && t.count > 0 && (
                <span style={{ background: ACC2, color: '#fff', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '10px' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ══ TAB: INBOX ══════════════════════════════════════════ */}
        {tab === 'inbox' && (
          <>
            {/* Stats por estado */}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? 2 : 4}, 1fr)`, gap: '12px', marginBottom: '24px' }}>
              {BRIEF_ESTADOS.map(e => (
                <button
                  key={e.value}
                  onClick={() => setFilter(f => f === e.value ? 'todos' : e.value)}
                  style={{
                    background: filter === e.value ? `${e.color}18` : DIM,
                    borderRadius: '6px', padding: '18px 18px 14px',
                    border: `0.5px solid ${filter === e.value ? e.color : BDR}`,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    position: 'relative', overflow: 'hidden',
                  }}
                >
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>{e.label}</p>
                  <p style={{ fontSize: '28px', fontWeight: 300, color: e.color, margin: '0 0 2px', lineHeight: 1 }}>{counts[e.value] ?? 0}</p>
                  <span style={{ position: 'absolute', bottom: 0, right: '8px', fontSize: '42px', color: GHOST, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>◈</span>
                </button>
              ))}
            </div>

            {/* Lista */}
            {loading ? (
              <ListSkeleton rows={5} />
            ) : displayed.length === 0 ? (
              <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '48px', textAlign: 'center' }}>
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>📭</span>
                <p style={{ fontSize: '13px', fontWeight: 700, color: WHT, margin: '0 0 6px' }}>
                  {filter === 'todos' ? 'Aún no hay briefings' : `Sin briefings con estado "${BRIEF_ESTADOS.find(e => e.value === filter)?.label}"`}
                </p>
                <p style={{ fontSize: '11px', color: MUT, margin: 0 }}>
                  Comparte <span style={{ color: TEAL }}>{window.location.origin}/brief</span> con tus clientes.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {displayed.map(b => {
                  const estado = BRIEF_ESTADOS.find(e => e.value === b.estado)
                  return (
                    <div
                      key={b._id}
                      style={{
                        background: DIM, borderRadius: '6px', padding: '14px 18px',
                        border: `0.5px solid ${BDR}`,
                        borderLeft: `2.5px solid ${estado?.color ?? MUT}`,
                        display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
                        gap: '14px', flexWrap: 'wrap',
                        cursor: 'pointer', transition: 'border-color 0.15s',
                      }}
                      onClick={() => setSelected(b)}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = ACC2)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = BDR)}
                    >
                      {/* Avatar */}
                      <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: `linear-gradient(135deg,${C1},${ACC2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: '15px', flexShrink: 0 }}>
                        {b.nombre?.charAt(0).toUpperCase() ?? '?'}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: WHT, margin: 0 }}>{b.nombre}</p>
                          <span style={{ fontSize: '11px', color: MUT }}>·</span>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: BLUE, margin: 0 }}>{b.marca}</p>
                          {b.notas_admin && (
                            <span title="Tiene notas del admin" style={{ fontSize: '9px', color: AMB, background: `${AMB}18`, padding: '1px 6px', borderRadius: '3px', fontWeight: 700, letterSpacing: '0.05em' }}>NOTA</span>
                          )}
                        </div>
                        <p style={{ fontSize: '11px', color: MUT, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {b.email_direccion}
                          {b.propuesta_valor && b.propuesta_valor !== '—' ? ` · ${truncate(b.propuesta_valor)}` : ''}
                        </p>
                      </div>

                      {/* Fecha */}
                      {!isMobile && (
                        <p style={{ fontSize: '10px', color: MUT, margin: 0, whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(b.createdAt)}</p>
                      )}

                      {/* Estado */}
                      <div onClick={e => e.stopPropagation()}>
                        <EstadoBadge estado={b.estado} onChange={newEstado => handleEstado(b._id!, newEstado)} />
                      </div>

                      {/* Eliminar */}
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(b._id!) }}
                        disabled={deleting === b._id}
                        title="Eliminar briefing"
                        style={{ background: 'none', border: 'none', color: MUT, cursor: 'pointer', fontSize: '16px', padding: '4px', borderRadius: '4px', flexShrink: 0, transition: 'color 0.15s', lineHeight: 1 }}
                        onMouseEnter={e => (e.currentTarget.style.color = '#EF4444')}
                        onMouseLeave={e => (e.currentTarget.style.color = MUT)}
                      >
                        {deleting === b._id ? '…' : '×'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ══ TAB: FORMULARIO ════════════════════════════════════ */}
        {tab === 'formulario' && <FormBuilder />}

      </div>

      {/* ── Modal ── */}
      {selected && (
        <BriefModal
          brief={selected}
          onClose={() => setSelected(null)}
          onEstado={e => handleEstado(selected._id!, e)}
          onUpdate={handleBriefUpdate}
        />
      )}
    </AdminLayout>
  )
}

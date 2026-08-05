import { useState, useRef, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { db, firebaseReady } from '../lib/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getBriefFormConfig } from '../lib/db'
import type { BriefFormConfig } from '../data/briefs'
import { REDES_BRIEF } from '../data/briefs'
import { trackBriefSubmit } from '../lib/analytics'
import { uploadFile, storageReady } from '../lib/storage'
import NotaDeVoz, { type NotaDeVozValue } from '../components/NotaDeVoz'

/* ── Config ─────────────────────────────────────────────────── */
const V   = '#6E2DFF'  // violet
const AME = '#A855F7'  // amethyst

/* ── Types ──────────────────────────────────────────────────── */
interface FormData {
  email_direccion: string
  nombre:          string
  documento:       string
  telefono:        string
  email:           string
  marca:           string
  nacimiento_marca: string
  tiene_logo:       string
  slogan:           string
  presencia_redes:  string
  credenciales_redes:       string
  credenciales_plataformas: string
  personalidad:       string[]
  personalidad_otra:  string
  valores_marca:      string
  colores:            string[]
  colores_descripcion: string
  clientes_potenciales: string
  problema_resuelve:    string
  propuesta_valor:      string
  beneficios:           string
  experiencia_emocional: string
  emociones:             string[]
  emociones_descripcion: string
  competidores: string
  referencias:  string
  redes_seleccionadas: string[]
  fecha_inicio: string
  archivos:     string[]
  link_archivos: string
  notas_adicionales: string
}

const initialForm: FormData = {
  email_direccion: '',
  nombre:          '',
  documento:       '',
  telefono:        '',
  email:           '',
  marca:           '',
  nacimiento_marca: '',
  tiene_logo:       '',
  slogan:           '',
  presencia_redes:  '',
  credenciales_redes:       '',
  credenciales_plataformas: '',
  personalidad:       [],
  personalidad_otra:  '',
  valores_marca:      '',
  colores:            [],
  colores_descripcion: '',
  clientes_potenciales: '',
  problema_resuelve:    '',
  propuesta_valor:      '',
  beneficios:           '',
  experiencia_emocional: '',
  emociones:             [],
  emociones_descripcion: '',
  competidores: '',
  referencias:  '',
  redes_seleccionadas: [],
  fecha_inicio: '',
  archivos:     [],
  link_archivos: '',
  notas_adicionales: '',
}

/* ── Static options ─────────────────────────────────────────── */
const PERSONALIDADES = [
  'Profesional y seria', 'Cercana y amigable', 'Innovadora y disruptiva',
  'Lujosa y exclusiva', 'Juvenil y divertida', 'Auténtica y natural',
  'Inspiradora y motivadora', 'Minimalista y sofisticada',
]

const EMOCIONES_OPTS = [
  'Confianza', 'Emoción', 'Seguridad', 'Felicidad', 'Inspiración',
  'Pertenencia', 'Orgullo', 'Tranquilidad', 'Admiración', 'Deseo',
]

const COLOR_OPTS = [
  { label: 'Rojo',     color: '#E53935' },
  { label: 'Naranja',  color: '#F57C00' },
  { label: 'Amarillo', color: '#FDD835' },
  { label: 'Verde',    color: '#43A047' },
  { label: 'Azul',     color: '#1E88E5' },
  { label: 'Morado',   color: '#8E24AA' },
  { label: 'Rosa',     color: '#E91E8C' },
  { label: 'Negro',    color: '#212121' },
  { label: 'Blanco',   color: '#FFFFFF' },
  { label: 'Dorado',   color: '#FFB300' },
]

/* ── Shared inline styles ───────────────────────────────────── */
const inp: React.CSSProperties = {
  background: 'rgba(42,42,51,0.6)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '6px',
  color: '#fff',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '14px',
  fontWeight: 300,
  padding: '14px 16px',
  width: '100%',
  outline: 'none',
  backdropFilter: 'blur(8px)',
  boxSizing: 'border-box',
}

const ta: React.CSSProperties = {
  ...inp,
  resize: 'vertical',
  minHeight: '100px',
}

/* ── Sub-components ─────────────────────────────────────────── */
function SectionBlock({ num, title, children }: {
  num: string; title: string; children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: '56px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '12px', color: V, letterSpacing: '0.2em',
          minWidth: '28px', fontStyle: 'italic',
        }}>
          {num}
        </span>
        <span style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: '14px', fontWeight: 500, color: '#fff',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          {title}
        </span>
        <div style={{
          flex: 1, height: '1px',
          background: 'linear-gradient(to right, rgba(110,45,255,0.25), transparent)',
        }} />
      </div>
      {children}
    </div>
  )
}

function FieldWrap({ label, children, style, hasError }: {
  label: string
  children: React.ReactNode
  style?: React.CSSProperties
  hasError?: boolean
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', ...style }}>
      <label style={{
        fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
        color: hasError ? '#FF4D8D' : '#A0A0B0', fontWeight: 500,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function PillToggle({ items, selected, onToggle }: {
  items: string[]; selected: string[]; onToggle: (v: string) => void
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
      {items.map(item => {
        const active = selected.includes(item)
        return (
          <button
            key={item}
            type="button"
            onClick={() => onToggle(item)}
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: active ? 'rgba(110,45,255,0.18)' : 'rgba(42,42,51,0.6)',
              border: `1px solid ${active ? V : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '100px', padding: '8px 18px',
              fontSize: '12px', letterSpacing: '0.06em',
              color: active ? '#fff' : '#A0A0B0',
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: active ? '0 0 12px rgba(110,45,255,0.2)' : 'none',
            }}
          >
            {item}
          </button>
        )
      })}
    </div>
  )
}

/* ── Main component ─────────────────────────────────────────── */
export default function BriefPage() {
  const [form, setForm]         = useState<FormData>(initialForm)
  const [loading, setLoading]   = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors]     = useState<string[]>([])
  const [toast, setToast]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const fileInputRef            = useRef<HTMLInputElement>(null)
  const [fConfig, setFConfig]   = useState<BriefFormConfig | null>(null)
  const [customVals, setCustomVals] = useState<Record<string, string>>({})
  const [uploadingFiles, setUploadingFiles] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [notaVoz, setNotaVoz]   = useState<NotaDeVozValue | null>(null)

  useEffect(() => { getBriefFormConfig().then(setFConfig) }, [])

  // Helpers para leer la config — si no hay config cargada, todo activo por defecto
  function isSecActive(key: string): boolean {
    if (!fConfig) return true
    return fConfig.sections.find(s => s.key === key)?.active ?? true
  }
  function isFieldActive(key: string): boolean {
    if (!fConfig) return true
    return fConfig.fields.find(f => f.key === key)?.active ?? true
  }
  function getLabel(key: string, fallback: string): string {
    return fConfig?.fields.find(f => f.key === key)?.label ?? fallback
  }
  function customFieldsFor(secKey: string) {
    return fConfig?.fields.filter(f => f.sectionKey === secKey && f.custom && f.active) ?? []
  }

  /* helpers */
  function setField(field: keyof FormData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function toggleArr(field: 'personalidad' | 'colores' | 'emociones', value: string) {
    setForm(prev => {
      const arr = prev[field] as string[]
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      }
    })
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setFileError(null)
    if (!storageReady) {
      setFileError('La subida de archivos no está disponible en este momento. Usa el enlace externo (Drive, Dropbox, WeTransfer) más abajo.')
      return
    }
    const list = Array.from(files)
    const tooBig = list.filter(f => f.size > 10 * 1024 * 1024)
    const valid  = list.filter(f => f.size <= 10 * 1024 * 1024)
    if (tooBig.length > 0) {
      setFileError(`${tooBig.map(f => f.name).join(', ')} supera(n) 10MB. Usa el enlace externo para archivos grandes.`)
    }
    if (valid.length === 0) return
    setUploadingFiles(true)
    try {
      const results = await Promise.allSettled(valid.map(async f => {
        const url = await uploadFile(f)
        return `${f.name} — ${url}`
      }))
      const uploaded = results.filter((r): r is PromiseFulfilledResult<string> => r.status === 'fulfilled').map(r => r.value)
      const failed   = results.filter((r): r is PromiseRejectedResult => r.status === 'rejected')
      if (failed.length > 0) {
        setFileError(`No se pudieron subir ${failed.length} archivo(s). Intenta de nuevo o usa el enlace externo.`)
      }
      if (uploaded.length > 0) {
        setForm(prev => ({ ...prev, archivos: [...new Set([...prev.archivos, ...uploaded])] }))
      }
    } finally {
      setUploadingFiles(false)
    }
  }

  function removeFile(i: number) {
    setForm(prev => ({ ...prev, archivos: prev.archivos.filter((_, j) => j !== i) }))
  }

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4500)
  }

  async function handleSubmit() {
    const required: (keyof FormData)[] = ['email_direccion', 'nombre', 'email', 'marca']
    const missing  = required.filter(f => !(form[f] as string).trim())
    if (missing.length > 0) {
      setErrors(missing as string[])
      showToast('⚠️ Completa los campos obligatorios', 'error')
      return
    }
    setErrors([])
    setLoading(true)

    const personalidad_full = [
      ...form.personalidad,
      ...(form.personalidad_otra ? [`Otra: ${form.personalidad_otra}`] : []),
    ].join(', ') || '—'

    const emociones_full = [
      ...form.emociones,
      ...(form.emociones_descripcion ? [form.emociones_descripcion] : []),
    ].join(', ') || '—'

    const colores_full = [
      ...form.colores,
      ...(form.colores_descripcion ? [form.colores_descripcion] : []),
    ].join(', ') || '—'

    const payload = {
      email_direccion:          form.email_direccion,
      nombre:                   form.nombre,
      documento:                form.documento   || '—',
      telefono:                 form.telefono    || '—',
      email:                    form.email,
      marca:                    form.marca,
      nacimiento_marca:         form.nacimiento_marca         || '—',
      tiene_logo:               form.tiene_logo               || '—',
      slogan:                   form.slogan                   || '—',
      presencia_redes:          form.presencia_redes          || '—',
      credenciales_redes:       form.credenciales_redes       || '—',
      credenciales_plataformas: form.credenciales_plataformas || '—',
      personalidad:             personalidad_full,
      valores_marca:            form.valores_marca            || '—',
      colores_marca:            colores_full,
      clientes_potenciales:     form.clientes_potenciales     || '—',
      problema_resuelve:        form.problema_resuelve        || '—',
      propuesta_valor:          form.propuesta_valor          || '—',
      beneficios:               form.beneficios               || '—',
      experiencia_emocional:    form.experiencia_emocional    || '—',
      emociones:                emociones_full,
      competidores:             form.competidores             || '—',
      referencias:              form.referencias              || '—',
      fecha_inicio:             form.fecha_inicio             || 'No definida',
      ...(form.redes_seleccionadas.length > 0 ? { redes_seleccionadas: form.redes_seleccionadas } : {}),
      ...(notaVoz ? {
        audio_url:           notaVoz.url,
        audio_transcripcion: notaVoz.transcripcion,
        audio_duracion:      notaVoz.duracion,
      } : {}),
      archivos:                 form.archivos.length > 0 ? form.archivos.join('\n') : 'Ninguno',
      link_archivos:            form.link_archivos            || '—',
      notas_adicionales:        form.notas_adicionales        || '—',
      estado:                   'nuevo' as const,
      ...(Object.keys(customVals).length > 0 ? { custom_fields: customVals } : {}),
    }

    try {
      /* 1. Firestore */
      if (firebaseReady && db) {
        await addDoc(collection(db, 'briefs'), {
          ...payload,
          createdAt: serverTimestamp(),
        })
      }

      /* 2. Admin email via Vercel API */
      fetch('/api/send-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      }).catch(err => console.warn('[brief] email API:', err))

      setSubmitted(true)
      trackBriefSubmit(form.email_direccion || undefined)
      showToast('✅ ¡Briefing enviado! Te contactaremos pronto.', 'success')
    } catch (err) {
      console.error('[brief] submit error:', err)
      showToast('❌ Error al enviar. Intenta nuevamente.', 'error')
    } finally {
      setLoading(false)
    }
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <>
      <Helmet>
        <title>ALMA — Briefing de Cliente</title>
        <meta name="description" content="Completa la ficha para que podamos conocer tu marca y proyecto." />
        <meta name="robots" content="noindex" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body, #root { background-color: #08080B !important; }
          @keyframes brief-spin { to { transform: rotate(360deg); } }
          input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1) opacity(0.4); cursor: pointer;
          }
          select option { background: #18181E; color: #fff; }
        `}</style>
      </Helmet>

      {/* Gradient backdrop */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: [
          'radial-gradient(ellipse 80% 50% at 20% 10%, rgba(110,45,255,0.18) 0%, transparent 60%)',
          'radial-gradient(ellipse 60% 40% at 80% 80%, rgba(138,63,252,0.12) 0%, transparent 60%)',
        ].join(', '),
      }} />

      <div style={{
        minHeight: '100vh',
        background: '#08080B',
        color: '#fff',
        fontFamily: "'DM Sans', sans-serif",
        fontWeight: 300,
        overflowX: 'hidden',
        position: 'relative',
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', padding: '72px 24px 120px' }}>

          {/* ── Header ── */}
          <header style={{ textAlign: 'center', marginBottom: '72px' }}>
            <div style={{ marginBottom: '36px' }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(42px, 8vw, 72px)',
                fontWeight: 700, letterSpacing: '0.18em',
                color: '#fff', lineHeight: 1,
              }}>
                AL<span style={{ color: V, fontStyle: 'italic' }}>M</span>A
              </div>
              <span style={{
                display: 'block', fontSize: '10px', letterSpacing: '0.45em',
                color: '#A0A0B0', textTransform: 'uppercase', marginTop: '8px', fontWeight: 400,
              }}>
                Agencia Creativa
              </span>
            </div>

            <div style={{
              width: '40px', height: '2px',
              background: `linear-gradient(to right, ${V}, ${AME})`,
              margin: '12px auto', borderRadius: '2px',
            }} />

            <h1 style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(30px, 5vw, 46px)',
              fontWeight: 300, lineHeight: 1.15,
              letterSpacing: '-0.01em', color: '#fff',
              margin: '0 0 16px',
            }}>
              Briefing de<br />
              <em style={{ fontStyle: 'italic', color: AME }}>Cliente Nuevo</em>
            </h1>

            <p style={{ fontSize: '13px', color: '#A0A0B0', letterSpacing: '0.06em' }}>
              Completa la ficha para que podamos conocer tu marca y proyecto
            </p>

            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '24px', marginTop: '24px',
            }}>
              {['Estratégica', 'Creativa', 'Auténtica'].map((tag, i) => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '24px' }}>
                  {i > 0 && <span style={{ width: '3px', height: '3px', background: V, borderRadius: '50%', display: 'inline-block' }} />}
                  <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A0A0B0', fontWeight: 500 }}>
                    {tag}
                  </span>
                </span>
              ))}
            </div>

            <div style={{
              width: '1px', height: '48px',
              background: `linear-gradient(to bottom, transparent, ${V}, transparent)`,
              margin: '32px auto',
            }} />
          </header>

          {/* ── Info card ── */}
          <div style={{
            background: 'rgba(110,45,255,0.06)',
            border: '1px solid rgba(110,45,255,0.25)',
            borderLeft: `3px solid ${V}`,
            borderRadius: '6px', padding: '18px 20px',
            marginBottom: '32px', fontSize: '12px', lineHeight: 1.7, color: '#A0A0B0',
          }}>
            <strong style={{ color: AME, fontWeight: 500 }}>✦ Información confidencial</strong>
            {' '}— Todo lo que compartas aquí es privado y solo será usado para preparar tu propuesta personalizada. Completa los campos con el mayor detalle posible para que podamos crear algo que realmente te represente.
          </div>

          {/* ── Form body ── */}
          <div style={{
            opacity: submitted ? 0.35 : 1,
            pointerEvents: submitted ? 'none' : 'auto',
            transition: 'opacity 0.4s',
          }}>

            {/* 01 — Datos personales */}
            {isSecActive('s1') && (
            <SectionBlock num="01" title="Datos Personales">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {isFieldActive('email_direccion') && (
                <FieldWrap label={getLabel('email_direccion', 'Dirección de correo electrónico *')} hasError={errors.includes('email_direccion')}>
                  <input
                    style={{ ...inp, borderColor: errors.includes('email_direccion') ? '#FF4D8D' : undefined }}
                    type="email" placeholder="correo@empresa.com"
                    value={form.email_direccion}
                    onChange={e => setField('email_direccion', e.target.value)}
                  />
                </FieldWrap>
                )}
                {isFieldActive('nombre') && (
                <FieldWrap label={getLabel('nombre', 'Nombre completo *')} hasError={errors.includes('nombre')}>
                  <input
                    style={{ ...inp, borderColor: errors.includes('nombre') ? '#FF4D8D' : undefined }}
                    type="text" placeholder="Tu nombre completo"
                    value={form.nombre}
                    onChange={e => setField('nombre', e.target.value)}
                  />
                </FieldWrap>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {isFieldActive('documento') && (
                <FieldWrap label={getLabel('documento', 'Documento de identidad')}>
                  <input style={inp} type="text" placeholder="CC / NIT / Pasaporte" value={form.documento} onChange={e => setField('documento', e.target.value)} />
                </FieldWrap>
                )}
                {isFieldActive('telefono') && (
                <FieldWrap label={getLabel('telefono', 'Teléfono / Celular')}>
                  <input style={inp} type="tel" placeholder="+57 300 000 0000" value={form.telefono} onChange={e => setField('telefono', e.target.value)} />
                </FieldWrap>
                )}
              </div>

              {isFieldActive('email') && (
              <FieldWrap label={getLabel('email', 'Correo electrónico de la empresa *')} hasError={errors.includes('email')}>
                <input
                  style={{ ...inp, borderColor: errors.includes('email') ? '#FF4D8D' : undefined }}
                  type="email" placeholder="correo@empresa.com"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                />
              </FieldWrap>
              )}
              {customFieldsFor('s1').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea'
                    ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />
                    : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />
                  }
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 02 — Información de marca */}
            {isSecActive('s2') && (
            <SectionBlock num="02" title="Información de la Marca">
              {isFieldActive('marca') && (
              <FieldWrap label={getLabel('marca', 'Nombre de la marca *')} hasError={errors.includes('marca')} style={{ marginBottom: '16px' }}>
                <input style={{ ...inp, borderColor: errors.includes('marca') ? '#FF4D8D' : undefined }} type="text" placeholder="Nombre de tu marca o producto" value={form.marca} onChange={e => setField('marca', e.target.value)} />
              </FieldWrap>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                {isFieldActive('nacimiento_marca') && (
                <FieldWrap label={getLabel('nacimiento_marca', '¿Cuándo nació la marca?')}>
                  <input style={inp} type="text" placeholder="Ej: 2019, hace 3 años..." value={form.nacimiento_marca} onChange={e => setField('nacimiento_marca', e.target.value)} />
                </FieldWrap>
                )}
                {isFieldActive('tiene_logo') && (
                <FieldWrap label={getLabel('tiene_logo', '¿Tienes logo?')}>
                  <select style={{ ...inp, cursor: 'pointer' }} value={form.tiene_logo} onChange={e => setField('tiene_logo', e.target.value)}>
                    <option value="">Seleccionar</option>
                    <option>Sí, tengo logo definitivo</option>
                    <option>Sí, pero necesita actualización</option>
                    <option>No, necesito uno</option>
                  </select>
                </FieldWrap>
                )}
              </div>
              {isFieldActive('slogan') && (
              <FieldWrap label={getLabel('slogan', '¿Tienes slogan? ¿Cuál?')} style={{ marginBottom: '16px' }}>
                <input style={inp} type="text" placeholder="Escribe tu slogan si tienes uno..." value={form.slogan} onChange={e => setField('slogan', e.target.value)} />
              </FieldWrap>
              )}
              {isFieldActive('presencia_redes') && (
              <FieldWrap label={getLabel('presencia_redes', '¿Tienes presencia en redes sociales? (adjunta links)')}>
                <textarea style={{ ...ta, minHeight: '90px' }} placeholder={'Ej: Instagram @mimarca — https://instagram.com/mimarca\nFacebook — https://facebook.com/mimarca'} value={form.presencia_redes} onChange={e => setField('presencia_redes', e.target.value)} />
              </FieldWrap>
              )}
              {customFieldsFor('s2').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 03 — Credenciales */}
            {isSecActive('s3') && (
            <SectionBlock num="03" title="Accesos y Credenciales">
              {isFieldActive('credenciales_redes') && (
              <div style={{ background: 'rgba(110,45,255,0.05)', border: `1px solid rgba(110,45,255,0.25)`, borderRadius: '8px', padding: '20px', marginBottom: '16px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: AME, fontWeight: 500, marginBottom: '14px' }}>
                  🔒 Redes sociales que vamos a administrar
                </div>
                <FieldWrap label={getLabel('credenciales_redes', 'Usuarios y contraseñas de redes sociales')}>
                  <textarea style={{ ...ta, minHeight: '100px' }} placeholder={'Instagram — @mimarca — Contraseña: •••\nFacebook — @mimarca — Contraseña: •••'} value={form.credenciales_redes} onChange={e => setField('credenciales_redes', e.target.value)} />
                  <p style={{ fontSize: '11px', color: 'rgba(160,160,176,0.6)', letterSpacing: '0.02em', marginTop: '4px', fontStyle: 'italic' }}>🔒 Esta información es estrictamente confidencial.</p>
                </FieldWrap>
              </div>
              )}
              {isFieldActive('credenciales_plataformas') && (
              <div style={{ background: 'rgba(110,45,255,0.05)', border: `1px solid rgba(110,45,255,0.25)`, borderRadius: '8px', padding: '20px' }}>
                <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: AME, fontWeight: 500, marginBottom: '14px' }}>
                  🌐 Plataformas adicionales (CRM, sitio web, etc.)
                </div>
                <FieldWrap label={getLabel('credenciales_plataformas', 'Usuarios y contraseñas de plataformas')}>
                  <textarea style={{ ...ta, minHeight: '110px' }} placeholder={'Plataforma — URL — Usuario: xxx — Contraseña: xxx\nEj: WordPress — mimarca.com — admin — •••'} value={form.credenciales_plataformas} onChange={e => setField('credenciales_plataformas', e.target.value)} />
                  <p style={{ fontSize: '11px', color: 'rgba(160,160,176,0.6)', letterSpacing: '0.02em', marginTop: '4px', fontStyle: 'italic' }}>🔒 Incluye CRM, sitio web, herramientas de email marketing, tienda online, etc.</p>
                </FieldWrap>
              </div>
              )}
              {customFieldsFor('s3').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 04 — ADN de marca */}
            {isSecActive('s4') && (
            <SectionBlock num="04" title="ADN de Marca">
              {isFieldActive('personalidad') && (
              <FieldWrap label={getLabel('personalidad', '¿Qué tipo de personalidad tiene tu marca?')} style={{ marginBottom: '20px' }}>
                <PillToggle items={PERSONALIDADES} selected={form.personalidad} onToggle={v => toggleArr('personalidad', v)} />
                <input style={{ ...inp, marginTop: '10px' }} type="text" placeholder="Otra personalidad..." value={form.personalidad_otra} onChange={e => setField('personalidad_otra', e.target.value)} />
              </FieldWrap>
              )}
              {isFieldActive('valores_marca') && (
              <FieldWrap label={getLabel('valores_marca', '¿Cuáles son los valores de tu marca?')} style={{ marginBottom: '20px' }}>
                <textarea style={{ ...ta, minHeight: '90px' }} placeholder="Ej: Honestidad, innovación, calidad, sostenibilidad..." value={form.valores_marca} onChange={e => setField('valores_marca', e.target.value)} />
              </FieldWrap>
              )}
              {isFieldActive('colores_marca') && (
              <FieldWrap label={getLabel('colores_marca', '¿Qué colores representan tu marca?')}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  {COLOR_OPTS.map(c => {
                    const active = form.colores.includes(c.label)
                    return (
                      <button key={c.label} type="button" onClick={() => toggleArr('colores', c.label)} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: active ? 'rgba(110,45,255,0.15)' : 'rgba(42,42,51,0.6)', border: `1px solid ${active ? V : 'rgba(255,255,255,0.08)'}`, borderRadius: '100px', padding: '6px 14px 6px 8px', fontSize: '11px', letterSpacing: '0.06em', color: active ? '#fff' : '#A0A0B0', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}>
                        <span style={{ width: '14px', height: '14px', borderRadius: '50%', background: c.color, flexShrink: 0, border: c.color === '#FFFFFF' ? '1px solid rgba(255,255,255,0.3)' : 'none' }} />
                        {c.label}
                      </button>
                    )
                  })}
                </div>
                <input style={inp} type="text" placeholder="Describe tus colores con más detalle o códigos HEX..." value={form.colores_descripcion} onChange={e => setField('colores_descripcion', e.target.value)} />
              </FieldWrap>
              )}
              {customFieldsFor('s4').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 05 — Propuesta de valor */}
            {isSecActive('s5') && (
            <SectionBlock num="05" title="Propuesta de Valor">
              {isFieldActive('clientes_potenciales') && (
              <FieldWrap label={getLabel('clientes_potenciales', '¿Cuáles son tus clientes potenciales?')} style={{ marginBottom: '16px' }}>
                <textarea style={{ ...ta, minHeight: '90px' }} placeholder="Describe tu cliente ideal: edad, género, intereses, ubicación..." value={form.clientes_potenciales} onChange={e => setField('clientes_potenciales', e.target.value)} />
              </FieldWrap>
              )}
              {isFieldActive('problema_resuelve') && (
              <FieldWrap label={getLabel('problema_resuelve', '¿Qué problema resuelves con tu producto / servicio?')} style={{ marginBottom: '16px' }}>
                <textarea style={{ ...ta, minHeight: '90px' }} placeholder="¿Cuál es el dolor, necesidad o problema que tiene tu cliente?" value={form.problema_resuelve} onChange={e => setField('problema_resuelve', e.target.value)} />
              </FieldWrap>
              )}
              {isFieldActive('propuesta_valor') && (
              <FieldWrap label={getLabel('propuesta_valor', '¿Cuál es tu propuesta de valor? ¿Qué te diferencia?')} style={{ marginBottom: '16px' }}>
                <textarea style={{ ...ta, minHeight: '90px' }} placeholder="¿Por qué un cliente debería elegirte a ti y no a tu competencia?" value={form.propuesta_valor} onChange={e => setField('propuesta_valor', e.target.value)} />
              </FieldWrap>
              )}
              {isFieldActive('beneficios') && (
              <FieldWrap label={getLabel('beneficios', '¿Cuáles son los beneficios que ofreces?')}>
                <textarea style={{ ...ta, minHeight: '90px' }} placeholder="Resultados concretos, transformaciones, ventajas que obtiene tu cliente..." value={form.beneficios} onChange={e => setField('beneficios', e.target.value)} />
              </FieldWrap>
              )}
              {customFieldsFor('s5').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 06 — Experiencia emocional */}
            {isSecActive('s6') && (
            <SectionBlock num="06" title="Experiencia Emocional">
              {isFieldActive('experiencia_emocional') && (
              <FieldWrap label={getLabel('experiencia_emocional', '¿Qué experiencia emocional le brindas a tus clientes?')} style={{ marginBottom: '16px' }}>
                <textarea style={{ ...ta, minHeight: '90px' }} placeholder="¿Cómo se siente una persona después de usar tu producto o servicio?" value={form.experiencia_emocional} onChange={e => setField('experiencia_emocional', e.target.value)} />
              </FieldWrap>
              )}
              {isFieldActive('emociones') && (
              <FieldWrap label={getLabel('emociones', '¿Qué emociones quisieras transmitir?')}>
                <PillToggle items={EMOCIONES_OPTS} selected={form.emociones} onToggle={v => toggleArr('emociones', v)} />
                <textarea style={{ ...ta, minHeight: '80px', marginTop: '10px' }} placeholder="Amplía o agrega otras emociones que quieras transmitir..." value={form.emociones_descripcion} onChange={e => setField('emociones_descripcion', e.target.value)} />
              </FieldWrap>
              )}
              {customFieldsFor('s6').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 07 — Competencia y referencias */}
            {isSecActive('s7') && (
            <SectionBlock num="07" title="Competencia y Referencias">
              {isFieldActive('competidores') && (
              <FieldWrap label={getLabel('competidores', '¿Cuáles son tus competidores? (adjunta links)')} style={{ marginBottom: '16px' }}>
                <textarea style={{ ...ta, minHeight: '100px' }} placeholder={'Nombra tus principales competidores\nEj: Marca X — https://instagram.com/marcax'} value={form.competidores} onChange={e => setField('competidores', e.target.value)} />
              </FieldWrap>
              )}
              {isFieldActive('referencias') && (
              <FieldWrap label={getLabel('referencias', '¿Cuáles son tus referencias? (adjunta links)')}>
                <textarea style={{ ...ta, minHeight: '100px' }} placeholder={'Marcas, cuentas o estilos que admiras\nEj: @referencia1 — https://instagram.com/referencia1'} value={form.referencias} onChange={e => setField('referencias', e.target.value)} />
              </FieldWrap>
              )}
              {customFieldsFor('s7').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 08 — Redes y nota de voz (siempre visible: no depende de la
                 configuración del constructor de formularios) */}
            <SectionBlock num="08" title="Redes y Nota de Voz">
              <FieldWrap label="¿Qué redes quieres trabajar con nosotros?" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {REDES_BRIEF.map(r => {
                    const active = form.redes_seleccionadas.includes(r.value)
                    return (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setForm(f => ({
                          ...f,
                          redes_seleccionadas: active
                            ? f.redes_seleccionadas.filter(x => x !== r.value)
                            : [...f.redes_seleccionadas, r.value],
                        }))}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: '8px',
                          background: active ? 'rgba(110,45,255,0.18)' : 'rgba(42,42,51,0.6)',
                          border: `1px solid ${active ? V : 'rgba(255,255,255,0.08)'}`,
                          borderRadius: '100px', padding: '8px 18px',
                          fontSize: '12px', letterSpacing: '0.06em',
                          color: active ? '#fff' : '#A0A0B0',
                          cursor: 'pointer', transition: 'all 0.2s',
                          fontFamily: "'DM Sans', sans-serif",
                          boxShadow: active ? '0 0 12px rgba(110,45,255,0.2)' : 'none',
                        }}
                      >
                        <span aria-hidden>{r.icon}</span>{r.label}
                      </button>
                    )
                  })}
                </div>
              </FieldWrap>

              <FieldWrap label="Cuéntanos en tus palabras (opcional)">
                <NotaDeVoz value={notaVoz} onChange={setNotaVoz} accent={V} />
              </FieldWrap>
            </SectionBlock>

            {/* 09 — Inicio del servicio */}
            {isSecActive('s8') && (
            <SectionBlock num="09" title="Inicio del Servicio">
              {isFieldActive('fecha_inicio') && (
              <div style={{ maxWidth: '360px' }}>
                <FieldWrap label={getLabel('fecha_inicio', 'Fecha de inicio del servicio')}>
                  <input style={inp} type="date" value={form.fecha_inicio} onChange={e => setField('fecha_inicio', e.target.value)} />
                </FieldWrap>
              </div>
              )}
              {customFieldsFor('s8').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 09 — Archivos de referencia */}
            {isSecActive('s9') && (
            <SectionBlock num="10" title="Archivos de Referencia">
              {isFieldActive('archivos') && <div
                role="button"
                tabIndex={0}
                style={{
                  border: '1px dashed rgba(110,45,255,0.35)',
                  borderRadius: '8px',
                  background: 'rgba(42,42,51,0.6)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  position: 'relative',
                  transition: 'border-color 0.25s, background 0.25s',
                }}
                onClick={() => !uploadingFiles && fileInputRef.current?.click()}
                onKeyDown={e => e.key === 'Enter' && !uploadingFiles && fileInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = V; e.currentTarget.style.background = 'rgba(110,45,255,0.08)' }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(110,45,255,0.35)'; e.currentTarget.style.background = 'rgba(42,42,51,0.6)' }}
                onDrop={e => { e.preventDefault(); if (!uploadingFiles) handleFiles(e.dataTransfer.files); e.currentTarget.style.borderColor = 'rgba(110,45,255,0.35)'; e.currentTarget.style.background = 'rgba(42,42,51,0.6)' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  disabled={uploadingFiles}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.ppt,.pptx,.zip,.mp4,.mov,.ai,.eps,.svg"
                  style={{ display: 'none' }}
                  onChange={e => { handleFiles(e.target.files); e.target.value = '' }}
                />
                {uploadingFiles ? (
                  <div style={{ fontSize: '13px', color: AME }}>⏳ Subiendo archivo(s)…</div>
                ) : (
                  <>
                    <div style={{ fontSize: '28px', marginBottom: '10px', opacity: 0.4 }}>✦</div>
                    <div style={{ fontSize: '13px', color: '#A0A0B0', lineHeight: 1.6 }}>
                      <strong style={{ color: AME }}>Arrastra tus archivos aquí</strong><br />
                      o haz clic para seleccionar<br />
                      <span style={{ fontSize: '11px', opacity: 0.5 }}>
                        Logo, brand kit, fotos, guías de estilo, presentaciones · Máx. 10MB por archivo
                      </span>
                    </div>
                  </>
                )}
                {fileError && (
                  <p style={{ marginTop: '10px', fontSize: '11.5px', color: '#F87171' }}>⚠️ {fileError}</p>
                )}
                {form.archivos.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                    {form.archivos.map((f, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'rgba(110,45,255,0.12)',
                          border: `1px solid rgba(110,45,255,0.25)`,
                          borderRadius: '4px', padding: '4px 10px',
                          fontSize: '11px', color: AME,
                          display: 'flex', alignItems: 'center', gap: '6px',
                        }}
                      >
                        ✦ {f.split(' — ')[0]}
                        <button
                          type="button"
                          onClick={ev => { ev.stopPropagation(); removeFile(i) }}
                          style={{ background: 'none', border: 'none', color: '#A0A0B0', cursor: 'pointer', fontSize: '14px', lineHeight: 1, padding: 0 }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>}

              {isFieldActive('link_archivos') && (
              <FieldWrap label={getLabel('link_archivos', 'Enlace a archivos externos (Drive, Dropbox, WeTransfer...)')} style={{ marginTop: '16px' }}>
                <input style={inp} type="url" placeholder="https://drive.google.com/..." value={form.link_archivos} onChange={e => setField('link_archivos', e.target.value)} />
              </FieldWrap>
              )}
              {customFieldsFor('s9').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

            {/* 10 — Para nosotros */}
            {isSecActive('s10') && (
            <SectionBlock num="11" title="Para Nosotros">
              {isFieldActive('notas_adicionales') && (
              <FieldWrap label={getLabel('notas_adicionales', '¿Algo que quieras agregar? Cuéntanos tus sentimientos y expectativas')}>
                <textarea style={{ ...ta, minHeight: '140px' }} placeholder="Es importante para nosotros conocer cómo te sientes, qué esperas de esta alianza, qué sueños tienes para tu marca... Escribe con libertad." value={form.notas_adicionales} onChange={e => setField('notas_adicionales', e.target.value)} />
              </FieldWrap>
              )}
              {customFieldsFor('s10').map(cf => (
                <FieldWrap key={cf.key} label={cf.label} style={{ marginTop: '16px' }}>
                  {cf.type === 'textarea' ? <textarea style={ta} value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} /> : <input style={inp} type="text" value={customVals[cf.key] ?? ''} onChange={e => setCustomVals(p => ({ ...p, [cf.key]: e.target.value }))} />}
                </FieldWrap>
              ))}
            </SectionBlock>
            )}

          </div>

          {/* ── Submit button ── */}
          {!submitted ? (
            <div style={{ marginTop: '64px', textAlign: 'center' }}>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '12px',
                  background: `linear-gradient(135deg, ${V}, #8A3FFC)`,
                  color: '#fff',
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '12px', fontWeight: 500,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  border: 'none', borderRadius: '6px',
                  padding: '20px 56px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.25s',
                }}
              >
                {loading && (
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'brief-spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                )}
                Enviar Briefing
              </button>
              <p style={{ marginTop: '20px', fontSize: '11px', color: 'rgba(160,160,176,0.5)', letterSpacing: '0.04em' }}>
                Tu información es confidencial y solo será usada para preparar tu propuesta.
              </p>
            </div>
          ) : (
            <div style={{
              marginTop: '64px', textAlign: 'center',
              padding: '48px 32px',
              background: 'rgba(110,45,255,0.06)',
              border: `1px solid rgba(110,45,255,0.25)`,
              borderRadius: '16px',
            }}>
              <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>✦</span>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '28px', fontWeight: 300, color: '#fff', margin: '0 0 12px',
              }}>
                ¡Briefing recibido!
              </h2>
              <p style={{ color: '#A0A0B0', fontSize: '14px', lineHeight: 1.7, maxWidth: '420px', margin: '0 auto' }}>
                Gracias por completar tu ficha. El equipo de Alma revisará tu información y se pondrá en contacto contigo para dar inicio a tu proyecto.
              </p>
            </div>
          )}

        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%',
          transform: 'translateX(-50%)',
          background: '#1E1E28',
          border: `1px solid ${toast.type === 'success' ? '#4CAF7C' : '#FF4D8D'}`,
          color: '#fff', padding: '16px 28px',
          borderRadius: '8px', fontSize: '14px',
          zIndex: 1000, whiteSpace: 'nowrap',
          boxShadow: '0 12px 48px rgba(0,0,0,0.7)',
          backdropFilter: 'blur(16px)',
        }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}

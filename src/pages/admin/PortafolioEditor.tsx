import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getProyectos, createProyecto, updateProyecto } from '../../lib/db'
import { gradientesDisponibles, filtrosPortafolio } from '../../data/portafolio'
import type { Proyecto } from '../../data/portafolio'
import ImageUploader from '../../components/ImageUploader'

const CATS = filtrosPortafolio.filter(f => f !== 'Todos')

export default function PortafolioEditor() {
  const { id }   = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isNew    = id === 'nuevo'

  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [docId,   setDocId]   = useState<string | null>(null)

  const [titulo,    setTitulo]    = useState('')
  const [cat,       setCat]       = useState(CATS[0])
  const [desc,      setDesc]      = useState('')
  const [año,       setAño]       = useState(String(new Date().getFullYear()))
  const [tagsStr,   setTagsStr]   = useState('')        // comma-separated
  const [gradient,  setGradient]  = useState(gradientesDisponibles[0].value)
  const [imagen,    setImagen]    = useState('')
  const [featured,  setFeatured]  = useState(false)

  useEffect(() => {
    if (isNew) return
    setLoading(true)
    getProyectos().then(proyectos => {
      const found = proyectos.find(p => p._id === id || p.titulo === id)
      if (found) {
        setTitulo(found.titulo)
        setCat(found.cat)
        setDesc(found.desc)
        setAño(found.año)
        setTagsStr(found.tags.join(', '))
        setGradient(found.g)
        setImagen(found.imagen ?? '')
        setFeatured(!!found.featured)
        setDocId(found._id ?? null)
      }
      setLoading(false)
    })
  }, [id, isNew])

  const handleSave = async () => {
    if (!titulo.trim()) { alert('El título es obligatorio'); return }
    setSaving(true)
    try {
      const data: Omit<Proyecto, '_id'> = {
        titulo,
        cat,
        desc,
        año,
        tags: tagsStr.split(',').map(t => t.trim()).filter(Boolean),
        g: gradient,
        ...(imagen ? { imagen } : {}),
        featured,
      }
      if (isNew || !docId) {
        await createProyecto(data)
      } else {
        await updateProyecto(docId, data)
      }
      navigate('/admin/portafolio')
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
      <div style={{ padding: '32px', maxWidth: '720px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0 }}>
            {isNew ? '+ Nuevo proyecto' : 'Editar proyecto'}
          </h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/admin/portafolio')}
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
                background: saving ? '#9CA3AF' : '#0284C7',
                color: '#fff', border: 'none',
                fontWeight: 700, fontSize: '14px', cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Guardando…' : '✓ Guardar proyecto'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Datos principales */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Información del proyecto
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Nombre del proyecto *</label>
                <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} style={inputStyle} placeholder="Nombre del cliente o proyecto…" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Categoría</label>
                <select value={cat} onChange={e => setCat(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Año</label>
                <input type="text" value={año} onChange={e => setAño(e.target.value)} style={inputStyle} placeholder="2024" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>Descripción</label>
                <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Descripción breve del proyecto y sus resultados…" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                  Tags (separados por coma)
                </label>
                <input type="text" value={tagsStr} onChange={e => setTagsStr(e.target.value)} style={inputStyle} placeholder="Logo, Branding, Redes sociales" />
                <p style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px' }}>
                  Ej: Logo, Manual de marca, Redes sociales
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>¿Proyecto destacado?</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#0284C7' }} />
                  <span style={{ fontSize: '14px', color: '#374151' }}>Marcar como destacado</span>
                </label>
              </div>
            </div>
          </div>

          {/* Imagen de portada */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Imagen de portada
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '16px' }}>
              Si subes una imagen se mostrará en la tarjeta del portafolio. Si no, se usa el color de fondo.
            </p>
            <ImageUploader
              currentUrl={imagen}
              onUploaded={setImagen}
              height={200}
            />
          </div>

          {/* Color / gradiente */}
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Color de la tarjeta
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {gradientesDisponibles.map(g => (
                  <button
                    key={g.value}
                    onClick={() => setGradient(g.value)}
                    title={g.label}
                    style={{
                      width: '52px', height: '52px', borderRadius: '12px',
                      background: g.value, cursor: 'pointer',
                      border: `3px solid ${gradient === g.value ? '#0284C7' : 'transparent'}`,
                      boxShadow: gradient === g.value ? '0 0 0 2px #0284C7' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </div>
              {/* Preview */}
              <div style={{
                width: '140px', height: '80px', borderRadius: '12px',
                background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{
                  background: 'rgba(255,255,255,0.9)', color: '#374151',
                  fontSize: '11px', fontWeight: 700,
                  padding: '4px 12px', borderRadius: '20px',
                }}>
                  {titulo || 'Proyecto'}
                </span>
              </div>
            </div>
          </div>

          {/* Guardar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => navigate('/admin/portafolio')}
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
                background: saving ? '#9CA3AF' : '#0284C7',
                color: '#fff', border: 'none',
                fontWeight: 700, fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Guardando…' : '✓ Guardar proyecto'}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

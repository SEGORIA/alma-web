import { useState, useEffect } from 'react'
import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  getClientes, saveCliente, updateCliente, deleteCliente,
  updateSolicitudEnCliente, marcaToSlug, uploadClienteLogo,
} from '../../lib/db'
import type { Cliente, ParrillaItem, Solicitud, MetricaMes, AnalisisMarca, ParrillaHtml, ParrillaMes, ParrillaExtraItem, AccesoItem } from '../../data/clientes'
import {
  CLIENTE_ESTADOS, SERVICIOS_DISPONIBLES,
  PARRILLA_ESTADOS, SOLICITUD_TIPOS, SOLICITUD_ESTADOS, PILARES_CONTENIDO,
} from '../../data/clientes'
import { ListSkeleton } from '../../components/admin/Loading'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ADM } from '../../lib/adminTheme'

const { BK, DIM, BDR, BDR2, MUT, WHT, C1, C1_BG, ACC2, ROSE, AMB, GRN, BLUE, INPUT_BG, GHOST, SOFT } = ADM

/* ── Paleta oscura — estilo Finanzas ─────────────────────── */

/* ── Helpers ─────────────────────────────────────────────── */
type ModalTab = 'perfil' | 'parrilla' | 'solicitudes' | 'metricas' | 'portal' | 'estrategia' | 'accesos'

function newId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

/* ── Compresión de imágenes base64 embebidas en HTML ───────
   Los HTML de estrategia suelen traer imágenes en data-URI que disparan
   el límite de 1 MiB por documento de Firestore ("invalid nested entity").
   Se reescalan/recodifican en el navegador antes de guardar. */
const HTML_MAX_BYTES  = 900_000  // margen bajo el límite de 1 MiB (el doc lleva más campos)
const IMG_COMPRESS_MIN = 60_000  // solo comprimir data-URIs mayores a esto

function compressDataUri(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const MAX_W  = 1200
      const scale  = Math.min(1, MAX_W / img.naturalWidth)
      const canvas = document.createElement('canvas')
      canvas.width  = Math.max(1, Math.round(img.naturalWidth  * scale))
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('canvas no disponible')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      // WebP conserva transparencia; si el navegador no lo soporta, JPEG sobre fondo blanco
      const webp = canvas.toDataURL('image/webp', 0.72)
      if (webp.startsWith('data:image/webp')) { resolve(webp); return }
      ctx.globalCompositeOperation = 'destination-over'
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.72))
    }
    img.onerror = () => reject(new Error('no se pudo decodificar la imagen'))
    img.src = uri
  })
}

async function compressHtmlDataImages(html: string): Promise<string> {
  const uris = [...new Set(
    [...html.matchAll(/data:image\/[a-zA-Z+.-]+;base64,[A-Za-z0-9+/=]+/g)].map(m => m[0])
  )].filter(u => u.length > IMG_COMPRESS_MIN)
  let out = html
  for (const uri of uris) {
    try {
      const compressed = await compressDataUri(uri)
      if (compressed.length < uri.length) out = out.split(uri).join(compressed)
    } catch { /* dejar la imagen original */ }
  }
  return out
}

const EMPTY_FORM: Omit<Cliente, '_id'> = {
  nombre: '', email: '', marca: '',
  servicios: [], estado: 'activo',
  entregables: [], parrilla: [], solicitudes: [],
}

const REDES_OPCIONES = ['Instagram', 'Facebook', 'TikTok', 'YouTube', 'LinkedIn', 'Twitter/X', 'Pinterest', 'Otro']
const TIPO_POST_OPCIONES = ['Reel', 'Carrusel', 'Post', 'Story', 'Video', 'Blog', 'Email', 'Otro']
const DURACION_OPCIONES  = ['', '15 seg', '20 seg', '30 seg', '45 seg', '1 min', '2 min', '3 slides', '5 slides', '7 slides', '10 slides']

/* ── Helpers financieros ──────────────────────────────────── */
function parseValorCOP(v?: string): number {
  if (!v) return 0
  const n = parseFloat(v.replace(/[^0-9]/g, ''))
  return isNaN(n) ? 0 : n
}
function fmtCOP(n: number): string {
  if (n === 0) return '$0'
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1).replace('.0', '')}M`
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`
  return `$${n}`
}


/* ── Main component ──────────────────────────────────────── */
export default function ClientesAdmin() {
  const isMobile = useIsMobile()

  /* list */
  const [clientes,     setClientes]    = useState<Cliente[]>([])
  const [loading,      setLoading]     = useState(true)
  const [search,       setSearch]      = useState('')
  const [filterEstado, setFilterEstado]= useState('all')

  /* modal */
  const [showModal,  setShowModal]  = useState(false)
  const [editId,     setEditId]     = useState<string | null>(null)
  const [tab,        setTab]        = useState<ModalTab>('perfil')
  const [form,       setForm]       = useState<Omit<Cliente, '_id'>>({ ...EMPTY_FORM })
  const [saving,     setSaving]     = useState(false)
  const [saveMsg,    setSaveMsg]    = useState('')

  /* sub-forms */
  const [newP, setNewP] = useState<Partial<ParrillaItem>>({ fecha: '', red: 'Instagram', tipo: 'Reel', descripcion: '', estado: 'borrador' })
  const [editingParrillaId, setEditingParrillaId] = useState<string | null>(null)
  const [newMes, setNewMes] = useState<Partial<MetricaMes>>({ mes: '' })
  const [editMes, setEditMes] = useState<string | null>(null)
  const [editingParrillaData, setEditingParrillaData] = useState<Partial<ParrillaItem>>({})
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})

  /* logo upload */
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError,     setLogoError]     = useState('')

  /* parrilla html upload */
  const [newHtmlLabel,    setNewHtmlLabel]    = useState('')
  const [newHtmlMes,      setNewHtmlMes]      = useState('')
  const [htmlUploading,   setHtmlUploading]   = useState(false)
  const [htmlUploadError, setHtmlUploadError] = useState('')

  /* tablero trello por meses */
  const [expandedTrelloMesId,   setExpandedTrelloMesId]   = useState<string | null>(null)
  const [newMesLabel2,          setNewMesLabel2]           = useState('')
  const [newMesMesValue,        setNewMesMesValue]         = useState('')
  const [trelloMesHtmlUploading,setTrelloMesHtmlUploading] = useState<string | null>(null)  // id del mes que está subiendo
  const [trelloMesHtmlMsg,      setTrelloMesHtmlMsg]       = useState<Record<string, { ok: boolean; texto: string }>>({})  // feedback por mes
  const [newExtraData,          setNewExtraData]           = useState<Record<string, { label: string; url: string; nota: string }>>({})

  /* accesos */
  const [newAcceso, setNewAcceso] = useState<Omit<AccesoItem, 'id' | 'createdAt'>>({ plataforma:'', usuario:'', password:'', url:'', notas:'' })
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [editAccesoId, setEditAccesoId] = useState<string | null>(null)
  const [showEditPwd,  setShowEditPwd]  = useState(false)

  /* load */
  useEffect(() => {
    getClientes().then(data => { setClientes(data); setLoading(false) })
  }, [])

  /* Limpia todos los sub-formularios al abrir/cambiar de cliente en el modal,
     evitando que quede una tarjeta "editando" (o una contraseña tecleada) del
     cliente anterior. */
  function resetSubForms() {
    setNewP({ fecha: '', red: 'Instagram', tipo: 'Reel', descripcion: '', estado: 'borrador' })
    setEditingParrillaId(null)
    setEditingParrillaData({})
    setNewMes({ mes: '' })
    setEditMes(null)
    setLogoUploading(false); setLogoError('')
    setNewHtmlLabel(''); setNewHtmlMes(''); setHtmlUploading(false); setHtmlUploadError('')
    setExpandedTrelloMesId(null)
    setNewMesLabel2(''); setNewMesMesValue('')
    setTrelloMesHtmlUploading(null); setTrelloMesHtmlMsg({})
    setNewExtraData({})
    setNewAcceso({ plataforma:'', usuario:'', password:'', url:'', notas:'' })
    setShowNewPwd(false); setEditAccesoId(null); setShowEditPwd(false)
  }

  /* ── handlers ── */
  function handleNew() {
    resetSubForms()
    setForm({ ...EMPTY_FORM })   // sin token; se genera desde la marca al guardar
    setEditId(null); setTab('perfil'); setSaveMsg(''); setShowModal(true)
    setRespuestas({})
  }

  function handleEdit(c: Cliente) {
    resetSubForms()
    setForm({ ...c })
    setEditId(c._id!)
    setTab('perfil'); setSaveMsg(''); setShowModal(true)
    // pre-fill respuestas
    const r: Record<string, string> = {}
    c.solicitudes.forEach(s => { if (s.respuesta) r[s.id] = s.respuesta })
    setRespuestas(r)
  }

  async function handleLogoUpload(file: File) {
    const slug = form.access_token || marcaToSlug(form.marca) || `temp-${Date.now()}`
    setLogoUploading(true); setLogoError('')
    try {
      const url = await uploadClienteLogo(file, slug)
      setForm(f => ({ ...f, logo_url: url }))
    } catch (e) {
      setLogoError('No se pudo subir el logo. Verifica que Firebase Storage esté habilitado.')
      console.error(e)
    } finally {
      setLogoUploading(false)
    }
  }

  async function handleSave() {
    if (!form.nombre.trim() || !form.email.trim() || !form.marca.trim()) {
      setSaveMsg('Nombre, email y marca son obligatorios.')
      return
    }
    setSaving(true); setSaveMsg('')
    try {
      if (editId) {
        await updateCliente(editId, form)
        setClientes(prev => prev.map(c => c._id === editId ? { ...form, _id: editId } : c))
      } else {
        // saveCliente genera el slug desde la marca y retorna { id, slug }
        const { id, slug } = await saveCliente(form)
        setClientes(prev => [{ ...form, access_token: slug, _id: id }, ...prev])
      }
      setShowModal(false)
    } catch (e) {
      setSaveMsg('Error al guardar: ' + String(e))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!(await confirmar({
      mensaje: '¿Eliminar cliente? Esta acción eliminará también el acceso al portal. No se puede deshacer.',
    }))) return
    try {
      await deleteCliente(id)
      setClientes(prev => prev.filter(c => c._id !== id))
      toast.ok('Cliente eliminado.')
    } catch {
      toast.err('No se pudo eliminar el cliente. Intenta de nuevo.')
    }
  }

  function addParrillaItem() {
    if (!newP.fecha?.trim() || !newP.descripcion?.trim()) return
    const item: ParrillaItem = {
      id:          newId(),
      dia_num:     newP.dia_num,
      semana:      newP.semana,
      fecha:       newP.fecha,
      red:         newP.red ?? 'Instagram',
      tipo:        newP.tipo ?? 'Reel',
      duracion:    newP.duracion || undefined,
      descripcion: newP.descripcion.trim(),
      subtitulo:   newP.subtitulo?.trim() || undefined,
      pilar:       newP.pilar || undefined,
      cta:         newP.cta?.trim() || undefined,
      estado:      newP.estado ?? 'borrador',
      link:        newP.link?.trim() || undefined,
      link_drive:  newP.link_drive?.trim() || undefined,
    }
    setForm(f => ({ ...f, parrilla: [...f.parrilla, item] }))
    setNewP({ fecha: '', red: 'Instagram', tipo: 'Reel', descripcion: '', estado: 'borrador' })
  }

  function removeParrillaItem(id: string) {
    setForm(f => ({ ...f, parrilla: f.parrilla.filter(p => p.id !== id) }))
    if (editingParrillaId === id) setEditingParrillaId(null)
  }

  function updateParrillaEstado(id: string, estado: ParrillaItem['estado']) {
    setForm(f => ({
      ...f,
      parrilla: f.parrilla.map(p => p.id === id ? { ...p, estado } : p),
    }))
    if (editingParrillaId === id) setEditingParrillaData(d => ({ ...d, estado }))
  }

  function openEditParrilla(item: ParrillaItem) {
    setEditingParrillaId(item.id)
    setEditingParrillaData({ ...item })
  }

  function saveEditParrilla() {
    if (!editingParrillaId) return
    setForm(f => ({
      ...f,
      parrilla: f.parrilla.map(p => p.id === editingParrillaId ? { ...p, ...editingParrillaData } : p),
    }))
    setEditingParrillaId(null)
    setEditingParrillaData({})
  }

  function upsertMetricaMes() {
    if (!newMes.mes) return
    setForm(f => {
      const hist = f.metricas_historico ?? []
      const exists = hist.find(m => m.mes === newMes.mes)
      return {
        ...f,
        metricas_historico: exists
          ? hist.map(m => m.mes === newMes.mes ? { ...m, ...newMes } : m)
          : [...hist, newMes as MetricaMes].sort((a, b) => a.mes.localeCompare(b.mes)),
      }
    })
    setNewMes({ mes: '' })
    setEditMes(null)
  }

  function removeMetricaMes(mes: string) {
    setForm(f => ({ ...f, metricas_historico: (f.metricas_historico ?? []).filter(m => m.mes !== mes) }))
  }

  function startEditMes(m: MetricaMes) {
    setEditMes(m.mes)
    setNewMes({ ...m })
  }

  async function addParrillaHtml(file: File) {
    if (!newHtmlLabel.trim() || !newHtmlMes.trim()) return
    setHtmlUploading(true); setHtmlUploadError('')
    try {
      const original = await file.text()
      const texto = original.length > HTML_MAX_BYTES
        ? await compressHtmlDataImages(original)
        : original
      if (texto.length > HTML_MAX_BYTES) {
        setHtmlUploadError(`El HTML pesa ${(texto.length / 1024).toFixed(0)} KB incluso tras comprimir imágenes (límite ~${(HTML_MAX_BYTES / 1024).toFixed(0)} KB). Reduce las imágenes o súbelas a Drive y enlázalas.`)
        return
      }
      const item: ParrillaHtml = {
        id:        newId(),
        mes:       newHtmlMes,
        label:     newHtmlLabel.trim(),
        contenido: texto,
        titulo:    newHtmlLabel.trim(),
        createdAt: new Date().toISOString(),
      }
      setForm(f => ({ ...f, parrilla_htmls: [...(f.parrilla_htmls ?? []), item] }))
      setNewHtmlLabel(''); setNewHtmlMes('')
    } catch {
      setHtmlUploadError('No se pudo leer el archivo HTML.')
    } finally {
      setHtmlUploading(false)
    }
  }

  function removeParrillaHtml(id: string) {
    setForm(f => ({ ...f, parrilla_htmls: (f.parrilla_htmls ?? []).filter(h => h.id !== id) }))
  }

  /* ── Tablero Trello — funciones ── */

  function addTrelloMes() {
    if (!newMesLabel2.trim() || !newMesMesValue) return
    const mes: ParrillaMes = {
      id:        newId(),
      mes:       newMesMesValue,
      label:     newMesLabel2.trim(),
      createdAt: new Date().toISOString(),
    }
    setForm(f => ({ ...f, parrilla_meses: [...(f.parrilla_meses ?? []), mes] }))
    setNewMesLabel2(''); setNewMesMesValue('')
    setExpandedTrelloMesId(mes.id)
  }

  function removeTrelloMes(id: string) {
    setForm(f => ({ ...f, parrilla_meses: (f.parrilla_meses ?? []).filter(m => m.id !== id) }))
    if (expandedTrelloMesId === id) setExpandedTrelloMesId(null)
  }

  function updateTrelloMes(id: string, patch: Partial<ParrillaMes>) {
    setForm(f => ({
      ...f,
      parrilla_meses: (f.parrilla_meses ?? []).map(m => m.id === id ? { ...m, ...patch } : m),
    }))
  }

  async function uploadTrelloMesHtml(mesId: string, file: File) {
    setTrelloMesHtmlUploading(mesId)
    setTrelloMesHtmlMsg(prev => { const { [mesId]: _omit, ...rest } = prev; return rest })
    try {
      const original = await file.text()
      // Comprimir imágenes base64 embebidas si el HTML amenaza el límite de Firestore
      const texto = original.length > HTML_MAX_BYTES
        ? await compressHtmlDataImages(original)
        : original
      if (texto.length > HTML_MAX_BYTES) {
        setTrelloMesHtmlMsg(prev => ({ ...prev, [mesId]: {
          ok: false,
          texto: `El HTML pesa ${(texto.length / 1024).toFixed(0)} KB incluso tras comprimir imágenes (límite ~${(HTML_MAX_BYTES / 1024).toFixed(0)} KB). Reduce las imágenes o súbelas a Drive y enlázalas.`,
        }}))
        return
      }
      updateTrelloMes(mesId, { html_contenido: texto })
      if (texto.length < original.length) {
        setTrelloMesHtmlMsg(prev => ({ ...prev, [mesId]: {
          ok: true,
          texto: `Imágenes comprimidas: ${(original.length / 1024).toFixed(0)} KB → ${(texto.length / 1024).toFixed(0)} KB.`,
        }}))
      }
    } catch {
      setTrelloMesHtmlMsg(prev => ({ ...prev, [mesId]: { ok: false, texto: 'No se pudo leer el archivo HTML.' } }))
    } finally {
      setTrelloMesHtmlUploading(null)
    }
  }

  function addExtraToMes(mesId: string) {
    const d = newExtraData[mesId]
    if (!d?.label?.trim()) return
    const extra: ParrillaExtraItem = {
      id:    newId(),
      label: d.label.trim(),
      url:   d.url?.trim() || undefined,
      nota:  d.nota?.trim() || undefined,
    }
    updateTrelloMes(mesId, {
      extras: [...((form.parrilla_meses ?? []).find(m => m.id === mesId)?.extras ?? []), extra],
    })
    setNewExtraData(prev => ({ ...prev, [mesId]: { label: '', url: '', nota: '' } }))
  }

  function removeExtraFromMes(mesId: string, extraId: string) {
    const mes = (form.parrilla_meses ?? []).find(m => m.id === mesId)
    if (!mes) return
    updateTrelloMes(mesId, { extras: (mes.extras ?? []).filter(e => e.id !== extraId) })
  }

  /* ── Accesos — funciones ── */
  function addAcceso() {
    if (!newAcceso.plataforma.trim() || !newAcceso.usuario.trim() || !newAcceso.password.trim()) return
    const item: AccesoItem = {
      id:         newId(),
      plataforma: newAcceso.plataforma.trim(),
      usuario:    newAcceso.usuario.trim(),
      password:   newAcceso.password,
      url:        newAcceso.url?.trim() || undefined,
      notas:      newAcceso.notas?.trim() || undefined,
      createdAt:  new Date().toISOString(),
    }
    setForm(f => ({ ...f, accesos: [...(f.accesos ?? []), item] }))
    setNewAcceso({ plataforma:'', usuario:'', password:'', url:'', notas:'' })
    setShowNewPwd(false)
  }

  function removeAcceso(id: string) {
    setForm(f => ({ ...f, accesos: (f.accesos ?? []).filter(a => a.id !== id) }))
    if (editAccesoId === id) setEditAccesoId(null)
  }

  function updateAcceso(id: string, patch: Partial<AccesoItem>) {
    setForm(f => ({ ...f, accesos: (f.accesos ?? []).map(a => a.id === id ? { ...a, ...patch } : a) }))
  }

  async function saveSolicitudRespuesta(s: Solicitud) {
    if (!editId) return
    const token = form.access_token ?? ''
    const changes: Partial<Solicitud> = {
      estado:    s.estado,
      respuesta: respuestas[s.id] ?? s.respuesta,
    }
    try {
      await updateSolicitudEnCliente(editId, token, s.id, changes)
      setForm(f => ({
        ...f,
        solicitudes: f.solicitudes.map(x => x.id === s.id ? { ...x, ...changes } : x),
      }))
      toast.ok('Respuesta guardada.')
    } catch {
      toast.err('No se pudo guardar la respuesta. Intenta de nuevo.')
    }
  }

  /* ── filtered list ── */
  const visible = clientes.filter(c => {
    const matchSearch = !search ||
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.marca.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchEstado = filterEstado === 'all' || c.estado === filterEstado
    return matchSearch && matchEstado
  })

  /* ── stats ── */
  const total     = clientes.length
  const activos   = clientes.filter(c => c.estado === 'activo').length
  const pausados  = clientes.filter(c => c.estado === 'pausado').length
  const prospectos= clientes.filter(c => c.estado === 'prospecto').length
  const pendSol   = clientes.reduce((n, c) => n + c.solicitudes.filter(s => s.estado === 'pendiente').length, 0)
  const conPortal = clientes.filter(c => c.access_token).length
  const facturacionActiva = clientes
    .filter(c => c.estado === 'activo')
    .reduce((sum, c) => sum + parseValorCOP(c.valor_contrato), 0)
  const ticketPromedio = activos > 0 ? Math.round(facturacionActiva / activos) : 0

  /* ── Portal URL helper ── */
  const PORTAL_BASE = 'https://almaagenciacreativa.com/cliente/'

  /* ══ RENDER ═══════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh', padding: isMobile ? '20px 16px' : '32px 36px' }}>

        {/* ── Header compacto ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          paddingBottom: '20px', borderBottom: `0.5px solid ${BDR}`, marginBottom: '28px',
          flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>
              ALMA · AGENCIA CREATIVA
            </p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>
              Clientes
            </h1>
          </div>
          <button
            onClick={handleNew}
            style={{
              background: `linear-gradient(135deg, ${C1}, ${ACC2})`, color: '#fff',
              border: 'none', cursor: 'pointer',
              padding: '10px 22px', borderRadius: '4px', fontWeight: 700, fontSize: '12px',
              display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0,
              letterSpacing: '0.08em',
            }}
          >
            + Nuevo cliente
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(5,1fr)', gap: '14px', marginBottom: '16px' }}>
          {([
            { lbl: 'Activos',     val: String(activos),            sub: `${pausados} paus. · ${prospectos} prosp.`, col: GRN, ico: '✦' },
            { lbl: 'Total',       val: String(total),              sub: 'todos los estados',                         col: WHT,        ico: '◈' },
            { lbl: 'Con portal',  val: String(conPortal),          sub: `${total - conPortal} sin acceso`,           col: ACC2,       ico: '◎' },
            { lbl: 'Solicitudes', val: String(pendSol),            sub: 'solicitudes abiertas',                      col: pendSol > 0 ? ROSE : MUT, ico: '!' },
            { lbl: 'Facturación', val: fmtCOP(facturacionActiva),  sub: `Ticket prom. ${fmtCOP(ticketPromedio)}`,    col: ACC2,       ico: '$' },
          ] as { lbl: string; val: string; sub: string; col: string; ico: string }[]).map(m => (
            <div key={m.lbl} style={{
              background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px',
              padding: '18px 18px 14px', position: 'relative', overflow: 'hidden',
            }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>
                {m.lbl}
              </p>
              <p style={{ fontSize: '28px', fontWeight: 300, color: m.col, margin: '0 0 5px', lineHeight: 1 }}>
                {m.val}
              </p>
              <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>{m.sub}</p>
              <span style={{ position: 'absolute', bottom: 0, right: '10px', fontSize: '44px', color: GHOST, lineHeight: 1, fontWeight: 300, userSelect: 'none', pointerEvents: 'none' }}>
                {m.ico}
              </span>
            </div>
          ))}
        </div>

        {/* ── Barra de cartera ── */}
        {total > 0 && (
          <div style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '12px 20px', marginBottom: '24px', display: 'flex', gap: isMobile ? '16px' : '28px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, flexShrink: 0 }}>Cartera</span>
            {([
              { label: 'Activos',    val: activos,    col: GRN },
              { label: 'Pausados',   val: pausados,   col: AMB },
              { label: 'Prospectos', val: prospectos, col: ACC2 },
            ] as { label: string; val: number; col: string }[]).map(({ label, val, col }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '120px' }}>
                <span style={{ fontSize: '9px', color: MUT, minWidth: '62px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
                <div style={{ flex: 1, height: '3px', background: BDR, borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: col, borderRadius: '2px', width: total > 0 ? `${Math.round((val / total) * 100)}%` : '0%' }} />
                </div>
                <span style={{ fontSize: '12px', color: col, minWidth: '16px', textAlign: 'right' }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Filtros ── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca o email…"
            style={{
              flex: 1, minWidth: '220px', padding: '9px 14px', borderRadius: '4px',
              border: `0.5px solid ${BDR2}`, fontSize: '13px', outline: 'none',
              background: DIM, color: WHT,
            }}
          />
          <select
            value={filterEstado} onChange={e => setFilterEstado(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, fontSize: '13px', background: DIM, color: WHT }}
          >
            <option value="all">Todos los estados</option>
            {CLIENTE_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.icon} {e.label}</option>)}
          </select>
        </div>

        {/* ── Lista ── */}
        {loading ? (
          <ListSkeleton rows={6} />
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', color: BDR }}>✦</div>
            <p style={{ color: MUT, fontSize: '14px' }}>
              {clientes.length === 0 ? 'No hay clientes registrados.' : 'Sin resultados para ese filtro.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(290px, 1fr))',
            gap: '14px',
          }}>
            {visible.map(c => (
              <ClienteCard
                key={c._id}
                cliente={c}
                onEdit={() => handleEdit(c)}
                onDelete={() => handleDelete(c._id!)}
                portalBase={PORTAL_BASE}
              />
            ))}
          </div>
        )}
      </div>


      {/* ══ MODAL ═════════════════════════════════════════════ */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          zIndex: 300, display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
        }}>
          <div style={{
            background: DIM, width: isMobile ? '100%' : '720px',
            maxWidth: '100%', display: 'flex', flexDirection: 'column',
            boxShadow: '-8px 0 40px rgba(34,22,54,0.18)',
            overflowY: 'auto',
          }}>
            {/* Modal header */}
            <div style={{
              background: DIM, padding: '18px 24px',
              borderBottom: `0.5px solid ${BDR}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', top: 0, zIndex: 10, flexShrink: 0,
            }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: WHT, letterSpacing: '-0.3px' }}>
                {editId ? `${form.marca || 'Cliente'}` : '+ Nuevo cliente'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', cursor: 'pointer', color: MUT, lineHeight: 1 }}>✕</button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex', background: DIM,
              borderBottom: `0.5px solid ${BDR}`,
              overflowX: 'auto', flexShrink: 0,
            }}>
              {([
                { key: 'perfil',      label: '👤 Perfil' },
                { key: 'estrategia',  label: '🗂️ Tablero & Estrategia' },
                { key: 'parrilla',    label: `📅 Parrilla (${form.parrilla.length})` },
                { key: 'solicitudes', label: `💬 Solicitudes (${form.solicitudes.length})` },
                { key: 'metricas',    label: `📊 Métricas (${(form.metricas_historico ?? []).length})` },
                { key: 'portal',      label: '🔗 Portal' },
                { key: 'accesos',     label: `🔐 Accesos (${(form.accesos ?? []).length})` },
              ] as { key: ModalTab; label: string }[]).map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: '11px 14px', border: 'none', background: 'none', cursor: 'pointer',
                    fontSize: '11px', fontWeight: tab === t.key ? 700 : 500,
                    color: tab === t.key ? ACC2 : MUT,
                    borderBottom: tab === t.key ? `1.5px solid ${ACC2}` : '1.5px solid transparent',
                    whiteSpace: 'nowrap', transition: 'color 0.15s',
                    letterSpacing: '0.05em',
                    marginBottom: '-0.5px',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: DIM }}>

              {/* ─ PERFIL ─ */}
              {tab === 'perfil' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <label style={labelStyle}>
                      Nombre <span style={{ color: '#EF4444' }}>*</span>
                      <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} style={inputStyle} placeholder="Nombre completo" />
                    </label>
                    <label style={labelStyle}>
                      Marca / Empresa <span style={{ color: '#EF4444' }}>*</span>
                      <input
                        value={form.marca}
                        onChange={e => setForm(f => ({ ...f, marca: e.target.value, empresa: e.target.value }))}
                        style={inputStyle}
                        placeholder="Ej: Casa Mama Hotel"
                      />
                    </label>
                    <label style={labelStyle}>
                      Email <span style={{ color: '#EF4444' }}>*</span>
                      <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="correo@ejemplo.com" />
                    </label>
                    <label style={labelStyle}>
                      Teléfono
                      <input value={form.telefono ?? ''} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} style={inputStyle} placeholder="+57 300 000 0000" />
                    </label>
                    <label style={labelStyle}>
                      Estado
                      <select value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value as Cliente['estado'] }))} style={inputStyle}>
                        {CLIENTE_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.icon} {e.label}</option>)}
                      </select>
                    </label>
                    <label style={labelStyle}>
                      Fecha de inicio
                      <input type="date" value={form.fecha_inicio ?? ''} onChange={e => setForm(f => ({ ...f, fecha_inicio: e.target.value }))} style={inputStyle} />
                    </label>
                    <label style={labelStyle}>
                      Fecha de fin
                      <input type="date" value={form.fecha_fin ?? ''} onChange={e => setForm(f => ({ ...f, fecha_fin: e.target.value }))} style={inputStyle} />
                    </label>
                    <label style={labelStyle}>
                      Valor del contrato
                      <input value={form.valor_contrato ?? ''} onChange={e => setForm(f => ({ ...f, valor_contrato: e.target.value }))} style={inputStyle} placeholder="Ej: 3.500.000" />
                    </label>
                    <label style={labelStyle}>
                      Moneda
                      <select value={form.moneda ?? 'COP'} onChange={e => setForm(f => ({ ...f, moneda: e.target.value as 'COP' | 'USD' }))} style={inputStyle}>
                        <option value="COP">COP</option>
                        <option value="USD">USD</option>
                      </select>
                    </label>
                  </div>

                  {/* Logo upload */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', alignItems: 'start' }}>
                    <div>
                      <p style={{ fontSize: '10px', fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 8px' }}>
                        Logo de la marca
                      </p>
                      {/* Preview or drop zone */}
                      <div style={{
                        position: 'relative', borderRadius: '6px', overflow: 'hidden',
                        border: `0.5px dashed ${form.logo_url ? BDR : BDR2}`,
                        background: BK,
                        minHeight: '90px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {logoUploading ? (
                          <div style={{ textAlign: 'center', padding: '16px' }}>
                            <div style={{ fontSize: '20px', marginBottom: '6px', animation: 'spin 1s linear infinite' }}>⏳</div>
                            <p style={{ fontSize: '11px', color: MUT, margin: 0 }}>Subiendo…</p>
                          </div>
                        ) : form.logo_url ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', width: '100%' }}>
                            <img
                              src={form.logo_url} alt="Logo"
                              style={{ height: '52px', width: '52px', objectFit: 'contain', borderRadius: '6px', background: INPUT_BG, padding: '4px', border: `0.5px solid ${BDR2}`, flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ margin: '0 0 4px', fontSize: '12px', color: WHT, fontWeight: 600 }}>Logo cargado ✓</p>
                              <p style={{ margin: '0 0 6px', fontSize: '10px', color: MUT }}>Se muestra en el portal</p>
                              <label style={{ cursor: 'pointer' }}>
                                <span style={{ fontSize: '10px', color: ACC2, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'underline' }}>
                                  Cambiar
                                </span>
                                <input type="file" accept="image/*" style={{ display: 'none' }}
                                  onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = '' }}
                                />
                              </label>
                            </div>
                            <button
                              onClick={() => setForm(f => ({ ...f, logo_url: '' }))}
                              style={{ background: 'none', border: 'none', color: ROSE, cursor: 'pointer', fontSize: '16px', flexShrink: 0, lineHeight: 1, padding: '4px' }}
                              title="Quitar logo"
                            >×</button>
                          </div>
                        ) : (
                          <label style={{ cursor: 'pointer', textAlign: 'center', padding: '20px', display: 'block', width: '100%' }}>
                            <div style={{ fontSize: '24px', marginBottom: '6px' }}>🖼️</div>
                            <p style={{ fontSize: '12px', color: ACC2, fontWeight: 700, margin: '0 0 2px' }}>Subir logo</p>
                            <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>PNG, JPG, SVG, WEBP</p>
                            <input type="file" accept="image/*" style={{ display: 'none' }}
                              onChange={e => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); e.target.value = '' }}
                            />
                          </label>
                        )}
                      </div>
                      {logoError && <p style={{ fontSize: '11px', color: ROSE, margin: '6px 0 0' }}>{logoError}</p>}
                    </div>
                    <label style={labelStyle}>
                      URL del contrato
                      <input value={form.contrato_url ?? ''} onChange={e => setForm(f => ({ ...f, contrato_url: e.target.value }))} style={inputStyle} placeholder="https://drive.google.com/…" />
                    </label>
                  </div>

                  {/* Servicios */}
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#374151', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Servicios contratados</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
                      {SERVICIOS_DISPONIBLES.map(s => {
                        const active = form.servicios.includes(s)
                        return (
                          <button key={s} onClick={() => setForm(f => ({
                            ...f,
                            servicios: active ? f.servicios.filter(x => x !== s) : [...f.servicios, s],
                          }))} style={{
                            padding: '5px 12px', borderRadius: '20px', border: '1.5px solid',
                            borderColor: active ? C1 : '#E5E7EB',
                            background: active ? C1_BG : '#fff',
                            color: active ? C1 : '#6B7280',
                            fontSize: '12px', fontWeight: active ? 700 : 500,
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Servicios adicionales */}
                  <div style={{ background: BK, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '16px' }}>
                    <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: AMB, margin: '0 0 14px' }}>
                      Servicios adicionales
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      {/* Acompañamiento a eventos */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: DIM, border: `0.5px solid ${BDR2}`, borderRadius: '4px', cursor: 'pointer' }}
                        onClick={() => setForm(f => ({ ...f, acomp_eventos: !f.acomp_eventos }))}>
                        <div style={{
                          width: '18px', height: '18px', borderRadius: '3px', flexShrink: 0,
                          background: form.acomp_eventos ? C1 : 'transparent',
                          border: `1.5px solid ${form.acomp_eventos ? C1 : BDR2}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}>
                          {form.acomp_eventos && <span style={{ color: '#fff', fontSize: '11px', lineHeight: 1 }}>✓</span>}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', color: WHT, fontWeight: 600 }}>🎪 Acomp. a eventos</p>
                          <p style={{ margin: 0, fontSize: '10px', color: MUT }}>Incluido en el plan</p>
                        </div>
                      </div>
                      {/* Grabaciones programadas */}
                      <label style={labelStyle}>
                        🎬 Grabaciones / mes
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input
                            type="number" min={0}
                            value={form.grabaciones_mes ?? 0}
                            onChange={e => setForm(f => ({ ...f, grabaciones_mes: parseInt(e.target.value) || 0 }))}
                            style={{ ...inputStyle, width: '80px', textAlign: 'center' }}
                          />
                          <span style={{ fontSize: '11px', color: MUT }}>sesiones programadas</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Notas internas */}
                  <div>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#92400E', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📝 Notas internas</p>
                    <textarea
                      value={form.notas ?? ''}
                      onChange={e => setForm(f => ({ ...f, notas: e.target.value }))}
                      rows={3}
                      placeholder="Solo visible para el equipo de Alma…"
                      style={{ ...inputStyle, resize: 'vertical', background: '#FEFCE8', borderColor: '#FDE68A' }}
                    />
                  </div>
                </div>
              )}

              {/* ─ PARRILLA ─ */}
              {tab === 'parrilla' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

                  {/* ── Editor de ítem activo ── */}
                  {editingParrillaId && (() => {
                    const ep = editingParrillaData
                    const pilarInfo = PILARES_CONTENIDO.find(x => x.value === ep.pilar)
                    return (
                      <div style={{ background: '#fff', border: `2px solid ${C1}`, borderRadius: '16px', padding: '20px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <p style={{ margin: 0, fontWeight: 900, fontSize: '14px', color: C1 }}>
                            ✏️ Editando ítem {ep.dia_num ? `#${ep.dia_num}` : ''}
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={saveEditParrilla} style={{ padding: '7px 18px', borderRadius: '8px', background: C1, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Guardar cambios</button>
                            <button onClick={() => setEditingParrillaId(null)} style={{ padding: '7px 14px', borderRadius: '8px', background: '#F3F4F6', color: '#6B7280', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px' }}>Cancelar</button>
                          </div>
                        </div>

                        {/* Fila 1: Día, Semana, Fecha, Hora, Red, Tipo, Duración */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '10px', marginBottom: '12px' }}>
                          <label style={labelStyle}>
                            Día #
                            <input type="number" value={ep.dia_num ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, dia_num: e.target.value ? +e.target.value : undefined }))} style={inputStyle} placeholder="1" min={1} />
                          </label>
                          <label style={labelStyle}>
                            Semana
                            <input type="number" value={ep.semana ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, semana: e.target.value ? +e.target.value : undefined }))} style={inputStyle} placeholder="1" min={1} />
                          </label>
                          <label style={labelStyle}>
                            Fecha *
                            <input type="date" value={ep.fecha ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, fecha: e.target.value }))} style={inputStyle} />
                          </label>
                          <label style={labelStyle}>
                            Hora
                            <input type="time" value={ep.hora ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, hora: e.target.value || undefined }))} style={inputStyle} />
                          </label>
                          <label style={labelStyle}>
                            Red
                            <select value={ep.red ?? 'Instagram'} onChange={e => setEditingParrillaData(d => ({ ...d, red: e.target.value }))} style={inputStyle}>
                              {REDES_OPCIONES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>
                            Tipo
                            <select value={ep.tipo ?? 'Reel'} onChange={e => setEditingParrillaData(d => ({ ...d, tipo: e.target.value }))} style={inputStyle}>
                              {TIPO_POST_OPCIONES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>
                            Duración
                            <select value={ep.duracion ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, duracion: e.target.value || undefined }))} style={inputStyle}>
                              {DURACION_OPCIONES.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                            </select>
                          </label>
                        </div>

                        {/* Fila 2: Hook, Subtítulo, Pilar, CTA */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                          <label style={labelStyle}>
                            Hook / Título *
                            <input value={ep.descripcion ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, descripcion: e.target.value }))} style={inputStyle} placeholder="El gancho principal del post" />
                          </label>
                          <label style={labelStyle}>
                            Subtítulo
                            <input value={ep.subtitulo ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, subtitulo: e.target.value }))} style={inputStyle} placeholder="Descripción adicional…" />
                          </label>
                          <label style={labelStyle}>
                            Pilar
                            <select value={ep.pilar ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, pilar: e.target.value || undefined }))} style={{ ...inputStyle, borderColor: pilarInfo?.color ?? '#E5E7EB', background: pilarInfo?.bg ?? '#fff' }}>
                              <option value="">Sin pilar</option>
                              {PILARES_CONTENIDO.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>
                            CTA
                            <input value={ep.cta ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, cta: e.target.value }))} style={inputStyle} placeholder='DM "HOLA"' />
                          </label>
                        </div>

                        {/* Fila 3: Estado, Link, Link Drive */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '10px', marginBottom: '16px' }}>
                          <label style={labelStyle}>
                            Estado
                            <select value={ep.estado ?? 'borrador'} onChange={e => setEditingParrillaData(d => ({ ...d, estado: e.target.value as ParrillaItem['estado'] }))} style={inputStyle}>
                              {PARRILLA_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                            </select>
                          </label>
                          <label style={labelStyle}>
                            Link publicado
                            <input value={ep.link ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, link: e.target.value }))} style={inputStyle} placeholder="https://instagram.com/p/…" />
                          </label>
                          <label style={labelStyle}>
                            🗂️ Link de Drive (material)
                            <input value={ep.link_drive ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, link_drive: e.target.value || undefined }))} style={inputStyle} placeholder="https://drive.google.com/…" />
                          </label>
                        </div>

                        {/* Contenido detallado */}
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contenido detallado para el portal</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                          <label style={labelStyle}>
                            Concepto visual + guión
                            <textarea value={ep.concepto_visual ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, concepto_visual: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Describe el concepto visual y el guión del video…\n\n"Hola, soy Sandra Poli…"'} />
                          </label>
                          <label style={labelStyle}>
                            Caption completo
                            <textarea value={ep.caption ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, caption: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Caption listo para copiar y pegar…\n\n#hashtag1 #hashtag2'} />
                          </label>
                          <label style={labelStyle}>
                            Instrucciones de publicación
                            <textarea value={ep.instrucciones ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, instrucciones: e.target.value }))} rows={6} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Una instrucción por línea:\nPublicar: Martes, 10–11am\nPinear en el perfil\nLocation tag: Bogotá'} />
                          </label>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                          <label style={labelStyle}>
                            Story del día
                            <textarea value={ep.story_del_dia ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, story_del_dia: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder={'Contenido de la story de hoy…\nEncuesta: "¿Has pensado en…?"'} />
                          </label>
                          <label style={labelStyle}>
                            Hashtags
                            <textarea value={ep.hashtags ?? ''} onChange={e => setEditingParrillaData(d => ({ ...d, hashtags: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} placeholder="#hashtag1 #hashtag2 #hashtag3" />
                          </label>
                        </div>

                        {/* Métricas */}
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#9CA3AF', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Métricas post-publicación</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
                          {([
                            { key: 'alcance',     label: 'Alcance' },
                            { key: 'impresiones', label: 'Impresiones' },
                            { key: 'likes',       label: 'Likes' },
                            { key: 'comentarios', label: 'Comentarios' },
                            { key: 'guardados',   label: 'Guardados' },
                            { key: 'compartidos', label: 'Compartidos' },
                            { key: 'clics',       label: 'Clics' },
                            { key: 'engagement',  label: 'Engagement %' },
                          ] as { key: keyof NonNullable<ParrillaItem['metricas']>; label: string }[]).map(m => (
                            <label key={m.key} style={labelStyle}>
                              {m.label}
                              <input
                                type="number" min={0} step={m.key === 'engagement' ? 0.1 : 1}
                                value={ep.metricas?.[m.key] ?? ''}
                                onChange={e => setEditingParrillaData(d => ({
                                  ...d,
                                  metricas: { ...(d.metricas ?? {}), [m.key]: e.target.value ? +e.target.value : undefined },
                                }))}
                                style={inputStyle}
                                placeholder="0"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    )
                  })()}

                  {/* ── Lista de ítems ── */}
                  {form.parrilla.length === 0 ? (
                    <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>Sin ítems en la parrilla. Agrega el primero abajo.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[...form.parrilla].sort((a, b) => {
                        if (a.dia_num && b.dia_num) return a.dia_num - b.dia_num
                        return (a.fecha ?? '').localeCompare(b.fecha ?? '')
                      }).map(p => {
                        const est      = PARRILLA_ESTADOS.find(x => x.value === p.estado)
                        const pilarInf = PILARES_CONTENIDO.find(x => x.value === p.pilar)
                        const isEdit   = editingParrillaId === p.id
                        return (
                          <div key={p.id} style={{
                            background: isEdit ? '#F0FDF4' : '#fff',
                            borderRadius: '12px', padding: '12px 14px',
                            border: `1.5px solid ${isEdit ? C1 : '#E5E7EB'}`,
                            display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap',
                          }}>
                            {/* Día # */}
                            {p.dia_num && (
                              <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 900, flexShrink: 0 }}>
                                {String(p.dia_num).padStart(2, '0')}
                              </span>
                            )}
                            {/* Formato */}
                            <span style={{ padding: '3px 8px', borderRadius: '6px', background: '#F3F4F6', color: '#374151', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                              {p.tipo}{p.duracion ? ` · ${p.duracion}` : ''}
                            </span>
                            {/* Hook */}
                            <p style={{ flex: 1, margin: 0, fontSize: '13px', fontWeight: 700, color: '#111', minWidth: '120px' }}>{p.descripcion}</p>
                            {/* Pilar */}
                            {pilarInf && (
                              <span style={{ padding: '2px 8px', borderRadius: '6px', background: pilarInf.bg, color: pilarInf.color, fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                                {pilarInf.label}
                              </span>
                            )}
                            {/* Estado */}
                            <select
                              value={p.estado}
                              onChange={e => updateParrillaEstado(p.id, e.target.value as ParrillaItem['estado'])}
                              style={{ fontSize: '11px', padding: '3px 7px', borderRadius: '7px', border: `1.5px solid ${est?.color ?? '#E5E7EB'}`, background: est?.bg ?? '#F9FAFB', color: est?.color ?? '#374151', cursor: 'pointer', flexShrink: 0 }}
                            >
                              {PARRILLA_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                            </select>
                            {/* Acciones */}
                            <button onClick={() => isEdit ? setEditingParrillaId(null) : openEditParrilla(p)} style={{ padding: '5px 12px', borderRadius: '7px', border: `1.5px solid ${C1}`, background: isEdit ? C1 : '#fff', color: isEdit ? '#fff' : C1, cursor: 'pointer', fontWeight: 700, fontSize: '11px', flexShrink: 0 }}>
                              {isEdit ? '✓ Editando' : '✏️ Editar'}
                            </button>
                            <button onClick={() => removeParrillaItem(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: '18px', flexShrink: 0, lineHeight: 1 }}>×</button>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* ── Formulario agregar nuevo ── */}
                  <div style={{ background: '#F0FDF4', border: '1.5px dashed #86EFAC', borderRadius: '14px', padding: '18px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: C1, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>+ Agregar a la parrilla</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '10px', marginBottom: '10px' }}>
                      <label style={labelStyle}>
                        Día #
                        <input type="number" value={newP.dia_num ?? ''} onChange={e => setNewP(n => ({ ...n, dia_num: e.target.value ? +e.target.value : undefined }))} style={inputStyle} placeholder="1" min={1} />
                      </label>
                      <label style={labelStyle}>
                        Semana
                        <input type="number" value={newP.semana ?? ''} onChange={e => setNewP(n => ({ ...n, semana: e.target.value ? +e.target.value : undefined }))} style={inputStyle} placeholder="1" min={1} />
                      </label>
                      <label style={labelStyle}>
                        Fecha *
                        <input type="date" value={newP.fecha ?? ''} onChange={e => setNewP(n => ({ ...n, fecha: e.target.value }))} style={inputStyle} />
                      </label>
                      <label style={labelStyle}>
                        Hora
                        <input type="time" value={newP.hora ?? ''} onChange={e => setNewP(n => ({ ...n, hora: e.target.value || undefined }))} style={inputStyle} />
                      </label>
                      <label style={labelStyle}>
                        Red
                        <select value={newP.red ?? 'Instagram'} onChange={e => setNewP(n => ({ ...n, red: e.target.value }))} style={inputStyle}>
                          {REDES_OPCIONES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Tipo
                        <select value={newP.tipo ?? 'Reel'} onChange={e => setNewP(n => ({ ...n, tipo: e.target.value }))} style={inputStyle}>
                          {TIPO_POST_OPCIONES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Duración
                        <select value={newP.duracion ?? ''} onChange={e => setNewP(n => ({ ...n, duracion: e.target.value || undefined }))} style={inputStyle}>
                          {DURACION_OPCIONES.map(o => <option key={o} value={o}>{o || '—'}</option>)}
                        </select>
                      </label>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.5fr', gap: '10px', marginBottom: '10px' }}>
                      <label style={labelStyle}>
                        Hook / Título *
                        <input value={newP.descripcion ?? ''} onChange={e => setNewP(n => ({ ...n, descripcion: e.target.value }))} style={inputStyle} placeholder="El gancho principal del post" />
                      </label>
                      <label style={labelStyle}>
                        Pilar
                        <select value={newP.pilar ?? ''} onChange={e => setNewP(n => ({ ...n, pilar: e.target.value || undefined }))} style={inputStyle}>
                          <option value="">Sin pilar</option>
                          {PILARES_CONTENIDO.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        Estado
                        <select value={newP.estado ?? 'borrador'} onChange={e => setNewP(n => ({ ...n, estado: e.target.value as ParrillaItem['estado'] }))} style={inputStyle}>
                          {PARRILLA_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                        </select>
                      </label>
                      <label style={labelStyle}>
                        🗂️ Link de Drive (material)
                        <input value={newP.link_drive ?? ''} onChange={e => setNewP(n => ({ ...n, link_drive: e.target.value || undefined }))} style={inputStyle} placeholder="https://drive.google.com/…" />
                      </label>
                    </div>
                    <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '0 0 10px' }}>
                      💡 Después de agregar, haz clic en <strong>✏️ Editar</strong> para rellenar el caption, concepto visual, instrucciones y métricas.
                    </p>
                    <button onClick={addParrillaItem} style={{
                      background: C1, color: '#fff', border: 'none', cursor: 'pointer',
                      padding: '9px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px',
                    }}>
                      Agregar ítem
                    </button>
                  </div>
                </div>
              )}

              {/* ─ SOLICITUDES ─ */}
              {tab === 'solicitudes' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {form.solicitudes.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                      <p style={{ fontSize: '32px', margin: '0 0 10px' }}>💬</p>
                      <p style={{ color: '#9CA3AF', fontSize: '13px' }}>El cliente aún no ha enviado solicitudes.<br />Aparecerán aquí cuando lo haga desde su portal.</p>
                    </div>
                  ) : (
                    form.solicitudes.map(s => {
                      const tipo = SOLICITUD_TIPOS.find(t => t.value === s.tipo)
                      const est  = SOLICITUD_ESTADOS.find(x => x.value === s.estado)
                      return (
                        <div key={s.id} style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: `1.5px solid ${est?.color ?? '#E5E7EB'}20` }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ padding: '3px 10px', borderRadius: '20px', background: (tipo?.color ?? '#6B7280') + '20', color: tipo?.color ?? '#6B7280', fontSize: '11.5px', fontWeight: 700 }}>{tipo?.label ?? s.tipo}</span>
                              <select
                                value={s.estado}
                                onChange={e => {
                                  const newEst = e.target.value as Solicitud['estado']
                                  setForm(f => ({
                                    ...f,
                                    solicitudes: f.solicitudes.map(x => x.id === s.id ? { ...x, estado: newEst } : x),
                                  }))
                                }}
                                style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '8px', border: `1.5px solid ${est?.color ?? '#E5E7EB'}`, background: est?.bg ?? '#F9FAFB', color: est?.color ?? '#374151', cursor: 'pointer' }}
                              >
                                {SOLICITUD_ESTADOS.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}
                              </select>
                            </div>
                            {!!s.createdAt && <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{String(s.createdAt).slice(0, 10)}</span>}
                          </div>
                          <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 8px' }}>{s.descripcion}</p>
                          {s.material_ref && <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 10px' }}>Ref: {s.material_ref}</p>}
                          <textarea
                            value={respuestas[s.id] ?? s.respuesta ?? ''}
                            onChange={e => setRespuestas(r => ({ ...r, [s.id]: e.target.value }))}
                            placeholder="Respuesta del equipo Alma…"
                            rows={2}
                            style={{ ...inputStyle, resize: 'vertical', marginBottom: '8px' }}
                          />
                          <button onClick={() => saveSolicitudRespuesta(s)} style={{
                            padding: '6px 16px', borderRadius: '8px', border: 'none',
                            background: C1, color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '12px',
                          }}>
                            Guardar respuesta
                          </button>
                        </div>
                      )
                    })
                  )}
                </div>
              )}

              {/* ─ MÉTRICAS MENSUALES ─ */}
              {tab === 'metricas' && (() => {
                const hist = [...(form.metricas_historico ?? [])].sort((a, b) => b.mes.localeCompare(a.mes))
                const metKeys: { key: keyof MetricaMes; label: string; icon: string }[] = [
                  { key: 'alcance',          label: 'Alcance',      icon: '👁️' },
                  { key: 'impresiones',      label: 'Impresiones',  icon: '📡' },
                  { key: 'likes',            label: 'Likes',        icon: '❤️' },
                  { key: 'comentarios',      label: 'Comentarios',  icon: '💬' },
                  { key: 'guardados',        label: 'Guardados',    icon: '🔖' },
                  { key: 'compartidos',      label: 'Compartidos',  icon: '↗️' },
                  { key: 'seguidores',       label: 'Nuevos segs.', icon: '👥' },
                  { key: 'seguidores_total', label: 'Segs. totales', icon: '👤' },
                  { key: 'engagement',       label: 'Engagement %', icon: '📈' },
                  { key: 'posts_publicados',  label: 'Posts pub.',    icon: '✅' },
                  { key: 'pct_mujeres',       label: 'Mujeres %',     icon: '♀' },
                  { key: 'pct_hombres',       label: 'Hombres %',     icon: '♂' },
                  { key: 'pct_historias',     label: 'Historias %',   icon: '📖' },
                  { key: 'pct_publicaciones', label: 'Publicac. %',   icon: '📝' },
                  { key: 'pct_reels',         label: 'Reels %',       icon: '🎬' },
                  { key: 'visitas_perfil',    label: 'Visitas perfil', icon: '🔍' },
                  { key: 'clics_enlace',      label: 'Clics enlace',  icon: '🔗' },
                ]
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                    {/* Tabla de meses */}
                    {hist.length === 0 ? (
                      <p style={{ color: '#9CA3AF', fontSize: '13px', textAlign: 'center', padding: '20px 0' }}>Sin métricas aún. Agrega el primero abajo.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {hist.map(m => {
                          const [y, mo] = m.mes.split('-')
                          const label = new Date(+y, +mo - 1, 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
                          const isEditing = editMes === m.mes
                          return (
                            <div key={m.mes} style={{ background: '#fff', borderRadius: '12px', border: `1.5px solid ${isEditing ? C1 : '#E5E7EB'}`, overflow: 'hidden' }}>
                              <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                                <p style={{ margin: 0, fontSize: '13px', fontWeight: 800, color: '#111', textTransform: 'capitalize', minWidth: '130px' }}>{label}</p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', flex: 1 }}>
                                  {m.alcance     ? <span style={{ fontSize: '12px', color: '#6B7280' }}>👁️ {m.alcance.toLocaleString()}</span> : null}
                                  {m.likes       ? <span style={{ fontSize: '12px', color: '#6B7280' }}>❤️ {m.likes.toLocaleString()}</span> : null}
                                  {m.seguidores_total ? <span style={{ fontSize: '12px', color: '#6B7280' }}>👤 {m.seguidores_total.toLocaleString()}</span> : null}
                                  {m.seguidores  ? <span style={{ fontSize: '12px', color: '#6B7280' }}>👥 +{m.seguidores}</span> : null}
                                  {m.engagement  ? <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>📈 {m.engagement}%</span> : null}
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <button onClick={() => startEditMes(m)} style={{ padding: '4px 10px', borderRadius: '7px', border: `1.5px solid ${C1}`, background: isEditing ? C1 : '#fff', color: isEditing ? '#fff' : C1, cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>✏️ Editar</button>
                                  <button onClick={() => removeMetricaMes(m.mes)} style={{ padding: '4px 8px', borderRadius: '7px', border: '1.5px solid #FEE2E2', background: '#fff', color: '#EF4444', cursor: 'pointer', fontWeight: 700, fontSize: '11px' }}>×</button>
                                </div>
                              </div>
                              {isEditing && (
                                <div style={{ padding: '14px', borderTop: '1px solid #F3F4F6', background: '#F9FAFB' }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '10px' }}>
                                    {metKeys.map(k => (
                                      <label key={String(k.key)} style={labelStyle}>
                                        {k.icon} {k.label}
                                        <input
                                          type="number" min={0} step={(['engagement','pct_mujeres','pct_hombres','pct_historias','pct_publicaciones','pct_reels'] as string[]).includes(k.key as string) ? 0.1 : 1}
                                          value={(newMes[k.key] as number | undefined) ?? ''}
                                          onChange={e => setNewMes(n => ({ ...n, [k.key]: e.target.value ? +e.target.value : undefined }))}
                                          style={inputStyle} placeholder="0"
                                        />
                                      </label>
                                    ))}
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                    <label style={labelStyle}>
                                      👶 Edad principal
                                      <input value={newMes.edad_principal ?? ''} onChange={e => setNewMes(n => ({ ...n, edad_principal: e.target.value || undefined }))} style={inputStyle} placeholder="25-34" />
                                    </label>
                                    <label style={labelStyle}>
                                      📍 Ciudad top
                                      <input value={newMes.ciudad_top ?? ''} onChange={e => setNewMes(n => ({ ...n, ciudad_top: e.target.value || undefined }))} style={inputStyle} placeholder="Manizales" />
                                    </label>
                                  </div>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={upsertMetricaMes} style={{ padding: '8px 18px', borderRadius: '9px', background: C1, color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px' }}>Guardar cambios</button>
                                    <button onClick={() => { setEditMes(null); setNewMes({ mes: '' }) }} style={{ padding: '8px 14px', borderRadius: '9px', border: '1.5px solid #E5E7EB', background: '#fff', color: '#6B7280', cursor: 'pointer', fontWeight: 700, fontSize: '12.5px' }}>Cancelar</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Formulario agregar nuevo mes */}
                    {!editMes && (
                      <div style={{ background: '#F0FDF4', border: '1.5px dashed #86EFAC', borderRadius: '14px', padding: '18px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 800, color: C1, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>+ Agregar mes</p>
                        <label style={{ ...labelStyle, marginBottom: '12px' }}>
                          Mes *
                          <input type="month" value={newMes.mes ?? ''} onChange={e => setNewMes(n => ({ ...n, mes: e.target.value }))} style={inputStyle} />
                        </label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '12px' }}>
                          {metKeys.map(k => (
                            <label key={String(k.key)} style={labelStyle}>
                              {k.icon} {k.label}
                              <input
                                type="number" min={0} step={(['engagement','pct_mujeres','pct_hombres','pct_historias','pct_publicaciones','pct_reels'] as string[]).includes(k.key as string) ? 0.1 : 1}
                                value={(newMes[k.key] as number | undefined) ?? ''}
                                onChange={e => setNewMes(n => ({ ...n, [k.key]: e.target.value ? +e.target.value : undefined }))}
                                style={inputStyle} placeholder="0"
                              />
                            </label>
                          ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                          <label style={labelStyle}>
                            👶 Edad principal
                            <input value={newMes.edad_principal ?? ''} onChange={e => setNewMes(n => ({ ...n, edad_principal: e.target.value || undefined }))} style={inputStyle} placeholder="25-34" />
                          </label>
                          <label style={labelStyle}>
                            📍 Ciudad top
                            <input value={newMes.ciudad_top ?? ''} onChange={e => setNewMes(n => ({ ...n, ciudad_top: e.target.value || undefined }))} style={inputStyle} placeholder="Manizales" />
                          </label>
                        </div>
                        <button onClick={upsertMetricaMes} disabled={!newMes.mes} style={{ background: newMes.mes ? C1 : '#9CA3AF', color: '#fff', border: 'none', cursor: newMes.mes ? 'pointer' : 'default', padding: '9px 20px', borderRadius: '10px', fontWeight: 700, fontSize: '13px' }}>
                          Agregar mes
                        </button>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ─ PORTAL ─ */}
              {tab === 'portal' && (() => {
                const slug        = form.access_token || (form.marca ? marcaToSlug(form.marca) : '')
                const portalUrl   = slug ? `${PORTAL_BASE}${slug}` : ''
                const isExistente = !!form.access_token
                return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* URL */}
                  <div style={{ background: '#F0FDF4', borderRadius: '14px', padding: '20px', border: '1.5px solid #86EFAC' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: C1, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>🔗 Enlace del portal del cliente</p>
                    {slug ? (
                      <>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <code style={{
                            flex: 1, background: '#fff', border: '1px solid #D1FAE5',
                            borderRadius: '8px', padding: '9px 12px', fontSize: '13px',
                            color: '#065F46', wordBreak: 'break-all', fontWeight: 700,
                          }}>
                            {portalUrl}
                          </code>
                          {isExistente && (
                            <button
                              onClick={() => navigator.clipboard.writeText(portalUrl)}
                              style={{ padding: '9px 14px', borderRadius: '8px', border: `1.5px solid ${C1}`, background: '#fff', color: C1, cursor: 'pointer', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}
                            >
                              📋 Copiar
                            </button>
                          )}
                        </div>
                        <p style={{ fontSize: '12px', color: '#6B7280', marginTop: '10px' }}>
                          {isExistente
                            ? 'Comparte este enlace con tu cliente. Solo quien tenga el enlace puede acceder.'
                            : '⚡ Vista previa — la URL se creará al guardar el cliente.'}
                        </p>
                      </>
                    ) : (
                      <p style={{ fontSize: '13px', color: '#9CA3AF' }}>Llena el nombre de la marca en Perfil para ver la URL del portal.</p>
                    )}
                  </div>

                  {/* Editar slug manualmente */}
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#374151', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ✏️ {isExistente ? 'URL actual del portal' : 'Personalizar URL (opcional)'}
                    </p>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#9CA3AF', flexShrink: 0 }}>almaagenciacreativa.com/cliente/</span>
                      <input
                        value={form.access_token || marcaToSlug(form.marca)}
                        onChange={e => setForm(f => ({ ...f, access_token: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/--+/g, '-') }))}
                        placeholder={marcaToSlug(form.marca) || 'slug-del-cliente'}
                        style={{ ...inputStyle, flex: 1, fontFamily: 'monospace', fontSize: '13px' }}
                      />
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#9CA3AF', margin: '8px 0 0' }}>
                      Solo letras minúsculas, números y guiones. Se genera automáticamente de la marca.
                    </p>
                  </div>

                  {isExistente && (
                    <div style={{ background: '#FFF7ED', borderRadius: '14px', padding: '18px', border: '1.5px solid #FED7AA' }}>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#92400E', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>⚠️ Cambiar URL</p>
                      <p style={{ fontSize: '12.5px', color: '#B45309', margin: 0 }}>
                        Si cambias la URL, el enlace anterior dejará de funcionar. El cliente necesitará el nuevo enlace.
                      </p>
                    </div>
                  )}

                  {/* Resumen del cliente */}
                  <div style={{ background: '#fff', borderRadius: '14px', padding: '18px', border: '1px solid #E5E7EB' }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#374151', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resumen</p>
                    {[
                      { label: 'Nombre', value: form.nombre || '—' },
                      { label: 'Marca', value: form.marca || '—' },
                      { label: 'Email', value: form.email || '—' },
                      { label: 'Estado', value: CLIENTE_ESTADOS.find(e => e.value === form.estado)?.label ?? form.estado },
                      { label: 'Servicios', value: form.servicios.length > 0 ? form.servicios.join(', ') : '—' },
                      { label: 'Meses en tablero', value: String((form.parrilla_meses ?? []).length) },
                      { label: 'Items en parrilla', value: String(form.parrilla.length) },
                      { label: 'Solicitudes', value: String(form.solicitudes.length) },
                    ].map(row => (
                      <div key={row.label} style={{ display: 'flex', gap: '12px', padding: '7px 0', borderBottom: '1px solid #F9FAFB' }}>
                        <span style={{ color: '#9CA3AF', fontSize: '12px', fontWeight: 600, minWidth: '120px', flexShrink: 0 }}>{row.label}</span>
                        <span style={{ color: '#374151', fontSize: '12.5px' }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )})()}

              {/* ─ ESTRATEGIA ─ */}
              {tab === 'estrategia' && (() => {
                const amFields: { key: keyof AnalisisMarca; label: string; rows: number; placeholder: string }[] = [
                  { key: 'resumen',      label: 'Resumen de la marca',       rows: 3, placeholder: 'Descripción general de la marca…' },
                  { key: 'colores',      label: 'Colores',                   rows: 1, placeholder: 'Verde Oliva #4A4A1E · Ámbar #C9A84C' },
                  { key: 'tipografias',  label: 'Tipografías',               rows: 1, placeholder: 'Display: Lora · Cuerpo: Montserrat' },
                  { key: 'voz_si',       label: 'Voz de la marca — SÍ',      rows: 2, placeholder: 'Cercana · Inspiradora · Educativa' },
                  { key: 'voz_no',       label: 'Voz de la marca — NO',      rows: 2, placeholder: 'Formal · Técnica · Excluyente' },
                  { key: 'fortalezas',   label: 'Fortalezas',                rows: 2, placeholder: '' },
                  { key: 'brechas',      label: 'Brechas / Oportunidades',   rows: 2, placeholder: '' },
                  { key: 'bio_actual',   label: 'Bio actual',                rows: 2, placeholder: 'Bio que tiene actualmente en redes…' },
                  { key: 'bio_propuesta',label: 'Bio propuesta',             rows: 2, placeholder: 'Nueva bio recomendada…' },
                ]
                const sectionHdr = (label: string) => (
                  <p style={{ fontSize: '10px', fontWeight: 700, color: ACC2, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px', borderBottom: `0.5px solid ${BDR}`, paddingBottom: '8px' }}>
                    {label}
                  </p>
                )
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                    {/* ── Plan del mes ── */}
                    <div>
                      {sectionHdr('📦 Plan del mes')}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <label style={labelStyle}>
                          Nombre del plan
                          <input value={form.plan_mes?.nombre ?? ''} onChange={e => setForm(f => ({ ...f, plan_mes: { ...f.plan_mes, nombre: e.target.value } }))} style={inputStyle} placeholder="Ej: Plan Esencial" />
                        </label>
                        <label style={labelStyle}>
                          Período
                          <input value={form.plan_mes?.periodo ?? ''} onChange={e => setForm(f => ({ ...f, plan_mes: { ...f.plan_mes, periodo: e.target.value } }))} style={inputStyle} placeholder="Ej: Julio 2026" />
                        </label>
                        <label style={labelStyle}>
                          Valor
                          <input value={form.plan_mes?.valor ?? ''} onChange={e => setForm(f => ({ ...f, plan_mes: { ...f.plan_mes, valor: e.target.value } }))} style={inputStyle} placeholder="Ej: $1.500.000 COP" />
                        </label>
                      </div>
                      <label style={{ ...labelStyle, marginTop: '12px' }}>
                        Qué incluye (una línea = un ítem)
                        <textarea
                          value={(form.plan_mes?.incluye ?? []).join('\n')}
                          onChange={e => setForm(f => ({ ...f, plan_mes: { ...f.plan_mes, incluye: e.target.value.split('\n') } }))}
                          onBlur={() => setForm(f => ({ ...f, plan_mes: { ...f.plan_mes, incluye: (f.plan_mes?.incluye ?? []).filter(l => l.trim()) } }))}
                          rows={5}
                          placeholder={'8 posts mensuales\n4 reels\n2 stories diarias\n1 informe de resultados'}
                          style={{ ...inputStyle, resize: 'vertical', marginTop: '4px' }}
                        />
                      </label>
                      <label style={{ ...labelStyle, marginTop: '10px' }}>
                        Notas para el cliente
                        <textarea
                          value={form.plan_mes?.notas ?? ''}
                          onChange={e => setForm(f => ({ ...f, plan_mes: { ...f.plan_mes, notas: e.target.value } }))}
                          rows={2}
                          placeholder="Notas adicionales…"
                          style={{ ...inputStyle, resize: 'vertical', marginTop: '4px' }}
                        />
                      </label>
                    </div>

                    {/* ── Análisis de marca ── */}
                    <div>
                      {sectionHdr('🎨 Análisis de marca')}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {amFields.map(field => (
                          <label key={String(field.key)} style={labelStyle}>
                            {field.label}
                            <textarea
                              value={form.analisis_marca?.[field.key] ?? ''}
                              onChange={e => setForm(f => ({ ...f, analisis_marca: { ...f.analisis_marca, [field.key]: e.target.value } }))}
                              rows={field.rows}
                              placeholder={field.placeholder}
                              style={{ ...inputStyle, resize: 'vertical', marginTop: '4px' }}
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* ── Tablero de Contenido por meses (primero: es lo que ve el cliente) ── */}
                    <div style={{ order: -1 }}>
                      {sectionHdr('🗂️ Tablero de Contenido — espacios del mes')}
                      <p style={{ fontSize: '12px', color: MUT, margin: '-4px 0 14px', lineHeight: 1.6 }}>
                        Cada mes que agregues aquí aparece como columna en el portal del cliente. Dentro de cada mes pega los enlaces de Google&nbsp;Drive de <strong style={{ color: WHT }}>Post/Carruseles</strong>, <strong style={{ color: WHT }}>Reels</strong> e <strong style={{ color: WHT }}>Historias</strong> (esos son los “espacios” que el cliente abre), la estrategia en HTML y los extras.
                      </p>

                      {/* Lista de meses existentes */}
                      {(form.parrilla_meses ?? []).length > 0 && (
                        <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'16px' }}>
                          {[...(form.parrilla_meses ?? [])].sort((a, b) => a.mes.localeCompare(b.mes)).map(mes => {
                            const isOpen = expandedTrelloMesId === mes.id
                            const extraInit = newExtraData[mes.id] ?? { label:'', url:'', nota:'' }
                            return (
                              <div key={mes.id} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius:'8px', overflow:'hidden' }}>
                                {/* Cabecera del mes */}
                                <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', cursor:'pointer' }}
                                  onClick={() => setExpandedTrelloMesId(isOpen ? null : mes.id)}>
                                  <span style={{ fontSize:'16px' }}>📅</span>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <p style={{ margin:0, fontSize:'13px', color:WHT, fontWeight:700 }}>{mes.label}</p>
                                    <p style={{ margin:'1px 0 0', fontSize:'11px', color:MUT }}>{mes.mes}</p>
                                  </div>
                                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                                    {mes.html_contenido && <span style={{ fontSize:'10px', background:'rgba(107,33,168,0.25)', color:ACC2, padding:'2px 6px', borderRadius:'4px', fontWeight:700 }}>HTML ✓</span>}
                                    {(mes.drive_links?.post || mes.drive_links?.carrusel || mes.drive_links?.reels) && <span style={{ fontSize:'10px', background:'rgba(5,150,105,0.2)', color:GRN, padding:'2px 6px', borderRadius:'4px', fontWeight:700 }}>Drive ✓</span>}
                                    {(mes.extras ?? []).length > 0 && <span style={{ fontSize:'10px', background:'rgba(217,119,6,0.2)', color:AMB, padding:'2px 6px', borderRadius:'4px', fontWeight:700 }}>{(mes.extras ?? []).length} extras</span>}
                                    <span style={{ fontSize:'13px', color:MUT, transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition:'transform 0.2s' }}>▾</span>
                                  </div>
                                  <button
                                    onClick={e => { e.stopPropagation(); removeTrelloMes(mes.id) }}
                                    style={{ padding:'3px 9px', borderRadius:'4px', border:`0.5px solid ${ROSE}40`, background:'transparent', cursor:'pointer', fontSize:'11px', color:ROSE, flexShrink:0 }}
                                  >🗑</button>
                                </div>

                                {/* Panel expandido */}
                                {isOpen && (
                                  <div style={{ borderTop:`0.5px solid ${BDR}`, padding:'14px', display:'flex', flexDirection:'column', gap:'14px' }}>

                                    {/* Editar etiqueta */}
                                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                                      <label style={labelStyle}>
                                        Etiqueta
                                        <input value={mes.label} onChange={e => updateTrelloMes(mes.id, { label: e.target.value })} style={inputStyle} placeholder="Mes 1 · Julio 2026" />
                                      </label>
                                      <label style={labelStyle}>
                                        Mes
                                        <input type="month" value={mes.mes} onChange={e => updateTrelloMes(mes.id, { mes: e.target.value })} style={inputStyle} />
                                      </label>
                                    </div>

                                    {/* Bloque 1: HTML Estrategia */}
                                    <div style={{ background:BK, border:`1px solid ${BDR2}`, borderRadius:'7px', padding:'12px' }}>
                                      <p style={{ margin:'0 0 10px', fontSize:'11px', fontWeight:700, color:C1, textTransform:'uppercase', letterSpacing:'0.5px' }}>📋 Bloque 1 — Estrategia HTML</p>
                                      <label style={labelStyle}>
                                        Título de la estrategia (opcional)
                                        <input value={mes.html_titulo ?? ''} onChange={e => updateTrelloMes(mes.id, { html_titulo: e.target.value })} style={inputStyle} placeholder="Estrategia Digital · Julio 2026" />
                                      </label>
                                      <div style={{ marginTop:'10px' }}>
                                        {mes.html_contenido ? (
                                          <div style={{ display:'flex', alignItems:'center', gap:'10px', background:DIM, border:`0.5px solid ${BDR}`, borderRadius:'6px', padding:'8px 12px' }}>
                                            <span style={{ fontSize:'14px' }}>✅</span>
                                            <p style={{ margin:0, fontSize:'12px', color:GRN, flex:1 }}>HTML cargado ({(mes.html_contenido.length / 1024).toFixed(1)} KB)</p>
                                            <button onClick={() => updateTrelloMes(mes.id, { html_contenido: undefined })} style={{ padding:'3px 8px', borderRadius:'4px', border:`0.5px solid ${ROSE}40`, background:'transparent', cursor:'pointer', fontSize:'11px', color:ROSE }}>✕ Quitar</button>
                                          </div>
                                        ) : (
                                          <label style={{ ...labelStyle }}>
                                            Subir archivo HTML
                                            <input
                                              type="file" accept=".html,text/html"
                                              disabled={trelloMesHtmlUploading === mes.id}
                                              onChange={e => { const f = e.target.files?.[0]; if (f) uploadTrelloMesHtml(mes.id, f); e.target.value = '' }}
                                              style={{ ...inputStyle, cursor:'pointer', padding:'7px 12px', marginTop:'4px' }}
                                            />
                                            {trelloMesHtmlUploading === mes.id && <span style={{ fontSize:'11px', color:ACC2, marginTop:'4px', display:'block' }}>Procesando… (comprimiendo imágenes si es necesario)</span>}
                                          </label>
                                        )}
                                        {trelloMesHtmlMsg[mes.id] && (
                                          <p style={{ margin:'6px 0 0', fontSize:'11.5px', lineHeight:1.5, color: trelloMesHtmlMsg[mes.id].ok ? GRN : ROSE }}>
                                            {trelloMesHtmlMsg[mes.id].ok ? '✅' : '⚠️'} {trelloMesHtmlMsg[mes.id].texto}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {/* Bloque 2: Drive Links */}
                                    <div style={{ background:BK, border:`1px solid ${BDR2}`, borderRadius:'7px', padding:'12px' }}>
                                      <p style={{ margin:'0 0 10px', fontSize:'11px', fontWeight:700, color:GRN, textTransform:'uppercase', letterSpacing:'0.5px' }}>🗂️ Bloque 2 — Accesos Google Drive</p>
                                      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                                        <label style={labelStyle}>
                                          POST / CARRUSELES — URL Drive
                                          <input value={mes.drive_links?.post ?? ''} onChange={e => updateTrelloMes(mes.id, { drive_links: { ...mes.drive_links, post: e.target.value || undefined } })} style={inputStyle} placeholder="https://drive.google.com/..." />
                                        </label>
                                        <label style={labelStyle}>
                                          REELS — URL Drive
                                          <input value={mes.drive_links?.reels ?? ''} onChange={e => updateTrelloMes(mes.id, { drive_links: { ...mes.drive_links, reels: e.target.value || undefined } })} style={inputStyle} placeholder="https://drive.google.com/..." />
                                        </label>
                                        <label style={labelStyle}>
                                          HISTORIAS — URL Drive
                                          <input value={mes.drive_links?.historias ?? ''} onChange={e => updateTrelloMes(mes.id, { drive_links: { ...mes.drive_links, historias: e.target.value || undefined } })} style={inputStyle} placeholder="https://drive.google.com/..." />
                                        </label>
                                      </div>
                                    </div>

                                    {/* Bloque 3: Extras */}
                                    <div style={{ background:BK, border:`1px solid ${BDR2}`, borderRadius:'7px', padding:'12px' }}>
                                      <p style={{ margin:'0 0 10px', fontSize:'11px', fontWeight:700, color:AMB, textTransform:'uppercase', letterSpacing:'0.5px' }}>📦 Bloque 3 — Extras / Otros</p>
                                      {(mes.extras ?? []).length > 0 && (
                                        <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'10px' }}>
                                          {(mes.extras ?? []).map(ex => (
                                            <div key={ex.id} style={{ display:'flex', alignItems:'center', gap:'8px', background:DIM, border:`0.5px solid ${BDR}`, borderRadius:'5px', padding:'7px 10px' }}>
                                              <div style={{ flex:1, minWidth:0 }}>
                                                <p style={{ margin:0, fontSize:'12px', color:WHT, fontWeight:600 }}>{ex.label}</p>
                                                {ex.url && <p style={{ margin:'1px 0 0', fontSize:'10px', color:MUT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ex.url}</p>}
                                                {ex.nota && <p style={{ margin:'1px 0 0', fontSize:'10px', color:MUT }}>{ex.nota}</p>}
                                              </div>
                                              <button onClick={() => removeExtraFromMes(mes.id, ex.id)} style={{ padding:'2px 7px', borderRadius:'4px', border:`0.5px solid ${ROSE}40`, background:'transparent', cursor:'pointer', fontSize:'10px', color:ROSE }}>✕</button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                      <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                                        <label style={labelStyle}>
                                          Etiqueta *
                                          <input value={extraInit.label} onChange={e => setNewExtraData(p => ({ ...p, [mes.id]: { ...extraInit, label: e.target.value } }))} style={inputStyle} placeholder="Link de referencia" />
                                        </label>
                                        <label style={labelStyle}>
                                          URL (opcional)
                                          <input value={extraInit.url} onChange={e => setNewExtraData(p => ({ ...p, [mes.id]: { ...extraInit, url: e.target.value } }))} style={inputStyle} placeholder="https://..." />
                                        </label>
                                        <label style={labelStyle}>
                                          Nota (opcional)
                                          <input value={extraInit.nota} onChange={e => setNewExtraData(p => ({ ...p, [mes.id]: { ...extraInit, nota: e.target.value } }))} style={inputStyle} placeholder="Contexto adicional" />
                                        </label>
                                        <button
                                          disabled={!extraInit.label.trim()}
                                          onClick={() => addExtraToMes(mes.id)}
                                          style={{ padding:'7px 16px', borderRadius:'6px', border:'none', background: extraInit.label.trim() ? ACC2 : BDR2, color: extraInit.label.trim() ? '#fff' : MUT, cursor: extraInit.label.trim() ? 'pointer' : 'not-allowed', fontWeight:700, fontSize:'12px', alignSelf:'flex-start' }}
                                        >+ Agregar extra</button>
                                      </div>
                                    </div>

                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Formulario nuevo mes */}
                      <div style={{ background:BK, border:`1px dashed ${BDR2}`, borderRadius:'8px', padding:'16px' }}>
                        <p style={{ fontSize:'11px', fontWeight:700, color:MUT, textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 12px' }}>+ Agregar nuevo mes al tablero</p>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                          <label style={labelStyle}>
                            Etiqueta *
                            <input value={newMesLabel2} onChange={e => setNewMesLabel2(e.target.value)} style={inputStyle} placeholder="Mes 1 · Julio 2026" />
                          </label>
                          <label style={labelStyle}>
                            Mes *
                            <input type="month" value={newMesMesValue} onChange={e => setNewMesMesValue(e.target.value)} style={inputStyle} />
                          </label>
                        </div>
                        <button
                          disabled={!newMesLabel2.trim() || !newMesMesValue}
                          onClick={addTrelloMes}
                          style={{ padding:'8px 18px', borderRadius:'6px', border:'none', background: newMesLabel2.trim() && newMesMesValue ? C1 : BDR2, color: newMesLabel2.trim() && newMesMesValue ? '#fff' : MUT, cursor: newMesLabel2.trim() && newMesMesValue ? 'pointer' : 'not-allowed', fontWeight:700, fontSize:'12px' }}
                        >+ Crear mes</button>
                      </div>

                      {/* Legacy: parrillas HTML antiguas */}
                      {(form.parrilla_htmls ?? []).length > 0 && (
                        <div style={{ marginTop:'20px' }}>
                          {sectionHdr('📅 Parrillas HTML legacy (sistema anterior)')}
                          <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'14px' }}>
                            {[...(form.parrilla_htmls ?? [])].sort((a, b) => b.mes.localeCompare(a.mes)).map(h => (
                              <div key={h.id} style={{ display:'flex', alignItems:'center', gap:'10px', background:DIM, border:`0.5px solid ${BDR}`, borderRadius:'6px', padding:'10px 14px' }}>
                                <span style={{ fontSize:'18px' }}>📄</span>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <p style={{ margin:0, fontSize:'13px', color:WHT, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{h.label}</p>
                                  <p style={{ margin:'2px 0 0', fontSize:'11px', color:MUT }}>{h.mes}</p>
                                </div>
                                <button onClick={() => removeParrillaHtml(h.id)} style={{ padding:'4px 10px', borderRadius:'4px', border:`0.5px solid ${ROSE}40`, background:'transparent', cursor:'pointer', fontSize:'11px', color:ROSE, flexShrink:0 }}>🗑 Eliminar</button>
                              </div>
                            ))}
                          </div>
                          <div style={{ background:BK, border:`1px dashed ${BDR2}`, borderRadius:'8px', padding:'16px' }}>
                            <p style={{ fontSize:'11px', fontWeight:700, color:MUT, textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 12px' }}>+ Subir parrilla HTML legacy</p>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                              <label style={labelStyle}>Etiqueta *<input value={newHtmlLabel} onChange={e => setNewHtmlLabel(e.target.value)} style={inputStyle} placeholder="Mes 1 · Julio 2026" /></label>
                              <label style={labelStyle}>Mes *<input type="month" value={newHtmlMes} onChange={e => setNewHtmlMes(e.target.value)} style={inputStyle} /></label>
                            </div>
                            <label style={labelStyle}>
                              Archivo HTML *
                              <input type="file" accept=".html,text/html" disabled={!newHtmlLabel.trim() || !newHtmlMes || htmlUploading}
                                onChange={e => { const file = e.target.files?.[0]; if (file) addParrillaHtml(file); e.target.value = '' }}
                                style={{ ...inputStyle, cursor: !newHtmlLabel.trim() || !newHtmlMes ? 'not-allowed' : 'pointer', padding:'7px 12px', marginTop:'4px' }} />
                            </label>
                            {htmlUploading && <p style={{ fontSize:'12px', color:ACC2, margin:'8px 0 0' }}>Procesando…</p>}
                            {htmlUploadError && <p style={{ fontSize:'12px', color:ROSE, margin:'8px 0 0' }}>{htmlUploadError}</p>}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                )
              })()}

              {/* ─ ACCESOS ─ */}
              {tab === 'accesos' && (() => {
                const PLAT_COLORS: Record<string, string> = {
                  instagram:'#E1306C', facebook:'#1877F2', tiktok:'#010101',
                  youtube:'#FF0000', twitter:'#1DA1F2', x:'#000',
                  linkedin:'#0A66C2', google:'#4285F4', gmail:'#EA4335',
                  canva:'#00C4CC', wordpress:'#21759B', shopify:'#96BF48',
                  mailchimp:'#FFB800', whatsapp:'#25D366', pinterest:'#E60023',
                }
                function getPlatColor(nombre: string) {
                  return PLAT_COLORS[nombre.toLowerCase().replace(/\s/g,'')] ?? ACC2
                }

                return (
                  <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', margin:'4px 0 6px' }}>
                      <span style={{ fontSize:'12px', fontWeight:800, color: WHT, letterSpacing:'0.3px' }}>🔐 Accesos y credenciales</span>
                      <div style={{ flex:1, height:'1px', background: BDR }} />
                    </div>

                    {/* Lista existente */}
                    {(form.accesos ?? []).length > 0 && (
                      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                        {(form.accesos ?? []).map(acc => {
                          const color = getPlatColor(acc.plataforma)
                          const isEditing = editAccesoId === acc.id
                          return (
                            <div key={acc.id} style={{ background: DIM, border:`0.5px solid ${BDR}`, borderLeft:`3px solid ${color}`, borderRadius:'8px', overflow:'hidden' }}>
                              {/* Cabecera */}
                              <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 14px', cursor:'pointer' }}
                                onClick={() => { setEditAccesoId(isEditing ? null : acc.id); setShowEditPwd(false) }}>
                                <div style={{ width:'28px', height:'28px', borderRadius:'6px', background:`${color}22`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', flexShrink:0, fontWeight:900, color }}>
                                  {acc.plataforma[0]?.toUpperCase()}
                                </div>
                                <div style={{ flex:1, minWidth:0 }}>
                                  <p style={{ margin:0, fontSize:'13px', color: WHT, fontWeight:700 }}>{acc.plataforma}</p>
                                  <p style={{ margin:'1px 0 0', fontSize:'11px', color: MUT, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{acc.usuario}</p>
                                </div>
                                <span style={{ fontSize:'11px', color: MUT, transform: isEditing ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>▾</span>
                                <button onClick={e => { e.stopPropagation(); removeAcceso(acc.id) }}
                                  style={{ padding:'2px 8px', borderRadius:'4px', border:`0.5px solid ${ROSE}40`, background:'transparent', cursor:'pointer', fontSize:'11px', color: ROSE, flexShrink:0 }}>🗑</button>
                              </div>
                              {/* Editor inline */}
                              {isEditing && (
                                <div style={{ borderTop:`0.5px solid ${BDR}`, padding:'12px 14px', display:'flex', flexDirection:'column', gap:'8px' }}>
                                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                                    <label style={labelStyle}>Plataforma<input value={acc.plataforma} onChange={e => updateAcceso(acc.id, { plataforma: e.target.value })} style={inputStyle} /></label>
                                    <label style={labelStyle}>Usuario / Email<input value={acc.usuario} onChange={e => updateAcceso(acc.id, { usuario: e.target.value })} style={inputStyle} /></label>
                                  </div>
                                  <label style={labelStyle}>
                                    Contraseña
                                    <div style={{ display:'flex', gap:'6px', alignItems:'center' }}>
                                      <input type={showEditPwd ? 'text' : 'password'} value={acc.password} onChange={e => updateAcceso(acc.id, { password: e.target.value })} style={{ ...inputStyle, flex:1 }} />
                                      <button onClick={() => setShowEditPwd(v => !v)} style={{ padding:'8px 12px', borderRadius:'6px', border:`0.5px solid ${BDR2}`, background:DIM, color: WHT, cursor:'pointer', fontSize:'13px', flexShrink:0 }}>
                                        {showEditPwd ? '🙈' : '👁'}
                                      </button>
                                    </div>
                                  </label>
                                  <label style={labelStyle}>URL (opcional)<input value={acc.url ?? ''} onChange={e => updateAcceso(acc.id, { url: e.target.value || undefined })} style={inputStyle} placeholder="https://..." /></label>
                                  <label style={labelStyle}>Notas<input value={acc.notas ?? ''} onChange={e => updateAcceso(acc.id, { notas: e.target.value || undefined })} style={inputStyle} placeholder="Contexto adicional" /></label>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Formulario nuevo acceso */}
                    <div style={{ background:BK, border:`1px dashed ${BDR2}`, borderRadius:'8px', padding:'16px' }}>
                      <p style={{ fontSize:'11px', fontWeight:700, color: MUT, textTransform:'uppercase', letterSpacing:'0.5px', margin:'0 0 12px' }}>+ Agregar nuevo acceso</p>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
                        <label style={labelStyle}>
                          Plataforma *
                          <input value={newAcceso.plataforma} onChange={e => setNewAcceso(p => ({ ...p, plataforma: e.target.value }))} style={inputStyle} placeholder="Instagram, Google, Canva…" list="plat-list" />
                          <datalist id="plat-list">
                            {['Instagram','Facebook','TikTok','YouTube','Twitter','LinkedIn','Google','Gmail','Canva','WordPress','Shopify','Mailchimp','WhatsApp','Pinterest','X'].map(p => <option key={p} value={p} />)}
                          </datalist>
                        </label>
                        <label style={labelStyle}>
                          Usuario / Email *
                          <input value={newAcceso.usuario} onChange={e => setNewAcceso(p => ({ ...p, usuario: e.target.value }))} style={inputStyle} placeholder="usuario@email.com" />
                        </label>
                      </div>
                      <label style={{ ...labelStyle, marginBottom:'10px', display:'flex', flexDirection:'column' }}>
                        Contraseña *
                        <div style={{ display:'flex', gap:'6px', alignItems:'center', marginTop:'4px' }}>
                          <input type={showNewPwd ? 'text' : 'password'} value={newAcceso.password} onChange={e => setNewAcceso(p => ({ ...p, password: e.target.value }))} style={{ ...inputStyle, flex:1, marginTop:0 }} placeholder="Contraseña" />
                          <button onClick={() => setShowNewPwd(v => !v)} style={{ padding:'8px 12px', borderRadius:'6px', border:`0.5px solid ${BDR2}`, background:DIM, color: WHT, cursor:'pointer', fontSize:'13px', flexShrink:0 }}>
                            {showNewPwd ? '🙈' : '👁'}
                          </button>
                        </div>
                      </label>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'12px' }}>
                        <label style={labelStyle}>URL (opcional)<input value={newAcceso.url ?? ''} onChange={e => setNewAcceso(p => ({ ...p, url: e.target.value }))} style={inputStyle} placeholder="https://..." /></label>
                        <label style={labelStyle}>Notas (opcional)<input value={newAcceso.notas ?? ''} onChange={e => setNewAcceso(p => ({ ...p, notas: e.target.value }))} style={inputStyle} placeholder="Contexto adicional" /></label>
                      </div>
                      <button
                        disabled={!newAcceso.plataforma.trim() || !newAcceso.usuario.trim() || !newAcceso.password.trim()}
                        onClick={addAcceso}
                        style={{ padding:'8px 20px', borderRadius:'6px', border:'none', background: newAcceso.plataforma && newAcceso.usuario && newAcceso.password ? C1 : BDR2, color: newAcceso.plataforma && newAcceso.usuario && newAcceso.password ? '#fff' : MUT, fontWeight:700, fontSize:'12px', cursor: newAcceso.plataforma && newAcceso.usuario && newAcceso.password ? 'pointer' : 'not-allowed' }}
                      >+ Agregar acceso</button>
                    </div>
                  </div>
                )
              })()}
            </div>

            {/* Modal footer */}
            <div style={{
              background: '#fff', padding: '16px 24px',
              borderTop: '1px solid #E5E7EB',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              position: 'sticky', bottom: 0, zIndex: 10, flexShrink: 0, flexWrap: 'wrap', gap: '10px',
            }}>
              {saveMsg ? (
                <p style={{ fontSize: '12.5px', color: '#EF4444', margin: 0, flex: 1 }}>{saveMsg}</p>
              ) : <div style={{ flex: 1 }} />}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowModal(false)} style={{
                  padding: '10px 22px', borderRadius: '10px', border: '1.5px solid #E5E7EB',
                  background: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '13px', color: '#374151',
                }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: '10px 26px', borderRadius: '10px', border: 'none',
                  background: saving ? '#9CA3AF' : C1, color: '#fff',
                  cursor: saving ? 'default' : 'pointer', fontWeight: 800, fontSize: '13px',
                }}>
                  {saving ? 'Guardando…' : editId ? 'Actualizar cliente' : 'Crear cliente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

/* ── ClienteCard ─────────────────────────────────────────── */
function ClienteCard({ cliente, onEdit, onDelete, portalBase }: {
  cliente: Cliente
  onEdit: () => void
  onDelete: () => void
  portalBase: string
}) {
  const pendSol = cliente.solicitudes.filter(s => s.estado === 'pendiente').length

  const statusStyle: React.CSSProperties =
    cliente.estado === 'activo'     ? { background: SOFT, color: ACC2, border: `0.5px solid ${C1}` } :
    cliente.estado === 'pausado'    ? { background: `${AMB}1A`, color: AMB, border: `0.5px solid ${AMB}55` } :
    cliente.estado === 'prospecto'  ? { background: `${BLUE}1A`, color: BLUE, border: `0.5px solid ${BLUE}55` } :
    /* finalizado */                  { background: `${ROSE}1A`, color: ROSE, border: `0.5px solid ${ROSE}55` }

  const CLIENTE_ESTADOS_MAP: Record<string, string> = {
    activo: 'Activo', pausado: 'Pausado', prospecto: 'Prospecto', finalizado: 'Finalizado'
  }

  return (
    <div
      style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', overflow: 'hidden', transition: 'border-color 0.25s, transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C1; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(110,45,255,0.15)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = BDR; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: `0.5px solid ${BDR}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          {cliente.logo_url ? (
            <img src={cliente.logo_url} alt={cliente.marca} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'contain', background: BK, padding: '4px', border: `0.5px solid ${BDR2}`, flexShrink: 0 }} />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${C1}, ${ACC2})`, color: '#fff', fontSize: '15px', fontWeight: 600, flexShrink: 0 }}>
              {cliente.marca.charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '14px', color: WHT, margin: '0 0 2px', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cliente.marca}</p>
            <p style={{ fontSize: '10px', color: MUT, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.05em' }}>{cliente.nombre}</p>
          </div>
        </div>
        <span style={{ fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '2px', flexShrink: 0, ...statusStyle }}>
          {CLIENTE_ESTADOS_MAP[cliente.estado] ?? cliente.estado}
        </span>
      </div>

      {/* Stats rows */}
      <div style={{ padding: '8px 16px', cursor: 'pointer' }} onClick={onEdit}>
        {([
          { label: 'Tablero',   val: `${(cliente.parrilla_meses ?? []).length} mes${(cliente.parrilla_meses ?? []).length !== 1 ? 'es' : ''}` },
          { label: 'Parrilla',  val: (() => {
              const histOrdenado = [...(cliente.metricas_historico ?? [])].sort((a, b) => b.mes.localeCompare(a.mes))
              const n = cliente.parrilla.length || (histOrdenado[0]?.posts_publicados ?? 0)
              return `${n} posts`
            })() },
          ...(cliente.valor_contrato ? [{ label: 'Contrato', val: `${cliente.valor_contrato}${cliente.moneda ? ` ${cliente.moneda}` : ''}` }] : []),
          ...(cliente.acomp_eventos ? [{ label: '🎪 Eventos', val: 'Incluido' }] : []),
          ...((cliente.grabaciones_mes ?? 0) > 0 ? [{ label: '🎬 Grabaciones', val: `${cliente.grabaciones_mes}/mes` }] : []),
          ...(pendSol > 0 ? [{ label: 'Pendientes', val: `${pendSol} solicitud${pendSol > 1 ? 'es' : ''}`, danger: true }] : []),
        ] as { label: string; val: string; danger?: boolean }[]).map(({ label, val, danger }) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: `0.5px solid ${BDR}` }}>
            <span style={{ fontSize: '10px', color: MUT, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
            <span style={{ fontSize: '13px', color: danger ? ROSE : WHT }}>{val}</span>
          </div>
        ))}
      </div>

      {/* Service tags footer */}
      {cliente.servicios.length > 0 && (
        <div style={{ padding: '8px 16px', background: BK, display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {cliente.servicios.slice(0, 3).map(s => (
            <span key={s} style={{ fontSize: '8px', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '2px 5px', borderRadius: '2px', background: INPUT_BG, border: `0.5px solid ${BDR}`, color: MUT }}>
              {s.length > 14 ? s.slice(0, 12) + '…' : s}
            </span>
          ))}
          {cliente.servicios.length > 3 && (
            <span style={{ fontSize: '8px', color: MUT }}>+{cliente.servicios.length - 3}</span>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: '10px 16px', display: 'flex', gap: '6px', borderTop: `0.5px solid ${BDR}` }}>
        <button
          onClick={onEdit}
          style={{ flex: 1, padding: '7px 0', borderRadius: '3px', border: `0.5px solid ${BDR2}`, background: 'transparent', cursor: 'pointer', fontSize: '10px', fontWeight: 600, color: ACC2, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = ACC2; e.currentTarget.style.background = 'rgba(168,85,247,0.08)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = BDR2; e.currentTarget.style.background = 'transparent' }}
        >
          Editar
        </button>
        {cliente.access_token && (
          <a
            href={`${portalBase}${cliente.access_token}`}
            target="_blank" rel="noopener noreferrer"
            style={{ flex: 1, padding: '7px 0', borderRadius: '3px', border: `0.5px solid ${C1}`, background: SOFT, cursor: 'pointer', fontSize: '10px', fontWeight: 600, color: ACC2, textDecoration: 'none', textAlign: 'center', display: 'block', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            Portal
          </a>
        )}
        <button
          onClick={onDelete}
          style={{ padding: '7px 11px', borderRadius: '3px', border: `0.5px solid ${ROSE}40`, background: 'transparent', cursor: 'pointer', fontSize: '12px', color: ROSE, transition: 'background 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.background = `${ROSE}15`)}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          🗑
        </button>
      </div>
    </div>
  )
}

/* ── Shared styles ───────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '5px',
  fontSize: '10px', fontWeight: 700, color: MUT,
  textTransform: 'uppercase', letterSpacing: '0.5px',
}

const inputStyle: React.CSSProperties = {
  padding: '9px 12px', borderRadius: '4px', border: `0.5px solid ${BDR2}`,
  fontSize: '13px', color: WHT, background: INPUT_BG, outline: 'none',
  width: '100%', boxSizing: 'border-box',
}

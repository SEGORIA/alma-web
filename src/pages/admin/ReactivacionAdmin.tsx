import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getSolicitudesReactivacion, updateSolicitudReactivacionEstado, deleteSolicitudReactivacion, getConfig } from '../../lib/db'
import { contactoDefault } from '../../data/config'
import type { SolicitudReactivacion, SolicitudEstado } from '../../data/reactivacion'
import { SOLICITUD_ESTADOS, URGENCIA_OPCIONES, urgenciaInfo } from '../../data/reactivacion'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import WhatsAppIcon from '../../components/WhatsAppIcon'
import { useIsMobile } from '../../hooks/useIsMobile'
import { ADM } from '../../lib/adminTheme'

const { DIM, BDR, MUT, WHT, INPUT_BG } = ADM
const P = ADM.C1

/* ── helpers ─────────────────────────────────────────────── */
function formatFecha(ts: unknown): string {
  if (!ts) return '—'
  try {
    const d = (ts as { toDate?: () => Date }).toDate?.() ?? new Date(ts as string)
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}

function EstadoBadge({ estado }: { estado: SolicitudEstado }) {
  const cfg = SOLICITUD_ESTADOS.find(e => e.value === estado) ?? SOLICITUD_ESTADOS[0]
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
      borderRadius: '20px', letterSpacing: '0.3px', whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  )
}

function UrgenciaBadge({ urgencia }: { urgencia: SolicitudReactivacion['urgencia'] }) {
  const u = urgenciaInfo(urgencia)
  return (
    <span style={{
      background: u.bg, color: u.color,
      fontSize: '11px', fontWeight: 700, padding: '3px 10px',
      borderRadius: '20px', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px',
    }}>
      {u.icono} {u.value === 'puede_esperar' ? 'Puede esperar' : u.value === 'urgente' ? 'Urgente' : 'Prioritario'}
    </span>
  )
}

function Campo({ label, valor }: { label: string; valor?: string }) {
  if (!valor) return null
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ fontSize: '10.5px', fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 3px' }}>{label}</p>
      <p style={{ fontSize: '13.5px', color: WHT, margin: 0, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{valor}</p>
    </div>
  )
}

function ListaChips({ label, items, otro }: { label: string; items?: string[]; otro?: string }) {
  if (!items || items.length === 0) return null
  return (
    <div style={{ marginBottom: '14px' }}>
      <p style={{ fontSize: '10.5px', fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 6px' }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {items.map(i => (
          <span key={i} style={{ fontSize: '12px', fontWeight: 600, color: P, background: `${P}12`, padding: '4px 10px', borderRadius: '999px' }}>{i}</span>
        ))}
      </div>
      {otro && <p style={{ fontSize: '12.5px', color: MUT, margin: '6px 0 0' }}>Otro: {otro}</p>}
    </div>
  )
}

/* ── Modal de detalle ────────────────────────────────────── */
function DetalleModal({ s, onClose, onEstado, onWhatsApp }: {
  s: SolicitudReactivacion
  onClose: () => void
  onEstado: (estado: SolicitudEstado) => void
  onWhatsApp: () => void
}) {
  const isMobile = useIsMobile()
  const u = urgenciaInfo(s.urgencia)
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 201, background: DIM, borderRadius: '20px',
        width: isMobile ? '96vw' : '640px',
        maxHeight: '90vh', overflow: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        border: `1px solid ${BDR}`,
      }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#3B0764,#6B21A8,#9333EA)', borderRadius: '20px 20px 0 0', padding: '24px 28px', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '8px', width: '32px', height: '32px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
          <p style={{ margin: '0 0 6px', color: 'rgba(255,255,255,0.65)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>REACTIVACIÓN DEL COMERCIO</p>
          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#fff', margin: '0 0 4px' }}>{s.nombre_negocio}</h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', margin: '0 0 12px' }}>{s.nombre_contacto} · {s.cargo}</p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700 }}>
              {u.icono} {u.value === 'puede_esperar' ? 'Puede esperar' : u.value === 'urgente' ? 'Urgente' : 'Prioritario'}
            </span>
            <button onClick={onWhatsApp} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              <WhatsAppIcon size={13} fill="#fff" /> WhatsApp
            </button>
            <a href={`mailto:${s.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>
              ✉️ Email
            </a>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{formatFecha(s.createdAt)}</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px' }}>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: MUT, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Estado</span>
            <select
              value={s.estado}
              onChange={e => onEstado(e.target.value as SolicitudEstado)}
              style={{ padding: '6px 10px', borderRadius: '8px', border: `1px solid ${BDR}`, fontSize: '12px', color: WHT, background: INPUT_BG, cursor: 'pointer', outline: 'none' }}
            >
              {SOLICITUD_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
            </select>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 800, color: P, textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Contacto</p>
          <Campo label="WhatsApp" valor={s.whatsapp} />
          <Campo label="Correo" valor={s.email} />
          <Campo label="Zona" valor={s.ubicacion} />

          <p style={{ fontSize: '11px', fontWeight: 800, color: P, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 0 12px', paddingTop: '16px', borderTop: `1px solid ${BDR}` }}>El negocio</p>
          <Campo label="Sector" valor={s.sector} />
          <Campo label="Productos / servicios" valor={s.productos_servicios} />
          <Campo label="Tiempo funcionando" valor={s.tiempo_funcionando} />
          <ListaChips label="Dónde comercializaba" items={s.canales_venta} otro={s.canales_venta_otro} />

          <p style={{ fontSize: '11px', fontWeight: 800, color: P, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 0 12px', paddingTop: '16px', borderTop: `1px solid ${BDR}` }}>Qué está pasando</p>
          <Campo label="Relato" valor={s.afectaciones_relato} />
          <ListaChips label="Afectaciones" items={s.afectaciones_tipo} otro={s.afectaciones_otro} />

          <p style={{ fontSize: '11px', fontWeight: 800, color: P, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 0 12px', paddingTop: '16px', borderTop: `1px solid ${BDR}` }}>Cómo podemos ayudar</p>
          <ListaChips label="Apoyos que le interesan" items={s.apoyos} otro={s.apoyo_otro} />
          <div style={{ background: `${P}0D`, border: `1px solid ${P}30`, borderRadius: '12px', padding: '14px 16px', marginBottom: '14px' }}>
            <p style={{ fontSize: '10.5px', fontWeight: 700, color: P, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px' }}>👉 Ayuda ideal, en sus palabras</p>
            <p style={{ fontSize: '13.5px', color: WHT, margin: 0, fontWeight: 600, lineHeight: 1.55 }}>{s.ayuda_ideal}</p>
          </div>

          <p style={{ fontSize: '11px', fontWeight: 800, color: P, textTransform: 'uppercase', letterSpacing: '1px', margin: '20px 0 12px', paddingTop: '16px', borderTop: `1px solid ${BDR}` }}>Capacidad digital</p>
          <ListaChips label="Herramientas que usa" items={s.herramientas} otro={s.herramientas_otro} />
          <Campo label="Actividad en redes" valor={
            s.actividad_redes === 'muy_activo' ? 'Muy activo'
            : s.actividad_redes === 'algo_activo' ? 'Algo activo'
            : s.actividad_redes === 'poco_activo' ? 'Poco activo'
            : 'Actualmente no está publicando'
          } />
        </div>
      </div>
    </>
  )
}

/* ── Página principal ────────────────────────────────────── */
export default function ReactivacionAdmin() {
  const [solicitudes, setSolicitudes] = useState<SolicitudReactivacion[]>([])
  const [loading,     setLoading]     = useState(true)
  const [phone,       setPhone]       = useState(contactoDefault.whatsapp)
  const [filterUrg,   setFilterUrg]   = useState<SolicitudReactivacion['urgencia'] | 'todos'>('todos')
  const [filterEst,   setFilterEst]   = useState<SolicitudEstado | 'todos'>('todos')
  const [updating,    setUpdating]    = useState<string | null>(null)
  const [abierta,     setAbierta]     = useState<SolicitudReactivacion | null>(null)

  async function load() {
    setLoading(true)
    const data = await getSolicitudesReactivacion()
    setSolicitudes(data)
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
    load()
    getConfig().then(cfg => setPhone(cfg.contactoInfo?.whatsapp ?? contactoDefault.whatsapp))
  }, [])

  async function handleEstado(s: SolicitudReactivacion, estado: SolicitudEstado) {
    if (!s._id) return
    setUpdating(s._id)
    try {
      await updateSolicitudReactivacionEstado(s._id, estado)
      setSolicitudes(prev => prev.map(x => x._id === s._id ? { ...x, estado } : x))
      setAbierta(prev => prev && prev._id === s._id ? { ...prev, estado } : prev)
    } catch (err) { toast.err('Error: ' + err) }
    setUpdating(null)
  }

  async function handleDelete(s: SolicitudReactivacion) {
    if (!s._id || !(await confirmar(`¿Eliminar la solicitud de "${s.nombre_negocio}"?`))) return
    try {
      await deleteSolicitudReactivacion(s._id)
      setSolicitudes(prev => prev.filter(x => x._id !== s._id))
      setAbierta(prev => prev && prev._id === s._id ? null : prev)
    } catch (err) { toast.err('Error: ' + err) }
  }

  const openWhatsApp = (s: SolicitudReactivacion) => {
    const texto = `Hola ${s.nombre_contacto}, te escribo del equipo de Alma. Recibimos la información de ${s.nombre_negocio} en el brief de reactivación del comercio. ¿Podemos ayudarte?`
    const numero = s.whatsapp || phone
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const filtered = solicitudes.filter(s =>
    (filterUrg === 'todos' || s.urgencia === filterUrg) &&
    (filterEst === 'todos' || s.estado === filterEst)
  )

  const contadoresUrg = {
    todos:          solicitudes.length,
    urgente:        solicitudes.filter(s => s.urgencia === 'urgente').length,
    prioritario:    solicitudes.filter(s => s.urgencia === 'prioritario').length,
    puede_esperar:  solicitudes.filter(s => s.urgencia === 'puede_esperar').length,
  }
  const nuevos = solicitudes.filter(s => s.estado === 'nuevo').length

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: WHT, marginBottom: '4px', letterSpacing: '-0.5px' }}>
              💜 Reactivación del comercio
            </h1>
            <p style={{ fontSize: '14px', color: MUT }}>
              Negocios afectados por el sismo que pidieron acompañamiento. {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} en total.
            </p>
          </div>
          <button
            onClick={load}
            style={{ background: `${P}15`, color: P, border: `1px solid ${P}30`, padding: '9px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            🔄 Actualizar
          </button>
        </div>

        {/* Filtro por urgencia */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterUrg('todos')}
            style={{
              background: filterUrg === 'todos' ? INPUT_BG : '#fff',
              color: filterUrg === 'todos' ? WHT : MUT,
              border: `1.5px solid ${filterUrg === 'todos' ? WHT : BDR}`,
              padding: '7px 16px', borderRadius: '10px',
              fontWeight: filterUrg === 'todos' ? 700 : 500, fontSize: '13px', cursor: 'pointer',
            }}>
            Todas ({contadoresUrg.todos})
          </button>
          {URGENCIA_OPCIONES.map(o => (
            <button key={o.value} onClick={() => setFilterUrg(o.value)}
              style={{
                background: filterUrg === o.value ? o.bg : '#fff',
                color: filterUrg === o.value ? o.color : MUT,
                border: `1.5px solid ${filterUrg === o.value ? o.color : BDR}`,
                padding: '7px 16px', borderRadius: '10px',
                fontWeight: filterUrg === o.value ? 700 : 500, fontSize: '13px', cursor: 'pointer',
              }}>
              {o.icono} {o.value === 'puede_esperar' ? 'Puede esperar' : o.value === 'urgente' ? 'Urgente' : 'Prioritario'} ({contadoresUrg[o.value]})
            </button>
          ))}
        </div>

        {/* Filtro por estado */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <button onClick={() => setFilterEst('todos')}
            style={{
              background: filterEst === 'todos' ? `${P}15` : 'transparent',
              color: filterEst === 'todos' ? P : MUT,
              border: 'none', padding: '5px 4px', fontSize: '12.5px', fontWeight: filterEst === 'todos' ? 700 : 500, cursor: 'pointer',
            }}>
            Todos los estados
          </button>
          {SOLICITUD_ESTADOS.map(e => (
            <button key={e.value} onClick={() => setFilterEst(e.value)}
              style={{
                background: filterEst === e.value ? e.bg : 'transparent',
                color: filterEst === e.value ? e.color : MUT,
                border: 'none', padding: '5px 10px', borderRadius: '8px', fontSize: '12.5px', fontWeight: filterEst === e.value ? 700 : 500, cursor: 'pointer',
              }}>
              {e.label} ({solicitudes.filter(s => s.estado === e.value).length})
            </button>
          ))}
        </div>

        {/* Lista */}
        {loading ? (
          <ListSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <div style={{ background: DIM, borderRadius: '16px', padding: '48px', textAlign: 'center', border: `1px solid ${BDR}` }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>💜</span>
            <p style={{ fontSize: '15px', fontWeight: 700, color: WHT, marginBottom: '6px' }}>
              {solicitudes.length === 0 ? 'Aún no hay solicitudes' : 'No hay solicitudes con este filtro'}
            </p>
            <p style={{ fontSize: '13px', color: MUT }}>
              Cuando un negocio llene el brief en /reactivacion, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(s => (
              <div key={s._id}
                onClick={() => setAbierta(s)}
                style={{
                  background: DIM, borderRadius: '14px',
                  border: `1px solid ${BDR}`, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)', cursor: 'pointer',
                }}>
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${P}, #9333EA)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '14px', fontWeight: 800, flexShrink: 0,
                }}>
                  {s.nombre_negocio[0]?.toUpperCase() ?? '?'}
                </div>

                <div style={{ flex: 1, minWidth: '180px' }}>
                  <p style={{ fontWeight: 700, fontSize: '13px', color: WHT, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.nombre_negocio}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: MUT }}>{s.nombre_contacto} · {s.sector || '—'}</span>
                    <span style={{ fontSize: '11px', color: MUT }}>{formatFecha(s.createdAt)}</span>
                  </div>
                </div>

                <UrgenciaBadge urgencia={s.urgencia} />
                <EstadoBadge estado={s.estado} />

                <select
                  value={s.estado}
                  disabled={updating === s._id}
                  onClick={e => e.stopPropagation()}
                  onChange={e => handleEstado(s, e.target.value as SolicitudEstado)}
                  style={{
                    padding: '6px 10px', borderRadius: '8px',
                    border: `1px solid ${BDR}`, fontSize: '12px',
                    color: WHT, cursor: 'pointer', outline: 'none',
                    opacity: updating === s._id ? 0.5 : 1,
                  }}
                >
                  {SOLICITUD_ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>

                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={e => { e.stopPropagation(); openWhatsApp(s) }}
                    title="Contactar por WhatsApp"
                    style={{
                      background: 'rgba(37,211,102,0.1)', color: ADM.GRN,
                      border: '1px solid rgba(37,211,102,0.25)',
                      padding: '7px 12px', borderRadius: '8px',
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                    <WhatsAppIcon size={13} fill="currentColor" />
                    WhatsApp
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleDelete(s) }}
                    title="Eliminar solicitud"
                    style={{
                      background: 'rgba(239,68,68,0.08)', color: '#EF4444',
                      border: '1px solid rgba(239,68,68,0.2)',
                      padding: '7px 10px', borderRadius: '8px',
                      fontSize: '13px', cursor: 'pointer',
                    }}>
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {nuevos > 0 && (
          <div style={{ marginTop: '20px', background: `${P}10`, border: `1px solid ${P}25`, borderRadius: '12px', padding: '12px 16px', fontSize: '13px', color: P, fontWeight: 600 }}>
            💡 Tienes {nuevos} solicitud{nuevos !== 1 ? 'es' : ''} nueva{nuevos !== 1 ? 's' : ''}. Haz clic en una tarjeta para ver el detalle completo.
          </div>
        )}

      </div>

      {abierta && (
        <DetalleModal
          s={abierta}
          onClose={() => setAbierta(null)}
          onEstado={estado => handleEstado(abierta, estado)}
          onWhatsApp={() => openWhatsApp(abierta)}
        />
      )}
    </AdminLayout>
  )
}

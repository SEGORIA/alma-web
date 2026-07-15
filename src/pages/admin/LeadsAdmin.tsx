import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getLeads, updateLeadEstado, deleteLead } from '../../lib/db'
import { getConfig } from '../../lib/db'
import { contactoDefault } from '../../data/config'
import type { Lead } from '../../data/leads'
import { LEAD_ESTADOS } from '../../data/leads'
/* tokens P/PL ahora vienen del tema ADM */
import { toast, confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import WhatsAppIcon from '../../components/WhatsAppIcon'
import { ADM } from '../../lib/adminTheme'

const { DIM, BDR, MUT, WHT, INPUT_BG } = ADM
const P  = ADM.C1

/* ── helpers ─────────────────────────────────────────────── */
function formatFecha(ts: unknown): string {
  if (!ts) return '—'
  try {
    // Firestore Timestamp tiene `.toDate()`
    const d = (ts as { toDate?: () => Date }).toDate?.() ?? new Date(ts as string)
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return '—' }
}

function EstadoBadge({ estado }: { estado: Lead['estado'] }) {
  const cfg = LEAD_ESTADOS.find(e => e.value === estado) ?? LEAD_ESTADOS[0]
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

export default function LeadsAdmin() {
  const [leads,    setLeads]    = useState<Lead[]>([])
  const [loading,  setLoading]  = useState(true)
  const [phone,    setPhone]    = useState(contactoDefault.whatsapp)
  const [filter,   setFilter]   = useState<Lead['estado'] | 'todos'>('todos')
  const [updating, setUpdating] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const data = await getLeads()
    setLeads(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
    getConfig().then(cfg => setPhone(cfg.contactoInfo?.whatsapp ?? contactoDefault.whatsapp))
  }, [])

  async function handleEstado(lead: Lead, estado: Lead['estado']) {
    if (!lead._id) return
    setUpdating(lead._id)
    try {
      await updateLeadEstado(lead._id, estado)
      setLeads(prev => prev.map(l => l._id === lead._id ? { ...l, estado } : l))
    } catch (err) { toast.err('Error: ' + err) }
    setUpdating(null)
  }

  async function handleDelete(lead: Lead) {
    if (!lead._id || !(await confirmar(`¿Eliminar el lead de "${lead.email}"?`))) return
    try {
      await deleteLead(lead._id)
      setLeads(prev => prev.filter(l => l._id !== lead._id))
    } catch (err) { toast.err('Error: ' + err) }
  }

  const openWhatsApp = (lead: Lead) => {
    const texto = `Hola, te escribo del equipo de Alma. Vi que descargaste nuestro kit gratuito con el correo ${lead.email}. ¿Podemos ayudarte con tu marca?`
    // Si el lead dejó su número, usarlo; si no, abrir WhatsApp Web genérico
    const numero = lead.telefono
      ? lead.telefono.replace(/\D/g, '')
      : phone
    window.open(`https://wa.me/${numero}?text=${encodeURIComponent(texto)}`, '_blank')
  }

  const filtered = filter === 'todos' ? leads : leads.filter(l => l.estado === filter)

  const contadores = {
    todos:      leads.length,
    nuevo:      leads.filter(l => l.estado === 'nuevo').length,
    contactado: leads.filter(l => l.estado === 'contactado').length,
    cerrado:    leads.filter(l => l.estado === 'cerrado').length,
  }

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: WHT, marginBottom: '4px', letterSpacing: '-0.5px' }}>
              🎯 Leads — Kit Gratuito
            </h1>
            <p style={{ fontSize: '14px', color: MUT }}>
              Personas que descargaron el kit. {leads.length} lead{leads.length !== 1 ? 's' : ''} en total.
            </p>
          </div>
          <button
            onClick={load}
            style={{ background: `${P}15`, color: P, border: `1px solid ${P}30`, padding: '9px 16px', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            🔄 Actualizar
          </button>
        </div>

        {/* Filtros + contadores */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {([
            { key: 'todos',      label: `Todos (${contadores.todos})`,                color: WHT, bg: INPUT_BG },
            { key: 'nuevo',      label: `Nuevos (${contadores.nuevo})`,               color: LEAD_ESTADOS[0].color, bg: LEAD_ESTADOS[0].bg },
            { key: 'contactado', label: `Contactados (${contadores.contactado})`,     color: LEAD_ESTADOS[1].color, bg: LEAD_ESTADOS[1].bg },
            { key: 'cerrado',    label: `Cerrados (${contadores.cerrado})`,           color: LEAD_ESTADOS[2].color, bg: LEAD_ESTADOS[2].bg },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                background: filter === f.key ? f.bg : '#fff',
                color: filter === f.key ? f.color : MUT,
                border: `1.5px solid ${filter === f.key ? f.color : BDR}`,
                padding: '7px 16px', borderRadius: '10px',
                fontWeight: filter === f.key ? 700 : 500, fontSize: '13px', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Tabla */}
        {loading ? (
          <ListSkeleton rows={5} />
        ) : filtered.length === 0 ? (
          <div style={{
            background: DIM, borderRadius: '16px', padding: '48px',
            textAlign: 'center', border: `1px solid ${BDR}`,
          }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🎯</span>
            <p style={{ fontSize: '15px', fontWeight: 700, color: WHT, marginBottom: '6px' }}>
              {filter === 'todos' ? 'Aún no hay leads' : `No hay leads con estado "${filter}"`}
            </p>
            <p style={{ fontSize: '13px', color: MUT }}>
              Cuando alguien pida el kit gratuito, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(lead => (
              <div key={lead._id} style={{
                background: DIM, borderRadius: '14px',
                border: `1px solid ${BDR}`, padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}>
                {/* Avatar */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${P}, #9333EA)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '14px', fontWeight: 800, flexShrink: 0,
                }}>
                  {lead.email[0].toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <p style={{ fontWeight: 700, fontSize: '13px', color: WHT, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.email}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {lead.telefono && (
                      <span style={{ fontSize: '11px', color: ADM.GRN, fontWeight: 600, background: 'rgba(37,211,102,0.08)', padding: '1px 7px', borderRadius: '10px' }}>
                        📱 {lead.telefono}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: MUT }}>
                      {formatFecha(lead.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Estado badge */}
                <EstadoBadge estado={lead.estado} />

                {/* Cambiar estado */}
                <select
                  value={lead.estado}
                  disabled={updating === lead._id}
                  onChange={e => handleEstado(lead, e.target.value as Lead['estado'])}
                  style={{
                    padding: '6px 10px', borderRadius: '8px',
                    border: `1px solid ${BDR}`, fontSize: '12px',
                    color: WHT, cursor: 'pointer', outline: 'none',
                    opacity: updating === lead._id ? 0.5 : 1,
                  }}
                >
                  {LEAD_ESTADOS.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => openWhatsApp(lead)}
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
                    onClick={() => handleDelete(lead)}
                    title="Eliminar lead"
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

        {/* Nota si hay nuevos */}
        {contadores.nuevo > 0 && (
          <div style={{
            marginTop: '20px', background: `${P}10`,
            border: `1px solid ${P}25`, borderRadius: '12px',
            padding: '12px 16px', fontSize: '13px', color: P, fontWeight: 600,
          }}>
            💡 Tienes {contadores.nuevo} lead{contadores.nuevo !== 1 ? 's' : ''} nuevo{contadores.nuevo !== 1 ? 's' : ''}. Haz clic en "WhatsApp" para contactarlos directamente.
          </div>
        )}

      </div>
    </AdminLayout>
  )
}

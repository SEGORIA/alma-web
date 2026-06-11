import { useEffect, useState } from 'react'
import AdminLayout from './AdminLayout'
import { getLeads, updateLeadEstado, deleteLead } from '../../lib/db'
import { getConfig } from '../../lib/db'
import { contactoDefault } from '../../data/config'
import type { Lead } from '../../data/leads'
import { LEAD_ESTADOS } from '../../data/leads'
import { P } from '../../tokens'
import { toast, confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'

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
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', marginBottom: '4px', letterSpacing: '-0.5px' }}>
              🎯 Leads — Kit Gratuito
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
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
            { key: 'todos',      label: `Todos (${contadores.todos})`,                color: '#374151', bg: '#F3F4F6' },
            { key: 'nuevo',      label: `Nuevos (${contadores.nuevo})`,               color: LEAD_ESTADOS[0].color, bg: LEAD_ESTADOS[0].bg },
            { key: 'contactado', label: `Contactados (${contadores.contactado})`,     color: LEAD_ESTADOS[1].color, bg: LEAD_ESTADOS[1].bg },
            { key: 'cerrado',    label: `Cerrados (${contadores.cerrado})`,           color: LEAD_ESTADOS[2].color, bg: LEAD_ESTADOS[2].bg },
          ] as const).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              style={{
                background: filter === f.key ? f.bg : '#fff',
                color: filter === f.key ? f.color : '#6B7280',
                border: `1.5px solid ${filter === f.key ? f.color : '#E5E7EB'}`,
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
            background: '#fff', borderRadius: '16px', padding: '48px',
            textAlign: 'center', border: '1px solid #E5E7EB',
          }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '12px' }}>🎯</span>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
              {filter === 'todos' ? 'Aún no hay leads' : `No hay leads con estado "${filter}"`}
            </p>
            <p style={{ fontSize: '13px', color: '#9CA3AF' }}>
              Cuando alguien pida el kit gratuito, aparecerá aquí.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(lead => (
              <div key={lead._id} style={{
                background: '#fff', borderRadius: '14px',
                border: '1px solid #E5E7EB', padding: '14px 18px',
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
                  <p style={{ fontWeight: 700, fontSize: '13px', color: '#111827', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.email}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {lead.telefono && (
                      <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600, background: 'rgba(37,211,102,0.08)', padding: '1px 7px', borderRadius: '10px' }}>
                        📱 {lead.telefono}
                      </span>
                    )}
                    <span style={{ fontSize: '11px', color: '#9CA3AF' }}>
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
                    border: '1px solid #E5E7EB', fontSize: '12px',
                    color: '#374151', cursor: 'pointer', outline: 'none',
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
                      background: 'rgba(37,211,102,0.1)', color: '#15803D',
                      border: '1px solid rgba(37,211,102,0.25)',
                      padding: '7px 12px', borderRadius: '8px',
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: '5px',
                    }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
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

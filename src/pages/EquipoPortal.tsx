import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEquipo, getTareasByResponsable, updateTarea } from '../lib/db'
import type { EquipoMember } from '../data/contenido'
import {
  TAREA_ESTADOS, TAREA_FRECUENCIAS, TAREA_PRIORIDADES,
  type Tarea, type TareaPrioridad,
} from '../data/tareas'

/* ── Brand tokens ───────────────────────────────────────── */
const P  = '#6B21A8'
const PRIORIDAD_COLOR: Record<TareaPrioridad, string> = {
  alta: '#E11D48', media: '#D97706', baja: '#2563EB',
}
const FRECUENCIA_LABEL: Record<string, string> = Object.fromEntries(
  TAREA_FRECUENCIAS.map(f => [f.value, f.label])
)

/* ── Loader ──────────────────────────────────────────────── */
function Loader() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F4FF', gap: '16px' }}>
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `4px solid ${P}30`, borderTopColor: P, animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#9CA3AF', fontSize: '14px' }}>Cargando tu portal…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

/* ── Entrada de PIN ──────────────────────────────────────── */
function PinEntry() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')

  function entrar() {
    if (pin.trim()) navigate(`/equipo-portal/${pin.trim()}`)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F4FF', gap: '16px', textAlign: 'center', padding: '40px' }}>
      <p style={{ fontSize: '60px', margin: 0 }}>🔑</p>
      <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0 }}>Portal del equipo</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '320px', lineHeight: 1.6, margin: 0 }}>
        Ingresa tu PIN personal para ver y actualizar tus tareas.
      </p>
      <input
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
        onKeyDown={e => { if (e.key === 'Enter') entrar() }}
        maxLength={4}
        placeholder="••••"
        style={{
          width: '160px', textAlign: 'center', fontSize: '28px', fontWeight: 800, letterSpacing: '10px',
          padding: '14px 10px', borderRadius: '14px', border: `2px solid ${P}30`, outline: 'none', color: '#111827',
        }}
      />
      <button onClick={entrar} disabled={!pin.trim()} style={{
        padding: '12px 28px', borderRadius: '12px', background: P, color: '#fff', border: 'none',
        fontWeight: 800, fontSize: '14px', cursor: pin.trim() ? 'pointer' : 'not-allowed', opacity: pin.trim() ? 1 : 0.5,
      }}>
        Entrar
      </button>
    </div>
  )
}

/* ── PIN inválido ────────────────────────────────────────── */
function PinInvalido() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F5F4FF', gap: '16px', textAlign: 'center', padding: '40px' }}>
      <p style={{ fontSize: '60px', margin: 0 }}>🔒</p>
      <h1 style={{ fontSize: '22px', fontWeight: 900, color: '#111827', margin: 0 }}>PIN inválido</h1>
      <p style={{ fontSize: '14px', color: '#6B7280', maxWidth: '360px', lineHeight: 1.6 }}>
        No encontramos un acceso con ese PIN. Verifica con Alma Agencia Creativa que tu PIN esté configurado correctamente.
      </p>
      <button onClick={() => navigate('/equipo-portal')} style={{ padding: '11px 24px', borderRadius: '12px', background: P, color: '#fff', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
        Volver a intentar
      </button>
    </div>
  )
}

/* ── Tarjeta de tarea ────────────────────────────────────── */
function TareaCard({ t, onMove }: { t: Tarea; onMove: (dir: -1 | 1) => void }) {
  const idx = TAREA_ESTADOS.findIndex(e => e.value === t.estado)
  const prioColor = PRIORIDAD_COLOR[t.prioridad]
  const prioLabel = TAREA_PRIORIDADES.find(p => p.value === t.prioridad)?.label ?? t.prioridad

  return (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #E5E7EB', padding: '14px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <p style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800, color: '#111827', lineHeight: 1.35 }}>{t.titulo}</p>
      {t.descripcion && (
        <p style={{ margin: '0 0 10px', fontSize: '12.5px', color: '#6B7280', lineHeight: 1.5 }}>{t.descripcion}</p>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
        <span style={{ background: `${prioColor}15`, color: prioColor, borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
          {prioLabel}
        </span>
        <span style={{ background: '#F3F4F6', color: '#6B7280', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>
          {FRECUENCIA_LABEL[t.frecuencia] ?? t.frecuencia}
        </span>
        {t.fechaLimite && (
          <span style={{ background: '#F3F4F6', color: '#6B7280', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 700 }}>
            📅 {t.fechaLimite}
          </span>
        )}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => onMove(-1)} disabled={idx === 0} style={{
          flex: 1, border: '1px solid #E5E7EB', background: 'transparent', borderRadius: '10px',
          color: idx === 0 ? '#D1D5DB' : '#374151', fontSize: '12.5px', fontWeight: 700, padding: '8px',
          cursor: idx === 0 ? 'not-allowed' : 'pointer',
        }}>◀ {idx > 0 ? TAREA_ESTADOS[idx - 1].label : ''}</button>
        <button onClick={() => onMove(1)} disabled={idx === TAREA_ESTADOS.length - 1} style={{
          flex: 1, border: '1px solid #E5E7EB', background: 'transparent', borderRadius: '10px',
          color: idx === TAREA_ESTADOS.length - 1 ? '#D1D5DB' : '#374151', fontSize: '12.5px', fontWeight: 700, padding: '8px',
          cursor: idx === TAREA_ESTADOS.length - 1 ? 'not-allowed' : 'pointer',
        }}>{idx < TAREA_ESTADOS.length - 1 ? TAREA_ESTADOS[idx + 1].label : ''} ▶</button>
      </div>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────── */
export default function EquipoPortal() {
  const { pin } = useParams<{ pin: string }>()
  const [loading, setLoading] = useState(true)
  const [member, setMember] = useState<EquipoMember | null | undefined>(undefined)
  const [tareas, setTareas] = useState<Tarea[]>([])

  useEffect(() => {
    if (!pin) { setLoading(false); return }
    let active = true
    getEquipo().then(async equipo => {
      const m = equipo.find(e => e.pin && e.pin === pin) ?? null
      if (!active) return
      setMember(m)
      if (m?._id) {
        const t = await getTareasByResponsable(m._id)
        if (active) setTareas(t)
      }
      setLoading(false)
    })
    return () => { active = false }
  }, [pin])

  if (!pin) return <PinEntry />
  if (loading) return <Loader />
  if (!member) return <PinInvalido />

  async function handleMove(t: Tarea, dir: -1 | 1) {
    const idx = TAREA_ESTADOS.findIndex(e => e.value === t.estado)
    const next = TAREA_ESTADOS[idx + dir]
    if (!next || !t._id) return
    setTareas(prev => prev.map(x => x._id === t._id ? { ...x, estado: next.value } : x))
    try { await updateTarea(t._id, { estado: next.value }) } catch { /* optimista */ }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F2F0FA', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* ── Header ── */}
      <div style={{ background: 'linear-gradient(140deg, #0A0118 0%, #1E0547 35%, #3B0C87 65%, #6D28D9 100%)' }}>
        <div style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: member.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff', fontWeight: 900, flexShrink: 0, overflow: 'hidden' }}>
              {member.foto ? <img src={member.foto} alt={member.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (member.emoji || member.iniciales)}
            </div>
            <div>
              <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '1px' }}>Portal del equipo · ALMA</p>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Hola, {member.nombre.split(' ')[0]} 👋</h1>
              <p style={{ margin: '2px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>{member.rol}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tablero ── */}
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: '24px 20px 40px' }}>
        <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#6B7280' }}>
          {tareas.length} tarea{tareas.length !== 1 ? 's' : ''} asignada{tareas.length !== 1 ? 's' : ''}.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {TAREA_ESTADOS.map(col => {
            const items = tareas.filter(t => t.estado === col.value)
            return (
              <div key={col.value}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  <p style={{ margin: 0, fontSize: '12px', fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', color: '#374151' }}>{col.label}</p>
                  <span style={{ background: '#fff', border: '1px solid #E5E7EB', color: '#6B7280', borderRadius: '20px', padding: '1px 9px', fontSize: '11px', fontWeight: 700 }}>{items.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.length === 0 && (
                    <p style={{ fontSize: '12px', color: '#9CA3AF', textAlign: 'center', padding: '20px 0' }}>Sin tareas</p>
                  )}
                  {items.map(t => (
                    <TareaCard key={t._id} t={t} onMove={dir => handleMove(t, dir)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

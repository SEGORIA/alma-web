import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getArticulos, getProyectos, getPlanes, getExtras, seedArticulos, seedPortafolio, seedPrecios } from '../../lib/db'
import { P, Y } from '../../tokens'

export default function AdminDashboard() {
  const [nArticulos,  setNArticulos]  = useState<number | null>(null)
  const [nProyectos,  setNProyectos]  = useState<number | null>(null)
  const [nPlanes,     setNPlanes]     = useState<number | null>(null)
  const [nExtras,     setNExtras]     = useState<number | null>(null)
  const [seeding,     setSeeding]     = useState(false)
  const [seeded,      setSeeded]      = useState(false)

  useEffect(() => {
    getArticulos().then(a => setNArticulos(a.length))
    getProyectos().then(p => setNProyectos(p.length))
    getPlanes().then(p => setNPlanes(p.length))
    getExtras().then(e => setNExtras(e.length))
  }, [seeded])

  const handleSeed = async () => {
    if (!confirm('¿Migrar los datos estáticos a Firestore? Esto creará los registros iniciales.')) return
    setSeeding(true)
    try {
      await seedArticulos()
      await seedPortafolio()
      await seedPrecios()
      setSeeded(s => !s)
      alert('✅ Datos migrados correctamente a Firestore')
    } catch (err) {
      alert('Error al migrar: ' + err)
    } finally {
      setSeeding(false)
    }
  }

  const cards = [
    {
      label:  'Artículos del blog',
      value:  nArticulos ?? '…',
      icon:   '✍️',
      color:  P,
      to:     '/admin/blog',
      action: 'Gestionar blog',
    },
    {
      label:  'Proyectos en portafolio',
      value:  nProyectos ?? '…',
      icon:   '🖼️',
      color:  '#0284C7',
      to:     '/admin/portafolio',
      action: 'Gestionar portafolio',
    },
    {
      label:  `Planes (${nPlanes ?? '…'}) + Extras (${nExtras ?? '…'})`,
      value:  nPlanes !== null && nExtras !== null ? nPlanes + nExtras : '…',
      icon:   '💰',
      color:  '#059669',
      to:     '/admin/precios',
      action: 'Gestionar precios',
    },
  ]

  return (
    <AdminLayout>
      <div style={{ padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', marginBottom: '6px', letterSpacing: '-0.5px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Gestiona el contenido de tu sitio web desde aquí.
          </p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
          {cards.map(c => (
            <div key={c.label} style={{
              background: '#fff', borderRadius: '20px',
              padding: '24px', border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '28px' }}>{c.icon}</span>
                <span style={{
                  background: `${c.color}15`, color: c.color,
                  fontSize: '11px', fontWeight: 700, padding: '4px 10px',
                  borderRadius: '20px', letterSpacing: '0.5px',
                }}>
                  ACTIVO
                </span>
              </div>
              <p style={{ fontSize: '36px', fontWeight: 900, color: '#111827', marginBottom: '4px' }}>
                {c.value}
              </p>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
                {c.label}
              </p>
              <Link
                to={c.to}
                style={{
                  display: 'inline-block', padding: '9px 18px',
                  background: c.color, color: '#fff',
                  borderRadius: '10px', textDecoration: 'none',
                  fontSize: '13px', fontWeight: 700,
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {c.action} →
              </Link>
            </div>
          ))}
        </div>

        {/* Acciones rápidas */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: '28px', border: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
            Acciones rápidas
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '20px' }}>
            Primera vez aquí: migra los datos estáticos a Firestore para empezar a editarlos.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              to="/admin/blog/nuevo"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: P, color: '#fff',
                padding: '10px 20px', borderRadius: '10px',
                textDecoration: 'none', fontWeight: 700, fontSize: '14px',
              }}
            >
              + Nuevo artículo
            </Link>
            <Link
              to="/admin/portafolio/nuevo"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#0284C7', color: '#fff',
                padding: '10px 20px', borderRadius: '10px',
                textDecoration: 'none', fontWeight: 700, fontSize: '14px',
              }}
            >
              + Nuevo proyecto
            </Link>
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: seeding ? '#E5E7EB' : `${Y}33`,
                color: seeding ? '#9CA3AF' : '#92400E',
                border: `1px solid ${seeding ? '#E5E7EB' : Y}`,
                padding: '10px 20px', borderRadius: '10px',
                fontWeight: 700, fontSize: '14px', cursor: seeding ? 'not-allowed' : 'pointer',
              }}
            >
              {seeding ? 'Migrando...' : '🌱 Migrar datos a Firestore'}
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

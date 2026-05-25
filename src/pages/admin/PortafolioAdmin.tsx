import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getProyectos, deleteProyecto } from '../../lib/db'
import { P } from '../../tokens'
import type { Proyecto } from '../../data/portafolio'

export default function PortafolioAdmin() {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [loading,   setLoading]   = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await getProyectos()
    setProyectos(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, titulo: string) => {
    if (!confirm(`¿Eliminar "${titulo}" del portafolio?`)) return
    await deleteProyecto(id)
    load()
  }

  return (
    <AdminLayout>
      <div style={{ padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', marginBottom: '4px', letterSpacing: '-0.5px' }}>
              🖼️ Portafolio
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              {proyectos.length} proyecto{proyectos.length !== 1 ? 's' : ''} en el portafolio
            </p>
          </div>
          <Link
            to="/admin/portafolio/nuevo"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#0284C7', color: '#fff',
              padding: '11px 22px', borderRadius: '12px',
              textDecoration: 'none', fontWeight: 700, fontSize: '14px',
            }}
          >
            + Nuevo proyecto
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280' }}>Cargando proyectos…</div>
        ) : proyectos.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '48px',
            textAlign: 'center', border: '1px solid #E5E7EB',
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🖼️</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
              No hay proyectos aún
            </p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '24px' }}>
              Agrega proyectos o migra los datos desde el dashboard.
            </p>
            <Link to="/admin/portafolio/nuevo" style={{ color: '#0284C7', fontWeight: 700, fontSize: '14px' }}>
              + Agregar primer proyecto →
            </Link>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}>
            {proyectos.map(p => (
              <div
                key={p._id ?? p.titulo}
                style={{
                  background: '#fff', borderRadius: '16px',
                  border: '1px solid #E5E7EB', overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {/* Visual preview */}
                <div style={{
                  height: '110px', background: p.g, overflow: 'hidden',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                }}>
                  {p.imagen && (
                    <img
                      src={p.imagen}
                      alt={p.titulo}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  )}
                  {p.imagen && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }} />}
                  {p.featured && (
                    <span style={{
                      position: 'absolute', top: '8px', left: '8px',
                      background: 'rgba(255,255,255,0.9)', color: '#92400E',
                      fontSize: '10px', fontWeight: 800, padding: '3px 10px',
                      borderRadius: '20px', zIndex: 1,
                    }}>
                      ★ Destacado
                    </span>
                  )}
                  {/* Badge imagen vs gradiente */}
                  <span style={{
                    position: 'absolute', bottom: '8px', right: '8px', zIndex: 1,
                    background: p.imagen ? 'rgba(5,150,105,0.9)' : 'rgba(0,0,0,0.4)',
                    color: '#fff', fontSize: '10px', fontWeight: 700,
                    padding: '3px 8px', borderRadius: '20px', backdropFilter: 'blur(4px)',
                  }}>
                    {p.imagen ? '📷 Imagen' : '🎨 Gradiente'}
                  </span>
                  <span style={{
                    position: 'relative', zIndex: 1,
                    background: 'rgba(255,255,255,0.9)', color: P,
                    fontSize: '11px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '20px',
                  }}>
                    {p.cat}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: 0 }}>
                      {p.titulo}
                    </h3>
                    <span style={{ fontSize: '12px', color: '#9CA3AF', flexShrink: 0 }}>{p.año}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6B7280', lineHeight: 1.5, marginBottom: '12px' }}>
                    {p.desc.slice(0, 80)}{p.desc.length > 80 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {p.tags.map(t => (
                      <span key={t} style={{
                        fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                        background: `${P}10`, color: P, fontWeight: 600,
                      }}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <Link
                      to={`/admin/portafolio/${p._id ?? p.titulo}`}
                      style={{
                        flex: 1, textAlign: 'center',
                        padding: '8px', borderRadius: '8px',
                        background: '#EFF6FF', color: '#0284C7',
                        textDecoration: 'none', fontSize: '13px', fontWeight: 700,
                        border: '1px solid #BAE6FD',
                      }}
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(p._id!, p.titulo)}
                      disabled={!p._id}
                      title={!p._id ? 'Migra los datos a Firestore para poder eliminar' : ''}
                      style={{
                        flex: 1, padding: '8px', borderRadius: '8px',
                        background: '#FEF2F2', color: '#EF4444',
                        border: '1px solid #FCA5A5',
                        fontSize: '13px', fontWeight: 700, cursor: p._id ? 'pointer' : 'not-allowed',
                        opacity: p._id ? 1 : 0.5,
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

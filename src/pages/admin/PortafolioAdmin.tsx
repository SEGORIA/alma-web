import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getProyectos, deleteProyecto } from '../../lib/db'
/* tokens P/PL ahora vienen del tema ADM */
import type { Proyecto } from '../../data/portafolio'
import { confirmar } from '../../components/admin/Feedback'
import { CardGridSkeleton } from '../../components/admin/Loading'
import { AdminListHeader, AdminEmptyState } from '../../components/admin/AdminListPage'
import { ADM } from '../../lib/adminTheme'

const { DIM, BDR, MUT, WHT } = ADM
const P  = ADM.C1

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
    if (!(await confirmar(`¿Eliminar "${titulo}" del portafolio?`))) return
    await deleteProyecto(id)
    load()
  }

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)' }}>

        {/* Header */}
        <AdminListHeader
          icon="🖼️" title="Portafolio" count={proyectos.length} countLabel="proyecto"
          ctaLabel="+ Nuevo proyecto" ctaTo="/admin/portafolio/nuevo" color="#6B21A8"
        />

        {/* Grid */}
        {loading ? (
          <CardGridSkeleton cards={6} />
        ) : proyectos.length === 0 ? (
          <AdminEmptyState
            icon="🖼️" title="No hay proyectos aún"
            subtitle="Agrega proyectos o migra los datos desde el dashboard."
            ctaLabel="+ Agregar primer proyecto →" ctaTo="/admin/portafolio/nuevo" color="#6B21A8"
          />
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
                  background: DIM, borderRadius: '16px',
                  border: `1px solid ${BDR}`, overflow: 'hidden',
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
                      background: 'rgba(255,255,255,0.9)', color: ADM.AMB,
                      fontSize: '12px', fontWeight: 800, padding: '3px 10px',
                      borderRadius: '20px', zIndex: 1,
                    }}>
                      ★ Destacado
                    </span>
                  )}
                  {/* Badge imagen vs gradiente */}
                  <span style={{
                    position: 'absolute', bottom: '8px', right: '8px', zIndex: 1,
                    background: p.imagen ? 'rgba(5,150,105,0.9)' : 'rgba(0,0,0,0.4)',
                    color: '#fff', fontSize: '12px', fontWeight: 700,
                    padding: '3px 8px', borderRadius: '20px', backdropFilter: 'blur(4px)',
                  }}>
                    {p.imagen ? '📷 Imagen' : '🎨 Gradiente'}
                  </span>
                  <span style={{
                    position: 'relative', zIndex: 1,
                    background: 'rgba(255,255,255,0.9)', color: P,
                    fontSize: '12px', fontWeight: 700,
                    padding: '4px 12px', borderRadius: '20px',
                  }}>
                    {p.cat}
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: WHT, margin: 0 }}>
                      {p.titulo}
                    </h3>
                    <span style={{ fontSize: '12px', color: MUT, flexShrink: 0 }}>{p.año}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: MUT, lineHeight: 1.5, marginBottom: '12px' }}>
                    {p.desc.slice(0, 80)}{p.desc.length > 80 ? '…' : ''}
                  </p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    {p.tags.map(t => (
                      <span key={t} style={{
                        fontSize: '12px', padding: '2px 8px', borderRadius: '20px',
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
                        background: 'rgba(107,33,168,0.08)', color: '#6B21A8',
                        textDecoration: 'none', fontSize: '13px', fontWeight: 700,
                        border: '1px solid rgba(107,33,168,0.2)',
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
                        background: 'rgba(239,68,68,0.10)', color: '#EF4444',
                        border: '1px solid rgba(239,68,68,0.35)',
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

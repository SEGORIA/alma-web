import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getArticulos, deleteArticulo } from '../../lib/db'
import { Y } from '../../tokens'
import type { Articulo } from '../../data/articulos'
import { confirmar } from '../../components/admin/Feedback'
import { ListSkeleton } from '../../components/admin/Loading'
import { AdminListHeader, AdminEmptyState } from '../../components/admin/AdminListPage'
import { ADM } from '../../lib/adminTheme'

const { DIM, BDR, MUT, WHT } = ADM
const P  = ADM.C1

export default function BlogAdmin() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading,   setLoading]   = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await getArticulos()
    setArticulos(data)
    setLoading(false)
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch inicial al montar
  useEffect(() => { load() }, [])

  const handleDelete = async (id: string, titulo: string) => {
    if (!(await confirmar(`¿Eliminar el artículo "${titulo}"? Esta acción no se puede deshacer.`))) return
    await deleteArticulo(id)
    load()
  }

  return (
    <AdminLayout>
      <div style={{ padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 32px)' }}>

        {/* Header */}
        <AdminListHeader
          icon="✍️" title="Blog" count={articulos.length} countLabel="artículo publicado"
          ctaLabel="+ Nuevo artículo" ctaTo="/admin/blog/nuevo" color={P}
        />

        {/* Lista */}
        {loading ? (
          <ListSkeleton rows={4} />
        ) : articulos.length === 0 ? (
          <AdminEmptyState
            icon="📝" title="No hay artículos aún"
            subtitle="Crea tu primer artículo o migra los datos desde el dashboard."
            ctaLabel="+ Crear primer artículo →" ctaTo="/admin/blog/nuevo" color={P}
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {articulos.map(a => (
              <div
                key={a._id ?? a.slug}
                style={{
                  background: DIM, borderRadius: '16px',
                  padding: '20px 24px', border: `1px solid ${BDR}`,
                  display: 'flex', alignItems: 'center', gap: '16px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Emoji badge */}
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: a.gradient, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  {a.emoji}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <h3 style={{
                      fontSize: '15px', fontWeight: 800, color: WHT,
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {a.titulo}
                    </h3>
                    {a.destacado && (
                      <span style={{
                        fontSize: '12px', fontWeight: 700, color: ADM.AMB,
                        background: `${Y}30`, padding: '2px 8px', borderRadius: '20px',
                        flexShrink: 0,
                      }}>
                        ★ Destacado
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: MUT, margin: 0 }}>
                    {a.cat} · {a.fecha} · {a.minutos} min · /{a.slug}
                  </p>
                </div>

                {/* Acciones */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <a
                    href={`/blog/${a.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '7px 14px', borderRadius: '8px',
                      border: `1px solid ${BDR}`, background: DIM,
                      color: WHT, textDecoration: 'none',
                      fontSize: '12px', fontWeight: 600,
                    }}
                  >
                    Ver
                  </a>
                  <Link
                    to={`/admin/blog/${a._id ?? a.slug}`}
                    style={{
                      padding: '7px 14px', borderRadius: '8px',
                      background: `${P}15`, color: P,
                      textDecoration: 'none', fontSize: '12px', fontWeight: 700,
                      border: `1px solid ${P}30`,
                    }}
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(a._id!, a.titulo)}
                    disabled={!a._id}
                    title={!a._id ? 'Migra los datos a Firestore para poder eliminar' : ''}
                    style={{
                      padding: '7px 14px', borderRadius: '8px',
                      background: 'rgba(239,68,68,0.10)', color: '#EF4444',
                      border: '1px solid rgba(239,68,68,0.35)',
                      fontSize: '12px', fontWeight: 700,
                      cursor: a._id ? 'pointer' : 'not-allowed',
                      opacity: a._id ? 1 : 0.5,
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { getArticulos, deleteArticulo } from '../../lib/db'
import { P, Y } from '../../tokens'
import type { Articulo } from '../../data/articulos'
import { confirmar } from '../../components/admin/Feedback'

export default function BlogAdmin() {
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const [loading,   setLoading]   = useState(true)

  const load = async () => {
    setLoading(true)
    const data = await getArticulos()
    setArticulos(data)
    setLoading(false)
  }

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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', marginBottom: '4px', letterSpacing: '-0.5px' }}>
              ✍️ Blog
            </h1>
            <p style={{ fontSize: '14px', color: '#6B7280' }}>
              {articulos.length} artículo{articulos.length !== 1 ? 's' : ''} publicado{articulos.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to="/admin/blog/nuevo"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: P, color: '#fff',
              padding: '11px 22px', borderRadius: '12px',
              textDecoration: 'none', fontWeight: 700, fontSize: '14px',
            }}
          >
            + Nuevo artículo
          </Link>
        </div>

        {/* Lista */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#6B7280', fontSize: '15px' }}>
            Cargando artículos…
          </div>
        ) : articulos.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '48px',
            textAlign: 'center', border: '1px solid #E5E7EB',
          }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>📝</span>
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
              No hay artículos aún
            </p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '24px' }}>
              Crea tu primer artículo o migra los datos desde el dashboard.
            </p>
            <Link to="/admin/blog/nuevo" style={{ color: P, fontWeight: 700, fontSize: '14px' }}>
              + Crear primer artículo →
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {articulos.map(a => (
              <div
                key={a._id ?? a.slug}
                style={{
                  background: '#fff', borderRadius: '16px',
                  padding: '20px 24px', border: '1px solid #E5E7EB',
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
                      fontSize: '15px', fontWeight: 800, color: '#111827',
                      margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {a.titulo}
                    </h3>
                    {a.destacado && (
                      <span style={{
                        fontSize: '12px', fontWeight: 700, color: '#78350F',
                        background: `${Y}30`, padding: '2px 8px', borderRadius: '20px',
                        flexShrink: 0,
                      }}>
                        ★ Destacado
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
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
                      border: '1px solid #E5E7EB', background: '#fff',
                      color: '#374151', textDecoration: 'none',
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
                      background: '#FEF2F2', color: '#EF4444',
                      border: '1px solid #FCA5A5',
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

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { articulos, catColor, type Bloque, type Articulo } from '../data/articulos'
import { P, Y } from '../tokens'
import { getArticulo, getContactoInfo } from '../lib/db'
import { contactoDefault } from '../data/config'
import SiteNav from '../components/SiteNav'

/* ── Bloque renderer ─────────────────────────────────────── */
function RenderBloque({ b }: { b: Bloque }) {
  switch (b.tipo) {
    case 'p':
      return (
        <p style={{
          fontSize: '17px', lineHeight: 1.85, color: '#374151',
          marginBottom: '20px',
        }}>
          {b.texto}
        </p>
      )

    case 'h2':
      return (
        <h2 style={{
          fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800,
          color: '#111827', letterSpacing: '-0.5px',
          marginTop: '44px', marginBottom: '16px',
          paddingBottom: '10px',
          borderBottom: `2px solid #F3F4F6`,
        }}>
          {b.texto}
        </h2>
      )

    case 'h3':
      return (
        <h3 style={{
          fontSize: '18px', fontWeight: 700, color: '#1F2937',
          marginTop: '28px', marginBottom: '12px',
        }}>
          {b.texto}
        </h3>
      )

    case 'lista':
      return (
        <ul style={{
          margin: '0 0 20px 0', padding: 0, listStyle: 'none',
          display: 'flex', flexDirection: 'column', gap: '10px',
        }}>
          {b.items.map((item, i) => (
            <li key={i} style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              fontSize: '16px', lineHeight: 1.65, color: '#374151',
            }}>
              <span style={{
                flexShrink: 0, marginTop: '6px',
                width: '7px', height: '7px', borderRadius: '50%',
                background: P, display: 'block',
              }} />
              {item}
            </li>
          ))}
        </ul>
      )

    case 'destacado':
      return (
        <blockquote style={{
          margin: '32px 0',
          padding: '24px 28px',
          background: `linear-gradient(135deg, rgba(107,33,168,0.06) 0%, rgba(147,51,234,0.06) 100%)`,
          borderLeft: `4px solid ${P}`,
          borderRadius: '0 16px 16px 0',
        }}>
          <p style={{
            fontSize: '17px', fontWeight: 600, lineHeight: 1.7,
            color: '#1F2937', margin: 0, fontStyle: 'italic',
          }}>
            {b.texto}
          </p>
        </blockquote>
      )

    case 'tip':
      return (
        <div style={{
          margin: '28px 0',
          padding: '20px 24px',
          background: `linear-gradient(135deg, ${Y}22 0%, ${Y}11 100%)`,
          border: `1.5px solid ${Y}88`,
          borderRadius: '16px',
          display: 'flex', gap: '14px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '2px' }}>💡</span>
          <div>
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#92400E', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {b.titulo}
            </p>
            <p style={{ fontSize: '15px', lineHeight: 1.65, color: '#374151', margin: 0 }}>
              {b.texto}
            </p>
          </div>
        </div>
      )

    case 'separador':
      return (
        <div style={{
          margin: '40px 0',
          display: 'flex', alignItems: 'center', gap: '16px',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%', background: P,
          }} />
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>
      )

    case 'imagen':
      if (!b.url) return null
      return (
        <figure style={{ margin: '36px 0' }}>
          <img
            src={b.url}
            alt={b.alt ?? ''}
            style={{
              width: '100%', borderRadius: '16px',
              display: 'block', maxHeight: '500px',
              objectFit: 'cover',
              boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
            }}
          />
          {b.caption && (
            <figcaption style={{
              textAlign: 'center', fontSize: '13px',
              color: '#9CA3AF', marginTop: '10px',
              fontStyle: 'italic',
            }}>
              {b.caption}
            </figcaption>
          )}
        </figure>
      )

    default:
      return null
  }
}

/* ── ArticuloPage ────────────────────────────────────────── */
export default function ArticuloPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [articulo, setArticulo] = useState<Articulo | null>(
    articulos.find(a => a.slug === slug) ?? null
  )
  const [waPhone, setWaPhone] = useState(contactoDefault.whatsapp)

  useEffect(() => {
    window.scrollTo(0, 0)
    if (slug) getArticulo(slug).then(a => setArticulo(a))
    getContactoInfo().then(c => setWaPhone(c.whatsapp))
  }, [slug])

  if (!articulo) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#F9FAFB', gap: '20px',
      }}>
        <span style={{ fontSize: '64px' }}>🔍</span>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>Artículo no encontrado</h2>
        <button
          onClick={() => navigate('/blog')}
          style={{
            background: P, color: '#fff', border: 'none',
            padding: '12px 24px', borderRadius: '12px',
            fontWeight: 700, fontSize: '15px', cursor: 'pointer',
          }}
        >
          Ver todos los artículos
        </button>
      </div>
    )
  }

  const color         = catColor[articulo.cat] ?? P
  const waText        = encodeURIComponent(`Hola, leí "${articulo.titulo}" en el blog de Alma y me gustaría saber más sobre sus servicios`)
  const waLink        = `https://wa.me/${waPhone}?text=${waText}`
  const relacionados  = articulos.filter(a => a.slug !== slug).slice(0, 3)

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <Helmet>
        <title>{articulo.titulo} | Blog Alma Agencia Creativa</title>
        <meta name="description" content={articulo.excerpt} />
        <meta property="og:title" content={articulo.titulo} />
        <meta property="og:description" content={articulo.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:locale" content="es_CO" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={articulo.titulo} />
        <meta name="twitter:description" content={articulo.excerpt} />
        <link rel="canonical" href={`https://almaagenciacreativa.com/blog/${articulo.slug}`} />
      </Helmet>
      <SiteNav />

      {/* Hero */}
      <div style={{
        background: articulo.gradient,
        paddingTop: '68px',
        minHeight: '340px',
        display: 'flex', alignItems: 'flex-end',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.18)' }} />
        {/* Emoji decoration */}
        <div style={{
          position: 'absolute', right: '5%', top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 'clamp(80px,15vw,140px)',
          opacity: 0.25,
          userSelect: 'none',
        }}>
          {articulo.emoji}
        </div>

        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: '800px', margin: '0 auto', padding: '60px 24px 48px',
          width: '100%',
        }}>
          {/* Breadcrumb */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            marginBottom: '20px',
          }}>
            <Link to="/#blog" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              Inicio
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>›</span>
            <Link to="/blog" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', fontWeight: 500, textDecoration: 'none' }}>
              Blog
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>›</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600 }}>{articulo.cat}</span>
          </div>

          {/* Category badge */}
          <span style={{
            display: 'inline-block',
            background: 'rgba(255,255,255,0.2)',
            border: '1px solid rgba(255,255,255,0.4)',
            color: '#fff', fontSize: '12px', fontWeight: 700,
            padding: '4px 14px', borderRadius: '20px',
            letterSpacing: '1px', textTransform: 'uppercase',
            marginBottom: '16px',
          }}>
            {articulo.cat}
          </span>

          <h1 style={{
            fontSize: 'clamp(24px,5vw,42px)', fontWeight: 900,
            color: '#fff', lineHeight: 1.15,
            letterSpacing: '-1px', marginBottom: '20px',
            textShadow: '0 2px 16px rgba(0,0,0,0.2)',
          }}>
            {articulo.titulo}
          </h1>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 500 }}>
              🕐 {articulo.minutos} min de lectura
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 500 }}>
              {articulo.fecha}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>·</span>
            <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 500 }}>
              por Alma Agencia
            </span>
          </div>
        </div>
      </div>

      {/* Excerpt strip */}
      <div style={{ background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 24px' }}>
          <p style={{
            fontSize: '17px', lineHeight: 1.7, color: '#4B5563',
            fontStyle: 'italic', margin: 0,
            borderLeft: `3px solid ${color}`,
            paddingLeft: '16px',
          }}>
            {articulo.excerpt}
          </p>
        </div>
      </div>

      {/* Article body */}
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          maxWidth: '800px', margin: '0 auto',
          padding: '52px 24px 40px',
        }}
      >
        {articulo.contenido.map((bloque, i) => (
          <RenderBloque key={i} b={bloque} />
        ))}
      </motion.article>

      {/* CTA */}
      <div style={{
        maxWidth: '800px', margin: '0 auto',
        padding: '0 24px 64px',
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${P} 0%, #9333EA 100%)`,
          borderRadius: '24px',
          padding: '40px 36px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '10px' }}>
            ¿Listo para transformar tu marca?
          </p>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, marginBottom: '28px', maxWidth: '420px', margin: '0 auto 28px' }}>
            Cuéntanos tu proyecto. En Alma trabajamos con negocios que quieren resultados reales.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#fff', color: P,
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              💬 Hablar por WhatsApp
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.15)', color: '#fff',
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.35)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.25)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            >
              Iniciar proyecto →
            </a>
          </div>
        </div>
      </div>

      {/* Artículos relacionados */}
      <div style={{
        background: '#F9FAFB',
        borderTop: '1px solid #E5E7EB',
        padding: '60px 24px',
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 style={{
            fontSize: '20px', fontWeight: 800, color: '#111827',
            marginBottom: '28px', letterSpacing: '-0.5px',
          }}>
            Más artículos que te pueden interesar
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            {relacionados.map(rel => (
              <Link
                key={rel.slug}
                to={`/blog/${rel.slug}`}
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: '#fff', borderRadius: '16px',
                    border: '1.5px solid #E5E7EB', overflow: 'hidden',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.border = `1.5px solid ${P}`
                    el.style.boxShadow = '0 8px 32px rgba(107,33,168,0.12)'
                    el.style.transform = 'translateY(-3px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement
                    el.style.border = '1.5px solid #E5E7EB'
                    el.style.boxShadow = 'none'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{
                    background: rel.gradient, height: '90px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '32px',
                  }}>
                    {rel.emoji}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 700,
                      color: catColor[rel.cat] ?? P,
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                      display: 'block', marginBottom: '6px',
                    }}>
                      {rel.cat}
                    </span>
                    <p style={{
                      fontSize: '13px', fontWeight: 700, color: '#111827',
                      lineHeight: 1.4, margin: 0,
                    }}>
                      {rel.titulo}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '8px', fontWeight: 500 }}>
                      🕐 {rel.minutos} min
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: '36px' }}>
            <Link
              to="/blog"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                color: P, fontWeight: 700, fontSize: '14px',
                textDecoration: 'none',
                transition: 'opacity 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '0.75')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              Ver todos los artículos →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer mini */}
      <footer style={{
        background: '#111827', padding: '28px 24px',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{ background: P, padding: '4px 10px', borderRadius: '8px', display: 'inline-flex' }}>
            <img src="/alma-logo.png" alt="Alma" style={{ height: '28px', width: 'auto' }} />
          </div>
        </div>
        <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
          © {new Date().getFullYear()} Alma Agencia Creativa · Manizales, Colombia
        </p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '12px' }}>
          <Link to="/" style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
          >
            Inicio
          </Link>
          <Link to="/blog" style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
          >
            Blog
          </Link>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
          >
            Contacto
          </a>
        </div>
      </footer>
    </div>
  )
}

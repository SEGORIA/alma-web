import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { articulos, catColor, categorias, type Articulo } from '../data/articulos'
import { P, Y, WA_PROYECTO } from '../tokens'

/* ── Navbar ──────────────────────────────────────────────── */
function NavBar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      backdropFilter: 'blur(20px)',
      background: 'rgba(255,255,255,0.96)',
      borderBottom: '1px solid rgba(107,33,168,0.1)',
      boxShadow: scrolled ? '0 2px 20px rgba(107,33,168,0.08)' : 'none',
      transition: 'box-shadow 0.3s ease',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto', padding: '0 24px',
        height: '68px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
          <div style={{
            background: P, padding: '5px 12px',
            borderRadius: '10px', display: 'inline-flex', alignItems: 'center',
          }}>
            <img
              src="/alma-logo.png"
              alt="Alma Agencia Creativa"
              style={{ height: '48px', width: 'auto' }}
            />
          </div>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            to="/"
            style={{
              color: '#6B7280', fontWeight: 500, fontSize: '14px',
              textDecoration: 'none', transition: 'color 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = P)}
            onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
          >
            ← Inicio
          </Link>
          <a
            href={WA_PROYECTO}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: P, color: '#fff',
              padding: '9px 20px', borderRadius: '10px',
              fontWeight: 600, fontSize: '14px', textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#581C87')}
            onMouseLeave={e => (e.currentTarget.style.background = P)}
          >
            Iniciar Proyecto
          </a>
        </div>
      </div>
    </nav>
  )
}

/* ── Article Card ────────────────────────────────────────── */
function ArticuloCard({ a, index, grande }: { a: Articulo; index: number; grande?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const color = catColor[a.cat] ?? P

  if (grande) {
    return (
      <Link to={`/blog/${a.slug}`} style={{ textDecoration: 'none', display: 'block', marginBottom: '28px' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            background: '#fff',
            borderRadius: '24px',
            border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
            overflow: 'hidden',
            boxShadow: hovered ? '0 24px 64px rgba(107,33,168,0.14)' : '0 4px 20px rgba(0,0,0,0.06)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
        >
          <div style={{
            background: a.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '280px', fontSize: '80px',
            position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.08)' }} />
            <span style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.2))' }}>
              {a.emoji}
            </span>
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              background: Y, color: '#111', fontSize: '11px', fontWeight: 800,
              padding: '5px 14px', borderRadius: '20px', letterSpacing: '0.5px',
            }}>
              ★ Destacado
            </div>
          </div>
          <div style={{ padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <span style={{
              fontSize: '11px', fontWeight: 700, color, letterSpacing: '1px',
              textTransform: 'uppercase', marginBottom: '14px', display: 'block',
            }}>
              {a.cat}
            </span>
            <h2 style={{
              fontSize: 'clamp(22px,2.8vw,30px)', fontWeight: 900,
              color: '#111827', lineHeight: 1.2, marginBottom: '16px',
              letterSpacing: '-0.5px',
            }}>
              {a.titulo}
            </h2>
            <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#6B7280', marginBottom: '28px' }}>
              {a.excerpt}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#9CA3AF', fontWeight: 500 }}>
                🕐 {a.minutos} min · {a.fecha}
              </span>
              <span style={{
                fontSize: '14px', fontWeight: 700, color: P,
                display: 'inline-flex', alignItems: 'center', gap: '4px',
                transform: hovered ? 'translateX(5px)' : 'translateX(0)',
                transition: 'transform 0.2s ease',
              }}>
                Leer artículo →
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    )
  }

  return (
    <Link to={`/blog/${a.slug}`} style={{ textDecoration: 'none', display: 'flex' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', flexDirection: 'column',
          background: '#fff', borderRadius: '20px',
          border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
          overflow: 'hidden',
          boxShadow: hovered ? '0 16px 48px rgba(107,33,168,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          cursor: 'pointer',
          width: '100%',
        }}
      >
        <div style={{
          background: a.gradient, height: '130px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '46px',
        }}>
          {a.emoji}
        </div>
        <div style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <span style={{
            fontSize: '10px', fontWeight: 700, color, letterSpacing: '1px',
            textTransform: 'uppercase', marginBottom: '10px', display: 'block',
          }}>
            {a.cat}
          </span>
          <h3 style={{
            fontSize: '16px', fontWeight: 800, color: '#111827',
            lineHeight: 1.35, marginBottom: '12px', flex: 1,
          }}>
            {a.titulo}
          </h3>
          <p style={{ fontSize: '13px', lineHeight: 1.65, color: '#9CA3AF', marginBottom: '18px' }}>
            {a.excerpt.slice(0, 100)}…
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
            <span style={{ fontSize: '12px', color: '#D1D5DB', fontWeight: 500 }}>
              🕐 {a.minutos} min · {a.fecha}
            </span>
            <span style={{
              fontSize: '13px', fontWeight: 700, color: P,
              transform: hovered ? 'translateX(3px)' : 'translateX(0)',
              transition: 'transform 0.2s ease',
            }}>
              Leer →
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

/* ── BlogPage ────────────────────────────────────────────── */
export default function BlogPage() {
  const [filtro, setFiltro] = useState('Todos')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const destacado   = articulos.find(a => a.destacado)!
  const sinDestacado = articulos.filter(a => !a.destacado)
  const visibles    = filtro === 'Todos' ? sinDestacado : articulos.filter(a => a.cat === filtro)
  const isMobile    = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <NavBar />

      {/* Page hero */}
      <div style={{
        background: `linear-gradient(135deg, ${P} 0%, #9333EA 100%)`,
        paddingTop: '68px',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            maxWidth: '1100px', margin: '0 auto',
            padding: '64px 24px 56px',
            textAlign: 'center',
          }}
        >
          <p style={{
            color: Y, fontSize: '12px', fontWeight: 700,
            letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px',
          }}>
            Blog & Recursos
          </p>
          <h1 style={{
            fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900,
            color: '#fff', letterSpacing: '-2px', lineHeight: 1.05,
            marginBottom: '18px',
          }}>
            Ideas que te ayudan<br />a crecer tu marca
          </h1>
          <p style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7, maxWidth: '520px', margin: '0 auto',
          }}>
            Consejos prácticos de branding, diseño web y marketing digital para negocios en Colombia.
          </p>
        </motion.div>
      </div>

      {/* Filtros */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E5E7EB', position: 'sticky', top: '68px', zIndex: 50 }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto',
          padding: '16px 24px',
          display: 'flex', gap: '8px', flexWrap: 'wrap',
          overflowX: 'auto',
        }}>
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setFiltro(cat)}
              style={{
                padding: '8px 20px', borderRadius: '20px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                background: filtro === cat ? P : 'transparent',
                color:      filtro === cat ? '#fff' : '#6B7280',
                boxShadow:  filtro === cat ? `0 4px 14px rgba(107,33,168,0.25)` : 'none',
                border: `1.5px solid ${filtro === cat ? P : '#E5E7EB'}`,
                transition: 'all 0.2s ease',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px' }}>

        {/* Destacado — only on "Todos" */}
        {filtro === 'Todos' && (
          <ArticuloCard a={destacado} index={0} grande />
        )}

        {/* Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '20px',
        }}>
          {visibles.map((a, i) => (
            <ArticuloCard key={a.slug} a={a} index={i} />
          ))}
        </div>

        {visibles.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 0', color: '#9CA3AF' }}>
            <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔍</span>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No hay artículos en esta categoría todavía.</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ background: '#111827', padding: '60px 24px' }}>
        <div style={{
          maxWidth: '600px', margin: '0 auto', textAlign: 'center',
        }}>
          <p style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
            ¿Tienes un proyecto en mente?
          </p>
          <p style={{ fontSize: '15px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '28px' }}>
            En Alma convertimos ideas en marcas que generan resultados reales.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={WA_PROYECTO}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: P, color: '#fff',
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#581C87')}
              onMouseLeave={e => (e.currentTarget.style.background = P)}
            >
              Iniciar proyecto →
            </a>
            <Link
              to="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'rgba(255,255,255,0.08)', color: '#fff',
                padding: '14px 28px', borderRadius: '12px',
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            >
              Ver nuestros servicios
            </Link>
          </div>
        </div>

        {/* Footer bottom */}
        <div style={{ maxWidth: '1100px', margin: '48px auto 0', borderTop: '1px solid #1F2937', paddingTop: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: P, padding: '4px 10px', borderRadius: '8px', display: 'inline-flex' }}>
                <img src="/alma-logo.png" alt="Alma" style={{ height: '28px', width: 'auto' }} />
              </div>
              <span style={{ color: '#6B7280', fontSize: '13px' }}>
                © {new Date().getFullYear()} Alma Agencia Creativa · Manizales
              </span>
            </div>
            <div style={{ display: 'flex', gap: '20px' }}>
              <Link to="/" style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
              >
                Inicio
              </Link>
              <a
                href="https://instagram.com/alma.agenciacreativa"
                target="_blank" rel="noopener noreferrer"
                style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
              >
                Instagram
              </a>
              <a href={WA_PROYECTO} target="_blank" rel="noopener noreferrer"
                style={{ color: '#6B7280', fontSize: '13px', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { P, Y } from '../tokens'
import { getProyectos } from '../lib/db'
import { getContactoInfo } from '../lib/db'
import { proyectosEstaticos, filtrosPortafolio, type Proyecto } from '../data/portafolio'
import { contactoDefault } from '../data/config'
import SiteNav from '../components/SiteNav'
import { SkeletonProyectoCard } from '../components/Skeleton'
import CasoEstudioModal from '../components/CasoEstudioModal'

/* ── Tag ──────────────────────────────────────────────────── */
function Tag({ label }: { label: string }) {
  return (
    <span style={{
      fontSize: '12px', fontWeight: 600, padding: '3px 10px',
      borderRadius: '20px', background: 'rgba(107,33,168,0.08)',
      color: P, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

/* ── ProyectoCard ─────────────────────────────────────────── */
function ProyectoCard({ p, index, waBase, onVerCaso }: { p: Proyecto; index: number; waBase: string; onVerCaso: (p: Proyecto) => void }) {
  const [hovered, setHovered] = useState(false)
  const waText = encodeURIComponent(
    `Hola, me interesa conocer más sobre el proyecto ${p.titulo} que vi en el portafolio de Alma`
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: '20px', overflow: 'hidden',
        border: `1.5px solid ${hovered ? P : '#E5E7EB'}`,
        boxShadow: hovered ? '0 16px 48px rgba(107,33,168,0.12)' : '0 2px 12px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column',
        cursor: 'pointer',
      }}
    >
      {/* Visual */}
      <div style={{
        position: 'relative',
        height: p.featured ? '220px' : '180px',
        background: p.g, overflow: 'hidden', flexShrink: 0,
      }}>
        {/* Imagen real si existe */}
        {p.imagen && (
          <img
            src={p.imagen}
            alt={p.titulo}
            loading="lazy"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
            }}
          />
        )}
        {/* Decoración cuando no hay imagen */}
        {!p.imagen && (
          <>
            <div style={{ position: 'absolute', bottom: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ height: '8px', width: '60%', background: 'rgba(255,255,255,0.5)', borderRadius: '4px' }} />
              <div style={{ height: '6px', width: '40%', background: 'rgba(255,255,255,0.3)', borderRadius: '4px' }} />
            </div>
          </>
        )}
        {/* Overlay para legibilidad cuando hay imagen */}
        {p.imagen && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.28)' }} />}

        {/* Badges */}
        <div style={{
          position: 'absolute', top: '14px', left: '14px',
          background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)',
          padding: '5px 12px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 700, color: P,
        }}>
          {p.cat}
        </div>
        <div style={{
          position: 'absolute', top: '14px', right: '14px',
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)',
          padding: '5px 10px', borderRadius: '20px',
          fontSize: '12px', fontWeight: 600, color: '#fff',
        }}>
          {p.año}
        </div>
        {p.featured && (
          <div style={{
            position: 'absolute', bottom: '14px', left: '14px',
            background: Y, color: '#111',
            fontSize: '12px', fontWeight: 800, padding: '4px 12px', borderRadius: '20px',
          }}>
            ★ Destacado
          </div>
        )}
      </div>

      {/* Contenido */}
      <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0 }}>
          {p.titulo}
        </h3>
        <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.65, margin: 0, flex: 1 }}>
          {p.desc}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {p.tags.map(t => <Tag key={t} label={t} />)}
        </div>
        <button
          onClick={() => onVerCaso(p)}
          style={{
            marginTop: '4px', display: 'flex',
            alignItems: 'center', justifyContent: 'space-between',
            padding: '11px 16px', borderRadius: '10px',
            background: hovered ? P : '#F5F3FF', color: hovered ? '#fff' : P,
            fontWeight: 700, fontSize: '13px',
            border: 'none', cursor: 'pointer', width: '100%',
            transition: 'all 0.25s ease',
          }}
        >
          Ver caso de estudio <span style={{ fontSize: '16px' }}>→</span>
        </button>
      </div>
    </motion.div>
  )
}

/* ── PortafolioPage ──────────────────────────────────────── */
export default function PortafolioPage() {
  const [filtro,      setFiltro]      = useState('Todos')
  const [proyectos,   setProyectos]   = useState<Proyecto[]>(proyectosEstaticos)
  const [loading,     setLoading]     = useState(true)
  const [casoAbierto, setCasoAbierto] = useState<Proyecto | null>(null)
  const [waBase,    setWaBase]    = useState(`https://wa.me/${contactoDefault.whatsapp}`)
  const [waLink,    setWaLink]    = useState(
    `https://wa.me/${contactoDefault.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`
  )

  useEffect(() => {
    window.scrollTo(0, 0)
    getProyectos().then(data => { setProyectos(data); setLoading(false) })
      .catch(() => setLoading(false))
    getContactoInfo().then(c => {
      setWaBase(`https://wa.me/${c.whatsapp}`)
      setWaLink(`https://wa.me/${c.whatsapp}?text=Hola%2C%20quiero%20empezar%20mi%20proyecto%20con%20Alma`)
    })
  }, [])

  const filtered = filtro === 'Todos'
    ? proyectos
    : proyectos.filter(p => p.cat === filtro)

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <Helmet>
        <title>Portafolio | Alma Agencia Creativa — Branding, diseño web y marketing digital</title>
        <meta name="description" content="Proyectos de branding, diseño web y marketing digital para marcas en Colombia. Conoce nuestros casos de éxito." />
        <meta property="og:title" content="Portafolio | Alma Agencia Creativa" />
        <meta property="og:description" content="Proyectos de branding, diseño web y marketing digital que hablan por sí solos." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://almaagenciacreativa.com/portafolio" />
      </Helmet>
      <SiteNav activePath="/portafolio" />

      {/* Hero */}
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
            Nuestro trabajo
          </p>
          <h1 style={{
            fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900,
            color: '#fff', letterSpacing: '-2px', lineHeight: 1.05, marginBottom: '18px',
          }}>
            Proyectos que hablan<br />por sí solos
          </h1>
          <p style={{
            fontSize: '17px', color: 'rgba(255,255,255,0.8)',
            lineHeight: 1.7, maxWidth: '520px', margin: '0 auto',
          }}>
            Branding, diseño web y marketing digital para marcas que quieren crecer de verdad.
          </p>
        </motion.div>
      </div>

      {/* Filtros */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #E5E7EB',
      }}>
        <div style={{
          maxWidth: '1100px', margin: '0 auto', padding: '16px 24px',
          display: 'flex', gap: '8px', flexWrap: 'wrap', overflowX: 'auto',
        }}>
          {filtrosPortafolio.map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              style={{
                padding: '10px 20px', borderRadius: '20px', cursor: 'pointer',
                fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap',
                minHeight: '44px',
                background: filtro === f ? P : 'transparent',
                color: filtro === f ? '#fff' : '#6B7280',
                boxShadow: filtro === f ? '0 4px 14px rgba(107,33,168,0.25)' : 'none',
                border: `1.5px solid ${filtro === f ? P : '#E5E7EB'}`,
                transition: 'all 0.2s ease',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de proyectos */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px 24px 80px' }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {[0, 1, 2, 3, 4, 5].map(i => <SkeletonProyectoCard key={i} />)}
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={filtro}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '24px',
                }}
              >
                {filtered.map((p, i) => (
                  <ProyectoCard key={p._id ?? p.titulo} p={p} index={i} waBase={waBase} onVerCaso={setCasoAbierto} />
                ))}
              </motion.div>
            </AnimatePresence>

            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 0', color: '#9CA3AF' }}>
                <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>🔍</span>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>
                  No hay proyectos en esta categoría todavía.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer CTA */}
      <div style={{ background: '#111827', padding: '60px 24px' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: 900, color: '#fff', marginBottom: '12px' }}>
            ¿Tu proyecto podría estar aquí?
          </p>
          <p style={{ fontSize: '15px', color: '#9CA3AF', lineHeight: 1.7, marginBottom: '28px' }}>
            En Alma convertimos ideas en marcas que generan resultados reales.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={waLink}
              target="_blank" rel="noopener noreferrer"
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
              to="/blog"
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
              Ver el blog
            </Link>
          </div>
        </div>

        {/* Footer bottom */}
        <div style={{
          maxWidth: '1100px', margin: '48px auto 0',
          borderTop: '1px solid #1F2937', paddingTop: '28px',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '16px',
          }}>
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
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Caso de estudio modal ── */}
      {casoAbierto && (
        <CasoEstudioModal
          proyecto={casoAbierto}
          waBase={waBase}
          onClose={() => setCasoAbierto(null)}
        />
      )}
    </div>
  )
}

import { motion } from 'framer-motion'
import { useState } from 'react'
import { P, PL, Y } from '../tokens'
import { useIsMobile } from '../hooks/useIsMobile'

const IG_URL = 'https://instagram.com/alma.agenciacreativa'

/*
  ── Para reemplazar con fotos reales ──────────────────────────
  Copia las imágenes a la carpeta public/instagram/
  con los nombres: post1.jpg, post2.jpg … post6.jpg
  y el componente las cargará automáticamente.
  Si la imagen no existe, se muestra el placeholder de color.
  ─────────────────────────────────────────────────────────────
*/
const posts = [
  {
    id:       1,
    img:      '/instagram/post1.jpg',
    gradient: `linear-gradient(135deg, ${P} 0%, ${PL} 100%)`,
    emoji:    '🎨',
    tag:      'Branding',
  },
  {
    id:       2,
    img:      '/instagram/post2.jpg',
    gradient: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
    emoji:    '💻',
    tag:      'Diseño Web',
  },
  {
    id:       3,
    img:      '/instagram/post3.jpg',
    gradient: 'linear-gradient(135deg, #E11D48 0%, #FB7185 100%)',
    emoji:    '🚀',
    tag:      'Estrategia',
  },
  {
    id:       4,
    img:      '/instagram/post4.jpg',
    gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
    emoji:    '📱',
    tag:      'Redes Sociales',
  },
  {
    id:       5,
    img:      '/instagram/post5.jpg',
    gradient: `linear-gradient(135deg, #F59E0B 0%, ${Y} 100%)`,
    emoji:    '✨',
    tag:      'Identidad',
  },
  {
    id:       6,
    img:      '/instagram/post6.jpg',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
    emoji:    '🏆',
    tag:      'Portafolio',
  },
]

function PostCard({ post, index }: { post: typeof posts[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [imgError, setImgError] = useState(false)

  return (
    <motion.a
      href={IG_URL}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        textDecoration: 'none',
        position: 'relative',
        borderRadius: '16px',
        overflow: 'hidden',
        aspectRatio: '1 / 1',
        cursor: 'pointer',
        boxShadow: hovered
          ? '0 20px 56px rgba(107,33,168,0.22)'
          : '0 4px 16px rgba(0,0,0,0.08)',
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
        transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
      }}
    >
      {/* Imagen real o placeholder gradiente */}
      {!imgError ? (
        <img
          src={post.img}
          alt={post.tag}
          onError={() => setImgError(true)}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
          }}
        />
      ) : (
        /* Placeholder cuando no hay imagen real */
        <div style={{
          position: 'absolute', inset: 0,
          background: post.gradient,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '8px',
        }}>
          <span style={{ fontSize: '40px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}>
            {post.emoji}
          </span>
          <span style={{
            fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.85)',
            letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            {post.tag}
          </span>
        </div>
      )}

      {/* Overlay on hover */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, rgba(107,33,168,0.88) 0%, rgba(147,51,234,0.88) 100%)`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '8px',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}>
        {/* Instagram icon */}
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="1.8"/>
          <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
        </svg>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 700 }}>
          Ver en Instagram
        </span>
      </div>
    </motion.a>
  )
}

export default function InstaFeed() {
  const isMobile = useIsMobile()

  return (
    <section style={{ background: '#fff', padding: isMobile ? '60px 20px' : '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: '20px',
            marginBottom: isMobile ? '28px' : '40px',
          }}
        >
          {/* Left */}
          <div>
            <p style={{
              color: P, fontSize: '12px', fontWeight: 700,
              letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px',
            }}>
              Instagram
            </p>
            <h2 style={{
              fontSize: isMobile ? 'clamp(22px,6vw,32px)' : 'clamp(26px,3vw,38px)',
              fontWeight: 900, color: '#111827',
              letterSpacing: '-1.5px', lineHeight: 1.1,
              marginBottom: '8px',
            }}>
              Síguenos y mira{' '}
              <span style={{ color: P }}>cómo trabajamos</span>
            </h2>
            <p style={{
              fontSize: '15px', color: '#6B7280', lineHeight: 1.6,
            }}>
              Detrás de cámaras, proyectos y tips de cada semana.
            </p>
          </div>

          {/* Follow CTA */}
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              padding: '13px 24px', borderRadius: '12px',
              textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
              fontWeight: 700, fontSize: '14px',
              background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(131,58,180,0.3)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = '0.9'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = '1'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {/* Instagram icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2"/>
              <circle cx="17.5" cy="6.5" r="1.3" fill="white"/>
            </svg>
            @alma.agenciacreativa
          </a>
        </motion.div>

        {/* Grid de posts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? '10px' : '14px',
          marginBottom: isMobile ? '28px' : '40px',
        }}>
          {posts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} />
          ))}
        </div>

        {/* Strip inferior */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          style={{
            background: '#F9FAFB',
            borderRadius: '16px',
            padding: '20px 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Avatar placeholder */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: `linear-gradient(135deg, #833AB4, #FD1D1D, #F77737)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="6" stroke="white" strokeWidth="2"/>
                <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="2"/>
                <circle cx="17.5" cy="6.5" r="1.3" fill="white"/>
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '1px' }}>
                alma.agenciacreativa
              </p>
              <p style={{ fontSize: '12px', color: '#9CA3AF', fontWeight: 500 }}>
                Contenido nuevo cada semana
              </p>
            </div>
          </div>
          <a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: P, color: '#fff',
              padding: '10px 22px', borderRadius: '10px',
              fontWeight: 700, fontSize: '13px', textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#581C87')}
            onMouseLeave={e => (e.currentTarget.style.background = P)}
          >
            Seguir →
          </a>
        </motion.div>

      </div>
    </section>
  )
}

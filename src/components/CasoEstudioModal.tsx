import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { P } from '../tokens'
import type { Proyecto } from '../data/portafolio'

interface Props {
  proyecto: Proyecto
  waBase:   string
  onClose:  () => void
}

/* ── Sub-components ────────────────────────────────────────── */
function SectionLabel({ icon, title }: { icon: string; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>
      <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
        {title}
      </h3>
    </div>
  )
}

function TextSection({ icon, title, text }: { icon: string; title: string; text: string }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <SectionLabel icon={icon} title={title} />
      <p style={{ fontSize: '14px', lineHeight: 1.8, color: '#4B5563', margin: 0 }}>{text}</p>
    </div>
  )
}

/* ── CasoEstudioModal ──────────────────────────────────────── */
export default function CasoEstudioModal({ proyecto, waBase, onClose }: Props) {
  const cs = proyecto.casoEstudio
  const [lightbox, setLightbox] = useState<number | null>(null)

  /* ESC to close + body scroll lock */
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightbox !== null) setLightbox(null)
        else onClose()
      }
      if (e.key === 'ArrowRight' && lightbox !== null && cs?.imagenes)
        setLightbox(i => (i! + 1) % cs.imagenes!.length)
      if (e.key === 'ArrowLeft' && lightbox !== null && cs?.imagenes)
        setLightbox(i => (i! - 1 + cs.imagenes!.length) % cs.imagenes!.length)
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = prev
    }
  }, [onClose, lightbox, cs])

  const waText = encodeURIComponent(
    `Hola, vi el proyecto "${proyecto.titulo}" en el portafolio de Alma y me interesa algo similar.`
  )
  const waLink = `${waBase}?text=${waText}`
  const imagenes = cs?.imagenes?.filter(Boolean) ?? []

  /* ── Lightbox ── */
  const lightboxPortal = lightbox !== null && imagenes.length > 0 ? createPortal(
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => setLightbox(null)}
      style={{
        position: 'fixed', inset: 0, zIndex: 10000,
        background: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
      }}
    >
      {/* Prev */}
      {imagenes.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); setLightbox(i => (i! - 1 + imagenes.length) % imagenes.length) }}
          style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            width: '44px', height: '44px', borderRadius: '50%',
            color: '#fff', fontSize: '22px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >‹</button>
      )}
      <motion.img
        key={lightbox}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
        src={imagenes[lightbox]}
        alt={`${proyecto.titulo} — ${lightbox + 1}`}
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '90vw', maxHeight: '85vh',
          borderRadius: '16px', objectFit: 'contain',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
        }}
      />
      {/* Next */}
      {imagenes.length > 1 && (
        <button
          onClick={e => { e.stopPropagation(); setLightbox(i => (i! + 1) % imagenes.length) }}
          style={{
            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)', border: 'none',
            width: '44px', height: '44px', borderRadius: '50%',
            color: '#fff', fontSize: '22px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >›</button>
      )}
      {/* Counter */}
      {imagenes.length > 1 && (
        <div style={{
          position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.15)', color: '#fff',
          padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
        }}>
          {lightbox + 1} / {imagenes.length}
        </div>
      )}
      {/* Close */}
      <button
        onClick={() => setLightbox(null)}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'rgba(255,255,255,0.15)', border: 'none',
          width: '40px', height: '40px', borderRadius: '50%',
          color: '#fff', fontSize: '22px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          lineHeight: 1,
        }}
      >×</button>
    </motion.div>,
    document.body
  ) : null

  /* ── Main modal ── */
  const modal = (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.22 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '16px',
        }}
      >
        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{    opacity: 0, scale: 0.95, y: 24 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={e => e.stopPropagation()}
          style={{
            background: '#fff', borderRadius: '24px',
            width: '100%', maxWidth: '720px',
            maxHeight: 'calc(100vh - 32px)',
            overflowY: 'auto',
            boxShadow: '0 40px 120px rgba(0,0,0,0.4)',
            position: 'relative',
          }}
        >

          {/* ── Hero ── */}
          <div style={{
            height: '240px',
            background: proyecto.g,
            position: 'relative',
            borderRadius: '24px 24px 0 0',
            overflow: 'hidden',
            flexShrink: 0,
          }}>
            {proyecto.imagen && (
              <>
                <img
                  src={proyecto.imagen}
                  alt={proyecto.titulo}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)' }} />
              </>
            )}
            {!proyecto.imagen && (
              <>
                <div style={{ position: 'absolute', bottom: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                <div style={{ position: 'absolute', top: -30, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
              </>
            )}

            {/* ── Close ── */}
            <button
              onClick={onClose}
              aria-label="Cerrar"
              style={{
                position: 'absolute', top: '14px', right: '14px', zIndex: 3,
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'rgba(0,0,0,0.45)', border: '1.5px solid rgba(255,255,255,0.25)',
                color: '#fff', fontSize: '22px', lineHeight: 1,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.75)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.45)')}
            >×</button>

            {/* ── Title overlay ── */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2,
              padding: '20px 28px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
            }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.2)', color: '#fff',
                  fontSize: '12px', fontWeight: 700, padding: '3px 12px', borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.35)',
                }}>{proyecto.cat}</span>
                <span style={{
                  background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.85)',
                  fontSize: '12px', fontWeight: 600, padding: '3px 10px', borderRadius: '20px',
                }}>{proyecto.año}</span>
              </div>
              <h2 style={{
                fontSize: 'clamp(22px,4vw,30px)', fontWeight: 900,
                color: '#fff', margin: 0, letterSpacing: '-0.5px',
              }}>{proyecto.titulo}</h2>
            </div>
          </div>

          {/* ── Body ── */}
          <div style={{ padding: '28px 28px 36px' }}>

            {/* Tags */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {proyecto.tags.map(t => (
                <span key={t} style={{
                  fontSize: '12px', fontWeight: 600, padding: '4px 12px',
                  borderRadius: '20px', background: 'rgba(107,33,168,0.08)', color: P,
                }}>{t}</span>
              ))}
            </div>

            {/* Descripción */}
            <p style={{ fontSize: '15px', lineHeight: 1.75, color: '#4B5563', marginBottom: '24px' }}>
              {proyecto.desc}
            </p>

            {/* ── Galería ── */}
            {imagenes.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <SectionLabel icon="🖼️" title="Galería del proyecto" />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: imagenes.length === 1 ? '1fr'
                    : imagenes.length === 2 ? '1fr 1fr'
                    : imagenes.length === 4 ? '1fr 1fr'
                    : 'repeat(3, 1fr)',
                  gap: '8px',
                }}>
                  {imagenes.map((img, i) => (
                    <div
                      key={i}
                      onClick={() => setLightbox(i)}
                      style={{
                        height: imagenes.length === 1 ? '280px' : imagenes.length <= 2 ? '180px' : '160px',
                        borderRadius: '12px', overflow: 'hidden',
                        background: proyecto.g, cursor: 'zoom-in',
                        position: 'relative',
                      }}
                    >
                      <img
                        src={img}
                        alt={`${proyecto.titulo} ${i + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLImageElement).style.transform = 'scale(1)')}
                      />
                      {/* Zoom hint */}
                      <div style={{
                        position: 'absolute', top: '8px', right: '8px',
                        background: 'rgba(0,0,0,0.45)', color: '#fff',
                        width: '28px', height: '28px', borderRadius: '50%',
                        fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(4px)',
                        opacity: 0.8,
                        pointerEvents: 'none',
                      }}>⊕</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '6px', textAlign: 'center' }}>
                  Haz clic en una imagen para ampliarla
                </p>
              </div>
            )}

            {/* ── Desafío ── */}
            {cs?.desafio && <TextSection icon="🎯" title="El desafío" text={cs.desafio} />}

            {/* ── Solución ── */}
            {cs?.solucion && <TextSection icon="💡" title="Nuestra solución" text={cs.solucion} />}

            {/* ── Resultados ── */}
            {cs?.resultados && cs.resultados.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <SectionLabel icon="📊" title="Resultados obtenidos" />
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${Math.min(cs.resultados.length, 3)}, 1fr)`,
                  gap: '12px',
                }}>
                  {cs.resultados.map((r, i) => (
                    <div key={i} style={{
                      background: 'linear-gradient(135deg, rgba(107,33,168,0.06), rgba(147,51,234,0.06))',
                      border: '1px solid rgba(107,33,168,0.14)',
                      borderRadius: '14px', padding: '18px 14px', textAlign: 'center',
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: P, lineHeight: 1.45, margin: 0 }}>
                        {r}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Testimonial ── */}
            {cs?.testimonial && (
              <div style={{
                background: '#FAFAFA', border: '1px solid #E5E7EB',
                borderLeft: `4px solid ${P}`,
                borderRadius: '14px', padding: '20px 22px', marginBottom: '28px',
              }}>
                <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#374151', lineHeight: 1.75, margin: '0 0 10px' }}>
                  ❝ {cs.testimonial} ❞
                </p>
                {cs.testimonialAutor && (
                  <p style={{ fontSize: '13px', fontWeight: 700, color: P, margin: 0 }}>
                    — {cs.testimonialAutor}
                  </p>
                )}
              </div>
            )}

            {/* ── Divisor si no hay caso de estudio ── */}
            {!cs?.desafio && !cs?.solucion && !cs?.resultados?.length && !cs?.testimonial && imagenes.length === 0 && (
              <div style={{
                textAlign: 'center', padding: '12px 0 28px',
                color: '#9CA3AF', fontSize: '14px',
              }}>
                Caso de estudio completo próximamente ✨
              </div>
            )}

            {/* ── CTA ── */}
            <a
              href={waLink}
              target="_blank" rel="noopener noreferrer"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                background: P, color: '#fff',
                padding: '15px 24px', borderRadius: '14px',
                fontWeight: 700, fontSize: '15px',
                textDecoration: 'none',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#581C87')}
              onMouseLeave={e => (e.currentTarget.style.background = P)}
            >
              💬 Quiero un proyecto como este
            </a>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )

  return (
    <>
      {createPortal(modal, document.body)}
      {lightboxPortal}
    </>
  )
}

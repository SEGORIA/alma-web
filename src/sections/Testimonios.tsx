import { motion } from 'framer-motion'
import { P, Y } from '../tokens'

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={Y}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

type Testimonio = {
  nombre: string
  rol: string
  empresa: string
  texto: string
  iniciales: string
  color: string
}

const fila1: Testimonio[] = [
  {
    nombre: 'María Londoño',
    rol: 'Fundadora',
    empresa: 'Café Ritual',
    texto: 'Alma transformó nuestra marca por completo. El branding que crearon nos hizo destacar en un mercado muy competitivo. Cada detalle refleja exactamente quiénes somos.',
    iniciales: 'ML',
    color: 'linear-gradient(135deg,#F5D0FE,#A855F7)',
  },
  {
    nombre: 'Carlos Restrepo',
    rol: 'Director Comercial',
    empresa: 'Malasaña Store',
    texto: 'La tienda virtual que desarrollaron superó todas nuestras expectativas. Las ventas aumentaron un 40% el primer mes. El panel de administración es súper fácil de usar.',
    iniciales: 'CR',
    color: 'linear-gradient(135deg,#DDD6FE,#7C3AED)',
  },
  {
    nombre: 'Valentina Torres',
    rol: 'CEO',
    empresa: 'Prr Love',
    texto: 'El equipo de Alma entiende perfectamente lo que necesita una marca. Creatividad y estrategia en perfecto balance. El resultado fue mucho mejor de lo que imaginé.',
    iniciales: 'VT',
    color: 'linear-gradient(135deg,#FECDD3,#E11D48)',
  },
  {
    nombre: 'Andrés Gómez',
    rol: 'Director',
    empresa: 'Magic All Stars',
    texto: 'Gracias a la gestión de redes con Alma, pasamos de 500 a 8.000 seguidores en 3 meses. El contenido que crean conecta de verdad con nuestra audiencia.',
    iniciales: 'AG',
    color: 'linear-gradient(135deg,#FDE68A,#F59E0B)',
  },
]

const fila2: Testimonio[] = [
  {
    nombre: 'Sofía Ramírez',
    rol: 'Socia Directora',
    empresa: 'Nexo Legal',
    texto: 'Profesionalismo, creatividad y resultados reales. Alma es la agencia que todo negocio necesita. Nuestro sitio web ahora genera consultas todos los días.',
    iniciales: 'SR',
    color: 'linear-gradient(135deg,#BAE6FD,#0284C7)',
  },
  {
    nombre: 'Laura Díaz',
    rol: 'Propietaria',
    empresa: 'Bloom Spa',
    texto: 'Nuestro spa nunca había tenido tanta visibilidad digital. El contenido que crea Alma es hermoso y profesional. Las reservas online aumentaron un 60%.',
    iniciales: 'LD',
    color: 'linear-gradient(135deg,#D1FAE5,#059669)',
  },
  {
    nombre: 'Sebastián Moreno',
    rol: 'Gerente General',
    empresa: 'Café Ritual',
    texto: 'El proceso fue fluido desde el inicio. Entendieron nuestra esencia y la tradujeron perfectamente al diseño. Definitivamente los recomiendo sin dudarlo.',
    iniciales: 'SM',
    color: 'linear-gradient(135deg,#FED7AA,#EA580C)',
  },
  {
    nombre: 'Daniela Ospina',
    rol: 'Consultora',
    empresa: 'Marca Personal',
    texto: 'Contratamos el plan Marketing Pro y en 2 meses ya teníamos lista de espera. El equipo de Alma se convirtió en parte estratégica de nuestro negocio.',
    iniciales: 'DO',
    color: 'linear-gradient(135deg,#E0E7FF,#6366F1)',
  },
]

/* ── Card ──────────────────────────────────────────────────── */
function TestimonioCard({ t }: { t: Testimonio }) {
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #F3F4F6',
      borderRadius: '20px',
      padding: '28px',
      width: '320px',
      flexShrink: 0,
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    }}>
      {/* Stars */}
      <div style={{ display: 'flex', gap: '3px' }}>
        {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
      </div>

      {/* Texto */}
      <p style={{
        fontSize: '14px', lineHeight: 1.7,
        color: '#374151', flex: 1,
        fontStyle: 'italic',
      }}>
        "{t.texto}"
      </p>

      {/* Autor */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '42px', height: '42px', borderRadius: '50%',
          background: t.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '13px', fontWeight: 800, color: '#fff',
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
        }}>
          {t.iniciales}
        </div>
        <div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{t.nombre}</p>
          <p style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '1px' }}>
            {t.rol} · {t.empresa}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Marquee row ───────────────────────────────────────────── */
function MarqueeRow({ items, direction }: { items: Testimonio[]; direction: 'left' | 'right' }) {
  const doubled = [...items, ...items]
  const animFrom = direction === 'left' ? '0%'   : '-50%'
  const animTo   = direction === 'left' ? '-50%' : '0%'

  return (
    <div style={{ overflow: 'hidden', width: '100%' }}>
      <motion.div
        animate={{ x: [animFrom, animTo] }}
        transition={{
          duration: direction === 'left' ? 32 : 38,
          ease: 'linear',
          repeat: Infinity,
        }}
        whileHover={{ animationPlayState: 'paused' } as never}
        style={{
          display: 'flex',
          gap: '20px',
          width: 'max-content',
          cursor: 'default',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.animationPlayState = 'paused'}
        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.animationPlayState = 'running'}
      >
        {doubled.map((t, i) => (
          <TestimonioCard key={`${t.nombre}-${i}`} t={t} />
        ))}
      </motion.div>
    </div>
  )
}

/* ── Section ───────────────────────────────────────────────── */
export default function Testimonios() {
  return (
    <section style={{ background: '#F9FAFB', padding: '100px 0', overflow: 'hidden' }}>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '56px', padding: '0 24px' }}
      >
        <p style={{
          color: P, fontSize: '12px', fontWeight: 700,
          letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px',
        }}>
          Testimonios
        </p>
        <h2 style={{
          fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900,
          color: '#111827', letterSpacing: '-1px', lineHeight: 1.1,
        }}>
          Lo que dicen nuestros{' '}
          <span style={{ color: P }}>clientes</span>
        </h2>
        <p style={{
          color: '#6B7280', fontSize: '16px', marginTop: '16px',
          maxWidth: '440px', margin: '16px auto 0', lineHeight: 1.65,
        }}>
          Más de 150 proyectos entregados y una comunidad de clientes que confían en Alma para crecer.
        </p>
      </motion.div>

      {/* Filas de testimonios */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <MarqueeRow items={fila1} direction="left" />
        <MarqueeRow items={fila2} direction="right" />
      </div>

      {/* Badge de confianza */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{
          display: 'flex', justifyContent: 'center',
          marginTop: '56px', padding: '0 24px',
        }}
      >
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '12px',
          background: '#fff',
          border: '1px solid #E5E7EB',
          borderRadius: '20px', padding: '12px 24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)',
        }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: 5 }).map((_, i) => <StarIcon key={i} />)}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>4.9 / 5</span>
          <span style={{ width: '1px', height: '16px', background: '#E5E7EB' }} />
          <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>+150 proyectos entregados</span>
        </div>
      </motion.div>
    </section>
  )
}

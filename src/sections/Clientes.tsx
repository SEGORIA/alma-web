import { motion } from 'framer-motion'
import { P, Y } from '../tokens'

/* ── Servicios ──────────────────────────────────────────────── */
const SERVICIOS = [
  { emoji: '💻', label: 'Landing Page'          },
  { emoji: '🏢', label: 'Sitio Corporativo'      },
  { emoji: '🛒', label: 'Tienda Virtual'         },
  { emoji: '🎨', label: 'Diseño de Logo'         },
  { emoji: '✨', label: 'Identidad Visual'        },
  { emoji: '📖', label: 'Manual de Marca'        },
  { emoji: '📱', label: 'Gestión de Redes'       },
  { emoji: '📣', label: 'Pauta Digital'          },
  { emoji: '📷', label: 'Fotografía de Producto' },
  { emoji: '🎬', label: 'Video Corporativo'      },
  { emoji: '🚀', label: 'Estrategia Digital'     },
  { emoji: '📊', label: 'Reportes & Analytics'   },
]

/* ── Valores (antes en Nosotros) ────────────────────────────── */
const VALORES = [
  { emoji: '🎯', label: 'Orientados a resultados' },
  { emoji: '💬', label: 'Comunicación directa'    },
  { emoji: '🔍', label: 'Atención al detalle'     },
  { emoji: '🚀', label: 'Entrega a tiempo'        },
  { emoji: '❤️', label: 'Trabajo con propósito'   },
]

/* ── Separador de diamante entre bloques ────────────────────── */
const Diamond = () => (
  <span style={{
    display: 'inline-block',
    width: '6px', height: '6px',
    background: Y, opacity: 0.6,
    transform: 'rotate(45deg)',
    flexShrink: 0,
    margin: '0 28px',
  }} />
)

type Item = { emoji: string; label: string; isValue?: boolean }

function BandItem({ item }: { item: Item }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{ fontSize: '13px', lineHeight: 1 }}>{item.emoji}</span>
        <span style={{
          fontSize: '13px',
          fontWeight: item.isValue ? 600 : 700,
          color: item.isValue ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.75)',
          whiteSpace: 'nowrap',
          fontStyle: item.isValue ? 'italic' : 'normal',
          transition: 'color 0.2s ease',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
          onMouseLeave={e => (e.currentTarget.style.color = item.isValue ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.75)')}
        >
          {item.label}
        </span>
      </div>
      <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: Y, opacity: 0.4, flexShrink: 0 }} />
    </div>
  )
}

/* ── Secuencia: todos los servicios → diamante → todos los valores → diamante ── */
const SEQUENCE: (Item | 'diamond')[] = [
  ...SERVICIOS,
  'diamond',
  ...VALORES.map(v => ({ ...v, isValue: true })),
  'diamond',
]

export default function Clientes() {
  const doubled = [...SEQUENCE, ...SEQUENCE]

  return (
    <section style={{
      background: P, padding: '18px 0', overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Etiqueta fija */}
        <div style={{ flexShrink: 0, padding: '0 28px', borderRight: '1px solid rgba(255,255,255,0.15)', marginRight: '28px' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
            Alma
          </p>
        </div>
        {/* Banda animada */}
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
            style={{ display: 'flex', alignItems: 'center', width: 'max-content', willChange: 'transform' }}
          >
            {doubled.map((item, i) =>
              item === 'diamond'
                ? <Diamond key={`d-${i}`} />
                : <BandItem key={`${(item as Item).label}-${i}`} item={item as Item} />
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

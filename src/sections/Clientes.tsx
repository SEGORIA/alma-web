import { motion } from 'framer-motion'
import { P } from '../tokens'

const clientes = [
  'Prr Love',
  'Malasaña Store',
  'Magic All Stars',
  'Café Ritual',
  'Nexo Legal',
  'Bloom Spa',
  'Studio Norte',
  'Vereda Digital',
  'Casa Creativa',
  'Forma Studio',
]

function ClienteItem({ nombre }: { nombre: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '28px', flexShrink: 0 }}>
      <span style={{
        fontSize: '15px', fontWeight: 700,
        color: 'rgba(255,255,255,0.55)',
        whiteSpace: 'nowrap',
        letterSpacing: '0.3px',
        transition: 'color 0.2s ease',
      }}
        onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
      >
        {nombre}
      </span>
      <span style={{
        width: '4px', height: '4px', borderRadius: '50%',
        background: 'rgba(250,204,21,0.5)', flexShrink: 0,
      }} />
    </div>
  )
}

export default function Clientes() {
  const doubled = [...clientes, ...clientes]

  return (
    <section style={{
      background: P,
      padding: '20px 0',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '0',
      }}>
        {/* Label fijo */}
        <div style={{
          flexShrink: 0,
          padding: '0 28px',
          borderRight: '1px solid rgba(255,255,255,0.15)',
          marginRight: '28px',
        }}>
          <p style={{
            fontSize: '10px', fontWeight: 700,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '2px', textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}>
            Confían en Alma
          </p>
        </div>

        {/* Marquee */}
        <div style={{ overflow: 'hidden', flex: 1 }}>
          <motion.div
            animate={{ x: ['0%', '-50%'] }}
            transition={{ duration: 25, ease: 'linear', repeat: Infinity }}
            style={{ display: 'flex', alignItems: 'center', gap: '28px', width: 'max-content' }}
          >
            {doubled.map((nombre, i) => (
              <ClienteItem key={`${nombre}-${i}`} nombre={nombre} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

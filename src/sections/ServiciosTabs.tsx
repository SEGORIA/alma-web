import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const P = '#6B21A8'
const Y = '#FACC15'
const WA = 'https://wa.me/573013369325?text=Hola%2C%20quiero%20cotizar%20un%20proyecto%20con%20Alma'

type Plan = { nombre: string; precio: string; periodo?: string; destacado?: boolean; items: string[] }
type Tab = { id: string; label: string; planes: Plan[] }

const tabs: Tab[] = [
  {
    id: 'web',
    label: 'Desarrollo Web',
    planes: [
      {
        nombre: 'Básico',
        precio: "$1'580.000",
        items: ['Landing page profesional', 'Diseño responsive', 'SEO básico', 'Hasta 5 secciones', 'Formulario de contacto', 'Entrega en 7 días hábiles'],
      },
      {
        nombre: 'Empresarial',
        precio: "$2'130.000",
        destacado: true,
        items: ['Sitio corporativo completo', 'Blog integrado', 'Formulario avanzado', 'Hasta 8 secciones', 'Google Analytics', 'Entrega en 12 días hábiles'],
      },
      {
        nombre: 'Tienda Virtual',
        precio: "$3'800.000",
        items: ['E-commerce completo', 'Pasarela de pagos', 'Gestión de inventario', 'Productos ilimitados', 'Panel administrativo', 'Entrega en 20 días hábiles'],
      },
    ],
  },
  {
    id: 'branding',
    label: 'Branding',
    planes: [
      {
        nombre: 'Identidad Básica',
        precio: '$680.000',
        items: ['Logo profesional', 'Paleta de colores', 'Tipografías', '2 variaciones del logo', 'Archivos editables', 'Entrega en 5 días hábiles'],
      },
      {
        nombre: 'Branding Completo',
        precio: "$1'200.000",
        destacado: true,
        items: ['Todo de Identidad Básica', 'Manual de marca', 'Papelería digital', 'Assets para redes sociales', '5 variaciones del logo', 'Entrega en 10 días hábiles'],
      },
      {
        nombre: 'Premium',
        precio: "$2'000.000",
        items: ['Todo de Branding Completo', 'Mockups en 3D', 'Estrategia de marca', 'Guía de voz y tono', 'Asesoría de implementación', 'Soporte 30 días'],
      },
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing Digital',
    planes: [
      {
        nombre: 'Gestión Social',
        precio: '$800.000',
        periodo: '/mes',
        items: ['3 redes sociales', '12 contenidos al mes', 'Diseño gráfico incluido', 'Calendario editorial', 'Reporte mensual', 'Soporte vía WhatsApp'],
      },
      {
        nombre: 'Marketing Pro',
        precio: "$1'500.000",
        periodo: '/mes',
        destacado: true,
        items: ['5 redes sociales', '20 contenidos al mes', 'Pauta básica incluida', 'Reportes semanales', 'Estrategia mensual', 'Asesor dedicado'],
      },
      {
        nombre: 'Full Service',
        precio: "$2'800.000",
        periodo: '/mes',
        items: ['Canales ilimitados', 'Contenido ilimitado', 'Pauta avanzada', 'Mentoría mensual', 'Estrategia integral', 'Prioridad absoluta'],
      },
    ],
  },
]

function PlanCard({ plan }: { plan: Plan }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        border: `2px solid ${plan.destacado ? P : '#E5E7EB'}`,
        borderRadius: '20px', padding: '36px 28px 28px',
        background: '#fff',
        boxShadow: plan.destacado ? '0 8px 40px rgba(107,33,168,0.12)' : hover ? '0 8px 24px rgba(0,0,0,0.06)' : 'none',
        transition: 'box-shadow 0.2s ease',
      }}
    >
      {plan.destacado && (
        <div style={{
          position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
          background: Y, color: '#111',
          fontSize: '11px', fontWeight: 800,
          padding: '4px 16px', borderRadius: '20px', letterSpacing: '0.5px', whiteSpace: 'nowrap',
        }}>
          MÁS SOLICITADO
        </div>
      )}

      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>{plan.nombre}</h3>

      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '38px', fontWeight: 900, color: P, lineHeight: 1 }}>{plan.precio}</span>
        {plan.periodo && <span style={{ fontSize: '16px', color: '#6B7280', fontWeight: 500 }}>{plan.periodo}</span>}
      </div>

      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
        {plan.items.map(item => (
          <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#374151' }}>
            <span style={{ color: P, fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>✓</span>
            {item}
          </li>
        ))}
      </ul>

      <a
        href={WA}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'block', textAlign: 'center',
          background: plan.destacado ? Y : '#F3F4F6',
          color: plan.destacado ? '#111' : P,
          padding: '14px', borderRadius: '12px',
          fontWeight: 700, fontSize: '14px', textDecoration: 'none',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = plan.destacado ? '#EAB308' : P
          e.currentTarget.style.color = '#fff'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = plan.destacado ? Y : '#F3F4F6'
          e.currentTarget.style.color = plan.destacado ? '#111' : P
        }}
      >
        Cotizar este plan
      </a>
    </div>
  )
}

export default function ServiciosTabs() {
  const [active, setActive] = useState('web')
  const tab = tabs.find(t => t.id === active)!

  return (
    <section style={{ background: '#fff', padding: '100px 24px' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <p style={{ color: P, fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '12px' }}>
            Servicios & Tarifas
          </p>
          <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 900, color: '#111827', letterSpacing: '-1px', lineHeight: 1.1 }}>
            Precios transparentes,{' '}
            <span style={{ color: P }}>resultados reales</span>
          </h2>
        </motion.div>

        {/* Tab buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '48px', flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                padding: '10px 24px', borderRadius: '10px',
                fontWeight: 600, fontSize: '14px',
                border: `2px solid ${active === t.id ? P : '#E5E7EB'}`,
                background: active === t.id ? P : '#fff',
                color: active === t.id ? '#fff' : '#6B7280',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Plans */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}
          >
            {tab.planes.map(plan => <PlanCard key={plan.nombre} plan={plan} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

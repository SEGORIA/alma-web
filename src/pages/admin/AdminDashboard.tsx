import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import {
  getArticulos, getProyectos, getPlanes, getExtras,
  getTestimonios, getFaqs, getPasos, getEquipo, getLeads,
  seedArticulos, seedPortafolio, seedPrecios, seedConfig,
} from '../../lib/db'
import { P, PL, Y } from '../../tokens'
import { useIsMobile } from '../../hooks/useIsMobile'

/* ── Card de módulo ───────────────────────────────────────── */
interface ModCard {
  label:      string
  value:      string | number
  icon:       string
  color:      string
  to:         string
  action:     string
  highlight?: boolean
  tag?:       string
}

function StatCard({ c, isMobile }: { c: ModCard; isMobile: boolean }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '16px',
      padding: isMobile ? '16px 14px' : '20px 22px',
      border: c.highlight ? `2px solid ${c.color}` : '1px solid #E5E7EB',
      boxShadow: c.highlight ? `0 4px 20px ${c.color}22` : '0 2px 8px rgba(0,0,0,0.03)',
      display: 'flex', flexDirection: 'column', gap: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isMobile ? '8px' : '12px' }}>
        <span style={{ fontSize: isMobile ? '20px' : '26px' }}>{c.icon}</span>
        {c.tag && (
          <span style={{
            background: `${c.color}15`, color: c.color,
            fontSize: '10px', fontWeight: 800, padding: '3px 8px',
            borderRadius: '20px', letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            {c.tag}
          </span>
        )}
      </div>
      <p style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: 900, color: '#111827', margin: '0 0 3px', lineHeight: 1 }}>
        {c.value}
      </p>
      <p style={{ fontSize: isMobile ? '11px' : '12px', color: '#6B7280', margin: '0 0 14px', lineHeight: 1.4 }}>
        {c.label}
      </p>
      <Link
        to={c.to}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: isMobile ? '7px 12px' : '8px 16px',
          background: c.color, color: '#fff',
          borderRadius: '9px', textDecoration: 'none',
          fontSize: isMobile ? '11px' : '12px', fontWeight: 700,
          marginTop: 'auto', alignSelf: 'flex-start',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        {c.action} →
      </Link>
    </div>
  )
}

/* ── Módulos de negocio (placeholder cards) ───────────────── */
interface BizCard {
  icon:  string
  title: string
  desc:  string
  color: string
  to:    string
  cta:   string
  badge: string
}

const BIZ_MODULES: BizCard[] = [
  {
    icon:  '📋',
    title: 'Brief',
    desc:  'Recibe y gestiona los briefs de tus clientes en un solo lugar.',
    color: '#0EA5E9',
    to:    '/admin/brief',
    cta:   'Abrir Brief',
    badge: 'Activo',
  },
  {
    icon:  '💼',
    title: 'Finanzas',
    desc:  'Controla ingresos, gastos y rentabilidad de cada proyecto.',
    color: '#16A34A',
    to:    '/admin/finanzas',
    cta:   'Ver Finanzas',
    badge: 'Activo',
  },
  {
    icon:  '📑',
    title: 'Contratos',
    desc:  'Genera órdenes de servicio y contratos firmados digitalmente.',
    color: '#2563EB',
    to:    '/admin/contratos',
    cta:   'Ver Contratos',
    badge: 'Próximamente',
  },
  {
    icon:  '👥',
    title: 'Clientes',
    desc:  'Portal privado: avances, entregables y métricas para cada cliente.',
    color: '#EA580C',
    to:    '/admin/clientes',
    cta:   'Ver Clientes',
    badge: 'Próximamente',
  },
  {
    icon:  '🎓',
    title: 'Academia',
    desc:  'Cursos y contenido educativo en edu.almaagenciacreativa.com.',
    color: '#DB2777',
    to:    '/admin/academia',
    cta:   'Ver Academia',
    badge: 'Próximamente',
  },
]

/* ── Dashboard ────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [nArticulos,   setNArticulos]   = useState<number | null>(null)
  const [nProyectos,   setNProyectos]   = useState<number | null>(null)
  const [nPlanes,      setNPlanes]      = useState<number | null>(null)
  const [nExtras,      setNExtras]      = useState<number | null>(null)
  const [nTestimonios, setNTestimonios] = useState<number | null>(null)
  const [nFaqs,        setNFaqs]        = useState<number | null>(null)
  const [nPasos,       setNPasos]       = useState<number | null>(null)
  const [nEquipo,      setNEquipo]      = useState<number | null>(null)
  const [nLeads,       setNLeads]       = useState<number | null>(null)
  const [nLeadsNuevos, setNLeadsNuevos] = useState<number | null>(null)
  const [seeding,      setSeeding]      = useState(false)
  const [seeded,       setSeeded]       = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    getArticulos().then(a => setNArticulos(a.length))
    getProyectos().then(p => setNProyectos(p.length))
    getPlanes().then(p => setNPlanes(p.length))
    getExtras().then(e => setNExtras(e.length))
    getTestimonios().then(t => setNTestimonios(t.length))
    getFaqs().then(f => setNFaqs(f.length))
    getPasos().then(p => setNPasos(p.length))
    getEquipo().then(e => setNEquipo(e.length))
    getLeads().then(leads => {
      setNLeads(leads.length)
      setNLeadsNuevos(leads.filter(l => l.estado === 'nuevo').length)
    })
  }, [seeded])

  const handleSeed = async () => {
    if (!confirm('¿Migrar los datos estáticos a Firestore?')) return
    setSeeding(true)
    try {
      await seedArticulos()
      await seedPortafolio()
      await seedPrecios()
      await seedConfig()
      setSeeded(s => !s)
      alert('✅ Datos migrados correctamente')
    } catch (err) {
      alert('Error al migrar: ' + err)
    } finally {
      setSeeding(false)
    }
  }

  /* Tarjetas de página web */
  const webCards: ModCard[] = [
    {
      label:     nLeadsNuevos ? `${nLeadsNuevos} nuevo${nLeadsNuevos !== 1 ? 's' : ''} · Kit Gratuito` : 'Kit Gratuito · Leads',
      value:     nLeads ?? '…',
      icon:      '🎯',
      color:     P,
      to:        '/admin/leads',
      action:    'Ver leads',
      highlight: (nLeadsNuevos ?? 0) > 0,
      tag:       (nLeadsNuevos ?? 0) > 0 ? `${nLeadsNuevos} nuevos` : 'Activo',
    },
    {
      label:  'Artículos del blog',
      value:  nArticulos ?? '…',
      icon:   '✍️',
      color:  PL,
      to:     '/admin/blog',
      action: 'Gestionar blog',
      tag:    'Activo',
    },
    {
      label:  'Proyectos en portafolio',
      value:  nProyectos ?? '…',
      icon:   '🖼️',
      color:  '#7C3AED',
      to:     '/admin/portafolio',
      action: 'Portafolio',
      tag:    'Activo',
    },
    {
      label:  `Planes (${nPlanes ?? '…'}) + Extras (${nExtras ?? '…'})`,
      value:  nPlanes !== null && nExtras !== null ? nPlanes + nExtras : '…',
      icon:   '💰',
      color:  '#D97706',
      to:     '/admin/precios',
      action: 'Precios',
      tag:    'Activo',
    },
    {
      label:  `Proceso (${nPasos ?? '…'}) · Equipo (${nEquipo ?? '…'})`,
      value:  nPasos !== null && nEquipo !== null ? nPasos + nEquipo : '…',
      icon:   '📄',
      color:  '#4A0E8F',
      to:     '/admin/contenido',
      action: 'Contenido',
      tag:    'Activo',
    },
    {
      label:  `Testimonios (${nTestimonios ?? '…'}) · FAQ (${nFaqs ?? '…'})`,
      value:  nTestimonios !== null && nFaqs !== null ? nTestimonios + nFaqs : '…',
      icon:   '⚙️',
      color:  '#7C3AED',
      to:     '/admin/config',
      action: 'Config',
      tag:    'Activo',
    },
  ]

  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '24px 16px' : '40px 32px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: 900, color: '#111827', marginBottom: '5px', letterSpacing: '-0.5px' }}>
            Dashboard
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280' }}>
            Panel central de Alma Agencia Creativa.
          </p>
        </div>

        {/* ── Sección: Página Web ── */}
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>
            🌐 Página Web
          </h2>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: isMobile ? '10px' : '16px',
          marginBottom: '36px',
        }}>
          {webCards.map(c => (
            <StatCard key={c.to} c={c} isMobile={isMobile} />
          ))}
        </div>

        {/* ── Sección: Negocio ── */}
        <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '13px', fontWeight: 800, color: '#374151', letterSpacing: '0.5px', textTransform: 'uppercase', margin: 0 }}>
            💼 Módulos de Negocio
          </h2>
          <div style={{ flex: 1, height: '1px', background: '#E5E7EB' }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: isMobile ? '10px' : '16px',
          marginBottom: '36px',
        }}>
          {BIZ_MODULES.map(m => (
            <div key={m.to} style={{
              background: '#fff', borderRadius: '16px', padding: isMobile ? '18px' : '22px',
              border: '1px solid #E5E7EB', boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              display: 'flex', flexDirection: 'column', gap: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '28px' }}>{m.icon}</span>
                <span style={{
                  background: m.badge === 'Activo' ? `${m.color}15` : '#F9FAFB',
                  color: m.badge === 'Activo' ? m.color : '#9CA3AF',
                  fontSize: '10px', fontWeight: 800, padding: '3px 9px',
                  borderRadius: '20px', letterSpacing: '0.5px',
                  border: m.badge === 'Activo' ? 'none' : '1px solid #E5E7EB',
                }}>
                  {m.badge}
                </span>
              </div>
              <p style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 5px' }}>
                {m.title}
              </p>
              <p style={{ fontSize: '12px', color: '#6B7280', margin: '0 0 16px', lineHeight: 1.5, flex: 1 }}>
                {m.desc}
              </p>
              <Link
                to={m.to}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '5px',
                  padding: '8px 16px',
                  background: m.badge === 'Activo' ? m.color : '#F3F4F6',
                  color: m.badge === 'Activo' ? '#fff' : '#6B7280',
                  borderRadius: '9px', textDecoration: 'none',
                  fontSize: '12px', fontWeight: 700, alignSelf: 'flex-start',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {m.cta} →
              </Link>
            </div>
          ))}
        </div>

        {/* ── Acciones rápidas ── */}
        <div style={{ background: '#fff', borderRadius: '20px', padding: isMobile ? '20px 16px' : '24px 28px', border: '1px solid #E5E7EB' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
            Acciones rápidas
          </h2>
          <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '18px' }}>
            Primera vez: migra los datos estáticos a Firestore para empezar a editarlos.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexDirection: isMobile ? 'column' : 'row' }}>
            <Link
              to="/admin/blog/nuevo"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: P, color: '#fff', padding: '10px 18px',
                borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px',
              }}
            >
              + Nuevo artículo
            </Link>
            <Link
              to="/admin/portafolio/nuevo"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: P, color: '#fff', padding: '10px 18px',
                borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '13px',
              }}
            >
              + Nuevo proyecto
            </Link>
            <button
              onClick={handleSeed}
              disabled={seeding}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: seeding ? '#E5E7EB' : `${Y}33`,
                color: seeding ? '#9CA3AF' : '#92400E',
                border: `1px solid ${seeding ? '#E5E7EB' : Y}`,
                padding: '10px 18px', borderRadius: '10px',
                fontWeight: 700, fontSize: '13px', cursor: seeding ? 'not-allowed' : 'pointer',
              }}
            >
              {seeding ? 'Migrando...' : '🌱 Migrar datos a Firestore'}
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  )
}

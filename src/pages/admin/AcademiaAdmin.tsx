import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'

/* ── Paleta ─────────────────────────────────────────────── */
const BK   = '#F7F5FC'
const DIM  = '#FFFFFF'
const BDR  = '#EAE5F4'
const BDR2 = '#D9D1EA'
const MUT  = '#756E8C'
const WHT  = '#221636'
const ACC2 = '#9333EA'
const C1   = '#7C3AED'
const AMB  = '#D97706'
const ROSE = '#E11D48'
const TEAL = '#0D9488'

const FEATURES = [
  { icon: '🎬', title: 'Cursos en video',          color: ROSE, desc: 'Sube módulos con videos, textos y recursos descargables organizados por curso.' },
  { icon: '👩‍🎓', title: 'Estudiantes y accesos',    color: ACC2, desc: 'Gestiona quién tiene acceso a cada curso: libre, de pago o por invitación.' },
  { icon: '📊', title: 'Progreso del estudiante',   color: TEAL, desc: 'Ve cuánto ha avanzado cada estudiante en tiempo real desde el admin.' },
  { icon: '🏆', title: 'Certificados',              color: AMB,  desc: 'Emite certificados de finalización con el logo de Alma al completar el curso.' },
  { icon: '💳', title: 'Cursos de pago',            color: '#16A34A', desc: 'Integra pagos para cursos premium con PSE, tarjeta o Nequi.' },
  { icon: '📱', title: 'Optimizado para móvil',     color: '#2563EB', desc: 'Los estudiantes pueden tomar los cursos desde cualquier dispositivo.' },
]

const COURSE_CATEGORIES = [
  { icon: '🎨', name: 'Diseño & Branding',    color: ROSE,  courses: 0 },
  { icon: '📲', name: 'Marketing Digital',     color: AMB,   courses: 0 },
  { icon: '💼', name: 'Emprendimiento',        color: ACC2,  courses: 0 },
  { icon: '📸', name: 'Fotografía & Video',    color: TEAL,  courses: 0 },
]

export default function AcademiaAdmin() {
  const isMobile = useIsMobile()

  return (
    <AdminLayout>
      <div style={{ background: BK, minHeight: '100vh', padding: isMobile ? '20px 16px' : '32px 36px' }}>

        {/* ── Header premium ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: `0.5px solid ${BDR}`, marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
            <h1 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 900, color: WHT, letterSpacing: '-0.5px' }}>Academia</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `${AMB}15`, border: `0.5px solid ${AMB}40`, color: AMB, borderRadius: '4px', padding: '5px 12px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: AMB, display: 'inline-block' }} />
              En preparación
            </span>
            <a
              href="https://edu.almaagenciacreativa.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: `linear-gradient(135deg,${C1},${ACC2})`, color: '#fff', padding: '9px 18px', borderRadius: '4px', fontSize: '11px', fontWeight: 800, textDecoration: 'none', whiteSpace: 'nowrap' }}
            >
              🌐 edu.almaagenciacreativa.com
            </a>
          </div>
        </div>

        {/* ── Stats vacíos ── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '14px', marginBottom: '32px' }}>
          {([
            { lbl: 'Cursos',       val: 0, sub: 'publicados',  col: ACC2, ico: '🎬' },
            { lbl: 'Estudiantes',  val: 0, sub: 'inscritos',   col: TEAL, ico: '👩‍🎓' },
            { lbl: 'Certificados', val: 0, sub: 'emitidos',    col: AMB,  ico: '🏆' },
            { lbl: 'Ingresos',     val: '$0', sub: 'este mes', col: '#16A34A', ico: '💳' },
          ] as { lbl: string; val: number | string; sub: string; col: string; ico: string }[]).map(m => (
            <div key={m.lbl} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '18px 18px 14px', position: 'relative', overflow: 'hidden' }}>
              <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: MUT, margin: '0 0 10px' }}>{m.lbl}</p>
              <p style={{ fontSize: typeof m.val === 'string' ? '20px' : '28px', fontWeight: 300, color: m.col, margin: '0 0 5px', lineHeight: 1 }}>{m.val}</p>
              <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>{m.sub}</p>
              <span style={{ position: 'absolute', bottom: 0, right: '10px', fontSize: '40px', color: '#F1ECFA', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{m.ico}</span>
            </div>
          ))}
        </div>

        {/* ── Aviso en preparación ── */}
        <div style={{ background: `${AMB}0E`, border: `0.5px solid ${AMB}35`, borderRadius: '6px', padding: '16px 20px', marginBottom: '32px', display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
          <span style={{ fontSize: '22px', flexShrink: 0, marginTop: '1px' }}>🚀</span>
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 700, color: AMB }}>Plataforma educativa en preparación</p>
            <p style={{ margin: 0, fontSize: '12px', color: MUT, lineHeight: 1.6 }}>
              Desde aquí podrás crear cursos, organizar módulos, gestionar estudiantes y ver el progreso. El subdominio{' '}
              <span style={{ color: TEAL, fontWeight: 600 }}>edu.almaagenciacreativa.com</span> se configurará en Vercel apuntando a esta plataforma.
            </p>
          </div>
        </div>

        {/* ── Categorías ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUT, margin: '0 0 3px' }}>Categorías de cursos</p>
            <p style={{ fontSize: '12px', color: `${MUT}CC`, margin: 0 }}>El contenido educativo estará organizado en estas categorías.</p>
          </div>
          <button disabled style={{ padding: '8px 16px', borderRadius: '4px', border: `0.5px solid ${BDR2}`, background: 'transparent', color: MUT, fontSize: '11px', fontWeight: 700, cursor: 'not-allowed', letterSpacing: '0.08em' }}>
            + Nuevo curso (pronto)
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '10px', marginBottom: '32px' }}>
          {COURSE_CATEGORIES.map(cat => (
            <div key={cat.name} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '20px 18px', textAlign: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: `${cat.color}18`, border: `0.5px solid ${cat.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', margin: '0 auto 12px' }}>
                {cat.icon}
              </div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: WHT, margin: '0 0 4px' }}>{cat.name}</p>
              <p style={{ fontSize: '10px', color: MUT, margin: 0 }}>Sin cursos aún</p>
            </div>
          ))}
        </div>

        {/* ── Features ── */}
        <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: MUT, margin: '0 0 14px' }}>Funcionalidades previstas</p>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill,minmax(280px,1fr))', gap: '10px' }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: DIM, border: `0.5px solid ${BDR}`, borderRadius: '6px', padding: '16px 18px', display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: `${f.color}18`, border: `0.5px solid ${f.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>
                {f.icon}
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: WHT, margin: '0 0 4px' }}>{f.title}</p>
                <p style={{ fontSize: '11px', color: MUT, margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  )
}

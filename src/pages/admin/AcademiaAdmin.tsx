import AdminLayout from './AdminLayout'
import { useIsMobile } from '../../hooks/useIsMobile'

const FEATURES = [
  { icon: '🎬', title: 'Cursos en video', desc: 'Sube módulos con videos, textos y recursos descargables organizados por curso.' },
  { icon: '👩‍🎓', title: 'Estudiantes y accesos', desc: 'Gestiona quién tiene acceso a cada curso: libre, de pago o por invitación.' },
  { icon: '📊', title: 'Progreso del estudiante', desc: 'Ve cuánto ha avanzado cada estudiante en tiempo real desde el admin.' },
  { icon: '🏆', title: 'Certificados', desc: 'Emite certificados de finalización con el logo de Alma al completar el curso.' },
  { icon: '💳', title: 'Cursos de pago', desc: 'Integra pagos para cursos premium con PSE, tarjeta o nequi.' },
  { icon: '📱', title: 'Optimizado para móvil', desc: 'Los estudiantes pueden tomar los cursos desde cualquier dispositivo.' },
]

const COURSE_CATEGORIES = [
  { icon: '🎨', name: 'Diseño & Branding', courses: 0 },
  { icon: '📲', name: 'Marketing Digital', courses: 0 },
  { icon: '💼', name: 'Emprendimiento', courses: 0 },
  { icon: '📸', name: 'Fotografía & Video', courses: 0 },
]

export default function AcademiaAdmin() {
  const isMobile = useIsMobile()

  return (
    <AdminLayout>
      <div style={{ padding: isMobile ? '24px 16px' : '40px 32px' }}>

        {/* ── Banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #831843 0%, #DB2777 60%, #F472B6 100%)',
          borderRadius: '20px',
          padding: isMobile ? '24px 20px' : '36px 40px',
          marginBottom: '32px',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '-20px', right: '-10px',
            fontSize: '130px', opacity: 0.08, lineHeight: 1,
            userSelect: 'none', pointerEvents: 'none',
          }}>🎓</div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
              borderRadius: '20px', padding: '4px 14px', marginBottom: '16px',
            }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#FBBF24', display: 'inline-block' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Preparando plataforma
              </span>
            </div>

            <h1 style={{ fontSize: isMobile ? '22px' : '30px', fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
              🎓 Academia Alma
            </h1>
            <p style={{ fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.85)', margin: '0 0 20px', maxWidth: '560px', lineHeight: 1.6 }}>
              Plataforma de cursos y formación en diseño, branding y marketing digital. Disponible en <strong>edu.almaagenciacreativa.com</strong> para tu comunidad.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href="https://edu.almaagenciacreativa.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  background: '#fff', color: '#BE185D',
                  padding: '10px 20px', borderRadius: '10px',
                  fontSize: '13px', fontWeight: 800, textDecoration: 'none',
                  transition: 'transform 0.15s, box-shadow 0.15s',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.18)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)'
                }}
              >
                🌐 edu.almaagenciacreativa.com
              </a>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.2)', color: '#fff',
                padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              }}>
                🎓 Cursos publicados: 0
              </span>
            </div>
          </div>
        </div>

        {/* ── Lista de categorías (preparación) ── */}
        <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#111827', margin: '0 0 3px' }}>
              Categorías de cursos
            </h2>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
              Las categorías en las que organizarás tu contenido educativo.
            </p>
          </div>
          <button
            disabled
            style={{
              background: '#F3F4F6', color: '#9CA3AF',
              border: '1px solid #E5E7EB', padding: '8px 16px',
              borderRadius: '10px', fontSize: '12px', fontWeight: 700,
              cursor: 'not-allowed',
            }}
          >
            + Nuevo curso (pronto)
          </button>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '12px', marginBottom: '28px',
        }}>
          {COURSE_CATEGORIES.map(cat => (
            <div key={cat.name} style={{
              background: '#fff', borderRadius: '14px', padding: '20px 18px',
              border: '1px solid #E5E7EB', textAlign: 'center',
            }}>
              <span style={{ fontSize: '28px', display: 'block', marginBottom: '10px' }}>{cat.icon}</span>
              <p style={{ fontSize: '12px', fontWeight: 800, color: '#374151', margin: '0 0 4px' }}>{cat.name}</p>
              <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>
                {cat.courses === 0 ? 'Sin cursos aún' : `${cat.courses} cursos`}
              </p>
            </div>
          ))}
        </div>

        {/* ── En preparación ── */}
        <div style={{
          background: 'linear-gradient(135deg, #FDF2F8, #FCE7F3)',
          border: '1.5px solid #FBCFE8',
          borderRadius: '16px', padding: isMobile ? '20px 18px' : '24px 28px',
          marginBottom: '28px',
          display: 'flex', alignItems: 'flex-start', gap: '16px',
        }}>
          <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>🚀</span>
          <div>
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: '#BE185D', margin: '0 0 6px' }}>
              Plataforma en preparación
            </h2>
            <p style={{ fontSize: '13px', color: '#DB2777', margin: 0, lineHeight: 1.6 }}>
              La Academia Alma está siendo construida. Cuando esté lista, desde aquí podrás crear cursos, organizar módulos, gestionar estudiantes y ver el progreso. El subdominio <strong>edu.almaagenciacreativa.com</strong> se configurará en Vercel apuntando a esta plataforma.
            </p>
          </div>
        </div>

        {/* ── Features ── */}
        <div style={{ marginBottom: '12px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#374151', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Funcionalidades de la academia
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '20px' }}>
            Todo lo que tendrá la plataforma educativa de Alma.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px',
        }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: '#fff', borderRadius: '14px', padding: '18px 20px',
              border: '1px solid #E5E7EB', display: 'flex', gap: '14px', alignItems: 'flex-start',
            }}>
              <span style={{
                fontSize: '22px', flexShrink: 0, width: '40px', height: '40px',
                background: '#FDF2F8', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {f.icon}
              </span>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#111827', margin: '0 0 4px' }}>{f.title}</p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </AdminLayout>
  )
}

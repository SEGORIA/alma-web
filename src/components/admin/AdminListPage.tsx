import { Link } from 'react-router-dom'
import { ADM } from '../../lib/adminTheme'

const { DIM, BDR, MUT, WHT } = ADM

/* ── Header genérico de páginas admin tipo "lista" (Blog, Portafolio…) ──
   Título con ícono, contador de items, y botón "+ Nuevo". */
export function AdminListHeader({ icon, title, count, countLabel, ctaLabel, ctaTo, color = ADM.C1 }: {
  icon: string; title: string; count: number; countLabel: string
  ctaLabel: string; ctaTo: string; color?: string
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
      <div>
        <p style={{ margin: '0 0 3px', fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: MUT }}>ALMA · AGENCIA CREATIVA</p>
        <h1 style={{ fontSize: '24px', fontWeight: 900, color: WHT, marginBottom: '4px', letterSpacing: '-0.5px' }}>
          {icon} {title}
        </h1>
        <p style={{ fontSize: '14px', color: MUT }}>
          {count} {countLabel}{count !== 1 ? 's' : ''}
        </p>
      </div>
      <Link
        to={ctaTo}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: color, color: '#fff',
          padding: '11px 22px', borderRadius: '12px',
          textDecoration: 'none', fontWeight: 700, fontSize: '14px',
        }}
      >
        {ctaLabel}
      </Link>
    </div>
  )
}

/* ── Estado vacío genérico ── */
export function AdminEmptyState({ icon, title, subtitle, ctaLabel, ctaTo, color = ADM.C1 }: {
  icon: string; title: string; subtitle: string; ctaLabel: string; ctaTo: string; color?: string
}) {
  return (
    <div style={{
      background: DIM, borderRadius: '16px', padding: '48px',
      textAlign: 'center', border: `1px solid ${BDR}`,
    }}>
      <span style={{ fontSize: '48px', display: 'block', marginBottom: '16px' }}>{icon}</span>
      <p style={{ fontSize: '16px', fontWeight: 700, color: WHT, marginBottom: '8px' }}>
        {title}
      </p>
      <p style={{ fontSize: '14px', color: MUT, marginBottom: '24px' }}>
        {subtitle}
      </p>
      <Link to={ctaTo} style={{ color, fontWeight: 700, fontSize: '14px' }}>
        {ctaLabel}
      </Link>
    </div>
  )
}

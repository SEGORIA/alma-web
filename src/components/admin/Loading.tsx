import { SkeletonBox } from '../Skeleton'

/* ── Skeletons de carga del panel admin ───────────────────────
   Reemplazan los "Cargando…" de texto plano por placeholders
   con shimmer que imitan el layout real de cada vista. */

/** Filas tipo lista (leads, artículos, contratos, briefs…) */
export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }} aria-busy="true" aria-label="Cargando">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: '14px', border: '1px solid #ECE7F6',
          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px',
          opacity: 1 - i * 0.13,
        }}>
          <SkeletonBox width={38} height={38} radius="50%" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <SkeletonBox width={`${52 - i * 4}%`} height={13} />
            <SkeletonBox width="30%" height={10} />
          </div>
          <SkeletonBox width={86} height={30} radius="8px" />
          <SkeletonBox width={60} height={30} radius="8px" />
        </div>
      ))}
    </div>
  )
}

/** Grid de tarjetas (portafolio, documentos…) */
export function CardGridSkeleton({ cards = 6, minWidth = 280 }: { cards?: number; minWidth?: number }) {
  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`, gap: '16px' }}
      aria-busy="true" aria-label="Cargando"
    >
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} style={{
          background: '#fff', borderRadius: '16px', border: '1px solid #ECE7F6',
          overflow: 'hidden', opacity: 1 - i * 0.1,
        }}>
          <SkeletonBox height={110} radius="0" />
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <SkeletonBox width="65%" height={15} />
            <SkeletonBox height={12} />
            <SkeletonBox width="80%" height={12} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <SkeletonBox height={34} radius="8px" style={{ flex: 1 }} />
              <SkeletonBox height={34} radius="8px" style={{ flex: 1 }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

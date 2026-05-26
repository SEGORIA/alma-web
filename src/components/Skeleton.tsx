import type { CSSProperties } from 'react'

/* ── Shimmer keyframe ────────────────────────────────────── */
const shimmerStyle = `
@keyframes skeleton-shimmer {
  0%   { background-position: -600px 0 }
  100% { background-position:  600px 0 }
}
`
if (typeof document !== 'undefined' && !document.getElementById('skeleton-style')) {
  const s = document.createElement('style')
  s.id = 'skeleton-style'
  s.textContent = shimmerStyle
  document.head.appendChild(s)
}

const SHIMMER: CSSProperties = {
  background: 'linear-gradient(90deg, #E5E7EB 25%, #F3F4F6 50%, #E5E7EB 75%)',
  backgroundSize: '600px 100%',
  animation: 'skeleton-shimmer 1.4s infinite linear',
  borderRadius: '8px',
}

/* ── Box genérico ────────────────────────────────────────── */
export function SkeletonBox({
  width = '100%', height = '16px', radius = '8px', style,
}: {
  width?: string | number; height?: string | number; radius?: string; style?: CSSProperties
}) {
  return (
    <div style={{ ...SHIMMER, width, height, borderRadius: radius, flexShrink: 0, ...style }} />
  )
}

/* ── Tarjeta de artículo del blog ────────────────────────── */
export function SkeletonArticuloCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: '20px', overflow: 'hidden',
      border: '1.5px solid #E5E7EB', display: 'flex', flexDirection: 'column',
    }}>
      {/* imagen */}
      <SkeletonBox height={130} radius="0" />
      <div style={{ padding: '24px 22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SkeletonBox width="40%" height={10} />
        <SkeletonBox height={14} />
        <SkeletonBox height={14} width="85%" />
        <SkeletonBox height={12} width="70%" />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <SkeletonBox width="30%" height={11} />
          <SkeletonBox width="20%" height={11} />
        </div>
      </div>
    </div>
  )
}

/* ── Tarjeta destacada del blog ──────────────────────────── */
export function SkeletonArticuloDestacado() {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      background: '#fff', borderRadius: '24px', overflow: 'hidden',
      border: '1.5px solid #E5E7EB', marginBottom: '28px',
    }}>
      <SkeletonBox height={280} radius="0" />
      <div style={{ padding: '44px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '16px' }}>
        <SkeletonBox width="35%" height={11} />
        <SkeletonBox height={22} />
        <SkeletonBox height={22} width="80%" />
        <SkeletonBox height={14} />
        <SkeletonBox height={14} width="90%" />
        <SkeletonBox height={14} width="75%" />
      </div>
    </div>
  )
}

/* ── Tarjeta de proyecto del portafolio ──────────────────── */
export function SkeletonProyectoCard() {
  return (
    <div style={{
      background: '#fff', borderRadius: '20px', overflow: 'hidden',
      border: '1.5px solid #E5E7EB', display: 'flex', flexDirection: 'column',
    }}>
      <SkeletonBox height={180} radius="0" />
      <div style={{ padding: '22px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <SkeletonBox height={16} width="60%" />
        <SkeletonBox height={13} />
        <SkeletonBox height={13} width="85%" />
        <div style={{ display: 'flex', gap: '6px' }}>
          <SkeletonBox width={60} height={22} radius="20px" />
          <SkeletonBox width={80} height={22} radius="20px" />
          <SkeletonBox width={50} height={22} radius="20px" />
        </div>
        <SkeletonBox height={40} radius="10px" />
      </div>
    </div>
  )
}

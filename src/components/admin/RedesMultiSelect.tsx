import { useState, useEffect, useRef } from 'react'
import { REDES_OPCIONES } from '../../data/clientes'

/** Selector de varias redes a la vez (mismo contenido subido en varias
 *  plataformas). Botón compacto del mismo tamaño que un <select> normal;
 *  al hacer clic despliega un checklist. Usado en el editor de parrilla
 *  (ClientesAdmin) y en el calendario editorial (CalendarioAdmin). */
export default function RedesMultiSelect({ value, onChange, style }: {
  value: string[]; onChange: (redes: string[]) => void; style?: React.CSSProperties
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  function toggle(red: string) {
    onChange(value.includes(red) ? value.filter(r => r !== red) : [...value, red])
  }

  const label = value.length === 0 ? 'Elegir…' : value.length === 1 ? value[0] : `${value[0]} +${value.length - 1}`

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button" onClick={() => setOpen(o => !o)}
        style={{
          ...style, textAlign: 'left', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
        <span style={{ fontSize: '9px', opacity: 0.6, flexShrink: 0 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
          background: '#fff', border: '1px solid #E5E7EB', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.16)', padding: '6px', minWidth: '170px',
        }}>
          {REDES_OPCIONES.map(r => (
            <label
              key={r}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 8px', borderRadius: '6px', cursor: 'pointer',
                fontSize: '13px', color: '#111827', whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <input type="checkbox" checked={value.includes(r)} onChange={() => toggle(r)} />
              {r}
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

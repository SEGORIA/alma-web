import { useRef, useEffect, useState } from 'react'
import { animate, useInView } from 'framer-motion'

export type CounterFormat = 'integer' | 'thousands' | 'float1'

function fmt(v: number, format: CounterFormat, prefix: string, suffix: string): string {
  let str: string
  if (format === 'float1') {
    str = v.toFixed(1)
  } else if (format === 'thousands') {
    const n = Math.round(v)
    str = n >= 1000
      ? `${Math.floor(n / 1000)}.${String(n % 1000).padStart(3, '0')}`
      : String(n)
  } else {
    str = String(Math.round(v))
  }
  return prefix + str + suffix
}

interface Props {
  value: number
  prefix?: string
  suffix?: string
  format?: CounterFormat
  duration?: number
}

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  format = 'integer',
  duration = 1.8,
}: Props) {
  const ref      = useRef<HTMLSpanElement>(null)
  const inView   = useInView(ref, { once: true, margin: '-60px' })
  const started  = useRef(false)
  const [display, setDisplay] = useState(() => fmt(0, format, prefix, suffix))

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true

    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(fmt(v, format, prefix, suffix)),
    })
    return controls.stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView])

  return <span ref={ref}>{display}</span>
}

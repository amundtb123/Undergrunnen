import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({
  value,
  format,
  className = '',
}: {
  value: number
  format: (n: number) => string
  className?: string
}) {
  const [shown, setShown] = useState(value)
  const current = useRef(value)

  useEffect(() => {
    const from = current.current
    const delta = value - from
    if (delta === 0) return
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / 450)
      const eased = 1 - (1 - p) ** 3
      current.current = Math.round(from + delta * eased)
      setShown(current.current)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return <span className={`tabular ${className}`}>{format(shown)}</span>
}

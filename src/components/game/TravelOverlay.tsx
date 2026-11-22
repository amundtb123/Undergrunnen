import { getCity } from '@engine/index.ts'

export interface Transit {
  from: string
  to: string
  day: number
  mode: string
}

/** Full-screen cinematic beat between cities. */
export default function TravelOverlay({ transit }: { transit: Transit }) {
  const from = getCity(transit.from)!
  const to = getCity(transit.to)!
  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-ink-950">
      <div
        className="grain absolute inset-0"
        style={{ background: `radial-gradient(70% 50% at 50% 50%, hsl(${to.hue} 60% 25% / .45), transparent 70%)` }}
      />
      <div className="relative text-center">
        <div className="text-xs font-semibold tracking-[0.3em] text-ink-400 uppercase">{transit.mode}</div>
        <div className="mt-3 flex items-center justify-center gap-3 font-display text-lg tracking-[0.15em] text-ink-300 uppercase">
          <span>{from.name}</span>
          <svg width="80" height="8" viewBox="0 0 80 8" aria-hidden>
            <line
              x1="0" y1="4" x2="80" y2="4"
              stroke="var(--color-glow)" strokeWidth="2" pathLength={1} strokeDasharray="1"
              style={{ animation: 'travel-line 900ms ease-in-out both' }}
            />
          </svg>
          <span className="text-ink-100">{to.name}</span>
        </div>
        <div className="mt-6 font-display text-7xl font-bold tracking-wide text-glow uppercase">Dag {transit.day}</div>
      </div>
    </div>
  )
}

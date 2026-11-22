import { CITIES, type CityId } from '@engine/index.ts'

// Stylised placeholder map. Coastline is a rough hand-made outline, not
// cartographic data; it will be replaced with proper map art later.
const OUTLINE: [number, number][] = [
  [58.0, 7.0], [58.9, 5.6], [60.4, 4.9], [62.2, 5.1], [62.5, 6.0], [63.1, 7.7], [63.7, 9.0],
  [64.9, 11.2], [66.5, 12.9], [67.3, 14.1], [68.2, 13.4], [68.6, 15.6], [69.7, 18.3], [70.3, 20.6],
  [70.7, 23.7], [71.15, 25.8], [70.9, 28.5], [70.4, 31.1], [69.7, 30.0], [69.0, 28.9], [69.6, 27.3],
  [69.0, 25.7], [69.05, 21.0], [68.4, 18.1], [67.5, 16.4], [66.0, 14.5], [65.0, 14.0], [64.0, 13.9],
  [63.0, 12.1], [62.0, 12.3], [61.0, 12.6], [60.0, 12.5], [59.5, 11.8], [59.0, 11.4], [59.9, 10.7],
  [59.0, 10.2], [58.1, 8.0],
]

// Nudge labels apart where cities sit close together (Hamar/Oslo/Bergen).
const LABEL_DY: Record<string, number> = { hamar: -5, oslo: 9 }

const W = 300
const H = 420
const project = (lat: number, lng: number) => ({
  x: 22 + ((lng - 4.5) / (31.5 - 4.5)) * (W - 44),
  y: 18 + ((71.3 - lat) / (71.3 - 57.8)) * (H - 36),
})

export default function NorwayMap({
  current,
  selected,
  onSelect,
}: {
  current: CityId
  selected: CityId | null
  onSelect: (id: CityId) => void
}) {
  const path = OUTLINE.map(([lat, lng], i) => {
    const p = project(lat, lng)
    return `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  }).join(' ') + 'Z'
  const from = CITIES.find((c) => c.id === current)!
  const fp = project(from.lat, from.lng)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" role="img" aria-label="Kart over Norge">
      <defs>
        <radialGradient id="land" cx="40%" cy="70%" r="80%">
          <stop offset="0%" stopColor="#1d1d26" />
          <stop offset="100%" stopColor="#111117" />
        </radialGradient>
      </defs>
      <path d={path} fill="url(#land)" stroke="#2f2f3b" strokeWidth="1.2" strokeLinejoin="round" />
      {CITIES.filter((c) => c.id !== current).map((c) => {
        const p = project(c.lat, c.lng)
        const active = c.id === selected
        return (
          <line
            key={`l-${c.id}`}
            x1={fp.x} y1={fp.y} x2={p.x} y2={p.y}
            stroke={active ? 'var(--color-glow)' : '#ffffff'}
            strokeOpacity={active ? 0.9 : 0.07}
            strokeWidth={active ? 1.6 : 1}
            strokeDasharray={active ? '4 4' : undefined}
          />
        )
      })}
      {CITIES.map((c) => {
        const p = project(c.lat, c.lng)
        const here = c.id === current
        const active = c.id === selected
        return (
          <g
            key={c.id}
            onClick={() => !here && onSelect(c.id)}
            className={here ? '' : 'cursor-pointer'}
          >
            <circle cx={p.x} cy={p.y} r={18} fill="transparent" />
            {here && <circle cx={p.x} cy={p.y} r={5} fill="none" stroke="var(--color-glow)" className="animate-pulse-dot" />}
            <circle
              cx={p.x} cy={p.y} r={here ? 5 : active ? 5 : 3.5}
              fill={here ? 'var(--color-glow)' : active ? '#fff' : '#9d9dab'}
            />
            <text
              x={p.x + 8} y={p.y + 4 + (LABEL_DY[c.id] ?? 0)}
              className="font-display"
              fontSize="12"
              letterSpacing="0.06em"
              fill={here ? 'var(--color-glow)' : active ? '#fff' : '#9d9dab'}
            >
              {c.name.toUpperCase()}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

import { useState } from 'react'
import type { City } from '@engine/index.ts'
import { CITY_ART } from '@/lib/cityArt.ts'

const INFO_KEY = 'undergrunnen.cityInfo'

function Bars({ label, value, max = 3, tone = 'bg-cta' }: { label: string; value: number; max?: number; tone?: string }) {
  return (
    <div className="min-w-0">
      <div className="truncate text-[10px] text-ink-400">{label}</div>
      <span className="mt-1 flex gap-0.5" aria-label={`${label} ${value} av ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`h-1.5 w-2.5 -skew-x-12 rounded-[1px] ${i < value ? tone : 'bg-ink-700'}`} />
        ))}
      </span>
    </div>
  )
}

/** City identity: image (or graded placeholder), name, subtitle and market profile. */
export default function CityHero({ city, day }: { city: City; day: number }) {
  const art = CITY_ART[city.id]
  const h = city.hue
  const [open, setOpen] = useState(() => {
    try {
      return localStorage.getItem(INFO_KEY) === '1'
    } catch {
      return false
    }
  })
  const toggle = () => {
    setOpen(!open)
    try {
      localStorage.setItem(INFO_KEY, open ? '0' : '1')
    } catch {
      /* storage unavailable */
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900">
      <div
        className="grain relative h-28 overflow-hidden"
        style={
          art
            ? undefined
            : {
                background: `radial-gradient(120% 90% at 80% 0%, hsl(${h} 70% 45% / .5), transparent 60%),
                  radial-gradient(90% 80% at 0% 100%, hsl(${(h + 40) % 360} 60% 30% / .45), transparent 60%),
                  linear-gradient(180deg, hsl(${h} 25% 12%), #0d1110)`,
              }
        }
      >
        {art ? (
          <img src={art.src} alt="" className="absolute inset-0 h-full w-full object-cover object-center" />
        ) : (
          <svg className="absolute inset-x-0 bottom-0 h-16 w-full opacity-60" viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
            <path
              d="M0 60V38h18v-8h12v14h10V22h8v-6h6v6h8v24h14V30h20v16h10V12h4V4h4v8h4v34h16V34h12v-8h14v20h18V26h10v-6h10v6h6v20h20V36h16v10h12V18h18v28h14V32h22v14h16V28h10v18h18V40h18v20z"
              fill="#0d1110"
            />
          </svg>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/25 to-transparent" />
        <div className="absolute inset-x-4 bottom-2.5">
          <div className="text-[11px] font-semibold tracking-[0.2em] text-glow uppercase">
            {city.county === city.name ? city.region : city.county} · Dag {day}
          </div>
          <h1 className="font-display text-3xl leading-none font-bold tracking-wide uppercase drop-shadow">{city.name}</h1>
          <div className="mt-0.5 text-sm font-medium text-cta">{city.subtitle}</div>
        </div>
      </div>
      <button onClick={toggle} aria-expanded={open} className="block w-full px-4 pt-2 pb-2.5 text-left">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-3">
          <Bars label="Marked" value={city.marketSize} />
          <Bars label="Konkurranse" value={city.competition} />
          <Bars label="Etterspørsel" value={city.demand} />
          <Bars label="Politi" value={city.risk} max={5} tone="bg-loss" />
          <span className={`text-sm text-ink-300 transition-transform ${open ? 'rotate-180' : ''}`} aria-label="Om byen">
            ▾
          </span>
        </div>
        {open && (
          <div className="animate-fade-in">
            <p className="mt-2.5 text-sm text-ink-300">{city.tagline}</p>
            <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Kjent for">
              {city.knownFor.map((k) => (
                <li key={k} className="rounded-full border border-ink-700 px-2 py-0.5 text-[11px] text-ink-300">
                  {k}
                </li>
              ))}
            </ul>
          </div>
        )}
      </button>
    </div>
  )
}

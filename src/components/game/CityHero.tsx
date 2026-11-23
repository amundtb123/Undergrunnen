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

/** Full-width city image behind the header and the top of the screen, fading into the page. */
export function CityBackdrop({ city }: { city: City }) {
  const art = CITY_ART[city.id]
  const h = city.hue
  return (
    <div
      aria-hidden
      className="grain pointer-events-none absolute inset-x-0 top-0 h-[270px] overflow-hidden"
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
      {art && <img key={art.src} src={art.src} alt="" className="absolute inset-0 h-full w-full animate-fade-in object-cover object-center" />}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgb(13 17 16 / .55) 0%, rgb(13 17 16 / .15) 38%, rgb(13 17 16 / .55) 68%, #0d1110 100%)',
        }}
      />
    </div>
  )
}

/** City name and market profile, drawn over the backdrop. */
export default function CityHero({ city, day }: { city: City; day: number }) {
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
    <div>
      <div className="px-1 pt-14 pb-3">
        <div className="text-[11px] font-semibold tracking-[0.2em] text-glow uppercase drop-shadow">
          {city.county === city.name ? city.region : city.county} · Dag {day}
        </div>
        <h1 className="font-display text-4xl leading-none font-bold tracking-wide uppercase drop-shadow-lg">{city.name}</h1>
        <div className="mt-0.5 text-sm font-medium text-cta drop-shadow">{city.subtitle}</div>
      </div>
      <button
        onClick={toggle}
        aria-expanded={open}
        className="block w-full rounded-xl border border-white/5 bg-ink-950/60 px-3 pt-2 pb-2.5 text-left backdrop-blur-md"
      >
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

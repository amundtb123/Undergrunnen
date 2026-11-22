import type { City } from '@engine/index.ts'
import { CITY_ART } from '@/lib/cityArt.ts'

function Bars({ label, value, max = 3, tone = 'bg-cta' }: { label: string; value: number; max?: number; tone?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[11px] text-ink-300">{label}</span>
      <span className="flex gap-0.5" aria-label={`${label} ${value} av ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`h-1.5 w-3 -skew-x-12 rounded-[1px] ${i < value ? tone : 'bg-ink-700'}`} />
        ))}
      </span>
    </div>
  )
}

/** City identity: image (or graded placeholder), name, subtitle and market profile. */
export default function CityHero({ city, day }: { city: City; day: number }) {
  const art = CITY_ART[city.id]
  const h = city.hue

  return (
    <div className="overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900">
      <div
        className="grain relative h-44 overflow-hidden"
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
        <div className="absolute inset-x-4 bottom-3">
          <div className="text-[11px] font-semibold tracking-[0.2em] text-glow uppercase">
            {city.county === city.name ? city.region : city.county} · Dag {day}
          </div>
          <h1 className="font-display text-4xl leading-none font-bold tracking-wide uppercase drop-shadow">{city.name}</h1>
          <div className="mt-0.5 text-sm font-medium text-cta">{city.subtitle}</div>
        </div>
      </div>
      <div className="px-4 pt-2 pb-3">
        <p className="text-sm text-ink-300">{city.tagline}</p>
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Kjent for">
          {city.knownFor.map((k) => (
            <li key={k} className="rounded-full border border-ink-700 px-2 py-0.5 text-[11px] text-ink-300">
              {k}
            </li>
          ))}
        </ul>
        <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-1.5">
          <Bars label="Markedsstørrelse" value={city.marketSize} />
          <Bars label="Konkurranse" value={city.competition} />
          <Bars label="Polititrykk" value={city.risk} max={5} tone="bg-loss" />
          <Bars label="Etterspørsel" value={city.demand} />
        </div>
      </div>
    </div>
  )
}

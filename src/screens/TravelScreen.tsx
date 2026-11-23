import { useState } from 'react'
import { CITIES, RULES, getCity, tripFor, type CityId, type GameState } from '@engine/index.ts'
import NorwayMap from '@/components/game/NorwayMap.tsx'
import { kr } from '@/lib/format.ts'

export default function TravelScreen({ game, onTravel }: { game: GameState; onTravel: (to: CityId) => void }) {
  const [selected, setSelected] = useState<CityId | null>(null)
  const dest = selected ? getCity(selected) : null
  const r = selected ? tripFor(game, selected) : null
  const tooLate = r ? game.day + r.days > game.maxDays : false
  const hitch = r?.mode === 'Haik'
  const debtAfter = r ? Math.round(game.debt * (1 + RULES.debtRate) ** r.days) : 0

  return (
    <div className="px-4 py-4">
      <h2 className="mb-2 px-1 font-display text-sm font-semibold tracking-[0.18em] text-ink-300 uppercase">Velg destinasjon</h2>
      <ul className="grid grid-cols-2 gap-2">
        {CITIES.filter((c) => c.id !== game.cityId).map((c) => {
          const rr = tripFor(game, c.id)
          const on = c.id === selected
          return (
            <li key={c.id}>
              <button
                onClick={() => setSelected(on ? null : c.id)}
                aria-pressed={on}
                className={`w-full rounded-xl border px-3 py-2 text-left transition-colors active:bg-ink-800 ${
                  on ? 'border-cta/60 bg-cta/10' : 'border-white/5 bg-ink-900'
                }`}
              >
                <div className="font-semibold">{c.name}</div>
                <div className="tabular text-xs text-ink-400">
                  {rr.days} dag{rr.days > 1 ? 'er' : ''} · {rr.mode === 'Haik' ? <span className="text-alert">haik</span> : kr(rr.cost)}
                </div>
              </button>
            </li>
          )
        })}
      </ul>
      {dest && r && (
        <div key={dest.id} ref={(el) => el?.scrollIntoView({ behavior: "smooth", block: "nearest" })} className="mt-3 animate-fade-in rounded-2xl border border-cta/25 bg-ink-850 p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.18em] text-ink-400 uppercase">
                {dest.county === dest.name ? dest.region : `${dest.county} · ${dest.region}`}
              </div>
              <div className="font-display text-2xl font-bold tracking-wide uppercase">{dest.name}</div>
              <p className="text-sm text-ink-400">{dest.tagline}</p>
            </div>
            <div className="text-right text-xs text-ink-400">
              Risiko
              <div className="mt-1 flex justify-end gap-0.5">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`h-1.5 w-3 rounded-sm ${i < dest.risk ? 'bg-loss' : 'bg-ink-700'}`} />
                ))}
              </div>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-ink-800 py-2">
              <dt className="text-[10px] text-ink-400 uppercase">{r.mode}</dt>
              <dd className="tabular font-semibold">{r.km} km</dd>
            </div>
            <div className="rounded-xl bg-ink-800 py-2">
              <dt className="text-[10px] text-ink-400 uppercase">Reisetid</dt>
              <dd className="font-semibold">{r.days} dag{r.days > 1 ? 'er' : ''}</dd>
            </div>
            <div className="rounded-xl bg-ink-800 py-2">
              <dt className="text-[10px] text-ink-400 uppercase">Billett</dt>
              <dd className="tabular font-semibold">{kr(r.cost)}</dd>
            </div>
          </dl>
          {hitch && (
            <p className="mt-3 text-xs text-alert">Du har ikke råd til billett. Haiking er gratis, men tar en ekstra dag.</p>
          )}
          {game.debt > 0 && (
            <p className="mt-3 text-xs text-ink-400">
              Gjelden til Kjell vokser til <span className="tabular font-semibold text-loss">{kr(debtAfter)}</span> innen du er fremme.
            </p>
          )}
          <button
            onClick={() => onTravel(dest.id)}
            disabled={tooLate}
            className="mt-4 h-14 w-full rounded-2xl bg-cta text-base font-bold tracking-wide text-ink-950 uppercase transition-transform active:scale-[0.98] disabled:bg-ink-700 disabled:text-ink-400"
          >
            {tooLate ? 'Rekker ikke frem' : hitch ? `Haik til ${dest.name}` : `Reis til ${dest.name}`}
          </button>
        </div>
      )}
      <div className="relative mx-auto mt-4 aspect-[300/420] max-h-[36dvh] overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
        <NorwayMap current={game.cityId} selected={selected} onSelect={setSelected} />
      </div>
    </div>
  )
}

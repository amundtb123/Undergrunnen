import { useMemo } from 'react'
import { ITEMS, getCity, marketTrend, type GameState, type ItemId } from '@engine/index.ts'
import CityHero from '@/components/game/CityHero.tsx'
import { kr, num } from '@/lib/format.ts'

function priceTag(ratio: number): { text: string; cls: string } | null {
  if (ratio < 0.55) return { text: 'Spottpris', cls: 'bg-gain/15 text-gain' }
  if (ratio < 0.82) return { text: 'Billig', cls: 'bg-gain/10 text-gain/90' }
  if (ratio > 2) return { text: 'Rekordhøyt', cls: 'bg-alert/20 text-alert' }
  if (ratio > 1.3) return { text: 'Dyrt', cls: 'bg-alert/10 text-alert/90' }
  return null
}

export default function MarketScreen({
  game,
  onPick,
  onFinish,
}: {
  game: GameState
  onPick: (id: ItemId) => void
  onFinish: () => void
}) {
  const city = getCity(game.cityId)!
  const today = game.news.filter((n) => n.day === game.day)
  const lastDay = game.day >= game.maxDays
  const trend = useMemo(
    () => marketTrend(game.seed, game.day, game.cityId, game.market),
    [game.seed, game.day, game.cityId, game.market],
  )

  return (
    <div className="space-y-4 px-4 py-4">
      <CityHero city={city} day={game.day} />

      {lastDay && (
        <div className="animate-fade-in rounded-2xl border border-alert/40 bg-alert/10 p-4">
          <div className="font-display text-lg font-semibold tracking-wide text-alert uppercase">Siste dag</div>
          <p className="mt-1 text-sm text-ink-300">
            Varer teller ikke i sluttsummen. Selg alt, betal Kjell hvis du er i Hamar, og gjør opp.
          </p>
          <button onClick={onFinish} className="mt-3 h-11 w-full rounded-xl bg-cta font-semibold text-ink-950 active:scale-[0.98]">
            Gjør opp regnskapet
          </button>
        </div>
      )}

      {today.length > 0 && (
        <ul className="space-y-2">
          {today.map((n, i) => (
            <li
              key={i}
              className={`animate-fade-in rounded-xl border-l-2 bg-ink-850 px-3 py-2.5 text-sm ${
                n.tone === 'bad' ? 'border-loss text-ink-100' : n.tone === 'good' ? 'border-gain' : 'border-alert/60 text-ink-300'
              }`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              {n.text}
            </li>
          ))}
        </ul>
      )}

      <section>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="font-display text-sm font-semibold tracking-[0.18em] text-ink-300 uppercase">Markedet i dag</h2>
          <span className="text-[11px] text-ink-400">▲▼ fra i går · trykk for å handle</span>
        </div>
        <ul className="overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
          {ITEMS.map((item) => {
            const price = game.market[item.id]
            const held = game.inventory[item.id]
            const tag = price ? priceTag(price / item.basePrice) : null
            const canAct = price !== undefined
            return (
              <li key={item.id} className="border-b border-white/5 last:border-0">
                <button
                  disabled={!canAct}
                  onClick={() => onPick(item.id)}
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-left transition-colors active:bg-ink-800 disabled:opacity-35"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold">{item.name}</span>
                      {tag && <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${tag.cls}`}>{tag.text}</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-ink-400">
                      {held ? (
                        <span className="text-ink-300">
                          Du har <span className="tabular font-semibold text-ink-100">{num(held.qty)}</span>
                          {held.avgCost > 0 && <> · snitt {kr(held.avgCost)}</>}
                          {price && held.avgCost > 0 && (
                            <span className={`tabular ml-1 font-semibold ${price >= held.avgCost ? 'text-gain' : 'text-loss'}`}>
                              {price >= held.avgCost ? '+' : '−'}
                              {Math.abs(Math.round(((price - held.avgCost) / held.avgCost) * 100))}%
                            </span>
                          )}
                        </span>
                      ) : (
                        <>Plass {item.size} per stk</>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {price ? (
                      <div className="tabular font-display text-lg font-semibold">{kr(price)}</div>
                    ) : (
                      <div className="text-xs text-ink-400">Ikke i dag</div>
                    )}
                    {price && trend[item.id] != null && trend[item.id] !== 0 && (
                      <div
                        className={`tabular text-[11px] font-semibold ${trend[item.id]! > 0 ? 'text-gain' : 'text-loss'}`}
                        title="Endring fra i går"
                      >
                        {trend[item.id]! > 0 ? '▲' : '▼'} {Math.abs(trend[item.id]!)}%
                      </div>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

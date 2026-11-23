import { useMemo, useState } from 'react'
import { getCity, itemsFor, marketTrend, type GameState, type ItemId } from '@engine/index.ts'
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
  const [showAllNews, setShowAllNews] = useState(false)
  const lastDay = game.day >= game.maxDays
  const trend = useMemo(
    () => marketTrend(game.seed, game.day, game.cityId, game.market, game.mode),
    [game.seed, game.day, game.cityId, game.market, game.mode],
  )
  const held = itemsFor(game.mode)
    .map((item) => {
      const h = game.inventory[item.id]
      return { item, qty: h?.qty ?? 0, avgCost: h?.avgCost ?? 0, price: game.market[item.id] }
    })
    .filter((h) => h.qty > 0)
  const heldValue = held.reduce((sum, h) => sum + h.qty * (h.price ?? 0), 0)

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
        <ul className="divide-y divide-white/5 overflow-hidden rounded-xl bg-ink-850">
          {(showAllNews ? today : today.slice(0, 2)).map((n, i) => (
            <li
              key={i}
              className={`animate-fade-in border-l-2 px-3 py-2 text-[13px] leading-snug ${
                n.tone === 'bad' ? 'border-loss text-ink-100' : n.tone === 'good' ? 'border-gain' : 'border-alert/60 text-ink-300'
              }`}
            >
              {n.text}
            </li>
          ))}
          {today.length > 2 && (
            <li>
              <button onClick={() => setShowAllNews(!showAllNews)} className="w-full px-3 py-1.5 text-left text-[11px] font-semibold text-ink-400">
                {showAllNews ? 'Vis færre' : `+ ${today.length - 2} ${today.length === 3 ? 'nyhet' : 'nyheter'} til`}
              </button>
            </li>
          )}
        </ul>
      )}

      {held.length > 0 && (
        <section aria-label="I sekken" className="rounded-2xl border border-cta/25 bg-cta/[0.04] p-3">
          <div className="mb-2 flex items-baseline justify-between px-0.5">
            <h2 className="font-display text-sm font-semibold tracking-[0.18em] text-cta uppercase">I sekken</h2>
            <span className="tabular text-[11px] text-ink-400">
              Verdi her <span className="font-semibold text-ink-100">{kr(heldValue)}</span>
            </span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {held.map(({ item, qty, avgCost, price }) => {
              const pl = price && avgCost > 0 ? Math.round(((price - avgCost) / avgCost) * 100) || null : null
              return (
                <li key={item.id}>
                  <button
                    disabled={price === undefined}
                    onClick={() => onPick(item.id)}
                    className="flex h-8 items-center gap-1.5 rounded-full border border-ink-700 bg-ink-850 pr-2.5 pl-1 text-xs active:bg-ink-800 disabled:opacity-40"
                  >
                    <span className="tabular rounded-full bg-cta px-1.5 py-0.5 text-[11px] font-bold text-ink-950">{num(qty)}</span>
                    <span className="font-semibold">{item.name}</span>
                    {price === undefined ? (
                      <span className="text-ink-400">ikke her</span>
                    ) : (
                      pl !== null && (
                        <span className={`tabular font-semibold ${pl >= 0 ? 'text-gain' : 'text-loss'}`}>
                          {pl >= 0 ? '+' : '−'}
                          {Math.abs(pl)}%
                        </span>
                      )
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section>
        <div className="mb-2 flex items-baseline justify-between px-1">
          <h2 className="font-display text-sm font-semibold tracking-[0.18em] text-ink-300 uppercase">Markedet i dag</h2>
          <span className="text-[11px] text-ink-400">▲▼ fra i går</span>
        </div>
        <ul className="grid grid-cols-2 gap-2">
          {itemsFor(game.mode).map((item) => {
            const price = game.market[item.id]
            const h = game.inventory[item.id]
            const owned = !!h && h.qty > 0
            const tag = price ? priceTag(price / item.basePrice) : null
            const t = trend[item.id]
            const pl = owned && price && h.avgCost > 0 ? Math.round(((price - h.avgCost) / h.avgCost) * 100) || null : null
            return (
              <li key={item.id}>
                <button
                  disabled={price === undefined}
                  onClick={() => onPick(item.id)}
                  className={`flex h-full min-h-[72px] w-full flex-col gap-0.5 rounded-xl border px-3 py-2 text-left transition-colors active:bg-ink-800 disabled:opacity-35 ${
                    owned ? 'border-cta/45 bg-cta/[0.06]' : 'border-white/5 bg-ink-900'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-1.5">
                    {owned && (
                      <span className="tabular shrink-0 rounded-full bg-cta px-1.5 text-[11px] leading-[16px] font-bold text-ink-950">
                        {num(h.qty)}
                      </span>
                    )}
                    <span className="truncate text-[13px] font-semibold">{item.name}</span>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-col justify-center gap-0.5">
                    {price ? (
                      <div className="tabular font-display text-lg leading-tight font-semibold whitespace-nowrap">{kr(price)}</div>
                    ) : (
                      <div className="text-xs text-ink-400">Ikke i dag</div>
                    )}
                    {pl !== null && (
                      <span className={`tabular text-[10px] font-semibold ${pl >= 0 ? 'text-gain' : 'text-loss'}`} title="Gevinst mot snittpris">
                        {pl >= 0 ? '+' : '−'}
                        {Math.abs(pl)}% mot snitt
                      </span>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-center gap-1 text-[10px] font-semibold">
                    {price && t != null && t !== 0 && (
                      <span className={`tabular ${t > 0 ? 'text-gain' : 'text-loss'}`}>
                        {t > 0 ? '▲' : '▼'}
                        {Math.abs(t)}%
                      </span>
                    )}
                    {tag && <span className={`rounded px-1 py-px uppercase ${tag.cls}`}>{tag.text}</span>}
                  </div>
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

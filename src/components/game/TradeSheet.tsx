import { useState } from 'react'
import { CITIES, getItem, maxBuy, route, type Action, type GameState, type ItemId } from '@engine/index.ts'
import Sheet from '@/components/ui/Sheet.tsx'
import { haptic, kr, num } from '@/lib/format.ts'

export default function TradeSheet({
  game,
  itemId,
  onAction,
  onClose,
}: {
  game: GameState
  itemId: ItemId
  onAction: (a: Action) => GameState | null
  onClose: () => void
}) {
  const item = getItem(itemId)!
  const price = game.market[itemId] ?? 0
  const held = game.inventory[itemId]?.qty ?? 0
  const avg = game.inventory[itemId]?.avgCost ?? 0
  const [side, setSide] = useState<'buy' | 'sell'>(held > 0 && price > avg ? 'sell' : 'buy')
  const max = side === 'buy' ? maxBuy(game, itemId) : held
  const [qty, setQty] = useState(() => (side === 'buy' ? maxBuy(game, itemId) : held))
  const q = Math.min(qty, max)
  const total = q * price
  const profit = side === 'sell' && avg > 0 ? (price - avg) * q : null
  const cheapestFare = Math.min(...CITIES.filter((c) => c.id !== game.cityId).map((c) => route(game.cityId, c.id).cost))

  const switchSide = (s: 'buy' | 'sell') => {
    setSide(s)
    setQty(s === 'buy' ? maxBuy(game, itemId) : held)
  }

  const confirm = () => {
    if (q <= 0) return
    const next = onAction({ type: side, itemId, qty: q })
    if (next) {
      haptic(side === 'buy' ? 10 : 18)
      onClose()
    }
  }

  return (
    <Sheet onClose={onClose}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-bold tracking-wide uppercase">{item.name}</h3>
          <p className="mt-0.5 text-sm text-ink-400">{item.description}</p>
        </div>
        <div className="text-right">
          <div className="tabular font-display text-2xl font-semibold text-ink-100">{kr(price)}</div>
          <div className="text-[11px] text-ink-400">per stk · plass {item.size}</div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 rounded-xl bg-ink-800 p-1">
        {(['buy', 'sell'] as const).map((s) => (
          <button
            key={s}
            onClick={() => switchSide(s)}
            disabled={s === 'sell' && held === 0}
            className={`h-10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-30 ${
              side === s ? 'bg-ink-600 text-ink-100' : 'text-ink-400'
            }`}
          >
            {s === 'buy' ? 'Kjøp' : `Selg (${num(held)})`}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          onClick={() => setQty(Math.max(0, q - 1))}
          className="h-12 w-12 shrink-0 rounded-xl bg-ink-800 text-2xl text-ink-300 active:bg-ink-700"
          aria-label="Færre"
        >
          −
        </button>
        <div className="flex-1 text-center">
          <div className="tabular font-display text-4xl font-semibold">{num(q)}</div>
          <div className="text-[11px] text-ink-400">av maks {num(max)}</div>
        </div>
        <button
          onClick={() => setQty(Math.min(max, q + 1))}
          className="h-12 w-12 shrink-0 rounded-xl bg-ink-800 text-2xl text-ink-300 active:bg-ink-700"
          aria-label="Flere"
        >
          +
        </button>
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(1, max)}
        value={q}
        disabled={max === 0}
        onChange={(e) => setQty(Number(e.target.value))}
        className="mt-4 w-full"
        aria-label="Antall"
      />
      <div className="mt-2 grid grid-cols-4 gap-2">
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <button
            key={f}
            onClick={() => setQty(Math.floor(max * f))}
            className="h-9 rounded-lg bg-ink-800 text-xs font-semibold text-ink-300 active:bg-ink-700"
          >
            {f === 1 ? 'Maks' : `${f * 100}%`}
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-baseline justify-between border-t border-white/5 pt-4">
        <span className="text-sm text-ink-400">{side === 'buy' ? 'Du betaler' : 'Du får'}</span>
        <div className="text-right">
          <div className="tabular font-display text-2xl font-semibold">{kr(total)}</div>
          {profit !== null && q > 0 && (
            <div className={`tabular text-xs font-semibold ${profit >= 0 ? 'text-gain' : 'text-loss'}`}>
              {profit >= 0 ? 'Gevinst ' : 'Tap '}
              {kr(Math.abs(profit))}
            </div>
          )}
        </div>
      </div>

      {side === 'buy' && q > 0 && game.cash - total < cheapestFare && (
        <p className="mt-3 text-xs text-alert">
          Da har du ikke råd til billett videre ({kr(cheapestFare)}). Du må haike, som tar en ekstra dag.
        </p>
      )}

      <button
        onClick={confirm}
        disabled={q === 0}
        className={`mt-4 h-14 w-full rounded-2xl text-base font-bold tracking-wide uppercase transition-transform active:scale-[0.98] disabled:opacity-30 ${
          side === 'buy' ? 'bg-cta text-ink-950' : 'bg-gain text-ink-950'
        }`}
      >
        {side === 'buy' ? `Kjøp ${num(q)}` : `Selg ${num(q)}`}
      </button>
    </Sheet>
  )
}

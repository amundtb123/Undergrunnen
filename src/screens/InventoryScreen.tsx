import { getItem, inventoryUsed, inventoryValue, type GameState, type ItemId } from '@engine/index.ts'
import { kr, num } from '@/lib/format.ts'

export default function InventoryScreen({ game, onPick }: { game: GameState; onPick: (id: ItemId) => void }) {
  const used = inventoryUsed(game)
  const entries = Object.entries(game.inventory)

  return (
    <div className="space-y-4 px-4 py-4">
      <section className="rounded-2xl border border-white/5 bg-ink-900 p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-sm font-semibold tracking-[0.18em] text-ink-300 uppercase">Lageret</h2>
          <span className="tabular text-sm">
            {used} / {game.capacity} plasser
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink-700">
          <div className="h-full bg-glow transition-[width] duration-500" style={{ width: `${Math.min(100, (used / game.capacity) * 100)}%` }} />
        </div>
        <div className="mt-3 flex justify-between text-sm text-ink-400">
          <span>Verdi her i dag</span>
          <span className="tabular font-semibold text-ink-100">{kr(inventoryValue(game))}</span>
        </div>
      </section>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-ink-400">
          Tomt. Kjøp billig, reis, og selg dyrt.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
          {entries.map(([id, h]) => {
            const item = getItem(id)!
            const here = game.market[id]
            const diff = here && h.avgCost ? here - h.avgCost : null
            return (
              <li key={id} className="border-b border-white/5 last:border-0">
                <button
                  onClick={() => here && onPick(id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-ink-800"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold">{item.name}</div>
                    <div className="tabular text-xs text-ink-400">
                      {num(h.qty)} stk · snitt {h.avgCost ? kr(h.avgCost) : 'gratis'} · {h.qty * item.size} plass
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="tabular text-sm">{here ? kr(here) : 'Ingen kjøper her'}</div>
                    {diff !== null && (
                      <div className={`tabular text-xs font-semibold ${diff >= 0 ? 'text-gain' : 'text-loss'}`}>
                        {diff >= 0 ? '+' : '−'}
                        {kr(Math.abs(diff * h.qty))}
                      </div>
                    )}
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

import { inventoryUsed, netWorth, type GameState } from '@engine/index.ts'
import { krShort } from '@/lib/format.ts'
import AnimatedNumber from '@/components/ui/AnimatedNumber.tsx'

function Stat({ label, children, tone = '' }: { label: string; children: React.ReactNode; tone?: string }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] font-semibold tracking-[0.14em] text-ink-400 uppercase">{label}</div>
      <div className={`truncate font-display text-[17px] leading-tight font-semibold ${tone}`}>{children}</div>
    </div>
  )
}

/** Header (wordmark + day) and the always-visible economy strip. */
export default function StatusBar({ game, onHome }: { game: GameState; onHome: () => void }) {
  const used = inventoryUsed(game)
  const worth = netWorth(game)
  const progress = (game.day / game.maxDays) * 100
  const daysLeft = game.maxDays - game.day

  return (
    <header className="sticky top-0 z-30 px-3 pt-[max(0.5rem,env(safe-area-inset-top))] pb-1">
      <div className="rounded-2xl border border-white/10 bg-ink-950/45 px-4 pt-3 pb-3 shadow-lg shadow-black/30 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onHome}
            aria-label="Til forsiden"
            className="-my-2 -ml-1 px-1 py-2 font-display text-[15px] font-bold tracking-[0.12em] uppercase italic active:opacity-60"
          >
            Undergrunnen
          </button>
          {game.mode === 'classic' && (
            <span className="rounded border border-alert/50 px-1 text-[9px] font-bold tracking-wider text-alert uppercase">Classic</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-300">
          {daysLeft <= 3 && game.status === 'active' && (
            <span className="rounded bg-loss/15 px-1.5 py-0.5 text-[10px] font-bold text-loss uppercase">
              {daysLeft === 0 ? 'Siste dag' : `${daysLeft} igjen`}
            </span>
          )}
          <span>
            Dag <span className="tabular font-display text-sm font-semibold text-ink-100">{String(game.day).padStart(2, '0')}</span>
            <span className="tabular"> / {game.maxDays}</span>
          </span>
        </div>
      </div>
      <div className="mt-2 h-0.5 overflow-hidden rounded-full bg-ink-700">
        <div className="h-full bg-glow transition-[width] duration-700" style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2.5 grid grid-cols-4 divide-x divide-white/10 [&>*]:px-2.5 [&>*:first-child]:pl-0">
        <Stat label="Kontant" tone="text-ink-100">
          <AnimatedNumber value={game.cash} format={krShort} />
        </Stat>
        <Stat label="Gjeld" tone={game.debt > 0 ? 'text-loss' : 'text-ink-400'}>
          <AnimatedNumber value={game.debt} format={krShort} />
        </Stat>
        <Stat label="Netto" tone={worth >= 0 ? 'text-gain' : 'text-loss'}>
          <AnimatedNumber value={worth} format={krShort} />
        </Stat>
        <Stat label="Lager" tone={used >= game.capacity ? 'text-alert' : ''}>
          <span className="tabular">{used}</span>
          <span className="text-ink-400">/{game.capacity}</span>
        </Stat>
      </div>
      {game.health < 100 && (
        <div className="mt-2 flex items-center gap-2 text-[10px] font-semibold tracking-wider text-ink-400 uppercase">
          Helse
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-ink-700">
            <div
              className={`h-full transition-[width] duration-500 ${game.health < 35 ? 'bg-loss' : 'bg-gain'}`}
              style={{ width: `${game.health}%` }}
            />
          </div>
          <span className="tabular text-ink-300">{game.health}</span>
        </div>
      )}
      </div>
    </header>
  )
}

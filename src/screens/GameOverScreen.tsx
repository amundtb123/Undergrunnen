import { CITIES, rankTitle, type GameState } from '@engine/index.ts'
import { kr } from '@/lib/format.ts'
import AnimatedNumber from '@/components/ui/AnimatedNumber.tsx'

export default function GameOverScreen({ game, onNew, onMenu }: { game: GameState; onNew: () => void; onMenu: () => void }) {
  const score = game.score ?? 0
  const dead = game.status === 'dead'
  const rows: [string, string][] = [
    ['Kontanter', kr(game.cash)],
    ['Bank', kr(game.bank)],
    ['Gjeld', kr(-game.debt)],
    ['Handler', String(game.stats.trades)],
    ['Realisert gevinst', kr(game.stats.realizedProfit)],
    ['Beste handel', kr(game.stats.bestTrade)],
    ['Byer besøkt', `${game.stats.visited.length} av ${CITIES.length}`],
    ['Dager', `${game.day} av ${game.maxDays}`],
  ]

  return (
    <div className="mx-auto flex min-h-full max-w-[480px] flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="animate-fade-in text-center">
        <div className={`text-xs font-semibold tracking-[0.35em] uppercase ${dead ? 'text-loss' : 'text-glow'}`}>
          {dead ? 'Game over' : 'Regnskapet er gjort opp'}
        </div>
        <div className="mt-6 text-sm text-ink-400">Sluttsum</div>
        <div className={`font-display text-6xl font-bold ${score < 0 ? 'text-loss' : 'text-ink-100'}`}>
          <AnimatedNumber value={score} format={kr} />
        </div>
        <div className="mt-3 inline-block rounded-full border border-glow/40 px-4 py-1 font-display text-lg tracking-[0.15em] text-glow uppercase">
          {rankTitle(score)}
        </div>
        {game.news[0] && <p className="mx-auto mt-5 max-w-xs text-sm text-ink-400">{game.news[0].text}</p>}
      </div>

      <dl className="mt-8 overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-white/5 px-4 py-2.5 text-sm last:border-0">
            <dt className="text-ink-400">{k}</dt>
            <dd className="tabular font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto space-y-3 pt-8">
        <button onClick={onNew} className="h-14 w-full rounded-2xl bg-cta text-base font-bold tracking-wide text-ink-950 uppercase active:scale-[0.98]">
          Spill igjen
        </button>
        <button onClick={onMenu} className="h-12 w-full rounded-2xl text-sm text-ink-400">
          Til menyen
        </button>
      </div>
    </div>
  )
}

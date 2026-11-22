import { useState } from 'react'
import { CITIES, rankTitle } from '@engine/index.ts'
import type { Save, SubmitState } from '@/features/game/useGame.ts'
import { kr } from '@/lib/format.ts'
import AnimatedNumber from '@/components/ui/AnimatedNumber.tsx'
import Leaderboard from '@/components/game/Leaderboard.tsx'

export default function GameOverScreen({
  save,
  submit,
  defaultName,
  onSubmit,
  onNew,
  onMenu,
}: {
  save: Save
  submit: SubmitState
  defaultName: string
  onSubmit: (name: string) => void
  onNew: () => void
  onMenu: () => void
}) {
  const game = save.game
  const score = game.score ?? 0
  const dead = game.status === 'dead'
  const [name, setName] = useState(defaultName)
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
    <div className="mx-auto flex min-h-full max-w-[480px] flex-col gap-6 px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
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

      <section className="rounded-2xl border border-ink-700/70 bg-ink-900 p-4">
        {save.submitted ? (
          <div className="text-center">
            <div className="text-sm text-ink-300">{save.submitted.name} er på topplisten</div>
            <div className="font-display text-3xl font-bold text-cta">#{save.submitted.rank}</div>
          </div>
        ) : !save.runId ? (
          <p className="text-sm text-ink-400">Denne runden ble startet uten nett, så den kan ikke komme på topplisten.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit(name)
            }}
          >
            <label htmlFor="name" className="text-sm font-semibold">
              Sett navnet ditt på topplisten
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 20))}
                maxLength={20}
                autoComplete="nickname"
                placeholder="Navn eller kallenavn"
                className="h-12 min-w-0 flex-1 rounded-xl border border-ink-700 bg-ink-800 px-4 outline-none focus:border-cta/60"
              />
              <button
                type="submit"
                disabled={!name.trim() || submit.status === 'sending'}
                className="h-12 rounded-xl bg-cta px-5 font-semibold text-ink-950 disabled:opacity-40"
              >
                {submit.status === 'sending' ? 'Sjekker…' : 'Lagre'}
              </button>
            </div>
            {submit.status === 'error' && <p className="mt-2 text-sm text-loss">{submit.text}</p>}
            <p className="mt-2 text-[11px] text-ink-400">Serveren spiller av runden din for å bekrefte resultatet.</p>
          </form>
        )}
      </section>

      <Leaderboard mode={game.mode} highlight={save.submitted?.name} refreshKey={save.submitted ? 1 : 0} />

      <dl className="overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between border-b border-ink-700/60 px-4 py-2.5 text-sm last:border-0">
            <dt className="text-ink-400">{k}</dt>
            <dd className="tabular font-semibold">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto space-y-3">
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

import { RULES } from '@engine/index.ts'
import type { LocalScore } from '@/features/game/useGame.ts'
import { kr } from '@/lib/format.ts'
import Leaderboard from '@/components/game/Leaderboard.tsx'

export default function TitleScreen({
  canContinue,
  starting,
  scores,
  onContinue,
  onNew,
}: {
  canContinue: boolean
  starting: boolean
  scores: LocalScore[]
  onContinue: () => void
  onNew: () => void
}) {
  return (
    <div className="relative mx-auto flex min-h-full max-w-[480px] flex-col px-6 pt-[max(3rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div
        className="grain pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(80% 50% at 50% 0%, rgba(245,165,36,.18), transparent 70%), radial-gradient(60% 40% at 100% 100%, rgba(125,211,252,.08), transparent 70%)',
        }}
      />
      <div className="mt-[8vh] animate-fade-in">
        <div className="text-xs font-semibold tracking-[0.4em] text-glow uppercase">Norge · {RULES.maxDays} dager</div>
        <h1 className="mt-2 font-display text-[clamp(2.5rem,12.5vw,3.75rem)] leading-[0.9] font-bold tracking-wide uppercase">
          Undergrunnen
        </h1>
        <p className="mt-4 max-w-xs text-ink-300">
          Kjøp billig. Reis. Selg dyrt. Betal tilbake Kjell før renta spiser deg.
        </p>
      </div>

      <div className="mt-10 space-y-3">
        {canContinue && (
          <button onClick={onContinue} className="h-14 w-full rounded-2xl bg-cta text-base font-bold tracking-wide text-ink-950 uppercase active:scale-[0.98]">
            Fortsett
          </button>
        )}
        <button
          onClick={onNew}
          disabled={starting}
          className={`h-14 disabled:opacity-60 w-full rounded-2xl text-base font-bold tracking-wide uppercase active:scale-[0.98] ${
            canContinue ? 'border border-white/15 text-ink-100' : 'bg-cta text-ink-950'
          }`}
        >
          {starting ? 'Starter…' : 'Nytt spill'}
        </button>
      </div>

      <ul className="mt-10 space-y-2 text-sm text-ink-400">
        <li>◆ Start i Hamar med {kr(RULES.startCash)} og {kr(RULES.startDebt)} i gjeld til Kjell.</li>
        <li>◆ Gjelden vokser {Math.round(RULES.debtRate * 100)} % per dag. Banken og Kjell finnes bare i Hamar.</li>
        <li>◆ Hver reise tar 1–2 dager. Pass deg for politiet.</li>
        <li>◆ Poeng = kontanter + bank − gjeld. Varer teller ikke.</li>
      </ul>

      <div className="mt-10">
        <Leaderboard limit={10} />
      </div>

      {scores.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-2 font-display text-sm font-semibold tracking-[0.18em] text-ink-300 uppercase">Dine beste</h2>
          <ol className="overflow-hidden rounded-2xl border border-white/5 bg-ink-900">
            {scores.slice(0, 5).map((s, i) => (
              <li key={s.date} className="flex items-center justify-between border-b border-white/5 px-4 py-2.5 text-sm last:border-0">
                <span className="text-ink-400">
                  {i + 1}. {s.title}
                  {s.died && ' †'}
                </span>
                <span className={`tabular font-semibold ${s.score < 0 ? 'text-loss' : ''}`}>{kr(s.score)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
      <p className="mt-auto pt-10 text-center text-[11px] text-ink-600">Prototype · alle varer er fiktive</p>
    </div>
  )
}

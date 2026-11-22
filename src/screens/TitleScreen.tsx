import { useRef, useState } from 'react'
import { RULES, type GameMode } from '@engine/index.ts'
import type { LocalScore } from '@/features/game/useGame.ts'
import { haptic, kr } from '@/lib/format.ts'
import Leaderboard from '@/components/game/Leaderboard.tsx'
import Sheet from '@/components/ui/Sheet.tsx'

const SECRET_TAPS = 5

/** Hidden mode switch: Classic (18+) with a self-declared age check. */
function ModeSheet({ mode, onSet, onClose }: { mode: GameMode; onSet: (m: GameMode) => void; onClose: () => void }) {
  const [adult, setAdult] = useState(mode === 'classic')
  return (
    <Sheet onClose={onClose}>
      <div className="text-[11px] font-semibold tracking-[0.2em] text-alert uppercase">Hemmelig meny</div>
      <h3 className="mt-1 font-display text-3xl font-bold tracking-wide uppercase">Classic Mode</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-300">
        En hyllest til originalen. Samme byer, samme Kjell, men varene er dop. Ren fiksjon og bare for voksne.
        Classic har sin egen toppliste.
      </p>
      <label className="mt-4 flex items-center gap-3 rounded-xl bg-ink-800 px-4 py-3 text-sm">
        <input type="checkbox" checked={adult} onChange={(e) => setAdult(e.target.checked)} className="h-5 w-5 accent-[var(--color-cta)]" />
        Jeg bekrefter at jeg er 18 år eller eldre
      </label>
      <div className="mt-4 space-y-2">
        <button
          disabled={!adult}
          onClick={() => onSet('classic')}
          className="h-12 w-full rounded-xl bg-alert font-semibold text-ink-950 disabled:opacity-30"
        >
          {mode === 'classic' ? 'Classic er på' : 'Slå på Classic'}
        </button>
        <button onClick={() => onSet('clean')} className="h-12 w-full rounded-xl bg-ink-800 font-semibold text-ink-100">
          {mode === 'clean' ? 'Clean er på' : 'Tilbake til Clean'}
        </button>
      </div>
      <p className="mt-3 text-[11px] text-ink-400">Gjelder neste nye spill. Et pågående spill beholder modusen sin.</p>
    </Sheet>
  )
}

export default function TitleScreen({
  canContinue,
  starting,
  scores,
  mode,
  onSetMode,
  onContinue,
  onNew,
}: {
  canContinue: boolean
  starting: boolean
  mode: GameMode
  onSetMode: (m: GameMode) => void
  scores: LocalScore[]
  onContinue: () => void
  onNew: () => void
}) {
  const [showMode, setShowMode] = useState(false)
  const taps = useRef<number[]>([])
  const secretTap = () => {
    const now = Date.now()
    taps.current = [...taps.current.filter((t) => now - t < 2500), now]
    if (taps.current.length >= SECRET_TAPS) {
      taps.current = []
      haptic(30)
      setShowMode(true)
    }
  }

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
        <h1
          onClick={secretTap}
          className="mt-2 font-display text-[clamp(2.5rem,12.5vw,3.75rem)] leading-[0.9] font-bold tracking-wide uppercase select-none"
        >
          Undergrunnen
        </h1>
        {mode === 'classic' && (
          <button
            onClick={() => setShowMode(true)}
            className="mt-2 rounded-full border border-alert/50 px-3 py-0.5 text-[11px] font-bold tracking-[0.2em] text-alert uppercase"
          >
            Classic · 18+
          </button>
        )}
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
        <Leaderboard limit={10} mode={mode} />
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
      <p className="mt-auto pt-10 text-center text-[11px] text-ink-600">{mode === 'classic' ? 'Classic Mode · 18+ · ren fiksjon' : 'Prototype · alle varer er fiktive'}</p>
      {showMode && (
        <ModeSheet
          mode={mode}
          onSet={(m) => {
            onSetMode(m)
            setShowMode(false)
          }}
          onClose={() => setShowMode(false)}
        />
      )}
    </div>
  )
}

import type { GameState } from '@engine/index.ts'

export default function NewsScreen({ game }: { game: GameState }) {
  const days = [...new Set(game.news.map((n) => n.day))]
  return (
    <div className="px-4 py-4">
      <h2 className="mb-3 px-1 font-display text-sm font-semibold tracking-[0.18em] text-ink-300 uppercase">Logg</h2>
      <ol className="space-y-5">
        {days.map((d) => (
          <li key={d}>
            <div className="mb-1.5 px-1 text-[11px] font-semibold tracking-wider text-ink-400 uppercase">Dag {d}</div>
            <ul className="space-y-1.5">
              {game.news
                .filter((n) => n.day === d)
                .map((n, i) => (
                  <li
                    key={i}
                    className={`rounded-xl border-l-2 bg-ink-900 px-3 py-2 text-sm ${
                      n.tone === 'bad' ? 'border-loss' : n.tone === 'good' ? 'border-gain' : 'border-ink-600 text-ink-300'
                    }`}
                  >
                    {n.text}
                  </li>
                ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}

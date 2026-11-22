import { useEffect, useState } from 'react'
import type { GameMode } from '@engine/index.ts'
import { fetchTop, type TopScore } from '@/lib/scoresApi.ts'
import { kr } from '@/lib/format.ts'

/** Global top list. `refreshKey` refetches (e.g. after submitting a score). */
export default function Leaderboard({
  limit = 10,
  highlight,
  refreshKey = 0,
  mode = 'clean',
}: {
  mode?: GameMode
  limit?: number
  highlight?: string
  refreshKey?: number
}) {
  const [rows, setRows] = useState<TopScore[] | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let alive = true
    setFailed(false)
    fetchTop(limit, mode)
      .then((r) => alive && setRows(r))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [limit, refreshKey, mode])

  return (
    <section>
      <h2 className="mb-2 font-display text-sm font-semibold tracking-[0.18em] text-ink-300 uppercase">
        Topplisten{mode === 'classic' && <span className="ml-2 text-alert">Classic</span>}
      </h2>
      <div className="overflow-hidden rounded-2xl border border-ink-700/70 bg-ink-900">
        {failed ? (
          <p className="px-4 py-3 text-sm text-ink-400">Fikk ikke hentet listen akkurat nå.</p>
        ) : rows === null ? (
          <p className="px-4 py-3 text-sm text-ink-400">Henter…</p>
        ) : rows.length === 0 ? (
          <p className="px-4 py-3 text-sm text-ink-400">Ingen på listen ennå. Bli den første.</p>
        ) : (
          <ol>
            {rows.map((r, i) => {
              const me = highlight && r.name === highlight
              return (
                <li
                  key={`${r.name}-${r.date}`}
                  className={`flex items-center gap-3 border-b border-ink-700/60 px-4 py-2.5 text-sm last:border-0 ${me ? 'bg-cta/10' : ''}`}
                >
                  <span className={`tabular w-6 font-display font-semibold ${i < 3 ? 'text-glow' : 'text-ink-400'}`}>{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.name}
                    {r.status === 'dead' && <span className="ml-1 text-ink-400">†</span>}
                  </span>
                  <span className={`tabular font-semibold ${r.score < 0 ? 'text-loss' : ''}`}>{kr(r.score)}</span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </section>
  )
}

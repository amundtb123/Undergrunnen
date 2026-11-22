// Local-first game store. Later this hook will call the ug-* Edge Functions
// instead of the engine directly; the UI stays the same.

import { useCallback, useEffect, useState } from 'react'
import {
  applyAction, createGame, ERROR_MESSAGES, newSeed, rankTitle, type Action, type GameState,
} from '@engine/index.ts'

const SAVE_KEY = 'undergrunnen.save.v1'
const SCORES_KEY = 'undergrunnen.scores.v1'

export interface LocalScore {
  score: number
  title: string
  date: string
  died: boolean
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}
function write(key: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

export function useGame() {
  const [game, setGame] = useState<GameState | null>(() => {
    const g = read<GameState | null>(SAVE_KEY, null)
    return g?.schema === 1 ? g : null
  })
  const [scores, setScores] = useState<LocalScore[]>(() => read(SCORES_KEY, []))
  const [error, setError] = useState<{ id: number; text: string } | null>(null)

  useEffect(() => write(SAVE_KEY, game), [game])

  const dispatch = useCallback(
    (action: Action): GameState | null => {
      if (!game) return null
      const r = applyAction(game, action)
      if (!r.ok) {
        setError({ id: Date.now(), text: ERROR_MESSAGES[r.error] })
        return null
      }
      if (game.status === 'active' && r.state.status !== 'active' && r.state.score !== null) {
        const entry: LocalScore = {
          score: r.state.score,
          title: rankTitle(r.state.score),
          date: new Date().toISOString(),
          died: r.state.status === 'dead',
        }
        setScores((prev) => {
          const next = [...prev, entry].sort((a, b) => b.score - a.score).slice(0, 10)
          write(SCORES_KEY, next)
          return next
        })
      }
      setGame(r.state)
      return r.state
    },
    [game],
  )

  const newGame = useCallback(() => setGame(createGame(newSeed())), [])
  const quit = useCallback(() => setGame(null), [])
  const clearError = useCallback(() => setError(null), [])

  return { game, scores, error, dispatch, newGame, quit, clearError }
}

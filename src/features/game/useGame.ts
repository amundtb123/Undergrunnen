// Local-first game store. The game runs in the browser; the server only hands
// out the seed (so results can be verified) and stores verified highscores.

import { useCallback, useEffect, useState } from 'react'
import {
  applyAction, createGame, ERROR_MESSAGES, newSeed, rankTitle, type Action, type GameState,
} from '@engine/index.ts'
import { startRun, submitRun } from '@/lib/scoresApi.ts'

const SAVE_KEY = 'undergrunnen.save.v2'
const SCORES_KEY = 'undergrunnen.scores.v1'
const NAME_KEY = 'undergrunnen.name'

export interface LocalScore {
  score: number
  title: string
  date: string
  died: boolean
}

/** A game plus what the server needs to verify it. */
export interface Save {
  game: GameState
  /** Null when the game was started offline: it can't go on the highscore list. */
  runId: string | null
  /** Accepted actions, in order. Replayed server-side on submit. */
  actions: Action[]
  submitted: { rank: number; name: string } | null
}

export type SubmitState = { status: 'idle' } | { status: 'sending' } | { status: 'error'; text: string }

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
    else localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

const SUBMIT_ERRORS: Record<string, string> = {
  ALREADY_SUBMITTED: 'Denne runden er allerede på listen.',
  RUN_NOT_FOUND: 'Fant ikke runden på serveren.',
  NOT_FINISHED: 'Serveren kunne ikke bekrefte resultatet.',
  BAD_NAME: 'Ugyldig navn.',
}

export function useGame() {
  const [save, setSave] = useState<Save | null>(() => {
    const s = read<Save | null>(SAVE_KEY, null)
    return s?.game?.schema === 1 ? s : null
  })
  const [scores, setScores] = useState<LocalScore[]>(() => read(SCORES_KEY, []))
  const [error, setError] = useState<{ id: number; text: string } | null>(null)
  const [starting, setStarting] = useState(false)
  const [submit, setSubmit] = useState<SubmitState>({ status: 'idle' })
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      return localStorage.getItem(NAME_KEY) ?? ''
    } catch {
      return ''
    }
  })

  useEffect(() => write(SAVE_KEY, save), [save])

  const game = save?.game ?? null

  const dispatch = useCallback(
    (action: Action): GameState | null => {
      if (!save) return null
      const r = applyAction(save.game, action)
      if (!r.ok) {
        setError({ id: Date.now(), text: ERROR_MESSAGES[r.error] })
        return null
      }
      if (save.game.status === 'active' && r.state.status !== 'active' && r.state.score !== null) {
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
      setSave({ ...save, game: r.state, actions: [...save.actions, action] })
      return r.state
    },
    [save],
  )

  /** Ask the server for a seed; fall back to an offline game if it's unreachable. */
  const newGame = useCallback(async () => {
    setStarting(true)
    setSubmit({ status: 'idle' })
    let seed = newSeed()
    let runId: string | null = null
    try {
      const run = await startRun()
      seed = run.seed
      runId = run.runId
    } catch {
      /* offline: play anyway, just not eligible for the list */
    }
    setSave({ game: createGame(seed), runId, actions: [], submitted: null })
    setStarting(false)
  }, [])

  const submitScore = useCallback(
    async (rawName: string) => {
      if (!save?.runId || save.submitted) return
      const name = rawName.trim().slice(0, 20)
      if (!name) return
      setSubmit({ status: 'sending' })
      write(NAME_KEY, name)
      setPlayerName(name)
      try {
        const r = await submitRun(save.runId, name, save.actions)
        setSave({ ...save, submitted: { rank: r.rank, name } })
        setSubmit({ status: 'idle' })
      } catch (e) {
        const code = e instanceof Error ? e.message : ''
        setSubmit({ status: 'error', text: SUBMIT_ERRORS[code] ?? 'Fikk ikke kontakt med serveren. Prøv igjen.' })
      }
    },
    [save],
  )

  const quit = useCallback(() => setSave(null), [])
  const clearError = useCallback(() => setError(null), [])

  return { game, save, scores, error, starting, submit, playerName, dispatch, newGame, submitScore, quit, clearError }
}

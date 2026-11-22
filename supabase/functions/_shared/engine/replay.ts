// Server-side verification: rebuild a finished game from its seed and the
// player's action log. The score that counts is the replayed one, never a
// number sent by the client.

import { applyAction, createGame } from './game.ts'
import type { Action, GameState } from './types.ts'

export const MAX_ACTIONS = 5000

export type ReplayResult =
  | { ok: true; state: GameState; rejected: number }
  | { ok: false; reason: 'TOO_MANY_ACTIONS' | 'BAD_ACTION' | 'NOT_FINISHED' }

const ACTION_TYPES = new Set(['buy', 'sell', 'travel', 'borrow', 'repay', 'deposit', 'withdraw', 'resolve', 'retire'])

function isAction(a: unknown): a is Action {
  if (!a || typeof a !== 'object') return false
  const t = (a as { type?: unknown }).type
  return typeof t === 'string' && ACTION_TYPES.has(t)
}

export function replayGame(seed: number, actions: unknown): ReplayResult {
  if (!Array.isArray(actions)) return { ok: false, reason: 'BAD_ACTION' }
  if (actions.length > MAX_ACTIONS) return { ok: false, reason: 'TOO_MANY_ACTIONS' }
  let state = createGame(seed)
  let rejected = 0
  for (const a of actions) {
    if (!isAction(a)) return { ok: false, reason: 'BAD_ACTION' }
    const r = applyAction(state, a)
    // An action the engine refuses is skipped, exactly as it was in the client.
    if (r.ok) state = r.state
    else rejected++
    if (state.status !== 'active') break
  }
  if (state.status === 'active' || state.score === null) return { ok: false, reason: 'NOT_FINISHED' }
  return { ok: true, state, rejected }
}

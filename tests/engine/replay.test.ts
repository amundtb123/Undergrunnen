import { describe, expect, it } from 'vitest'
import {
  applyAction, CITIES, createGame, createRng, ITEMS, maxBuy, replayGame, type Action, type GameState,
} from '@engine/index.ts'

/** A chaotic bot that also sends invalid actions, logging everything it tries. */
function playLogged(seed: number): { state: GameState; log: Action[] } {
  const rng = createRng(seed, 'bot')
  let s = createGame(seed)
  const log: Action[] = []
  const act = (a: Action) => {
    log.push(a)
    const r = applyAction(s, a)
    if (r.ok) s = r.state
  }
  while (s.status === 'active' && log.length < 800) {
    if (s.pendingEvent) {
      act({ type: 'resolve', choiceId: rng.pick(s.pendingEvent.choices).id })
      continue
    }
    const item = rng.pick(ITEMS).id
    const roll = rng.next()
    if (roll < 0.3) act({ type: 'buy', itemId: item, qty: Math.max(1, maxBuy(s, item)) })
    else if (roll < 0.5) act({ type: 'sell', itemId: item, qty: s.inventory[item]?.qty ?? 1 })
    else if (roll < 0.55) act({ type: 'repay', amount: 1000 })
    else if (roll < 0.97) act({ type: 'travel', to: rng.pick(CITIES).id })
    else act({ type: 'retire' })
  }
  if (s.status === 'active') act({ type: 'retire' })
  return { state: s, log }
}

describe('replay', () => {
  it('reproduces the exact final state from seed + action log', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const { state, log } = playLogged(seed)
      const r = replayGame(seed, log)
      expect(r.ok).toBe(true)
      if (r.ok) expect(r.state).toEqual(state)
    }
  })

  it('a different seed does not reproduce the score', () => {
    const { state, log } = playLogged(7)
    const r = replayGame(8, log)
    expect(r.ok && r.state.score === state.score && r.state.cash === state.cash).toBe(false)
  })

  it('rejects unfinished games and junk', () => {
    expect(replayGame(1, [])).toEqual({ ok: false, reason: 'NOT_FINISHED' })
    expect(replayGame(1, [{ type: 'hack' }])).toEqual({ ok: false, reason: 'BAD_ACTION' })
    expect(replayGame(1, 'nope')).toEqual({ ok: false, reason: 'BAD_ACTION' })
    expect(replayGame(1, new Array(6000).fill({ type: 'retire' }))).toEqual({ ok: false, reason: 'TOO_MANY_ACTIONS' })
  })
})

import { describe, expect, it } from 'vitest'
import {
  applyAction, CITIES, CLASSIC_ITEMS, createGame, createRng, ITEMS, maxBuy, replayGame, type Action, type GameState,
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

describe('Classic Mode', () => {
  it('trades only Classic goods and replays in the right mode', () => {
    const s = createGame(42, 'classic')
    const classicIds = new Set(CLASSIC_ITEMS.map((i) => i.id))
    expect(s.mode).toBe('classic')
    expect(Object.keys(s.market).every((id) => classicIds.has(id))).toBe(true)
    const id = Object.keys(s.market)[0]!
    let g = applyAction(s, { type: 'buy', itemId: id, qty: 1 })
    expect(g.ok).toBe(true)
    if (!g.ok) return
    g = applyAction(g.state, { type: 'retire' })
    if (!g.ok) return
    const log: Action[] = [{ type: 'buy', itemId: id, qty: 1 }, { type: 'retire' }]
    const r = replayGame(42, log, 'classic')
    expect(r.ok && r.state.score).toBe(g.state.score)
    // Clean replay of a Classic log does not reproduce it (item not sold in Clean).
    const clean = replayGame(42, log, 'clean')
    expect(clean.ok && clean.state.cash).not.toBe(g.state.cash)
  })
})

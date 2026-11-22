// Balance simulation: a simple greedy bot plays many full games.
// Run with `npm run sim` and read the printed distribution.

import { expect, it } from 'vitest'
import {
  applyAction, CITIES, HOME_CITY, createGame, getItem, maxBuy, route, type Action, type GameState,
} from '@engine/index.ts'

function step(s: GameState, a: Action): GameState {
  const r = applyAction(s, a)
  return r.ok ? r.state : s
}

function playBot(seed: number): GameState {
  let s = createGame(seed)
  let guard = 0
  while (s.status === 'active' && guard++ < 500) {
    if (s.pendingEvent) {
      const prefs = ['kjop', 'betal', 'bestikk', 'samarbeid', 'nei']
      const c = prefs.find((id) => s.pendingEvent!.choices.some((x) => x.id === id && !x.disabled))!
      s = step(s, { type: 'resolve', choiceId: c })
      continue
    }
    const lastStop = CITIES.every((c) => c.id === s.cityId || s.day + route(s.cityId, c.id).days > s.maxDays)

    // Sell anything at a decent profit, or everything on the last stop.
    for (const [id, h] of Object.entries(s.inventory)) {
      const p = s.market[id]
      if (p && (lastStop || p > h.avgCost * 1.3)) s = step(s, { type: 'sell', itemId: id, qty: h.qty })
    }
    if (s.cityId === HOME_CITY.id && s.debt > 0 && s.cash > s.debt + 5000) s = step(s, { type: 'repay', amount: s.debt })
    if (lastStop) return step(s, { type: 'retire' })

    // Buy the item that is cheapest relative to its base price.
    const deals = Object.entries(s.market)
      .map(([id, p]) => [id, p / getItem(id)!.basePrice] as const)
      .filter(([, ratio]) => ratio < 0.8)
      .sort((a, b) => a[1] - b[1])
    for (const [id] of deals) {
      const keep = 1500
      const n = Math.min(maxBuy(s, id), Math.floor(Math.max(0, s.cash - keep) / s.market[id]!))
      if (n > 0) s = step(s, { type: 'buy', itemId: id, qty: n })
    }

    // Travel somewhere reachable (prefer the home city every ~7 days to pay debt).
    const options = CITIES.filter((c) => c.id !== s.cityId && s.day + route(s.cityId, c.id).days <= s.maxDays
      && route(s.cityId, c.id).cost <= s.cash)
    if (options.length === 0) return step(s, { type: 'retire' })
    const wantOslo = s.debt > 0 && s.cash > s.debt && options.some((c) => c.id === HOME_CITY.id)
    const pick = wantOslo ? HOME_CITY.id : options[(seed + s.day * 7) % options.length]!.id
    s = step(s, { type: 'travel', to: pick })
  }
  return s
}

it('simulated games stay sane and print a balance report', () => {
  const N = 2000
  const scores: number[] = []
  let dead = 0
  for (let seed = 1; seed <= N; seed++) {
    const s = playBot(seed)
    expect(s.status).not.toBe('active')
    expect(Number.isFinite(s.score)).toBe(true)
    expect(s.cash).toBeGreaterThanOrEqual(0)
    if (s.status === 'dead') dead++
    scores.push(s.score!)
  }
  scores.sort((a, b) => a - b)
  const pct = (p: number) => scores[Math.floor((scores.length - 1) * p)]!.toLocaleString('nb-NO')
  const negative = scores.filter((x) => x < 0).length
  console.log(
    `\nBalance report (${N} bot games)\n` +
      `  p10 ${pct(0.1)} · p50 ${pct(0.5)} · p90 ${pct(0.9)} · max ${pct(1)}\n` +
      `  negative score: ${((negative / N) * 100).toFixed(1)}% · died: ${((dead / N) * 100).toFixed(1)}%\n`,
  )
})

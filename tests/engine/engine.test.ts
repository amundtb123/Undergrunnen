import { describe, expect, it } from 'vitest'
import {
  applyAction, createGame, generateMarket, inventoryUsed, maxBuy, route, RULES, type GameState,
} from '@engine/index.ts'

const ok = (s: GameState, a: Parameters<typeof applyAction>[1]) => {
  const r = applyAction(s, a)
  if (!r.ok) throw new Error(r.error)
  return r.state
}

function cheapestItem(s: GameState): string {
  return Object.entries(s.market).sort((a, b) => a[1] - b[1])[0]![0]
}

describe('market', () => {
  it('is deterministic per seed/day/city', () => {
    expect(generateMarket(42, 3, 'bergen')).toEqual(generateMarket(42, 3, 'bergen'))
    expect(generateMarket(42, 3, 'bergen')).not.toEqual(generateMarket(43, 3, 'bergen'))
  })
  it('always produces positive integer prices', () => {
    for (let seed = 0; seed < 200; seed++) {
      for (const p of Object.values(generateMarket(seed, 1 + (seed % 30), 'oslo').prices)) {
        expect(Number.isInteger(p) && p > 0).toBe(true)
      }
    }
  })
})

describe('trading', () => {
  it('buys and sells, tracking avg cost and cash', () => {
    let s = createGame(1)
    const id = cheapestItem(s)
    const price = s.market[id]!
    s = ok(s, { type: 'buy', itemId: id, qty: 2 })
    expect(s.cash).toBe(RULES.startCash - 2 * price)
    expect(s.inventory[id]).toEqual({ qty: 2, avgCost: price })
    s = ok(s, { type: 'sell', itemId: id, qty: 2 })
    expect(s.cash).toBe(RULES.startCash)
    expect(s.inventory[id]).toBeUndefined()
  })

  it('does not mutate the input state', () => {
    const s = createGame(1)
    const before = structuredClone(s)
    ok(s, { type: 'buy', itemId: cheapestItem(s), qty: 1 })
    expect(s).toEqual(before)
  })

  it('rejects overspending, overfilling and bad quantities', () => {
    const s = createGame(1)
    const id = cheapestItem(s)
    expect(applyAction(s, { type: 'buy', itemId: id, qty: 0 })).toEqual({ ok: false, error: 'INVALID_QUANTITY' })
    expect(applyAction(s, { type: 'buy', itemId: id, qty: 1.5 })).toEqual({ ok: false, error: 'INVALID_QUANTITY' })
    expect(applyAction(s, { type: 'sell', itemId: id, qty: 1 })).toEqual({ ok: false, error: 'INSUFFICIENT_INVENTORY' })
    const max = maxBuy(s, id)
    const over = applyAction(s, { type: 'buy', itemId: id, qty: max + 1 })
    expect(over.ok).toBe(false)
    const filled = ok(s, { type: 'buy', itemId: id, qty: max })
    expect(inventoryUsed(filled)).toBeLessThanOrEqual(filled.capacity)
    expect(filled.cash).toBeGreaterThanOrEqual(0)
  })
})

describe('travel and economy', () => {
  it('advances days, charges fare and accrues interest', () => {
    const s = createGame(7)
    const r = route(RULES.startCityId, 'bergen')
    const t = ok(s, { type: 'travel', to: 'bergen' })
    expect(t.day).toBe(1 + r.days)
    expect(t.cityId).toBe('bergen')
    expect(t.debt).toBe(Math.round(RULES.startDebt * (1 + RULES.debtRate)))
  })

  it('long trips take two days', () => {
    expect(route('oslo', 'tromso').days).toBe(2)
    expect(route('oslo', 'bergen').days).toBe(1)
  })

  it('bank and loan shark only work in the home city (Hamar)', () => {
    let s = createGame(3)
    s = ok(s, { type: 'repay', amount: 1000 })
    expect(s.debt).toBe(RULES.startDebt - 1000)
    s = ok(s, { type: 'deposit', amount: 1000 })
    expect(s.bank).toBe(1000)
    expect(applyAction(s, { type: 'borrow', amount: RULES.creditLimit }).ok).toBe(false)
    const away = { ...s, cityId: 'bergen' }
    expect(applyAction(away, { type: 'deposit', amount: 1 })).toEqual({ ok: false, error: 'NO_BANK_HERE' })
  })

  it('hitchhikes for free (+1 day) when broke, so the game never soft-locks', () => {
    const broke = { ...createGame(11), cash: 0 }
    const t = ok(broke, { type: 'travel', to: 'bergen' })
    expect(t.day).toBe(1 + route(RULES.startCityId, 'bergen').days + 1)
    expect(t.cash).toBe(0)
  })

  it('blocks trips that end after the last day', () => {
    const s = { ...createGame(3), day: RULES.maxDays }
    expect(applyAction(s, { type: 'travel', to: 'bergen' })).toEqual({ ok: false, error: 'NOT_ENOUGH_DAYS' })
  })
})

describe('events', () => {
  it('a pending event blocks everything except resolve', () => {
    let s = createGame(5)
    s = { ...s, pendingEvent: { kind: 'lege', title: '', text: '', choices: [{ id: 'nei', label: 'Nei' }], data: { price: 1500 } } }
    expect(applyAction(s, { type: 'travel', to: 'bergen' })).toEqual({ ok: false, error: 'EVENT_PENDING' })
    s = ok(s, { type: 'resolve', choiceId: 'nei' })
    expect(s.pendingEvent).toBeNull()
  })
})

describe('end of game', () => {
  it('retire computes score = cash + bank − debt', () => {
    const s = ok(createGame(9), { type: 'retire' })
    expect(s.status).toBe('finished')
    expect(s.score).toBe(RULES.startCash - RULES.startDebt)
    expect(applyAction(s, { type: 'retire' })).toEqual({ ok: false, error: 'GAME_NOT_ACTIVE' })
  })
})

describe('Hamar', () => {
  it('is the start city and home of the bank', () => {
    const s = createGame(1)
    expect(s.cityId).toBe('hamar')
    expect(applyAction(s, { type: 'deposit', amount: 100 }).ok).toBe(true)
  })
  it('is a short train ride from Oslo', () => {
    const r = route('hamar', 'oslo')
    expect(r.days).toBe(1)
    expect(r.mode).toBe('Tog')
  })
  it('small markets (Hamar) run out of goods more often than Oslo', () => {
    let hamar = 0
    let oslo = 0
    for (let seed = 0; seed < 400; seed++) {
      hamar += Object.keys(generateMarket(seed, 5, 'hamar').prices).length
      oslo += Object.keys(generateMarket(seed, 5, 'oslo').prices).length
    }
    expect(hamar).toBeLessThan(oslo)
  })
})

// Game Engine: creates games and applies player intents. Pure: (state, action)
// → new state or error. The input state is never mutated.

import { getCity, getItem } from './content.ts'
import { accrueInterest, availableCredit, inventoryFree } from './economy.ts'
import { resolveEvent, rollArrivalEvent } from './events.ts'
import { generateMarket } from './market.ts'
import { RULES } from './rules.ts'
import { finalScore } from './scoring.ts'
import { route, type Route } from './travel.ts'
import type { Action, ActionResult, GameErrorCode, GameState } from './types.ts'

const NEWS_LIMIT = 60

export function createGame(seed: number): GameState {
  const market = generateMarket(seed, 1, RULES.startCityId)
  return {
    schema: 1,
    rev: 0,
    seed,
    status: 'active',
    day: 1,
    maxDays: RULES.maxDays,
    cityId: RULES.startCityId,
    cash: RULES.startCash,
    bank: 0,
    debt: RULES.startDebt,
    health: 100,
    capacity: RULES.startCapacity,
    inventory: {},
    market: market.prices,
    pendingEvent: null,
    news: [
      ...market.news,
      {
        day: 1,
        tone: 'neutral',
        text: `Du har ${RULES.maxDays} dager. Kjell vil ha igjen pengene sine, med renter.`,
      },
    ],
    stats: { trades: 0, realizedProfit: 0, bestTrade: 0, visited: [RULES.startCityId] },
    score: null,
  }
}

const isPositiveInt = (n: number) => Number.isInteger(n) && n > 0 && n <= 1_000_000_000

export function applyAction(state: GameState, action: Action): ActionResult {
  const s: GameState = structuredClone(state)
  const error = apply(s, action)
  if (error) return { ok: false, error }
  s.rev += 1
  if (s.news.length > NEWS_LIMIT) s.news.length = NEWS_LIMIT
  return { ok: true, state: s }
}

function apply(s: GameState, a: Action): GameErrorCode | null {
  if (s.status !== 'active') return 'GAME_NOT_ACTIVE'
  if (s.pendingEvent && a.type !== 'resolve') return 'EVENT_PENDING'

  switch (a.type) {
    case 'buy': {
      if (!isPositiveInt(a.qty)) return 'INVALID_QUANTITY'
      const item = getItem(a.itemId)
      const price = s.market[a.itemId]
      if (!item || !price) return 'ITEM_NOT_AVAILABLE'
      const total = price * a.qty
      if (total > s.cash) return 'INSUFFICIENT_FUNDS'
      if (a.qty * item.size > inventoryFree(s)) return 'INSUFFICIENT_CAPACITY'
      const h = s.inventory[a.itemId] ?? { qty: 0, avgCost: 0 }
      h.avgCost = Math.round((h.qty * h.avgCost + total) / (h.qty + a.qty))
      h.qty += a.qty
      s.inventory[a.itemId] = h
      s.cash -= total
      s.stats.trades += 1
      return null
    }

    case 'sell': {
      if (!isPositiveInt(a.qty)) return 'INVALID_QUANTITY'
      const price = s.market[a.itemId]
      if (!price) return 'ITEM_NOT_AVAILABLE'
      const h = s.inventory[a.itemId]
      if (!h || h.qty < a.qty) return 'INSUFFICIENT_INVENTORY'
      const profit = (price - h.avgCost) * a.qty
      h.qty -= a.qty
      if (h.qty === 0) delete s.inventory[a.itemId]
      s.cash += price * a.qty
      s.stats.trades += 1
      s.stats.realizedProfit += profit
      s.stats.bestTrade = Math.max(s.stats.bestTrade, profit)
      return null
    }

    case 'travel': {
      const to = getCity(a.to)
      if (!to) return 'UNKNOWN_CITY'
      if (a.to === s.cityId) return 'ALREADY_THERE'
      // Can't afford the ticket? You hitchhike: free, but one day slower.
      const r = tripFor(s, a.to)
      if (s.day + r.days > s.maxDays) return 'NOT_ENOUGH_DAYS'
      s.cash -= r.cost
      for (let i = 0; i < r.days; i++) accrueInterest(s)
      s.day += r.days
      s.cityId = a.to
      if (!s.stats.visited.includes(a.to)) s.stats.visited.push(a.to)
      const m = generateMarket(s.seed, s.day, a.to)
      s.market = m.prices
      s.news.unshift(
        ...m.news,
        {
          day: s.day,
          tone: 'neutral',
          text: r.mode === 'Haik'
            ? `Blakk. Du haiket til ${to.name} og brukte ${r.days} dager.`
            : `Ankom ${to.name} med ${r.mode.toLowerCase()} etter ${r.days} dag${r.days > 1 ? 'er' : ''}.`,
        },
      )
      rollArrivalEvent(s, m.happening?.riskBonus ?? 0)
      checkHealth(s)
      return null
    }

    case 'borrow': {
      if (!getCity(s.cityId)?.hasBank) return 'NO_BANK_HERE'
      if (!isPositiveInt(a.amount)) return 'INVALID_AMOUNT'
      if (a.amount > availableCredit(s)) return 'CREDIT_LIMIT'
      s.debt += a.amount
      s.cash += a.amount
      return null
    }
    case 'repay': {
      if (!getCity(s.cityId)?.hasBank) return 'NO_BANK_HERE'
      if (!isPositiveInt(a.amount) || a.amount > s.debt) return 'INVALID_AMOUNT'
      if (a.amount > s.cash) return 'INSUFFICIENT_FUNDS'
      s.debt -= a.amount
      s.cash -= a.amount
      return null
    }
    case 'deposit': {
      if (!getCity(s.cityId)?.hasBank) return 'NO_BANK_HERE'
      if (!isPositiveInt(a.amount)) return 'INVALID_AMOUNT'
      if (a.amount > s.cash) return 'INSUFFICIENT_FUNDS'
      s.cash -= a.amount
      s.bank += a.amount
      return null
    }
    case 'withdraw': {
      if (!getCity(s.cityId)?.hasBank) return 'NO_BANK_HERE'
      if (!isPositiveInt(a.amount) || a.amount > s.bank) return 'INVALID_AMOUNT'
      s.bank -= a.amount
      s.cash += a.amount
      return null
    }

    case 'resolve': {
      const err = resolveEvent(s, a.choiceId)
      if (err) return err
      checkHealth(s)
      return null
    }

    case 'retire': {
      s.status = 'finished'
      s.score = finalScore(s)
      s.news.unshift({ day: s.day, tone: 'neutral', text: 'Du trakk deg tilbake. Regnskapet er gjort opp.' })
      return null
    }
  }
}

/** The trip the player will actually take from here, given their cash. */
export function tripFor(s: GameState, to: string): Route {
  const r = route(s.cityId, to)
  return s.cash >= r.cost ? r : { ...r, cost: 0, days: r.days + 1, mode: 'Haik' }
}

function checkHealth(s: GameState): void {
  if (s.health > 0) return
  s.status = 'dead'
  s.pendingEvent = null
  s.inventory = {}
  s.cash = 0
  s.score = finalScore(s)
  s.news.unshift({
    day: s.day,
    tone: 'bad',
    text: 'Du våknet på Ullevål. Lommene var tomme og lasten borte. Spillet er over.',
  })
}

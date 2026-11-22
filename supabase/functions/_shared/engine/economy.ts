// Economy Engine + Inventory System helpers. Pure reads over GameState.

import { getItem } from './content.ts'
import { RULES } from './rules.ts'
import type { GameState, ItemId } from './types.ts'

export function inventoryUsed(s: GameState): number {
  let used = 0
  for (const [id, h] of Object.entries(s.inventory)) used += h.qty * (getItem(id)?.size ?? 1)
  return used
}

export function inventoryFree(s: GameState): number {
  return s.capacity - inventoryUsed(s)
}

/** Most units of an item the player can buy right now (cash and space). */
export function maxBuy(s: GameState, itemId: ItemId): number {
  const price = s.market[itemId]
  const item = getItem(itemId)
  if (!price || !item) return 0
  return Math.max(0, Math.min(Math.floor(s.cash / price), Math.floor(inventoryFree(s) / item.size)))
}

/** Value of goods at today's local prices (unsellable items count at cost). */
export function inventoryValue(s: GameState): number {
  let v = 0
  for (const [id, h] of Object.entries(s.inventory)) v += h.qty * (s.market[id] ?? h.avgCost)
  return v
}

export function netWorth(s: GameState): number {
  return s.cash + s.bank - s.debt + inventoryValue(s)
}

export function availableCredit(s: GameState): number {
  return Math.max(0, RULES.creditLimit - s.debt)
}

/** One day of interest. Mutates the draft. */
export function accrueInterest(s: GameState): void {
  s.debt = Math.round(s.debt * (1 + RULES.debtRate))
  s.bank = Math.round(s.bank * (1 + RULES.bankRate))
}


// Scoring System. Goods do not count: sell before the deadline.

import type { GameState } from './types.ts'

export function finalScore(s: GameState): number {
  return s.cash + s.bank - s.debt
}

const RANKS: readonly [number, string][] = [
  [0, 'Konkursbo'],
  [10_000, 'Smågutt'],
  [50_000, 'Gateselger'],
  [250_000, 'Mellommann'],
  [1_000_000, 'Grossist'],
  [5_000_000, 'Bakmann'],
]

export function rankTitle(score: number): string {
  let title = 'Konkursbo'
  for (const [min, name] of RANKS) if (score >= min) title = name
  if (score >= 20_000_000) title = 'Undergrunnens konge'
  return title
}

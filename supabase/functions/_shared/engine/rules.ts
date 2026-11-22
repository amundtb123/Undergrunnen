// Tunable game constants. Balance here, not in the logic.

export const RULES = {
  startCityId: 'hamar',
  startCash: 5_000,
  startDebt: 12_000,
  startCapacity: 100,
  maxDays: 30,

  /** Daily compounding on the loan shark's debt. */
  debtRate: 0.06,
  /** Daily interest on bank deposits. */
  bankRate: 0.01,
  /** Total debt you can owe Kjell. */
  creditLimit: 50_000,

  /** Chance a given item is missing from a market on a given day. */
  outOfStockChance: 0.12,
  /** Chance per item per city per day of a price shock. */
  shockChance: 0.07,

  /** Base chance of an arrival event, plus per point of city risk. */
  eventBaseChance: 0.28,
  eventRiskChance: 0.05,

  /** Trips longer than this take two days. */
  longTripKm: 700,
  travelBaseCost: 200,
  travelCostPerKm: 0.9,
} as const

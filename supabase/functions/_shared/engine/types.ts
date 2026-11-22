// Pure data types shared by the engine, the Edge Functions and the UI.
// No runtime imports: this file must work in Deno, Node and the browser.

export type CityId = string
export type ItemId = string

export type ItemCategory = 'mat' | 'nytelse' | 'mote' | 'elektronikk' | 'samleobjekt' | 'luksus'

/** Fictional local happening (city pack «fictional_events»). Game fiction, not fact. */
export interface CityHappening {
  text: string
  /** Price multiplier for these categories ('all' = every item) on that day. */
  categories?: ItemCategory[] | 'all'
  mult?: number
  /** Extra chance of an arrival event, police weighted up. */
  riskBonus?: number
}

export interface City {
  id: CityId
  name: string
  /** Fylke. */
  county: string
  region: string
  /** Landmarks from the city pack, shown as chips. */
  knownFor: string[]
  /** One factual orientation line. */
  geography: string
  happenings: CityHappening[]
  lat: number
  lng: number
  /** Short identity line, e.g. «Mjøsas knutepunkt». */
  subtitle: string
  tagline: string
  /** Polititrykk, 1 (calm) – 5 (hot). Raises event and police odds. */
  risk: number
  /** Markedsstørrelse 1–3. Small markets run out of goods more often. */
  marketSize: number
  /** Konkurranse 1–3. Low competition = wilder price swings. */
  competition: number
  /** Etterspørsel 1–3. Shifts the overall price level a few percent. */
  demand: number
  /** Bank and loan shark are only available here. */
  hasBank: boolean
  /** Multipliers on an item's base price in this city. */
  priceMods: Partial<Record<ItemId, number>>
  /** Placeholder art: hue for the hero gradient. */
  hue: number
}

export interface Item {
  id: ItemId
  name: string
  category: ItemCategory
  description: string
  basePrice: number
  minPrice: number
  maxPrice: number
  /** Log-normal spread of daily prices (0–1). */
  volatility: number
  /** Inventory slots per unit. */
  size: number
  spikeText: string
  crashText: string
}

export interface Holding {
  qty: number
  avgCost: number
}

export type GameStatus = 'active' | 'finished' | 'dead'
export type Tone = 'neutral' | 'good' | 'bad'

export interface NewsItem {
  day: number
  text: string
  tone: Tone
}

export interface EventChoice {
  id: string
  label: string
  hint?: string
  disabled?: boolean
}

export interface PendingEvent {
  kind: string
  title: string
  text: string
  choices: EventChoice[]
  data: Record<string, number | string>
}

export interface GameStats {
  trades: number
  realizedProfit: number
  bestTrade: number
  visited: CityId[]
}

export interface GameState {
  schema: 1
  /** Incremented on every accepted action (optimistic concurrency later). */
  rev: number
  seed: number
  status: GameStatus
  day: number
  maxDays: number
  cityId: CityId
  cash: number
  bank: number
  debt: number
  health: number
  capacity: number
  inventory: Record<ItemId, Holding>
  /** Today's prices in the current city. Missing item = not for sale today. */
  market: Record<ItemId, number>
  pendingEvent: PendingEvent | null
  /** Newest first. */
  news: NewsItem[]
  stats: GameStats
  score: number | null
}

export type Action =
  | { type: 'buy'; itemId: ItemId; qty: number }
  | { type: 'sell'; itemId: ItemId; qty: number }
  | { type: 'travel'; to: CityId }
  | { type: 'borrow'; amount: number }
  | { type: 'repay'; amount: number }
  | { type: 'deposit'; amount: number }
  | { type: 'withdraw'; amount: number }
  | { type: 'resolve'; choiceId: string }
  | { type: 'retire' }

export type GameErrorCode =
  | 'GAME_NOT_ACTIVE'
  | 'EVENT_PENDING'
  | 'NO_EVENT'
  | 'INVALID_CHOICE'
  | 'INVALID_QUANTITY'
  | 'INVALID_AMOUNT'
  | 'ITEM_NOT_AVAILABLE'
  | 'INSUFFICIENT_FUNDS'
  | 'INSUFFICIENT_CAPACITY'
  | 'INSUFFICIENT_INVENTORY'
  | 'UNKNOWN_CITY'
  | 'ALREADY_THERE'
  | 'NOT_ENOUGH_DAYS'
  | 'NO_BANK_HERE'
  | 'CREDIT_LIMIT'

export type ActionResult =
  | { ok: true; state: GameState }
  | { ok: false; error: GameErrorCode }

// Market Generator: prices per (game seed, day, city). Prices are drawn
// independently each day (Dope Wars style) around a city-adjusted base, with
// occasional shocks that break the normal band.

import { getCity, itemsFor, priceMod } from './content.ts'
import { createRng } from './rng.ts'
import { RULES } from './rules.ts'
import type { CityHappening, CityId, GameMode, ItemId, NewsItem } from './types.ts'

export interface Market {
  prices: Record<ItemId, number>
  news: NewsItem[]
  /** Today's local happening, if any (from the city pack). */
  happening: CityHappening | null
}

/** Separate stream so happenings never disturb the item price draws. */
export function todaysHappening(seed: number, day: number, cityId: CityId): CityHappening | null {
  const city = getCity(cityId)
  if (!city || city.happenings.length === 0) return null
  const rng = createRng(seed, 'happening', day, cityId)
  if (!rng.chance(RULES.happeningChance)) return null
  return rng.pick(city.happenings)
}

export function roundPrice(p: number): number {
  if (p < 100) return Math.max(1, Math.round(p))
  if (p < 1000) return Math.round(p / 5) * 5
  return Math.round(p / 10) * 10
}

export function generateMarket(seed: number, day: number, cityId: CityId, mode: GameMode = 'clean'): Market {
  const city = getCity(cityId)
  if (!city) throw new Error(`Unknown city ${cityId}`)
  const rng = createRng(seed, 'market', day, cityId)
  const prices: Record<ItemId, number> = {}
  const news: NewsItem[] = []

  // City profile: small markets run dry more often, low competition swings
  // harder, demand nudges the general price level.
  const outOfStock = RULES.outOfStockChance * ((4 - city.marketSize) / 2)
  const swing = 1.3 - 0.15 * city.competition
  const level = 0.94 + 0.03 * city.demand
  const happening = todaysHappening(seed, day, cityId)
  if (happening) news.push({ day, tone: 'neutral', text: happening.text })
  const happeningMult = (category: string) =>
    happening?.mult && (happening.categories === 'all' || happening.categories?.includes(category as never))
      ? happening.mult
      : 1

  for (const item of itemsFor(mode)) {
    // Draw everything unconditionally so the stream stays stable if the rules change.
    const missing = rng.chance(outOfStock)
    const noise = rng.normal()
    const shockRoll = rng.next()
    const shockSize = rng.next()

    const mod = priceMod(city, item.id)
    let price = item.basePrice * mod * level * Math.exp(item.volatility * swing * noise)
    price = Math.min(item.maxPrice, Math.max(item.minPrice, price)) * happeningMult(item.category)

    if (shockRoll < RULES.shockChance) {
      const spike = shockRoll < RULES.shockChance / 2
      if (spike) {
        price = Math.max(price, item.basePrice) * (2.2 + shockSize * 1.8)
        news.push({ day, tone: 'neutral', text: item.spikeText.replace('{city}', city.name) })
      } else {
        price = Math.min(price, item.basePrice) * (0.2 + shockSize * 0.2)
        news.push({ day, tone: 'neutral', text: item.crashText.replace('{city}', city.name) })
      }
    } else if (missing) {
      continue
    }
    prices[item.id] = roundPrice(price)
  }
  return { prices, news, happening }
}

/** % change vs yesterday's market in the same city (null = no comparison). */
export function marketTrend(
  seed: number,
  day: number,
  cityId: CityId,
  today: Record<ItemId, number>,
  mode: GameMode = 'clean',
) {
  const trend: Record<ItemId, number | null> = {}
  const prev = day > 1 ? generateMarket(seed, day - 1, cityId, mode).prices : {}
  for (const [id, price] of Object.entries(today)) {
    const p = prev[id]
    trend[id] = p ? Math.round(((price - p) / p) * 100) : null
  }
  return trend
}

// Deterministic, seedable randomness. The same (seed, keys) always gives the
// same stream, so a game's market and events are reproducible and cannot be
// rerolled by reloading. On the server the seed is secret.

export interface Rng {
  /** Uniform in [0, 1). */
  next(): number
  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number
  range(min: number, max: number): number
  chance(p: number): boolean
  pick<T>(items: readonly T[]): T
  weighted<T>(entries: readonly (readonly [T, number])[]): T | undefined
  /** Standard normal (Box–Muller). */
  normal(): number
}

function hash(text: string): number {
  // FNV-1a 32-bit
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

export function createRng(seed: number, ...keys: (string | number)[]): Rng {
  let a = hash(`${seed}|${keys.join('|')}`)
  const next = () => {
    // mulberry32
    a = (a + 0x6d2b79f5) | 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const rng: Rng = {
    next,
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    range: (min, max) => min + next() * (max - min),
    chance: (p) => next() < p,
    pick: (items) => items[Math.floor(next() * items.length)] as (typeof items)[number],
    weighted: (entries) => {
      const total = entries.reduce((sum, [, w]) => sum + Math.max(0, w), 0)
      if (total <= 0) return undefined
      let roll = next() * total
      for (const [value, w] of entries) {
        roll -= Math.max(0, w)
        if (roll < 0) return value
      }
      return entries[entries.length - 1]?.[0]
    },
    normal: () => {
      const u = 1 - next()
      const v = next()
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
    },
  }
  return rng
}

/** Fresh random seed. Server-side this would come from crypto. */
export function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 32) >>> 0
}

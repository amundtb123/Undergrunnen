// Event Engine. One event at most per arrival. Auto events apply at once;
// choice events set `pendingEvent` and block other actions until resolved.
// All functions mutate a draft state that the caller has already cloned.

import { CITIES, CONTACTS, ITEMS, getCity, getItem } from './content.ts'
import { inventoryFree, inventoryUsed } from './economy.ts'
import { generateMarket } from './market.ts'
import { createRng, type Rng } from './rng.ts'
import { RULES } from './rules.ts'
import { route } from './travel.ts'
import type { City, GameErrorCode, GameState, NewsItem } from './types.ts'

const kr = (n: number) => `${n.toLocaleString('nb-NO')} kr`

function say(s: GameState, text: string, tone: NewsItem['tone']): void {
  s.news.unshift({ day: s.day, text, tone })
}

interface EventDef {
  kind: string
  weight(s: GameState, city: City): number
  run(s: GameState, rng: Rng, city: City): void
}

/** Remove `share` (0–1) of every holding. */
function confiscateShare(s: GameState, share: number): void {
  for (const [id, h] of Object.entries(s.inventory)) {
    h.qty -= Math.ceil(h.qty * share)
    if (h.qty <= 0) delete s.inventory[id]
  }
}

/** Remove the most valuable stack (by cost), or `share` of it. */
function confiscateBiggest(s: GameState, share: number): string | null {
  let best: string | null = null
  let bestValue = -1
  for (const [id, h] of Object.entries(s.inventory)) {
    const value = h.qty * Math.max(1, h.avgCost || getItem(id)?.basePrice || 1)
    if (value > bestValue) [best, bestValue] = [id, value]
  }
  if (!best) return null
  const h = s.inventory[best]!
  h.qty -= Math.ceil(h.qty * share)
  if (h.qty <= 0) delete s.inventory[best]
  return getItem(best)?.name ?? best
}

const EVENTS: readonly EventDef[] = [
  {
    kind: 'politi',
    weight: (s, c) => (inventoryUsed(s) > 0 ? 2 + c.risk : 0),
    run: (s, _rng, c) => {
      const bribe = Math.max(500, Math.round(s.cash * 0.2 / 50) * 50)
      s.pendingEvent = {
        kind: 'politi',
        title: 'Politikontroll',
        text: `To betjenter stopper deg på stasjonen i ${c.name}. «Kan vi ta en titt i bagen?»`,
        choices: [
          { id: 'lop', label: 'Løp', hint: 'Kan gå bra. Kan gå veldig dårlig.' },
          { id: 'bestikk', label: `Bestikk (${kr(bribe)})`, hint: 'De fleste tar imot.', disabled: s.cash < bribe },
          { id: 'samarbeid', label: 'Samarbeid', hint: 'Du mister en del av den dyreste lasten.' },
        ],
        data: { bribe, risk: c.risk },
      }
    },
  },
  {
    kind: 'ran',
    weight: (s, c) => (s.cash > 1000 ? 1 + c.risk * 0.5 : 0),
    run: (s, rng, c) => {
      const lost = Math.round((s.cash * rng.range(0.1, 0.3)) / 10) * 10
      s.cash -= lost
      say(s, `Du ble ranet i en bakgård i ${c.name}. −${kr(lost)}.`, 'bad')
    },
  },
  {
    kind: 'funn',
    weight: (s) => (inventoryFree(s) >= 4 ? 1.2 : 0),
    run: (s, rng, c) => {
      const fits = ITEMS.filter((i) => i.size <= inventoryFree(s) && i.basePrice < 5000)
      if (fits.length === 0) return
      const item = rng.pick(fits)
      const qty = Math.min(rng.int(2, 8), Math.floor(inventoryFree(s) / item.size))
      const h = s.inventory[item.id] ?? { qty: 0, avgCost: 0 }
      h.avgCost = Math.round((h.qty * h.avgCost) / (h.qty + qty))
      h.qty += qty
      s.inventory[item.id] = h
      say(s, `Noen glemte en bag på Narvesen i ${c.name}. +${qty} ${item.name}.`, 'good')
    },
  },
  {
    kind: 'hiace',
    weight: (s) => (s.capacity < 250 ? 1 : 0),
    run: (s, rng) => {
      const small = s.capacity < 150
      const price = small ? rng.int(3, 6) * 1000 : rng.int(9, 15) * 1000
      const extra = small ? 50 : 75
      s.pendingEvent = {
        kind: 'hiace',
        title: small ? 'Brukt Hiace til salgs' : 'Lagerlokale ledig',
        text: small
          ? `En kar på bensinstasjonen selger en rusten Toyota Hiace. +${extra} plass for ${kr(price)}.`
          : `Et kjellerlokale står ledig. +${extra} plass for ${kr(price)}. Ingen kontrakt.`,
        choices: [
          { id: 'kjop', label: `Kjøp (${kr(price)})`, disabled: s.cash < price },
          { id: 'nei', label: 'Nei takk' },
        ],
        data: { price, extra },
      }
    },
  },
  {
    kind: 'lege',
    weight: (s) => (s.health < 75 ? 2 : 0),
    run: (s) => {
      const price = 1500
      s.pendingEvent = {
        kind: 'lege',
        title: 'Svart legevakt',
        text: `En pensjonert kirurg tilbyr å lappe deg sammen. +40 helse for ${kr(price)}.`,
        choices: [
          { id: 'betal', label: `Betal (${kr(price)})`, disabled: s.cash < price },
          { id: 'nei', label: 'Klarer meg' },
        ],
        data: { price },
      }
    },
  },
  {
    kind: 'kjell',
    weight: (s) => (s.debt > 20_000 && s.day >= 6 ? (s.debt > 50_000 ? 3 : 1.5) : 0),
    run: (s, rng, c) => {
      const dmg = rng.int(10, 25)
      s.health = Math.max(0, s.health - dmg)
      say(s, `${CONTACTS.lender.short}s gutter fant deg i ${c.name}. «Renta løper, kompis.» −${dmg} helse.`, 'bad')
    },
  },
  {
    kind: 'tips',
    weight: () => 1,
    run: (s, rng, c) => {
      const target = rng.pick(CITIES.filter((x) => x.id !== c.id))
      const r = route(c.id, target.id)
      const day = s.day + r.days
      if (day > s.maxDays) return
      const m = generateMarket(s.seed, day, target.id)
      let bestId: string | null = null
      let bestLog = 0
      for (const [id, price] of Object.entries(m.prices)) {
        const base = getItem(id)!.basePrice
        const lr = Math.log(price / base)
        if (Math.abs(lr) > Math.abs(bestLog)) [bestId, bestLog] = [id, lr]
      }
      if (!bestId || Math.abs(bestLog) < 0.35) {
        say(s, `En kilde i ${c.name} hvisker om ${target.name}, men du skjønner ingenting.`, 'neutral')
        return
      }
      const name = getItem(bestId)!.name
      const when = r.days === 1 ? 'i morgen' : `om ${r.days} dager`
      say(s, `Tips: ${name} blir ${bestLog > 0 ? 'svært dyrt' : 'spottbillig'} i ${target.name} ${when}.`, 'good')
    },
  },
]

export function rollArrivalEvent(s: GameState): void {
  const city = getCity(s.cityId)!
  const rng = createRng(s.seed, 'event', s.day, s.cityId)
  if (!rng.chance(RULES.eventBaseChance + city.risk * RULES.eventRiskChance)) return
  const def = rng.weighted(EVENTS.map((e) => [e, e.weight(s, city)] as const))
  def?.run(s, rng, city)
}

export function resolveEvent(s: GameState, choiceId: string): GameErrorCode | null {
  const ev = s.pendingEvent
  if (!ev) return 'NO_EVENT'
  const choice = ev.choices.find((c) => c.id === choiceId)
  if (!choice) return 'INVALID_CHOICE'
  if (choice.disabled) return 'INSUFFICIENT_FUNDS'
  const rng = createRng(s.seed, 'resolve', s.day, ev.kind, choiceId)
  const num = (k: string) => Number(ev.data[k] ?? 0)

  switch (ev.kind) {
    case 'politi': {
      if (choiceId === 'lop') {
        if (rng.chance(0.6 - num('risk') * 0.05)) {
          say(s, 'Du løp gjennom folkemengden og forsvant. Puh.', 'good')
        } else {
          const dmg = rng.int(15, 35)
          s.health = Math.max(0, s.health - dmg)
          confiscateShare(s, 0.5)
          say(s, `De tok deg igjen. Halvparten av lasten er borte, og du fikk deg en smell. −${dmg} helse.`, 'bad')
        }
      } else if (choiceId === 'bestikk') {
        const bribe = num('bribe')
        if (s.cash < bribe) return 'INSUFFICIENT_FUNDS'
        s.cash -= bribe
        if (rng.chance(0.85)) {
          say(s, `Betjenten stakk konvolutten i lomma og så en annen vei. −${kr(bribe)}.`, 'neutral')
        } else {
          const name = confiscateBiggest(s, 1)
          say(s, `Ærlig betjent! Han tok pengene som bevis${name ? ` og all ${name}` : ''}.`, 'bad')
        }
      } else {
        const name = confiscateBiggest(s, rng.range(0.4, 0.7))
        say(s, `De beslagla en del ${name ?? 'varer'}, men lot deg gå.`, 'bad')
      }
      break
    }
    case 'hiace': {
      if (choiceId === 'kjop') {
        const price = num('price')
        if (s.cash < price) return 'INSUFFICIENT_FUNDS'
        s.cash -= price
        s.capacity += num('extra')
        say(s, `Mer plass! Lageret rommer nå ${s.capacity}.`, 'good')
      }
      break
    }
    case 'lege': {
      if (choiceId === 'betal') {
        const price = num('price')
        if (s.cash < price) return 'INSUFFICIENT_FUNDS'
        s.cash -= price
        s.health = Math.min(100, s.health + 40)
        say(s, 'Sydd og plastret. Du føler deg nesten som ny.', 'good')
      }
      break
    }
  }
  s.pendingEvent = null
  return null
}

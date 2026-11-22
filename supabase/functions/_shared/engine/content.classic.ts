// Classic Mode (18+): a nod to the original Dope Wars. Same engine, cities and
// events; only the goods and their city price profiles differ. Pure game
// fiction: prices and headlines are made up and contain no real-world
// instructions. Unlocked by a hidden gesture on the title screen.

import type { CityId, Item, ItemId } from './types.ts'

export const CLASSIC_ITEMS: readonly Item[] = [
  {
    id: 'hasj', name: 'Hasj', category: 'nytelse',
    description: 'Brun, myk og fra «en kompis av en kompis».',
    basePrice: 120, minPrice: 40, maxPrice: 300, volatility: 0.35, size: 1,
    spikeText: 'Politiet har tatt et stort beslag i {city}. Hasjen er nesten borte.',
    crashText: 'En båt fra sør har losset i {city}. Hasj overalt.',
  },
  {
    id: 'sopp', name: 'Fleinsopp', category: 'nytelse',
    description: 'Plukket på vidda. Angivelig.',
    basePrice: 300, minPrice: 100, maxPrice: 700, volatility: 0.4, size: 1,
    spikeText: 'Soppsesongen slo feil rundt {city}. Prisene går til værs.',
    crashText: 'Rekordhøst av fleinsopp rundt {city}.',
  },
  {
    id: 'speed', name: 'Amfetamin', category: 'nytelse',
    description: 'For de som vil vaske leiligheten tre ganger.',
    basePrice: 450, minPrice: 150, maxPrice: 1100, volatility: 0.35, size: 1,
    spikeText: 'Tollen stoppet en trailer på vei mot {city}. Speed er mangelvare.',
    crashText: 'Et lager i {city} er tømt ut på markedet. Speed for en slikk.',
  },
  {
    id: 'lsd', name: 'LSD', category: 'nytelse',
    description: 'Små lapper med tegneseriefigurer. Ikke spis dem.',
    basePrice: 900, minPrice: 300, maxPrice: 2200, volatility: 0.4, size: 1,
    spikeText: 'Psykedelisk festival i {city}. Alle vil ha syre.',
    crashText: 'En kjemistudent i {city} har vært flittig. Syre er billig.',
  },
  {
    id: 'ecstasy', name: 'Ecstasy', category: 'nytelse',
    description: 'Piller med logo. Logoen lover mer enn den holder.',
    basePrice: 1300, minPrice: 450, maxPrice: 3000, volatility: 0.35, size: 1,
    spikeText: 'Rave i en låve utenfor {city}. Ecstasy går for skyhøye priser.',
    crashText: 'En forsendelse fra kontinentet har nådd {city}. Prisene stuper.',
  },
  {
    id: 'ketamin', name: 'Ketamin', category: 'nytelse',
    description: 'Opprinnelig for hester. Det sier vel alt.',
    basePrice: 2200, minPrice: 800, maxPrice: 5000, volatility: 0.35, size: 1,
    spikeText: 'Nachspielsesongen er i gang i {city}.',
    crashText: 'Et parti ketamin oversvømmer {city}.',
  },
  {
    id: 'kokain', name: 'Kokain', category: 'luksus',
    description: 'Strukket med bakepulver og dårlige beslutninger.',
    basePrice: 6000, minPrice: 2200, maxPrice: 14000, volatility: 0.3, size: 1,
    spikeText: 'Finansfolk i {city} har fått bonus. Kokainprisen eksploderer.',
    crashText: 'En stor forsendelse kom gjennom havna i {city}. Kokain er billig.',
  },
  {
    id: 'heroin', name: 'Heroin', category: 'luksus',
    description: 'Det mørkeste hjørnet av markedet.',
    basePrice: 12000, minPrice: 4500, maxPrice: 28000, volatility: 0.35, size: 1,
    spikeText: 'Massivt beslag i {city}. Heroin er nesten umulig å få tak i.',
    crashText: 'Heroin flommer inn i {city}. Prisene faller.',
  },
]

/** City price profiles for Classic goods (multipliers on base price). */
export const CLASSIC_MODS: Record<CityId, Partial<Record<ItemId, number>>> = {
  hamar: { sopp: 0.6, speed: 0.85, kokain: 1.15 },
  oslo: { kokain: 1.3, heroin: 0.8, ecstasy: 1.15, hasj: 0.9 },
  bergen: { hasj: 0.8, lsd: 1.2, kokain: 1.1 },
  trondheim: { speed: 0.7, lsd: 0.8, ecstasy: 1.2 },
  stavanger: { kokain: 1.5, ketamin: 1.3, hasj: 1.2 },
  tromso: { hasj: 1.4, kokain: 1.3, speed: 1.3, sopp: 0.7 },
  kristiansand: { hasj: 0.6, ecstasy: 0.7, heroin: 1.2 },
  bodo: { ketamin: 1.3, hasj: 1.25, lsd: 1.2 },
  alesund: { lsd: 1.2, speed: 1.15, kokain: 0.85 },
}

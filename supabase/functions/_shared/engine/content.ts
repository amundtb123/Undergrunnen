// Placeholder catalog. Mirrors undergrunnen.cities / items / contacts and will
// become the seed SQL once the content is settled. All goods are fictional
// satire. City descriptions are game fiction, not claims about real places.

import type { City, Item } from './types.ts'

export const CITIES: readonly City[] = [
  {
    id: 'hamar', name: 'Hamar', region: 'Innlandet', lat: 60.7945, lng: 11.068, hue: 280,
    subtitle: 'Mjøsas knutepunkt',
    tagline: 'Lite marked. Korte avstander. Lange minner.',
    risk: 2, marketSize: 1, competition: 1, demand: 2, hasBank: true,
    priceMods: { brunost: 0.55, retrospill: 1.35, klokke: 1.1, sprit: 1.1, lusekofte: 0.85, munch: 0.85 },
  },
  {
    id: 'oslo', name: 'Oslo', region: 'Østlandet', lat: 59.9139, lng: 10.7522, hue: 35,
    subtitle: 'Det største markedet',
    tagline: 'Hovedstaden. Alt er dyrere her, også problemene.',
    risk: 4, marketSize: 3, competition: 3, demand: 3, hasBank: false,
    priceMods: { moncler: 1.35, munch: 1.3, klokke: 1.3, sneakers: 1.2, elsparkesykkel: 0.55, brunost: 1.2 },
  },
  {
    id: 'bergen', name: 'Bergen', region: 'Vestlandet', lat: 60.3913, lng: 5.3221, hue: 200,
    subtitle: 'Havn, regn og turister',
    tagline: 'Regn 300 dager i året. Lusekofter går unna.',
    risk: 2, marketSize: 2, competition: 2, demand: 2, hasBank: false,
    priceMods: { lusekofte: 1.35, sprit: 1.15, kongekrabbe: 0.9, parfyme: 0.85 },
  },
  {
    id: 'trondheim', name: 'Trondheim', region: 'Trøndelag', lat: 63.4305, lng: 10.3951, hue: 140,
    subtitle: 'Studenter og teknologi',
    tagline: 'Kort vei til Sverige. Snusen flyter, og studentene selger alt.',
    risk: 2, marketSize: 2, competition: 2, demand: 2, hasBank: false,
    priceMods: { snus: 0.55, retrospill: 0.7, mobil: 0.8, munch: 0.9, sprit: 1.1 },
  },
  {
    id: 'stavanger', name: 'Stavanger', region: 'Rogaland', lat: 58.97, lng: 5.7331, hue: 15,
    subtitle: 'Kapital og luksus',
    tagline: 'Oljepenger og tvilsom smak.',
    risk: 2, marketSize: 2, competition: 2, demand: 3, hasBank: false,
    priceMods: { klokke: 1.45, moncler: 1.4, munch: 1.5, kongekrabbe: 1.25, parfyme: 1.2, brunost: 0.9 },
  },
  {
    id: 'tromso', name: 'Tromsø', region: 'Nord-Norge', lat: 69.6492, lng: 18.9553, hue: 170,
    subtitle: 'Avstand og knapphet',
    tagline: 'Nordlys, turister og kongekrabbe i tonnevis.',
    risk: 3, marketSize: 1, competition: 1, demand: 2, hasBank: false,
    priceMods: { kongekrabbe: 0.45, lusekofte: 1.35, elsparkesykkel: 1.5, mobil: 1.3, sneakers: 1.3, sprit: 1.3 },
  },
  {
    id: 'kristiansand', name: 'Kristiansand', region: 'Sørlandet', lat: 58.1467, lng: 7.9956, hue: 190,
    subtitle: 'Porten til Danmark',
    tagline: 'Danskebåten legger til hver dag.',
    risk: 1, marketSize: 2, competition: 1, demand: 1, hasBank: false,
    priceMods: { sprit: 0.5, parfyme: 0.6, snus: 1.25, moncler: 0.95 },
  },
  {
    id: 'bodo', name: 'Bodø', region: 'Nordland', lat: 67.2804, lng: 14.4049, hue: 260,
    subtitle: 'Kulturhovedstad',
    tagline: 'Europeisk kulturhovedstad. Ingen vet helt hvorfor.',
    risk: 2, marketSize: 1, competition: 1, demand: 1, hasBank: false,
    priceMods: { elsparkesykkel: 1.6, sneakers: 1.25, kongekrabbe: 0.75, moncler: 1.2, snus: 1.2 },
  },
  {
    id: 'alesund', name: 'Ålesund', region: 'Sunnmøre', lat: 62.4722, lng: 6.1495, hue: 300,
    subtitle: 'Jugend og strikk',
    tagline: 'Jugendstil, strikkefabrikker og brunost-kartellet.',
    risk: 1, marketSize: 1, competition: 2, demand: 1, hasBank: false,
    priceMods: { brunost: 0.7, lusekofte: 0.6, munch: 1.15 },
  },
]

export const ITEMS: readonly Item[] = [
  {
    id: 'brunost', name: 'Brunost', category: 'mat',
    description: 'Svartebørs-brunost fra seteren. Ingen spør hvor den kommer fra.',
    basePrice: 90, minPrice: 30, maxPrice: 220, volatility: 0.35, size: 1,
    spikeText: 'Brunostmangel i {city}! Folk betaler hva som helst.',
    crashText: 'Seterlaget dumper brunost i {city}. Prisene stuper.',
  },
  {
    id: 'snus', name: 'Smuglersnus', category: 'nytelse',
    description: 'Svensk. Uten avgift. Uten spørsmål.',
    basePrice: 260, minPrice: 90, maxPrice: 600, volatility: 0.35, size: 1,
    spikeText: 'Tollvesenet tok snuslasten til {city}. Prisene går til himmels.',
    crashText: 'Svensk snus-trailer veltet utenfor {city}. Bokser overalt.',
  },
  {
    id: 'sprit', name: 'Taxfree-sprit', category: 'nytelse',
    description: 'Litt for mange flasker for «eget bruk».',
    basePrice: 650, minPrice: 250, maxPrice: 1500, volatility: 0.3, size: 1,
    spikeText: 'Vinmonopolet i {city} streiker!',
    crashText: 'Danskebåten har losset i {city}. Sprit på hvert gatehjørne.',
  },
  {
    id: 'retrospill', name: 'Retrospill', category: 'samleobjekt',
    description: 'Komplett i eske. Lukter loft.',
    basePrice: 700, minPrice: 200, maxPrice: 1800, volatility: 0.4, size: 1,
    spikeText: 'Samlermesse i {city}! Retrospill går for skyhøye summer.',
    crashText: 'Et dødsbo i {city} er tømt for kassetter. Markedet flommer over.',
  },
  {
    id: 'parfyme', name: 'Parfyme', category: 'luksus',
    description: 'Fransk navn. Ukjent opprinnelse.',
    basePrice: 1100, minPrice: 400, maxPrice: 2600, volatility: 0.3, size: 1,
    spikeText: 'Morsdag nærmer seg i {city}. Parfyme blir mangelvare.',
    crashText: 'Et parti parfyme har dukket opp i {city}. Prisene faller.',
  },
  {
    id: 'lusekofte', name: 'Lusekofte', category: 'mote',
    description: 'Ekte norsk. Nesten.',
    basePrice: 1400, minPrice: 500, maxPrice: 3200, volatility: 0.3, size: 1,
    spikeText: 'Kuldesjokk i {city}. Alle vil ha lusekofte.',
    crashText: 'Strikkeklubben i {city} har overprodusert kraftig.',
  },
  {
    id: 'sneakers', name: 'Sneakers', category: 'mote',
    description: 'Limited edition. Kanskje.',
    basePrice: 1800, minPrice: 600, maxPrice: 4500, volatility: 0.35, size: 1,
    spikeText: 'Drop-kø rundt kvartalet i {city}. Sneakers er gull.',
    crashText: 'Outletsalg i {city}. Ingen vil betale fullpris lenger.',
  },
  {
    id: 'kongekrabbe', name: 'Kongekrabbe', category: 'mat',
    description: 'Levende, sint og veldig ettertraktet.',
    basePrice: 2800, minPrice: 1000, maxPrice: 6500, volatility: 0.35, size: 2,
    spikeText: 'Michelin-kokker invaderer {city}. Krabbeprisen eksploderer.',
    crashText: 'Rekordfangst! {city} drukner i kongekrabbe.',
  },
  {
    id: 'mobil', name: 'Mobiltelefoner', category: 'elektronikk',
    description: 'Nyeste modell. Fra i fjor.',
    basePrice: 3500, minPrice: 1200, maxPrice: 8000, volatility: 0.3, size: 1,
    spikeText: 'Lanseringsdag i {city}! Alle vil ha ny telefon.',
    crashText: 'Lagerrydding i {city}. Telefoner selges for en slikk og ingenting.',
  },
  {
    id: 'elsparkesykkel', name: 'Elsparkesykkel', category: 'elektronikk',
    description: 'Fisket opp av Akerselva. Lett brukt.',
    basePrice: 4500, minPrice: 1500, maxPrice: 10000, volatility: 0.35, size: 4,
    spikeText: 'Kommunen i {city} forbyr utleiesykler. Bruktmarkedet koker.',
    crashText: 'Hundrevis av sparkesykler hentet opp av havna i {city}.',
  },
  {
    id: 'moncler', name: 'Kopi-Moncler', category: 'mote',
    description: 'Logoen sitter nesten rett.',
    basePrice: 9000, minPrice: 3500, maxPrice: 20000, volatility: 0.3, size: 2,
    spikeText: 'Influencer-bølge i {city}. Alle må ha Moncler.',
    crashText: 'Container med kopijakker beslaglagt… og solgt videre i {city}.',
  },
  {
    id: 'munch', name: 'Munch-kopi', category: 'samleobjekt',
    description: 'Skrik. Litt skjevt. Signert «E. Munck».',
    basePrice: 22000, minPrice: 8000, maxPrice: 55000, volatility: 0.35, size: 3,
    spikeText: 'Kunstsamler fra Dubai er i {city} og kjøper alt.',
    crashText: 'Falskneri avslørt i {city}. Markedet oversvømmes av kopier.',
  },
  {
    id: 'klokke', name: 'Luksusklokke', category: 'luksus',
    description: 'Sveitsisk. Sies det.',
    basePrice: 30000, minPrice: 11000, maxPrice: 70000, volatility: 0.3, size: 1,
    spikeText: 'Finansfolk feirer bonus i {city}. Klokkene forsvinner fra hyllene.',
    crashText: 'Klokkeparti beslaglagt i {city}, og plutselig er alle billige.',
  },
]

export const CONTACTS = {
  lender: { name: 'Kjell «Renta» Rønningen', short: 'Kjell', role: 'Lånehai', cityId: 'hamar' },
  banker: { name: 'Bankfrue Berit', short: 'Berit', role: 'Diskret bank', cityId: 'hamar' },
} as const

const cityById = new Map(CITIES.map((c) => [c.id, c]))
const itemById = new Map(ITEMS.map((i) => [i.id, i]))

export function getCity(id: string): City | undefined {
  return cityById.get(id)
}
export function getItem(id: string): Item | undefined {
  return itemById.get(id)
}

export const HOME_CITY = CITIES.find((c) => c.hasBank)!

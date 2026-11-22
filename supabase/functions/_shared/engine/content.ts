// Placeholder catalog. Mirrors undergrunnen.cities / items / contacts and will
// become the seed SQL once the content is settled. All goods are fictional
// satire. City descriptions are game fiction, not claims about real places.

import { CLASSIC_ITEMS, CLASSIC_MODS } from './content.classic.ts'
import type { City, GameMode, Item } from './types.ts'

export const CITIES: readonly City[] = [
  {
    id: 'hamar', name: 'Hamar', county: 'Innlandet', region: 'Østlandet', lat: 60.7945, lng: 11.068, hue: 280,
    subtitle: 'Mjøsas knutepunkt',
    tagline: 'Lite marked. Korte avstander. Lange minner.',
    geography: 'By ved Mjøsa, Norges største innsjø.',
    knownFor: ['Mjøsa', 'Vikingskipet', 'Domkirkeodden', 'Hamar sentrum'],
    risk: 2, marketSize: 1, competition: 1, demand: 2, hasBank: true,
    priceMods: { brunost: 0.55, retrospill: 1.35, klokke: 1.1, sprit: 1.1, lusekofte: 0.85, munch: 0.85 },
    happenings: [
      { text: 'Stor aktivitet rundt Vikingskipet. Folk vil ha mat og drikke.', categories: ['mat', 'nytelse'], mult: 1.5 },
      { text: 'Lokalt marked i Hamar får en uventet leveranse. Samleobjekter selges billig.', categories: ['samleobjekt'], mult: 0.6 },
      { text: 'Rykter sprer seg raskt i et lite miljø. Alle vet hvem du er i dag.', riskBonus: 0.2 },
    ],
  },
  {
    id: 'oslo', name: 'Oslo', county: 'Oslo', region: 'Østlandet', lat: 59.9139, lng: 10.7522, hue: 35,
    subtitle: 'Det største markedet',
    tagline: 'Hovedstaden. Alt er dyrere her, også problemene.',
    geography: 'Norges hovedstad og største byområde, innerst i Oslofjorden.',
    knownFor: ['Operahuset', 'Akershus festning', 'Grünerløkka', 'Aker Brygge'],
    risk: 4, marketSize: 3, competition: 3, demand: 3, hasBank: false,
    priceMods: { moncler: 1.35, munch: 1.3, klokke: 1.3, sneakers: 1.2, elsparkesykkel: 0.55, brunost: 1.2 },
    happenings: [
      { text: 'Festivaluke i Oslo. Drikke og klær går unna.', categories: ['nytelse', 'mote'], mult: 1.5 },
      { text: 'Kontrollaksjon i Oslo sentrum. Politiet er overalt.', riskBonus: 0.25 },
      { text: 'En ny kontakt i Oslo har fått tak i eksklusive varer. Luksus er billig i dag.', categories: ['luksus'], mult: 0.6 },
    ],
  },
  {
    id: 'bergen', name: 'Bergen', county: 'Vestland', region: 'Vestlandet', lat: 60.3913, lng: 5.3221, hue: 200,
    subtitle: 'Havn, regn og turister',
    tagline: 'Regn 300 dager i året. Lusekofter går unna.',
    geography: 'Vestlandets store kystby, omgitt av fjell og fjorder.',
    knownFor: ['Bryggen', 'Fløyen', 'Ulriken', 'Vågen'],
    risk: 2, marketSize: 2, competition: 2, demand: 2, hasBank: false,
    priceMods: { lusekofte: 1.35, sprit: 1.15, kongekrabbe: 0.9, parfyme: 0.85 },
    happenings: [
      { text: 'Lang regnværsperiode i Bergen. Alle vil ha varme klær.', categories: ['mote'], mult: 1.5 },
      { text: 'Cruiseanløp i Bergen. Turistene kjøper mat og luksus.', categories: ['mat', 'luksus'], mult: 1.4 },
      { text: 'Ny havnerute til Bergen. Drikke og snus strømmer inn.', categories: ['nytelse'], mult: 0.6 },
    ],
  },
  {
    id: 'trondheim', name: 'Trondheim', county: 'Trøndelag', region: 'Midt-Norge', lat: 63.4305, lng: 10.3951, hue: 140,
    subtitle: 'Studenter og teknologi',
    tagline: 'Kort vei til Sverige. Snusen flyter, og studentene selger alt.',
    geography: 'Historisk by ved Trondheimsfjorden og et viktig universitets- og teknologimiljø.',
    knownFor: ['Nidarosdomen', 'Gamle Bybro', 'Bakklandet', 'NTNU'],
    risk: 2, marketSize: 2, competition: 2, demand: 2, hasBank: false,
    priceMods: { snus: 0.55, retrospill: 0.7, mobil: 0.8, munch: 0.9, sprit: 1.1 },
    happenings: [
      { text: 'Studiestart i Trondheim. Studentene vil ha drikke og nye telefoner.', categories: ['nytelse', 'elektronikk'], mult: 1.4 },
      { text: 'Stor konsert fyller Trondheim sentrum.', categories: ['nytelse', 'mote'], mult: 1.4 },
      { text: 'Teknologimesse i Trondheim. Elektronikk selges billig.', categories: ['elektronikk'], mult: 0.6 },
    ],
  },
  {
    id: 'stavanger', name: 'Stavanger', county: 'Rogaland', region: 'Sørvestlandet', lat: 58.97, lng: 5.7331, hue: 15,
    subtitle: 'Kapital og luksus',
    tagline: 'Oljepenger og tvilsom smak.',
    geography: 'Kystby med sterk tilknytning til olje- og energinæringen.',
    knownFor: ['Gamle Stavanger', 'Vågen', 'Oljemuseet', 'Lysefjorden'],
    risk: 2, marketSize: 2, competition: 2, demand: 3, hasBank: false,
    priceMods: { klokke: 1.45, moncler: 1.4, munch: 1.5, kongekrabbe: 1.25, parfyme: 1.2, brunost: 0.9 },
    happenings: [
      { text: 'Offshorekonferanse i Stavanger. Luksus forsvinner fra hyllene.', categories: ['luksus'], mult: 1.6 },
      { text: 'Oljeprisrykter i Stavanger. Folk holder på pengene.', categories: ['luksus', 'mote'], mult: 0.7 },
      { text: 'Cruisesesong i Stavanger. Flere kjøpere på kaia.', categories: ['mat', 'mote'], mult: 1.4 },
    ],
  },
  {
    id: 'tromso', name: 'Tromsø', county: 'Troms', region: 'Nord-Norge', lat: 69.6492, lng: 18.9553, hue: 170,
    subtitle: 'Avstand og knapphet',
    tagline: 'Nordlys, turister og kongekrabbe i tonnevis.',
    geography: 'Arktisk by på Tromsøya, omgitt av fjell og fjorder.',
    knownFor: ['Ishavskatedralen', 'Fjellheisen', 'Polaria', 'Nordlys'],
    risk: 3, marketSize: 1, competition: 1, demand: 2, hasBank: false,
    priceMods: { kongekrabbe: 0.45, lusekofte: 1.35, elsparkesykkel: 1.5, mobil: 1.3, sneakers: 1.3, sprit: 1.3 },
    happenings: [
      { text: 'Nordlysvarsel gir turistboom i Tromsø. Klær og mat går unna.', categories: ['mote', 'mat'], mult: 1.5 },
      { text: 'Vintervær forsinker leveransene til Tromsø. Alt blir dyrere.', categories: 'all', mult: 1.3 },
      { text: 'Festival i Tromsø trekker folk til byen.', categories: ['nytelse'], mult: 1.5 },
    ],
  },
  {
    id: 'kristiansand', name: 'Kristiansand', county: 'Agder', region: 'Sørlandet', lat: 58.1467, lng: 7.9956, hue: 190,
    subtitle: 'Porten til Danmark',
    tagline: 'Danskebåten legger til hver dag.',
    geography: 'Sørlandsby ved Skagerrak, kjent for skjærgård og sommerliv.',
    knownFor: ['Posebyen', 'Fiskebrygga', 'Bystranda', 'Kilden'],
    risk: 1, marketSize: 2, competition: 1, demand: 1, hasBank: false,
    priceMods: { sprit: 0.5, parfyme: 0.6, snus: 1.25, moncler: 0.95 },
    happenings: [
      { text: 'Sommerfestival på Sørlandet. Drikke selges for hva som helst.', categories: ['nytelse'], mult: 1.6 },
      { text: 'Varm helg ved sjøen i Kristiansand. Mat og drikke går unna.', categories: ['mat', 'nytelse'], mult: 1.3 },
      { text: 'Båtsesongen starter tidlig i Kristiansand. Båteierne vil ha luksus.', categories: ['luksus'], mult: 1.4 },
    ],
  },
  {
    id: 'bodo', name: 'Bodø', county: 'Nordland', region: 'Nord-Norge', lat: 67.2804, lng: 14.4049, hue: 260,
    subtitle: 'Kyst og luftfart',
    tagline: 'Europeisk kulturhovedstad. Ingen vet helt hvorfor.',
    geography: 'Kystby nord for polarsirkelen med sterk maritim og luftfartsrelatert identitet.',
    knownFor: ['Saltstraumen', 'Stormen', 'Luftfart', 'Kysten'],
    risk: 2, marketSize: 1, competition: 1, demand: 1, hasBank: false,
    priceMods: { elsparkesykkel: 1.6, sneakers: 1.25, kongekrabbe: 0.75, moncler: 1.2, snus: 1.2 },
    happenings: [
      { text: 'Kraftig vind stanser leveranser til Bodø. Alt blir dyrere.', categories: 'all', mult: 1.3 },
      { text: 'Stor kulturhelg i Stormen. Samlere og festfolk i byen.', categories: ['samleobjekt', 'nytelse'], mult: 1.4 },
      { text: 'Turisttrafikken øker i Bodø. Klær og mat går unna.', categories: ['mote', 'mat'], mult: 1.3 },
    ],
  },
  {
    id: 'alesund', name: 'Ålesund', county: 'Møre og Romsdal', region: 'Vestlandet', lat: 62.4722, lng: 6.1495, hue: 300,
    subtitle: 'Jugend og fiskebåter',
    tagline: 'Jugendstil, fiskebåter og strikkefabrikker.',
    geography: 'Kystby bygget på øyer, kjent for jugendstil og maritim næring.',
    knownFor: ['Jugendstilen', 'Aksla', 'Brosundet', 'Atlanterhavsparken'],
    risk: 1, marketSize: 1, competition: 2, demand: 1, hasBank: false,
    priceMods: { kongekrabbe: 0.7, brunost: 0.75, lusekofte: 0.6, munch: 1.15 },
    happenings: [
      { text: 'Fiskerimarkedet i Ålesund får en stor leveranse. Mat er billig.', categories: ['mat'], mult: 0.55 },
      { text: 'Cruiseskip i Ålesund gir turistboom.', categories: ['mote', 'luksus'], mult: 1.4 },
      { text: 'Uvær langs kysten forsinker transporten til Ålesund. Alt blir dyrere.', categories: 'all', mult: 1.3 },
    ],
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
const itemById = new Map([...ITEMS, ...CLASSIC_ITEMS].map((i) => [i.id, i]))

/** The goods traded in a given mode. */
export function itemsFor(mode: GameMode | undefined): readonly Item[] {
  return mode === 'classic' ? CLASSIC_ITEMS : ITEMS
}

/** City price multiplier for an item (Clean or Classic). */
export function priceMod(city: City, itemId: string): number {
  return city.priceMods[itemId] ?? CLASSIC_MODS[city.id]?.[itemId] ?? 1
}

export function getCity(id: string): City | undefined {
  return cityById.get(id)
}
export function getItem(id: string): Item | undefined {
  return itemById.get(id)
}

export const HOME_CITY = CITIES.find((c) => c.hasBank)!

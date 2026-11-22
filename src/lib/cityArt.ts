// City imagery. Only Hamar has art so far: an AI-generated concept image from
// the starter pack, so it is labelled as concept art in the UI and must not be
// presented as a photograph. Other cities use the gradient placeholder.

export interface CityArt {
  src: string
  credit: string
}

export const CITY_ART: Record<string, CityArt> = {
  hamar: { src: '/cities/hamar.jpg', credit: 'Konseptbilde' },
}

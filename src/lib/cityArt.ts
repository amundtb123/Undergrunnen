// City imagery: drop a file named after the city id into src/assets/cities/
// (hamar.jpg, oslo.jpg, bergen.webp …) and it is picked up automatically.
// Cities without a file use the gradient placeholder.
//
// The images are AI-generated concept art (ChatGPT, city pack). They set the
// mood; maps and distances come from real coordinates, never from the images.

export interface CityArt {
  src: string
}

const files = import.meta.glob<string>('../assets/cities/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

export const CITY_ART: Record<string, CityArt> = Object.fromEntries(
  Object.entries(files).map(([path, src]) => {
    const id = path.split('/').pop()!.replace(/\.\w+$/, '')
    return [id, { src }]
  }),
)

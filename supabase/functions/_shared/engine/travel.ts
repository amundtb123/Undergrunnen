// Travel System: distance, cost and duration between cities.

import { getCity } from './content.ts'
import { RULES } from './rules.ts'
import type { CityId } from './types.ts'

export interface Route {
  km: number
  days: number
  cost: number
  mode: 'Tog' | 'Fly' | 'Haik'
}

export function distanceKm(a: CityId, b: CityId): number {
  const ca = getCity(a)
  const cb = getCity(b)
  if (!ca || !cb) throw new Error('Unknown city')
  const rad = Math.PI / 180
  const dLat = (cb.lat - ca.lat) * rad
  const dLng = (cb.lng - ca.lng) * rad
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(ca.lat * rad) * Math.cos(cb.lat * rad) * Math.sin(dLng / 2) ** 2
  return Math.round(6371 * 2 * Math.asin(Math.sqrt(h)))
}

export function route(from: CityId, to: CityId): Route {
  const km = distanceKm(from, to)
  const long = km > RULES.longTripKm
  return {
    km,
    days: long ? 2 : 1,
    cost: Math.round((RULES.travelBaseCost + km * RULES.travelCostPerKm) / 50) * 50,
    mode: km > 450 ? 'Fly' : 'Tog',
  }
}

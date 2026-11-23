// Client for the ug-scores Edge Function. No login and no keys: the function
// is public and verifies every result by replaying it.

import type { Action, GameMode } from '@engine/index.ts'

const BASE =
  (import.meta.env.VITE_SCORES_URL as string | undefined) ??
  'https://bfynfdqpedqtgtqiczpb.supabase.co/functions/v1/ug-scores'

export interface TopScore {
  name: string
  score: number
  status: 'finished' | 'dead'
  days: number
  date: string
}

async function call<T>(path: string, init: RequestInit = {}, timeoutMs = 6000): Promise<T> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${BASE}/${path}`, {
      ...init,
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
    return body as T
  } finally {
    clearTimeout(timer)
  }
}

export const startRun = (mode: GameMode) =>
  call<{ runId: string; seed: number }>('start', { method: 'POST', body: JSON.stringify({ mode }) }, 4000)

export const submitRun = (runId: string, name: string, actions: Action[]) =>
  call<{ score: number; status: string; rank: number }>('submit', {
    method: 'POST',
    body: JSON.stringify({ runId, name, actions }),
  }, 15000)

export const fetchTop = (limit = 20, mode: GameMode = 'clean') =>
  call<{ scores: TopScore[] }>(`top?limit=${limit}&mode=${mode}`).then((r) => r.scores)

export interface ModeStats {
  started: number
  today: number
  listed: number
}
export const fetchStats = () => call<Record<GameMode, ModeStats>>('stats')

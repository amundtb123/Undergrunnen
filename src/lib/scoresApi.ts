// Client for the ug-scores Edge Function. No login and no keys: the function
// is public and verifies every result by replaying it.

import type { Action } from '@engine/index.ts'

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

export const startRun = () => call<{ runId: string; seed: number }>('start', { method: 'POST', body: '{}' }, 4000)

export const submitRun = (runId: string, name: string, actions: Action[]) =>
  call<{ score: number; status: string; rank: number }>('submit', {
    method: 'POST',
    body: JSON.stringify({ runId, name, actions }),
  }, 15000)

export const fetchTop = (limit = 20) => call<{ scores: TopScore[] }>(`top?limit=${limit}`).then((r) => r.scores)

// ug-scores: anonymous, server-verified highscores for Undergrunnen.
//
//   POST /ug-scores/start              → { runId, seed }       server picks the seed
//   POST /ug-scores/submit             { runId, name, actions } → { score, rank }
//   GET  /ug-scores/top?limit=20       → { scores: [...] }
//
// The submitted action log is replayed with the shared engine; only the
// replayed score is stored. Talks to Postgres directly (SUPABASE_DB_URL), so
// the `undergrunnen` schema does not need to be exposed in the Data API.

import postgres from 'npm:postgres@3.4.5'
import { MAX_ACTIONS, replayGame } from '../_shared/engine/index.ts'

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 3 })

const ALLOWED_ORIGINS = new Set([
  'https://undergrunnen.dilldall.net',
  'https://undergrunnen-dilldall.netlify.app',
  'http://localhost:5173',
])
const RUNS_PER_HOUR = 40
const MAX_BODY_BYTES = 400_000
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function cors(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') ?? ''
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.has(origin) ? origin : 'https://undergrunnen.dilldall.net',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization, apikey, x-client-info',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  }
}

function json(req: Request, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req), 'Content-Type': 'application/json; charset=utf-8' },
  })
}

async function clientHash(req: Request): Promise<string> {
  const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() ?? ''
  const day = new Date().toISOString().slice(0, 10)
  const data = new TextEncoder().encode(`${ip}|${day}|undergrunnen`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest).slice(0, 12), (b) => b.toString(16).padStart(2, '0')).join('')
}

function cleanName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw.normalize('NFC').replace(/[\p{C}<>]/gu, '').replace(/\s+/g, ' ').trim().slice(0, 20)
  return name.length > 0 ? name : null
}

async function start(req: Request): Promise<Response> {
  const hash = await clientHash(req)
  const [{ n }] = await sql<{ n: number }[]>`
    select count(*)::int as n from undergrunnen.runs
    where client_hash = ${hash} and created_at > now() - interval '1 hour'`
  if (n >= RUNS_PER_HOUR) return json(req, 429, { error: 'RATE_LIMITED' })
  const seed = crypto.getRandomValues(new Uint32Array(1))[0]!
  const [run] = await sql<{ id: string }[]>`
    insert into undergrunnen.runs (seed, client_hash) values (${seed}, ${hash}) returning id`
  return json(req, 200, { runId: run!.id, seed })
}

async function submit(req: Request): Promise<Response> {
  if (Number(req.headers.get('content-length') ?? 0) > MAX_BODY_BYTES) return json(req, 413, { error: 'TOO_LARGE' })
  const body = await req.json().catch(() => null) as { runId?: unknown; name?: unknown; actions?: unknown } | null
  if (!body || typeof body.runId !== 'string' || !UUID.test(body.runId)) return json(req, 400, { error: 'BAD_RUN' })
  const name = cleanName(body.name)
  if (!name) return json(req, 400, { error: 'BAD_NAME' })
  if (!Array.isArray(body.actions) || body.actions.length > MAX_ACTIONS) return json(req, 400, { error: 'BAD_ACTIONS' })

  return await sql.begin(async (tx) => {
    const [run] = await tx<{ seed: string; mode: string; submitted_at: string | null }[]>`
      select seed, mode, submitted_at from undergrunnen.runs where id = ${body.runId as string} for update`
    if (!run) return json(req, 404, { error: 'RUN_NOT_FOUND' })
    if (run.submitted_at) return json(req, 409, { error: 'ALREADY_SUBMITTED' })

    const result = replayGame(Number(run.seed), body.actions)
    if (!result.ok) return json(req, 422, { error: result.reason })
    const s = result.state

    await tx`
      insert into undergrunnen.scores (run_id, name, score, status, days_played, mode)
      values (${body.runId as string}, ${name}, ${s.score!}, ${s.status}, ${s.day}, ${run.mode})`
    await tx`update undergrunnen.runs set submitted_at = now() where id = ${body.runId as string}`
    const [{ rank }] = await tx<{ rank: number }[]>`
      select count(*)::int + 1 as rank from undergrunnen.scores where mode = ${run.mode} and score > ${s.score!}`
    return json(req, 200, { score: s.score, status: s.status, rank })
  })
}

async function top(req: Request): Promise<Response> {
  const url = new URL(req.url)
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get('limit')) || 20))
  const rows = await sql`
    select name, score, status, days_played, created_at from undergrunnen.scores
    where mode = 'clean' order by score desc, created_at asc limit ${limit}`
  return json(req, 200, {
    scores: rows.map((r) => ({
      name: r.name,
      score: Number(r.score),
      status: r.status,
      days: r.days_played,
      date: r.created_at,
    })),
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) })
  const route = new URL(req.url).pathname.split('/').pop()
  try {
    if (req.method === 'POST' && route === 'start') return await start(req)
    if (req.method === 'POST' && route === 'submit') return await submit(req)
    if (req.method === 'GET' && route === 'top') return await top(req)
    return json(req, 404, { error: 'NOT_FOUND' })
  } catch (err) {
    console.error(err)
    return json(req, 500, { error: 'SERVER_ERROR' })
  }
})

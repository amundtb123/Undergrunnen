# UNDERGRUNNEN — Task 001: Audit & Architecture

Status: **proposal**. Nothing has been applied to Supabase, Netlify or any shared infrastructure.

---

## 1. Repository & environment audit

| Area | Finding |
|---|---|
| Repository | `/Users/a01546/Undergrunnen` is **empty**. It is not a git repository and has no package.json. |
| Local tooling | Node 22.12, npm, Supabase CLI (`/opt/homebrew/bin/supabase`) and git are installed. There is no local Postgres or Docker, so `supabase start` will not work as-is. |
| Other apps on the shared project | **`~/ki-games`** is the only local project that references `bfynfdqpedqtgtqiczpb`. It is a Figma Make app (React 19, Vite 8, Tailwind v4, supabase-js 2.x, pnpm). `OneTimeQR` uses Supabase and Netlify, but with a different project. |
| How ki-games uses the database | Tables live in **`public`** and use name prefixes: `ki_*`, `homing_*`, `kv_store_ccb9457d`. It deploys one Edge Function named **`server`** (Hono; routes prefixed `make-server-ccb9457d`). |
| Supabase Auth | **ki-games does not use Supabase Auth** (no `signIn`/`getSession` calls). No local code shows which auth providers are enabled or whether users exist. |
| Shared user profiles | No `profiles` table appears in any local code. Whether `public.profiles` exists in the database is **unknown**, because I did not connect to it. |
| Env var convention | `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` (gitignored, with `!.env.example`). The client throws if either is missing. |
| Migration convention | There is **no `supabase/migrations` workflow**. SQL is kept in the repo (`src/lib/schema.ts`, `homing/db/migrations.sql`) and pasted into the SQL editor by hand. |
| Deployment | ki-games deploys through Figma Make. OneTimeQR shows the Netlify convention: `netlify.toml` with `npm install && npm run build`, publishing `dist`. |

### Conflicts and risks for the shared project

> **Update 2026-11-22:** ki-games is no longer in use, so the risks to it below are low. The safe conventions (`ug-` prefix, manual SQL, additive schema exposure) still apply. We are also building and play-testing locally first (Phase 1–2), and Supabase comes after that.

1. **Edge Function names are a shared namespace.** `server` is taken by ki-games. All Undergrunnen functions use the **`ug-` prefix**. Never run a bare `supabase functions deploy` from another repo.
2. **Do not run `supabase db push` / `supabase link` + `db reset` against the shared project.** The project has no migration history table workflow, so the CLI could treat it as drifted. Apply SQL through the SQL editor, as ki-games does.
3. **A custom schema has to be exposed in the Data API.** Dashboard → Settings → API → *Exposed schemas* is a project-wide list. Adding `undergrunnen` is additive, but if the list is edited by mistake and `public` is removed, **ki-games breaks**. This change needs your approval and care (see §5).
4. **Auth redirect URLs are project-wide.** Adding the Undergrunnen Netlify domain to the redirect allow-list is a shared auth setting, so it needs your approval.
5. **Observation, not verified:** ki-games' client calls an unauthenticated `POST /functions/v1/server/ki-migrate`, and its tables appear to be written with the anon key. That route is not in the local function source, so I can't tell what is deployed. This is a pre-existing ki-games concern. It does not affect our schema, because `undergrunnen` grants nothing to `anon`.

---

## 2. Technical architecture

```
 Mobile browser / PWA (React + TS + Vite + Tailwind)
   │  supabase-js (anon key + user JWT)
   │    ├─ Auth (shared auth.users)
   │    ├─ SELECT catalog / own games / highscores  ── RLS ──┐
   │    └─ functions.invoke('ug-*')                           │
   ▼                                                          ▼
 Supabase Edge Functions (Deno, ug-*)               Postgres schema `undergrunnen`
   verify JWT → user_id                              tables + RLS (read-only to clients)
   game engine (pure TS, seeded RNG)  ──service_role──▶ atomic plpgsql (trade, commit_turn…)
```

Principles:

- **Server-authoritative.** The client sends *intents* ("buy 5 laks", "travel to Bergen") and gets back new state. It never sends money amounts or prices.
- **Pure engine, thin I/O.** All game rules live in a framework-free TypeScript module with no Deno or DOM APIs. The same code runs in Edge Functions and in unit tests (vitest on Node).
- **Atomic commits in Postgres.** Edge Functions compute, and one plpgsql call per action commits, inside a single transaction with a row lock on `games` and a `version` check.
- **Hidden information stays hidden.** Market prices for other cities, future days and RNG seeds are never client-readable.
- **Money is an integer number of NOK.**

---

## 3. Proposed folder structure

```
undergrunnen/
├─ docs/                         architecture, decisions, balancing notes
├─ public/                       icons, manifest assets, placeholder imagery
├─ src/
│  ├─ app/                       App.tsx, router, providers
│  ├─ screens/                   Market, Travel (map), Inventory, Finance, Events, Leaderboard, Auth
│  ├─ components/
│  │  ├─ layout/                 AppShell, StatusBar (cash/debt/day), BottomNav
│  │  └─ ui/                     Button, Sheet, Card, NumberStepper…
│  ├─ features/game/             hooks + api client for ug-* functions (TanStack Query)
│  ├─ lib/                       supabase.ts, format.ts (NOK, dates), env.ts
│  ├─ styles/                    index.css (Tailwind v4 theme tokens)
│  └─ main.tsx
├─ supabase/
│  ├─ migrations/                SQL kept in the repo, applied by hand through the SQL editor
│  ├─ seed/                      catalog seed (cities, items, contacts)
│  └─ functions/
│     ├─ _shared/
│     │  ├─ engine/              PURE TS: rng, economy, market, inventory, travel, events, scoring
│     │  ├─ db.ts                service-role client (server only)
│     │  └─ auth.ts              JWT → user_id
│     ├─ ug-start-game/
│     ├─ ug-game-state/
│     ├─ ug-game-action/
│     └─ ug-advance-day/
├─ tests/engine/                 vitest, deterministic seeded simulations
├─ netlify.toml
├─ .env.example                  VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY only
└─ package.json
```

---

## 4. Database design (`supabase/migrations/20261122000000_undergrunnen_init.sql`)

| Table | Owner | Client access | Purpose |
|---|---|---|---|
| `cities` | catalog | SELECT (active) | Norwegian cities: coordinates, region, risk level |
| `items` | catalog | SELECT (active) | Fictional goods: price band, volatility, size |
| `contacts` | catalog | SELECT (active) | NPCs: lender ("lånehaien"), banker, informant… |
| `games` | user | SELECT own | Day, city, cash, bank, debt, health, capacity, version |
| `game_secrets` | user | **none** | RNG seed (server only) |
| `inventory` | user | SELECT own | Quantity and average cost per item |
| `market_prices` | user | **none** | Prices per game/day/city. Only the current day is generated |
| `transactions` | user | SELECT own | Append-only ledger with cash/bank/debt deltas |
| `events` | user | SELECT own | Event log. At most one `pending` event per game |
| `highscores` | user | SELECT all | Leaderboard (display name snapshot) |

Integrity rules:

- Child tables carry `user_id` with a **composite FK `(game_id, user_id) → games(id, user_id)`**, so a row can never be attached to someone else's game.
- There is at most one active game per user (partial unique index).
- CHECK constraints prevent negative cash, bank, debt or quantity.
- `create schema undergrunnen` has no `if not exists`, so it fails loudly instead of building on something unknown.
- Rollback is `drop schema undergrunnen cascade`. Nothing outside the schema is touched.

**Validated locally** in an in-memory Postgres (PGlite) with a stub `auth` schema:

- Buying, selling, capacity limits, inventory limits, the cross-user guard and the ledger all work.
- As `authenticated`, the user sees only their own games. They are denied on `market_prices`, on `UPDATE games` and on `trade()`.
- `anon` cannot use the schema at all.

---

## 5. RLS & security proposal

1. **RLS is enabled on every table, with SELECT-only policies.** There are no INSERT, UPDATE or DELETE policies and no write grants for `authenticated`. `anon` has no `USAGE` on the schema.
2. **Writes only go through `service_role`, which only Edge Functions hold.** The key is stored as a Supabase function secret and never reaches the frontend or the repo.
3. **plpgsql functions do the money movement.** They use `security invoker` and `search_path = ''`, and `EXECUTE` is granted to `service_role` only. Default privileges strip `EXECUTE` from `PUBLIC` for future functions in the schema.
4. **`user_id` always comes from the verified JWT** (`auth.getUser(token)` in the Edge Function), never from the request body.
5. **Concurrency.** The `games` row is locked with `FOR UPDATE`, and an optional `expected_version` rejects double-taps and stale tabs (`STALE_STATE`).
6. **Stable error codes** (`INSUFFICIENT_FUNDS`, `EVENT_PENDING`…) map to Norwegian UI messages.
7. **Rate limiting.** There is light per-user throttling in `ug-game-action`, and game actions are idempotent by `version`.

### Exposing the schema (requires your approval)

- **Option A (recommended):** add `undergrunnen` to *Exposed schemas* in the Data API settings, **keeping `public` and `graphql_public` as they are**. This lets supabase-js read the catalog and highscores directly under RLS, and lets Edge Functions call `rpc()` with `db: { schema: 'undergrunnen' }`. It is a standard and additive change.
- **Option B (zero shared-config change):** leave the schema unexposed. Edge Functions talk to Postgres directly through `SUPABASE_DB_URL` (postgres.js over the transaction pooler), and every read goes through Edge Functions. This is more code and connection handling, but nothing project-wide changes.

---

## 6. Authentication integration plan

- Use the **shared `auth.users`**. Undergrunnen never creates its own user table, and every owned row references `auth.users(id) on delete cascade`.
- The client uses supabase-js `createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)` with a persisted session. Login uses whatever providers are **already enabled** on the project. For mobile, **email OTP / magic link** is preferred if it is enabled. **I need you to confirm which providers are enabled.**
- Redirect URLs: `http://localhost:5173` and the Netlify domain(s) must be on the project's allow-list. **This is a shared setting and needs your approval.**
- Profiles: Undergrunnen will not depend on `public.profiles` unless you confirm it exists and is meant to be shared. If it is, we only *read* it. Otherwise the display name comes from `user_metadata` and is snapshotted into `highscores.display_name`.
- Edge Functions keep `verify_jwt = true` (the default).

---

## 7. Game engine architecture

Pure TypeScript in `supabase/functions/_shared/engine/`. Every function is deterministic, `(state, input, rng) → result`.

| Module | Responsibility |
|---|---|
| **rng** | Seeded PRNG (mulberry32), derived per `(seed, day, purpose)` so that results reproduce and cannot be rerolled by reloading |
| **Game Engine** | Orchestrates turns: validates an intent, runs the subsystems, and returns the new state plus a list of *effects* to commit |
| **Economy Engine** | Debt interest (daily compounding), bank interest, loan limits, net worth |
| **Market Generator** | Daily price per city and item from base, volatility, city modifiers and market shocks ("Kongekrabbe-krasj i Tromsø!"). Can mark items as unavailable |
| **Inventory System** | Capacity, average cost, upgrades (bigger bag or car) |
| **Travel System** | Routes and costs between cities. Travel advances the day and rolls the arrival event |
| **Event Engine** | Weighted event table (police, robbery, lucky find, contact offers). Pending events block trading until resolved |
| **Scoring System** | Final score = cash + bank − debt (+ an optional bonus for achievements) and the highscore entry |

### Edge Functions (`ug-*`)

| Function | Input | Does |
|---|---|---|
| `ug-start-game` | `{ startCity? }` | Abandons any active game, creates game and seed, generates the day-1 market, returns state |
| `ug-game-state` | — | Returns the active game, inventory, **current city's prices**, any pending event and contacts present |
| `ug-game-action` | `{ type: 'buy'\|'sell'\|'borrow'\|'repay'\|'deposit'\|'withdraw'\|'resolve_event', …, version }` | Validates and commits atomically (`trade()` for buy/sell) |
| `ug-advance-day` | `{ toCity, version }` | Travel plus a new day: interest, new market, event roll. On day 30 it finishes the game and writes the highscore. Committed through one `commit_turn()` RPC (next migration) |

---

## 8. Mobile-first experience

- **Shell:** a fixed top **status bar** (day X/30, cash, debt, bank, city) and a **bottom nav** (Marked · Reise · Lager · Økonomi · Mer). Screens slide horizontally, and actions open in bottom sheets.
- **Touch:** 44px minimum targets, buy/sell steppers with "Maks" shortcuts, haptics through `navigator.vibrate` where available, and `env(safe-area-inset-*)` padding.
- **Look:** a dark premium theme (near-black with a sodium-street-light amber accent), condensed display type with a clean sans-serif body, and city hero placeholders as gradient plates until the real imagery arrives. No pixel art.
- **Motion:** CSS transitions plus View Transitions API where supported, and `prefers-reduced-motion` is respected.
- **PWA:** `vite-plugin-pwa` (manifest, icons, app-shell caching only). Game data is always network, because the game is server-authoritative.
- **Desktop:** a centered column up to about 480px, with the map and a side panel layout at ≥1024px.

---

## 9. Phased roadmap

| Phase | Deliverable | Needs approval |
|---|---|---|
| **0 — Foundation** *(this)* | Audit, architecture, draft migration | Review |
| **1 — App shell** | Vite + React + TS + Tailwind v4 scaffold, AppShell/StatusBar/BottomNav, placeholder screens, PWA, `netlify.toml`, `.env.example` | git init + npm install |
| **2 — Engine (offline)** | Pure engine with vitest simulations. Playable **locally in memory** for fast balancing. Catalog content (cities, goods, contacts) designed together | Content direction |
| **3 — Server-authoritative loop** | Apply migration, seed catalog, `ug-*` functions, `commit_turn()`, auth login. End-to-end 30-day game | Apply SQL, expose schema, deploy functions, redirect URLs |
| **4 — Depth** | Events, contacts, bank and loan shark, upgrades, risk per city | — |
| **5 — Cinematic layer** | Interactive Norway map, city imagery, transitions, sound | Asset direction |
| **6 — Launch** | Highscores, balancing pass, accessibility, performance, Netlify production deploy | Domain / deploy |

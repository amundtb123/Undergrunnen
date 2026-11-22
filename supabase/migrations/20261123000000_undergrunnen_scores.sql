-- =====================================================================
-- UNDERGRUNNEN — anonymous, server-verified highscores
--
-- Target:   shared Supabase project bfynfdqpedqtgtqiczpb
-- Scope:    creates the schema `undergrunnen` and two tables in it.
--           Touches nothing outside the schema. No API exposure needed:
--           only the Edge Function `ug-scores` reads/writes, over a direct
--           database connection. anon/authenticated get no access at all.
-- Rollback: drop schema undergrunnen cascade;
-- =====================================================================

begin;

-- Fails loudly if the schema already exists.
create schema undergrunnen;

revoke all on schema undergrunnen from public, anon, authenticated;
alter default privileges in schema undergrunnen revoke all on tables from public, anon, authenticated;
alter default privileges in schema undergrunnen revoke execute on functions from public;

-- One row per started game. The server picks the seed, so a player cannot
-- shop around for a lucky market offline.
create table undergrunnen.runs (
  id           uuid primary key default gen_random_uuid(),
  seed         bigint not null check (seed between 0 and 4294967295),
  mode         text not null default 'clean' check (mode in ('clean', 'classic')),
  client_hash  text,              -- sha256 of IP + daily salt, for rate limiting only
  created_at   timestamptz not null default now(),
  submitted_at timestamptz
);
create index runs_client_created_idx on undergrunnen.runs (client_hash, created_at desc);

-- Written only after the Edge Function has replayed the run with the engine.
create table undergrunnen.scores (
  id          bigint generated always as identity primary key,
  run_id      uuid not null unique references undergrunnen.runs (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 20),
  score       bigint not null,
  status      text not null check (status in ('finished', 'dead')),
  days_played smallint not null,
  mode        text not null default 'clean' check (mode in ('clean', 'classic')),
  created_at  timestamptz not null default now()
);
create index scores_mode_score_idx on undergrunnen.scores (mode, score desc);

-- Defence in depth: RLS on, no policies. Even if the schema is ever exposed
-- in the Data API, clients see nothing.
alter table undergrunnen.runs   enable row level security;
alter table undergrunnen.scores enable row level security;

revoke all on all tables in schema undergrunnen from public, anon, authenticated;

commit;

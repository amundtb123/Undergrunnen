-- =====================================================================
-- UNDERGRUNNEN — initial schema
-- STATUS: DRAFT / PROPOSAL. DO NOT EXECUTE until explicitly approved.
--
-- Target:   shared Supabase project bfynfdqpedqtgtqiczpb
-- Scope:    creates objects ONLY inside the new schema `undergrunnen`.
--           References auth.users through foreign keys (read-only).
--           Does not alter public, auth, storage or any other schema.
-- Apply:    paste into the Supabase SQL editor (same convention as
--           ki-games). Do NOT use `supabase db push` against the shared
--           project; see docs/ARCHITECTURE.md §5.
-- Rollback: drop schema undergrunnen cascade;
--
-- Conventions
--   * Money is integer NOK (bigint). No floats for money.
--   * Clients only ever SELECT, and only through RLS. All writes happen
--     in Edge Functions (service_role) and the functions defined here.
--   * Hidden information (market prices, RNG seed) is never client-readable.
--
-- Not in this migration (later phases): travel/day-advance commit
-- function, bank/debt functions, event resolution, highscore submission,
-- catalog seed data.
-- =====================================================================

begin;

-- Fails loudly if the schema already exists, so we never build on top of
-- something we did not create.
create schema undergrunnen;

revoke all on schema undergrunnen from public;
grant usage on schema undergrunnen to authenticated, service_role;

-- New functions get EXECUTE for PUBLIC by default in Postgres. Turn that off
-- for everything created in this schema from now on.
alter default privileges in schema undergrunnen revoke execute on functions from public;

create function undergrunnen.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- CATALOG (read-only for authenticated players)
-- ---------------------------------------------------------------------

create table undergrunnen.cities (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  name        text not null,
  region      text not null,
  latitude    numeric(8,5) not null,
  longitude   numeric(8,5) not null,
  subtitle    text,
  tagline     text,
  risk_level  smallint not null default 1 check (risk_level between 1 and 5),  -- polititrykk
  market_size smallint not null default 2 check (market_size between 1 and 3),
  competition smallint not null default 2 check (competition between 1 and 3),
  demand      smallint not null default 2 check (demand between 1 and 3),
  has_bank    boolean  not null default false,  -- home base (Hamar): bank + lender
  sort_order  smallint not null default 0,
  is_active   boolean  not null default true
);

create table undergrunnen.items (
  id          text primary key check (id ~ '^[a-z0-9-]+$'),
  name        text not null,
  category    text not null check (category in ('mat', 'nytelse', 'mote', 'elektronikk', 'samleobjekt', 'luksus')),
  mode        text not null default 'clean' check (mode in ('clean', 'classic')),
  description text,
  base_price  integer not null check (base_price > 0),
  min_price   integer not null check (min_price > 0),
  max_price   integer not null,
  volatility  numeric(4,3) not null default 0.200 check (volatility between 0 and 1),
  size        smallint not null default 1 check (size > 0),  -- inventory slots per unit
  sort_order  smallint not null default 0,
  is_active   boolean  not null default true,
  check (min_price <= base_price and base_price <= max_price)
);

create table undergrunnen.contacts (
  id           text primary key check (id ~ '^[a-z0-9-]+$'),
  name         text not null,
  role         text not null check (role in ('lender', 'banker', 'supplier', 'informant', 'fixer')),
  home_city_id text references undergrunnen.cities (id),
  bio          text,
  is_active    boolean not null default true
);

-- ---------------------------------------------------------------------
-- PLAYER STATE (owned by auth.users)
-- ---------------------------------------------------------------------

create table undergrunnen.games (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  status      text not null default 'active' check (status in ('active', 'finished', 'dead', 'abandoned')),
  mode        text not null default 'clean' check (mode in ('clean', 'classic')),
  day         smallint not null default 1,
  max_days    smallint not null default 30 check (max_days between 1 and 365),
  city_id     text not null references undergrunnen.cities (id),
  cash        bigint not null check (cash >= 0),
  bank        bigint not null default 0 check (bank >= 0),
  debt        bigint not null default 0 check (debt >= 0),
  health      smallint not null default 100 check (health between 0 and 100),
  capacity    integer  not null default 100 check (capacity > 0),
  version     integer  not null default 0,  -- optimistic concurrency token
  final_score bigint,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  finished_at timestamptz,
  check (day between 1 and max_days),
  unique (id, user_id)  -- target for composite FKs below
);

create unique index games_one_active_per_user
  on undergrunnen.games (user_id) where status = 'active';
create index games_user_created_idx
  on undergrunnen.games (user_id, created_at desc);

create trigger games_touch_updated_at
  before update on undergrunnen.games
  for each row execute function undergrunnen.touch_updated_at();

-- Server-only secrets per game (deterministic RNG seed). Never client-readable,
-- otherwise a player could predict future prices and events.
create table undergrunnen.game_secrets (
  game_id  uuid primary key references undergrunnen.games (id) on delete cascade,
  rng_seed bigint not null
);

create table undergrunnen.inventory (
  game_id   uuid not null,
  user_id   uuid not null,
  item_id   text not null references undergrunnen.items (id),
  quantity  integer not null check (quantity >= 0),
  avg_cost  integer not null default 0 check (avg_cost >= 0),
  primary key (game_id, item_id),
  foreign key (game_id, user_id) references undergrunnen.games (id, user_id) on delete cascade
);
create index inventory_user_idx on undergrunnen.inventory (user_id);

-- Generated per game, per day, by the Market Generator. Only the current day
-- is ever generated. Server-only: the client receives the prices for its
-- current city through the game-state function.
create table undergrunnen.market_prices (
  game_id  uuid not null,
  user_id  uuid not null,
  day      smallint not null,
  city_id  text not null references undergrunnen.cities (id),
  item_id  text not null references undergrunnen.items (id),
  price    integer not null check (price > 0),
  primary key (game_id, day, city_id, item_id),
  foreign key (game_id, user_id) references undergrunnen.games (id, user_id) on delete cascade
);

-- Append-only financial ledger.
create table undergrunnen.transactions (
  id          bigint generated always as identity primary key,
  game_id     uuid not null,
  user_id     uuid not null,
  day         smallint not null,
  city_id     text not null references undergrunnen.cities (id),
  kind        text not null check (kind in ('buy', 'sell', 'borrow', 'repay', 'deposit', 'withdraw', 'interest', 'event')),
  item_id     text references undergrunnen.items (id),
  quantity    integer check (quantity > 0),
  unit_price  integer check (unit_price > 0),
  cash_delta  bigint not null default 0,
  bank_delta  bigint not null default 0,
  debt_delta  bigint not null default 0,
  cash_after  bigint not null,
  created_at  timestamptz not null default now(),
  foreign key (game_id, user_id) references undergrunnen.games (id, user_id) on delete cascade
);
create index transactions_game_idx on undergrunnen.transactions (game_id, id);
create index transactions_user_idx on undergrunnen.transactions (user_id);

create table undergrunnen.events (
  id          bigint generated always as identity primary key,
  game_id     uuid not null,
  user_id     uuid not null,
  day         smallint not null,
  city_id     text not null references undergrunnen.cities (id),
  kind        text not null,
  status      text not null default 'pending' check (status in ('pending', 'resolved', 'expired')),
  payload     jsonb not null default '{}'::jsonb,
  outcome     jsonb,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz,
  foreign key (game_id, user_id) references undergrunnen.games (id, user_id) on delete cascade
);
create unique index events_one_pending_per_game
  on undergrunnen.events (game_id) where status = 'pending';
create index events_user_idx on undergrunnen.events (user_id);

create table undergrunnen.highscores (
  id           bigint generated always as identity primary key,
  user_id      uuid not null,
  game_id      uuid not null unique,
  display_name text not null check (char_length(display_name) between 1 and 32),
  score        bigint not null,
  days_played  smallint not null,
  created_at   timestamptz not null default now(),
  foreign key (game_id, user_id) references undergrunnen.games (id, user_id) on delete cascade
);
create index highscores_score_idx on undergrunnen.highscores (score desc);
create index highscores_user_idx  on undergrunnen.highscores (user_id);

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- RLS on every table. Only SELECT policies exist. With no INSERT, UPDATE
-- or DELETE policy, and no write grants, clients cannot write anything.
-- ---------------------------------------------------------------------

alter table undergrunnen.cities        enable row level security;
alter table undergrunnen.items         enable row level security;
alter table undergrunnen.contacts      enable row level security;
alter table undergrunnen.games         enable row level security;
alter table undergrunnen.game_secrets  enable row level security;  -- no policies: server-only
alter table undergrunnen.inventory     enable row level security;
alter table undergrunnen.market_prices enable row level security;  -- no policies: server-only
alter table undergrunnen.transactions  enable row level security;
alter table undergrunnen.events        enable row level security;
alter table undergrunnen.highscores    enable row level security;

create policy cities_read   on undergrunnen.cities   for select to authenticated using (is_active);
create policy items_read    on undergrunnen.items    for select to authenticated using (is_active);
create policy contacts_read on undergrunnen.contacts for select to authenticated using (is_active);

create policy games_read_own        on undergrunnen.games        for select to authenticated using (user_id = (select auth.uid()));
create policy inventory_read_own    on undergrunnen.inventory    for select to authenticated using (user_id = (select auth.uid()));
create policy transactions_read_own on undergrunnen.transactions for select to authenticated using (user_id = (select auth.uid()));
create policy events_read_own       on undergrunnen.events       for select to authenticated using (user_id = (select auth.uid()));

create policy highscores_read_all on undergrunnen.highscores for select to authenticated using (true);

-- ---------------------------------------------------------------------
-- GRANTS (explicit allow-list; anon gets nothing)
-- ---------------------------------------------------------------------

revoke all on all tables in schema undergrunnen from public, anon, authenticated;

grant select on
  undergrunnen.cities,
  undergrunnen.items,
  undergrunnen.contacts,
  undergrunnen.games,
  undergrunnen.inventory,
  undergrunnen.transactions,
  undergrunnen.events,
  undergrunnen.highscores
to authenticated;

grant all on all tables    in schema undergrunnen to service_role;
grant all on all sequences in schema undergrunnen to service_role;

-- ---------------------------------------------------------------------
-- ATOMIC TRADE (buy / sell)
-- Called only by Edge Functions as service_role, which pass the user id
-- taken from the verified JWT, never from the request body. The whole
-- function runs in one transaction, and the game row is locked FOR UPDATE.
-- Errors are raised with stable codes that the Edge Function maps to
-- user-facing messages.
-- ---------------------------------------------------------------------

create function undergrunnen.trade(
  p_user_id          uuid,
  p_game_id          uuid,
  p_item_id          text,
  p_quantity         integer,
  p_side             text,
  p_expected_version integer default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  g       undergrunnen.games%rowtype;
  v_price integer;
  v_size  smallint;
  v_total bigint;
  v_used  bigint;
  v_held  integer;
begin
  if p_side not in ('buy', 'sell') then
    raise exception 'INVALID_SIDE' using errcode = '22023';
  end if;
  if p_quantity is null or p_quantity <= 0 or p_quantity > 100000 then
    raise exception 'INVALID_QUANTITY' using errcode = '22023';
  end if;

  select * into g
    from undergrunnen.games
   where id = p_game_id and user_id = p_user_id
     for update;
  if not found then
    raise exception 'GAME_NOT_FOUND' using errcode = 'P0002';
  end if;
  if g.status <> 'active' then
    raise exception 'GAME_NOT_ACTIVE' using errcode = 'P0001';
  end if;
  if p_expected_version is not null and g.version <> p_expected_version then
    raise exception 'STALE_STATE' using errcode = 'P0001';
  end if;
  if exists (select 1 from undergrunnen.events e
              where e.game_id = g.id and e.status = 'pending') then
    raise exception 'EVENT_PENDING' using errcode = 'P0001';
  end if;

  select mp.price into v_price
    from undergrunnen.market_prices mp
   where mp.game_id = g.id and mp.day = g.day
     and mp.city_id = g.city_id and mp.item_id = p_item_id;
  if not found then
    raise exception 'ITEM_NOT_AVAILABLE' using errcode = 'P0001';
  end if;

  select it.size into v_size from undergrunnen.items it where it.id = p_item_id;
  v_total := v_price::bigint * p_quantity;

  if p_side = 'buy' then
    if g.cash < v_total then
      raise exception 'INSUFFICIENT_FUNDS' using errcode = 'P0001';
    end if;

    select coalesce(sum(inv.quantity::bigint * it.size), 0) into v_used
      from undergrunnen.inventory inv
      join undergrunnen.items it on it.id = inv.item_id
     where inv.game_id = g.id;
    if v_used + p_quantity::bigint * v_size > g.capacity then
      raise exception 'INSUFFICIENT_CAPACITY' using errcode = 'P0001';
    end if;

    insert into undergrunnen.inventory as inv (game_id, user_id, item_id, quantity, avg_cost)
    values (g.id, g.user_id, p_item_id, p_quantity, v_price)
    on conflict (game_id, item_id) do update
      set avg_cost = ((inv.quantity::bigint * inv.avg_cost + v_total)
                      / (inv.quantity + p_quantity))::integer,
          quantity = inv.quantity + p_quantity;

    update undergrunnen.games
       set cash = cash - v_total, version = version + 1
     where id = g.id
    returning * into g;

    insert into undergrunnen.transactions
      (game_id, user_id, day, city_id, kind, item_id, quantity, unit_price, cash_delta, cash_after)
    values
      (g.id, g.user_id, g.day, g.city_id, 'buy', p_item_id, p_quantity, v_price, -v_total, g.cash);

  else
    select inv.quantity into v_held
      from undergrunnen.inventory inv
     where inv.game_id = g.id and inv.item_id = p_item_id
       for update;
    if coalesce(v_held, 0) < p_quantity then
      raise exception 'INSUFFICIENT_INVENTORY' using errcode = 'P0001';
    end if;

    if v_held = p_quantity then
      delete from undergrunnen.inventory
       where game_id = g.id and item_id = p_item_id;
    else
      update undergrunnen.inventory
         set quantity = quantity - p_quantity
       where game_id = g.id and item_id = p_item_id;
    end if;

    update undergrunnen.games
       set cash = cash + v_total, version = version + 1
     where id = g.id
    returning * into g;

    insert into undergrunnen.transactions
      (game_id, user_id, day, city_id, kind, item_id, quantity, unit_price, cash_delta, cash_after)
    values
      (g.id, g.user_id, g.day, g.city_id, 'sell', p_item_id, p_quantity, v_price, v_total, g.cash);
  end if;

  return jsonb_build_object(
    'game_id',    g.id,
    'side',       p_side,
    'item_id',    p_item_id,
    'quantity',   p_quantity,
    'unit_price', v_price,
    'total',      v_total,
    'cash',       g.cash,
    'version',    g.version
  );
end;
$$;

revoke execute on all functions in schema undergrunnen from public, anon, authenticated;
grant  execute on function undergrunnen.trade(uuid, uuid, text, integer, text, integer) to service_role;

commit;

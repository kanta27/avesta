-- =============================================================================
-- User accounts — storefront customer auth + profiles
-- Spec: feature request "login required before purchase + user/admin profiles"
--
-- Adds:
--   * public.profiles — one row per authenticated storefront customer, keyed by
--     auth.users.id (1:1). Holds the profile fields the account page edits and
--     checkout prefills from.
--   * orders.auth_user_id — links an order to the signed-in customer who placed
--     it, so the account page can list "my orders" without trusting phone alone.
--
-- RLS model (consistent with A3):
--   * profiles: a user may SELECT/UPDATE only their OWN row (auth.uid() = id).
--     There is NO public INSERT policy — the signup server action creates the
--     row with the service-role client (which bypasses RLS).
--   * orders stays deny-all to public; the new column is read server-side only.
--
-- Idempotent + non-destructive: creates the table if absent, drops-then-creates
-- each policy, and adds the column with `if not exists`.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  name             text,
  phone            text,
  email            text,
  default_address  jsonb,                          -- {line1,line2,city,state,pincode,country}
  consent_whatsapp boolean not null default false, -- DPDP: explicit opt-in only
  consent_at       timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- A signed-in user can read only their own profile row.
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles
  for select to authenticated
  using (auth.uid() = id);

-- A signed-in user can update only their own profile row (and can't reassign it).
drop policy if exists profiles_self_update on public.profiles;
create policy profiles_self_update on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Keep profiles.updated_at fresh (reuses the A2 helper).
drop trigger if exists trg_profiles_set_updated_at on public.profiles;
create trigger trg_profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- 2. orders.auth_user_id — link an order to the customer who placed it.
--    Nullable + ON DELETE SET NULL: deleting an auth user must never delete or
--    block their historical orders (fulfilment/accounting keep them).
-- -----------------------------------------------------------------------------
alter table public.orders
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;

create index if not exists idx_orders_auth_user_id
  on public.orders (auth_user_id);

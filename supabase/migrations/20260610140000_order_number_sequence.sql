-- =============================================================================
-- Feature 5 — atomic order-number generation
-- Spec: .claude/spec/phase-1/05-checkout-razorpay-webhook.md
--
-- `order_number` format is AV-YYYY-NNNNNN (conventions.md), generated server-side
-- and unique. A naive count(*)+1 races under concurrency and can collide on the
-- unique `orders.order_number`. Instead, a per-year counter row is bumped inside
-- a single atomic INSERT .. ON CONFLICT DO UPDATE, which row-locks the year and
-- hands back a gap-free sequence even when two checkouts create orders at once.
--
-- The function is the ONLY writer of the counter table and is called from the
-- create-order route via the service-role client. It is locked down the same way
-- as the other helper functions (SECURITY DEFINER + pinned empty search_path,
-- public EXECUTE revoked) — see 20260609093000_harden_helper_functions.sql.
--
-- Non-destructive: creates one new table + one function; no data changes.
-- =============================================================================

-- Per-year monotonic counter. One row per calendar year; `last_seq` is the last
-- sequence number handed out for that year.
create table if not exists public.order_number_counters (
  year     int primary key,
  last_seq int not null default 0
);

-- RLS on (deny-all baseline, matching A3). No policies → public roles cannot
-- touch it; the service role bypasses RLS, and the SECURITY DEFINER function
-- below is the intended access path regardless.
alter table public.order_number_counters enable row level security;

-- Atomically reserve and return the next order number for the current year.
-- search_path is pinned to '' so every object must be schema-qualified and the
-- function is immune to search_path injection (now()/lpad live in pg_catalog).
create or replace function public.next_order_number()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  y   int := extract(year from now())::int;
  seq int;
begin
  insert into public.order_number_counters (year, last_seq)
  values (y, 1)
  on conflict (year)
    do update set last_seq = public.order_number_counters.last_seq + 1
  returning last_seq into seq;

  return 'AV-' || y::text || '-' || lpad(seq::text, 6, '0');
end;
$$;

-- Only the service role (server-side create-order) may mint order numbers.
revoke execute on function public.next_order_number() from anon, authenticated, public;
grant  execute on function public.next_order_number() to service_role;

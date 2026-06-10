-- =============================================================================
-- Feature 8 — atomic discount redemption
-- Spec: .claude/spec/phase-1/08-discount-code-engine.md
--
-- At the created→paid transition we must, in ONE transaction, record a redemption
-- AND increment the code's used_count without ever over-redeeming under
-- concurrency. supabase-js / PostgREST cannot express a column-relative atomic
-- increment (`used_count = used_count + 1`), so this lives in a DB function called
-- via RPC — the same pattern as next_order_number (feature 5).
--
-- RACE SAFETY: the increment is a CONDITIONAL UPDATE guarded by the limit. It
-- row-locks the code, so two concurrent paids on a usage_limit=1 code serialize:
-- the first does 0→1 and commits; the second re-evaluates `used_count < usage_limit`
-- (now 1 < 1 = false), matches 0 rows, and the function returns false WITHOUT
-- inserting a redemption. Exactly one redemption can ever exist.
--
-- IDEMPOTENCY is provided by the single call site (the transition winner in
-- /confirm or the webhook) — this function is invoked exactly once per order — so
-- no dedupe column is required, matching the receipt's guarantee.
--
-- Hardened like the other helpers (20260609093000): SECURITY DEFINER, pinned empty
-- search_path, public EXECUTE revoked, granted only to service_role.
--
-- Non-destructive: creates one function; no table or data changes.
-- =============================================================================

-- Atomically redeem a code for a paid order. Returns true if a redemption was
-- recorded, false if the code is missing/unknown or already at its usage limit.
-- search_path is pinned to '' so every object is schema-qualified and the body is
-- immune to search_path injection.
create or replace function public.redeem_discount(
  p_code     text,
  p_order_id uuid,
  p_phone    text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_code_id uuid;
begin
  -- Atomic, race-safe increment: only succeeds while under the (optional) limit.
  -- A NULL usage_limit means unlimited. The RETURNING tells us whether we won the
  -- slot — NULL means no row matched (unknown code or limit reached).
  update public.discount_codes
     set used_count = coalesce(used_count, 0) + 1
   where code = p_code
     and (usage_limit is null or coalesce(used_count, 0) < usage_limit)
  returning id into v_code_id;

  if v_code_id is null then
    return false;
  end if;

  -- Same transaction as the increment above — the redemption row and the bumped
  -- counter commit together or not at all.
  insert into public.discount_redemptions (code_id, order_id, phone)
  values (v_code_id, p_order_id, p_phone);

  return true;
end;
$$;

-- Only the service role (server-side paid transition) may redeem.
revoke execute on function public.redeem_discount(text, uuid, text) from anon, authenticated, public;
grant  execute on function public.redeem_discount(text, uuid, text) to service_role;

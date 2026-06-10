-- =============================================================================
-- Feature 9 — seed the shared lead-capture WELCOME code
-- Spec: .claude/spec/phase-1/09-lead-capture-popup.md
--
-- The lead popup reveals ONE real shared code (not a per-lead code). It is a 10%
-- percent code with per_phone_limit = 1, so feature 8's EXISTING per-phone
-- enforcement at checkout makes it first-order-only with no new logic — a phone
-- that already redeemed WELCOME10 is rejected on its second attempt.
--
-- min_order_paise = 49900 (₹499) — a sensible floor so the welcome discount
-- applies to a real first order, not a single-unit add-on.
--
-- No schema change — discount_codes already exists (A2). Stored UPPERCASE to
-- match normalizeCode() (trim + uppercase) used on lookup.
--
-- Idempotent: re-running is a no-op (unique `code`). Money is integer paise.
-- Rollback: delete from discount_codes where code = 'WELCOME10';
-- =============================================================================

insert into discount_codes
  (code, kind, value_pct, value_paise, min_order_paise, usage_limit, used_count, per_phone_limit, starts_at, expires_at, is_active)
values
  ('WELCOME10', 'percent', 10, null, 49900, null, 0, 1, null, null, true)
on conflict (code) do nothing;

-- Rollback:
-- delete from discount_codes where code = 'WELCOME10';

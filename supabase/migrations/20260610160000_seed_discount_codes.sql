-- =============================================================================
-- Feature 8 — seed test discount codes
-- Spec: .claude/spec/phase-1/08-discount-code-engine.md
--
-- The admin UI to manage codes is feature 12 (not built yet), so we seed a set of
-- codes that exercises EVERY validation path in lib/discounts.ts. No schema change
-- — discount_codes already exists (A2). Codes are stored UPPERCASE to match
-- normalizeCode() (trim + uppercase) used on lookup.
--
-- Money is integer paise. Validity-window codes use absolute timestamps (today is
-- 2026-06-10): EXPIRED20 expired in the past, SOON20 starts in the future.
--
-- Idempotent: re-running is a no-op (on conflict on the unique code).
-- Rollback: delete from discount_codes where code in (<the codes below>); -- see bottom.
-- =============================================================================

insert into discount_codes
  (code, kind, value_pct, value_paise, min_order_paise, usage_limit, used_count, per_phone_limit, starts_at, expires_at, is_active)
values
  -- Valid percent — 10% off, no limits.
  ('SAVE10',    'percent',       10,   null,        0,    null, 0, null, null,                       null,                       true),

  -- Valid flat — ₹200 off.
  ('FLAT200',   'flat',          null, 20000,       0,    null, 0, null, null,                       null,                       true),

  -- Valid free shipping — zeroes shipping (no line discount).
  ('FREESHIP',  'free_shipping', null, null,        0,    null, 0, null, null,                       null,                       true),

  -- Inactive — valid in every other respect but is_active = false.
  ('INACTIVE10','percent',       10,   null,        0,    null, 0, null, null,                       null,                       false),

  -- Expired — 20% but expires_at is in the past.
  ('EXPIRED20', 'percent',       20,   null,        0,    null, 0, null, null,                       '2025-01-01T00:00:00Z',     true),

  -- Not yet active — 20% but starts_at is in the future.
  ('SOON20',    'percent',       20,   null,        0,    null, 0, null, '2027-01-01T00:00:00Z',     null,                       true),

  -- Usage limit reached — flat ₹150, limit 5, already used 5 times.
  ('MAXEDOUT',  'flat',          null, 15000,       0,    5,    5, null, null,                       null,                       true),

  -- Below min order — 15% but requires a ₹5,000 (500000 paise) subtotal.
  ('BIGORDER',  'percent',       15,   null,        500000, null, 0, null, null,                     null,                       true),

  -- Per-phone limit — flat ₹100, one redemption per phone (test drives a paid
  -- order then retries with the same phone).
  ('ONCEPER',   'flat',          null, 10000,       0,    null, 0, 1,    null,                       null,                       true),

  -- Concurrency proof — flat ₹100, GLOBAL usage_limit 1, unused. Two concurrent
  -- paids on this must yield used_count = 1 and exactly one redemption.
  ('LIMIT1',    'flat',          null, 10000,       0,    1,    0, null, null,                       null,                       true),

  -- Overflow — flat ₹1,00,000 (10000000 paise), far above any test cart, to prove
  -- the discount is capped at subtotal and the total never goes negative.
  ('OVERFLOW',  'flat',          null, 10000000,    0,    null, 0, null, null,                       null,                       true)
on conflict (code) do nothing;

-- Rollback:
-- delete from discount_codes where code in
--   ('SAVE10','FLAT200','FREESHIP','INACTIVE10','EXPIRED20','SOON20','MAXEDOUT','BIGORDER','ONCEPER','LIMIT1','OVERFLOW');

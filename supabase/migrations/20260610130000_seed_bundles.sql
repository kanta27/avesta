-- Seed: 4 placeholder concern-based bundles (Phase 1, feature 3 — Bundles / Packs)
-- Each bundle is a drink + gummy "stack" that cross-sells the two categories.
--
-- Modeling (matches the A2 `bundles` table):
--   * Members are referenced by `product_ids uuid[]` — resolved here from the
--     EXISTING seeded products by slug subquery, so no generated UUID is
--     hardcoded (and re-running stays stable).
--   * `compare_at_paise` is the "sum of parts" reference for the strike-through;
--     there is no separate savings column — saving = compare_at_paise - price_paise.
--   * Each member is priced at its 30-day (is_default) pack tier; compare_at is
--     the sum of those two tier prices. Documented per-bundle below.
--   * All money is integer paise. concern uses the storefront concern keys.
--   * is_active = true so the public `bundles_public_read` RLS policy exposes them.
--
-- Idempotent: re-running is a no-op (on conflict on the unique slug).
-- Rollback: delete from bundles where slug in (<the 4 slugs below>);  -- see bottom.

insert into bundles (slug, name, concern, product_ids, price_paise, compare_at_paise, is_active)
values
  -- Daily Energy Stack — Energy Electrolyte (30d 120000) + Daily Multivitamin Gummy (30d 75000)
  -- compare_at 195000 → price 174900 (saving 20100)
  (
    'daily-energy-stack',
    'Daily Energy Stack',
    'energy',
    array[
      (select id from products where slug = 'energy-electrolyte'),
      (select id from products where slug = 'daily-multivitamin-gummy')
    ],
    174900,
    195000,
    true
  ),
  -- Immunity Duo — Immunity Hydration (30d 114000) + Immunity Gummy (30d 81000)
  -- compare_at 195000 → price 169900 (saving 25100)
  (
    'immunity-duo',
    'Immunity Duo',
    'immunity',
    array[
      (select id from products where slug = 'immunity-hydration'),
      (select id from products where slug = 'immunity-gummy')
    ],
    169900,
    195000,
    true
  ),
  -- Rest & Restore Stack — Daily Electrolyte (30d 108000) + Sleep Gummy (30d 96000)
  -- compare_at 204000 → price 179900 (saving 24100)
  (
    'rest-and-restore-stack',
    'Rest & Restore Stack',
    'sleep',
    array[
      (select id from products where slug = 'daily-electrolyte'),
      (select id from products where slug = 'sleep-gummy')
    ],
    179900,
    204000,
    true
  ),
  -- Glow Hydration Stack — Daily Electrolyte (30d 108000) + Hair & Skin Gummy (30d 90000)
  -- compare_at 198000 → price 174900 (saving 23100)
  (
    'glow-hydration-stack',
    'Glow Hydration Stack',
    'hair-skin',
    array[
      (select id from products where slug = 'daily-electrolyte'),
      (select id from products where slug = 'hair-skin-gummy')
    ],
    174900,
    198000,
    true
  )
on conflict (slug) do nothing;

-- Rollback (run manually if needed):
-- delete from bundles where slug in (
--   'daily-energy-stack','immunity-duo','rest-and-restore-stack','glow-hydration-stack'
-- );

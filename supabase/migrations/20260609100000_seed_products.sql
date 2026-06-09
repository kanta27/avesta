-- Seed: 7 placeholder catalog SKUs (Phase 1, feature 1 — product catalog & Shop)
-- 3 hydration drinks + 4 gummies, covering all 6 storefront concerns
-- (hydration, energy, immunity, sleep, hair-skin, daily-nutrition).
--
-- Placeholder names/prices only — real SKUs are swapped in later via admin.
-- All money is integer paise. Each product carries 15/30/90-day pack_tiers
-- with the 30-day tier marked is_default (per spec AOV strategy). is_active=true.
-- Copy is structure/function only (no cures/treats language).
--
-- Idempotent: re-running is a no-op (on conflict on the unique slug).
-- Rollback: delete from products where slug in (<the 7 slugs below>);  -- see bottom.

insert into products (slug, name, type, concerns, tagline, rating_avg, rating_source, pack_tiers, is_active)
values
  (
    'daily-electrolyte',
    'Daily Electrolyte',
    'hydration',
    array['hydration'],
    'Na⁺ K⁺ Mg²⁺ · supports daily hydration',
    4.6, 'amazon',
    '[
      {"key":"15","label":"15-day","units":15,"price_paise":60000,"discount_pct":0,"per_day_paise":4000,"is_default":false},
      {"key":"30","label":"30-day","units":30,"price_paise":108000,"discount_pct":10,"per_day_paise":3600,"is_default":true},
      {"key":"90","label":"90-day","units":90,"price_paise":306000,"discount_pct":15,"per_day_paise":3400,"is_default":false}
    ]'::jsonb,
    true
  ),
  (
    'energy-electrolyte',
    'Energy Electrolyte',
    'hydration',
    array['hydration','energy'],
    'B-complex + electrolytes · supports energy metabolism',
    4.4, 'tata1mg',
    '[
      {"key":"15","label":"15-day","units":15,"price_paise":66000,"discount_pct":0,"per_day_paise":4400,"is_default":false},
      {"key":"30","label":"30-day","units":30,"price_paise":120000,"discount_pct":9,"per_day_paise":4000,"is_default":true},
      {"key":"90","label":"90-day","units":90,"price_paise":333000,"discount_pct":16,"per_day_paise":3700,"is_default":false}
    ]'::jsonb,
    true
  ),
  (
    'immunity-hydration',
    'Immunity Hydration',
    'hydration',
    array['hydration','immunity'],
    'Vitamin C + zinc · helps maintain immunity',
    4.5, 'amazon',
    '[
      {"key":"15","label":"15-day","units":15,"price_paise":63000,"discount_pct":0,"per_day_paise":4200,"is_default":false},
      {"key":"30","label":"30-day","units":30,"price_paise":114000,"discount_pct":10,"per_day_paise":3800,"is_default":true},
      {"key":"90","label":"90-day","units":90,"price_paise":324000,"discount_pct":14,"per_day_paise":3600,"is_default":false}
    ]'::jsonb,
    true
  ),
  (
    'immunity-gummy',
    'Immunity Gummy',
    'gummy',
    array['immunity'],
    'Vit C + D3 + zinc · helps maintain immune function',
    4.7, 'amazon',
    '[
      {"key":"15","label":"15-day","units":15,"price_paise":45000,"discount_pct":0,"per_day_paise":3000,"is_default":false},
      {"key":"30","label":"30-day","units":30,"price_paise":81000,"discount_pct":10,"per_day_paise":2700,"is_default":true},
      {"key":"90","label":"90-day","units":90,"price_paise":225000,"discount_pct":17,"per_day_paise":2500,"is_default":false}
    ]'::jsonb,
    true
  ),
  (
    'sleep-gummy',
    'Sleep Gummy',
    'gummy',
    array['sleep'],
    'Magnesium + L-theanine · supports restful sleep',
    4.3, 'tata1mg',
    '[
      {"key":"15","label":"15-day","units":15,"price_paise":54000,"discount_pct":0,"per_day_paise":3600,"is_default":false},
      {"key":"30","label":"30-day","units":30,"price_paise":96000,"discount_pct":11,"per_day_paise":3200,"is_default":true},
      {"key":"90","label":"90-day","units":90,"price_paise":270000,"discount_pct":17,"per_day_paise":3000,"is_default":false}
    ]'::jsonb,
    true
  ),
  (
    'hair-skin-gummy',
    'Hair & Skin Gummy',
    'gummy',
    array['hair-skin'],
    'Biotin + amla bioactives · supports hair & skin',
    4.5, 'amazon',
    '[
      {"key":"15","label":"15-day","units":15,"price_paise":49500,"discount_pct":0,"per_day_paise":3300,"is_default":false},
      {"key":"30","label":"30-day","units":30,"price_paise":90000,"discount_pct":9,"per_day_paise":3000,"is_default":true},
      {"key":"90","label":"90-day","units":90,"price_paise":252000,"discount_pct":15,"per_day_paise":2800,"is_default":false}
    ]'::jsonb,
    true
  ),
  (
    'daily-multivitamin-gummy',
    'Daily Multivitamin Gummy',
    'gummy',
    array['daily-nutrition'],
    '12 vitamins + minerals · supports daily nutrition',
    4.4, 'tata1mg',
    '[
      {"key":"15","label":"15-day","units":15,"price_paise":42000,"discount_pct":0,"per_day_paise":2800,"is_default":false},
      {"key":"30","label":"30-day","units":30,"price_paise":75000,"discount_pct":11,"per_day_paise":2500,"is_default":true},
      {"key":"90","label":"90-day","units":90,"price_paise":216000,"discount_pct":14,"per_day_paise":2400,"is_default":false}
    ]'::jsonb,
    true
  )
on conflict (slug) do nothing;

-- Rollback (run manually if needed):
-- delete from products where slug in (
--   'daily-electrolyte','energy-electrolyte','immunity-hydration',
--   'immunity-gummy','sleep-gummy','hair-skin-gummy','daily-multivitamin-gummy'
-- );

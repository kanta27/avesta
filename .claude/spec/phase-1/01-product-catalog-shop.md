# 1 — Product catalog & Shop

**Phase:** 1 · **Depends on:** A1, A2, A3 · **Status:** To build

## Purpose
Browse all 7 SKUs with concern-first navigation (converts better in health).

## Build
- `/shop` page (server component).
- `ProductCard` component (reused on home + bundles).
- Filter controls (client component over the fetched list).

## Data
Reads `products` where `is_active = true` (anon key under RLS). Uses `concerns[]`, `type`, `name`, `tagline`/sci-line, `rating_avg` + `rating_source`, `pack_tiers`, `images`.

## API
None — server component reads via the typed Supabase client. No public write.

## UI
- Filter by **concern**: Hydration, Energy, Immunity, Sleep, Hair & Skin, Daily Nutrition.
- Filter by **type**: Hydration / Gummies.
- Each card shows: name, sci-line, rating + source tag, **pack selector (30-day pre-selected)**, ₹ price + ₹/day, Add-to-cart.

## Tech notes
- Dataset is tiny (7 items) — fetch once server-side, filter client-side.
- Pre-select the monthly (`30`) tier; if absent, fall back to the `is_default` tier.
- ₹/day comes from the selected tier's `per_day_paise`.
- Add-to-cart pushes a minimal item ref into the cart store (feature 4).

## Acceptance
- All active SKUs render; concern and type filters work (and combine).
- Per-day price is computed from the active tier and updates when the pack changes.

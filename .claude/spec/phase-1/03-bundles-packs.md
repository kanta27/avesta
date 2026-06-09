# 3 — Bundles / Packs page

**Phase:** 1 · **Depends on:** A1, A2, A3, feature 4 (cart) · **Status:** To build

## Purpose
Cross-sell the two categories (e.g. "Daily Energy Stack").

## Build
- `/bundles` page.
- `BundleCard` component.

## Data
Reads `bundles` where `is_active = true`; resolves `product_ids` to product names/images for display.

## API
Read only.

## UI
Combo cards showing included products, **bundle price vs `compare_at_paise`** (strike-through saving), and add-to-cart.

## Tech notes
- Adding a bundle expands to its member items in the cart but prices the **bundle total** (not the sum of individual pack prices). Represent the bundle as a single priced line referencing its `bundle_id`, or as member items flagged with the bundle id — re-priced from DB at checkout either way.
- Decide and document the pack tier used for each member product inside a bundle (store on the bundle if it varies).

## Acceptance
- A bundle adds all member items to the cart at the bundle price.
- `compare_at` saving displays correctly; checkout re-prices the bundle from the DB.

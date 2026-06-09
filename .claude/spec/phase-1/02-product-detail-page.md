# 2 — Product Detail Page (PDP)

**Phase:** 1 · **Depends on:** A1, A2, A3, feature 4 (cart), feature 14 (schema) · **Status:** To build

## Purpose
The conversion page. Communicate "buying from scientists."

## Build
`/product/[slug]` and components:
`Gallery`, `PackSelector`, `IngredientsTable`, `BioactivesTable`, `ScienceTab`, `BadgesRow`, `FAQAccordion`, `WhoForNotFor`, `ReviewsBlock`, `StickyMobileCTA`.

## Data
One `products` row by `slug` + related `reviews` where `is_approved = true` and (`product_id = this` or general). Uses `ingredients`, `bioactives`, `science_html`, `faqs`, `badges`, `who_for`, `who_not_for`, `pack_tiers`, `images`, `rating_avg`.

## API
Read only. "Add to cart" is client state (feature 4).

## UI
- Image **gallery**; benefits.
- **Ingredients table** (name/amount/unit) and **bioactive breakdown** (name/role/evidence link).
- Dosage; **"The Science" tab** — mechanism in plain language + linked studies, rendered from `science_html`.
- **Badges row** (FSSAI / clinical / GMP / secure) near the buy button.
- **FAQ accordion**; **who this is for / not for**.
- **Pack selector** (15/30/90) showing ₹ and ₹/day per tier.
- Reviews block.
- **Sticky add-to-cart on mobile** (`StickyMobileCTA`).

## Tech notes
- Emit `Product` + `FAQPage` JSON-LD here (feature 14).
- Switching pack updates price, ₹/day, **and** what gets added to cart (pass `pack_key`).
- Restrained motion; animated counters for trust stats only.
- `science_html` is trusted admin content — sanitize on render if authors are non-trusted; otherwise render as-is.

## Acceptance
- Changing the pack updates price, ₹/day, and the cart payload.
- `Product` + `FAQPage` schema validate in Google's Rich Results test.
- Approved reviews for the product render; sticky CTA appears on mobile.

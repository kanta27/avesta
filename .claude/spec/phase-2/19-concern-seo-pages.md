# 19 — Concern-based SEO landing pages

**Phase:** 2 · **Depends on:** A2, A3, feature 14 (SEO) · **Status:** To build

## Purpose
The ads/SEO backbone — editable landing pages per health concern.

## Build
`/health-concern/[slug]` rendered from `concern_pages`.

## Data
`concern_pages` (`h1`, `intro_md`, `faqs`, `product_ids`, `seo_title`, `seo_description`); resolves `product_ids` to a product grid.

## UI
H1, intro, FAQs, matched product grid. **MedicalWebPage** + **FAQPage** JSON-LD.

## Tech notes
- Content is admin-editable (add a Concern Pages module to admin, or seed via migration initially).
- Keep claims compliant (structure/function only); these pages are ad landing targets, so copy will be scrutinized.

## Acceptance
- Each concern page renders editable content + product grid.
- MedicalWebPage + FAQ schema validate in Rich Results.

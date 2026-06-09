# 14 — SEO baseline + structured data

**Phase:** 1 · **Depends on:** A1, feature 2 (PDP) · **Status:** To build

## Purpose
Make the store indexable and rich-result eligible from day one.

## Build
- Per-route `metadata` (title, description, canonical, OG/Twitter).
- `app/sitemap.ts` (all public URLs) and `app/robots.ts`.
- OG images.
- JSON-LD:
  - **Product** + **FAQPage** on PDP (feature 2).
  - **Organization** site-wide.
  - **Article** on blog (Phase 2, feature 16).
  - **MedicalWebPage** on concern pages (Phase 2, feature 19).

## Data
Pulls from `products`, `bundles`, `blog_posts`, `concern_pages` to build the sitemap and metadata.

## Tech notes
- Use Next's Metadata API; generate dynamic metadata per PDP/blog/concern route.
- Keep structured-data claims compliant — structure/function language only.
- Sitemap should include only public, indexable URLs (exclude `/admin`, `/checkout`, `/order/*`).

## Acceptance
- Sitemap lists all public URLs; `robots.txt` is correct.
- PDP passes Google's Rich Results test (Product + FAQPage).
- OG previews render correctly (title, description, image).

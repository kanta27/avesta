# A1 — Project scaffold & component port

**Phase:** Foundation · **Depends on:** none (build first) · **Status:** To build

## Purpose
Stand up the Next.js app and turn the homepage demo (`avesthagen_d2c_homepage.html`) into reusable, typed components. This is the visual foundation every later feature renders into.

## Build
- `create-next-app` with **TypeScript, App Router, Tailwind, ESLint**.
- Folder layout:
  ```
  /app
    /(store)        → public site (home, shop, product, cart, checkout, etc.)
    /(content)      → blog, science, concern pages, policies
    /admin          → self-managed CMS (protected)
    /api            → route handlers (checkout, webhooks, leads, automation)
  /components        → ui/, store/, admin/
  /lib               → supabase, payments, whatsapp, seo, analytics, validation
  /content           → MDX/static where useful
  /styles            → tokens
  ```
- **Port the homepage:** extract design tokens (colors, fonts, radii) into `tailwind.config.ts` + CSS variables in `/styles`; split the demo's sections into components:
  `Nav`, `AnnouncementBar`, `Hero`, `TrustStrip`, `ConcernGrid`, `ProductCard`, `SciencePipeline`, `Reviews`, `ResearchCards`, `QuizBand`, `BlogTeasers`, `Footer`, `LeadPopup`, `WhatsAppFab`.
- Shared `app/(store)/layout.tsx` mounting Nav + Footer + popup.

## Data
None.

## API
None.

## UI
Homepage rebuilt from components, pixel-close to the demo. Preserve: sticky blurred nav, hero with helix SVG + floating product cards + animated counters, infinite trust marquee, scroll-reveal (`IntersectionObserver`), responsive breakpoints at 960px and 560px.

## Tech notes
- Use the lime/teal tokens from the demo (see [`../conventions.md`](../conventions.md) token table). Map them to Tailwind theme + CSS vars so both `bg-ink` utilities and `var(--ink)` work.
- Fonts via `next/font` (Schibsted Grotesk, Instrument Sans, IBM Plex Mono).
- Keep the popup trigger logic (8s / 45% scroll / exit-intent / 2nd page-view) in a client component; wire it to the leads API in **feature 9** (stub the POST for now).
- Counters and marquee are client components; everything else can be server components.

## Deps / env
- `next`, `react`, `tailwindcss`, `eslint`, `@types/*`. Env not required yet (added in A4).

## Acceptance
- Homepage renders entirely from components, pixel-close to the demo, fully responsive.
- Lighthouse **accessibility ≥ 95**.
- `tsc --noEmit` and ESLint clean; dev server runs.

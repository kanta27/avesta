# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A D2C marketing site for **Avesta Nordic** (a consumer health/supplements brand by Avesthagen — hydration drinks and nutrient gummies, Indian market). It is being built out from a static design demo into a full Next.js commerce app, one spec at a time.

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind v4 · Supabase (Postgres + Auth + Storage) · Razorpay behind a payment abstraction · WhatsApp via Interakt/AiSensy · hosting on Vercel. Build specs live under `.claude/spec/` — **read the relevant spec before building**, and read `.claude/spec/conventions.md` for the guardrails and Definition of Done that apply to every feature.

The original static demo (`avesthagen_d2c_homepage.html`) is kept as the **visual source of truth**; it was ported to React components in Foundation **A1**.

The database schema lives in `supabase/migrations/` (applied to Supabase in Foundation **A2**) and the generated TypeScript types + typed clients (browser/server/service-role) live in `lib/supabase/` — regenerate types with `npm run db:types` after any migration.

## Running / previewing

```
npm run dev      # dev server at http://localhost:3000
npm run build    # production build
npm run lint     # ESLint
npx tsc --noEmit # typecheck
```

## Architecture

```
app/
  layout.tsx          root layout — <html>, next/font, <body>
  globals.css         Tailwind v4 + @theme token map + ported component CSS + breakpoints
  (store)/            public storefront route group (no URL segment)
    layout.tsx        storefront chrome: AnnouncementBar + Nav + <main> + Footer + WhatsAppFab + LeadPopup
    page.tsx          homepage — composes the sections (holds sample product data for now)
  (content)/          blog / science / concern pages / policies (to build)
  admin/              protected self-managed CMS (to build)
  api/                route handlers — checkout, webhooks, leads, automation (to build)
components/
  ui/                 Button, SectionHead, Reveal
  store/              AnnouncementBar, Nav, Hero, Counter, TrustStrip, ConcernGrid,
                      Products, ProductCard, PackSelector, SciencePipeline, Reviews,
                      ResearchCards, QuizBand, LeadTriggerButton, BlogTeasers, Footer,
                      WhatsAppFab, LeadPopup
  admin/              (to build)
lib/                  supabase, payments, whatsapp, seo, analytics, validation (scaffolded)
styles/               tokens.css — brand CSS variables (source of truth)
content/              MDX / static content (as useful)
assets/               raw brand assets (see Asset layout below; not yet wired into the app)
avesthagen_d2c_homepage.html   original static demo — visual source of truth
```

- **Route groups** add no URL segment, so `app/(store)/page.tsx` serves `/`. The root `app/layout.tsx` owns `<html>`/fonts/`<body>`; `app/(store)/layout.tsx` nests inside it and mounts the shared storefront chrome.
- **Design tokens** — brand CSS variables (`--ink`/`--ink-2`/`--paper`/`--paper-2`/`--lime`/`--lime-deep`/`--amber`/`--grey`/`--line`/`--radius`) live in `styles/tokens.css` and are mapped into Tailwind via `@theme inline` in `app/globals.css`, so both `bg-ink`-style utilities and raw `var(--ink)` resolve to the same token (`--radius` → `rounded-card`). Reuse the tokens rather than hardcoding values. Tailwind v4 is **CSS-first — there is no `tailwind.config.ts`**. Fonts (Schibsted Grotesk display / Instrument Sans body / IBM Plex Mono mono) load via `next/font` as `--font-d`/`--font-b`/`--font-m`. Responsive breakpoints (`960px`, `560px`) and a `prefers-reduced-motion` block live at the bottom of `globals.css`.
- **Components** are server components by default. Client islands — marked `"use client"` — are `Counter` (animated stats), `Reveal` (scroll-in), `PackSelector` (pack pills), `LeadPopup`, and `LeadTriggerButton`. Reusable primitives go in `components/ui/`; reuse `Button`/`SectionHead` rather than re-styling. The lead popup is opened from elsewhere by dispatching the `openLeadPopup` window event (see `LeadTriggerButton`).
- **`lib/`** subfolders (`supabase`, `payments`, `whatsapp`, `seo`, `analytics`, `validation`) are scaffolded and filled in per feature. Per `conventions.md`: the Razorpay SDK is only imported inside `lib/payments/`, and the Supabase service-role key is server-only.

## Important: demo vs. production

- Interactive flows are **mocked/stubbed**. The lead popup's submit (`components/store/LeadPopup.tsx`) only sets local state with a `TODO` — production stores the lead in a Supabase `leads` table with a consent flag (feature 9). Cart, add-to-cart buttons, and checkout are non-functional placeholders. The WhatsApp FAB uses a placeholder number.
- Product visuals are **emoji + CSS-gradient placeholders** (e.g. `🥤`, `🍬`), not real images. The repo's real assets live under `assets/` (see layout below) and are **not yet wired into the page** — wiring them in is likely future work.
- The product names shown on the homepage (HydraSci™, VitaGum™) are placeholder/branding examples and differ from the real product names in the assets (Gojimax, Hibix, Amlapure, Xanomax, Teestar). Confirm intended naming before changing copy.

## Asset layout

Static assets are organized under `assets/`:
- `assets/images/products/<product>/` — per-product photos, named `<product>-front`, `<product>-back`, `<product>-1`, etc. Products: `amlapure`, `gojimax`, `hibix`, `teestar` (teestar has `-litchi-*` and `-tamarind-*` flavor variants).
- `assets/images/misc/` — non-product images (e.g. screenshots).
- `assets/pdfs/` — product one-pagers: `amlapure.pdf`, `gojimax.pdf`, `hibix.pdf`, `xanomax.pdf`.

Note the asset coverage is uneven: `xanomax` has a PDF but no images; `teestar` has images but no PDF. Filenames are lowercase kebab-case — keep that convention when adding assets.

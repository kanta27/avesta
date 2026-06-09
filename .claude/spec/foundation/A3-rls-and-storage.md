# A3 — Row-Level Security & storage

**Phase:** Foundation · **Depends on:** A2 · **Status:** To build

## Purpose
Lock down data access so the public site can only read what it should, and all writes go through trusted server code.

## Build
**RLS on every table.** Enable RLS and add policies:

- **Public read (anon key)** — limited to safe rows only:
  - `products` where `is_active = true`
  - `bundles` where `is_active = true`
  - `blog_posts` where `status = 'published'`
  - `concern_pages` (all — they're public SEO pages)
  - `gallery_images` (all)
  - `reviews` where `is_approved = true`
- **No public read** on: `orders`, `customers`, `leads`, `discount_codes`, `discount_redemptions`, `carts`, `pageviews`. (Track-order lookups in feature 7 go through a **server route**, not anon select.)
- **Writes** — `orders`, `leads`, `pageviews`, `carts`, all admin mutations — performed **server-side only** with the **service-role** key in route handlers / server actions. No anon insert/update/delete policies.

**Storage buckets** (public read): `products`, `gallery`, `blog`. Admin uploads via **signed URLs** generated server-side.

## Data
Policies on all A2 tables; storage buckets as above.

## Tech notes
- Service-role key lives in server env only (`SUPABASE_SERVICE_ROLE_KEY`); the browser never sees it. Anon key may be public (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Two Supabase clients in `/lib/supabase`: a browser/anon client (RLS-bound, read-only paths) and a server admin client (service role, used only inside `/app/api` and server actions).
- Service role **bypasses RLS** — every server write path must do its own authz (e.g. admin gate in A6, phone+order match in feature 7).

## Deps / env
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (see A4).

## Acceptance
- With only the anon key, selecting `orders`/`leads`/`discount_codes` returns nothing (RLS denies).
- Anon can read active products, published posts, approved reviews, concern pages, gallery.
- Anon cannot insert/update/delete any table.
- Storage buckets are publicly readable; uploads require a signed URL issued by server code.

-- =============================================================================
-- A3 — Row-Level Security & storage
-- Spec: .claude/spec/foundation/A3-rls-and-storage.md
--
-- Model:
--   * RLS is enabled on every public table (deny-all by default).
--   * The ONLY public grants are SELECT policies for the anon / authenticated
--     roles, limited to "safe" rows (active / published / approved / public SEO).
--   * There are NO insert/update/delete policies for public roles anywhere.
--     All writes go through server code using the service-role key, which
--     bypasses RLS entirely (and must do its own authz — see A6 / feature 7).
--   * Storage: three public-read buckets; uploads happen via service-role
--     signed URLs only, so no public write policy on storage.objects.
--
-- Idempotent: re-asserts `enable row level security` (already on from a prior
-- step) and drops-then-creates each policy so the migration can re-run cleanly.
-- Non-destructive: touches no data, no schema columns.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. Ensure RLS is enabled on every table (deny-all baseline).
--    Tables with NO policy below stay fully locked to public roles:
--    orders, customers, leads, discount_codes, discount_redemptions,
--    carts, pageviews.
-- -----------------------------------------------------------------------------
alter table products             enable row level security;
alter table bundles              enable row level security;
alter table customers            enable row level security;
alter table orders               enable row level security;
alter table leads                enable row level security;
alter table discount_codes       enable row level security;
alter table discount_redemptions enable row level security;
alter table reviews              enable row level security;
alter table blog_posts           enable row level security;
alter table concern_pages        enable row level security;
alter table gallery_images       enable row level security;
alter table carts                enable row level security;
alter table pageviews            enable row level security;

-- -----------------------------------------------------------------------------
-- 2. Public read policies (anon + authenticated) — safe rows only.
--    `to anon, authenticated` keeps these grants off the service role (which
--    bypasses RLS anyway) and makes the audience explicit.
-- -----------------------------------------------------------------------------

-- products: only active rows
drop policy if exists products_public_read on products;
create policy products_public_read on products
  for select to anon, authenticated
  using (is_active = true);

-- bundles: only active rows
drop policy if exists bundles_public_read on bundles;
create policy bundles_public_read on bundles
  for select to anon, authenticated
  using (is_active = true);

-- blog_posts: only published rows
drop policy if exists blog_posts_public_read on blog_posts;
create policy blog_posts_public_read on blog_posts
  for select to anon, authenticated
  using (status = 'published');

-- reviews: only approved rows
drop policy if exists reviews_public_read on reviews;
create policy reviews_public_read on reviews
  for select to anon, authenticated
  using (is_approved = true);

-- concern_pages: all rows (public SEO landing pages)
drop policy if exists concern_pages_public_read on concern_pages;
create policy concern_pages_public_read on concern_pages
  for select to anon, authenticated
  using (true);

-- gallery_images: all rows (public gallery)
drop policy if exists gallery_images_public_read on gallery_images;
create policy gallery_images_public_read on gallery_images
  for select to anon, authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- 3. Storage buckets — public read; uploads via server-issued signed URLs.
--    Public buckets are served read-only through the public storage endpoint.
--    No insert/update/delete policy is created for public roles, so the anon
--    key cannot upload; admin uploads use service-role signed URLs (A6).
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('gallery',  'gallery',  true),
  ('blog',     'blog',     true)
on conflict (id) do update set public = excluded.public;

-- Explicit public read policy on objects in these buckets (defensive; public
-- buckets already serve reads, this makes the intent auditable).
drop policy if exists storage_public_read_avesta on storage.objects;
create policy storage_public_read_avesta on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('products', 'gallery', 'blog'));

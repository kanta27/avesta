-- =============================================================================
-- A2 — Data model (full schema)
-- Canonical Postgres schema for the Avesta Health D2C store.
-- Spec: .claude/spec/foundation/A2-data-model.md
--
-- Notes:
--   * Money is stored as integer paise (*_paise) — never floats.
--   * `jsonb` is used where row shape is flexible (see inline comments).
--   * RLS is intentionally NOT enabled here — that is step A3, and must land
--     before any public read path ships.
--   * Tables are created in FK-dependency order so this applies cleanly to a
--     fresh project. Non-destructive: no drop/truncate/delete.
-- =============================================================================

-- gen_random_uuid() lives in pgcrypto; present by default on Supabase, but make
-- the dependency explicit so the migration is portable.
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- PRODUCTS
-- -----------------------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  type text not null check (type in ('hydration','gummy')),
  concerns text[] not null default '{}',          -- ['hydration','energy',...]
  tagline text,
  description text,
  ingredients jsonb default '[]',                 -- [{name, amount, unit}]
  bioactives jsonb default '[]',                  -- [{name, role, evidence_url}]
  science_html text,                              -- "The Science" tab content
  faqs jsonb default '[]',                         -- [{q,a}]
  who_for text,
  who_not_for text,
  badges jsonb default '[]',                       -- ['FSSAI','Clinically tested','GMP']
  pack_tiers jsonb not null default '[]',          -- see shape below
  images jsonb default '[]',                       -- [{url, alt}]
  stock_count int default 0,
  rating_avg numeric(2,1),
  rating_source text,                              -- e.g. 4.6 / 'amazon'
  is_active boolean default true,
  created_at timestamptz default now()
);
-- pack_tiers shape:
--   [{ key:'15'|'30'|'90', label, units, price_paise, discount_pct, per_day_paise, is_default }]

-- -----------------------------------------------------------------------------
-- BUNDLES
-- -----------------------------------------------------------------------------
create table bundles (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  concern text,
  product_ids uuid[] not null,
  price_paise int not null,
  compare_at_paise int,
  image jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- CUSTOMERS (guest-first; keyed by phone)
-- -----------------------------------------------------------------------------
create table customers (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null,
  email text,
  name text,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- ORDERS
-- -----------------------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,              -- e.g. AV-2026-000123
  customer_phone text not null,
  email text,
  name text,
  items jsonb not null,                           -- [{product_id, name, pack_key, qty, unit_price_paise}]
  subtotal_paise int not null,
  discount_code text,
  discount_paise int default 0,
  shipping_paise int default 0,
  total_paise int not null,
  status text not null default 'created'
    check (status in ('created','paid','packed','shipped','delivered','cancelled','refunded')),
  razorpay_order_id text,
  razorpay_payment_id text,
  tracking_url text,
  courier text,
  shipping_address jsonb not null,                -- {line1,line2,city,state,pincode,country}
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- LEADS (popup + newsletter + b2b + quiz all land here)
-- -----------------------------------------------------------------------------
create table leads (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  source_page text,
  source_type text not null check (source_type in ('popup','newsletter','b2b','quiz')),
  consent_whatsapp boolean default false,
  consent_at timestamptz,
  quiz_answers jsonb,
  recommended_product_id uuid,
  converted boolean default false,
  converted_order_id uuid,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- DISCOUNT CODES
-- -----------------------------------------------------------------------------
create table discount_codes (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  kind text not null check (kind in ('percent','flat','free_shipping')),
  value_paise int,            -- for flat; percent uses value_pct
  value_pct numeric,
  min_order_paise int default 0,
  usage_limit int,
  used_count int default 0,
  per_phone_limit int default 1,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table discount_redemptions (
  id uuid primary key default gen_random_uuid(),
  code_id uuid references discount_codes(id),
  order_id uuid references orders(id),
  phone text,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- REVIEWS / TESTIMONIALS
-- -----------------------------------------------------------------------------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id),        -- nullable = general
  author_name text,
  location text,
  rating int check (rating between 1 and 5),
  body text,
  source text check (source in ('amazon','tata1mg','direct')),
  reel_url text,
  is_approved boolean default false,
  is_featured boolean default false,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- BLOG
-- -----------------------------------------------------------------------------
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body_md text,
  cover_image jsonb,
  tags text[] default '{}',
  status text default 'draft' check (status in ('draft','review','published')),
  seo_title text,
  seo_description text,
  schema_type text default 'Article',
  source text default 'manual' check (source in ('manual','automation')),
  published_at timestamptz,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- CONCERN LANDING PAGES (SEO)
-- -----------------------------------------------------------------------------
create table concern_pages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,                       -- 'hydration'
  concern text not null,
  h1 text,
  intro_md text,
  faqs jsonb default '[]',
  product_ids uuid[] default '{}',
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- GALLERY
-- -----------------------------------------------------------------------------
create table gallery_images (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  alt text,
  category text check (category in ('product','lab','manufacturing')),
  sort int default 0,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- ABANDONED CARTS (WhatsApp recovery, Phase 2)
-- -----------------------------------------------------------------------------
create table carts (
  id uuid primary key default gen_random_uuid(),
  phone text,
  email text,
  items jsonb,
  status text default 'active'
    check (status in ('active','recovered','abandoned','converted')),
  last_seen_at timestamptz default now(),
  recovery_sent boolean default false,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- PAGEVIEWS (lightweight in-house analytics)
-- -----------------------------------------------------------------------------
create table pageviews (
  id bigserial primary key,
  path text,
  session_id text,
  referrer text,
  created_at timestamptz default now()
);

-- -----------------------------------------------------------------------------
-- INDEXES (per spec Tech notes)
-- -----------------------------------------------------------------------------
create index idx_orders_customer_phone     on orders (customer_phone);
create index idx_orders_order_number       on orders (order_number);
create index idx_leads_phone               on leads (phone);
create index idx_leads_converted           on leads (converted);
create index idx_discount_redemptions_phone on discount_redemptions (phone);
create index idx_carts_status_last_seen    on carts (status, last_seen_at);
create index idx_pageviews_created_at      on pageviews (created_at);

-- -----------------------------------------------------------------------------
-- updated_at maintenance for ORDERS
-- Keeps orders.updated_at fresh on every row update (e.g. status changes).
-- -----------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_orders_set_updated_at
  before update on orders
  for each row
  execute function set_updated_at();

import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase";
import type {
  Bioactive,
  Faq,
  Ingredient,
  PackTier,
  ProductDetail,
  ProductListItem,
} from "./types";

export type {
  PackTier,
  ProductDetail,
  ProductListItem,
  Review,
} from "./types";

type ProductRow = Tables<"products">;

/** Narrow the loosely-typed jsonb columns into the app-facing shape. */
function toListItem(row: ProductRow): ProductListItem {
  const packTiers = (Array.isArray(row.pack_tiers) ? row.pack_tiers : []) as unknown as PackTier[];
  const images = (Array.isArray(row.images) ? row.images : []) as unknown as {
    url: string;
    alt?: string;
  }[];

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type as "hydration" | "gummy",
    concerns: row.concerns ?? [],
    tagline: row.tagline,
    ratingAvg: row.rating_avg,
    ratingSource: row.rating_source,
    images,
    packTiers,
  };
}

/**
 * Fetch the public product catalog.
 *
 * Reads via the server-side anon client, so the `products_public_read` RLS
 * policy applies: only `is_active = true` rows are ever returned — an inactive
 * product is invisible to the public regardless of any app-level filter. The
 * `is_active = true` predicate below is belt-and-suspenders, not the guarantee.
 */
export async function getActiveProducts(): Promise<ProductListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, type, concerns, tagline, rating_avg, rating_source, images, pack_tiers, is_active",
    )
    .eq("is_active", true)
    .order("type", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    throw new Error(`Failed to load products: ${error.message}`);
  }

  return (data ?? []).map((row) => toListItem(row as ProductRow));
}

/** Coerce a jsonb array column into a typed array, tolerating null / non-array. */
function jsonArray<T>(value: ProductRow[keyof ProductRow]): T[] {
  return (Array.isArray(value) ? value : []) as unknown as T[];
}

/** Narrow a full product row into the PDP-facing shape. */
function toDetail(row: ProductRow): ProductDetail {
  return {
    ...toListItem(row),
    description: row.description,
    ingredients: jsonArray<Ingredient>(row.ingredients),
    bioactives: jsonArray<Bioactive>(row.bioactives),
    scienceHtml: row.science_html,
    faqs: jsonArray<Faq>(row.faqs),
    whoFor: row.who_for,
    whoNotFor: row.who_not_for,
    badges: jsonArray<string>(row.badges),
  };
}

/**
 * Fetch one active product by slug for the detail page, or `null` if no active
 * row matches (unknown slug, or an inactive product the public can't see).
 *
 * Reads via the server-side anon client, so the `products_public_read` RLS
 * policy applies: inactive rows are invisible regardless of the explicit
 * `is_active = true` predicate below (belt-and-suspenders). The page turns a
 * `null` result into a 404.
 */
export async function getProductBySlug(
  slug: string,
): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, name, type, concerns, tagline, description, rating_avg, rating_source, images, pack_tiers, ingredients, bioactives, science_html, faqs, who_for, who_not_for, badges, is_active",
    )
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load product "${slug}": ${error.message}`);
  }

  return data ? toDetail(data as ProductRow) : null;
}

// Review reads moved to `lib/reviews/public.ts` (feature 17): the PDP shows only
// FIRST-PARTY (direct) reviews with a body, while third-party rows are link-out
// aggregate badges. Keeping a single "all approved reviews" reader here invited
// rendering a third-party body on-site, so it was removed in favour of the
// source-aware readers in that module.

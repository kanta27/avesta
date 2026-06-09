import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase";
import type { PackTier, ProductListItem } from "./types";

export type { PackTier, ProductListItem } from "./types";

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

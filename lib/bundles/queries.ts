import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase";
import { defaultTierIndex, type PackTier } from "@/lib/products/types";
import {
  bundleSavingPaise,
  bundleSavingPct,
  type BundleListItem,
  type BundleMember,
} from "./types";

export type { BundleListItem, BundleMember } from "./types";

type BundleRow = Tables<"bundles">;
type ProductRow = Tables<"products">;

/** Reference price (paise) for a product at its default pack tier, or null. */
function referencePaise(row: ProductRow): number | null {
  const tiers = (Array.isArray(row.pack_tiers) ? row.pack_tiers : []) as unknown as PackTier[];
  if (tiers.length === 0) return null;
  return tiers[defaultTierIndex(tiers)]?.price_paise ?? null;
}

/**
 * Fetch active bundles and resolve each one's `product_ids` to member products.
 *
 * Both reads go through the server-side anon client, so RLS applies on each:
 *   * `bundles_public_read` → only `is_active = true` bundles are returned;
 *   * `products_public_read` → an inactive member product simply won't resolve
 *     and is dropped from `members` (the bundle still renders with the rest).
 * The explicit `is_active = true` predicate below is belt-and-suspenders.
 *
 * Members are returned in authored `product_ids` order (drink-first in the seed).
 */
export async function getActiveBundles(): Promise<BundleListItem[]> {
  const supabase = await createClient();

  const { data: bundleData, error: bundleError } = await supabase
    .from("bundles")
    .select(
      "id, slug, name, concern, product_ids, price_paise, compare_at_paise, image, is_active",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (bundleError) {
    throw new Error(`Failed to load bundles: ${bundleError.message}`);
  }

  const bundles = (bundleData ?? []) as BundleRow[];
  if (bundles.length === 0) return [];

  // Resolve every referenced product in one query (union of all product_ids).
  const memberIds = Array.from(
    new Set(bundles.flatMap((b) => b.product_ids ?? [])),
  );

  const { data: productData, error: productError } = await supabase
    .from("products")
    .select("id, slug, name, type, pack_tiers, is_active")
    .in("id", memberIds)
    .eq("is_active", true);

  if (productError) {
    throw new Error(`Failed to load bundle members: ${productError.message}`);
  }

  const byId = new Map<string, BundleMember>(
    (productData ?? []).map((row) => {
      const p = row as ProductRow;
      return [
        p.id,
        {
          id: p.id,
          slug: p.slug,
          name: p.name,
          type: p.type as BundleMember["type"],
          referencePaise: referencePaise(p),
        },
      ];
    }),
  );

  return bundles.map((b) => {
    const image = (b.image ?? null) as { url: string; alt?: string } | null;
    const members = (b.product_ids ?? [])
      .map((id) => byId.get(id))
      .filter((m): m is BundleMember => m != null);

    return {
      id: b.id,
      slug: b.slug,
      name: b.name,
      concern: b.concern,
      pricePaise: b.price_paise,
      compareAtPaise: b.compare_at_paise,
      savingPaise: bundleSavingPaise(b.price_paise, b.compare_at_paise),
      savingPct: bundleSavingPct(b.price_paise, b.compare_at_paise),
      image,
      members,
    };
  });
}

// Pure, client-safe bundle types & helpers — NO server-only imports, so both the
// server query layer and any client island can use these. Mirrors the shape of
// lib/products/types.ts.

import type { ProductListItem } from "@/lib/products/types";

/**
 * One member of a bundle, shaped for display. A trimmed product summary plus the
 * single per-unit reference price used to explain the bundle's saving — the
 * member's 30-day (default) pack tier price, the same tier the seed sums into
 * `compare_at_paise`. `priceLabel` is null only if the product carries no tiers.
 */
export interface BundleMember {
  id: string;
  slug: string;
  name: string;
  type: ProductListItem["type"];
  /** Reference price (paise) for this member at its default pack tier, or null. */
  referencePaise: number | null;
}

/**
 * A bundle shaped for the storefront. Money is integer paise; format at the edge.
 * `members` is ordered as authored in `product_ids` (drink-first in the seed).
 * `savingPaise` is derived (`compareAtPaise - pricePaise`) and is null when the
 * bundle has no `compare_at_paise`.
 */
export interface BundleListItem {
  id: string;
  slug: string;
  name: string;
  concern: string | null;
  pricePaise: number;
  compareAtPaise: number | null;
  savingPaise: number | null;
  savingPct: number | null;
  image: { url: string; alt?: string } | null;
  members: BundleMember[];
}

/** Saving in paise vs the sum-of-parts reference, or null if no compare_at. */
export function bundleSavingPaise(
  pricePaise: number,
  compareAtPaise: number | null,
): number | null {
  if (compareAtPaise == null) return null;
  const saving = compareAtPaise - pricePaise;
  return saving > 0 ? saving : null;
}

/** Saving as a rounded percentage of the compare_at reference, or null. */
export function bundleSavingPct(
  pricePaise: number,
  compareAtPaise: number | null,
): number | null {
  if (compareAtPaise == null || compareAtPaise <= 0) return null;
  const saving = compareAtPaise - pricePaise;
  if (saving <= 0) return null;
  return Math.round((saving / compareAtPaise) * 100);
}

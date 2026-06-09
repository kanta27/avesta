// Pure, client-safe product catalog types & helpers — NO server-only imports,
// so both the server query layer and client islands can use these.

/** A single pack tier as stored in `products.pack_tiers` (jsonb). Money in paise. */
export interface PackTier {
  key: string; // '15' | '30' | '90'
  label: string; // e.g. "30-day"
  units: number;
  price_paise: number;
  discount_pct: number;
  per_day_paise: number;
  is_default: boolean;
}

/** A product shaped for the storefront catalog (jsonb columns narrowed to typed shapes). */
export interface ProductListItem {
  id: string;
  slug: string;
  name: string;
  type: "hydration" | "gummy";
  concerns: string[];
  tagline: string | null;
  ratingAvg: number | null;
  ratingSource: string | null;
  images: { url: string; alt?: string }[];
  packTiers: PackTier[];
}

export interface FilterOption {
  key: string;
  label: string;
}

/** Storefront concern filters (spec-fixed list). `key` matches `products.concerns`. */
export const CONCERN_OPTIONS: readonly FilterOption[] = [
  { key: "hydration", label: "Hydration" },
  { key: "energy", label: "Energy" },
  { key: "immunity", label: "Immunity" },
  { key: "sleep", label: "Sleep" },
  { key: "hair-skin", label: "Hair & Skin" },
  { key: "daily-nutrition", label: "Daily Nutrition" },
];

/** Product-type filters. `key` matches `products.type`. */
export const TYPE_OPTIONS: readonly FilterOption[] = [
  { key: "hydration", label: "Hydration" },
  { key: "gummy", label: "Gummies" },
];

/** Index of the pre-selected pack: 30-day, else the is_default tier, else the first. */
export function defaultTierIndex(tiers: PackTier[]): number {
  const byKey = tiers.findIndex((t) => t.key === "30");
  if (byKey >= 0) return byKey;
  const byDefault = tiers.findIndex((t) => t.is_default);
  if (byDefault >= 0) return byDefault;
  return 0;
}

/** Pill label for a pack tier, e.g. "30-DAY −10%". */
export function packPillLabel(tier: PackTier): string {
  const base = tier.label.toUpperCase();
  return tier.discount_pct > 0 ? `${base} −${tier.discount_pct}%` : base;
}

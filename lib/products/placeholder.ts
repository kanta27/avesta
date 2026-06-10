// Emoji + gradient placeholders by product type, matching the homepage demo.
// Real product imagery lands when assets are wired in (future work). Pure /
// client-safe — no server-only imports.
import type { ProductListItem } from "./types";

export const PRODUCT_PLACEHOLDER: Record<
  ProductListItem["type"],
  { emoji: string; background: string }
> = {
  hydration: { emoji: "🥤", background: "linear-gradient(150deg,#E3F4FB,#CBE9F4)" },
  gummy: { emoji: "🍬", background: "linear-gradient(150deg,#F3E9FB,#E2D2F2)" },
};

/** Filled/empty star string for a 0–5 rating, e.g. 4.6 → "★★★★★". */
export function starString(rating: number | null): string {
  if (rating == null) return "";
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

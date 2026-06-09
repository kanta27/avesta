import { PackPricing } from "@/components/store/PackPricing";
import { defaultTierIndex, type ProductListItem } from "@/lib/products/types";

// Emoji + gradient placeholders by product type, matching the homepage demo
// (real product imagery lands when assets are wired in — future work).
const PLACEHOLDER: Record<ProductListItem["type"], { emoji: string; background: string }> = {
  hydration: { emoji: "🥤", background: "linear-gradient(150deg,#E3F4FB,#CBE9F4)" },
  gummy: { emoji: "🍬", background: "linear-gradient(150deg,#F3E9FB,#E2D2F2)" },
};

function starString(rating: number | null): string {
  if (rating == null) return "";
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(full) + "☆".repeat(5 - full);
}

/**
 * Catalog card for the Shop grid. Reuses the demo's `.prod` markup/CSS and the
 * `PackPricing` island (pack selector + live ₹/day). Server component; only the
 * pricing interaction is client-side.
 */
export function ShopProductCard({ product }: { product: ProductListItem }) {
  const placeholder = PLACEHOLDER[product.type];
  const image = product.images[0];
  const ratingNote =
    product.ratingAvg != null
      ? `${product.ratingAvg.toFixed(1)}${
          product.ratingSource ? ` · ${product.ratingSource.toUpperCase()}` : ""
        }`
      : null;

  return (
    <div className="prod">
      <div className="img" style={{ background: placeholder.background }}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.url} alt={image.alt ?? product.name} />
        ) : (
          <span aria-hidden>{placeholder.emoji}</span>
        )}
      </div>
      <div className="body">
        <h3>{product.name}</h3>
        {product.tagline ? <div className="sci">{product.tagline}</div> : null}
        {ratingNote ? (
          <div className="stars" aria-label={`Rated ${ratingNote}`}>
            <span aria-hidden>{starString(product.ratingAvg)}</span>{" "}
            <small>{ratingNote}</small>
          </div>
        ) : null}
        <PackPricing
          tiers={product.packTiers}
          defaultIndex={defaultTierIndex(product.packTiers)}
        />
      </div>
    </div>
  );
}

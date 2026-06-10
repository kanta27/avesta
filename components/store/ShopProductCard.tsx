import Link from "next/link";
import { PackPricing } from "@/components/store/PackPricing";
import { PRODUCT_PLACEHOLDER, starString } from "@/lib/products/placeholder";
import { defaultTierIndex, type ProductListItem } from "@/lib/products/types";

/**
 * Catalog card for the Shop grid. Reuses the demo's `.prod` markup/CSS and the
 * `PackPricing` island (pack selector + live ₹/day). Server component; only the
 * pricing interaction is client-side. The image + title link to the product
 * detail page; the pricing controls below stay interactive (non-navigating).
 */
export function ShopProductCard({ product }: { product: ProductListItem }) {
  const placeholder = PRODUCT_PLACEHOLDER[product.type];
  const image = product.images[0];
  const href = `/shop/${product.slug}`;
  const ratingNote =
    product.ratingAvg != null
      ? `${product.ratingAvg.toFixed(1)}${
          product.ratingSource ? ` · ${product.ratingSource.toUpperCase()}` : ""
        }`
      : null;

  return (
    <div className="prod">
      <Link
        href={href}
        className="prod-link"
        aria-label={`View ${product.name}`}
        style={{ background: placeholder.background }}
      >
        <span className="img">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt={image.alt ?? product.name} />
          ) : (
            <span aria-hidden>{placeholder.emoji}</span>
          )}
        </span>
      </Link>
      <div className="body">
        <h3>
          <Link href={href} className="prod-title">
            {product.name}
          </Link>
        </h3>
        {product.tagline ? <div className="sci">{product.tagline}</div> : null}
        {ratingNote ? (
          <div className="stars" aria-label={`Rated ${ratingNote}`}>
            <span aria-hidden>{starString(product.ratingAvg)}</span>{" "}
            <small>{ratingNote}</small>
          </div>
        ) : null}
        <PackPricing
          productId={product.id}
          tiers={product.packTiers}
          defaultIndex={defaultTierIndex(product.packTiers)}
        />
      </div>
    </div>
  );
}

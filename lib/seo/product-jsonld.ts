// Build Product + FAQPage JSON-LD for a product detail page (spec feature 14
// lives here naturally — the PDP). Pure / client-safe. Money is converted from
// integer paise to a rupee string only at this display/serialization edge.
import type { ProductDetail } from "@/lib/products/types";
import type { DirectReviewStats } from "@/lib/reviews/types";

const BRAND = "Avesta Nordic";

function paiseToRupeeString(paise: number): string {
  return (Math.round(paise) / 100).toFixed(2);
}

/**
 * schema.org Product object. Omits fields the product doesn't have yet.
 *
 * `directStats` carries the count + average over APPROVED FIRST-PARTY (direct)
 * reviews. The on-site `aggregateRating` is derived ONLY from those — never from
 * the product's third-party aggregate (`rating_avg`/`rating_source`, e.g. an
 * Amazon score). Google's policy requires structured-data AggregateRating to
 * reflect reviews the site itself collects; the third-party score stays a
 * visible link-out badge, out of the structured data. With zero direct reviews,
 * `aggregateRating` is omitted entirely rather than asserting a fabricated count.
 */
export function productJsonLd(
  product: ProductDetail,
  url: string,
  directStats?: DirectReviewStats,
) {
  const prices = product.packTiers.map((t) => t.price_paise);
  const lowest = prices.length > 0 ? Math.min(...prices) : null;

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: BRAND },
    url,
  };

  if (product.description) node.description = product.description;
  // `image` is a required property for Google Product rich results. Use the
  // product's own photos when present; otherwise fall back to the site-wide
  // branded OG card so the Product node stays rich-result eligible. Real photos
  // take over automatically once product images are wired in.
  node.image =
    product.images.length > 0
      ? product.images.map((i) => i.url)
      : [`${new URL(url).origin}/opengraph-image`];

  // AggregateRating is derived from FIRST-PARTY (direct) approved reviews ONLY.
  // No direct reviews → no aggregateRating node (don't assert a count we can't
  // back with first-party data; the third-party score is a link-out badge, not
  // structured data).
  if (directStats && directStats.count > 0 && directStats.average != null) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: directStats.average,
      ratingCount: directStats.count,
      reviewCount: directStats.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  if (lowest != null) {
    node.offers = {
      "@type": "Offer",
      priceCurrency: "INR",
      price: paiseToRupeeString(lowest),
      availability: "https://schema.org/InStock",
      url,
    };
  }

  return node;
}

/** schema.org FAQPage object, or null when the product has no FAQs. */
export function faqJsonLd(product: ProductDetail) {
  if (product.faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: product.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

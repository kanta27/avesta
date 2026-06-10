// Build Product + FAQPage JSON-LD for a product detail page (spec feature 14
// lives here naturally — the PDP). Pure / client-safe. Money is converted from
// integer paise to a rupee string only at this display/serialization edge.
import type { ProductDetail } from "@/lib/products/types";

const BRAND = "Avesta Health";

function paiseToRupeeString(paise: number): string {
  return (Math.round(paise) / 100).toFixed(2);
}

/** schema.org Product object. Omits fields the product doesn't have yet. */
export function productJsonLd(product: ProductDetail, url: string) {
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
  if (product.images.length > 0) node.image = product.images.map((i) => i.url);

  if (product.ratingAvg != null) {
    node.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.ratingAvg,
      bestRating: 5,
      // No review count available yet; ratingCount intentionally omitted until
      // a real reviews dataset exists, to avoid asserting a fabricated number.
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

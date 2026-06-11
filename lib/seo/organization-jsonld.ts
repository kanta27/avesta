// Site-wide Organization + WebSite JSON-LD (spec feature 14). Rendered once in
// the root layout so every route carries brand identity for search engines.
// Pure / client-safe — takes the canonical site origin and returns a schema.org
// @graph with both nodes sharing one document.
const BRAND = "Avesta Health";

// Avesthagen is the parent bioscience company; linking it as `sameAs` ties the
// D2C brand to its established web entity.
const SAME_AS = ["https://www.avesthagen.com"];

/**
 * schema.org @graph with an Organization and a WebSite node.
 *
 * @param siteUrl canonical site origin (no trailing slash), e.g. publicEnv.NEXT_PUBLIC_SITE_URL
 */
export function organizationJsonLd(siteUrl: string) {
  const origin = siteUrl.replace(/\/$/, "");
  const orgId = `${origin}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": orgId,
        name: BRAND,
        url: origin,
        // No standalone logo asset exists yet; the generated OG card carries the
        // wordmark and is a valid image URL for the logo field at baseline.
        logo: `${origin}/opengraph-image`,
        sameAs: SAME_AS,
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: BRAND,
        url: origin,
        publisher: { "@id": orgId },
      },
    ],
  };
}

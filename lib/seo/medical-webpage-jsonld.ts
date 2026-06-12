// Build MedicalWebPage JSON-LD for a concern landing page (spec feature 19).
// Pure / client-safe — sits alongside the product / article / FAQ helpers.
import type { ConcernPage } from "@/lib/concerns/types";

const BRAND = "Avesta Nordic";

/**
 * schema.org MedicalWebPage node for a concern landing page.
 *
 * MedicalWebPage is the correct type for health-information pages (Google reads
 * it for health/medical content). We keep it conservative and COMPLIANT: it
 * carries the page's name/description/url and publisher only — it does NOT
 * assert `MedicalCondition`, treatments, or any therapeutic relationship, since
 * the copy is structure/function only and must never read as diagnosing or
 * treating disease. Optional fields are omitted rather than fabricated.
 *
 * @param page the concern page
 * @param url  the page's absolute canonical URL
 * @param siteOrigin canonical site origin (no trailing slash) — for publisher id
 */
export function medicalWebPageJsonLd(
  page: ConcernPage,
  url: string,
  siteOrigin: string,
) {
  const origin = siteOrigin.replace(/\/$/, "");
  const name = page.seoTitle ?? page.h1 ?? page.concern;

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    // about names the health topic in plain terms — NOT a MedicalCondition node,
    // to avoid implying diagnosis/treatment of a disease.
    about: { "@type": "Thing", name: page.concern },
    publisher: {
      "@id": `${origin}/#organization`,
      "@type": "Organization",
      name: BRAND,
    },
  };

  const description = page.seoDescription;
  if (description) node.description = description;

  return node;
}

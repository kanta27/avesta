// Pure, client-safe types for concern landing pages (feature 19) — NO
// server-only imports, so the public page, the admin editor island and the
// data layers can all share them.

/** One FAQ entry as stored in `concern_pages.faqs` (jsonb). Same {q,a} shape as
 *  product FAQs, so it shares the `faqJsonLd` helper. */
export interface ConcernFaq {
  q: string;
  a: string;
}

/** A concern landing page shaped for the PUBLIC page. */
export interface ConcernPage {
  id: string;
  slug: string;
  concern: string;
  h1: string | null;
  introMd: string | null;
  faqs: ConcernFaq[];
  productIds: string[];
  seoTitle: string | null;
  seoDescription: string | null;
}

/** A concern page row shaped for the admin list table. */
export interface AdminConcernListItem {
  id: string;
  slug: string;
  concern: string;
  h1: string | null;
  productCount: number;
  faqCount: number;
}

/** Coerce the loosely-typed jsonb `faqs` column into a typed {q,a}[] array,
 *  tolerating null / non-array / malformed entries. */
export function toConcernFaqs(value: unknown): ConcernFaq[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(
      (f): f is { q: unknown; a: unknown } =>
        typeof f === "object" && f !== null,
    )
    .map((f) => ({ q: String(f.q ?? ""), a: String(f.a ?? "") }));
}

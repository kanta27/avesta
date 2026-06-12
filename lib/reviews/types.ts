// Pure, client-safe review types & helpers — NO server-only imports, so the
// server data layers (`lib/reviews/admin.ts`, `lib/reviews/public.ts`) and the
// client islands (admin forms, store forms) can all import from here.
//
// COMPLIANCE MODEL (feature 17): the `reviews` table holds two structurally
// different kinds of row, discriminated by `source`:
//   - source='direct'            → a FIRST-PARTY testimonial we collected. It is
//                                  the ONLY kind that carries an on-site `body`.
//   - source='amazon'|'tata1mg'  → a THIRD-PARTY AGGREGATE BADGE: a rating plus a
//                                  link OUT to the platform listing. It NEVER
//                                  carries a verbatim review body (Google policy +
//                                  do-not-copy compliance). The outbound link is
//                                  stored in the existing `reel_url` column (a
//                                  generic external-URL column reused here — for a
//                                  direct review it may instead hold an IG reel).

/** The review sources allowed by the A2 `reviews.source` check constraint. */
export const REVIEW_SOURCES = ["direct", "amazon", "tata1mg"] as const;
export type ReviewSource = (typeof REVIEW_SOURCES)[number];

export function isReviewSource(v: string): v is ReviewSource {
  return (REVIEW_SOURCES as readonly string[]).includes(v);
}

/** First-party = carries an on-site body; third-party = link-out badge only. */
export function isFirstParty(source: ReviewSource | string | null): boolean {
  return source === "direct";
}

/** The third-party platforms that are aggregate link-out badges, not bodies. */
export const THIRD_PARTY_SOURCES = ["amazon", "tata1mg"] as const;
export type ThirdPartySource = (typeof THIRD_PARTY_SOURCES)[number];

/** Human-readable platform label for a source tag (e.g. "Amazon", "Tata 1mg"). */
export function sourceLabel(source: ReviewSource | string | null): string {
  switch (source) {
    case "amazon":
      return "Amazon";
    case "tata1mg":
      return "Tata 1mg";
    case "direct":
      return "Verified buyer";
    default:
      return source ?? "";
  }
}

/** Star count (1–5) → a five-character ★/☆ string. Pure, for non-React callers. */
export function starString(rating: number | null): string {
  const n = Math.max(0, Math.min(5, Math.round(rating ?? 0)));
  return "★★★★★☆☆☆☆☆".slice(5 - n, 10 - n);
}

/** One row shaped for the admin testimonials list table. */
export interface AdminReviewListItem {
  id: string;
  authorName: string | null;
  location: string | null;
  rating: number | null;
  body: string | null;
  source: ReviewSource | null;
  /** Outbound link (third-party platform listing, or a direct review's reel). */
  reelUrl: string | null;
  productId: string | null;
  productName: string | null;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string | null;
}

/** A first-party testimonial for the home featured strip (body always present). */
export interface FeaturedReview {
  id: string;
  authorName: string | null;
  location: string | null;
  rating: number | null;
  body: string | null;
  source: ReviewSource | null;
  /** A direct review may carry an optional reel link. */
  reelUrl: string | null;
}

/** A third-party aggregate badge: rating + link out, NEVER a body. */
export interface AggregateBadge {
  id: string;
  source: ThirdPartySource;
  rating: number | null;
  /** The platform listing URL we link OUT to. */
  url: string | null;
}

/** Stats over APPROVED FIRST-PARTY (direct) reviews — drives on-site JSON-LD. */
export interface DirectReviewStats {
  count: number;
  /** Mean of the direct ratings, or null when there are none. */
  average: number | null;
}

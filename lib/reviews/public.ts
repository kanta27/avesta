import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/products/types";
import {
  isReviewSource,
  type AggregateBadge,
  type DirectReviewStats,
  type FeaturedReview,
  type ReviewSource,
  type ThirdPartySource,
} from "./types";

/**
 * PUBLIC review reads. Server-side ANON client, so the `reviews_public_read` RLS
 * policy (A3) applies: only `is_approved = true` rows are ever returned. The
 * explicit `is_approved` filters below are belt-and-suspenders, not the
 * guarantee. Admin reads (any approval state) go through `lib/reviews/admin.ts`.
 *
 * The PDP testimonial list is FIRST-PARTY only — `source='direct'` rows carry an
 * on-site body. Third-party rows are surfaced separately as link-out aggregate
 * badges (`getApprovedAggregateBadges`), never as body-bearing testimonials.
 */

function toSource(v: string | null): ReviewSource | null {
  return v && isReviewSource(v) ? v : null;
}

/**
 * Approved FIRST-PARTY (direct) reviews for a product, newest first. These are
 * the only reviews that carry an on-site body, so they are the ones the PDP
 * testimonial block renders. Returns `[]` when none exist (the block shows an
 * empty state rather than fabricating testimonials).
 */
export async function getApprovedDirectReviews(
  productId: string,
): Promise<Review[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, author_name, location, rating, body, source, created_at")
    .eq("product_id", productId)
    .eq("source", "direct")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load reviews: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    authorName: row.author_name,
    location: row.location,
    rating: row.rating,
    body: row.body,
    source: row.source,
    createdAt: row.created_at,
  }));
}

/**
 * Aggregate stats over APPROVED FIRST-PARTY (direct) reviews for a product. This
 * is the ONLY thing the on-site AggregateRating JSON-LD may be derived from
 * (feature 17 / Google policy): the visible "Rated 4.6 · Amazon" badge comes
 * from the third-party aggregate on the product, but structured-data
 * AggregateRating must reflect reviews WE collected, never a third-party
 * aggregate. Count 0 → the caller omits AggregateRating entirely.
 */
export async function getDirectReviewStats(
  productId: string,
): Promise<DirectReviewStats> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("product_id", productId)
    .eq("source", "direct")
    .eq("is_approved", true);

  if (error) throw new Error(`Failed to load review stats: ${error.message}`);

  const ratings = (data ?? [])
    .map((r) => r.rating)
    .filter((r): r is number => typeof r === "number");

  if (ratings.length === 0) return { count: 0, average: null };

  const sum = ratings.reduce((a, b) => a + b, 0);
  // Round the average to one decimal — schema.org ratingValue, display-friendly.
  const average = Math.round((sum / ratings.length) * 10) / 10;
  return { count: ratings.length, average };
}

/**
 * Approved THIRD-PARTY aggregate badges for a product (Amazon / Tata 1mg): each
 * is a rating + an outbound platform link (stored in `reel_url`). NEVER a body —
 * the body column is not even selected here. Newest first.
 */
export async function getApprovedAggregateBadges(
  productId: string,
): Promise<AggregateBadge[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, rating, source, reel_url, created_at")
    .eq("product_id", productId)
    .in("source", ["amazon", "tata1mg"])
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to load aggregate badges: ${error.message}`);

  return (data ?? [])
    .filter((row) => row.source === "amazon" || row.source === "tata1mg")
    .map((row) => ({
      id: row.id,
      source: row.source as ThirdPartySource,
      rating: row.rating,
      url: row.reel_url,
    }));
}

/**
 * Approved + featured reviews for the homepage strip, newest first, any source.
 * Direct rows render as testimonials (with body); third-party rows render as
 * link-out badges (the home component branches on `source`).
 */
export async function getFeaturedReviews(
  limit = 6,
): Promise<FeaturedReview[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reviews")
    .select("id, author_name, location, rating, body, source, reel_url, created_at")
    .eq("is_approved", true)
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to load featured reviews: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    authorName: row.author_name,
    location: row.location,
    rating: row.rating,
    body: row.body,
    source: toSource(row.source),
    reelUrl: row.reel_url,
  }));
}

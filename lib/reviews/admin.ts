import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import type { TablesInsert } from "@/lib/supabase";
import {
  isReviewSource,
  type AdminReviewListItem,
  type ReviewSource,
} from "./types";
import type { AdminReviewInput, PublicReviewInput } from "./validation";

/**
 * Admin reviews/testimonials data layer (feature 17). Service-role — BYPASSES
 * RLS, so it reads every approval state and writes rows. `server-only`; every
 * caller gates first (`requireAdmin()` for the admin actions; the public route
 * for `insertPublicReview` re-validates + rate-limits before calling).
 *
 * Separate from `lib/reviews/public.ts`, the PUBLIC anon read path, which only
 * ever sees approved rows under RLS.
 */

/** Filters for the admin list. Omit a field to not filter on it. */
export interface AdminReviewFilters {
  source?: ReviewSource;
  /** 'approved' → is_approved true; 'pending' → false. */
  approval?: "approved" | "pending";
  /** When true, only featured rows. */
  featured?: boolean;
}

function toSource(v: string | null): ReviewSource | null {
  return v && isReviewSource(v) ? v : null;
}

/** The joined product-name shape Supabase returns for `products(name)`. */
type JoinedProduct = { name: string } | { name: string }[] | null;

function productName(p: JoinedProduct): string | null {
  if (!p) return null;
  return Array.isArray(p) ? (p[0]?.name ?? null) : p.name;
}

/** All reviews (any state), newest first, optionally filtered. */
export async function listReviews(
  filters: AdminReviewFilters = {},
): Promise<AdminReviewListItem[]> {
  const admin = createAdminClient();
  let query = admin
    .from("reviews")
    .select(
      "id, author_name, location, rating, body, source, reel_url, is_approved, is_featured, product_id, created_at, products(name)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (filters.source) query = query.eq("source", filters.source);
  if (filters.approval) query = query.eq("is_approved", filters.approval === "approved");
  if (filters.featured) query = query.eq("is_featured", true);

  const { data, error } = await query;
  if (error) throw new Error(`Failed to list reviews: ${error.message}`);

  return (data ?? []).map((row) => ({
    id: row.id,
    authorName: row.author_name,
    location: row.location,
    rating: row.rating,
    body: row.body,
    source: toSource(row.source),
    reelUrl: row.reel_url,
    productId: row.product_id,
    productName: productName(row.products as JoinedProduct),
    isApproved: row.is_approved ?? false,
    isFeatured: row.is_featured ?? false,
    createdAt: row.created_at,
  }));
}

/**
 * Create a review from validated ADMIN input. The compliance split is already
 * enforced by the discriminated-union schema, but we ALSO assert it here at the
 * write edge: a third-party row NEVER gets a body, and an on-site body only ever
 * belongs to a direct row. `is_approved` defaults to the source — admin-entered
 * rows go live immediately (the admin is the approver); a direct row the admin
 * types is treated the same. (The PUBLIC path is the unapproved one.)
 */
export async function createReview(
  input: AdminReviewInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();

  // Build the row per source so a body can never attach to a third-party row.
  const base = {
    author_name: input.author_name,
    location: input.location,
    rating: input.rating,
    source: input.source,
    reel_url: input.reel_url ?? null,
    product_id: input.product_id,
    is_featured: input.is_featured,
    // Admin-created rows are pre-vetted by the admin → approved on create.
    is_approved: true,
  };

  const row: TablesInsert<"reviews"> =
    input.source === "direct"
      ? { ...base, body: input.body }
      : { ...base, body: null }; // HARD: third-party rows store NO body.

  const { data, error } = await admin
    .from("reviews")
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
}

/** Approve / unapprove a review (the list-row approval control). */
export async function setReviewApproved(
  id: string,
  isApproved: boolean,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("reviews")
    .update({ is_approved: isApproved })
    .eq("id", id);
  if (error) throw error;
}

/** Feature / unfeature a review (surfaces it on the homepage strip). */
export async function setReviewFeatured(
  id: string,
  isFeatured: boolean,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("reviews")
    .update({ is_featured: isFeatured })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Insert a PUBLIC submission from the on-site /review form. `reviews` is RLS
 * deny-all for INSERT to anon, so the public route MUST write through this
 * service-role path. source='direct' and is_approved=false are HARDCODED here —
 * a public submission can never choose its source or self-approve; an admin
 * approves it later. The body is already sanitized by `publicReviewSchema`.
 */
export async function insertPublicReview(
  input: PublicReviewInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();

  const row: TablesInsert<"reviews"> = {
    author_name: input.author_name,
    location: input.location,
    rating: input.rating,
    body: input.body,
    product_id: input.product_id,
    source: "direct", // HARDCODED — never trust the request.
    is_approved: false, // HARDCODED — admin moderates before it goes live.
    is_featured: false,
    reel_url: null,
  };

  const { data, error } = await admin
    .from("reviews")
    .insert(row)
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
}

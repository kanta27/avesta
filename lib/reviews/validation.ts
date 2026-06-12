// Review validation - pure (zod only), no DB access. Shared by the admin create
// action and the public submission route.
//
// The admin schema is a discriminated union on `source` that ENFORCES the
// compliance model at the type/parse layer:
//   - direct           -> an on-site body is allowed (required, in fact); NO
//                        platform link.
//   - amazon | tata1mg -> a platform link is REQUIRED and a body is FORBIDDEN.
//                        These rows are link-out aggregate badges, never verbatim
//                        third-party review text.
//
// The public schema only ever produces source='direct' rows (the route hardcodes
// source + is_approved); the body is sanitized to plain text before storage.

import { z } from "zod";

/**
 * Strip a review body down to safe plain text. Reviews are rendered as text
 * (React escapes on output), but we still neutralize markup at the WRITE edge so
 * nothing tag-like is ever persisted: remove anything between angle brackets,
 * drop control characters (keeping tab/newline/carriage-return), collapse runs
 * of whitespace, and trim.
 */
export function sanitizeReviewBody(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML/XML-ish tags
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // control chars (keep tab/newline/CR)
    .replace(/[ \t]+/g, " ") // collapse intra-line whitespace
    .replace(/\n{3,}/g, "\n\n") // cap blank-line runs
    .trim();
}

const ratingSchema = z
  .number({ message: "Select a rating." })
  .int()
  .min(1, "Rating must be 1 to 5.")
  .max(5, "Rating must be 1 to 5.");

const nullableText = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    // `.nullish()` so a MISSING key (undefined) is as acceptable as an empty one.
    z.string().trim().max(max).nullish(),
  );

/** Optional product id (uuid) - blank/absent means a general (no-product) review. */
const optionalProductId = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? null : v),
  z.uuid("Invalid product.").nullish(),
);

/** A first-party testimonial created by the admin - carries an on-site body. */
const adminDirectSchema = z.object({
  source: z.literal("direct"),
  author_name: nullableText(120),
  location: nullableText(120),
  rating: ratingSchema,
  // Required for a direct review - a testimonial with no words isn't useful.
  body: z
    .string()
    .trim()
    .min(1, "Add the review text.")
    .max(4000)
    .transform(sanitizeReviewBody)
    .refine((s) => s.length > 0, "Add the review text."),
  // Optional Instagram/UGC reel for a direct review.
  reel_url: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.url("Reel URL must be a valid URL.").max(1000).nullish(),
  ),
  product_id: optionalProductId,
  is_featured: z.boolean().default(false),
});

/**
 * A third-party AGGREGATE BADGE created by the admin - rating + outbound link
 * ONLY. There is intentionally no `body` field here at all, so the admin cannot
 * even submit verbatim third-party review text; the platform link is required
 * and is stored in `reel_url`.
 */
const adminThirdPartySchema = z.object({
  source: z.enum(["amazon", "tata1mg"]),
  author_name: nullableText(120),
  location: nullableText(120),
  rating: ratingSchema,
  // The platform listing URL we link OUT to. Required - a badge with no link is
  // pointless and risks being read as a first-party rating.
  reel_url: z.string().trim().url("Add the platform listing link.").max(1000),
  product_id: optionalProductId,
  is_featured: z.boolean().default(false),
});

/** Admin create input - discriminated on source; unknown keys stripped. */
export const adminReviewSchema = z.discriminatedUnion("source", [
  adminDirectSchema,
  adminThirdPartySchema,
]);
export type AdminReviewInput = z.infer<typeof adminReviewSchema>;

/**
 * Public submission from the on-site /review form. Always becomes a
 * source='direct', is_approved=false row (the route hardcodes both); the body is
 * sanitized here. Name/location optional, product optional, rating + body
 * required.
 */
export const publicReviewSchema = z.object({
  author_name: nullableText(120),
  location: nullableText(120),
  rating: z.preprocess((v) => {
    if (typeof v === "string" && v.trim() !== "") return Number(v);
    return v;
  }, ratingSchema),
  body: z
    .string()
    .trim()
    .min(4, "Please share a little more about your experience.")
    .max(4000)
    .transform(sanitizeReviewBody)
    .refine((s) => s.length >= 4, "Please share a little more about your experience."),
  product_id: optionalProductId,
});
export type PublicReviewInput = z.infer<typeof publicReviewSchema>;

import { NextResponse } from "next/server";

import { checkRateLimit, clientIpFrom } from "@/lib/track/rate-limit";
import { insertPublicReview } from "@/lib/reviews/admin";
import { publicReviewSchema } from "@/lib/reviews/validation";

// Writes the RLS-locked `reviews` table via the service-role client — `reviews`
// is deny-all for INSERT to anon (A3 only grants approved-row SELECT), so the
// ONLY write path is this trusted server route. Node runtime: service-role
// client.
export const runtime = "nodejs";

/**
 * POST /api/reviews — capture a FIRST-PARTY review from the on-site /review form
 * (what the post-delivery WhatsApp links to).
 *
 * Posture (spec + conventions.md):
 *   - Rate-limited per IP FIRST (reuses the feature-7 limiter) so the public
 *     endpoint can't be flooded with junk rows.
 *   - Validated + sanitized server-side: `publicReviewSchema` strips markup from
 *     the body and length-caps every field; unknown keys are dropped by zod.
 *   - Written with the service-role client because `reviews` is RLS deny-all for
 *     writes; the client can NEVER insert directly.
 *   - source='direct' and is_approved=false are HARDCODED in the data layer — a
 *     public submission can never self-approve or masquerade as a platform
 *     rating. It lands UNAPPROVED and an admin moderates it before it goes live.
 */
export async function POST(request: Request) {
  // 1. Rate-limit before parsing or touching the DB.
  const limit = checkRateLimit(clientIpFrom(request.headers));
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a minute and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  // 2. Parse the body.
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // 3. Validate + sanitize. A shape failure returns a clear 400.
  const parsed = publicReviewSchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? "Invalid review.";
    return NextResponse.json({ error: first }, { status: 400 });
  }

  // 4. Insert as an UNAPPROVED first-party review (hardcoded in the data layer).
  try {
    await insertPublicReview(parsed.data);
  } catch (err) {
    console.error("[review] insert failed:", err);
    return NextResponse.json(
      { error: "Could not save your review. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks! Your review has been submitted for moderation.",
  });
}

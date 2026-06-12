"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createReview,
  setReviewApproved,
  setReviewFeatured,
} from "@/lib/reviews/admin";
import { adminReviewSchema } from "@/lib/reviews/validation";

/**
 * Testimonials admin server actions (feature 17).
 *
 * Every action calls `requireAdmin()` FIRST, then writes via the service-role
 * data layer in `lib/reviews/admin.ts`. Public surfaces that can change are
 * revalidated so an approve/feature shows up without a redeploy: the homepage
 * (featured strip) and — when the review is tied to a product — that PDP.
 */

export type ReviewActionResult = { ok: true } | { ok: false; error: string };

/** Revalidate every public surface an approve/feature can touch. */
function revalidatePublic() {
  revalidatePath("/admin/testimonials");
  revalidatePath("/"); // homepage featured strip
  revalidatePath("/shop", "layout"); // any PDP under /shop/[slug]
}

export async function createReviewAction(
  raw: unknown,
): Promise<ReviewActionResult> {
  await requireAdmin();

  const parsed = adminReviewSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await createReview(parsed.data);
    revalidatePublic();
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create the review.";
    return { ok: false, error: message };
  }
}

export async function setApprovedAction(
  id: string,
  isApproved: boolean,
): Promise<ReviewActionResult> {
  await requireAdmin();

  try {
    await setReviewApproved(id, isApproved);
    revalidatePublic();
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not update approval.";
    return { ok: false, error: message };
  }
}

export async function setFeaturedAction(
  id: string,
  isFeatured: boolean,
): Promise<ReviewActionResult> {
  await requireAdmin();

  try {
    await setReviewFeatured(id, isFeatured);
    revalidatePublic();
    return { ok: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not update featured state.";
    return { ok: false, error: message };
  }
}

"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createConcernPage, updateConcernPage } from "@/lib/concerns/admin";
import { concernPageSchema } from "@/lib/concerns/validation";

/**
 * Concern-page admin server actions (feature 19).
 *
 * Every action calls `requireAdmin()` FIRST, then writes via the service-role
 * data layer in `lib/concerns/admin.ts`. `concern_pages` has no status column,
 * so a saved page is live immediately — every save revalidates the public page
 * and the sitemap (and the homepage, whose ConcernGrid links depend on which
 * concern pages exist).
 */

export type ConcernPageActionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

/** Revalidate every surface a concern-page change can touch. */
function revalidatePublic(slug: string) {
  revalidatePath("/admin/concern-pages");
  revalidatePath(`/health-concern/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/"); // ConcernGrid links resolve to rich pages that now exist.
}

export async function createConcernPageAction(
  raw: unknown,
): Promise<ConcernPageActionResult> {
  await requireAdmin();

  const parsed = concernPageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const { slug } = await createConcernPage(parsed.data);
    revalidatePublic(slug);
    return { ok: true, slug };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create concern page.";
    return { ok: false, error: message };
  }
}

export async function updateConcernPageAction(
  id: string,
  raw: unknown,
): Promise<ConcernPageActionResult> {
  await requireAdmin();

  const parsed = concernPageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const { slug } = await updateConcernPage(id, parsed.data);
    revalidatePublic(slug);
    return { ok: true, slug };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not save concern page.";
    return { ok: false, error: message };
  }
}

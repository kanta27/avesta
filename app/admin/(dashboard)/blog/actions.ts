"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createPost,
  getPostForEdit,
  transitionStatus,
  updatePost,
} from "@/lib/blog/admin";
import { adminPostSchema } from "@/lib/blog/validation";
import { BLOG_STATUSES, type BlogStatus } from "@/lib/blog/types";

/**
 * Blog admin server actions (feature 16, module 3).
 *
 * Every action calls `requireAdmin()` FIRST, then writes via the service-role
 * data layer in `lib/blog/admin.ts`. The public site is revalidated whenever a
 * change could affect what's published, so a publish/edit surfaces without a
 * redeploy.
 */

export type BlogActionResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

/** Revalidate every surface a published change can touch. */
function revalidatePublic(slug: string) {
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/sitemap.xml");
}

export async function createPostAction(raw: unknown): Promise<BlogActionResult> {
  await requireAdmin();

  const parsed = adminPostSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const { slug } = await createPost(parsed.data);
    revalidatePublic(slug);
    return { ok: true, slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not create post.";
    return { ok: false, error: message };
  }
}

export async function updatePostAction(
  id: string,
  raw: unknown,
): Promise<BlogActionResult> {
  await requireAdmin();

  const parsed = adminPostSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const { slug } = await updatePost(id, parsed.data);
    revalidatePublic(slug);
    return { ok: true, slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save post.";
    return { ok: false, error: message };
  }
}

/**
 * Transition a post's status only — the list-row workflow buttons
 * (draft → review → published, or back). `published_at` is stamped on the first
 * move to published by the data layer.
 */
export async function transitionStatusAction(
  id: string,
  next: BlogStatus,
): Promise<BlogActionResult> {
  await requireAdmin();

  if (!BLOG_STATUSES.includes(next)) {
    return { ok: false, error: "Invalid status." };
  }

  try {
    await transitionStatus(id, next);
    // We need the slug to revalidate the public post path precisely.
    const post = await getPostForEdit(id);
    revalidatePublic(post?.slug ?? "");
    return { ok: true, slug: post?.slug ?? "" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update status.";
    return { ok: false, error: message };
  }
}

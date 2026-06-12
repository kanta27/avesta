"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createGalleryImage,
  createGalleryUploadTarget,
  deleteGalleryImage,
  reorderGalleryImages,
  updateGalleryImage,
  type GalleryUploadTarget,
} from "@/lib/gallery/admin";
import { galleryImageSchema, reorderSchema } from "@/lib/gallery/validation";

/**
 * Gallery admin server actions (feature 21).
 *
 * ARCHITECTURE RULE: every export calls `requireAdmin()` FIRST, then writes via
 * the service-role data layer. The manager UI is a client island, but the write
 * path is only ever these actions — the service-role client is never imported
 * into client code. Image bytes upload directly to a server-issued signed URL
 * with the anon client.
 */

export type GalleryActionResult = { ok: true } | { ok: false; error: string };

/** Refresh the admin module AND the public gallery (+ sitemap is static). */
function revalidate() {
  revalidatePath("/admin/gallery");
  revalidatePath("/gallery");
}

export type CreateGalleryResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/** Persist a freshly-uploaded image (url already in the gallery bucket). */
export async function createGalleryImageAction(
  raw: unknown,
): Promise<CreateGalleryResult> {
  await requireAdmin();

  const parsed = galleryImageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    const { id } = await createGalleryImage(parsed.data);
    revalidate();
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save image.";
    return { ok: false, error: message };
  }
}

/** Update an image's alt text + category. */
export async function updateGalleryImageAction(
  id: string,
  raw: unknown,
): Promise<GalleryActionResult> {
  await requireAdmin();

  const parsed = galleryImageSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    await updateGalleryImage(id, parsed.data);
    revalidate();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not update image.";
    return { ok: false, error: message };
  }
}

/** Persist a new display order (full ordered id list from the manager). */
export async function reorderGalleryAction(
  orderedIds: string[],
): Promise<GalleryActionResult> {
  await requireAdmin();

  const parsed = reorderSchema.safeParse({ orderedIds });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid order.",
    };
  }

  try {
    await reorderGalleryImages(parsed.data.orderedIds);
    revalidate();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not reorder.";
    return { ok: false, error: message };
  }
}

/** Delete an image — removes BOTH the row and the storage object. */
export async function deleteGalleryImageAction(
  id: string,
): Promise<GalleryActionResult> {
  await requireAdmin();

  try {
    await deleteGalleryImage(id);
    revalidate();
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not delete image.";
    return { ok: false, error: message };
  }
}

export type UploadUrlResult =
  | { ok: true; target: GalleryUploadTarget }
  | { ok: false; error: string };

/**
 * Mint a one-time signed upload URL for the gallery bucket. The browser uploads
 * directly to it with the anon client — the service-role key stays server-side.
 */
export async function createGalleryUploadUrlAction(
  category: string,
  ext: string,
): Promise<UploadUrlResult> {
  await requireAdmin();
  try {
    const target = await createGalleryUploadTarget(category, ext);
    return { ok: true, target };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start upload.";
    return { ok: false, error: message };
  }
}

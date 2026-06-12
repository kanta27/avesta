import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  isGalleryCategory,
  type GalleryCategory,
  type GalleryImage,
} from "./types";
import type { GalleryImageInput } from "./validation";

/**
 * Admin gallery data layer (feature 21). Service-role — BYPASSES RLS — and
 * `server-only`, so it never reaches the client bundle. Every caller (the admin
 * server actions) gates on `requireAdmin()` first.
 *
 * Separate from `lib/gallery/queries.ts`, the PUBLIC anon read path. Images live
 * in the `gallery` storage bucket (A3: public-read, signed-URL upload — the same
 * model as `products`). Deletes remove BOTH the row and the storage object.
 */

const BUCKET = "gallery";

/** Coerce a possibly-null/unknown category column into a known category. */
function toCategory(v: string | null): GalleryCategory {
  return v && isGalleryCategory(v) ? v : "product";
}

/** All gallery images, in display order (sort asc, then insert order). */
export async function listGalleryImages(): Promise<GalleryImage[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("gallery_images")
    .select("id, url, alt, category, sort, created_at")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to list gallery images: ${error.message}`);

  return (data ?? []).map((row, i) => ({
    id: row.id,
    url: row.url,
    alt: row.alt ?? "",
    category: toCategory(row.category),
    sort: row.sort ?? i,
  }));
}

/** Insert a new gallery image, appended to the end of the sort order. */
export async function createGalleryImage(
  input: GalleryImageInput,
): Promise<{ id: string }> {
  const admin = createAdminClient();

  // Append: one past the current max sort. A fresh table (max = null) starts at 0.
  const { data: maxRow, error: maxErr } = await admin
    .from("gallery_images")
    .select("sort")
    .order("sort", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (maxErr) throw new Error(`Failed to read sort order: ${maxErr.message}`);
  const nextSort = (maxRow?.sort ?? -1) + 1;

  const { data, error } = await admin
    .from("gallery_images")
    .insert({
      url: input.url,
      alt: input.alt,
      category: input.category,
      sort: nextSort,
    })
    .select("id")
    .single();
  if (error) throw error;
  return { id: data.id };
}

/** Update an image's alt text and category in place. */
export async function updateGalleryImage(
  id: string,
  input: GalleryImageInput,
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("gallery_images")
    .update({ alt: input.alt, category: input.category })
    .eq("id", id);
  if (error) throw error;
}

/**
 * Persist a new display order by writing `sort = index` for each id in the
 * given order. The admin UI sends the full ordered id list, so this is
 * idempotent and never leaves gaps or duplicate sort values.
 */
export async function reorderGalleryImages(orderedIds: string[]): Promise<void> {
  const admin = createAdminClient();
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await admin
      .from("gallery_images")
      .update({ sort: i })
      .eq("id", orderedIds[i]);
    if (error) throw error;
  }
}

/**
 * Derive the object path within the `gallery` bucket from a public URL.
 * Public URLs look like `…/storage/v1/object/public/gallery/<path>`; we take
 * everything after the bucket segment (and strip any query string). Returns
 * `null` if the URL isn't a gallery object (e.g. an external URL) — then there is
 * no storage object to remove.
 */
function storagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split("?")[0];
  return decodeURIComponent(path) || null;
}

/**
 * Delete an image: remove the storage object first, then the row. If the object
 * is already gone we still drop the row (don't strand a dead reference). Removing
 * the storage object before the row means a failure can't leave an orphaned file
 * with no row pointing at it.
 */
export async function deleteGalleryImage(id: string): Promise<void> {
  const admin = createAdminClient();

  const { data: row, error: readErr } = await admin
    .from("gallery_images")
    .select("url")
    .eq("id", id)
    .maybeSingle();
  if (readErr) throw new Error(`Failed to load image: ${readErr.message}`);
  if (!row) return; // already gone

  const path = storagePathFromUrl(row.url);
  if (path) {
    const { error: rmErr } = await admin.storage.from(BUCKET).remove([path]);
    if (rmErr) throw new Error(`Failed to delete storage object: ${rmErr.message}`);
  }

  const { error: delErr } = await admin
    .from("gallery_images")
    .delete()
    .eq("id", id);
  if (delErr) throw delErr;
}

/** A signed upload target for a gallery image. */
export interface GalleryUploadTarget {
  /** Object path within the `gallery` bucket. */
  path: string;
  /** One-time signed token the browser uses with `uploadToSignedUrl`. */
  token: string;
  /** Public URL the image will be served from once uploaded. */
  publicUrl: string;
}

/**
 * Mint a one-time signed upload URL for the `gallery` storage bucket. The
 * browser uploads directly to it with the ANON client (`uploadToSignedUrl`) —
 * the service-role key never leaves the server. This mirrors the products
 * upload model (A3), pointed at the gallery bucket.
 */
export async function createGalleryUploadTarget(
  category: string,
  ext: string,
): Promise<GalleryUploadTarget> {
  const admin = createAdminClient();
  const safePrefix =
    category.replace(/[^a-z0-9-]/gi, "").toLowerCase() || "gallery";
  const safeExt = ext.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
  const path = `${safePrefix}/${crypto.randomUUID()}.${safeExt}`;

  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);
  if (error) throw error;

  const { data: pub } = admin.storage.from(BUCKET).getPublicUrl(path);

  return { path: data.path, token: data.token, publicUrl: pub.publicUrl };
}

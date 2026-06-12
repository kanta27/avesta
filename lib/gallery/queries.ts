import "server-only";

import { createClient } from "@/lib/supabase/server";
import {
  isGalleryCategory,
  type GalleryCategory,
  type GalleryImage,
} from "./types";

/**
 * PUBLIC read path for the gallery (feature 21).
 *
 * Uses the server-side anon client, so the `gallery_images` public-read RLS
 * policy applies (A2: all rows are public). Deliberately separate from
 * `lib/gallery/admin.ts`, the service-role write path. Ordered by `sort` so the
 * public grid matches the admin-chosen order.
 */

function toCategory(v: string | null): GalleryCategory {
  return v && isGalleryCategory(v) ? v : "product";
}

/** Every gallery image, in display order. Empty array when the gallery is empty. */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gallery_images")
    .select("id, url, alt, category, sort, created_at")
    .order("sort", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Failed to load gallery: ${error.message}`);

  return (data ?? []).map((row, i) => ({
    id: row.id,
    url: row.url,
    alt: row.alt ?? "",
    category: toCategory(row.category),
    sort: row.sort ?? i,
  }));
}

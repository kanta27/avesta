/**
 * Gallery domain types (feature 21).
 *
 * `gallery_images` (A2): url / alt / category / sort. Categories are a fixed
 * vocabulary — product / lab / manufacturing — used by both the admin module
 * and the public filterable grid. Type-only; safe to import from client code.
 */

export const GALLERY_CATEGORIES = ["product", "lab", "manufacturing"] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

/** Narrow an arbitrary string to a known category, or `null`. */
export function isGalleryCategory(v: string): v is GalleryCategory {
  return (GALLERY_CATEGORIES as readonly string[]).includes(v);
}

const CATEGORY_LABELS: Record<GalleryCategory, string> = {
  product: "Product",
  lab: "Lab",
  manufacturing: "Manufacturing",
};

export function categoryLabel(c: GalleryCategory): string {
  return CATEGORY_LABELS[c];
}

/** One gallery image as the admin module + public grid consume it. */
export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  category: GalleryCategory;
  sort: number;
}
